import { createUseStyles } from "react-jss"
import icon from "assets/buttonShape.svg"
const ustStyle = createUseStyles({
    root: ({ size }) => ({
        width: size,
        height: size,
        background: `url(${icon})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
    }),
    icon: ({ size }) => ({
        position: "absolute",
        color: "white",
        fontSize: size / 2,
        userSelect: "none"
    })
})
export default function Toggle({ value, onChange, Active, Inactive, size = 80 }) {

    const classes = ustStyle({ size })


    return (
        <div className={classes.root} onClick={() => onChange(!value)}>
            <span className={["material-icons", classes.icon].join(" ")}>
                {value ? Active :
                    Inactive}
            </span>
        </div>
    )
}