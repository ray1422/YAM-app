import { Link, useParams } from "react-router-dom";
import useWebSocket from 'hooks/useWebSocket';
import { useContext, useEffect, useRef, useState } from 'react';
import Client from "components/section/Client";
import HeaderBar from "components/section/HeaderBar";
import Chat from "components/section/Chat";
import action from 'utils/action';
import { MessageContext, WSContext } from 'context';
import { StreamingContext } from 'context';
import { createUseStyles } from "react-jss";
import FlipMove from 'react-flip-move';
import Toggle from "components/core/Toggle";


const useStyle = createUseStyles({
    video: {
        position: "relative",
        display: "inline-block",
        backgroundColor: "#111111",
        margin: 10
    },
    name: {
        position: "absolute",
        left: 10,
        bottom: 10,
        backgroundColor: "#333333",
        color: "#fff",
        padding: [5, 10]
    },
    meetingArea: {
        display: "flex",
        height: "calc(100vh - 90px)"
    },
    clients: {
        flexGrow: 1,
        overflow: "auto"
    },
    controlBox: {
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        bottom: 40,
        padding: [0, 100],
        position: "absolute",
    },
})

export default function Room() {
    const { id: roomId, name } = useParams()
    //const { webSocket, isConnected, event } = useWebSocket(`ws://192.168.137.1:8080/api/room/${roomId}/ws/`)    
    const { webSocket, isConnected, event } = useWebSocket(`ws://localhost:8080/api/room/${roomId}/ws/`)
    const classes = useStyle()

    const videoRef = useRef(null)
    const ScreenRef = useRef(null)
    const [id, setId] = useState("");
    const [clients, setClients] = useState(null);
    const { audio, video, userStream: stream, screen, screenStream, token } = useContext(StreamingContext)

    const [isChatOpen, setChatOpen] = useState(true);

    const [messagesList, setMessagesList] = useState([]);
    const [sendMessage, setSendMessage] = useState(null);
    const [requireFileValue, setRequireFileValue] = useState(null);
    const messagesListRef = useRef([])
    const providingFiles = useRef([])
    const receiveFiles = useRef({})



    useEffect(() => {
        if (!isConnected) return
        webSocket.send(action("register_client", { token }))
    }, [isConnected])

    useEffect(() => {
        if (stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream])

    useEffect(() => {
        if (screenStream) {
            ScreenRef.current.srcObject = screenStream;
        }
    }, [screenStream])

    useEffect(() => {
        if (!event) return
        console.log(event);
        const { action, data } = event
        switch (action) {
            case "list_client":
                setClients(data.clients.map((c_id) => {
                    return { id: c_id, isWaiter: false }
                }))
                setId(data.self_client_id)
                break
            case "forward_offer":
                setClients([...clients, { id: data.remote_id, isWaiter: true, offer: data.data }])
                break
            default:
        }
    }, [event])

    function handleDisconnected(id) {
        setClients(clients.filter((c) => c.id !== id))
    }

    return <MessageContext.Provider value={{
        messagesList,
        setMessagesList,
        sendMessage,
        setSendMessage,
        messagesListRef: messagesListRef,
        providingFiles,
        requireFile: {
            value: requireFileValue,
            setValue: setRequireFileValue
        },
        receiveFiles,
    }}>
        <WSContext.Provider value={{ ws: webSocket, event, name, id }}>
            <HeaderBar name={name} isChatOpen={isChatOpen} setChatOpen={setChatOpen} />

            <br />
            {/* {isConnected ? "Connected" : "Disconnected"} */}

            <div className={classes.meetingArea}>
                <div className={classes.clients}>
                    <FlipMove>
                        {clients && clients.map((c) =>
                            <Client selfId={id} stream={stream} key={c.id} id={c.id} isWaiter={c.isWaiter} offer={c.offer} onDisconnected={handleDisconnected} />)}
                        <div className={classes.video}>
                            <video width="600" height="337.5" ref={videoRef} autoPlay playsInline muted>
                                Your browser does not support the video tag.
                            </video>
                            <span className={classes.name}>{name}(您)</span>
                            <div className={classes.controlBox}>
                                <Toggle size={60} value={audio.enabled} Active={"mic"} Inactive={"mic_off"} onChange={(v) => audio.setEnabled(v)} />
                                <Toggle size={60} value={video.enabled} Active={"videocam"} Inactive={"videocam_off"} onChange={(v) => video.setEnabled(v)} />

                                <button onClick={() => screen.setEnabled(true)}>分享螢幕</button>
                            </div>
                        </div>

                        {screen.enabled &&
                            <div className={classes.video}>
                                <video width="600" height="337.5" ref={ScreenRef} autoPlay playsInline muted>
                                    Your browser does not support the video tag.
                                </video>
                                <span className={classes.name}>您的螢幕分享</span>
                            </div>}
                    </FlipMove>
                </div>

                <Chat isOpen={isChatOpen} />

            </div>
        </WSContext.Provider>
    </MessageContext.Provider>;
}