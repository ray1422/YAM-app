import { useParams } from "react-router-dom";

export default function Room() {
    const { id } = useParams()
    return <>{id}</>;
}