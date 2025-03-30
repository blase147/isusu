import SendMessage from "@/app/ui/messages/send-message";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SendMessage />
        </Suspense>
    );
}
