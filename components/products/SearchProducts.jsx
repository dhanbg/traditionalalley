"use client";
import React, { useState, useEffect } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard1 from "../productCards/ProductCard1";
import Link from "next/link";
import { fetchProductsWithVariants, searchProductsWithVariants } from "@/utils/productVariantUtils";
import { PRODUCT_POPULATE } from "@/utils/urls";
import { useSearchParams, useRouter } from "next/navigation";

export default function SearchProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("query") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchInput, setSearchInput] = useState(queryParam);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Sync state with URL query
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Fetch recent products for recommendations
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const apiEndpoint = `/api/products?sort[0]=createdAt:desc&pagination[limit]=4&${PRODUCT_POPULATE}`;
        const data = await fetchProductsWithVariants(apiEndpoint);
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching recent products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentProducts();
  }, []);

  // Fetch search results when queryParam changes
  useEffect(() => {
    const performSearch = async () => {
      if (!queryParam.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      try {
        const results = await searchProductsWithVariants(queryParam);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    performSearch();
  }, [queryParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search-result?query=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push(`/search-result`);
    }
  };

  return (
    <>
      {/* search */}
      <section className="flat-spacing page-search-inner">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <form
                className="form-search"
                onSubmit={handleSearchSubmit}
              >
                <fieldset className="text">
                  <input
                    type="text"
                    placeholder="Searching..."
                    className=""
                    name="text"
                    tabIndex={0}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-required="true"
                    required
                  />
                </fieldset>
                <button className="" type="submit">
                  <svg
                    className="icon"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21.35 21.0004L17 16.6504"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
              <div className="tf-col-quicklink">
                <span className="title">Quick link:</span>
                <Link className="link" href={`/search-result?query=Fashion`}>
                  Fashion
                </Link>
                ,
                <Link className="link" href={`/search-result?query=Men`}>
                  Men
                </Link>
                ,
                <Link className="link" href={`/search-result?query=Women`}>
                  Women
                </Link>
                ,
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /search */}

      {/* Search results */}
      {queryParam.trim() !== "" && (
        <section className="flat-spacing pt-0">
          <div className="container">
            <div className="heading-section text-center mb_24">
              <h3 className="heading">
                {searchLoading 
                  ? `Searching for "${queryParam}"...` 
                  : searchResults.length > 0 
                    ? `Search Results for "${queryParam}" (${searchResults.length})` 
                    : `No Results for "${queryParam}"`
                }
              </h3>
            </div>

            {searchLoading ? (
              <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={`search-skeleton-${i}`} className="card-product skeleton-card">
                    <div className="card-product-wrapper skeleton-media">
                      <div className="shimmer-effect" />
                    </div>
                    <div className="card-product-info">
                      <div className="skeleton-title shimmer-effect" />
                      <div className="skeleton-price shimmer-effect" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
                {searchResults.map((product, i) => (
                  <ProductCard1 key={product.id || i} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-5 border rounded bg-light shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="mb-3">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                      stroke="#888888"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4 className="fw-semibold text-dark mb-2">No products found</h4>
                <p className="text-muted mb-1">We couldn't find any products matching your search term.</p>
                <p className="text-muted mb-0">Please check spelling or try using different keywords.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Top pick */}
      <section className="flat-spacing pt-0">
        <div className="container">
          <div className="heading-section text-center wow fadeInUp">
            <h3 className="heading">Product Recent</h3>
          </div>
          <Swiper
            className="swiper tf-sw-latest"
            dir="ltr"
            spaceBetween={15}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 15 },
              768: { slidesPerView: 3, spaceBetween: 30 },
              1200: { slidesPerView: 4, spaceBetween: 30 },
            }}
            modules={[Pagination]}
            pagination={{
              clickable: true,
              el: ".spd4",
            }}
          >
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <SwiperSlide key={`skeleton-${i}`} className="swiper-slide">
                  <div className="card-product skeleton-card">
                    <div className="card-product-wrapper skeleton-media">
                      <div className="shimmer-effect" />
                    </div>
                    <div className="card-product-info">
                      <div className="skeleton-title shimmer-effect" />
                      <div className="skeleton-price shimmer-effect" />
                    </div>
                  </div>
                </SwiperSlide>
              ))
            ) : products.length > 0 ? (
              products.map((product, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                  <ProductCard1 product={product} />
                </SwiperSlide>
              ))
            ) : (
              <div className="w-100 text-center py-4">
                <p className="text-secondary">No recent products found.</p>
              </div>
            )}

            <div className="sw-pagination-latest spd4  sw-dots type-circle justify-content-center" />
          </Swiper>
        </div>
      </section>

      <style jsx>{`
        /* ───── Skeleton Loading Styles ───── */
        .skeleton-card {
          pointer-events: none;
          box-shadow: none !important;
          background: transparent !important;
        }

        .skeleton-media {
          background: #f0f2f5 !important;
          position: relative;
          overflow: hidden;
          aspect-ratio: 3/4;
          border-radius: 12px;
        }

        :global(html.dark) .skeleton-media {
          background: #1a1d26 !important;
        }

        .skeleton-title {
          height: 18px;
          width: 70%;
          background: #f0f2f5;
          border-radius: 4px;
          margin-top: 12px;
          margin-bottom: 8px;
        }

        :global(html.dark) .skeleton-title {
          background: #1a1d26;
        }

        .skeleton-price {
          height: 14px;
          width: 40%;
          background: #f0f2f5;
          border-radius: 4px;
        }

        :global(html.dark) .skeleton-price {
          background: #1a1d26;
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        .shimmer-effect::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
          transform: translateX(-100%);
          animation: shimmer-anim 1.5s infinite;
        }

        :global(html.dark) .shimmer-effect::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }

        @keyframes shimmer-anim {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}
