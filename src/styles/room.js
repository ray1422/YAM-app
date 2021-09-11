import { createUseStyles } from "react-jss"
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
        transition: "300ms"
    }),
    client: ({ chatOpened, nBlk }) => ({
        margin: [10, 10, 10, 10],
        position: "relative",
        display: "flex",
        justifyContent: "center",
        aspectRatio: "16 / 9",
        height: "auto",
        width: chatOpened ? "45%" : "31%",
        transition: "all ease 300ms",
        minWidth: "10rem",
        maxWidth: nBlk > 2 ? "31vw" : "unset",
        overflow: "hidden",
        boxShadow: "0 0 5px 1px #00f400a6",
        background: "rgba(15, 15, 15, .7)",
        "& > video": {
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            bottom: 0,
            objectFit: "contain"
        }
    }),
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
}))
