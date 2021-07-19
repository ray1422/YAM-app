import { StreamingContext } from 'context';
import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Home() {
    const { name } = useParams()

    const [room, setstate] = useState("");
    const [roomsInfo, setRoomsInfo] = useState("");

    const [inputName, setInputName] = useState(name);

    const { audio, video, userStream: stream } = useContext(StreamingContext)
    const videoRef = useRef(null)

    useEffect(() => {
        if (stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream])



    return <div>
        <div>
            <input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} />
            <Link to={`/room/wdwd/${inputName}`} >Go Room</Link>
        </div>
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
        </div>
        {roomsInfo}
    </div >;
}