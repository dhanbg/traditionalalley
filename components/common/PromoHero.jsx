"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PromoHero.module.css";

export default function PromoHero() {
    const desktopVideo1Ref = useRef(null);
    const desktopVideo2Ref = useRef(null);
    const mobileVideo1Ref = useRef(null);
    const mobileVideo2Ref = useRef(null);

    const [desktopVideoIndex, setDesktopVideoIndex] = useState(0);
    const [mobileVideoIndex, setMobileVideoIndex] = useState(0);
    const [userInteracted, setUserInteracted] = useState(false);

    const desktopVideos = [
        "https://3d7fptzn6w.ucarecd.net/fec66701-9757-4c0f-87b2-14ef65ac2778/tavideo1.mp4",
        "https://3d7fptzn6w.ucarecd.net/b7a9891c-d831-4ba5-9419-2b15c1aee684/tavideo2.mp4"
    ];

    const mobileVideos = [
        "https://3d7fptzn6w.ucarecd.net/e28011d0-0fee-4b06-9146-a6ffd5cfe153/tam1.mp4",
        "https://3d7fptzn6w.ucarecd.net/445a76f8-1193-42e5-8710-b807de05937a/tam2.mp4"
    ];

    const mobilePosters = [
        "https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg",
        "https://3d7fptzn6w.ucarecd.net/27c5b77e-f005-4442-8feb-998c176af48d/tamfall.jpg"
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

    // Pause a video
    const pauseVideo = (videoRef) => {
        if (videoRef?.current && !videoRef.current.paused) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // Handle first user interaction to enable autoplay on iOS
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!userInteracted) {
                setUserInteracted(true);
                // Play the currently active videos
                attemptPlay(desktopVideoIndex === 0 ? desktopVideo1Ref : desktopVideo2Ref);
                attemptPlay(mobileVideoIndex === 0 ? mobileVideo1Ref : mobileVideo2Ref);
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
    }, [userInteracted, desktopVideoIndex, mobileVideoIndex]);

    // Handle desktop video transitions
    useEffect(() => {
        const currentRef = desktopVideoIndex === 0 ? desktopVideo1Ref : desktopVideo2Ref;
        const otherRef = desktopVideoIndex === 0 ? desktopVideo2Ref : desktopVideo1Ref;

        pauseVideo(otherRef);
        attemptPlay(currentRef);
    }, [desktopVideoIndex]);

    // Handle mobile video transitions
    useEffect(() => {
        const currentRef = mobileVideoIndex === 0 ? mobileVideo1Ref : mobileVideo2Ref;
        const otherRef = mobileVideoIndex === 0 ? mobileVideo2Ref : mobileVideo1Ref;

        pauseVideo(otherRef);
        attemptPlay(currentRef);
    }, [mobileVideoIndex]);

    const handleDesktopVideoEnd = () => {
        setDesktopVideoIndex((prevIndex) => (prevIndex + 1) % desktopVideos.length);
    };

    const handleMobileVideoEnd = () => {
        setMobileVideoIndex((prevIndex) => (prevIndex + 1) % mobileVideos.length);
    };

    return (
        <section className={styles.promoHero}>
            {/* Desktop Videos - both always rendered, visibility controlled by opacity */}
            <div style={{ position: 'relative', width: '100%' }}>
                <video
                    ref={desktopVideo1Ref}
                    className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
                    style={{
                        opacity: desktopVideoIndex === 0 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: desktopVideoIndex === 0 ? 'relative' : 'absolute',
                        top: 0,
                        left: 0
                    }}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => desktopVideoIndex === 0 && attemptPlay(desktopVideo1Ref)}
                    onCanPlay={() => desktopVideoIndex === 0 && attemptPlay(desktopVideo1Ref)}
                    onEnded={handleDesktopVideoEnd}
                    poster="https://3d7fptzn6w.ucarecd.net/53d24748-46d1-4f2e-af56-386f2b514de8/tafall.jpg"
                >
                    <source src={desktopVideos[0]} type="video/mp4" />
                </video>

                <video
                    ref={desktopVideo2Ref}
                    className={`${styles.heroVideo} ${styles.heroVideoDesktop}`}
                    style={{
                        opacity: desktopVideoIndex === 1 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: desktopVideoIndex === 1 ? 'relative' : 'absolute',
                        top: 0,
                        left: 0
                    }}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => desktopVideoIndex === 1 && attemptPlay(desktopVideo2Ref)}
                    onCanPlay={() => desktopVideoIndex === 1 && attemptPlay(desktopVideo2Ref)}
                    onEnded={handleDesktopVideoEnd}
                    poster="https://3d7fptzn6w.ucarecd.net/53d24748-46d1-4f2e-af56-386f2b514de8/tafall.jpg"
                >
                    <source src={desktopVideos[1]} type="video/mp4" />
                </video>
            </div>

            {/* Mobile Videos - both always rendered with consistent sizing */}
            <div style={{ position: 'relative', width: '100%' }}>
                <video
                    ref={mobileVideo1Ref}
                    className={`${styles.heroVideo} ${styles.heroVideoMobile} ${styles.mobileVideoConsistent}`}
                    style={{
                        opacity: mobileVideoIndex === 0 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: mobileVideoIndex === 0 ? 'relative' : 'absolute',
                        top: 0,
                        left: 0
                    }}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => mobileVideoIndex === 0 && attemptPlay(mobileVideo1Ref)}
                    onCanPlay={() => mobileVideoIndex === 0 && attemptPlay(mobileVideo1Ref)}
                    onEnded={handleMobileVideoEnd}
                    poster={mobilePosters[0]}
                >
                    <source src={mobileVideos[0]} type="video/mp4" />
                </video>

                <video
                    ref={mobileVideo2Ref}
                    className={`${styles.heroVideo} ${styles.heroVideoMobile} ${styles.mobileVideoConsistent}`}
                    style={{
                        opacity: mobileVideoIndex === 1 ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        position: mobileVideoIndex === 1 ? 'relative' : 'absolute',
                        top: 0,
                        left: 0
                    }}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    x-webkit-airplay="deny"
                    disableRemotePlayback
                    disablePictureInPicture
                    preload="auto"
                    onLoadedData={() => mobileVideoIndex === 1 && attemptPlay(mobileVideo2Ref)}
                    onCanPlay={() => mobileVideoIndex === 1 && attemptPlay(mobileVideo2Ref)}
                    onEnded={handleMobileVideoEnd}
                    poster={mobilePosters[1]}
                >
                    <source src={mobileVideos[1]} type="video/mp4" />
                </video>
            </div>
        </section>
    );
}
