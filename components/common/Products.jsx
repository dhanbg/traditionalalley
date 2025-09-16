"use client";
import ProductCard1 from "@/components/productCards/ProductCard1";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProductsWithVariantsForTabs } from "@/utils/productVariantUtils";

const tabItems = ["Boss Lady", "Juvenile", "Events", "Gown", "Kurtha"];
const DEFAULT_IMAGE = '/logo.png';

export default function Products({ parentClass = "flat-spacing-3 pt-0" }) {
  const [activeItem, setActiveItem] = useState(tabItems[0]); // Default the first item as active
  const [selectedItems, setSelectedItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products with variants from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Use the new utility to fetch products with their variants as separate items
        const productsWithVariants = await fetchProductsWithVariantsForTabs("Women");
        
        if (productsWithVariants && productsWithVariants.length > 0) {
          // Filter out inactive products and variants
          const activeItems = productsWithVariants.filter(item => item.isActive !== false);
          
          setAllProducts(activeItems);
          setError(null);
        } else {
          // Set an error if no products were found
          setError("No women's products found in API response");
          setAllProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        setError(`Error fetching products with variants: ${error.message || "Unknown error"}`);
        setAllProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const newArrivalsElement = document.getElementById("newArrivals2");
    if (newArrivalsElement) {
      newArrivalsElement.classList.remove("filtered");
      
      setTimeout(() => {
        const filtered = allProducts.filter(product => 
          product.tabFilterOptions && product.tabFilterOptions.includes(activeItem) &&
          product.isActive === true // Hide products that are inactive
        );
        setSelectedItems(filtered);
        newArrivalsElement.classList.add("filtered");
      }, 300);
    }
  }, [activeItem, allProducts]);

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h3>Women's Top Picks</h3>
          <ul className="tab-product-v2 justify-content-sm-center">
            {tabItems.map((item) => (
              <li key={item} className="nav-tab-item">
                <a
                  className={activeItem === item ? "active" : ""}
                  onClick={() => setActiveItem(item)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flat-animate-tab">
          <div className="tab-content">
            <div
              className="tab-pane active show tabFilter filtered"
              id="newArrivals2"
              role="tabpanel"
            >
              {loading ? (
                <div className="text-center py-5">Loading products...</div>
              ) : error ? (
                <div className="text-center py-5 text-danger">
                  {error}
                </div>
              ) : (
                <>
                  <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
                    {selectedItems.length > 0 ? (
                      selectedItems.map((product, i) => (
                        <ProductCard1 key={i} product={product} />
                      ))
                    ) : (
                      <div className="col-12 text-center py-5">No products found for {activeItem}</div>
                    )}
                  </div>
                  <div className="sec-btn text-center">
                    <Link href={`/women`} className="btn-line">
                      View All Products
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
