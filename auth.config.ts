import type { NextAuthConfig, DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"

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
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Use consistent ID based on provider
      if (account && user) {
        // For OAuth providers, use the provider's account ID as a stable identifier
        if (account.provider === 'google') {
          token.id = `${account.provider}_${account.providerAccountId}`
        } else {
          // For credentials provider, use the user.id
          token.id = user.id
        }
        
        // Check if user is the authorized admin
        if (user.email === "gurungvaaiii@gmail.com" || user.email === "traditionalley2050@gmail.com") {
          token.role = "admin"
        } else {
          token.role = user.role || "user"
        }
      }
      
      // Always check email on subsequent requests and assign admin role if needed
      if (token.email === "gurungvaaiii@gmail.com" || token.email === "traditionalley2050@gmail.com") {
        token.role = "admin"
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        
        // Double check for admin role based on email
        if (session.user.email === "gurungvaaiii@gmail.com" || session.user.email === "traditionalley2050@gmail.com") {
          session.user.role = "admin"
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig