import { createUseStyles } from "react-jss"
import icon from "assets/buttonShape.svg"
export const useStyle = createUseStyles(() => ({
    meetingArea: {
        display: "flex",
    },
    clients: ({ chatOpened, nBlk }) => ({
        width: chatOpened ? "80%" : "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        flexWrap: "wrap",
        transition: "300ms",
    }),
    client: ({ chatOpened, nBlk }) => ({
        margin: [10, 10, 10, 10],
        position: "relative",
        display: "flex",
        justifyContent: "center",
        aspectRatio: "16 / 9",
        height: "auto",
        maxHeight: nBlk > 3 ? "35vh" : "70vh",
        width: chatOpened ? ["75%", "75%", "37%", "25%"][Math.min(3, nBlk)] : ["90%", "90%", "45%", "30%"][Math.min(3, nBlk)],
        transition: "all ease 300ms",
        minWidth: "10rem",
        // overflow: "hidden",
        boxShadow: "0 0 5px 1px #00f400a6",
        background: "rgba(15, 15, 15, .7)",
        cursor: "zoom-in",
        "& > video": {
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            bottom: 0,
            objectFit: "contain"
        }
    }),
    "@media (max-width: 520px)": {

        clients: ({ chatOpened }) => ({
            transform: chatOpened ? "translateX(-100%)" : "translateX(0)",
            width: chatOpened ? 0 : "100%",
            overflow: "hidden"
        }),
        client: ({ chatOpened, nBlk }) => ({
            width: chatOpened ? ["100%", "100%", "100%", "100%"][Math.min(3, nBlk)] : ["100%", "100%", "100%", "100%"][Math.min(3, nBlk)],
        })
    },
    name: {
        position: "absolute",
        left: 0,
        height: "calc(1em + 10px)",
        bottom: 0,
        backgroundColor: "#333333",
        color: "#fff",
        padding: [5, 10]
    },
    controlBox: {
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        bottom: "1em",
        position: "absolute",
    },
    infoBar: {
        position: "absolute",
        display: "flex",
        justifyContent: "space-between",
        left: 0,
        bottom: 0,
        width: "100%",
        padding: 10
    },
    buttons: {
        display: "flex",
    },
    button: {
        width: 40,
        height: 40,
        background: `url(${icon})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        "& .volume": {
            position: "absolute",
            bottom: "calc(-100% - 20px)",
            backgroundColor: "#444",
            padding: 5,
            opacity: 0,
            transition: "0.3s",
            pointerEvents: "none",
        },
        "&:hover": {
            "& .volume": {
                opacity: 1,
                pointerEvents: "auto",
            },
        }
    },
    icon: {
        position: "absolute",
        color: "white",
        fontSize: 20,
        userSelect: "none"
    }
}))
