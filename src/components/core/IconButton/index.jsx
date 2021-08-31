import { createUseStyles } from "react-jss"
import icon from "assets/buttonShape.svg"
const ustStyle = createUseStyles({
    root: {
        width: 80,
        height: 80,
        background: `url(${icon})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
    },
    icon: {
        position: "absolute",
        color: "white",
        fontSize: 40,
        userSelect: "none"
    }
})
export default function IconButton({ icon, onClick }) {
    const classes = ustStyle()
    return (
        <div className={classes.root} onClick={onClick}>
            <span className={["material-icons", classes.icon].join(" ")}>
                {icon}
            </span>
        </div>
    )
}