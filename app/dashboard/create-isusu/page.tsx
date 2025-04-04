'use client';

import dynamic from 'next/dynamic';

const CreateIsusu = dynamic(() => import('./../../ui/isusu/create-isusu'), { ssr: false });

export default function CreateIsusuWrapper() {
    return <CreateIsusu />;
}
