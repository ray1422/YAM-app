import { createUseStyles } from "react-jss";
import logoHeader from 'assets/logo_title_header.svg'
const useStyle = createUseStyles({
    root: {
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 24,
        padding: [5, 20]
    },
    chatToggle: {
        border: [2, "solid", "gray"],
        padding: [5, 10],
        color: "white",
        cursor: "pointer"
    },
    logo: {
        width: "20rem",
        maxWidth: "70vw",
        "& img" : {
            width: "100%"
        },
        marginRight: "1rem"
    }
})

export default function HeaderBar({ name, isChatOpen, setChatOpen }) {

    const classes = useStyle()

    return <div className={classes.root}>
        <div className={classes.logo}><a href={`/${name}`} ><img src={logoHeader} alt="Yet Another Meet" /></a></div>
        <span className={classes.chatToggle} onClick={() => setChatOpen(!isChatOpen)}> Chat</span>
    </div>
}