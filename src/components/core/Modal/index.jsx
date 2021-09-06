import { createUseStyles } from "react-jss"
import icon from "assets/buttonShape.svg"
import { createPortal } from "react-dom"
const ustStyle = createUseStyles({
    root: ({ isShow }) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        opacity: isShow ? 1 : 0,
        pointerEvents: isShow ? "auto" : "none",
        transition: "0.3s",
        zIndex: 2
    }),
    backdrop: {
        width: "100vw",
        height: "100vh",
        backgroundColor: "#222",
        opacity: 0.5
    },
    modal: {
        position: 'absolute',
        left: "50%",
        top: "50%",
        transform: "translate(-50%,-50%)",
        width: 500,
        minHeight: 200,
        maxHeight: "60vh",
        backgroundColor: "white",
    }
})
export default function Modal({ children, isShow, setShow }) {
    const classes = ustStyle({ isShow })
    return createPortal(<div className={classes.root} >
        <div className={classes.backdrop} onClick={() => setShow(false)} />
        <div className={classes.modal} >
            {children}
        </div>
    </div>,
        document.getElementById('root'))
}

