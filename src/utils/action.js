export default function action(action, data) {
    return (JSON.stringify({ action, data }))
}