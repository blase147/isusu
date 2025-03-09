"use client";

import dynamic from "next/dynamic";

const DepositNoSSR = dynamic(() => import('../../../ui/wallet/deposit/deposit'), { ssr: false });

export default function Page() {
    return <DepositNoSSR />;
}
