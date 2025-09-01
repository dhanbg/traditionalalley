'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ShopGram = () => {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);

  // iOS detection function
  const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  // iOS-compatible video URLs with verified byte-range support
  const iosCompatibleMockData = [
    {
      id: 1,
      link: 'https://instagram.com/p/sample1',
      media: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        mime: 'video/mp4',
        alternativeText: 'Traditional Alley Instagram Video 1',
        formats: {
          thumbnail: {
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images_480x270/BigBuckBunny.jpg'
          }
        }
      }
    },
    {
      id: 2,
      link: 'https://instagram.com/p/sample2',
      media: {
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
        mime: 'video/mp4',
        alternativeText: 'Traditional Alley Instagram Video 2',
        formats: {
          thumbnail: {
            url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
          }
        }
      }
    },
    {
      id: 3,
      link: 'https://instagram.com/p/sample3',
      media: {
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
        mime: 'video/mp4',
        alternativeText: 'Traditional Alley Instagram Video 3',
        formats: {
          thumbnail: {
            url: 'https://sample-videos.com/zip/10/jpg/SampleJPGImage_640x360_1mb.jpg'
          }
        }
      }
    },
    {
      id: 4,
      link: 'https://instagram.com/p/sample4',
      media: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        mime: 'video/mp4',
        alternativeText: 'Traditional Alley Instagram Video 4',
        formats: {
          thumbnail: {
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images_480x270/ElephantsDream.jpg'
          }
        }
      }
    }
  ];

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:1337';
        const response = await fetch(`${API_URL}/api/instagrams?populate=*`);
        
        if (response.ok) {
          const data = await response.json();
          setInstagramPosts(data.data || []);
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        console.error('Failed to fetch Instagram posts, using iOS-compatible mock data:', error);
        // Always use iOS-compatible mock data as fallback
        setInstagramPosts(iosCompatibleMockData);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  // iOS-specific video initialization
  const handleVideoLoadStart = (event, index) => {
    const video = event.target;
    
    if (isIOS()) {
      // Force video initialization on iOS
      video.load();
      
      // Additional iOS-specific handling
      video.addEventListener('canplaythrough', () => {
        console.log(`Video ${index} ready for iOS playback`);
      });
      
      video.addEventListener('error', (e) => {
        console.error(`iOS video error for video ${index}:`, e);
      });
    }
  };

  // Enhanced video error handling
  const handleVideoError = (event, index) => {
    const video = event.target;
    console.error(`Video ${index} failed to load:`, {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
      src: video.src
    });
  };

  const renderMedia = (post, index) => {
    const { media } = post;
    if (!media) return null;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:1337';
    const mediaUrl = media.url?.startsWith('http') ? media.url : `${API_URL}${media.url}`;
    const thumbnailUrl = media.formats?.thumbnail?.url?.startsWith('http') 
      ? media.formats.thumbnail.url 
      : `${API_URL}${media.formats?.thumbnail?.url || media.url}`;

    const isVideo = media.mime?.startsWith('video/');

    if (isVideo) {
      return (
        <div className="relative w-full h-full overflow-hidden rounded-lg group">
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            // iOS-critical attributes
            playsInline={true}
            muted={true}
            autoPlay={true}
            loop={true}
            preload="metadata"
            // iOS-specific poster for better loading
            poster={thumbnailUrl}
            // iOS event handlers
            onLoadStart={(e) => handleVideoLoadStart(e, index)}
            onError={(e) => handleVideoError(e, index)}
            // Additional iOS compatibility
            webkit-playsinline="true"
            x-webkit-airplay="allow"
          >
            {/* Primary source with explicit type for iOS */}
            <source src={mediaUrl} type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'" />
            {/* Fallback source without codecs */}
            <source src={mediaUrl} type="video/mp4" />
            {/* iOS fallback message */}
            <div className="flex items-center justify-center h-full bg-gray-200">
              <p className="text-gray-600">Video not supported on this device</p>
            </div>
          </video>
          
          {/* iOS-specific loading overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white bg-opacity-80 rounded-full p-2">
              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative w-full h-full overflow-hidden rounded-lg group">
          <Image
            src={mediaUrl}
            alt={media.alternativeText || 'Instagram post'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h2>
            <p className="text-gray-600">Stay updated with our latest collections and behind-the-scenes content</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h2>
          <p className="text-gray-600">Stay updated with our latest collections and behind-the-scenes content</p>
          {isIOS() && (
            <p className="text-sm text-blue-600 mt-2">iOS-optimized video playback enabled</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {instagramPosts.slice(0, 4).map((post, index) => (
            <Link
              key={post.id}
              href={post.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square"
            >
              {renderMedia(post, index)}
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Link
            href="https://instagram.com/traditionalalley"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow @traditionalalley
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopGram;
