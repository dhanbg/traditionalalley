"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { fetchDataFromApi, createData, getOptimizedImageUrl } from "@/utils/api";
import { API_URL, STRAPI_API_TOKEN } from "@/utils/urls";

export default function ToReview() {
  const { data: session } = useSession();
  const user = session?.user;
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comments: "",
    photos: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user data with user_bag populated
        const userDataResponse = await fetchDataFromApi(
          `/api/user-datas?filters[authUserId][$eq]=${user.id}&populate=user_bag`
        );

        if (userDataResponse?.data && userDataResponse.data.length > 0) {
          const userData = userDataResponse.data[0];
          const userBag = userData.user_bag;

          if (userBag && userBag.user_orders && userBag.user_orders.payments) {
            // Get all successful orders
            const successfulOrders = userBag.user_orders.payments.filter(
              payment => payment.status === "Success"
            );

            // Extract all purchased products
            const allPurchasedProducts = [];
            for (const order of successfulOrders) {
              if (order.orderData?.products) {
                for (const product of order.orderData.products) {
                  // Check if product already exists in the array
                  const existingProduct = allPurchasedProducts.find(
                    p => p.documentId === product.documentId
                  );
                  
                  if (!existingProduct) {
                    allPurchasedProducts.push({
                      ...product,
                      orderId: order.merchantTxnId || order.processId,
                      orderDate: order.timestamp
                    });
                  }
                }
              }
            }

            // Fetch product details and existing reviews
            const productsWithDetails = await Promise.all(
              allPurchasedProducts.map(async (product) => {
                try {
                  // Fetch product details
                  const productResponse = await fetchDataFromApi(
                    `/api/products?filters[documentId][$eq]=${product.documentId}&populate=*`
                  );

                  // Fetch existing reviews for this product by this user
                  const reviewsResponse = await fetchDataFromApi(
                    `/api/customer-reviews?filters[product][documentId][$eq]=${product.documentId}&filters[user_data][authUserId][$eq]=${user.id}&populate=*`
                  );

                  const hasReviewed = reviewsResponse?.data && reviewsResponse.data.length > 0;

                  return {
                    ...product,
                    details: productResponse?.data?.[0] || null,
                    hasReviewed,
                    existingReview: hasReviewed ? reviewsResponse.data[0] : null
                  };
                } catch (error) {
                  console.error(`Error fetching product ${product.documentId}:`, error);
                  return { ...product, details: null, hasReviewed: false };
                }
              })
            );

            // Filter out products that have already been reviewed
            const productsToReview = productsWithDetails.filter(p => !p.hasReviewed && p.details);
            setPurchasedProducts(productsToReview);
          }
        }
      } catch (error) {
        console.error("Error fetching purchased products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedProducts();
  }, [user]);

  const handleStartReview = (product) => {
    setReviewingProduct(product);
    setReviewForm({ rating: 5, comments: "", photos: [] });
  };

  const handleCancelReview = () => {
    setReviewingProduct(null);
    setReviewForm({ rating: 5, comments: "", photos: [] });
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Limit to 5 photos maximum
    const currentPhotos = reviewForm.photos.length;
    const maxPhotos = 5;
    const availableSlots = maxPhotos - currentPhotos;
    
    if (availableSlots <= 0) {
      alert("You can upload maximum 5 photos per review.");
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setUploadingPhoto(true);

    try {
      const uploadedPhotos = [];
      
      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file.`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 5MB.`);
          continue;
        }

        // Create a preview URL for the image
        const previewUrl = URL.createObjectURL(file);
        
        // For now, we'll store the file object and preview URL
        // In a real implementation, you would upload to a cloud service
        uploadedPhotos.push({
          file,
          previewUrl,
          name: file.name,
          size: file.size
        });
      }

      setReviewForm(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedPhotos]
      }));

    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Error uploading photos. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (photoIndex) => {
    setReviewForm(prev => {
      const newPhotos = [...prev.photos];
      // Revoke the object URL to free memory
      URL.revokeObjectURL(newPhotos[photoIndex].previewUrl);
      newPhotos.splice(photoIndex, 1);
      return {
        ...prev,
        photos: newPhotos
      };
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewingProduct || !user) return;

    setSubmitting(true);
    try {
      // Get current user data
      const userDataResponse = await fetchDataFromApi(
        `/api/user-datas?filters[authUserId][$eq]=${user.id}`
      );

      if (userDataResponse?.data && userDataResponse.data.length > 0) {
        const userData = userDataResponse.data[0];

        let uploadedImageIds = [];

        // Upload images to Strapi if there are any
        if (reviewForm.photos.length > 0) {
          try {
            for (const photo of reviewForm.photos) {
              const formData = new FormData();
              formData.append('files', photo.file);

              const uploadResponse = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: formData,
              });

              if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                if (uploadResult && uploadResult.length > 0) {
                  uploadedImageIds.push(uploadResult[0].id);
                }
              } else {
                const errorText = await uploadResponse.text();
                console.error('Failed to upload image:', photo.name, 'Error:', errorText);
              }
            }
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            // Continue with review submission even if image upload fails
          }
        }

        // Create review data
        const reviewData = {
          data: {
            comments: reviewForm.comments,
            rating: reviewForm.rating,
            product: reviewingProduct.details.documentId,
            user_data: [userData.documentId],
            total_reviews: 1
          }
        };

        // Add image IDs if any were uploaded successfully
        if (uploadedImageIds.length > 0) {
          reviewData.data.image = uploadedImageIds;
        }

        await createData("/api/customer-reviews", reviewData);

        // Clean up object URLs
        reviewForm.photos.forEach(photo => {
          URL.revokeObjectURL(photo.previewUrl);
        });

        // Remove the reviewed product from the list
        setPurchasedProducts(prev => 
          prev.filter(p => p.documentId !== reviewingProduct.documentId)
        );

        // Reset review form
        setReviewingProduct(null);
        setReviewForm({ rating: 5, comments: "", photos: [] });

        alert("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-account-content">
        <div className="account-orders">
          <div className="text-center">Loading products to review...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-orders">
        <h4 className="mb-4">Products to Review</h4>
        
        {purchasedProducts.length > 0 ? (
          <div className="products-to-review">
            {purchasedProducts.map((product, index) => (
              <div key={product.documentId} className="review-product-item" style={{ 
                border: '1px solid var(--line)', 
                borderRadius: '8px', 
                padding: '20px', 
                marginBottom: '20px' 
              }}>
                <div className="d-flex gap-3 align-items-start">
                  <div className="product-image" style={{ 
                    width: '80px', 
                    height: '100px', 
                    border: '1px solid var(--line)', 
                    borderRadius: '3px', 
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <Image
                      alt="product"
                      src={product.details?.imgSrc ? getOptimizedImageUrl(product.details.imgSrc) : "/images/products/default-product.jpg"}
                      width={80}
                      height={100}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  
                  <div className="product-info flex-grow-1">
                    <h6 className="product-title">{product.details?.title || 'Product Name'}</h6>
                    <div className="product-details">
                      <p className="mb-1"><strong>Size:</strong> {product.size}</p>
                      <p className="mb-1"><strong>Color:</strong> {product.color}</p>
                      <p className="mb-1"><strong>Quantity:</strong> {product.quantity}</p>
                      <p className="mb-1"><strong>Price:</strong> ${product.unitPrice}</p>
                      <p className="mb-1"><strong>Purchased on:</strong> {formatDate(product.orderDate)}</p>
                    </div>
                    
                    {reviewingProduct?.documentId === product.documentId ? (
                      <div className="review-form mt-3">
                        <div className="mb-3">
                          <label className="form-label"><strong>Rating:</strong></label>
                          <div className="rating-input d-flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="btn p-0 border-0 bg-transparent"
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                style={{ fontSize: '20px', color: star <= reviewForm.rating ? '#ffc107' : '#dee2e6' }}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label"><strong>Your Review:</strong></label>
                          <textarea
                            className="form-control"
                            rows="4"
                            value={reviewForm.comments}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                            placeholder="Share your experience with this product..."
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label"><strong>Add Photos (Optional):</strong></label>
                          <div className="photo-upload-section">
                            <input
                              type="file"
                              id={`photo-upload-${product.documentId}`}
                              accept="image/*"
                              multiple
                              onChange={handlePhotoUpload}
                              style={{ display: 'none' }}
                              disabled={uploadingPhoto || reviewForm.photos.length >= 5}
                            />
                            <label
                              htmlFor={`photo-upload-${product.documentId}`}
                              className="btn btn-outline-secondary mb-2"
                              style={{ 
                                cursor: uploadingPhoto || reviewForm.photos.length >= 5 ? 'not-allowed' : 'pointer',
                                opacity: uploadingPhoto || reviewForm.photos.length >= 5 ? 0.6 : 1
                              }}
                            >
                              {uploadingPhoto ? "Uploading..." : `📷 Add Photos (${reviewForm.photos.length}/5)`}
                            </label>
                            <small className="d-block text-muted mb-2">
                              Upload up to 5 photos (max 5MB each). Supported formats: JPG, PNG, GIF
                            </small>
                            
                            {reviewForm.photos.length > 0 && (
                              <div className="uploaded-photos d-flex flex-wrap gap-2">
                                {reviewForm.photos.map((photo, photoIndex) => (
                                  <div
                                    key={photoIndex}
                                    className="photo-preview position-relative"
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      border: '1px solid var(--line)',
                                      borderRadius: '4px',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <Image
                                      src={photo.previewUrl}
                                      alt={`Review photo ${photoIndex + 1}`}
                                      width={80}
                                      height={80}
                                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger position-absolute"
                                      style={{
                                        top: '2px',
                                        right: '2px',
                                        padding: '2px 6px',
                                        fontSize: '12px',
                                        lineHeight: '1'
                                      }}
                                      onClick={() => handleRemovePhoto(photoIndex)}
                                      title="Remove photo"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={handleSubmitReview}
                            disabled={submitting || !reviewForm.comments.trim() || uploadingPhoto}
                          >
                            {submitting ? "Submitting..." : "Submit Review"}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={handleCancelReview}
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-primary mt-3"
                        onClick={() => handleStartReview(product)}
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <h5>No products to review</h5>
            <p>You have already reviewed all your purchased products or haven't made any purchases yet.</p>
          </div>
        )}
      </div>
    </div>
  );
} 