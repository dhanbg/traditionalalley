import { NextRequest, NextResponse } from 'next/server';
import { fetchDataFromApi } from '@/utils/api';
import { getStockForSize } from '@/utils/stockUtils';

// Type definitions
interface ProductData {
  attributes?: any;
  size_stocks?: string | Record<string, number>;
  [key: string]: any;
}

interface VariantData {
  attributes?: ProductData;
  size_stocks?: string | Record<string, number>;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variantId, selectedSize, requestedQuantity, currentCartQuantity = 0 } = body;

    // Validate required fields
    if (!productId || !selectedSize || !requestedQuantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: productId, selectedSize, and requestedQuantity are required' 
        },
        { status: 400 }
      );
    }

    // Validate requested quantity is positive
    if (requestedQuantity <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Requested quantity must be greater than 0' 
        },
        { status: 400 }
      );
    }

    let productData: ProductData | null = null;
    let stockData: ProductData | null = null;

    try {
      // First, try to get variant data if variantId is provided
      if (variantId) {
        console.log(`🔍 Checking variant stock - Variant ID: ${variantId}, Type: ${typeof variantId}, Size: ${selectedSize}`);
        console.log('🔍 Variant ID details:', { variantId, type: typeof variantId, stringified: JSON.stringify(variantId) });
        
        // Try to fetch by documentId first
        let variantResponse = await fetchDataFromApi(`/api/product-variants?filters[documentId][$eq]=${variantId}&populate=*`);
        
        // If no results and variantId is numeric, try fetching by id
        if (!variantResponse?.data?.length && !isNaN(parseInt(variantId))) {
          console.log(`🔄 Trying to fetch variant by numeric id: ${variantId}`);
          variantResponse = await fetchDataFromApi(`/api/product-variants?filters[id][$eq]=${variantId}&populate=*`);
        }
        
        if (variantResponse?.data && variantResponse.data.length > 0) {
          const variant = variantResponse.data[0];
          stockData = variant.attributes || variant;
          console.log(`📦 Found variant stock data:`, stockData?.size_stocks);
        } else {
          console.log(`❌ No variant found for ID: ${variantId}`);
        }
      }

      // If no variant stock found, check main product
      if (!stockData) {
        console.log(`🔍 Checking main product stock - Product ID: ${productId}, Size: ${selectedSize}`);
        
        // Try to fetch by documentId first
        let productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${productId}&populate=*`);
        
        // If not found by documentId, try by numeric ID
        if (!productResponse?.data?.length && !isNaN(parseInt(productId))) {
          productResponse = await fetchDataFromApi(`/api/products/${parseInt(productId)}?populate=*`);
        }

        if (productResponse?.data) {
          productData = Array.isArray(productResponse.data) 
            ? productResponse.data[0] 
            : productResponse.data;
          
          if (productData) {
            stockData = productData.attributes || productData;
            console.log(`📦 Found main product stock data:`, stockData?.size_stocks);
          }
        }
      }

      if (!stockData) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Product not found' 
          },
          { status: 404 }
        );
      }

      // Get available stock for the specific size
      const availableStock = getStockForSize(stockData, selectedSize);
      console.log(`📊 Stock check - Size: ${selectedSize}, Available: ${availableStock}, Current in cart: ${currentCartQuantity}, Requested: ${requestedQuantity}`);

      // Calculate total quantity that would be in cart after this operation
      const totalQuantityAfterOperation = currentCartQuantity + requestedQuantity;

      // Check if there's enough stock
      if (availableStock === 0) {
        return NextResponse.json({
          success: false,
          error: 'This product is currently out of stock',
          availableStock: 0,
          requestedQuantity,
          currentCartQuantity
        });
      }

      if (totalQuantityAfterOperation > availableStock) {
        const maxAdditionalQuantity = Math.max(0, availableStock - currentCartQuantity);
        
        return NextResponse.json({
          success: false,
          error: `Insufficient stock. Only ${availableStock} items available in size ${selectedSize}. You currently have ${currentCartQuantity} in your cart.`,
          availableStock,
          requestedQuantity,
          currentCartQuantity,
          maxAdditionalQuantity,
          suggestedAction: maxAdditionalQuantity > 0 
            ? `You can add up to ${maxAdditionalQuantity} more items` 
            : 'Cannot add more items - cart already contains maximum available stock'
        });
      }

      // Stock validation passed
      return NextResponse.json({
        success: true,
        message: 'Stock validation passed',
        availableStock,
        requestedQuantity,
        currentCartQuantity,
        totalQuantityAfterOperation
      });

    } catch (fetchError) {
      console.error('Error fetching product/variant data:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error fetching product data' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Stock validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during stock validation' 
      },
      { status: 500 }
    );
  }
}
