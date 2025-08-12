"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileMenu() {
  const pathname = usePathname();
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
        id: collection.id
      })),
      men: menCollections.map(collection => ({
        name: collection.name || 'Unnamed Collection',
        slug: collection.slug || `collection-${collection.id}`,
        id: collection.id
      })),
      kids: kidsCollections.map(collection => ({
        name: collection.name || 'Unnamed Collection',
        slug: collection.slug || `collection-${collection.id}`,
        id: collection.id
      }))
    };
  };
  return (
    <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <div className="mb-content-top">
            <ul className="nav-ul-mb" id="wrapper-menu-navigation">
              <li
                style={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                  fontWeight: "470",
                  paddingBottom: "13px",
                  paddingTop: "13px",
                }}
              >
                <Link href="/">Home</Link>
              </li>

              {/* Women Category */}
              <li
                style={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                }}
                className="nav-mb-item"
              >
                <a
                  href="#dropdown-women"
                  className={`collapsed mb-menu-link ${
                    pathname.split("/")[1] === "women" ? "active" : ""
                  } `}
                  data-bs-toggle="collapse"
                  aria-expanded="true"
                  aria-controls="dropdown-women"
                >
                  <span>Women</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="dropdown-women" className="collapse">
                  <ul className="sub-nav-menu">
                    {loading ? (
                      <li>
                        <div className="sub-nav-link">
                          <span>Loading collections...</span>
                        </div>
                      </li>
                    ) : getNavigationData().women.length > 0 ? (
                      getNavigationData().women.map((collection, i) => (
                        <li key={collection.id}>
                          <Link
                            href={`/collections/${collection.slug}`}
                            className={`sub-nav-link ${
                              pathname.includes(`/collections/${collection.slug}`)
                                ? "active"
                                : ""
                            }`}
                          >
                            <span>{collection.name}</span>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="sub-nav-link">
                          <span>No collections available</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </li>

              {/* Men Category */}
              <li className="nav-mb-item">
                <a
                  href="#dropdown-men"
                  className={`collapsed mb-menu-link ${
                    pathname.split("/")[1] === "men" ? "active" : ""
                  } `}
                  data-bs-toggle="collapse"
                  aria-expanded="true"
                  aria-controls="dropdown-men"
                >
                  <span>Men</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="dropdown-men" className="collapse">
                  <ul className="sub-nav-menu">
                    {loading ? (
                      <li>
                        <div className="sub-nav-link">
                          <span>Loading collections...</span>
                        </div>
                      </li>
                    ) : getNavigationData().men.length > 0 ? (
                      getNavigationData().men.map((collection, i) => (
                        <li key={collection.id}>
                          <Link
                            href={`/collections/${collection.slug}`}
                            className={`sub-nav-link ${
                              pathname.includes(`/collections/${collection.slug}`)
                                ? "active"
                                : ""
                            }`}
                          >
                            <span>{collection.name}</span>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="sub-nav-link">
                          <span>No collections available</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </li>

              {/* Kids Category */}
              <li className="nav-mb-item">
                <a
                  href="#dropdown-kids"
                  className={`collapsed mb-menu-link ${
                    pathname.split("/")[1] === "kids" ? "active" : ""
                  } `}
                  data-bs-toggle="collapse"
                  aria-expanded="true"
                  aria-controls="dropdown-kids"
                >
                  <span>Kids</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="dropdown-kids" className="collapse">
                  <ul className="sub-nav-menu">
                    {loading ? (
                      <li>
                        <div className="sub-nav-link">
                          <span>Loading collections...</span>
                        </div>
                      </li>
                    ) : getNavigationData().kids.length > 0 ? (
                      getNavigationData().kids.map((collection, i) => (
                        <li key={collection.id}>
                          <Link
                            href={`/collections/${collection.slug}`}
                            className={`sub-nav-link ${
                              pathname.includes(`/collections/${collection.slug}`)
                                ? "active"
                                : ""
                            }`}
                          >
                            <span>{collection.name}</span>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="sub-nav-link">
                          <span>No collections available</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          <div className="mb-other-content">
            <div className="group-icon">
              <Link href={`/wish-list`} className="site-nav-icon">
                <svg
                  className="icon"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.8401 4.60987C20.3294 4.09888 19.7229 3.69352 19.0555 3.41696C18.388 3.14039 17.6726 2.99805 16.9501 2.99805C16.2276 2.99805 15.5122 3.14039 14.8448 3.41696C14.1773 3.69352 13.5709 4.09888 13.0601 4.60987L12.0001 5.66987L10.9401 4.60987C9.90843 3.57818 8.50915 2.99858 7.05012 2.99858C5.59109 2.99858 4.19181 3.57818 3.16012 4.60987C2.12843 5.64156 1.54883 7.04084 1.54883 8.49987C1.54883 9.95891 2.12843 11.3582 3.16012 12.3899L4.22012 13.4499L12.0001 21.2299L19.7801 13.4499L20.8401 12.3899C21.3511 11.8791 21.7565 11.2727 22.033 10.6052C22.3096 9.93777 22.4519 9.22236 22.4519 8.49987C22.4519 7.77738 22.3096 7.06198 22.033 6.39452C21.7565 5.72706 21.3511 5.12063 20.8401 4.60987V4.60987Z"
                    stroke="#181818"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Wishlist
              </Link>
              <Link href={`/login`} className="site-nav-icon">
                <svg
                  className="icon"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="#181818"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="#181818"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Login
              </Link>
            </div>
            <div className="mb-notice">
              <Link href={`/contact`} className="text-need">
                Need Help?
              </Link>
            </div>
            <div className="mb-contact">
              <p className="text-caption-1">
                44700 Hattiban, Lalitpur, Bagmati, Nepal
              </p>
              <Link
                href={`/contact`}
                className="tf-btn-default text-btn-uppercase"
              >
                GET DIRECTION
                <i className="icon-arrowUpRight" />
              </Link>
            </div>
            <ul className="mb-info">
              <li>
                <i className="icon icon-mail" />
                <p>traditionalalley.com.np</p>
              </li>
              <li>
                <i className="icon icon-phone" />
                <p>9812345678</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
