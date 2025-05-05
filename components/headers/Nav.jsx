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
              <Link 
                href={`/${category.slug ? category.slug : category.name.toLowerCase().replace(/\s+/g, '-')}`} 
                className="categories-item"
              >
                <span className="inner-left">{category.name}</span>
                <i className="icon icon-arrRight" />
              </Link>
              <ul className="list-categories-inner">
                {category.subcategories.map((subcategory, subIndex) => (
                  <li key={subIndex}>
                    <Link 
                      href={`/${category.slug ? category.slug : category.name.toLowerCase().replace(/\s+/g, '-')}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="categories-item"
                    >
                      <span className="inner-left">{subcategory}</span>
                    </Link>
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
      <style jsx global>{`
        .tf-list-categories .categories-title:hover .item-link {
          color: #e53637;
          transition: all 0.3s ease;
        }
        .categories-item:hover {
          background-color: #f9f9f9;
        }
        .categories-item:hover .inner-left {
          color: #e53637;
          transform: translateX(3px);
          transition: all 0.3s ease;
        }
      `}</style>
      
      <li className={`menu-item ${pathname === "/" ? "active" : ""} `}>
        <Link href="/" className="item-link">
          Home
        </Link>
      </li>

      {/* Women Categories */}
      <li className={pathname.startsWith("/women") ? "active" : ""}>
        <div className="tf-list-categories">
          <Link href="/women" className="categories-title">
            <span className="item-link">Women</span>
          </Link>
          {renderCategoryList(categoriesData.women)}
        </div>
      </li>

      {/* Men Categories */}
      <li className={pathname.startsWith("/men") ? "active" : ""}>
        <div className="tf-list-categories">
          <Link href="/men" className="categories-title">
            <span className="item-link">Men</span>
          </Link>
          {renderCategoryList(categoriesData.men)}
        </div>
      </li>

      {/* Kids Categories */}
      <li className={pathname.startsWith("/kids") ? "active" : ""}>
        <div className="tf-list-categories">
          <Link href="/kids" className="categories-title">
            <span className="item-link">Kids</span>
          </Link>
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
