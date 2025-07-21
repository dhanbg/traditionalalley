"use client";
import React, { Suspense } from "react";
import Collections from "@/components/Collections/Women/Collections";

export default function CollectionsPage() {
  return (
    <div className="tf-page-title">
      <div className="container-full">
        <div className="heading text-center">Collections</div>
      </div>
      <Suspense fallback={<div>Loading collections...</div>}>
        <Collections />
      </Suspense>
    </div>
  );
}
