import { useEffect, useState } from "react";

export default function useWebSocket(url) {
    const [webSocket, setWebSocket] = useState(null)
    const [isConnected, setConnected] = useState(false);
    const [event, setEvent] = useState(null);

    useEffect(() => {
        let ws = new WebSocket(url)
        setWebSocket(ws)
        ws.onopen = () => {
            setConnected(true)
            console.log("connected");
        }

        ws.onclose = () => {
            setConnected(false)
            console.log("connected");
        }

        ws.onmessage = (e) => {
            setEvent(JSON.parse(e.data))
        }

        window.ws = ws
        console.log(ws);
    }, [url])

    return { webSocket, isConnected, event }
}