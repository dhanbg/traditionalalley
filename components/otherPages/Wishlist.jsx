"use client";

import { useEffect, useState } from "react";
import ProductCard1 from "../productCards/ProductCard1";
import Pagination from "../common/Pagination";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getImageUrl } from "@/utils/imageUtils";

export default function Wishlist() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform wishlist data to match ProductCard1 expected format
  const transformWishlistData = (wishlistItem) => {
    const product = wishlistItem.product;
    const variantInfo = wishlistItem.variantInfo;
    
    return {
      id: product.id,
      documentId: product.documentId,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      isOnSale: product.isOnSale,
      hotSale: product.hotSale,
      countdown: product.countdown,
      slug: product.slug,
      description: product.description,
      weight: product.weight,
      dimensions: product.dimensions,
      hsCode: product.hsCode,
      size_stocks: product.size_stocks,
      isActive: product.isActive,
      // Handle images - prioritize variant image if available
      imgSrc: variantInfo?.imgSrc || getImageUrl(product.images?.[0]) || '/images/placeholder.jpg',
      images: product.images || [],
      // Include wishlist specific data
      wishlistId: wishlistItem.id,
      selectedSize: wishlistItem.sizes,
      selectedVariant: variantInfo,
      productVariant: wishlistItem.productVariant
    };
  };

  const fetchWishlistItems = async () => {
    console.log('🔍 Fetching wishlist items, session:', session);
    
    if (!session?.user?.id) {
      console.log('⚠️ No user ID found in session, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Fetching wishlist for user ID:', session.user.id);
      const apiUrl = `/api/wishlists?userId=${encodeURIComponent(session.user.id)}`;
      console.log('🔗 API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to fetch wishlist: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Raw wishlist data:', data);
      
      // Transform the data to match ProductCard1 expected format
      const transformedItems = data.data?.map(transformWishlistData) || [];
      console.log('🔄 Transformed items:', transformedItems.length);
      setItems(transformedItems);
      
    } catch (err) {
      console.error('❌ Error fetching wishlist:', {
        message: err.message,
        stack: err.stack,
        sessionUserId: session?.user?.id,
        sessionUser: session?.user
      });
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      const response = await fetch(`/api/wishlists?itemId=${wishlistId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove item from local state
        setItems(prevItems => prevItems.filter(item => item.wishlistId !== wishlistId));
      } else {
        console.error('Failed to remove item from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [session]);
  if (!session) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center p-5">
            <h3>Please sign in to view your wishlist</h3>
            <Link className="btn-primary" href="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center p-5">
            <div className="loading-spinner">Loading your wishlist...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center p-5">
            <h3>Error loading wishlist</h3>
            <p className="text-muted mb-3">{error}</p>
            <button 
              className="btn-primary" 
              onClick={fetchWishlistItems}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Wishlist ({items.length})</h2>
        </div>
        
        {items.length ? (
          <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4">
            {/* card product 1 */}
            {items.map((product, i) => (
              <div key={`${product.documentId}-${i}`} className="position-relative">
                <ProductCard1 
                  product={product} 
                  onRemoveFromWishlist={() => removeFromWishlist(product.wishlistId)}
                />
                {/* Optional: Show selected size/variant info */}
                {product.selectedSize && (
                  <div className="badge bg-secondary position-absolute top-0 end-0 m-2">
                    Size: {product.selectedSize}
                  </div>
                )}
              </div>
            ))}

            {/* pagination */}
            {items.length > 12 && (
              <ul className="wg-pagination justify-content-center">
                <Pagination />
              </ul>
            )}
          </div>
        ) : (
          <div className="text-center p-5">
            <div className="mb-4">
              <i className="far fa-heart fa-3x text-muted mb-3"></i>
            </div>
            <h3>Your wishlist is empty</h3>
            <p className="text-muted mb-4">
              Start adding your favorite products to save them for later!
            </p>
            <Link className="btn-primary" href="/shop-default-grid">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
