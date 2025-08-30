"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Navigation, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch collections from backend
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections?populate=*');
        if (response.ok) {
          const data = await response.json();
          setCollections(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
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
            Browse our Top Trending: the hottest picks loved by all.
          </p>
        </div>
        <div
          className="flat-collection-circle wow fadeInUp"
          data-wow-delay="0.1s"
        >
          <div dir="ltr" className="swiper tf-sw-collection">
            <Swiper
              slidesPerView={5} // For default screens (large screens)
              spaceBetween={15} // Default space between slides
              breakpoints={{
                1200: {
                  slidesPerView: 5, // For large screens
                  spaceBetween: 20, // Larger space on larger screens
                },
                992: {
                  slidesPerView: 4, // For medium (tablet) screens
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3, // For mobile screens
                  spaceBetween: 15,
                },
                0: {
                  slidesPerView: 2, // For mobile screens
                  spaceBetween: 15,
                },
              }}
              modules={[Pagination, Navigation]}
              pagination={{
                clickable: true,
                el: ".spd8",
              }}
              navigation={{
                prevEl: ".snbp3",
                nextEl: ".snbn3",
              }}
            >
              {loading ? (
                <SwiperSlide>
                  <div className="collection-circle hover-img">
                    <div className="img-style radius-12 d-flex align-items-center justify-content-center" style={{backgroundColor: '#f5f5f5'}}>
                      <span>Loading collections...</span>
                    </div>
                  </div>
                </SwiperSlide>
              ) : collections.length > 0 ? (
                collections.map((collection, index) => {
                  const collectionName = collection.name || 'Unnamed Collection';
                  const collectionSlug = collection.slug || `collection-${collection.id}`;
                  const collectionImage = collection.image?.url || '/images/collections/default.jpg';
                  
                  return (
                    <SwiperSlide key={collection.id}>
                      <div className="collection-circle hover-img">
                        <Link
                          href={`/collections/${collectionSlug}`}
                          className="img-style radius-12"
                        >
                          <Image
                            className="lazyload"
                            data-src={collectionImage}
                            alt={`${collectionName} collection`}
                            src={collectionImage}
                            width={468}
                            height={624}
                            style={{ objectFit: "cover" }}
                          />
                        </Link>
                        <div className="collection-content text-center">
                          <div>
                            <Link href={`/collections/${collectionSlug}`} className="cls-title">
                              <h6 className="text">{collectionName}</h6>
                              <i className="icon icon-arrowUpRight" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })
              ) : (
                <SwiperSlide>
                  <div className="collection-circle hover-img">
                    <div className="img-style radius-12 d-flex align-items-center justify-content-center" style={{backgroundColor: '#f5f5f5'}}>
                      <span>No collections available</span>
                    </div>
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
            <div className="d-flex d-lg-none sw-pagination-collection sw-dots type-circle justify-content-center spd8" />
          </div>
          <div className="nav-prev-collection d-none d-lg-flex nav-sw style-line nav-sw-left snbp3">
            <i className="icon icon-arrLeft" />
          </div>
          <div className="nav-next-collection d-none d-lg-flex nav-sw style-line nav-sw-right snbn3">
            <i className="icon icon-arrRight" />
          </div>
        </div>
      </div>
    </section>
  );
}
