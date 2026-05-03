"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
// Removed Swiper imports - now using grid layout
import { fetchDataFromApi } from "@/utils/api";
import { API_URL, COLLECTIONS_API } from "@/utils/urls";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetchDataFromApi(COLLECTIONS_API);
        if (!response || !response.data || !Array.isArray(response.data)) {
          return;
        }

        // Filter collections securely using structural slug definitions to bypass Strapi 5 missing relations
        const kidsSlugs = ['events', 'kids'];
        const filteredCollections = response.data.filter(item => {
          const slug = (item.slug || item.attributes?.slug || '').toLowerCase();
          return kidsSlugs.includes(slug) || (item.category && item.category.title === "Kids");
        });
        
        const transformedCollections = filteredCollections.map((item) => ({
          id: item.id,
          name: item.attributes?.name || item.name || "Unnamed Collection",
          slug: item.attributes?.slug || item.slug || `collection-${item.id}`,
          image: getBestImageUrl(item.attributes?.image || item.image) || "/logo.png",
        }));
        setCollections(transformedCollections);
      } catch (error) {
        // Silently handle error
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
            Browse our Top Trending: the hottest picks loved by all.
          </p>
        </div>
        <div
          className="flat-collection-grid wow fadeInUp"
          data-wow-delay="0.1s"
        >
          <div className="collections-grid-container">
            <div className="row g-3">
              {collections.length > 0 ? (
                collections.map((collection, index) => (
                  <div key={collection.id} className="col-lg-3 col-md-4 col-sm-6 col-6">
                    <div className="collection-circle hover-img">
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="img-style radius-12"
                      >
                        <Image
                          className="lazyload"
                          data-src={collection.image}
                          alt={`${collection.name} collection`}
                          src={collection.image}
                          width={468}
                          height={624}
                          style={{ objectFit: "cover" }}
                        />
                      </Link>
                      <div className="collection-content text-center">
                        <div>
                          <Link href={`/collections/${collection.slug}`} className="cls-title">
                            <h6 className="text">{collection.name}</h6>
                            <i className="icon icon-arrowUpRight" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="collection-circle hover-img">
                    <div className="img-style radius-12 d-flex align-items-center justify-content-center" style={{backgroundColor: '#f5f5f5', height: '300px'}}>
                      <span>No kids collections available</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
