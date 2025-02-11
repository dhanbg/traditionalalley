"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { categoriesData } from "@/data/catnames"; // Import the categories data

export default function Nav() {
  const pathname = usePathname();

  const renderCategoryList = (categoryData) => {
    return (
      <div className="list-categories-inner">
        <ul>
          {categoryData.map((category, index) => (
            <li className="sub-categories2" key={index}>
              <a href="#" className="categories-item">
                <span className="inner-left">{category.name}</span>
                <i className="icon icon-arrRight" />
              </a>
              <ul className="list-categories-inner">
                {category.subcategories.map((subcategory, subIndex) => (
                  <li key={subIndex}>
                    <a href="#" className="categories-item">
                      <span className="inner-left">{subcategory}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <li className={`menu-item ${pathname === "/" ? "active" : ""} `}>
        <Link href="/" className="item-link">
          Home
        </Link>
      </li>

      {/* Women Categories */}
      <li>
        <div className="tf-list-categories">
          <a href="#" className="categories-title">
            <span className="item-link">Women</span>
          </a>
          {renderCategoryList(categoriesData.women)}
        </div>
      </li>

      {/* Men Categories */}
      <li>
        <div className="tf-list-categories">
          <a href="#" className="categories-title">
            <span className="item-link">Men</span>
          </a>
          {renderCategoryList(categoriesData.men)}
        </div>
      </li>

      {/* Kids Categories */}
      <li>
        <div className="tf-list-categories">
          <a href="#" className="categories-title">
            <span className="item-link">Kids</span>
          </a>
          {renderCategoryList(categoriesData.kids)}
        </div>
      </li>

      {/* Blog List section */}
      <li
        className={`menu-item ${pathname.split("/")[1] === "blog-list" ? "active" : ""} `}
      >
        <Link href="/blog-list" className="item-link">
          Blogs
        </Link>
      </li>
    </>
  );
}
