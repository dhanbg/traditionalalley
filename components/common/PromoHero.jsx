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
    const [desktopActivePlayer, setDesktopActivePlayer] = useState(1); // 1 or 2
    const [mobileActivePlayer, setMobileActivePlayer] = useState(1); // 1 or 2
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
                attemptPlay(desktopVideoRef1);
                attemptPlay(mobileVideoRef1);
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
                if (entry.isIntersecting) {
                    // Play the active video
                    if (entry.target === desktopVideoRef1.current || entry.target === desktopVideoRef2.current) {
                        const activeRef = desktopActivePlayer === 1 ? desktopVideoRef1 : desktopVideoRef2;
                        attemptPlay(activeRef);
                    } else if (entry.target === mobileVideoRef1.current || entry.target === mobileVideoRef2.current) {
                        const activeRef = mobileActivePlayer === 1 ? mobileVideoRef1 : mobileVideoRef2;
                        attemptPlay(activeRef);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        [desktopVideoRef1, desktopVideoRef2, mobileVideoRef1, mobileVideoRef2].forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [desktopActivePlayer, mobileActivePlayer]);

    // Preload next video and switch smoothly
    const handleDesktopVideoEnd = () => {
        const nextIndex = (desktopVideoIndex + 1) % desktopVideos.length;
        const nextPlayer = desktopActivePlayer === 1 ? 2 : 1;
        const nextVideoRef = nextPlayer === 1 ? desktopVideoRef1 : desktopVideoRef2;
        const currentVideoRef = desktopActivePlayer === 1 ? desktopVideoRef1 : desktopVideoRef2;

        // Load next video
        if (nextVideoRef.current) {
            nextVideoRef.current.src = desktopVideos[nextIndex];
            nextVideoRef.current.load();

            // When next video is ready, crossfade
            nextVideoRef.current.oncanplaythrough = () => {
                setDesktopVideoIndex(nextIndex);
                setDesktopActivePlayer(nextPlayer);
                attemptPlay(nextVideoRef);

                // Fade out current video after a brief delay
                setTimeout(() => {
                    if (currentVideoRef.current) {
                        currentVideoRef.current.pause();
                        currentVideoRef.current.currentTime = 0;
                    }
                }, 500);
            };
        }
    };

    const handleMobileVideoEnd = () => {
        const nextIndex = (mobileVideoIndex + 1) % mobileVideos.length;
        const nextPlayer = mobileActivePlayer === 1 ? 2 : 1;
        const nextVideoRef = nextPlayer === 1 ? mobileVideoRef1 : mobileVideoRef2;
        const currentVideoRef = mobileActivePlayer === 1 ? mobileVideoRef1 : mobileVideoRef2;

        // Load next video
        if (nextVideoRef.current) {
            nextVideoRef.current.src = mobileVideos[nextIndex];
            nextVideoRef.current.load();

            // When next video is ready, crossfade
            nextVideoRef.current.oncanplaythrough = () => {
                setMobileVideoIndex(nextIndex);
                setMobileActivePlayer(nextPlayer);
                attemptPlay(nextVideoRef);

                // Fade out current video after a brief delay
                setTimeout(() => {
                    if (currentVideoRef.current) {
                        currentVideoRef.current.pause();
                        currentVideoRef.current.currentTime = 0;
                    }
                }, 500);
            };
        }
    };

    // Initial play attempt
    useEffect(() => {
        const timer = setTimeout(() => {
            attemptPlay(desktopVideoRef1);
            attemptPlay(mobileVideoRef1);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Handle direct click on video to play
    const handleVideoClick = (isDesktop) => {
        const videoRef = isDesktop
            ? (desktopActivePlayer === 1 ? desktopVideoRef1 : desktopVideoRef2)
            : (mobileActivePlayer === 1 ? mobileVideoRef1 : mobileVideoRef2);

        if (videoRef?.current && videoRef.current.paused) {
            attemptPlay(videoRef);
        }
    };

    return (
        <section className={styles.promoHero}>
            {/* Desktop Video Players - Double Buffered */}
            <div className={styles.videoContainer}>
                <video
                    ref={desktopVideoRef1}
                    className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
                    style={{
                        opacity: desktopActivePlayer === 1 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => desktopActivePlayer === 1 && attemptPlay(desktopVideoRef1)}
                    onCanPlay={() => desktopActivePlayer === 1 && attemptPlay(desktopVideoRef1)}
                    onEnded={handleDesktopVideoEnd}
                    onClick={() => handleVideoClick(true)}
                    poster="https://3d7fptzn6w.ucarecd.net/53d24748-46d1-4f2e-af56-386f2b514de8/tafall.jpg"
                >
                    <source src={desktopVideos[0]} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <video
                    ref={desktopVideoRef2}
                    className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
                    style={{
                        opacity: desktopActivePlayer === 2 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => desktopActivePlayer === 2 && attemptPlay(desktopVideoRef2)}
                    onCanPlay={() => desktopActivePlayer === 2 && attemptPlay(desktopVideoRef2)}
                    onEnded={handleDesktopVideoEnd}
                    onClick={() => handleVideoClick(true)}
                >
                    <source src={desktopVideos[1]} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Mobile Video Players - Double Buffered */}
            <div className={styles.videoContainer}>
                <video
                    ref={mobileVideoRef1}
                    className={`${styles.heroVideo} ${styles.heroVideoMobile} ${mobileVideoIndex === 0 ? styles.cropTop : styles.cropBottom}`}
                    style={{
                        opacity: mobileActivePlayer === 1 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => mobileActivePlayer === 1 && attemptPlay(mobileVideoRef1)}
                    onCanPlay={() => mobileActivePlayer === 1 && attemptPlay(mobileVideoRef1)}
                    onEnded={handleMobileVideoEnd}
                    onClick={() => handleVideoClick(false)}
                    poster="https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg"
                >
                    <source src={mobileVideos[0]} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <video
                    ref={mobileVideoRef2}
                    className={`${styles.heroVideo} ${styles.heroVideoMobile} ${mobileVideoIndex === 1 ? styles.cropTop : styles.cropBottom}`}
                    style={{
                        opacity: mobileActivePlayer === 2 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => mobileActivePlayer === 2 && attemptPlay(mobileVideoRef2)}
                    onCanPlay={() => mobileActivePlayer === 2 && attemptPlay(mobileVideoRef2)}
                    onEnded={handleMobileVideoEnd}
                    onClick={() => handleVideoClick(false)}
                >
                    <source src={mobileVideos[1]} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </section>
    );
}
