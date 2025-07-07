import { auth } from '@/auth'

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    return <div>Sign in to view this page</div>
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
    </div>
  )
}