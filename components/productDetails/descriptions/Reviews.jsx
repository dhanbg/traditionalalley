"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ReviewSorting from "./ReviewSorting";
import { fetchDataFromApi } from "../../../utils/api";
import { PRODUCT_REVIEWS_API } from "../../../utils/urls";

export default function Reviews({ product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product || !product.documentId) return;
      
      try {
        setLoading(true);
        const response = await fetchDataFromApi(PRODUCT_REVIEWS_API(product.documentId));
        if (response && response.data) {
          setReviews(response.data);
          
          // Calculate ratings statistics
          const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          let totalRating = 0;
          
          response.data.forEach(review => {
            if (review.rating) {
              const rating = parseInt(review.rating);
              totalRating += rating;
              counts[rating] = (counts[rating] || 0) + 1;
            }
          });
          
          setRatingCounts(counts);
          setAverageRating(response.data.length > 0 ? (totalRating / response.data.length).toFixed(1) : 0);
        }
      } catch (error) {
        // Error fetching reviews - silently handle
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [product]);

  const totalReviewCount = Object.values(ratingCounts).reduce((a, b) => a + b, 0);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <>
      <div className="tab-reviews-heading">
        {" "}
        <div className="top">
          <div className="text-center">
            <div className="number title-display">{averageRating}</div>
            <div className="list-star">
              {[1, 2, 3, 4, 5].map((star) => (
                <i 
                  key={star} 
                  className={`icon icon-star ${star <= Math.round(averageRating) ? '' : 'empty'}`} 
                />
              ))}
            </div>
            <p>({totalReviewCount} Ratings)</p>
          </div>
          <div className="rating-score">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div className="item" key={rating}>
                <div className="number-1 text-caption-1">{rating}</div>
                <i className="icon icon-star" />
                <div className="line-bg">
                  <div 
                    style={{ 
                      width: totalReviewCount > 0 
                        ? `${(ratingCounts[rating] / totalReviewCount) * 100}%` 
                        : "0%" 
                    }} 
                  />
                </div>
                <div className="number-2 text-caption-1">{ratingCounts[rating]}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {/* Write a review button removed as requested */}
        </div>
      </div>
      <div className="reply-comment style-1 cancel-review-wrap">
        <div className="d-flex mb_24 gap-20 align-items-center justify-content-between flex-wrap">
          <h4 className="">{reviews.length} Comments</h4>
          <div className="d-flex align-items-center gap-12">
            <div className="text-caption-1">Sort by:</div>
            <ReviewSorting />
          </div>
        </div>
        <div className="reply-comment-wrap">
          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div className="reply-comment-item" key={review.id}>
                <div className="user">
                  <div className="image">
                    <Image
                      alt={review.user_data?.[0]?.firstName || "User"}
                      src={review.user_data?.[0]?.avatar || "/images/avatar/user-1.jpg"}
                      width={120}
                      height={120}
                    />
                  </div>
                  <div>
                    <h6>
                      <a href="#" className="link">
                        {review.user_data?.[0]?.firstName || "User"}
                        {review.user_data?.[0]?.lastName ? ` ${review.user_data[0].lastName}` : ""}
                      </a>
                    </h6>
                    <div className="day text-secondary-2 text-caption-1">
                      {new Date(review.createdAt).toLocaleDateString()} &nbsp;&nbsp;&nbsp;-
                      <span className="ms-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`icon icon-star ${star <= review.rating ? '' : 'inactive'}`}
                            style={{ fontSize: '1.25rem', color: star <= review.rating ? '#FF9900' : '#FFB400', opacity: star <= review.rating ? 1 : 0.2, marginRight: 2 }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-secondary">
                  {review.comments}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
