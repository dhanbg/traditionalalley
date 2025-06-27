import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import {
  createData,
  updateData,
  deleteData,
  fetchDataFromApi,
} from "@/utils/api";

export async function POST(req: Request) {
  // Verify webhook signature
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is missing in environment variables");
    throw new Error("CLERK_WEBHOOK_SECRET is missing in environment variables");
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing Svix headers");
    return new Response("Missing Svix headers", { status: 400 });
  }

  // Parse and verify the webhook payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  console.log(
    `Processing ${eventType} event with data:`,
    JSON.stringify(evt.data, null, 2)
  );

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("Webhook processed successfully", { status: 200 });
}

async function handleUserCreated(userData: any) {
  try {
    const { id, first_name, last_name, image_url, email_addresses } = userData;

    if (!id) {
      console.error("Missing Clerk user ID in created event", userData);
      return;
    }

    // Create a new user in Strapi
    const result = await createData("/api/user-datas", {
      data: {
        clerkUserId: id, // Clerk User ID
        firstName: first_name || "",
        lastName: last_name || "",
        avatar: image_url || "",
        email: email_addresses?.[0]?.email_address || "",
      },
    });

    // Extract documentId from the response after user creation
    const documentId = result.data?.documentId; // Assuming `documentId` is returned as a key
    if (!documentId) {
      console.error("Document ID not found after creating Strapi user");
      return;
    }

    console.log(
      `Created Strapi user for Clerk ID: ${id} with Document ID: ${documentId}`
    );
  } catch (error) {
    console.error("Error creating Strapi user:", error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const { id, first_name, last_name, image_url, email_addresses } = userData;

    if (!id) {
      console.error("Missing Clerk user ID in updated event", userData);
      return;
    }

    const strapiUser = await findStrapiUserByClerkId(id);

    if (strapiUser) {
      // Ensure we are using documentId for the update, not id
      const documentId = strapiUser.documentId || strapiUser.id;

      const result = await updateData(`/api/user-datas/${documentId}`, {
        data: {
          firstName: first_name || strapiUser.firstName,
          lastName: last_name || strapiUser.lastName,
          avatar: image_url || strapiUser.avatar,
          email: email_addresses?.[0]?.email_address || strapiUser.email || "",
        },
      });
      console.log(`Updated Strapi user for Clerk ID: ${id}`, result);
    } else {
      console.log(
        `No Strapi user found for Clerk ID: ${id}, creating new entry`
      );
      await handleUserCreated(userData);
    }
  } catch (error) {
    console.error("Error updating Strapi user:", error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  try {
    let clerkId = null;

    if (typeof userData === "object") {
      clerkId =
        userData.id ||
        (userData.data && userData.data.id) ||
        (userData.object && userData.object.id);
    }

    if (!clerkId) {
      console.error(
        "Could not extract Clerk user ID from deletion event:",
        userData
      );
      return;
    }

    console.log(`Attempting to delete Strapi user for Clerk ID: ${clerkId}`);
    const strapiUser = await findStrapiUserByClerkId(clerkId);

    if (strapiUser) {
      // Use documentId for deletion
      const documentId = strapiUser.documentId; // Ensure this is the correct key for the document ID
      console.log(`Found Strapi user with Document ID: ${documentId}`);

      const result = await deleteData(`/api/user-datas/${documentId}`);
      console.log(
        `Deleted Strapi user for Clerk ID: ${clerkId} and Document ID: ${documentId}`,
        result
      );
    } else {
      console.log(`No Strapi user found for Clerk ID: ${clerkId}`);
    }
  } catch (error) {
    console.error("Error deleting Strapi user:", error);
    throw error;
  }
}

async function findStrapiUserByClerkId(clerkId: string) {
  try {
    console.log(`Finding Strapi user with Clerk ID: ${clerkId}`);
    const response = await fetchDataFromApi(
      `/api/user-datas?filters[clerkUserId][$eq]=${encodeURIComponent(clerkId)}`
    );

    const user = response.data?.[0] || null;
    console.log(
      `Strapi user lookup result:`,
      user ? `Found Document ID: ${user.documentId}` : "Not found"
    );

    return user;
  } catch (error) {
    console.error("Error finding Strapi user:", error);
    return null;
  }
}
