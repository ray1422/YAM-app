import { Link, useParams } from "react-router-dom";
import useWebSocket from './../../hooks/useWebSocket';
import { useContext, useEffect, useRef, useState } from 'react';
import Client from "components/composed/Client";
import action from './../../utils/action';
import { WSContext } from './../../context';
import { StreamingContext } from 'context';

export default function Room() {
    const { id: roomId, name } = useParams()
    //const { webSocket, isConnected, event } = useWebSocket(`ws://192.168.137.1:8080/api/room/${roomId}/ws/`)    
    const { webSocket, isConnected, event } = useWebSocket(`ws://localhost:8080/api/room/${roomId}/ws/`)

    const videoRef = useRef(null)
    const [id, setId] = useState("");
    const [clients, setClients] = useState(null);
    const { audio, video, userStream: stream, screen, screenStream } = useContext(StreamingContext)

    useEffect(() => {
        if (!isConnected) return
        webSocket.send(action("register_client", {}))

    }, [isConnected])

    useEffect(() => {
        if (stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream])

    useEffect(() => {
        if (screenStream) {
            videoRef.current.srcObject = screenStream;
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



    return <WSContext.Provider value={{ ws: webSocket, event, name }}>
        <a href={`/${name}`} >Go Back</a>
        <br />
        {isConnected ? "Connected" : "Disconnected"}
        <div>My ID: {id}</div>
        <video width="320" height="240" ref={videoRef} autoPlay playsInline muted>
            Your browser does not support the video tag.
        </video>
        <div>
            <label htmlFor="video-enabled">
                <input type="checkbox" id="video-enabled" checked={video.enabled} onChange={(e) => video.setEnabled(e.target.checked)} />
                Video
            </label>
            <label htmlFor="audio-enabled">
                <input type="checkbox" id="audio-enabled" checked={audio.enabled} onChange={(e) => audio.setEnabled(e.target.checked)} />
                Audio
            </label>
            <button onClick={() => screen.setEnabled(true)}>分享螢幕</button>
        </div>
        <div>My Name: {name}</div>
        {clients !== null ? clients.map((c) => <Client stream={stream} key={c.id} id={c.id} isWaiter={c.isWaiter} offer={c.offer} onDisconnected={handleDisconnected} />) : ""}

        <br />
        {clients && JSON.stringify(clients.map((c) => c.id))}
    </WSContext.Provider>;
}