"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PromoHero.module.css";

export default function PromoHero() {
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const [desktopVideoIndex, setDesktopVideoIndex] = useState(0);
  const [mobileVideoIndex, setMobileVideoIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  const desktopVideos = [
    "https://image2url.com/r2/default/videos/1768154821995-76f27471-4fc9-4300-bacb-a121afc7c63b.mp4",
    "https://image2url.com/r2/default/videos/1768154840884-b1883d24-3bdf-4cd1-8c54-afa56d34be62.mp4"
  ];

  const mobileVideos = [
    "https://image2url.com/r2/default/videos/1768154736925-38b429d8-804e-413b-a1b4-bc02308abbba.mp4",
    "https://image2url.com/r2/default/videos/1768154794533-26cb6b90-4857-447b-a7dd-baafe2cfbe6b.mp4"
  ];

  // Attempt to play videos
  const attemptPlay = (videoRef) => {
    if (videoRef?.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("Video autoplay prevented:", err);
        });
      }
    }
  };

  // Handle first user interaction to enable autoplay on iOS
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        attemptPlay(desktopVideoRef);
        attemptPlay(mobileVideoRef);
      }
    };

    // Listen for various user interaction events
    const events = ['touchstart', 'touchend', 'click', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [userInteracted]);

  // Intersection Observer to play when video is in viewport
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5, // Play when 50% visible
      rootMargin: '0px'
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        const videoRef = entry.target === desktopVideoRef.current ? desktopVideoRef : mobileVideoRef;
        if (entry.isIntersecting) {
          attemptPlay(videoRef);
        } else {
          if (videoRef?.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    if (desktopVideoRef.current) {
      observer.observe(desktopVideoRef.current);
    }
    if (mobileVideoRef.current) {
      observer.observe(mobileVideoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [desktopVideoIndex, mobileVideoIndex]);

  // Try to play when videos change and preload next video
  useEffect(() => {
    const timer = setTimeout(() => {
      attemptPlay(desktopVideoRef);
      attemptPlay(mobileVideoRef);
    }, 100);

    // Preload next video to avoid black screen
    const nextDesktopIndex = (desktopVideoIndex + 1) % desktopVideos.length;
    const nextMobileIndex = (mobileVideoIndex + 1) % mobileVideos.length;

    // Create hidden link elements to preload next videos
    const preloadDesktop = document.createElement('link');
    preloadDesktop.rel = 'preload';
    preloadDesktop.as = 'video';
    preloadDesktop.href = desktopVideos[nextDesktopIndex];
    document.head.appendChild(preloadDesktop);

    const preloadMobile = document.createElement('link');
    preloadMobile.rel = 'preload';
    preloadMobile.as = 'video';
    preloadMobile.href = mobileVideos[nextMobileIndex];
    document.head.appendChild(preloadMobile);

    return () => {
      clearTimeout(timer);
      document.head.removeChild(preloadDesktop);
      document.head.removeChild(preloadMobile);
    };
  }, [desktopVideoIndex, mobileVideoIndex]);

  const handleDesktopVideoEnd = () => {
    // Ensure smooth transition by loading the video before switching
    const nextIndex = (desktopVideoIndex + 1) % desktopVideos.length;
    setDesktopVideoIndex(nextIndex);
  };

  const handleMobileVideoEnd = () => {
    // Ensure smooth transition by loading the video before switching
    const nextIndex = (mobileVideoIndex + 1) % mobileVideos.length;
    setMobileVideoIndex(nextIndex);
  };

  // Handle direct click on video to play
  const handleVideoClick = (videoRef) => {
    if (videoRef?.current) {
      if (videoRef.current.paused) {
        attemptPlay(videoRef);
      }
    }
  };

  return (
    <section className={styles.promoHero}>
      {/* Desktop Video */}
      <video
        ref={desktopVideoRef}
        className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disableRemotePlayback
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => attemptPlay(desktopVideoRef)}
        onCanPlay={() => attemptPlay(desktopVideoRef)}
        onEnded={handleDesktopVideoEnd}
        onLoadStart={() => attemptPlay(desktopVideoRef)}
        onClick={() => handleVideoClick(desktopVideoRef)}
        poster={desktopVideoIndex === 0 ? "https://3d7fptzn6w.ucarecd.net/53d24748-46d1-4f2e-af56-386f2b514de8/tafall.jpg" : undefined}
        key={`desktop-${desktopVideoIndex}`}
      >
        <source src={desktopVideos[desktopVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Mobile Video */}
      <video
        ref={mobileVideoRef}
        className={`${styles.heroVideo} ${styles.heroVideoMobile} ${mobileVideoIndex === 0 ? styles.cropTop : styles.cropBottom
          }`}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disableRemotePlayback
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => attemptPlay(mobileVideoRef)}
        onCanPlay={() => attemptPlay(mobileVideoRef)}
        onEnded={handleMobileVideoEnd}
        onLoadStart={() => attemptPlay(mobileVideoRef)}
        onClick={() => handleVideoClick(mobileVideoRef)}
        poster={mobileVideoIndex === 0 ? "https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg" : undefined}
        key={`mobile-${mobileVideoIndex}`}
      >
        <source src={mobileVideos[mobileVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}
