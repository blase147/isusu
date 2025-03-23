"use client";

import { useParams } from "next/navigation";
import ManageMembers from '@/app/ui/isusu/manage-members';

export default function Page() {
    const params = useParams();
    const isusuId = params?.isusuId as string;

    if (!isusuId) {
        return <p>Error: Missing isusuId</p>;
    }

    return <ManageMembers isusuId={isusuId} />;
}
