import { useContext, useEffect, useState } from "react";
import { MessageContext, WSContext } from 'context';
import { createUseStyles } from "react-jss";
import makeid from "utils/makeid";

const useStyle = createUseStyles({
    root: ({ isOpen }) => ({
        width: isOpen ? "20%" : 0,
        transition: "all ease 300ms",
        boxShadow: isOpen ? "rgb(0 244 0 / 65%) 0px 0px 5px 1px" : "rgb(0 244 0 / 0%) 0px 0px 5px 1px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        flexShrink: 0,
        marginRight: "10px"
    }),
    window: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        flexShrink: 0,
        backgroundColor: "#464646"
    },
    title: {
        fontSize: 20,
        backgroundColor: "#222",
        padding: ".3rem",
        color: "white"
    },
    view: {
        height: 400,
        overflowY: "auto",
        overflowX: "hidden",
        padding: [2, 5],
        color: "white"
    },
    message: {
        margin: [10, 0],
        display: "flex",
        alignItems: "center",
        wordBreak: "break-word"
    },
    name: {
        backgroundColor: "#222",
        color: "white",
        padding: [5, 10],
        display: "inline-block",
        marginRight: 10,
        wordBreak: "normal"
    },
    "@media (max-width: 520px)": {
        root: ({isOpen}) => ({
            width: isOpen ? "100%" : 0,
            marginRight: "unset"
        })
    }
})

export default function Chat({ isOpen }) {

    const { messagesList, setMessagesList, setSendMessage, messagesListRef, providingFiles, requireFile, receiveFiles } = useContext(MessageContext)
    const { name: myName, id: myId } = useContext(WSContext)

    const [text, setText] = useState("")
    const [uploadFile, setUploadFile] = useState("")




    const classes = useStyle({ isOpen })

    function send(mes) {
        messagesListRef.current = [...messagesList, mes]
        setMessagesList(messagesListRef.current)
        setSendMessage(mes)
    }

    function sendText() {
        if (text.length === 0) return
        const my_mes = { id: makeid(), type: "text", author: { name: myName, id: myId }, data: { text: text } }
        send(my_mes)
        setText("")
    }

    function sendFile(file) {
        const id = makeid()
        const my_mes = { id, type: "file", author: { name: myName, id: myId }, data: { file: { name: file.name, size: file.size } } }
        providingFiles.current.push({ id, file })
        send(my_mes)
    }

    function tryGetFile(mes) {
        if (mes.author.id === myId) {
            console.log(mes, myId);
            const file = providingFiles.current.find((f) => f.id === mes.id)
            if (!file) alert("File is not exist!")
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                var blob = new Blob([reader.result]);
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                var fileName = mes.data.file.name;
                link.download = fileName;
                link.click();
            });
            reader.readAsArrayBuffer(file.file);
        } else {
            console.log("receiveFiles", receiveFiles.current);
            receiveFiles.current[mes.id] = { buffer: [], file: mes.data.file }
            requireFile.setValue(mes)
        }
    }

    useEffect(() => {
        if (!uploadFile) return
        sendFile(uploadFile)
        setUploadFile(null)
    }, [uploadFile])

    console.log(messagesList)
    return <div className={classes.root}>
        <div className={classes.window}>
            <div className={classes.title}>Chat</div>
            <div className={classes.view}>{
                messagesList.map((m, i) => m.type === "text" ? <Text key={m.id} mes={m} /> : <File key={m.id} mes={m} tryGetFile={tryGetFile} receiveFiles={receiveFiles} mine={m.author.id === myId} />)
            }</div>
            <div className={classes.inputArea}>
                <input value={text} onKeyDown={(e) => { e.key === "Enter" && sendText() }} onChange={(e) => setText(e.target.value)} />
                <label htmlFor="upload">
                    <span className="material-icons">upload</span>
                    <input id="upload"
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => setUploadFile(e.target.files[0])} />
                </label>
            </div>
        </div>
    </div>
}

function Text({ mes }) {
    const classes = useStyle({})
    return <div className={classes.message}><div className={classes.name}>{mes.author.name}</div>{mes.data?.text}</div>
}

function File({ mes, tryGetFile, receiveFiles, mine }) {
    const [offset, setOffset] = useState(-1)
    useEffect(() => {
        if (mine) return
        const id = setInterval(() => {
            if (receiveFiles.current[mes.id]) {
                setOffset(receiveFiles.current[mes.id].buffer.length)
            } else {
                setOffset(-1)
            }
        }, 200)
        return () => clearInterval(id)
    }, [])

    const classes = useStyle({})
    return <div className={classes.message}>
        <div className={classes.name}>{mes.author.name}</div>
        {mes.data?.file.name}/{mes.data?.file.size / 1000}kb
        {offset !== -1 ? Math.round(offset / mes.data?.file.size * 100) + "%" : <span className="material-icons" onClick={() => tryGetFile(mes)}>download</span>}

    </div>
}