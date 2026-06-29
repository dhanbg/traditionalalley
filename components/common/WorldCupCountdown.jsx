"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function WorldCupCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Dynamic target: 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    targetDate.setHours(20, 0, 0, 0);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleScrollToShowcase = (e) => {
    e.preventDefault();
    const element = document.getElementById("worldcup-showcase-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="wc-countdown-section">
      <div className="container">
        <div className="countdown-card">
          <div className="countdown-content">
            <span className="limited-tag">EXCLUSIVE COUTURE</span>
            <h2 className="title">
              OFFICIAL CHAMPIONSHIP RELEASE{' '}
              <img 
                src="/images/championship_ball.png?v=4" 
                alt="Championship Ball" 
                width={26} 
                height={26} 
                className="small-title-icon" 
                style={{ width: '26px', height: '26px', verticalAlign: 'middle', marginLeft: '8px', marginTop: '-4px' }}
              />
            </h2>
            <p className="description">
              The championship designs are here! Order your nation&apos;s custom corset now to celebrate in style. Get an exclusive release discount and secure limited-edition stadium packaging.
            </p>

            <div className="timer-wrapper">
              <span className="timer-label">⏰ Release Offer Closes In:</span>
              <div className="timer-grid">
                <div className="timer-item">
                  <span className="timer-num">{timeLeft.days}</span>
                  <span className="timer-unit">Days</span>
                </div>
                <div className="timer-divider">:</div>
                <div className="timer-item">
                  <span className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="timer-unit">Hours</span>
                </div>
                <div className="timer-divider">:</div>
                <div className="timer-item">
                  <span className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="timer-unit">Mins</span>
                </div>
                <div className="timer-divider">:</div>
                <div className="timer-item">
                  <span className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="timer-unit">Secs</span>
                </div>
              </div>
            </div>

            <div className="action-wrapper">
              <a href="#worldcup-showcase-section" onClick={handleScrollToShowcase} className="cta-button-gold">
                Order Now
                <span className="arrow">→</span>
              </a>
              <span className="stock-alert">🔥 Only 50 units per country design available</span>
            </div>
          </div>

          <div className="countdown-image-wrapper">
            <div className="glow-backdrop"></div>
            <Image 
              src="/images/jersey_corset_teaser.png" 
              alt="World Cup Corsets Teaser"
              width={600}
              height={500}
              className="teaser-image"
              priority
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .wc-countdown-section {
          padding: 80px 0;
          background: #f4f6fa;
          position: relative;
        }

        .countdown-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(10px);
        }

        .countdown-content {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }

        .limited-tag {
          font-size: 0.75rem;
          font-weight: 800;
          color: #b8860b;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 15px;
          border: 1px solid rgba(184, 134, 11, 0.3);
          padding: 4px 12px;
          border-radius: 4px;
          background: rgba(184, 134, 11, 0.05);
        }



        .title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #151821;
          margin-bottom: 15px;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .description {
          font-size: 1.05rem;
          color: #4a4f5d;
          line-height: 1.6;
          margin-bottom: 35px;
          text-align: justify;
        }

        .timer-wrapper {
          margin-bottom: 40px;
          width: 100%;
        }

        .timer-label {
          font-size: 0.85rem;
          font-weight: 800;
          color: #6c7281;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          display: block;
        }

        .timer-grid {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .timer-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 75px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }

        .timer-num {
          font-size: 2rem;
          font-weight: 800;
          color: #151821;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .timer-unit {
          font-size: 0.65rem;
          color: #6c7281;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .timer-divider {
          font-size: 1.8rem;
          font-weight: 700;
          color: #d4af37;
          line-height: 1;
        }

        .action-wrapper {
          display: flex;
          align-items: center;
          gap: 25px;
          width: 100%;
        }

        .cta-button-gold {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #f3e5ab 100%);
          color: #000000;
          font-size: 0.95rem;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 15px 35px;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          text-decoration: none;
        }

        .cta-button-gold:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
        }

        .arrow {
          font-size: 1.1rem;
          transition: transform 0.3s ease;
        }

        .cta-button-gold:hover .arrow {
          transform: translateX(4px);
        }

        .stock-alert {
          font-size: 0.8rem;
          font-weight: 800;
          color: #d32f2f;
          animation: pulseStock 2s infinite;
        }

        @keyframes pulseStock {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .countdown-image-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f6fa 0%, #eef0f5 100%);
          border-left: 1px solid rgba(212, 175, 55, 0.15);
        }

        .glow-backdrop {
          position: absolute;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
          z-index: 1;
        }

        .teaser-image {
          object-fit: cover;
          width: 100%;
          height: 100%;
          z-index: 2;
          position: relative;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .countdown-card {
            grid-template-columns: 1fr;
          }
          .countdown-content {
            padding: 40px;
          }
          .countdown-image-wrapper {
            display: none !important;
          }
        }

        @media (max-width: 600px) {
          .countdown-content {
            padding: 30px 20px;
          }
          .title {
            font-size: 1.8rem;
          }
          .timer-grid {
            gap: 8px;
          }
          .timer-item {
            min-width: 60px;
            padding: 8px 4px;
          }
          .timer-num {
            font-size: 1.5rem;
          }
          .action-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .cta-button-gold {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
