"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";

const MobileMenu = React.memo(function MobileMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

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

  // Memoized navigation data generation for performance
  const navigationData = useMemo(() => {
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
  }, [collections, loading]);

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleSubmenu = useCallback((menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* Optimized submenu animations using transform instead of max-height */
        @keyframes submenuSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scaleY(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }
        
        @keyframes submenuSlideUp {
          from {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
          to {
            opacity: 0;
            transform: translateY(-8px) scaleY(0.8);
          }
        }
        
        /* CSS Classes for better performance */
        .mobile-menu-container {
          background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
          box-shadow: 0 25px 50px -12px rgba(24, 24, 24, 0.25);
          border-radius: 0 20px 20px 0;
          animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #E43131 0%, #C53030 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
          z-index: 1000;
          min-width: 44px;
          min-height: 44px;
          touch-action: manipulation;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .close-button:active {
          transform: scale(0.9);
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
        }
        
        .menu-content {
          padding-top: 80px;
          height: 100vh;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        .menu-body {
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .menu-header {
          margin-bottom: 32px;
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--line);
        }
        
        .menu-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--main);
          margin: 0;
          font-family: "Kumbh Sans", sans-serif;
        }
        
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .menu-item {
          margin-bottom: 12px;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s ease;
        }
        
        .menu-link {
          display: flex;
          align-items: center;
          padding: 18px 24px;
          font-size: 16px;
          font-weight: 500;
          color: var(--main);
          text-decoration: none;
          background: #F8FAFC;
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.2s ease;
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
          min-height: 56px;
        }
        
        .menu-link:hover, .menu-link:active {
          background: var(--primary-rgba-1);
          color: var(--primary);
          transform: translateY(-1px);
        }
        
        .category-container {
          display: flex;
          align-items: center;
          padding: 18px 24px;
          font-size: 16px;
          font-weight: 500;
          color: var(--main);
          background: #F8FAFC;
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.2s ease;
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
          justify-content: space-between;
          min-height: 56px;
        }
        
        .category-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          flex: 1;
          cursor: pointer;
        }
        
        .plus-icon {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary);
          cursor: pointer;
          padding: 4px;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
        
        .plus-icon.expanded {
          transform: rotate(45deg);
        }
        
        .submenu {
          background: #F1F5F9;
          border-radius: 8px;
          border: 1px solid var(--line);
          margin: 12px 0 0 0;
          padding: 12px;
          list-style: none;
          overflow: hidden;
          transform-origin: top;
          animation: submenuSlideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .submenu.exiting {
          animation: submenuSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .submenu-item {
          margin-bottom: 0;
        }
        
        .submenu-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 400;
          color: var(--secondary);
          text-decoration: none;
          background: transparent;
          border-radius: 8px;
          transition: all 0.15s ease;
          font-family: "Kumbh Sans", sans-serif;
          min-height: 44px;
        }
        
        .submenu-link:hover {
          background: var(--primary-rgba-05);
          color: var(--primary);
          transform: translateX(4px);
        }
        
        .submenu-bullet {
          margin-right: 8px;
          font-size: 12px;
        }
        
        .menu-item-enter {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        .menu-item-enter:nth-child(1) { animation-delay: 0.1s; }
        .menu-item-enter:nth-child(2) { animation-delay: 0.15s; }
        .menu-item-enter:nth-child(3) { animation-delay: 0.2s; }
        .menu-item-enter:nth-child(4) { animation-delay: 0.25s; }
        .menu-item-enter:nth-child(5) { animation-delay: 0.3s; }
        .menu-item-enter:nth-child(6) { animation-delay: 0.35s; }
        .menu-item-enter:nth-child(7) { animation-delay: 0.4s; }
        .menu-item-enter:nth-child(8) { animation-delay: 0.45s; }

        /* Menu Item Styles */
        .menu-item {
          margin-bottom: 8px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-link {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 500;
          color: var(--main);
          text-decoration: none;
          background: #F8FAFC;
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
          will-change: transform, background, box-shadow;
        }



        .category-container {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 500;
          color: var(--main);
          background: #F8FAFC;
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
          justify-content: space-between;
          will-change: transform, background, box-shadow;
        }



        .category-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          flex: 1;
          cursor: pointer;
        }

        .plus-icon {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary);
          cursor: pointer;
          padding: 4px;
        }

        .submenu {
          background: #F1F5F9;
          border-radius: 8px;
          border: 1px solid var(--line);
          margin: 8px 0 0 0;
          padding: 8px;
          list-style: none;
          overflow: hidden;
          animation: submenuSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top;
          will-change: transform, opacity;
        }

        .submenu-exit {
          animation: submenuSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Enhanced plus icon rotation */
        .plus-icon {
          font-size: 20px;
          font-weight: bold;
          color: var(--primary);
          cursor: pointer;
          padding: 4px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .plus-icon.expanded {
          transform: rotate(45deg);
        }

        /* Smooth category container transitions - already defined above */

        .submenu-item {
          margin-bottom: 4px;
        }

        .submenu-link {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 400;
          color: var(--secondary);
          text-decoration: none;
          background: transparent;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-family: "Kumbh Sans", sans-serif;
        }

        .submenu-link:hover {
          background: var(--primary-rgba-05);
          color: var(--primary);
          transform: translateX(4px);
        }

        .submenu-bullet {
          margin-right: 8px;
          font-size: 12px;
        }
        
        /* Enhanced Menu Item Styles */
        .auth-menu-item {
          margin-bottom: 8px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .auth-menu-link {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 500;
          color: var(--main);
          text-decoration: none;
          background: linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%);
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
          width: 100%;
          cursor: pointer;
        }
        

        
        .auth-menu-icon {
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .logout-menu-item {
          margin-bottom: 8px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logout-menu-button {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 500;
          color: #dc3545;
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          border: 1px solid #feb2b2;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          width: 100%;
        }
        

        
        .logout-icon {
          display: inline-block;
          margin-right: 4px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logout-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        
        .logout-user-email {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 400;
          text-transform: none;
        }
        
        .help-menu-item {
          margin-bottom: 8px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .help-menu-link {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 500;
          color: var(--main);
          text-decoration: none;
          background: linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%);
          border: 1px solid var(--line);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: "Kumbh Sans", sans-serif;
          position: relative;
          overflow: hidden;
        }
        

        
        .help-emoji {
          margin-right: 12px;
          font-size: 18px;
        }
      `}</style>
      
      <div className="offcanvas offcanvas-start canvas-mb mobile-menu-container" id="mobileMenu">
        <span
          className="icon-close icon-close-popup close-button"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
        
        <div className="mb-canvas-content menu-content">
          <div className="mb-body menu-body">
            <div className="mb-content-top">
              <div className="menu-header">
                <h2 className="menu-title">Menu</h2>
              </div>
              
              <ul className="nav-ul-mb nav-list" id="wrapper-menu-navigation">
                {/* Home */}
                <li className="menu-item-enter menu-item">
                  <div className="category-container">
                    <Link href="/" className="category-link">
                      <span>Home</span>
                    </Link>
                  </div>
                </li>

                {/* Women */}
                <li className="menu-item-enter menu-item">
                  <div className="category-container">
                    <Link href="/women" className="category-link">
                      <span>Women</span>
                    </Link>
                    {navigationData.women.length > 0 && (
                      <span 
                        className={`plus-icon ${expandedMenus.women ? 'expanded' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu('women');
                        }}
                      >
                        +
                      </span>
                    )}
                  </div>
                  
                  {navigationData.women.length > 0 && expandedMenus.women && (
                    <ul className="submenu">
                      {navigationData.women.map((collection) => (
                        <li key={collection.id} className="submenu-item">
                          <Link
                            href={`/collections/${collection.slug}`}
                            className="submenu-link"
                          >
                            <span className="submenu-bullet">•</span>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Men */}
                <li className="menu-item-enter menu-item">
                  <div className="category-container">
                    <Link href="/men" className="category-link">
                      <span>Men</span>
                    </Link>
                    {navigationData.men.length > 0 && (
                      <span 
                        className={`plus-icon ${expandedMenus.men ? 'expanded' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu('men');
                        }}
                      >
                        +
                      </span>
                    )}
                  </div>
                  
                  {navigationData.men.length > 0 && expandedMenus.men && (
                    <ul className="submenu">
                      {navigationData.men.map((collection) => (
                        <li key={collection.id} className="submenu-item">
                          <Link
                            href={`/collections/${collection.slug}`}
                            className="submenu-link"
                          >
                            <span className="submenu-bullet">•</span>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Kids */}
                <li className="menu-item-enter menu-item">
                  <div className="category-container">
                    <Link href="/kids" className="category-link">
                      <span>Kids</span>
                    </Link>
                    {navigationData.kids.length > 0 && (
                      <span 
                        className={`plus-icon ${expandedMenus.kids ? 'expanded' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu('kids');
                        }}
                      >
                        +
                      </span>
                    )}
                  </div>
                  
                  {navigationData.kids.length > 0 && expandedMenus.kids && (
                    <ul className="submenu">
                      {navigationData.kids.map((collection) => (
                        <li key={collection.id} className="submenu-item">
                          <Link
                            href={`/collections/${collection.slug}`}
                            className="submenu-link"
                          >
                            <span className="submenu-bullet">•</span>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Wishlist */}
                <li className="menu-item-enter" style={{
                  marginBottom: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <Link 
                    href="/wishlist" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'var(--main)',
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: '"Kumbh Sans", sans-serif',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >

                    <span>Wishlist</span>
                  </Link>
                </li>

                {/* My Account */}
                {session && (
                  <li className="menu-item-enter" style={{
                    marginBottom: '8px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <Link 
                      href="/my-account" 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 20px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'var(--main)',
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: '"Kumbh Sans", sans-serif',
                        position: 'relative',
                        overflow: 'hidden'
                      }}

                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          marginRight: '8px',
                          flexShrink: 0
                        }}
                      >
                        <path 
                          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <circle 
                          cx="12" 
                          cy="7" 
                          r="4" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>My Account</span>
                    </Link>
                  </li>
                )}

                {/* Login/Logout */}
                {!session ? (
                  <li className="menu-item-enter" style={{
                    marginBottom: '8px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <button 
                      onClick={() => signIn()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 20px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'var(--main)',
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: '"Kumbh Sans", sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                        width: '100%',
                        cursor: 'pointer'
                      }}

                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          marginRight: '4px',
                          flexShrink: 0
                        }}
                      >
                        <path 
                          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <circle 
                          cx="12" 
                          cy="7" 
                          r="4" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Login</span>
                    </button>
                  </li>
                ) : (
                  <li className="menu-item-enter" style={{
                    marginBottom: '8px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 20px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#dc3545',
                        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                        border: '1px solid #feb2b2',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: '"Kumbh Sans", sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        width: '100%'
                      }}

                    >
                      <svg
                        className="icon me-2"
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          display: 'inline-block',
                          marginRight: '4px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <path
                          d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="16,17 21,12 16,7"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <line
                          x1="21"
                          y1="12"
                          x2="9"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>Sign Out</span>
                        <span style={{ 
                          fontSize: '12px', 
                          opacity: '0.8', 
                          fontWeight: '400',
                          textTransform: 'none'
                        }}>({session.user?.email})</span>
                      </div>
                    </button>
                  </li>
                )}

                {/* Need Help */}
                <li className="menu-item-enter" style={{
                  marginBottom: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <Link 
                    href="/contact" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'var(--main)',
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: '"Kumbh Sans", sans-serif',
                      position: 'relative',
                      overflow: 'hidden'
                    }}

                  >
                    <span style={{
                      marginRight: '12px',
                      fontSize: '18px'
                    }}>💬</span>
                    <span>Need Help?</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="mb-other-content" style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '2px solid var(--line)'
            }}>
              {/* Visit Us Section */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--line)',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--main)',
                  marginBottom: '16px',
                  fontFamily: '"Kumbh Sans", sans-serif',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    marginRight: '8px',
                    fontSize: '18px'
                  }}>📍</span>
                  Visit Us
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: 'var(--secondary)',
                    fontFamily: '"Kumbh Sans", sans-serif'
                  }}>
                    <span style={{
                      marginRight: '12px',
                      fontSize: '16px'
                    }}>🏢</span>
                    <span>Kathmandu, Nepal</span>
                  </div>
                  <a 
                    href="#" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease',
                      fontFamily: '"Kumbh Sans", sans-serif'
                    }}
                  >
                    GET DIRECTION
                  </a>
                </div>
              </div>

              {/* Contact Us Section */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--line)',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--main)',
                  marginBottom: '16px',
                  fontFamily: '"Kumbh Sans", sans-serif',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    marginRight: '8px',
                    fontSize: '18px'
                  }}>📞</span>
                  Contact Us
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: 'var(--secondary)',
                    fontFamily: '"Kumbh Sans", sans-serif'
                  }}>
                    <span style={{
                      marginRight: '12px',
                      fontSize: '16px'
                    }}>✉️</span>
                    <a href="mailto:contact@traditionalalley.com.np" style={{
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>contact@traditionalalley.com.np</a>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: 'var(--secondary)',
                    fontFamily: '"Kumbh Sans", sans-serif'
                  }}>
                    <span style={{
                      marginRight: '12px',
                      fontSize: '16px'
                    }}>📱</span>
                    <a href="tel:9844594187" style={{
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>9844594187</a>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--line)'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--main)',
                  marginBottom: '16px',
                  fontFamily: '"Kumbh Sans", sans-serif',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Follow Us
                </h4>
                <ul className="tf-social-icon" style={{
                  display: 'flex',
                  gap: '4px',
                  justifyContent: 'center',
                  flexWrap: 'nowrap',
                  alignItems: 'center'
                }}>
                  <li>
                    <a href="https://www.facebook.com/traditionalalley555/" className="social-facebook" target="_blank" rel="noopener noreferrer" style={{
                      width: '36px',
                      height: '36px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--main)',
                      borderRadius: '50%',
                      color: 'var(--main)',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="icon icon-fb" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/_traditional_alley/" className="social-instagram" target="_blank" rel="noopener noreferrer" style={{
                      width: '36px',
                      height: '36px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--main)',
                      borderRadius: '50%',
                      color: 'var(--main)',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="icon icon-instagram" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.tiktok.com/@_traditional_alley?lang=en" className="social-tiktok" target="_blank" rel="noopener noreferrer" style={{
                      width: '36px',
                      height: '36px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--main)',
                      borderRadius: '50%',
                      color: 'var(--main)',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="icon icon-tiktok" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.pinterest.com/Traditionalley01/" className="social-pinterest" target="_blank" rel="noopener noreferrer" style={{
                      width: '36px',
                      height: '36px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--main)',
                      borderRadius: '50%',
                      color: 'var(--main)',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="icon icon-pinterest" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default MobileMenu;
