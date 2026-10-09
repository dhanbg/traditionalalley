import React from "react";

export default function CollectionsLoader() {
  return (
    <div className="collections-loader-wrap py-5">
      <div className="container">
        {/* Animated indicator */}
        <div className="loader-center-indicator">
          <div className="pulse-spinner">
            <span className="spinner-core"></span>
            <span className="spinner-ring ring-1"></span>
            <span className="spinner-ring ring-2"></span>
          </div>
          <span className="loader-badge">
            <span className="sparkle">✦</span> Loading Collections
          </span>
        </div>

        {/* Modern Skeleton Cards Grid */}
        <div className="row g-3 g-md-4 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="col-lg-3 col-md-4 col-sm-6 col-6">
              <div className="skeleton-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="skeleton-thumb">
                  <div className="skeleton-shimmer"></div>
                </div>
                <div className="skeleton-meta">
                  <div className="skeleton-line title-line"></div>
                  <div className="skeleton-line sub-line"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .collections-loader-wrap {
          min-height: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .loader-center-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .pulse-spinner {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-core {
          width: 14px;
          height: 14px;
          background: #7a1c2e;
          border-radius: 50%;
          box-shadow: 0 0 16px rgba(122, 28, 46, 0.45);
          animation: corePulse 1.6s ease-in-out infinite;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #7a1c2e;
          animation: ringSpin 1.4s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
        }

        .ring-1 {
          border-right-color: rgba(122, 28, 46, 0.4);
        }

        .ring-2 {
          inset: -6px;
          border-top-color: rgba(122, 28, 46, 0.6);
          border-left-color: rgba(122, 28, 46, 0.2);
          animation-duration: 2s;
          animation-direction: reverse;
        }

        .loader-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(122, 28, 46, 0.06);
          color: #7a1c2e;
          border: 1px solid rgba(122, 28, 46, 0.15);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .sparkle {
          font-size: 12px;
          animation: sparkleSpin 2s linear infinite;
        }

        .skeleton-card {
          border-radius: 14px;
          overflow: hidden;
          background: #ffffff;
          padding: 8px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease;
        }

        :global(html.dark) .skeleton-card {
          background: #181a20;
          border-color: rgba(255, 255, 255, 0.06);
        }

        .skeleton-thumb {
          position: relative;
          aspect-ratio: 3 / 4;
          width: 100%;
          background: #edeef2;
          border-radius: 10px;
          overflow: hidden;
        }

        :global(html.dark) .skeleton-thumb {
          background: #242731;
        }

        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: shimmerFlow 1.8s infinite;
        }

        :global(html.dark) .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
        }

        .skeleton-meta {
          padding: 12px 6px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .skeleton-line {
          height: 12px;
          background: #edeef2;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        :global(html.dark) .skeleton-line {
          background: #242731;
        }

        .skeleton-line::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: shimmerFlow 1.8s infinite;
        }

        :global(html.dark) .skeleton-line::after {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
        }

        .title-line {
          width: 70%;
          height: 14px;
        }

        .sub-line {
          width: 40%;
          height: 10px;
        }

        @keyframes corePulse {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes ringSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes sparkleSpin {
          0% {
            transform: rotate(0deg) scale(0.9);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(0.9);
          }
        }

        @keyframes shimmerFlow {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
