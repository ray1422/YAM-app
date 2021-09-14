import { createUseStyles } from "react-jss"

import { createPortal } from "react-dom"
import Modal from "components/core/Modal"
import { useContext } from "react"
import { StreamingContext } from "context"
const ustStyle = createUseStyles({
})
export default function SettingModal({ children, isShow, setShow }) {
    const classes = ustStyle({ isShow })

    const { source: { videos, audios }, sourceSwitch: { userAudioStream, userVideoStream, setUserVideoStream, setUserAudioStream } } = useContext(StreamingContext)
    return <Modal isShow={isShow} setShow={setShow}>
        {videos && <select onChange={(e) => setUserVideoStream(e.target.value)} value={userVideoStream}>
            {videos.map((v, i) => <option key={i} value={i}>{v.label}</option>)}
        </select>}
        {audios && <select onChange={(e) => setUserAudioStream(e.target.value)} value={userAudioStream}>
            {audios.map((a, i) => <option key={i} value={i}>{a.label}</option>)}
        </select>}
    </Modal>
}