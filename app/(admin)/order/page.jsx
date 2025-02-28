import { auth, clerkClient } from '@clerk/nextjs/server'

export default async function AdminPage() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Sign in to view this page</div>
  }

  // Initialize the Backend SDK
  const client = await clerkClient()

  // Get the user's full Backend User object
  const user = await client.users.getUser(userId)

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
    </div>
  )
}