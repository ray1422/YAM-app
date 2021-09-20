import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext, WSContext } from 'context';
import act from 'utils/action';
import { StreamingContext } from 'context';
import { createUseStyles } from "react-jss";
import Toggle from "components/core/Toggle";
import icon from "assets/buttonShape.svg"
import { useStyle } from "styles/room";
import { useHistory } from "react-router";
import errorSound from 'assets/sounds/error.mp3'
import dingJoin from 'assets/sounds/ding_join.mp3'
// const useStyle = createUseStyles({
//     client: () =>
//         [
//             {
//                 width: "30%",
//                 backgroundColor: "#111111",
//                 margin: 10,
//             }, {
//                 width: "48%",
//                 display: "inline-block",
//                 backgroundColor: "#111111",
//                 margin: 10,
//             },
//         ][~~chatOpened]
//     ,
//     infoBar: {
//         position: "absolute",
//         display: "flex",
//         justifyContent: "space-between",
//         left: 0,
//         bottom: 0,
//         width: "100%",
//         padding: 10
//     },
//     name: {
//         backgroundColor: "#333333",
//         color: "#fff",
//         padding: [5, 10]
//     },
//     buttons: {
//         display: "flex",
//     },
//     button: {
//         width: 40,
//         height: 40,
//         background: `url(${icon})`,
//         backgroundSize: "cover",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         cursor: "pointer",
//         position: "relative",
//         "& .volume": {
//             position: "absolute",
//             bottom: "calc(-100% - 20px)",
//             backgroundColor: "#444",
//             padding: 5,
//             opacity: 0,
//             transition: "0.3s",
//             pointerEvents: "none",
//         },
//         "&:hover": {
//             "& .volume": {
//                 opacity: 1,
//                 pointerEvents: "auto",
//             },
//         }
//     },
//     icon: {
//         position: "absolute",
//         color: "white",
//         fontSize: 20,
//         userSelect: "none"
//     }
// })
export default function Client({ selfId, id, isWaiter, offer, chatOpened, onDisconnected, nBlk, setScreenList, screenList }) {
    const [debugClose, setDebugClose] = useState(false)
    useEffect(() => {
        if (debugClose) {
            console.log("close!!!!!!")
            connection.current && connection.current.close()
        }
    }, [debugClose])
    console.log(screenList)
    let classes = useStyle({ chatOpened, nBlk })
    const { ws, event, name } = useContext(WSContext);

    const { userStream: stream, screenStream, screen } = useContext(StreamingContext)

    const connection = useRef(null)
    const sender = useRef(null)
    const alive = useRef(true)

    useEffect(() => {
        return () => {
            alive.current = false
            if (connection.current) {
                console.log("asdf")
                connection.current.close()
            }
        }
    }, [])
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
    const { setMessagesList, sendMessage, messagesListRef: messagesRef, providingFiles, requireFile, receiveFiles } = useContext(MessageContext)

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
                    const u = setInterval(() => {
                        if (!connection.current) {
                            return
                        }
                        connection.current.addIceCandidate(JSON.parse(data.data))
                        console.log("addIceCandidate", data.data)
                        clearInterval(u)
                    }, 100);
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
                let offset = 0
                reader.addEventListener('load', e => {

                    let array = Array.prototype.slice.call(new Uint8Array(e.target.result));

                    sender.current.send(act("reply_file", { id: file.id, buffer: array, offset }))

                    array = null

                    console.log('offset/size ', offset, '/', file.file.size);
                    offset += e.target.result.byteLength;
                    //sendProgress.value = offset;
                    if (offset < file.file.size) {
                        setTimeout(() => readSlice(offset), 20)
                    } else {
                        sender.current.send(act("finish_file", { id: file.id, name: file.file.name }))
                    }
                });
                const chunkSize = 16000;
                const readSlice = o => {
                    const slice = file.file.slice(offset, o + chunkSize);
                    reader.readAsArrayBuffer(slice);
                };
                readSlice(0);

                break
            case "reply_file":
                receiveFiles.current[data.id].buffer = receiveFiles.current[data.id].buffer.concat(data.buffer)
                break
            case "finish_file":
                let arrayBuffer = new Uint8Array(receiveFiles.current[data.id].buffer).buffer;
                var blob = new Blob([arrayBuffer]);
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                var fileName = data.name;
                link.download = fileName;
                link.click();
                delete receiveFiles.current[data.id]
                requireFile.setValue(null)
                alert("finished")
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

            if (screen.enabled) {
                screenSender.current.replaceTrack(screenStream.getVideoTracks()[0], screenStream)
            }

            videoSender.current = conn.addTrack(stream.getVideoTracks()[0], stream)
            audioSender.current = conn.addTrack(stream.getAudioTracks()[0], stream)

            const video_id = stream.id
            const screenVideo_id = str.id

            conn.onconnectionstatechange = function (event) {
                setRTCState(conn.connectionState)
                switch (conn.connectionState) {
                    case "connected":
                        const audio = new Audio(dingJoin)
                        audio.play()
                        break;
                    case "closed":
                    case "disconnected":
                        if (!alive.current) {
                            console.log("component has been unmounted, so don't reconnect.")
                            break
                        } else {
                            const audio = new Audio(errorSound)
                            audio.play()
                            setTimeout(() => {
                                alert("you are disconnected! pls re join the room!")
                                window.history.back()
                            }, 3000);

                        }

                        // if self still in peers list, than reconnect.
                        console.log(conn)
                        break
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
                    //console.log(e.data);
                };

                receiveChannel.onopen = async function () {
                    sender.current.send(act("provide_tracks", { video: video_id, screenVideo: screenVideo_id }))
                    if (screen.enabled)
                        sender.current.send(act("start_sharing", { remote_id: selfId }))
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

        } else {
            sender.current && sender.current.readyState === "open" && sender.current.send(act("stop_sharing", { remote_id: selfId }))
        }
    }, [screenStream, screen.enabled])
    const screenList2 = JSON.parse(JSON.stringify(screenList))
    useEffect(() => {
        if (sharingScreen) {
            console.log("screen!!!!")
            setScreenList(c => {
                screenList2[selfId] = true
                return screenList2
            })
            console.log(screenList2)
        } else {
            setScreenList(c => {
                if (screenList2[selfId]) delete screenList2[selfId]
                return screenList2
            })
        }
    }, [sharingScreen, selfId, setScreenList])

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
        <div className={classes.client}>
            <video ref={videoRef} autoPlay playsInline disabled={!videoEnable} style={{ opacity: videoEnable ? 1 : 0 }} onClick={() => {
                videoRef.current && videoRef.current.requestFullscreen()
            }}>
                Your browser does not support the video tag.
            </video>
            <div className={classes.infoBar}>
                <span className={classes.buttons}>
                    <Toggle size={40} value={videoEnable} Active={"videocam"} Inactive={"videocam_off"} onChange={(v) => setVideoEnable(v)} />
                    <span className={classes.button} >
                        <span className={["material-icons", classes.icon].join(" ")}>
                            {volume === 0 ? "volume_off" : "volume_up"}
                            <div className={"volume"}><input type="range" value={volume} max={100} onChange={(e) => setVolume(e.target.value)} /></div>
                        </span>
                    </span>
                </span>
                <span className={classes.name}>{remoteName}</span>

            </div>

        </div>


        {<div style={{ display: sharingScreen ? "unset" : "none" }} className={classes.client}>
            <video ref={screenVideoRef} autoPlay playsInline muted onClick={() => {
                screenVideoRef.current && screenVideoRef.current.requestFullscreen()
            }}>
                Your browser does not support the video tag.
            </video>
            <div className={classes.infoBar}>
                <span className={classes.name}>{remoteName} 的螢幕分享</span>
            </div>
        </div>}
    </>;
}