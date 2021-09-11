import { createUseStyles } from "react-jss"
import icon from "assets/buttonShape.svg"
const useStyle = createUseStyles({
    root: ({ size }) => ({
        width: size,
        height: size,
        background: `url(${icon})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
export default function Toggle({value, onChange, Active, Inactive, size="3em"}) {

    const classes = useStyle({ size })


    return (
        <div className={classes.root} onClick={() => onChange(!value)}>
            <span className={["material-icons", classes.icon].join(" ")}>
                {value ? Active :
                    Inactive}
            </span>
        </div>
    )
}