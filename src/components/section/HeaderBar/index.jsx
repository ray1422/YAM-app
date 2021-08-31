import { useContext, useEffect, useRef, useState } from "react";
import { WSContext } from 'context';
import action from '../../../utils/action';
import { StreamingContext } from 'context';
import { createUseStyles } from "react-jss";

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
        padding: [5, 10]
    }
})

export default function HeaderBar({ name, isChatOpen, setChatOpen }) {

    const classes = useStyle()

    return <div className={classes.root}>
        <div className={classes.logo}><a href={`/${name}`} >LOGO</a></div>
        <span className={classes.chatToggle} onClick={() => setChatOpen(!isChatOpen)}> Chat</span>
    </div>
}