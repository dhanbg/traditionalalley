import type { NextAuthConfig, DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authentication attempt");
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Authentication failed");
          return null;
        }

        try {
          // Import bcrypt and api utils
          const bcrypt = await import("bcryptjs");
          const { fetchDataFromApi } = await import("@/utils/api");
          
          // Find user in Strapi (get the most recent one)
          const userResponse = await fetchDataFromApi(
            `/api/user-data?filters[email][$eq]=${encodeURIComponent(credentials.email as string)}&sort=createdAt:desc`
          );

          if (!userResponse?.data || userResponse.data.length === 0) {
            console.log("Authentication failed");
            return null;
          }

          const user = userResponse.data[0];

          if (!user.password) {
            console.log("Authentication failed");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password as string);

          if (!isPasswordValid) {
            console.log("Authentication failed");
            return null;
          }
          
          console.log("Authentication successful");
          
          // Generate a new session ID instead of using the stored authUserId (if missing)
          // Otherwise, prioritize the stable authUserId from the database to keep session query selectors intact
          const sessionId = `credentials_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const stableId = user.authUserId || sessionId;
          
          const authUser = {
            id: stableId,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.avatar || '',
            role: "user",
          };
          
          return authUser;
        } catch (error) {
          console.log("Authentication failed");
          return null;
        }
      },
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