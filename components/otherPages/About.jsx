"use client";
import React, { useState } from "react";
import Image from "next/image";
export default function About() {
  const [activeTab, setActiveTab] = useState(1);
  return (
    <section className="flat-spacing about-us-main pb_0">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="about-us-features wow fadeInLeft">
              <Image
                className="lazyload"
                data-src="/images/banner/about-us.jpg"
                alt="image-team"
                src="/images/banner/about-us.jpg"
                width={930}
                height={618}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="about-us-content">
              <h3 className="title wow fadeInUp">
                Traditional Alley – Timeless Fashion, Handcrafted in Nepal
              </h3>
              <div className="widget-tabs style-3">
                <ul className="widget-menu-tab wow fadeInUp">
                  <li
                    className={`item-title ${activeTab == 1 ? "active" : ""} `}
                    onClick={() => setActiveTab(1)}
                  >
                    <span className="inner text-button">Introduction</span>
                  </li>
                  <li
                    className={`item-title ${activeTab == 2 ? "active" : ""} `}
                    onClick={() => setActiveTab(2)}
                  >
                    <span className="inner text-button">Our Vision</span>
                  </li>
                  <li
                    className={`item-title ${activeTab == 3 ? "active" : ""} `}
                    onClick={() => setActiveTab(3)}
                  >
                    <span className="inner text-button">
                      What Sets Us Apart
                    </span>
                  </li>
                  <li
                    className={`item-title ${activeTab == 4 ? "active" : ""} `}
                    onClick={() => setActiveTab(4)}
                  >
                    <span className="inner text-button">Our Commitment</span>
                  </li>
                </ul>
                <div className="widget-content-tab wow fadeInUp">
                  <div
                    className={`widget-content-inner ${
                      activeTab == 1 ? "active" : ""
                    } `}
                  >
                    <p>
                      Traditional Alley is a designer fashion brand based in Nepal, committed to celebrating heritage through modern design. We produce, wholesale, and retail a wide range of garments crafted using traditional techniques and hand-based processes passed down through generations.
                    </p>
                    <p>
                      From everyday essentials to statement pieces for special events, our collections cater to all age groups—offering style, comfort, and cultural authenticity. Each piece is thoughtfully designed and handcrafted by skilled artisans, blending age-old craftsmanship with contemporary fashion sensibilities.
                    </p>
                    <p>
                      At Traditional Alley, we don't just make clothes—we preserve tradition, empower local artisans, and bring timeless Nepali artistry to wardrobes around the world.
                    </p>
                  </div>
                  <div
                    className={`widget-content-inner ${
                      activeTab == 2 ? "active" : ""
                    } `}
                  >
                    <p>
                      Our vision is to become the global ambassador of Nepali fashion heritage, making traditional craftsmanship accessible and relevant to modern consumers worldwide. We envision a future where every Traditional Alley piece tells a story of cultural pride and artistic excellence.
                    </p>
                    <p>
                      We aspire to bridge the gap between tradition and innovation, creating a sustainable fashion ecosystem that honors our ancestors' wisdom while embracing contemporary design sensibilities. Through our work, we aim to put Nepal on the global fashion map as a destination for authentic, handcrafted luxury.
                    </p>
                    <p>
                      Our ultimate goal is to ensure that traditional Nepali textiles like Dhaka, along with time-honored techniques, continue to thrive and evolve for future generations, while providing meaningful livelihoods for our skilled artisan community.
                    </p>
                  </div>
                  <div
                    className={`widget-content-inner ${
                      activeTab == 3 ? "active" : ""
                    } `}
                  >
                    <p>
                      <strong>Authentic Heritage Craftsmanship:</strong> Every piece is handcrafted using traditional techniques passed down through generations, ensuring authenticity that machine-made fashion simply cannot replicate.
                    </p>
                    <p>
                      <strong>Cultural Storytelling:</strong> Each garment carries the rich narrative of Nepali culture, from the revival of Dhaka fabric to intricate hand-weaving processes that connect wearers to centuries of artistic tradition.
                    </p>
                    <p>
                      <strong>Artisan Empowerment:</strong> We work directly with skilled local artisans, ensuring fair wages and preserving traditional skills while creating sustainable livelihoods in rural communities.
                    </p>
                    <p>
                      <strong>Modern Versatility:</strong> Our designs seamlessly blend traditional elements with contemporary fashion, making heritage pieces suitable for both everyday wear and special occasions.
                    </p>
                  </div>
                  <div
                    className={`widget-content-inner ${
                      activeTab == 4 ? "active" : ""
                    } `}
                  >
                    <p>
                      <strong>Quality Excellence:</strong> We are committed to delivering exceptional quality in every stitch, ensuring that each piece meets the highest standards of craftsmanship and durability.
                    </p>
                    <p>
                      <strong>Cultural Preservation:</strong> We pledge to protect and promote Nepal's rich textile heritage, working tirelessly to keep traditional techniques alive and relevant for modern times.
                    </p>
                    <p>
                      <strong>Sustainable Practices:</strong> Our commitment extends to environmental responsibility through sustainable sourcing, ethical production methods, and supporting eco-friendly practices throughout our supply chain.
                    </p>
                    <p>
                      <strong>Customer Satisfaction:</strong> We promise to provide exceptional service, authentic products, and a meaningful connection to Nepali culture with every purchase, ensuring our customers feel proud to wear our creations.
                    </p>
                  </div>
                </div>
              </div>
              <a href="#" className="tf-btn btn-fill wow fadeInUp">
                <span className="text text-button">Read More</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
