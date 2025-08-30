import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Debug environment variables
    console.log('🔧 Environment check:');
    console.log('  - STRAPI_URL:', STRAPI_URL);
    console.log('  - STRAPI_TOKEN exists:', !!STRAPI_TOKEN);
    console.log('  - STRAPI_TOKEN length:', STRAPI_TOKEN?.length || 0);
    console.log('  - userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!STRAPI_URL) {
      console.error('❌ STRAPI_URL is not set');
      return NextResponse.json({ error: 'Server configuration error: STRAPI_URL missing' }, { status: 500 });
    }

    if (!STRAPI_TOKEN) {
      console.error('❌ STRAPI_TOKEN is not set');
      return NextResponse.json({ error: 'Server configuration error: STRAPI_TOKEN missing' }, { status: 500 });
    }

    const apiUrl = `${STRAPI_URL}/api/wishlists?populate[product][populate]=*&populate[product_variant][populate]=*&populate[user_datum][populate]=*&filters[user_datum][authUserId][$eq]=${userId}`;
    console.log('🔗 Fetching from:', apiUrl);

    // Fetch wishlist items for the specific user
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Strapi response status:', response.status);
    console.log('📡 Strapi response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Strapi API Error:');
      console.error('  - Status:', response.status, response.statusText);
      console.error('  - Response:', errorText);
      console.error('  - URL:', apiUrl);
      return NextResponse.json({ 
        error: 'Failed to fetch wishlists', 
        details: errorText,
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Debug: Log the raw response data
    console.log('📊 Raw wishlist response from Strapi:', JSON.stringify(data, null, 2));
    console.log('📊 Number of wishlist items:', data.data?.length || 0);
    
    // Transform the data to a more usable format
    const transformedData = data.data?.map(item => {
      // Helper function to format image URL
      const formatImageUrl = (imageObj) => {
        if (!imageObj) return null;
        if (typeof imageObj === 'string') {
          return imageObj.startsWith('http') ? imageObj : `${STRAPI_URL}${imageObj}`;
        }
        if (imageObj.url) {
          return imageObj.url.startsWith('http') ? imageObj.url : `${STRAPI_URL}${imageObj.url}`;
        }
        return null;
      };

      // Handle variant image fallback logic
      let productImgSrc = formatImageUrl(item.product.imgSrc);
      let productImages = item.product.images?.map(img => formatImageUrl(img)).filter(Boolean) || [];
      
      // If this is a variant and the main product has no image, try to get image from variant
      if (item.product_variant && (!productImgSrc || productImgSrc === '/images/placeholder.jpg')) {
        const variantImgSrc = formatImageUrl(item.product_variant.imgSrc);
        if (variantImgSrc && variantImgSrc !== '/images/placeholder.jpg') {
          productImgSrc = variantImgSrc;
        }
        
        // Also check variant gallery for images
        if (item.product_variant.gallery && Array.isArray(item.product_variant.gallery)) {
          const variantImages = item.product_variant.gallery.map(img => formatImageUrl(img)).filter(Boolean);
          if (variantImages.length > 0) {
            productImages = [...variantImages, ...productImages];
            // Use first variant image as main image if no main image exists
            if (!productImgSrc || productImgSrc === '/images/placeholder.jpg') {
              productImgSrc = variantImages[0];
            }
          }
        }
      }

      return {
        id: item.id,
        documentId: item.documentId,
        sizes: item.sizes,
        variantInfo: item.variantInfo,
        product: {
          ...item.product,
          // Use the processed image with variant fallback
          imgSrc: productImgSrc,
          // Use the processed images array with variant images
          images: productImages
        },
        productVariant: item.product_variant,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    }) || [];

    return NextResponse.json({
      data: transformedData,
      meta: data.meta
    });

  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, productId, size, variantInfo } = body;

    console.log('🔍 POST /api/wishlists - Received data:');
    console.log('  - Full body:', body);
    console.log('  - userId:', userId, '(type:', typeof userId, ')');
    console.log('  - productId:', productId, '(type:', typeof productId, ')');
    console.log('  - size:', size);
    console.log('  - variantInfo:', variantInfo);

    if (!userId || !productId) {
      console.log('❌ Validation failed - missing userId or productId');
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }

    // Find the user-data record by authUserId (since userId is the Google OAuth ID)
    console.log('🔍 Looking for user-data record with authUserId:', userId);
    const userDataResponse = await fetch(`${STRAPI_URL}/api/user-data?filters[authUserId][$eq]=${userId}`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userDataResponse.ok) {
      console.error('❌ Failed to fetch user-data:', userDataResponse.status, userDataResponse.statusText);
      return NextResponse.json({ error: 'Failed to find user data' }, { status: 400 });
    }

    const userData = await userDataResponse.json();
    console.log('📊 User-data response:', userData);

    if (!userData.data || userData.data.length === 0) {
      console.error('❌ No user-data record found for authUserId:', userId);
      return NextResponse.json({ error: 'User data not found. Please ensure you are logged in properly.' }, { status: 400 });
    }

    const userDataRecord = userData.data[0];
    const strapiUserId = userDataRecord.documentId || userDataRecord.id;
    console.log('✅ Found user-data record. Using Strapi user ID:', strapiUserId);

    // Find the user-bag record for this user
    console.log('🔍 Looking for user-bag record for user-data:', strapiUserId);
    const userBagResponse = await fetch(`${STRAPI_URL}/api/user-bags?filters[user_datum][documentId][$eq]=${strapiUserId}`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    let userBagId = null;
    if (userBagResponse.ok) {
      const userBagData = await userBagResponse.json();
      console.log('📊 User-bag response:', userBagData);
      
      if (userBagData.data && userBagData.data.length > 0) {
        userBagId = userBagData.data[0].documentId;
        console.log('✅ Found user-bag record. Using user-bag ID:', userBagId);
      } else {
        console.log('⚠️ No user-bag found for this user');
      }
    } else {
      console.error('❌ Failed to fetch user-bag:', userBagResponse.status, userBagResponse.statusText);
    }

    // Create wishlist item
    const wishlistPayload = {
      data: {
        variantInfo: variantInfo || null,
        product: productId,
        product_variant: variantInfo?.documentId || null,
        user_datum: strapiUserId
      }
    };
    
    // Add user_bag if found
    if (userBagId) {
      wishlistPayload.data.user_bag = userBagId;
    }
    
    // Only include sizes if a valid size is provided
    if (size && ['S', 'M', 'L', 'XL'].includes(size)) {
      wishlistPayload.data.sizes = size;
    }
    
    console.log('📤 Creating wishlist with payload:', wishlistPayload);
    
    const response = await fetch(`${STRAPI_URL}/api/wishlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wishlistPayload)
    });

    console.log('📡 Strapi wishlist creation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create wishlist item:');
      console.error('  - Status:', response.status, response.statusText);
      console.error('  - Response:', errorText);
      console.error('  - Payload sent:', wishlistPayload);
      return NextResponse.json({ 
        error: 'Failed to create wishlist item', 
        details: errorText,
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ Wishlist item created successfully:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating wishlist item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const response = await fetch(`${STRAPI_URL}/api/wishlists/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to delete wishlist item:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to delete wishlist item' }, { status: response.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
