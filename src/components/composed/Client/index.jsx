import { useContext, useEffect, useRef, useState } from "react";
import { WSContext } from 'context';
import action from './../../../utils/action';
import { StreamingContext } from 'context';

export default function Client({ id, isWaiter, offer, onDisconnected }) {
    const { ws, event, name } = useContext(WSContext);

    const { userStream: stream, screenStream, screen } = useContext(StreamingContext)

    const connection = useRef(null)
    const sender = useRef(null)

    const description_status = useRef(0) //0:never 1:setRemote 
    const video = useRef(null)
    const [RTCState, setRTCState] = useState(false)
    const [RTCMessage, setRTCMessage] = useState(null)
    const [remoteName, setRemoteName] = useState("")

    const videoSender = useRef(null)


    useEffect(() => {
        if (!event) return
        const { action, data } = event
        switch (action) {
            case "list_client":
                break
            case "forward_answer":
                if (data.remote_id === id && !isWaiter)
                    completeConnection(JSON.parse(data.data))
                break
            case "forward_candidate":
                if (data.remote_id === id) {
                    connection.current.addIceCandidate(JSON.parse(data.data))
                    console.log("addIceCandidate", data.data)
                }
                break
            default:
        }
    }, [event])

    useEffect(() => {
        if (RTCMessage == null) return
        const { action, data } = JSON.parse(RTCMessage)
        switch (action) {
            case "provide_name":
                setRemoteName(data.name)
                break
            default:
        }
    }, [RTCMessage])

    async function answerConnection(offer) {
        console.log("setRemoteDescription", offer);
        await connection.current.setRemoteDescription(offer)
        description_status.current = 1
        try {
            console.log("createAnswer");
            const answer = await connection.current.createAnswer();
            console.log("setLocalDescription");
            await connection.current.setLocalDescription(answer)
            console.log("provide_answer", offer);
            ws.send(action("provide_answer", { remote_id: id, data: JSON.stringify(answer) }))

        } catch (e) {
            console.log('Failed to create session description: ', e);
        }
    }

    function onSendChannelStateChange() {
        if (sender.current) {
            const { readyState } = sender.current;
            console.log(`Send channel state is: ${readyState}`);
            if (readyState === 'open') {
                sender.current.send(action("provide_name", { name }))
            }
        }
    }

    async function completeConnection(answer) {
        console.log("setRemoteDescription", answer);
        await connection.current.setRemoteDescription(answer)

        description_status.current = 1
    }

    async function connect(withScreen) {
        try {
            const configuration = {
                'iceServers': [{
                    'urls': ['stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                        'stun:stun2.l.google.com:19302',
                        'stun:stun3.l.google.com:19302',
                        'stun:stun4.l.google.com:19302']
                }]
            }
            const conn = new RTCPeerConnection(configuration);
            connection.current = conn


            videoSender.current = conn.addTrack(stream.getVideoTracks()[0], stream)
            var camAudioTrack = conn.addTrack(stream.getAudioTracks()[0], stream)

            conn.onconnectionstatechange = function (event) {
                setRTCState(conn.connectionState)
                switch (conn.connectionState) {
                    case "connected":
                        break;
                    case "disconnected":
                    case "failed":
                        onDisconnected(id)
                        // One or more transports has terminated unexpectedly or in an error
                        break;
                    case "closed":
                        // The connection has been closed
                        break;
                    default:
                }
            }

            conn.addEventListener('icecandidate', async event => {
                if (event.candidate) {
                    ws.send(action("provide_candidate", { remote_id: id, data: JSON.stringify(event.candidate) }))
                }
            });

            conn.addEventListener('track', (e) => {
                if (video.current.srcObject !== e.streams[0]) {
                    video.current.srcObject = e.streams[0];
                    console.log('pc2 received remote stream');
                }
                if (e.streams[1]) {
                    alert("Screen")
                }
            });

            const sendChannel = await conn.createDataChannel('sendDataChannel');
            sendChannel.binaryType = 'arraybuffer';
            sendChannel.addEventListener('open', onSendChannelStateChange);
            sendChannel.addEventListener('close', onSendChannelStateChange);
            sendChannel.addEventListener('error', () => { });

            sender.current = sendChannel

            conn.addEventListener('datachannel', (event) => {
                const receiveChannel = event.channel;
                receiveChannel.binaryType = 'arraybuffer';
                receiveChannel.onmessage = (e) => {
                    setRTCMessage(e.data)
                    console.log(e.data);
                };

                receiveChannel.onopen = async function onReceiveChannelStateChange() {
                };
                receiveChannel.onclose = () => {
                };
            });

            conn.onnegotiationneeded = async () => {
                if (!isWaiter) {
                    console.log("createOffer");
                    const offer = await conn.createOffer();
                    console.log("setLocalDescription");
                    await conn.setLocalDescription(offer)
                    console.log("provid offer", offer);
                    ws.send(action("provide_offer", { remote_id: id, data: JSON.stringify(offer) }))
                }
            }

            if (isWaiter) {
                answerConnection(JSON.parse(offer))
            }

        } catch (error) {
            throw error
        }

    }

    useEffect(() => {
        if (stream) {
            if (RTCState) {
                return
            }
            connect(false)
        }
    }, [stream])

    useEffect(() => {
        if (screenStream && screen.enabled && RTCState) {
            videoSender.current.replaceTrack(screenStream.getVideoTracks()[0], screenStream)
        }
    }, [screenStream, screen.enabled])




    return <div style={{ display: "inline-block", border: `${isWaiter ? "blue" : "red"} 2px solid` }}>
        <video width="320" height="240" ref={video} autoPlay playsInline >
            Your browser does not support the video tag.
        </video>
        <br />
        {id}
        <br />
        {remoteName}
        <br />
        {RTCState}
        <br />
    </div>;
}