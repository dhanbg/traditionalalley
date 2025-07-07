import type { NextAuthConfig, DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

declare module "next-auth" {
  interface User {
    role?: string
  }
  
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string
  }
}

export default {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your own logic here to validate credentials
        // This is a placeholder - you should implement proper validation
        if (credentials?.email && credentials?.password) {
          // Return user object if credentials are valid
          return {
            id: "1",
            email: credentials.email as string,
            name: "User",
            role: "user",
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Use consistent ID based on provider
      if (account && user) {
        // For OAuth providers, use the provider's account ID as a stable identifier
        if (account.provider === 'google' || account.provider === 'github') {
          token.id = `${account.provider}_${account.providerAccountId}`
        } else {
          // For credentials provider, use the user.id
          token.id = user.id
        }
        token.role = user.role || "user"
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig 