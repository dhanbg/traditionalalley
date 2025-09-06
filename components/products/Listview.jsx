import React from "react";
import ProductsCards6 from "../productCards/ProductsCards6";
import Pagination from "../common/Pagination";

export default function Listview({ products = [], pagination = true }) {
  return (
    <>
      {/* card product list 1 */}
      {products && products.length > 0 ? products.map((product, i) => (
        <ProductsCards6 product={product} key={i} />
      )) : (
        <div className="text-center py-8">
          <p>No products found.</p>
        </div>
      )}
      {/* pagination */}
      {pagination ? (
        <ul className="wg-pagination ">
          <Pagination />
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
