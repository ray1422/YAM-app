import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext, WSContext } from 'context';
import act from 'utils/action';
import { StreamingContext } from 'context';
import { createUseStyles } from "react-jss";
import Toggle from "components/core/Toggle";
import icon from "assets/buttonShape.svg"

const useStyle = createUseStyles({
    video: {
        position: "relative",
        display: "inline-block",
        backgroundColor: "#111111",
        margin: 10,
    }, infoBar: {
        position: "absolute",
        display: "flex",
        justifyContent: "space-between",
        left: 0,
        bottom: 0,
        width: "100%",
        padding: 10
    },
    name: {
        backgroundColor: "#333333",
        color: "#fff",
        padding: [5, 10]
    },
    buttons: {
        display: "flex",
    },
    button: {
        width: 40,
        height: 40,
        background: `url(${icon})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        "& .volume": {
            position: "absolute",
            bottom: "calc(-100% - 20px)",
            backgroundColor: "#444",
            padding: 5,
            opacity: 0,
            transition: "0.3s",
            pointerEvents: "none",
        },
        "&:hover": {
            "& .volume": {
                opacity: 1,
                pointerEvents: "auto",
            },
        }
    },
    icon: {
        position: "absolute",
        color: "white",
        fontSize: 20,
        userSelect: "none"
    }
})

export default function Client({ selfId, id, isWaiter, offer, onDisconnected }) {

    const classes = useStyle()
    const { ws, event, name } = useContext(WSContext);

    const { userStream: stream, screenStream, screen } = useContext(StreamingContext)

    const connection = useRef(null)
    const sender = useRef(null)

    const description_status = useRef(0) //0:never 1:setRemote 
    const videoRef = useRef(null)
    const screenVideoRef = useRef(null)
    const [RTCState, setRTCState] = useState(false)
    const [RTCMessage, setRTCMessage] = useState(null)
    const [remoteName, setRemoteName] = useState("")
    const [sharingScreen, setSharingScreen] = useState(false)
    const [volume, setVolume] = useState(100)
    const [videoEnable, setVideoEnable] = useState(true)

    const { source: { videos, audios }, sourceSwitch: { userAudioStream, userVideoStream } } = useContext(StreamingContext)
    const { setMessagesList, sendMessage, messagesListRef: messagesRef, providingFiles, requireFile } = useContext(MessageContext)

    const tracks = useRef([])

    const screenSender = useRef(null)
    const videoSender = useRef(null)
    const audioSender = useRef(null)

    let silence = () => {
        let ctx = new AudioContext(), oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let blackSilence = (...args) => new MediaStream([black(...args), silence()]);

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
            case "provide_tracks":
                console.log("provide_tracks", tracks.current);
                tracks.current.forEach(t => {
                    console.log("provide_tracks", t.id, data.video, data.screenVideo);
                    if (t.id === data.video) {
                        videoRef.current.srcObject = t
                        console.log("video.current.srcObject", videoRef.current.srcObject);
                    }
                    else if (t.id === data.screenVideo) {
                        screenVideoRef.current.srcObject = t
                    }
                })
                break
            case "start_sharing":
                console.log("start_sharing", data.remote_id, id);
                if (data.remote_id === id) {
                    setSharingScreen(true)
                }
                break
            case "stop_sharing":
                if (data.remote_id === id) {
                    setSharingScreen(false)
                }
                break
            case "send_message":
                messagesRef.current = [...messagesRef.current, data.message]
                setMessagesList(messagesRef.current)
                break
            case "require_file":
                const file = providingFiles.current.find((f) => f.id === data.file.id)
                if (!file) alert("File is not exist!")
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    let array = Array.prototype.slice.call(new Uint8Array(reader.result));
                    sender.current.send(act("replay_file", { name: file.file.name, buffer: array }))
                });
                reader.readAsArrayBuffer(file.file)
                break
            case "replay_file":
                let arrayBuffer = new Uint8Array(data.buffer).buffer;
                var blob = new Blob([arrayBuffer]);
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                var fileName = data.name;
                link.download = fileName;
                link.click();
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
            ws.send(act("provide_answer", { remote_id: id, data: JSON.stringify(answer) }))

        } catch (e) {
            console.log('Failed to create session description: ', e);
        }
    }

    function onSendChannelStateChange() {
        if (sender.current) {
            const { readyState } = sender.current;
            console.log(`Send channel state is: ${readyState}`);
            if (readyState === 'open') {
                sender.current.send(act("provide_name", { name }))

            }
        }
    }

    async function completeConnection(answer) {
        console.log("setRemoteDescription", answer);
        await connection.current.setRemoteDescription(answer)

        description_status.current = 1
    }

    async function connect() {
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
            var str = blackSilence()
            screenSender.current = conn.addTrack(str.getVideoTracks()[0], str)
            videoSender.current = conn.addTrack(stream.getVideoTracks()[0], stream)
            audioSender.current = conn.addTrack(stream.getAudioTracks()[0], stream)
            const video_id = stream.id
            const screenVideo_id = str.id

            conn.onconnectionstatechange = function (event) {
                setRTCState(conn.connectionState)
                switch (conn.connectionState) {
                    case "connected":
                        break;
                    case "disconnected":
                    case "failed":
                        //onDisconnected(id)
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
                    console.log(event.candidate, ws);
                    ws.send(act("provide_candidate", { remote_id: id, data: JSON.stringify(event.candidate) }))
                }
            });

            conn.addEventListener('track', (e) => {
                console.log("track", e.streams[0]);
                // if (video.current.srcObject) {
                //     screenVideo.current.srcObject = e.streams[0];
                // } else {
                //     video.current.srcObject = e.streams[0];
                // }
                tracks.current.push(e.streams[0])
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

                receiveChannel.onopen = async function () {
                    sender.current.send(act("provide_tracks", { video: video_id, screenVideo: screenVideo_id }))
                };
                receiveChannel.onclose = () => {
                };
            });

            if (!isWaiter) {
                console.log("createOffer");
                const offer = await conn.createOffer();
                console.log("setLocalDescription");
                await conn.setLocalDescription(offer)
                console.log("provide offer", offer);
                ws.send(act("provide_offer", { remote_id: id, data: JSON.stringify(offer) }))
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
            connect()
        }
    }, [stream])

    useEffect(() => {
        if (screenStream && screen.enabled && RTCState) {
            screenSender.current.replaceTrack(screenStream.getVideoTracks()[0], screenStream)
            sender.current && sender.current.readyState === "open" && sender.current.send(act("start_sharing", { remote_id: selfId }))
            // alert("start_sharing")
        } else {
            sender.current && sender.current.readyState === "open" && sender.current.send(act("stop_sharing", { remote_id: selfId }))
        }
    }, [screenStream, screen.enabled])


    useEffect(() => {
        if (sender.current && sender.current.readyState === "open")
            sender.current.send(act("send_message", { message: sendMessage }))
    }, [sendMessage])

    useEffect(() => {
        if (videoRef.current)
            videoRef.current.volume = volume / 100
    }, [volume])

    useEffect(() => {
        if (!requireFile.value) return
        if (requireFile.value.author.id === id) {
            if (sender.current && sender.current.readyState === "open")
                sender.current.send(act("require_file", { file: requireFile.value }))
            requireFile.setValue(null)
        }

    }, [requireFile.value])



    return <>
        <div className={classes.video}>
            <video width="600" height="337.5" ref={videoRef} autoPlay playsInline disabled={!videoEnable} style={{ opacity: videoEnable ? 1 : 0 }}>
                Your browser does not support the video tag.
            </video>
            <div className={classes.video}></div>
            <div className={classes.infoBar}>
                <span className={classes.buttons}>
                    <Toggle size={40} value={videoEnable} Active={"videocam"} Inactive={"videocam_off"} onChange={(v) => setVideoEnable(v)} />
                    <span className={classes.button} >
                        <span className={["material-icons", classes.icon].join(" ")}>
                            {volume == 0 ? "volume_off" : "volume_up"}
                            <div className={"volume"}><input type="range" value={volume} max={100} onChange={(e) => setVolume(e.target.value)} /></div>
                        </span>
                    </span>
                </span>
                <span className={classes.name}>{remoteName}</span>
            </div>

        </div>


        {<div style={{ display: sharingScreen ? "inline-block" : "none" }}>
            <div className={classes.video}>
                <video width="600" height="337.5" ref={screenVideoRef} autoPlay playsInline muted>
                    Your browser does not support the video tag.
                </video>
                <span className={classes.name}>{remoteName}</span>
            </div>
        </div>}
    </>;
}