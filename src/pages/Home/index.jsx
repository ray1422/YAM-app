import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Home() {
    const { name } = useParams()

    const [room, setstate] = useState("");
    const [roomsInfo, setRoomsInfo] = useState("");

    const [inputName, setInputName] = useState(name);

    useEffect(() => {
        fetch("/api/room", { method: "GET" })
            .then(res => res.text())
            .then(data => {
                console.log(data)
            })
            .catch(e => {
                console.log(e)
            })
    }, [])
    return <div>
        <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} />
        <Link to={`/room/wdwd/${inputName}`} >Go Room</Link>

        {roomsInfo}
    </div >;
}