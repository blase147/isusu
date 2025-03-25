"use client"; // Ensure this is a Client Component

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UserDetails() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("id");

    return (
        <div>
            <h1>User Details</h1>
            <p>User ID: {userId}</p>
        </div>
    );
}

// ✅ Wrap UserDetails inside Suspense
export default function UserDetailsPage() {
    return (
        <Suspense fallback={<p>Loading user details...</p>}>
            <UserDetails />
        </Suspense>
    );
}
