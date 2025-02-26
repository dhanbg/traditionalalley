import { Webhook } from 'svix'
import { headers } from 'next/headers'

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN
  const STRAPI_URL = process.env.STRAPI_URL

  if (!WEBHOOK_SECRET || !STRAPI_TOKEN || !STRAPI_URL) {
    throw new Error('Missing required environment variables')
  }

  // Get headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing required headers', { status: 400 })
  }

  try {
    // Verify webhook
    const payload = await req.json()
    const body = JSON.stringify(payload)
    
    const wh = new Webhook(WEBHOOK_SECRET)
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    })

    // Handle user creation event
    if (evt.type === 'user.created') {
      const { id, email_addresses, username } = evt.data
      
      // Prepare Strapi user data
      const userData = {
        data: {
          clerkUserId: id,
          username: username || email_addresses[0].email_address,
          email: email_addresses[0].email_address,
          provider: 'clerk',
          confirmed: true,
          role: 1 // Replace with your actual role ID
        }
      }

      // Create user in Strapi
      const strapiResponse = await fetch(`${STRAPI_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        },
        body: JSON.stringify(userData)
      })

      if (!strapiResponse.ok) {
        const error = await strapiResponse.text()
        throw new Error(`Strapi API error: ${error}`)
      }
    }

    return new Response('', { status: 200 })

  } catch (err) {
    console.error('Webhook processing error:', err)
    return new Response(err.message || 'Internal server error', {
      status: 500
    })
  }
}