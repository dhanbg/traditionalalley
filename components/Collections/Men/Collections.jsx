"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Navigation, Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetchDataFromApi("/api/collections?populate=*");
        // Filter collections to only include those with category.title === "Men"
        const filteredCollections = response.data.filter(item => 
          item.category && item.category.title === "Men"
        );
        
        const transformedCollections = filteredCollections.map((item) => ({
          id: item.id,
          name: item.attributes?.name || item.name || "Unnamed Collection",
          slug: item.attributes?.slug || item.slug || `collection-${item.id}`,
          image: getImageUrl(item),
        }));
        setCollections(transformedCollections);
      } catch (error) {
        // Silently handle error
      }
    };

    // Helper function to extract the correct image URL
    const getImageUrl = (item) => {
      // For attributes-based structure (Strapi v4)
      if (item.attributes?.image?.data?.attributes) {
        const imageData = item.attributes.image.data.attributes;
        // Use medium format if available, otherwise use the main URL
        const imageUrl = imageData.formats?.medium?.url || imageData.url;
        return imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;
      }
      
      // For direct structure
      if (item.image) {
        // Use medium format if available, otherwise use the main URL
        const imageUrl = item.image.formats?.medium?.url || item.image.url;
        return imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;
      }
      
      return "/placeholder.jpg";
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
              {collections.map((collection, index) => (
                <SwiperSlide key={index}>
                  <div className="collection-circle hover-img">
                    <Link
                      href={`/shop-default-grid-men?collectionId=${collection.id}`}
                      className="img-style radius-12"
                    >
                      <Image
                        className="lazyload"
                        data-src={collection.image}
                        alt="collection-img"
                        src={collection.image}
                        width={468}
                        height={624}
                        style={{ height: "300px", objectFit: "cover" }}
                        priority={index === 0}
                      />
                    </Link>
                    <div className="collection-content text-center">
                      <div>
                        <Link href={`/shop-default-grid-men?collectionId=${collection.id}`} className="cls-title">
                          <h6 className="text">{collection.name}</h6>
                          <i className="icon icon-arrowUpRight" />
                        </Link>
                      </div>
                      {/* <div className="count text-secondary">
                        {collection.itemCount} items
                      </div> */}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
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
