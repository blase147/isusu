"use client";

import { Suspense } from 'react';
import UserProfile from '../../ui/user-profile/user-profile';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserProfile />
        </Suspense>
    );
}
