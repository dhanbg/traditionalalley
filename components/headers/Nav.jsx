"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingLink, setLoadingLink] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch collections from backend
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections?populate=*');
        if (response.ok) {
          const data = await response.json();
          setCollections(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Transform collections into navigation structure
  const getNavigationData = () => {
    if (loading || !collections.length) {
      return {
        women: [],
        men: [],
        kids: []
      };
    }

    // Filter collections by category
    const womenCollections = collections.filter(collection => 
      collection.category?.title?.toLowerCase() === 'women'
    );
    const menCollections = collections.filter(collection => 
      collection.category?.title?.toLowerCase() === 'men'
    );
    const kidsCollections = collections.filter(collection => 
      collection.category?.title?.toLowerCase() === 'kids'
    );

    return {
      women: womenCollections.map(collection => ({
        name: collection.name || 'Unnamed Collection',
        slug: collection.slug || `collection-${collection.id}`,
        subcategories: [] // Collections don't have subcategories in this structure
      })),
      men: menCollections.map(collection => ({
        name: collection.name || 'Unnamed Collection',
        slug: collection.slug || `collection-${collection.id}`,
        subcategories: []
      })),
      kids: kidsCollections.map(collection => ({
        name: collection.name || 'Unnamed Collection',
        slug: collection.slug || `collection-${collection.id}`,
        subcategories: []
      }))
    };
  };

  const handleCategoryClick = (href, linkId) => {
    setLoadingLink(linkId);
    router.push(href);
    // Reset loading state after navigation
    setTimeout(() => setLoadingLink(null), 1000);
  };

  const renderCollectionsList = (collectionsData) => {
    if (loading) {
      return (
        <div className="list-categories-inner">
          <ul>
            <li className="sub-categories2">
              <div className="categories-item loading">
                <span className="inner-left">Loading...</span>
                <div className="nav-loading-spinner"></div>
              </div>
            </li>
          </ul>
        </div>
      );
    }

    if (!collectionsData.length) {
      return (
        <div className="list-categories-inner">
          <ul>
            <li className="sub-categories2">
              <div className="categories-item">
                <span className="inner-left">No collections available</span>
              </div>
            </li>
          </ul>
        </div>
      );
    }

    return (
      <div className="list-categories-inner">
        <ul>
          {collectionsData.map((collection, index) => {
            const collectionLinkId = `collection-${collection.slug}`;
            const collectionHref = `/collections/${collection.slug}`;
            
            return (
              <li className="sub-categories2" key={index}>
                <div 
                  className={`categories-item ${loadingLink === collectionLinkId ? 'loading' : ''}`}
                  onClick={() => handleCategoryClick(collectionHref, collectionLinkId)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="inner-left">{collection.name}</span>
                  {loadingLink === collectionLinkId ? (
                    <div className="nav-loading-spinner"></div>
                  ) : (
                    <i className="icon icon-arrRight" />
                  )}
                </div>
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

      {/* Women Collections */}
      <li className={pathname.startsWith("/women") || pathname.startsWith("/collections") ? "active" : ""}>
        <div className="tf-list-categories">
          <div 
            className={`categories-title ${loadingLink === 'main-women' ? 'loading' : ''}`}
            onClick={() => handleCategoryClick('/women', 'main-women')}
            style={{ cursor: 'pointer' }}
          >
            <span className="item-link">Women</span>
            {loadingLink === 'main-women' && <div className="nav-loading-spinner"></div>}
          </div>
          {renderCollectionsList(getNavigationData().women)}
        </div>
      </li>

      {/* Men Collections */}
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
          {renderCollectionsList(getNavigationData().men)}
        </div>
      </li>

      {/* Kids Collections */}
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
          {renderCollectionsList(getNavigationData().kids)}
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
