import React from "react";

export default function MarqueeSection() {
  const marqueeStyle = {
    padding: '3px 0px', // Reduced from 6px to 3px
    fontSize: '14px' // Reduced font size
  };

  const textStyle = {
    fontSize: '14px', // Reduced from 18px to 14px
    fontWeight: '500' // Slightly reduced font weight
  };

  const iconStyle = {
    fontSize: '16px' // Reduced from 20px to 16px
  };

  return (
    <section className="pt-0">
      <div className="tf-marquee marquee-style2 marquee-animation-right" style={marqueeStyle}>
        <div className="marquee-wrapper" style={{ display: 'flex', width: '200%' }}>
          <div className="initial-child-container" style={{ display: 'flex', minWidth: '50%', flexShrink: 0 }}>
            {/* First set of marquee items */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>

            {/* 2 */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>

            {/* 3 */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>

            {/* 4 */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>
          </div>
          
          {/* Duplicate content for seamless loop */}
          <div className="initial-child-container" style={{ display: 'flex', minWidth: '50%', flexShrink: 0 }}>
            {/* First set of marquee items */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>

            {/* 2 */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>

            {/* 3 */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>

            {/* 4 */}
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>10% OFF FIRST PURCHASE</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-tag" style={iconStyle} />
            </div>
            <div className="marquee-child-item">
              <h3 className="text-uppercase" style={textStyle}>EXCLUSIVE DEALS</h3>
            </div>
            <div className="marquee-child-item">
              <span className="icon icon-lightning" style={iconStyle} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
