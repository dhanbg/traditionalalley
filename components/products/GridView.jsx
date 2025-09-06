import React from "react";
import ProductCard1 from "../productCards/ProductCard1";
import Pagination from "../common/Pagination";

export default function GridView({ products = [], pagination = true }) {
  return (
    <>
      {products && products.length > 0 ? products.map((product, index) => (
        <ProductCard1 key={index} product={product} gridClass="grid" />
      )) : (
        <div className="text-center py-8">
          <p>No products found.</p>
        </div>
      )}
      {/* pagination */}
      {pagination ? (
        <ul className="wg-pagination justify-content-center">
          <Pagination />
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
