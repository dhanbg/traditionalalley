"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
// Removed Swiper imports - now using grid layout
import { fetchDataFromApi } from "@/utils/api";
import { API_URL, COLLECTIONS_API } from "@/utils/urls";
import { getBestImageUrl } from "@/utils/imageUtils";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetchDataFromApi(COLLECTIONS_API);
        if (!response || !response.data || !Array.isArray(response.data)) {
          setLoading(false);
          return;
        }

        // Filter collections by Women category relation from Strapi
        const filteredCollections = response.data.filter(item => {
          // Use the actual category relation from Strapi data
          const category = item.attributes?.category || item.category;
          if (category) {
            const categoryTitle = (category.data?.attributes?.title || category.title || "").toLowerCase();
            return categoryTitle === "women";
          }
          return false;
        });

        const transformedCollections = filteredCollections.map((item) => ({
          id: item.id,
          name: item.attributes?.name || item.name || "Unnamed Collection",
          slug: item.attributes?.slug || item.slug || `collection-${item.id}`,
          image: getBestImageUrl(item.attributes?.image || item.image) || "/logo.png",
        }));
        setCollections(transformedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <section className="flat-spacing-2">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">Explore Collections</h3>
          <p className="subheading">
            Discover our curated collections: handpicked styles for every occasion
          </p>
        </div>
        <div
          className="flat-collection-grid wow fadeInUp"
          data-wow-delay="0.1s"
        >
          <div className="collections-grid-container">
            <div className="row g-3">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-lg-3 col-md-4 col-sm-6 col-6 skeleton-collection-card">
                    <div className="collection-circle">
                      <div className="img-style radius-12 skeleton-media">
                        <div className="shimmer-effect" />
                      </div>
                      <div className="collection-content text-center mt-3 d-flex justify-content-center">
                        <div className="skeleton-title shimmer-effect" />
                      </div>
                    </div>
                  </div>
                ))
              ) : collections.length > 0 ? (
                collections.map((collection, index) => (
                  <div key={index} className="col-lg-3 col-md-4 col-sm-6 col-6">
                    <div className="collection-circle hover-img">
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="img-style radius-12"
                      >
                        <Image
                          className="lazyload"
                          data-src={collection.image}
                          alt="collection-img"
                          src={collection.image}
                          width={468}
                          height={624}
                          style={{ objectFit: "cover" }}
                          priority={index === 0 || collection.image.includes('p2_2215d1f166.jpg')}
                        />
                      </Link>
                      <div className="collection-content text-center">
                        <div>
                          <Link
                            href={`/collections/${collection.slug}`}
                            className="cls-title"
                          >
                            <h6 className="text">{collection.name}</h6>
                            <i className="icon icon-arrowUpRight" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-secondary">No collections available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ───── Skeleton Loading Styles ───── */
        .skeleton-collection-card {
          pointer-events: none;
        }

        .skeleton-media {
          background: #f0f2f5 !important;
          position: relative;
          overflow: hidden;
          aspect-ratio: 3/4;
          border-radius: 12px;
          width: 100%;
        }

        :global(html.dark) .skeleton-media {
          background: #1a1d26 !important;
        }

        .skeleton-title {
          height: 18px;
          width: 60%;
          background: #f0f2f5;
          border-radius: 4px;
        }

        :global(html.dark) .skeleton-title {
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
    </section>
  );
}
