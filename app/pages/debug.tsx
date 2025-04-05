import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function DebugPage() {
    const handleClick = async () => {
        try {
            const snap = await getDocs(collection(db, "messages"));
            console.log("Fetched messages:", snap.docs.map(doc => doc.data()));
        } catch (err) {
            console.error("Error reading messages:", err);
        }
    };

    return <button onClick={handleClick}>Test Firebase</button>;
}
