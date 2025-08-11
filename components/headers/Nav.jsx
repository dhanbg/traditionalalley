"use client";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { categoriesData } from "@/data/catnames"; // Import the categories data

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingLink, setLoadingLink] = useState(null);

  const handleCategoryClick = (href, linkId) => {
    setLoadingLink(linkId);
    router.push(href);
    // Reset loading state after navigation
    setTimeout(() => setLoadingLink(null), 1000);
  };

  const renderCategoryList = (categoryData) => {
    return (
      <div className="list-categories-inner">
        <ul>
          {categoryData.map((category, index) => {
            const categoryLinkId = `cat-${category.name.toLowerCase().replace(/\s+/g, '-')}`;
            const categoryHref = `/${category.slug ? category.slug : category.name.toLowerCase().replace(/\s+/g, '-')}`;
            
            return (
              <li className="sub-categories2" key={index}>
                <div 
                  className={`categories-item ${loadingLink === categoryLinkId ? 'loading' : ''}`}
                  onClick={() => handleCategoryClick(categoryHref, categoryLinkId)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="inner-left">{category.name}</span>
                  {loadingLink === categoryLinkId ? (
                    <div className="nav-loading-spinner"></div>
                  ) : (
                    <i className="icon icon-arrRight" />
                  )}
                </div>
                <ul className="list-categories-inner">
                  {category.subcategories.map((subcategory, subIndex) => {
                    const subLinkId = `sub-${category.name}-${subcategory}`.toLowerCase().replace(/\s+/g, '-');
                    const subHref = `/${category.slug ? category.slug : category.name.toLowerCase().replace(/\s+/g, '-')}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`;
                    
                    return (
                      <li key={subIndex}>
                        <div 
                          className={`categories-item ${loadingLink === subLinkId ? 'loading' : ''}`}
                          onClick={() => handleCategoryClick(subHref, subLinkId)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="inner-left">{subcategory}</span>
                          {loadingLink === subLinkId && (
                            <div className="nav-loading-spinner"></div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
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
        .categories-item.loading {
          background-color: #f0f8ff;
          opacity: 0.8;
          pointer-events: none;
        }
        .categories-title.loading {
          opacity: 0.8;
          pointer-events: none;
        }
        .nav-loading-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #e43131;
          border-radius: 50%;
          animation: navSpin 0.8s linear infinite;
          margin-left: 8px;
        }
        @keyframes navSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .categories-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
          <div 
            className={`categories-title ${loadingLink === 'main-women' ? 'loading' : ''}`}
            onClick={() => handleCategoryClick('/women', 'main-women')}
            style={{ cursor: 'pointer' }}
          >
            <span className="item-link">Women</span>
            {loadingLink === 'main-women' && <div className="nav-loading-spinner"></div>}
          </div>
          {renderCategoryList(categoriesData.women)}
        </div>
      </li>

      {/* Men Categories */}
      <li className={pathname.startsWith("/men") ? "active" : ""}>
        <div className="tf-list-categories">
          <div 
            className={`categories-title ${loadingLink === 'main-men' ? 'loading' : ''}`}
            onClick={() => handleCategoryClick('/men', 'main-men')}
            style={{ cursor: 'pointer' }}
          >
            <span className="item-link">Men</span>
            {loadingLink === 'main-men' && <div className="nav-loading-spinner"></div>}
          </div>
          {renderCategoryList(categoriesData.men)}
        </div>
      </li>

      {/* Kids Categories */}
      <li className={pathname.startsWith("/kids") ? "active" : ""}>
        <div className="tf-list-categories">
          <div 
            className={`categories-title ${loadingLink === 'main-kids' ? 'loading' : ''}`}
            onClick={() => handleCategoryClick('/kids', 'main-kids')}
            style={{ cursor: 'pointer' }}
          >
            <span className="item-link">Kids</span>
            {loadingLink === 'main-kids' && <div className="nav-loading-spinner"></div>}
          </div>
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
