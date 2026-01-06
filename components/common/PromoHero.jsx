"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PromoHero.module.css";

export default function PromoHero() {
    const desktopVideoRef = useRef(null);
    const mobileVideo1Ref = useRef(null);
    const mobileVideo2Ref = useRef(null);
    const [desktopVideoIndex, setDesktopVideoIndex] = useState(0);
    const [mobileVideoIndex, setMobileVideoIndex] = useState(0);
    const [activeMobileVideo, setActiveMobileVideo] = useState(1); // 1 or 2
    const [userInteracted, setUserInteracted] = useState(false);

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
                attemptPlay(desktopVideoRef);
                attemptPlay(mobileVideo1Ref);
                attemptPlay(mobileVideo2Ref);
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
            threshold: 0.5,
            rootMargin: '0px'
        };

        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.target === desktopVideoRef.current) {
                    if (entry.isIntersecting) {
                        attemptPlay(desktopVideoRef);
                    } else if (!desktopVideoRef.current?.paused) {
                        desktopVideoRef.current?.pause();
                    }
                } else if (entry.target === mobileVideo1Ref.current || entry.target === mobileVideo2Ref.current) {
                    if (entry.isIntersecting) {
                        const activeRef = activeMobileVideo === 1 ? mobileVideo1Ref : mobileVideo2Ref;
                        attemptPlay(activeRef);
                    } else {
                        mobileVideo1Ref.current?.pause();
                        mobileVideo2Ref.current?.pause();
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        if (desktopVideoRef.current) observer.observe(desktopVideoRef.current);
        if (mobileVideo1Ref.current) observer.observe(mobileVideo1Ref.current);
        if (mobileVideo2Ref.current) observer.observe(mobileVideo2Ref.current);

        return () => observer.disconnect();
    }, [activeMobileVideo]);

    // Try to play when videos change
    useEffect(() => {
        const timer = setTimeout(() => {
            attemptPlay(desktopVideoRef);
            const activeRef = activeMobileVideo === 1 ? mobileVideo1Ref : mobileVideo2Ref;
            attemptPlay(activeRef);
        }, 100);

        return () => clearTimeout(timer);
    }, [desktopVideoIndex, mobileVideoIndex, activeMobileVideo]);

    const handleDesktopVideoEnd = () => {
        setDesktopVideoIndex((prevIndex) => (prevIndex + 1) % desktopVideos.length);
    };

    const handleMobileVideoEnd = () => {
        const nextIndex = (mobileVideoIndex + 1) % mobileVideos.length;
        const nextVideoRef = activeMobileVideo === 1 ? mobileVideo2Ref : mobileVideo1Ref;

        // Preload and prepare the next video
        if (nextVideoRef.current) {
            nextVideoRef.current.src = mobileVideos[nextIndex];
            nextVideoRef.current.load();

            // Wait for the next video to be ready before switching
            nextVideoRef.current.oncanplay = () => {
                attemptPlay(nextVideoRef);
                // Switch the active video
                setActiveMobileVideo(activeMobileVideo === 1 ? 2 : 1);
                setMobileVideoIndex(nextIndex);
            };
        }
    };

    // Handle direct click on video to play
    const handleVideoClick = (videoRef) => {
        if (videoRef?.current?.paused) {
            attemptPlay(videoRef);
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
                onClick={() => handleVideoClick(desktopVideoRef)}
                poster={desktopVideoIndex === 0 ? "https://3d7fptzn6w.ucarecd.net/53d24748-46d1-4f2e-af56-386f2b514de8/tafall.jpg" : undefined}
                key={`desktop-${desktopVideoIndex}`}
            >
                <source src={desktopVideos[desktopVideoIndex]} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Mobile Video 1 */}
            <video
                ref={mobileVideo1Ref}
                className={`${styles.heroVideo} ${styles.heroVideoMobile} ${mobileVideoIndex === 0 ? styles.cropTop : styles.cropBottom}`}
                style={{
                    opacity: activeMobileVideo === 1 ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
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
                onLoadedData={() => activeMobileVideo === 1 && attemptPlay(mobileVideo1Ref)}
                onCanPlay={() => activeMobileVideo === 1 && attemptPlay(mobileVideo1Ref)}
                onEnded={handleMobileVideoEnd}
                onClick={() => handleVideoClick(mobileVideo1Ref)}
                poster="https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg"
            >
                <source src={mobileVideos[0]} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Mobile Video 2 */}
            <video
                ref={mobileVideo2Ref}
                className={`${styles.heroVideo} ${styles.heroVideoMobile} ${mobileVideoIndex === 1 ? styles.cropTop : styles.cropBottom}`}
                style={{
                    opacity: activeMobileVideo === 2 ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
                autoPlay={false}
                muted
                playsInline
                webkit-playsinline="true"
                x-webkit-airplay="deny"
                disableRemotePlayback
                disablePictureInPicture
                preload="auto"
                onLoadedData={() => activeMobileVideo === 2 && attemptPlay(mobileVideo2Ref)}
                onCanPlay={() => activeMobileVideo === 2 && attemptPlay(mobileVideo2Ref)}
                onEnded={handleMobileVideoEnd}
                onClick={() => handleVideoClick(mobileVideo2Ref)}
                poster="https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg"
            >
                <source src={mobileVideos[1]} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </section>
    );
}
