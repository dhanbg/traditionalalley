"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useContextElement } from "@/context/Context";
export default function LookbookProduct({ product, styleClass = "style-row" }) {

  return (
    <div className={`loobook-product ${styleClass} `}>
      <div className="img-style">
        <Image alt="img" src={product.imgSrc} width={151} height={151} />
      </div>
      <div className="content">
        <div className="info">
          <Link
            href={`/product-detail/${product.id}`}
            className="text-title text-line-clamp-1 link"
          >
            {product.title}
          </Link>
          <div className="price text-button">${product.price.toFixed(2)}</div>
        </div>
        <Link
          href={`/product-detail/${product.id}`}
          className="btn-lookbook btn-line"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}
