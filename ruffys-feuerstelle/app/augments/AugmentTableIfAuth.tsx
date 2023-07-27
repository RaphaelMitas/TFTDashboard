'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import AugmentTable from './AugmentTable';
import Augment from './Augment';
import { Button } from '@mui/material';

export default function AugmentTableIfAuth({ augments }: { augments: Augment[] }) {
    const { data: session, status } = useSession();

    return (
        <div>
            {
                status === 'unauthenticated' ? <div>
                    Not authenticated
                    <Button onClick={() => signIn()}>Sign In</Button>
                </div> :
                    status === 'loading' ? <div>Authenticating...</div>
                        : (status === 'authenticated' && (
                            session?.user?.email === '***REMOVED***' ||
                            session?.user?.email === '***REMOVED***'
                        )) ?
                            <AugmentTable augments={augments} />
                            : <div>
                                Not Allowed
                                <Button onClick={() => signOut()}>Sign Out</Button>
                            </div>}
        </div>
    );
}