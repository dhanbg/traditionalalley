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
        console.log('🔐 NextAuth authorize starting...');
        console.log('📧 Email:', credentials?.email);
        console.log('🔑 Password provided:', !!credentials?.password);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        try {
          // Import bcrypt and api utils
          const bcrypt = await import("bcryptjs")
          const { fetchDataFromApi } = await import("@/utils/api")
          
          console.log('📡 About to call fetchDataFromApi...');
          console.log('🌐 API URL being used:', process.env.NEXT_PUBLIC_API_URL);
          console.log('🔐 API Token exists:', !!process.env.NEXT_PUBLIC_STRAPI_API_TOKEN);
          console.log('🔐 API Token length:', process.env.NEXT_PUBLIC_STRAPI_API_TOKEN?.length || 0);
          
          // Find user in Strapi (get the most recent one)
          const userResponse = await fetchDataFromApi(
            `/api/user-data?filters[email][$eq]=${credentials.email}&sort=createdAt:desc`
          )
          console.log("User response from Strapi:", userResponse);

          if (!userResponse?.data || userResponse.data.length === 0) {
            console.log("No user found for email:", credentials.email);
            return null;
          }

          const user = userResponse.data[0]; // Most recent user
          console.log("User found:", user);
          
          // NEW: Log every single field to see what's missing
          console.log('🔍 Detailed user field analysis:');
          console.log('  - id:', user.id);
          console.log('  - documentId:', user.documentId);
          console.log('  - email:', user.email);
          console.log('  - firstName:', user.firstName);
          console.log('  - lastName:', user.lastName);
          console.log('  - password field exists:', 'password' in user);
          console.log('  - password value type:', typeof user.password);
          console.log('  - password value:', user.password);
          console.log('  - password length:', user.password?.length || 0);
          console.log('  - authUserId:', user.authUserId);
          console.log('  - isEmailVerified:', user.isEmailVerified);
          console.log('  - All user keys:', Object.keys(user));

          if (!user.password) {
            console.log("User has no password set:", user.email);
            console.log("This might be an OAuth-only user or schema issue");
            return null; // User might be OAuth-only
          }

          console.log('🔒 About to compare passwords...');
          console.log('  - Stored hash:', user.password);
          console.log('  - Input password:', credentials.password);

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password as string);
          console.log("Password valid?", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Password mismatch for user:", user.email);
            return null;
          }
          
          console.log('✅ Authentication successful! Creating user object...');
          
          // Generate a new session ID instead of using the stored authUserId
          // This ensures we don't reuse pending IDs from registration
          const sessionId = `credentials_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('🆔 Generated new session ID:', sessionId, '(replacing stored authUserId:', user.authUserId, ')');
          
          const authUser = {
            id: sessionId,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            image: user.avatar,
            role: "user",
          };
          console.log('👤 Returning user object:', authUser);
          
          return authUser;
        } catch (error) {
          console.error("Authorization error:", error)
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);
          return null
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
        if (user.email === "gurungvaaiii@gmail.com") {
          token.role = "admin"
          console.log("🔑 Admin role assigned to:", user.email)
        } else {
          token.role = user.role || "user"
          console.log("👤 User role assigned to:", user.email)
        }
      }
      
      // Always check email on subsequent requests and assign admin role if needed
      if (token.email === "gurungvaaiii@gmail.com") {
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
        if (session.user.email === "gurungvaaiii@gmail.com") {
          session.user.role = "admin"
        }
        
        console.log("🎯 Session created for:", session.user.email, "with role:", session.user.role)
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig 