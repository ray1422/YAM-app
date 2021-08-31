import { GlobalContext, StreamingContext } from 'context';
import { useContext, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link, useHistory, useParams } from 'react-router-dom';
import Toggle from 'components/core/Toggle';
import IconButton from 'components/core/IconButton';
import Modal from 'components/core/Modal';
import SettingModal from 'components/section/SettingModal';

const useStyle = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#222222"
    },
    centerVertical: {
        display: "flex",
        justifyContent: "center",
    },
    preview: {
        display: "flex",
        position: "relative",
        width: "112vh",
        height: "63vh",
        backgroundColor: "#444444",
        justifyContent: "center",
        marginRight: 80
    },
    video: {
        height: "100%",
    },
    controlBox: {
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        bottom: 40,
        padding: [0, 100],
        position: "absolute",
    },
    sideBoard: {
        display: "flex",
        flexDirection: "column",
        width: "25vw"
    },
    board: {
        width: "25vw"
    },
    enterArea: {
        backgroundColor: "white",
        flexGrow: 1
    },
    input: {
        display: "block"
    },
    button: {
        backgroundColor: "#222222",
        color: "white"
    }
})

export default function Home() {
    const { name } = useParams()

    const classes = useStyle()

    const [inputName, setInputName] = useState(name);
    const [id, setID] = useState("neo");
    const [password, setPassword] = useState("");
    const history = useHistory()
    const { audio, video, userStream: stream, setToken, source: { videos, audios } } = useContext(StreamingContext)
    const { isSettingShow, setSettingShow } = useContext(GlobalContext)
    const videoRef = useRef(null)

    useEffect(() => {
        if (stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream])

    function enter() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch(`/api/room/${id}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    setToken(data.token)
                    history.push(`/room/${id}/${inputName}`)
                }
            }
            );
    }



    return <div className={classes.root}>
        <div className={classes.centerVertical}>
            <div className={classes.preview}>
                <video className={classes.video} ref={videoRef} autoPlay playsInline muted>
                    Your browser does not support the video tag.
                </video>
                <div className={classes.controlBox}>
                    <Toggle value={audio.enabled} Active={"mic"} Inactive={"mic_off"} onChange={(v) => audio.setEnabled(v)} />
                    <Toggle value={video.enabled} Active={"videocam"} Inactive={"videocam_off"} onChange={(v) => video.setEnabled(v)} />
                    <IconButton icon={"settings"} onClick={() => setSettingShow(true)} />
                </div>
            </div>
            <div className={classes.sideBoard}>
                <div style={{ backgroundColor: "red", width: "100%", height: 100 }} />
                <div className={classes.enterArea}>
                    Hello, <input value={inputName} onChange={(e) => setInputName(e.target.value)} />.
                    <input className={classes.input} placeholder="ID" value={id} onChange={(e) => setID(e.target.value)} />
                    <input type="password" className={classes.input} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <div className={classes.button} onClick={enter}>Enter</div>

                </div>
            </div>
        </div>

        <SettingModal isShow={isSettingShow} setShow={setSettingShow} />



    </div >;
}