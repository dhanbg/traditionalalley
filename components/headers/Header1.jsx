"use client";

import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartLength from "../common/CartLength";
import CurrencySwitcher from "../common/CurrencySwitcher";
import { useSession, signIn, signOut } from "next-auth/react";
import { useContextElement } from "@/context/Context";

export default function Header1({ fullWidth = false }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <header
      id="header"
      className={`header-default ${fullWidth ? "header-fullwidth" : ""} `}
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
    >
      <div className={fullWidth ? "" : "container"}>
        <div className="row wrapper-header align-items-center" style={{ 
          minHeight: '70px', 
          padding: isMobile ? '20px 15px' : '0 15px'
        }}>
          <div className="col-md-4 col-3 d-xl-none">
            <div className="d-flex align-items-center">
              <a
                href="#mobileMenu"
                className="mobile-menu"
                data-bs-toggle="offcanvas"
                aria-controls="mobileMenu"
              >
                <i className="icon icon-categories" />
              </a>
              <div className="mobile-currency-flag ms-3">
                <CurrencySwitcher className="header-currency-switcher mobile-flag-only" />
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-4 col-6">
            <Link href={`/`} className="logo-header" style={{ transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Image 
                src="/logo.png" 
                width={180} 
                height={48} 
                alt="Logo" 
                style={{ 
                  width: '180px', 
                  height: '48px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }} 
              />
            </Link>
          </div>
          <div className="col-xl-6 d-none d-xl-block">
            <nav className="box-navigation text-center">
              <ul className="box-nav-ul d-flex align-items-center justify-content-center">
                <Nav />
              </ul>
            </nav>
          </div>
          <div className="col-xl-3 col-md-4 col-3" style={{
            display: 'flex',
            justifyContent: isMobile ? 'flex-end' : 'flex-end',
            alignItems: 'center',
            paddingLeft: isMobile ? '12px' : '15px',
            paddingRight: isMobile ? '8px' : '15px'
          }}>
            <ul className="nav-icon d-flex justify-content-end align-items-center" style={{
              margin: '0',
              padding: '0',
              listStyle: 'none',
              gap: isMobile ? '8px' : '12px'
            }}>
              <li className="nav-currency d-none d-xl-block">
                <CurrencySwitcher className="header-currency-switcher" />
              </li>
              <li className="nav-search">
                <a
                  href="#search"
                  data-bs-toggle="modal"
                  className="nav-icon-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <svg
                    className="icon"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21.35 21.0004L17 16.6504"
                      stroke="#181818"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              {user ? (
                <>
                  <li className="nav-account">
                    <div className="dropdown">
                      <a
                        href="#"
                        className="nav-icon-item dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="rounded-circle nav-avatar-img align-middle"
                            width={30}
                            height={30}
                            style={{ objectFit: 'cover', verticalAlign: 'middle' }}
                          />
                        ) : (
                          <svg
                            className="icon align-middle"
                            width={30}
                            height={30}
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
                        )}
                      </a>
                      <ul className="dropdown-menu" style={{
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                        padding: '12px 0',
                        minWidth: '200px',
                        marginTop: '8px',
                        overflow: 'hidden',
                        contain: 'layout style'
                      }}>
                        <li style={{
                          padding: '10px',
                          overflow: 'hidden',
                          margin: '0 8px'
                        }}>
                          <a className="dropdown-item" href="/my-account" style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            margin: '0',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontWeight: '500',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'block',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'scaleY(1.05)';
                            e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(102, 126, 234, 0.3)';
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              icon.style.transform = 'rotate(5deg) scale(1.1)';
                              icon.style.filter = 'brightness(0) invert(1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'inherit';
                            e.currentTarget.style.transform = 'scaleY(1)';
                            e.currentTarget.style.boxShadow = 'none';
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              icon.style.transform = 'rotate(0deg) scale(1)';
                              icon.style.filter = 'none';
                            }
                          }}>
                            <svg
                              className="icon me-2"
                              width={16}
                              height={16}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                            >
                              <path
                                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                stroke="#181818"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="12"
                                cy="7"
                                r="4"
                                stroke="#181818"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            My Account
                          </a>
                        </li>
                        <li>
                          <hr className="dropdown-divider" style={{
                            margin: '8px 16px',
                            borderColor: '#e9ecef'
                          }} />
                        </li>
                        <li style={{
                          padding: '10px',
                          overflow: 'hidden',
                          margin: '0 8px'
                        }}>
                          <a 
                            className="dropdown-item d-flex align-items-center" 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              signOut();
                            }}
                            style={{
                              fontWeight: '500',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              padding: '12px 20px',
                              borderRadius: '12px',
                              margin: '0',
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'block',
                              width: '100%',
                              boxSizing: 'border-box',
                              color: '#dc3545'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.fontWeight = '600';
                              e.currentTarget.style.transform = 'scaleY(1.05)';
                              e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(255, 107, 107, 0.4)';
                              const icon = e.currentTarget.querySelector('svg');
                              if (icon) {
                                icon.style.transform = 'rotate(-5deg) scale(1.1)';
                                icon.style.filter = 'brightness(0) invert(1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#dc3545';
                              e.currentTarget.style.fontWeight = '500';
                              e.currentTarget.style.transform = 'scaleY(1)';
                              e.currentTarget.style.boxShadow = 'none';
                              const icon = e.currentTarget.querySelector('svg');
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
                            Sign Out
                          </a>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="nav-wishlist">
                    <Link href={`/wish-list`} className="nav-icon-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <svg
                        className="icon"
                        width={20}
                        height={20}
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
                    </Link>
                  </li>
                  <li className="nav-cart">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        import('@/utils/openCartModal').then(({ openCartModal }) => {
                          openCartModal().catch(() => {});
                        });
                      }}
                      className="nav-icon-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'transparent',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <svg
                        className="icon"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4M20 7H4L5 19H19L20 7Z"
                          stroke="#181818"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="count-box">
                        <CartLength />
                      </span>
                    </a>
                  </li>
                </>
              ) : (
                <li onClick={() => signIn()} className="nav-account">
                  <a href="#" className="nav-icon-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <svg
                      className="icon"
                      width={20}
                      height={20}
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
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
