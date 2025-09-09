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
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
        }
        
        .submenu-enter {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .submenu-exit {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .plus-icon {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .plus-icon.expanded {
          transform: rotate(45deg);
        }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        .menu-item-enter {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        .menu-item-enter:nth-child(1) { animation-delay: 0.1s; }
        .menu-item-enter:nth-child(2) { animation-delay: 0.2s; }
        .menu-item-enter:nth-child(3) { animation-delay: 0.3s; }
        .menu-item-enter:nth-child(4) { animation-delay: 0.4s; }
        .menu-item-enter:nth-child(5) { animation-delay: 0.5s; }
        .menu-item-enter:nth-child(6) { animation-delay: 0.6s; }
      `}</style>
      
      <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu" style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        boxShadow: '0 25px 50px -12px rgba(24, 24, 24, 0.25)',
        borderRadius: '0 20px 20px 0',
        animation: 'slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <span
          className="icon-close icon-close-popup"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #E43131 0%, #C53030 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            minWidth: '44px',
            minHeight: '44px',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
          onTouchStart={(e) => {
            e.target.style.transform = 'scale(0.9)';
            e.target.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)';
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = 'linear-gradient(135deg, #E43131 0%, #C53030 100%)';
            }, 150);
          }}
        />
        
        <div className="mb-canvas-content" style={{
          paddingTop: '80px',
          height: '100vh',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}>
          <div className="mb-body" style={{
            padding: '0 24px'
          }}>
            <div className="mb-content-top">
              <div style={{
                marginBottom: '32px',
                textAlign: 'center',
                paddingBottom: '24px',
                borderBottom: '2px solid var(--line)'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'var(--main)',
                  margin: '0',
                  fontFamily: '"Kumbh Sans", sans-serif'
                }}>Menu</h2>
              </div>
              
              <ul className="nav-ul-mb" id="wrapper-menu-navigation" style={{
                listStyle: 'none',
                padding: '0',
                margin: '0'
              }}>
                {/* Home */}
                <li className="menu-item-enter" style={{
                  marginBottom: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <Link 
                    href="/" 
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
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                      e.target.style.color = 'var(--primary)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                      e.target.style.color = 'var(--main)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onTouchStart={(e) => {
                      e.target.style.transform = 'scale(0.98)';
                      e.target.style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                    }}
                    onTouchEnd={(e) => {
                      setTimeout(() => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                      }, 150);
                    }}
                  >
                    <span>Home</span>
                  </Link>
                </li>

                {/* Women */}
                <li className="menu-item-enter" style={{
                  marginBottom: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'var(--main)',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: '"Kumbh Sans", sans-serif',
                      position: 'relative',
                      overflow: 'hidden',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Link 
                      href="/women"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: 1,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.closest('div').style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                        e.target.closest('div').style.color = 'var(--primary)';
                        e.target.closest('div').style.transform = 'translateY(-2px)';
                        e.target.closest('div').style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.closest('div').style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                        e.target.closest('div').style.color = 'var(--main)';
                        e.target.closest('div').style.transform = 'translateY(0)';
                        e.target.closest('div').style.boxShadow = 'none';
                      }}
                    >
                      <span>Women</span>
                    </Link>
                    {navigationData.women.length > 0 && (
                      <span 
                        className={`plus-icon ${expandedMenus.women ? 'expanded' : ''}`}
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
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
                    <ul 
                      className="submenu-enter"
                      style={{
                        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        margin: '8px 0 0 0',
                        padding: '8px',
                        listStyle: 'none',
                        overflow: 'hidden'
                      }}>
                      {navigationData.women.map((collection) => (
                        <li key={collection.id} style={{ marginBottom: '4px' }}>
                          <Link
                            href={`/collections/${collection.slug}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              fontSize: '14px',
                              fontWeight: '400',
                              color: 'var(--secondary)',
                              textDecoration: 'none',
                              background: 'transparent',
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              fontFamily: '"Kumbh Sans", sans-serif'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--primary-rgba-05)';
                              e.target.style.color = 'var(--primary)';
                              e.target.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = 'var(--secondary)';
                              e.target.style.transform = 'translateX(0)';
                            }}
                          >
                            <span style={{
                              marginRight: '8px',
                              fontSize: '12px'
                            }}>•</span>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Men */}
                <li className="menu-item-enter" style={{
                  marginBottom: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'var(--main)',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: '"Kumbh Sans", sans-serif',
                      position: 'relative',
                      overflow: 'hidden',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Link 
                      href="/men"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: 1,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.closest('div').style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                        e.target.closest('div').style.color = 'var(--primary)';
                        e.target.closest('div').style.transform = 'translateY(-2px)';
                        e.target.closest('div').style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.closest('div').style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                        e.target.closest('div').style.color = 'var(--main)';
                        e.target.closest('div').style.transform = 'translateY(0)';
                        e.target.closest('div').style.boxShadow = 'none';
                      }}
                    >
                      <span>Men</span>
                    </Link>
                    {navigationData.men.length > 0 && (
                      <span 
                        className={`plus-icon ${expandedMenus.men ? 'expanded' : ''}`}
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
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
                    <ul 
                      className="submenu-enter"
                      style={{
                        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        margin: '8px 0 0 0',
                        padding: '8px',
                        listStyle: 'none',
                        overflow: 'hidden'
                      }}>
                      {navigationData.men.map((collection) => (
                        <li key={collection.id} style={{ marginBottom: '4px' }}>
                          <Link
                            href={`/collections/${collection.slug}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              fontSize: '14px',
                              fontWeight: '400',
                              color: 'var(--secondary)',
                              textDecoration: 'none',
                              background: 'transparent',
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              fontFamily: '"Kumbh Sans", sans-serif'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--primary-rgba-05)';
                              e.target.style.color = 'var(--primary)';
                              e.target.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = 'var(--secondary)';
                              e.target.style.transform = 'translateX(0)';
                            }}
                          >
                            <span style={{
                              marginRight: '8px',
                              fontSize: '12px'
                            }}>•</span>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Kids - Hidden as no kids products available */}
                {/* <li className="menu-item-enter" style={{
                  marginBottom: '8px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'var(--main)',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: '"Kumbh Sans", sans-serif',
                      position: 'relative',
                      overflow: 'hidden',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Link 
                      href="/kids"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: 1,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.closest('div').style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                        e.target.closest('div').style.color = 'var(--primary)';
                        e.target.closest('div').style.transform = 'translateY(-2px)';
                        e.target.closest('div').style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.closest('div').style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                        e.target.closest('div').style.color = 'var(--main)';
                        e.target.closest('div').style.transform = 'translateY(0)';
                        e.target.closest('div').style.boxShadow = 'none';
                      }}
                    >
                      <span>Kids</span>
                    </Link>
                    {navigationData.kids.length > 0 && (
                      <span 
                        className={`plus-icon ${expandedMenus.kids ? 'expanded' : ''}`}
                        style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
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
                    <ul 
                      className="submenu-enter"
                      style={{
                        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        margin: '8px 0 0 0',
                        padding: '8px',
                        listStyle: 'none',
                        overflow: 'hidden'
                      }}>
                      {navigationData.kids.map((collection) => (
                        <li key={collection.id} style={{ marginBottom: '4px' }}>
                          <Link
                            href={`/collections/${collection.slug}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              fontSize: '14px',
                              fontWeight: '400',
                              color: 'var(--secondary)',
                              textDecoration: 'none',
                              background: 'transparent',
                              borderRadius: '6px',
                              transition: 'all 0.2s ease',
                              fontFamily: '"Kumbh Sans", sans-serif'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--primary-rgba-05)';
                              e.target.style.color = 'var(--primary)';
                              e.target.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = 'var(--secondary)';
                              e.target.style.transform = 'translateX(0)';
                            }}
                          >
                            <span style={{
                              marginRight: '8px',
                              fontSize: '12px'
                            }}>•</span>
                            {collection.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li> */}

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
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                      e.target.style.color = 'var(--primary)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                      e.target.style.color = 'var(--main)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
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
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                        e.target.style.color = 'var(--primary)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                        e.target.style.color = 'var(--main)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          marginRight: '12px',
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
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                        e.target.style.color = 'var(--primary)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                        e.target.style.color = 'var(--main)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          marginRight: '12px',
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
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
                        e.target.style.color = '#ffffff';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(220, 53, 69, 0.3)';
                        const icon = e.target.querySelector('svg');
                        if (icon) {
                          icon.style.transform = 'rotate(-5deg) scale(1.1)';
                          icon.style.filter = 'brightness(0) invert(1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)';
                        e.target.style.color = '#dc3545';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        const icon = e.target.querySelector('svg');
                        if (icon) {
                          icon.style.transform = 'rotate(0deg) scale(1)';
                          icon.style.filter = 'none';
                        }
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
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, var(--primary-rgba-1) 0%, var(--primary-rgba-05) 100%)';
                      e.target.style.color = 'var(--primary)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)';
                      e.target.style.color = 'var(--main)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
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
