"use client";
import { blogPosts2 } from "@/data/blogs";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
export default function Blogs() {
  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3 className="heading">Cultural Fashion &amp; Styling Guides</h3>
          <p className="subheading text-secondary">
            Read expert styling tips, Nepali heritage stories, and modern ethnic fashion insights.
          </p>
        </div>
        <Swiper
          dir="ltr"
          className="swiper tf-sw-categories"
          spaceBetween={30}
          slidesPerView={2}
          breakpoints={{
            992: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
          }}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd44",
          }}
        >
          {blogPosts2.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className="new-item hover-img wow fadeInUp"
                data-wow-delay={item.wowDelay}
              >
                <div className="img-style">
                  <Image
                    alt={item.imgAlt || item.title}
                    src={item.imgSrc}
                    width={606}
                    height={404}
                  />
                </div>
                <div className="content">
                  <span className="text-btn-uppercase text-secondary-2">
                    {item.date}
                  </span>
                  <div className="title-box">
                    <h6 className="title">
                      <Link
                        href={`/blog-detail/${item.id}`}
                        className="link text-line-clamp-2"
                      >
                        {item.title}
                      </Link>
                    </h6>
                    <p className="text-line-clamp-2 desc">{item.desc}</p>
                  </div>
                  <Link
                    href={`/blog-detail/${item.id}`}
                    className="text-btn-uppercase link"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="sw-pagination-categories sw-dots type-circle justify-content-center spd44" />
        </Swiper>
      </div>
    </section>
  );
}
