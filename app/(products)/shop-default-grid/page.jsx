import React, { Suspense } from 'react';
import Products from "@/components/products/Products";

export const metadata = {
  title: "Shop - Traditional Alley",
  description: "Browse our complete collection of traditional clothing and accessories",
};

export default function ShopDefaultGrid() {
  return (
    <>
      <div
        className="page-title"
        style={{ 
          backgroundImage: "url(/images/section/page-title.jpg)",
          height: "250px",
          minHeight: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div className="container" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%"
        }}>
          <h1 className="text-3xl font-bold text-white mb-2">All Products</h1>
          <p className="text-white">Discover our complete collection of traditional clothing and accessories</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        
        <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
          <Products />
        </Suspense>
      </div>
    </>
  );
}
