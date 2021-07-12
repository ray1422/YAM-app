import { Link, useParams } from "react-router-dom";
import useWebSocket from './../../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import Client from "components/composed/Client";
import action from './../../utils/action';
import { WSContext } from './../../context';

export default function Room() {
    const { id: roomId, name } = useParams()
    const { webSocket, isConnected, event } = useWebSocket(`ws://localhost:8080/api/room/${roomId}/ws/`)

    const [id, setId] = useState("");
    const [clients, setClients] = useState(null);

    useEffect(() => {
        if (!isConnected) return
        webSocket.send(action("register_client", {}))

    }, [isConnected])


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
        <div>My Name: {name}</div>
        {clients !== null ? clients.map((c) => <Client key={c.id} id={c.id} isWaiter={c.isWaiter} offer={c.offer} onDisconnected={handleDisconnected} />) : ""}
        <br />
        {clients && JSON.stringify(clients.map((c) => c.id))}
    </WSContext.Provider>;
}