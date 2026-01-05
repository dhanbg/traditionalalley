"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PromoHero.module.css";

export default function PromoHero() {
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const [desktopVideoIndex, setDesktopVideoIndex] = useState(0);
  const [mobileVideoIndex, setMobileVideoIndex] = useState(0);

  const desktopVideos = [
    "https://3d7fptzn6w.ucarecd.net/fec66701-9757-4c0f-87b2-14ef65ac2778/tavideo1.mp4",
    "https://3d7fptzn6w.ucarecd.net/b7a9891c-d831-4ba5-9419-2b15c1aee684/tavideo2.mp4"
  ];

  const mobileVideos = [
    "https://3d7fptzn6w.ucarecd.net/e28011d0-0fee-4b06-9146-a6ffd5cfe153/tam1.mp4",
    "https://3d7fptzn6w.ucarecd.net/445a76f8-1193-42e5-8710-b807de05937a/tam2.mp4"
  ];

  // Handle video loaded metadata - iOS autoplay fix
  const handleDesktopLoadedMetadata = () => {
    if (desktopVideoRef.current) {
      desktopVideoRef.current.play().catch(err => {
        console.log("Desktop video autoplay failed:", err);
      });
    }
  };

  const handleMobileLoadedMetadata = () => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.play().catch(err => {
        console.log("Mobile video autoplay failed:", err);
      });
    }
  };

  useEffect(() => {
    // Additional play attempt for iOS after component mounts
    const timer = setTimeout(() => {
      if (desktopVideoRef.current) {
        desktopVideoRef.current.play().catch(err => {
          console.log("Desktop video delayed autoplay failed:", err);
        });
      }
      if (mobileVideoRef.current) {
        mobileVideoRef.current.play().catch(err => {
          console.log("Mobile video delayed autoplay failed:", err);
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [desktopVideoIndex, mobileVideoIndex]);

  const handleDesktopVideoEnd = () => {
    // Switch to next video, loop back to first if at the end
    setDesktopVideoIndex((prevIndex) => (prevIndex + 1) % desktopVideos.length);
  };

  const handleMobileVideoEnd = () => {
    // Switch to next video, loop back to first if at the end
    setMobileVideoIndex((prevIndex) => (prevIndex + 1) % mobileVideos.length);
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
        disableRemotePlayback
        preload="auto"
        onLoadedMetadata={handleDesktopLoadedMetadata}
        onEnded={handleDesktopVideoEnd}
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
        disableRemotePlayback
        preload="auto"
        onLoadedMetadata={handleMobileLoadedMetadata}
        onEnded={handleMobileVideoEnd}
        poster={mobileVideoIndex === 0 ? "https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg" : undefined}
        key={`mobile-${mobileVideoIndex}`}
      >
        <source src={mobileVideos[mobileVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}
