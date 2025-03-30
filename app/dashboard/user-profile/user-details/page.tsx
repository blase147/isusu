import UserDetails from "@/app/ui/user-profile/user-details/user-details";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading user details...</div>}>
            <UserDetails />
        </Suspense>
    );
}
