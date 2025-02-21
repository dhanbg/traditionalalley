import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "traditional-alley" });

export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to sync user to Strapi");
      }

      console.log("User synced successfully");
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }
);

export const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to sync user to Strapi");
      }

      console.log("User synced successfully");
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }
);

export const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { id } = event.data;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync user to Strapi");
      }

      console.log("User synced successfully");
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }
);