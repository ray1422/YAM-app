import makeid from "./makeid";

export default function act(action, data) {
    return (JSON.stringify({ action, data, id: makeid() }))
}