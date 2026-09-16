import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { fetchDataFromApi } from "@/utils/api"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authentication attempt")

        if (!credentials?.email || !credentials?.password) {
          console.log("Authentication failed")
          return null
        }

        try {
          // Find user in Strapi (get the most recent one)
          const userResponse = await fetchDataFromApi(
            `/api/user-data?filters[email][$eq]=${encodeURIComponent(credentials.email as string)}&sort=createdAt:desc`
          )

          if (!userResponse?.data || userResponse.data.length === 0) {
            console.log("Authentication failed")
            return null
          }

          const user = userResponse.data[0]

          if (!user.password) {
            console.log("Authentication failed")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password as string)

          if (!isPasswordValid) {
            console.log("Authentication failed")
            return null
          }

          console.log("Authentication successful")

          // Generate a new session ID instead of using the stored authUserId (if missing)
          // Otherwise, prioritize the stable authUserId from the database to keep session query selectors intact
          const sessionId = `credentials_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const stableId = user.authUserId || sessionId

          const authUser = {
            id: stableId,
            email: user.email,
            name: `${user.firstName || ""}`.trim() + (user.lastName ? ` ${user.lastName}` : ""),
            image: user.avatar || "",
            role: "user",
          }

          return authUser
        } catch (error) {
          console.log("Authentication failed", error)
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})