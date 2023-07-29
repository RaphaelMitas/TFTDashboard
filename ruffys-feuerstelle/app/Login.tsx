'use client';
import { Button, useTheme } from "@mui/material";
// a component that handles login

import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
    const { data: session, status } = useSession();
    if (status === 'loading') {
        return <div>Authenticating...</div>
    }
    if (session && session.user) {
        return <Button onClick={() => signOut()}>Sign Out</Button>
    }
    else {
        return <Button onClick={() => signIn()}>Sign In</Button>
    }
}
