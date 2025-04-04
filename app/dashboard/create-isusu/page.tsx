'use client';

import dynamic from 'next/dynamic';
export const dynamicConfig = 'force-dynamic';

const CreateIsusu = dynamic(() => import("../../ui/isusu/create-isusu"), { ssr: false });

export default function Page() {
    return <CreateIsusu />;
}
