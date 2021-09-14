import { GlobalContext, StreamingContext } from 'context';
import { useContext, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useHistory, useParams } from 'react-router-dom';
import Toggle from 'components/core/Toggle';
import IconButton from 'components/core/IconButton';
import titleImgDesktop from 'assets/title_icon-desktop.svg'
import SettingModal from 'components/section/SettingModal';
const midScreenMediaQuery = "@media (max-width: 920px)"
const useStyle = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        minHeight: "100vh",
        width: "100%",

    },
    centerVertical: {
        display: "flex",
        justifyContent: "center",
        margin: "0 auto",
        maxWidth: "1900px",
        width: "100%",
        padding: "0 1rem",
        [`${midScreenMediaQuery}`]: {
            flexWrap: 'wrap',
            alignItems: "center"
        }
    },
    preview: {
        position: "relative",
        width: "60%",
        maxWidth: "106vh",
        // maxHeight: "60vh",
        justifyContent: "center",
        marginRight: "4vw",
        background: "rgba(15, 15, 15, .7)",
        boxShadow: "0 0 5px 1px #00f400a6",
        borderRadius: "3px",
        overflow: "hidden",
        [`${midScreenMediaQuery}`]: {
            width: "79%",
            height: "40vh",
            maxHeight: "50vw",
            marginRight: "unset",
            marginTop: "1rem"
        },
        "& > video": {
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            objectFit: "contain",
            transform: "scaleX(-1)"
        }
    },
    controlBox: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        bottom: 20,
        position: "absolute",
        "& > div": {
            "margin": "0 .2em"
        },
        [`${midScreenMediaQuery}`]: {
            bottom: 5,
        },
    },
    sideBoard: {
        display: "flex",
        flexDirection: "column",
        width: "25%",
        maxWidth: "25vw",
        [`${midScreenMediaQuery}`]: {
            width: "80%",
            maxWidth: "unset"
        }
    },
    board: {
        width: "100%"
    },
    icon: {
        width: "90%",
        maxWidth: "400px",
        maxHeight: "20vh",
        margin: "0 auto 1.2em",
        "&>": {
            "height": "100%"
        },
        [`${midScreenMediaQuery}`]: {
            opacity: 0,
            height: "1rem"
        }
    },
    iconVertical: {
        display: "None",
        [`${midScreenMediaQuery}`]: {
            display: "block",
            width: "100%",

            overflow: "hidden",
            "& > img": {
                display: "block",
                objectFit: "contain",
                width: "80%",
                maxHeight: "10rem",
                margin: "0 auto 1rem"
            },
        }

    },
    enterArea: {
        background: "rgba(80, 80, 80, .7)",
        flexGrow: 1,
        padding: "1rem",
        fontSize: "1.6em",
        color: "white",
        borderRadius: "8px",
        "& > .input-line": {
            margin: ["10px", 0, "10px", 0],
            display: "flex",
            alignItems: "center",
            height: "2.5rem"
        },
        "& input": {
            paddingLeft: ".3em",
            borderRadius: "5px",
            fontSize: "1.5rem",
            height: "2.5rem",
            border: "none",
            background: "rgba(20, 20, 20, .9)",
            color: "white",
            padding: "0",
            margin: 0,
            width: "100%",
            flex: 1,
        },
        "& input[type='button']": {
            cursor: "pointer"
        }

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
    const { id, name } = useParams()

    const classes = useStyle()

    const [inputName, setInputName] = useState(name);
    const [inputId, setID] = useState(id);
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
            body: JSON.stringify({ password: "TODO" })

        };
        fetch(`/api/room/${inputId}/`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    setToken(data.token)
                    history.push(`/room/${inputId}/${inputName}`)
                }
            });
    }



    return <div className={classes.root}>
        <div className={classes.centerVertical}>
            <div className={classes.iconVertical}>
                <img src={titleImgDesktop} alt="Yet Another Meet" width="100%" />
            </div>
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
                <div className={classes.icon}>
                    <img src={titleImgDesktop} alt="Yet Another Meet" width="100%" />
                </div>
                <div className={classes.enterArea}>
                    <div className="input-line">
                        <span style={{ fontSize: "90%" }}>Hello:&nbsp;</span>
                        <input required value={inputName} onChange={(e) => setInputName(e.target.value)} />
                    </div>
                    <div className="input-line">
                        <input required className={classes.input} placeholder="Room ID" value={inputId} onChange={(e) => setID(e.target.value)} />
                    </div>
                    <div className="input-line">
                        <input type="password" className={classes.input} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="input-line">
                        <input type="button" className={classes.button} onClick={enter} value="Join" />
                    </div>


                </div>
            </div>
        </div>

        <SettingModal isShow={isSettingShow} setShow={setSettingShow} />



    </div >;
}