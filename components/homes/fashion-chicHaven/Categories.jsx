"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

export default function Collections() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchDataFromApi("/api/categories?populate=*");
        console.log(data); // Debugging API response
        const transformedCategories = data.data.map((item) => ({
          imgSrc: `${API_URL}${item.imgSrc[0]?.url || ""}`,
          alt: item.alt || "category-image",
          title: item.title || "",
          delay: item.delay || 0,
          imgWidth: item.imgWidth || 626,
          imgHeight: item.imgHeight || 833,
        }));
        setCategories(transformedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section-2 wow fadeInUp">
          <h3 className="heading">Explore</h3>
        </div>
        <Swiper
          spaceBetween={10}
          slidesPerView={3}
          breakpoints={{
            1024: { slidesPerView: 3, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            0: { slidesPerView: 1, spaceBetween: 10 },
          }}
          className="swiper tf-sw-categories"
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd39",
          }}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={category.id || index}>
              <div
                style={{ width: "80%", height: "100%" }}
                className="collection-position-2 style-2 hover-img wow fadeInUp"
                data-wow-delay={category.delay}
              >
                <a className="img-style">
                  <Image
                    className="lazyload"
                    data-src={category.imgSrc}
                    alt={category.alt}
                    src={category.imgSrc}
                    width={category.imgWidth}
                    height={category.imgHeight}
                    priority={index === 0 || category.imgSrc.includes('p2_2215d1f166.jpg')}
                  />
                </a>
                <div className="content">
                  <Link
                    href={`/${category.title.toLowerCase()}`}
                    className="cls-btn"
                  >
                    <h6 className="text">{category.title}</h6>
                    <i className="icon icon-arrowUpRight" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}

          <div className="sw-pagination-categories sw-dots type-circle justify-content-center spd39" />
        </Swiper>
      </div>
    </section>
  );
}
