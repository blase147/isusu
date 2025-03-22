"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnnouncementForm from "@/app/ui/isusu/announcements";

function PageContent() {
    const searchParams = useSearchParams();
    const isusuId = searchParams.get("isusuId");

    if (!isusuId) {
        return <p className="text-red-500">Error: isusuId is required</p>;
    }

    return (
        <AnnouncementForm
            isusuId={isusuId}
            onClose={() => { }}
        />
    );
}

export default function Page() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PageContent />
        </Suspense>
    );
}
