"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { fetchDataFromApi } from "@/utils/api";
import { COLLECTIONS_API } from "@/utils/urls";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch collections from backend
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await fetchDataFromApi(COLLECTIONS_API);
        setCollections(data.data || []);
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

    // Filter collections by valid structural slugs to bypass Strapi 5 missing relations
    const womenSlugs = ['graduation', 'kurtha', 'dresses', 'sareesets', 'corsets', 'gown', 'bosslady', 'lehenga', 'tops', 'coordinates'];
    const menSlugs = ['dauracoat', 'blazer', 'nepalidhaka'];
    const kidsSlugs = ['events', 'kids'];

    const womenCollections = collections.filter(collection => {
      const slug = (collection.slug || '').toLowerCase();
      return womenSlugs.includes(slug) || collection.category?.title?.toLowerCase() === 'women';
    });
    
    const menCollections = collections.filter(collection => {
      const slug = (collection.slug || '').toLowerCase();
      return menSlugs.includes(slug) || collection.category?.title?.toLowerCase() === 'men';
    });
    
    const kidsCollections = collections.filter(collection => {
      const slug = (collection.slug || '').toLowerCase();
      return kidsSlugs.includes(slug) || collection.category?.title?.toLowerCase() === 'kids';
    });

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
                <Link href={collectionHref} className="categories-item">
                  <span className="inner-left">{collection.name}</span>
                  <i className="icon icon-arrRight" />
                </Link>
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
          <div className="categories-title">
            <Link href="/women" className="item-link">Women</Link>
          </div>
          {renderCollectionsList(getNavigationData().women)}
        </div>
      </li>

      {/* Men Collections */}
      <li className={pathname.startsWith("/men") ? "active" : ""}>
        <div className="tf-list-categories">
          <div className="categories-title">
            <Link href="/men" className="item-link">Men</Link>
          </div>
          {renderCollectionsList(getNavigationData().men)}
        </div>
      </li>

      {/* Kids Collections - Hidden as no kids products available */}
      {/* <li className={pathname.startsWith("/kids") ? "active" : ""}>
        <div className="tf-list-categories">
          <div className="categories-title">
            <Link href="/kids" className="item-link">Kids</Link>
          </div>
          {renderCollectionsList(getNavigationData().kids)}
        </div>
      </li> */}

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
