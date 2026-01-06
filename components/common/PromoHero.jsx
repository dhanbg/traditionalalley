"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PromoHero.module.css";

export default function PromoHero() {
  const desktopVideoRef1 = useRef(null);
  const desktopVideoRef2 = useRef(null);
  const mobileVideoRef1 = useRef(null);
  const mobileVideoRef2 = useRef(null);
  const [desktopVideoIndex, setDesktopVideoIndex] = useState(0);
  const [mobileVideoIndex, setMobileVideoIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [desktopFading, setDesktopFading] = useState(false);
  const [mobileFading, setMobileFading] = useState(false);

  const desktopVideos = [
    "https://3d7fptzn6w.ucarecd.net/fec66701-9757-4c0f-87b2-14ef65ac2778/tavideo1.mp4",
    "https://3d7fptzn6w.ucarecd.net/b7a9891c-d831-4ba5-9419-2b15c1aee684/tavideo2.mp4"
  ];

  const mobileVideos = [
    "https://3d7fptzn6w.ucarecd.net/e28011d0-0fee-4b06-9146-a6ffd5cfe153/tam1.mp4",
    "https://3d7fptzn6w.ucarecd.net/445a76f8-1193-42e5-8710-b807de05937a/tam2.mp4"
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
        attemptPlay(desktopVideoRef1);
        attemptPlay(mobileVideoRef1);
      }
    };

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

  // Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (desktopVideoIndex === 0) {
            attemptPlay(desktopVideoRef1);
          } else {
            attemptPlay(desktopVideoRef2);
          }
          if (mobileVideoIndex === 0) {
            attemptPlay(mobileVideoRef1);
          } else {
            attemptPlay(mobileVideoRef2);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const section = document.querySelector(`.${styles.promoHero}`);
    if (section) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
    };
  }, [desktopVideoIndex, mobileVideoIndex]);

  const handleDesktopVideoEnd = () => {
    setDesktopFading(true);
    const nextIndex = (desktopVideoIndex + 1) % desktopVideos.length;
    const nextVideoRef = nextIndex === 0 ? desktopVideoRef1 : desktopVideoRef2;

    // Preload and play next video
    if (nextVideoRef.current) {
      nextVideoRef.current.load();
      attemptPlay(nextVideoRef);
    }

    // Crossfade animation
    setTimeout(() => {
      setDesktopVideoIndex(nextIndex);
      setDesktopFading(false);
    }, 300);
  };

  const handleMobileVideoEnd = () => {
    setMobileFading(true);
    const nextIndex = (mobileVideoIndex + 1) % mobileVideos.length;
    const nextVideoRef = nextIndex === 0 ? mobileVideoRef1 : mobileVideoRef2;

    // Preload and play next video
    if (nextVideoRef.current) {
      nextVideoRef.current.load();
      attemptPlay(nextVideoRef);
    }

    // Crossfade animation
    setTimeout(() => {
      setMobileVideoIndex(nextIndex);
      setMobileFading(false);
    }, 300);
  };

  const handleVideoClick = (videoRef) => {
    if (videoRef?.current && videoRef.current.paused) {
      attemptPlay(videoRef);
    }
  };

  return (
    <section className={styles.promoHero}>
      {/* Desktop Videos - Two elements for crossfade */}
      <video
        ref={desktopVideoRef1}
        className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
        style={{
          opacity: desktopVideoIndex === 0 && !desktopFading ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disableRemotePlayback
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => desktopVideoIndex === 0 && attemptPlay(desktopVideoRef1)}
        onCanPlay={() => desktopVideoIndex === 0 && attemptPlay(desktopVideoRef1)}
        onEnded={handleDesktopVideoEnd}
        onClick={() => handleVideoClick(desktopVideoRef1)}
        poster="https://3d7fptzn6w.ucarecd.net/53d24748-46d1-4f2e-af56-386f2b514de8/tafall.jpg"
      >
        <source src={desktopVideos[0]} type="video/mp4" />
      </video>

      <video
        ref={desktopVideoRef2}
        className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
        style={{
          opacity: desktopVideoIndex === 1 && !desktopFading ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        muted
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disableRemotePlayback
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => desktopVideoIndex === 1 && attemptPlay(desktopVideoRef2)}
        onCanPlay={() => desktopVideoIndex === 1 && attemptPlay(desktopVideoRef2)}
        onEnded={handleDesktopVideoEnd}
        onClick={() => handleVideoClick(desktopVideoRef2)}
      >
        <source src={desktopVideos[1]} type="video/mp4" />
      </video>

      {/* Mobile Videos - Two elements for crossfade */}
      <video
        ref={mobileVideoRef1}
        className={`${styles.heroVideo} ${styles.heroVideoMobile} ${styles.cropTop}`}
        style={{
          opacity: mobileVideoIndex === 0 && !mobileFading ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disableRemotePlayback
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => mobileVideoIndex === 0 && attemptPlay(mobileVideoRef1)}
        onCanPlay={() => mobileVideoIndex === 0 && attemptPlay(mobileVideoRef1)}
        onEnded={handleMobileVideoEnd}
        onClick={() => handleVideoClick(mobileVideoRef1)}
        poster="https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg"
      >
        <source src={mobileVideos[0]} type="video/mp4" />
      </video>

      <video
        ref={mobileVideoRef2}
        className={`${styles.heroVideo} ${styles.heroVideoMobile} ${styles.cropBottom}`}
        style={{
          opacity: mobileVideoIndex === 1 && !mobileFading ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        muted
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="deny"
        disableRemotePlayback
        disablePictureInPicture
        preload="auto"
        onLoadedData={() => mobileVideoIndex === 1 && attemptPlay(mobileVideoRef2)}
        onCanPlay={() => mobileVideoIndex === 1 && attemptPlay(mobileVideoRef2)}
        onEnded={handleMobileVideoEnd}
        onClick={() => handleVideoClick(mobileVideoRef2)}
      >
        <source src={mobileVideos[1]} type="video/mp4" />
      </video>
    </section>
  );
}
