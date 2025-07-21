import React, { Suspense } from 'react';
import Products from "@/components/products/Products";

export const metadata = {
  title: "Shop - Traditional Alley",
  description: "Browse our complete collection of traditional clothing and accessories",
};

export default function ShopDefaultGrid() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">Discover our complete collection of traditional clothing and accessories</p>
      </div>
      
      <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
        <Products />
      </Suspense>
    </div>
  );
}
