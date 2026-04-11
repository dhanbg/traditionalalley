import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// GET - Fetch user orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const authUserId = searchParams.get("authUserId") || session.user.id;
    const limit = searchParams.get("limit") || "50";
    const sort = searchParams.get("sort") || "createdAt:desc";

    // Fetch orders from Strapi
    const strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-orders?filters[authUserId][$eq]=${authUserId}&pagination[limit]=${limit}&sort=${sort}&populate=*`;
    
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user orders from Strapi:", response.status, response.statusText);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in user-orders GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new order record
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data: orderData } = body;

    if (!orderData) {
      return NextResponse.json({ error: "Order data is required" }, { status: 400 });
    }

    // Ensure the order belongs to the authenticated user
    if (orderData.authUserId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized - order user mismatch" }, { status: 403 });
    }

    // Create order in Strapi
    const strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-orders`;
    
    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: orderData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create order in Strapi:", response.status, response.statusText, errorText);
      return NextResponse.json({ 
        error: "Failed to create order",
        details: errorText 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log("✅ Order created successfully:", data.data?.documentId);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in user-orders POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update existing order
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { data: updateData } = body;

    if (!updateData) {
      return NextResponse.json({ error: "Update data is required" }, { status: 400 });
    }

    // Update order in Strapi
    const strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-orders/${orderId}`;
    
    const response = await fetch(strapiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: updateData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update order in Strapi:", response.status, response.statusText, errorText);
      return NextResponse.json({ 
        error: "Failed to update order",
        details: errorText 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log("✅ Order updated successfully:", data.data?.documentId);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in user-orders PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
