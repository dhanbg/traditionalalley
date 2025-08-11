"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
export default function AccountSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when session is available
  useEffect(() => {
    console.log('[AccountSidebar] Session status:', status);
    console.log('[AccountSidebar] Session data:', session);
    
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          console.log('[AccountSidebar] Fetching user data for:', session.user.email);
          setLoading(true);
          // First ensure user exists in Strapi
          const response = await fetch('/api/user-management', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('[AccountSidebar] User management response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('[AccountSidebar] User management result:', result);
            setUserData(result.user);
          } else {
            console.error('[AccountSidebar] User management request failed:', response.status);
          }
        } catch (error) {
          console.error('[AccountSidebar] Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('[AccountSidebar] No session user found');
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchUserData();
    }
  }, [session, status]);

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (userData?.firstName || userData?.lastName) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    return session?.user?.name || 'User';
  };

  // Helper function to get user email
  const getUserEmail = () => {
    return userData?.email || session?.user?.email || 'No email';
  };

  // Helper function to get user avatar
  const getUserAvatar = () => {
    let avatar;
    
    if (userData?.avatar && userData.avatar !== '') {
      avatar = userData.avatar;
    } else if (session?.user?.image) {
      avatar = session.user.image;
    } else {
      avatar = '/images/avatar/user-account.jpg';
    }
    
    // If it's a Google image, use our proxy route to bypass CORS
    if (avatar && avatar.includes('googleusercontent.com')) {
      avatar = `/api/proxy-avatar?url=${encodeURIComponent(avatar)}`;
    }
    
    // Avatar URL resolved successfully
    
    return avatar;
  };
  return (
    <div className="wrap-sidebar-account">
      <div className="sidebar-account">
        <div className="account-avatar">
          <div className="image">
            {loading ? (
              <div style={{ width: 281, height: 280, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                <span>Loading...</span>
              </div>
            ) : (
              <img
                alt="User Avatar"
                src={getUserAvatar()}
                onError={(e) => {
                  e.target.src = '/images/avatar/user-account.jpg';
                }}
              />
            )}
          </div>
          <h6 className="mb_4">
            {loading ? 'Loading...' : getUserDisplayName()}
          </h6>
          <div className="body-text-1">
            {loading ? 'Loading...' : getUserEmail()}
          </div>
        </div>
        <ul className="my-account-nav">
          <li>
            <Link
              href={`/my-account`}
              className={`my-account-nav-item ${
                pathname == "/my-account" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
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
              Account Details
            </Link>
          </li>
          <li>
            <Link
              href={`/my-account-orders`}
              className={`my-account-nav-item ${
                pathname == "/my-account-orders" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5078 10.8734V6.36686C16.5078 5.17166 16.033 4.02541 15.1879 3.18028C14.3428 2.33514 13.1965 1.86035 12.0013 1.86035C10.8061 1.86035 9.65985 2.33514 8.81472 3.18028C7.96958 4.02541 7.49479 5.17166 7.49479 6.36686V10.8734M4.11491 8.62012H19.8877L21.0143 22.1396H2.98828L4.11491 8.62012Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Your Orders
            </Link>
          </li>
          <li>
            <Link
              href={`/my-account-reviews`}
              className={`my-account-nav-item ${
                pathname == "/my-account-reviews" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              To Review
            </Link>
          </li>
          <li>
            <Link
              href={`/my-account-address`}
              className={`my-account-nav-item ${
                pathname == "/my-account-address" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              My Address
            </Link>
          </li>
          <li>
            <Link
              href={`/login`}
              className={`my-account-nav-item ${
                pathname == "/login" ? "active" : ""
              } `}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
