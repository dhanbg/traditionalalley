"use client";
import React, { useEffect, useState } from "react";
import ProductCard1 from "@/components/productCards/ProductCard1";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { fetchProductsWithVariants } from "@/utils/productVariantUtils";

const DEFAULT_IMAGE = '/logo.png';

export default function TopPicksPage() {
  const [topPicksData, setTopPicksData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch top picks data from the backend
  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setLoading(true);
        
        const response = await fetchDataFromApi('/api/top-picks?populate=*');
        
        if (response && response.data && response.data.length > 0) {
          const topPicksItem = response.data[0]; // Get the first (and likely only) top picks entry
          
          if (topPicksItem.isActive && topPicksItem.products && topPicksItem.products.length > 0) {
            setTopPicksData(topPicksItem);
            
            // Fetch all products with their variants
            const allProductsWithVariants = [];
            
            for (const product of topPicksItem.products) {
              try {
                if (product.documentId) {
                  const apiEndpoint = `/api/products?filters[documentId][$eq]=${product.documentId}&populate=*`;
                  const productsWithVariants = await fetchProductsWithVariants(apiEndpoint);
                  allProductsWithVariants.push(...productsWithVariants);
                }
              } catch (error) {
                console.error(`Error fetching product with variants for ID ${product.documentId}:`, error);
              }
            }
            
            setProducts(allProductsWithVariants);
            setError(null);
          } else {
            setError("No active top picks found or no products in the top picks");
            setProducts([]);
          }
        } else {
          setError("No top picks data found in API response");
          setProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top picks:', error);
        setError(`Error fetching top picks: ${error.message || "Unknown error"}`);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchTopPicks();
  }, []);


  return (
    <>
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text text-caption-1">
                Homepage
              </Link>
              <i className="icon icon-arrRight" />
              <span className="text text-caption-1">Top Picks</span>
            </div>
          </div>
        </div>
      </div>
      <section className="flat-spacing">
        <div className="container">
          <div className="flat-title text-center">
            <span className="title wow fadeInUp" data-wow-delay="0s">
              {topPicksData?.heading || "Top Picks"}
            </span>
            {topPicksData?.subheading && (
              <p className="sub-title wow fadeInUp" data-wow-delay="0.1s">
                {topPicksData.subheading}
              </p>
            )}
          </div>
          
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop">
              <div className="grid-layout-shop">
                <div className="text-showing">
                  {loading ? (
                    "Loading..."
                  ) : (
                    `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`
                  )}
                </div>
              </div>
            </div>
            
            <div className="tf-grid-layout wrapper-shop tf-col-4" id="gridLayout">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <span className="top-picks-page-spinner" />
                  <style jsx>{`
                    .top-picks-page-spinner {
                      display: inline-block;
                      width: 60px;
                      height: 60px;
                      border: 6px solid #f3f3f3;
                      border-top: 6px solid #e43131;
                      border-radius: 50%;
                      animation: top-picks-page-spin 1s linear infinite;
                    }
                    @keyframes top-picks-page-spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : error ? (
                <div className="col-12 text-center py-5 text-danger">
                  <h4>Error Loading Top Picks</h4>
                  <p>{error}</p>
                </div>
              ) : products.length > 0 ? (
                products.map((product, i) => (
                  <ProductCard1 key={i} product={product} gridClass="grid" />
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <h4>No Top Picks Found</h4>
                  <p>There are currently no top picks products available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}