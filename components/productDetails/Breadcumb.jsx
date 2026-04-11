"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getVariantAwareTitle } from "../../utils/titleUtils";

export default function Breadcumb({ product }) {
  const pathname = usePathname();
  
  if (!product) {
    return null;
  }

  return (
    <div className="tf-breadcrumb">
      <div className="container">
        <div className="tf-breadcrumb-wrap">
          <div className="tf-breadcrumb-list">
            <Link href={`/`} className="text text-caption-1">
              Homepage
            </Link>
            <i className="icon icon-arrRight" />
            <Link href={`/collections`} className="text text-caption-1">
              Collections
            </Link>
            <i className="icon icon-arrRight" />
            <span className="text text-caption-1">{getVariantAwareTitle(product)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
