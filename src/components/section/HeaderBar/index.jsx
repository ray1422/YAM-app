import { createUseStyles } from "react-jss";
import logoHeader from 'assets/logo_title_header.svg'
import { GlobalContext, StreamingContext } from 'context';
import SettingModal from 'components/section/SettingModal';
import { useContext } from "react";
const useStyle = createUseStyles({
    root: {
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 24,
        padding: [5, 20],
        "@media (max-width: 540px)": {
            padding: [5, 10],
        },
    },
    chatToggle: {
        border: [2, "solid", "gray"],
        padding: [5, 10],
        "@media (max-width: 540px)": {
            padding: [5, 5],
        },
        margin: [0, 3],
        color: "white",
        cursor: "pointer",
        "&, & .material-icons": {
            "@media (max-width: 430px)": {
                fontSize: 16,
            },
            "@media (max-width: 330px)": {
                fontSize: 5,
            }
        },
    },
    logo: {
        width: "20rem",
        maxWidth: "60vw",
        "& img": {
            width: "100%"
        },
        marginRight: "1rem",
        "@media (max-width: 430px)": {
            marginRight: 0,
        },
    }
})

export default function HeaderBar({ roomId, name, isChatOpen, setChatOpen }) {
    const { isSettingShow, setSettingShow } = useContext(GlobalContext)
    const classes = useStyle()

    return <div className={classes.root}>
        <div className={classes.logo}><a href={`/${roomId}/${name}`} ><img src={logoHeader} alt="Yet Another Meet" /></a></div>
        <div className={classes.toggleWrapper}>
            <span className={classes.chatToggle} onClick={() => setSettingShow(true)}>
                <i className={["material-icons"].join(" ")} style={{
                    verticalAlign: "middle"
                }}>{"settings"}</i>
            </span>
            <span className={classes.chatToggle} onClick={() => setChatOpen(!isChatOpen)}>Chat</span>
            <SettingModal isShow={isSettingShow} setShow={setSettingShow} />
        </div>
    </div>
}