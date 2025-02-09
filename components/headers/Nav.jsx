"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      <li className={`menu-item ${pathname === "/" ? "active" : ""} `}>
        <Link href="/" className="item-link">
          Home
        </Link>
      </li>

      {/* Blog List section */}
      <li
        className={`menu-item ${
          pathname.split("/")[1] === "blog-list" ? "active" : ""
        } `}
      >
        <Link href="/blog-list" className="item-link">
          Blogs
        </Link>
      </li>

      {/* About Us section */}
      <li
        className={`menu-item ${
          pathname.split("/")[1] === "about-us" ? "active" : ""
        } `}
      >
        <Link href="/about-us" className="item-link">
          About Us
        </Link>
      </li>
    </>
  );
}
