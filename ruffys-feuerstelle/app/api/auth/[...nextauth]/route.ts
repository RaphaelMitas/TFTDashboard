import GoogleProvider from "next-auth/providers/google";
import NextAuth, { AuthOptions } from "next-auth"

const authOptions: AuthOptions = {
    // Configure one or more authentication providers

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ]
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };