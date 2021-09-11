import { createUseStyles } from "react-jss"
import icon from "assets/buttonShape.svg"
const useStyle = createUseStyles({
    root: {
        width: "3em",
        height: "3em",
        background: `url(${icon})`,
        backgroundSize: "contain",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
    },
    icon: {
        position: "absolute",
        color: "white",
        fontSize: "1.5em",
        userSelect: "none"
    }
})
export default function IconButton({ icon, onClick }) {
    const classes = useStyle()
    return (
        <div className={classes.root} onClick={onClick}>
            <span className={["material-icons", classes.icon].join(" ")}>
                {icon}
            </span>
        </div>
    )
}