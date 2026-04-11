"use client";

import { useState, useEffect } from "react";
import { fetchDataFromApi } from "@/utils/api";
import { transformProductForListing } from "@/utils/productVariantUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard1 from "../productCards/ProductCard1";
import { Pagination } from "swiper/modules";

// Transform product data from API to match expected format
const transformProduct = (rawProduct) => {
  if (!rawProduct) return null;
  
  const productObj = {
    id: rawProduct.id,
    documentId: rawProduct.documentId,
    title: rawProduct.title || rawProduct.attributes?.title || 'Untitled Product',
    imgSrc: rawProduct.imgSrc || rawProduct.attributes?.imgSrc || '/logo.png',
    imgHover: rawProduct.imgHover || rawProduct.attributes?.imgHover || null,
    gallery: rawProduct.gallery || rawProduct.attributes?.gallery || [],
    colors: rawProduct.colors || rawProduct.attributes?.colors || [],
    price: rawProduct.price || rawProduct.attributes?.price || 0,
    oldPrice: rawProduct.oldPrice || rawProduct.attributes?.oldPrice || null,
    isOnSale: !!rawProduct.oldPrice || !!rawProduct.attributes?.oldPrice,
    salePercentage: rawProduct.salePercentage || rawProduct.attributes?.salePercentage || "25%",
    weight: rawProduct.weight || rawProduct.attributes?.weight || null,
    size_stocks: rawProduct.size_stocks || rawProduct.attributes?.size_stocks
  };
  
  // Use isActive from the API - treat null or undefined as inactive
  productObj.isActive = rawProduct.isActive === true;
  
  return productObj;
};

export default function RecentProducts() {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch recent products from API - get 8 products to show
        const response = await fetchDataFromApi(`/api/products?pagination[limit]=8&populate=*&sort=createdAt:desc`);
        
        if (response.data && response.data.length > 0) {
          // Transform and filter active products
          const transformedProducts = response.data
            .map(transformProduct)
            .filter(Boolean)
            .filter(product => product.isActive === true);
          
          setRecentProducts(transformedProducts);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  return (
    <section className="flat-spacing pt-0">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h4 className="heading">You may also like</h4>
        </div>
        {loading ? (
          <div className="text-center py-4">Loading products...</div>
        ) : recentProducts.length > 0 ? (
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
              el: ".spd79",
            }}
          >
            {recentProducts.map((product, i) => (
              <SwiperSlide key={i} className="swiper-slide">
                <ProductCard1 product={product} />
              </SwiperSlide>
            ))}

            <div className="sw-pagination-latest sw-dots type-circle justify-content-center spd79" />
          </Swiper>
        ) : (
          <div className="text-center py-4">No products available</div>
        )}
      </div>
    </section>
  );
}
