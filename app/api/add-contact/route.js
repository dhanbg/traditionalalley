import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  const { email } = await request.json();
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!BREVO_API_KEY || !email || !listId) {
    return NextResponse.json(
      { error: "Missing required environment variables or email" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/contacts",
      {
        email,
        listIds: [parseInt(listId, 10)],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.response?.data || "An error occurred" },
      { status: 400 }
    );
  }
}
