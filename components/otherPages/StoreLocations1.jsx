import React from "react";

export default function StoreLocations1() {
  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-md-5 col-12">
            <div className="tf-store-list">
              <div className="tf-store-item">
                <h6 className="tf-store-title">New York Office</h6>
                <div className="tf-store-contact">
                  <div className="tf-store-info">
                    <p className="text-button">Phone:</p>
                    <p className="text-secondary">+1 666 234 8888</p>
                  </div>
                  <div className="tf-store-info">
                    <p className="text-button">Email:</p>
                    <p className="text-secondary">traditionalalley.com.np</p>
                  </div>
                </div>
                <div className="tf-store-address tf-store-info">
                  <p className="text-button">Address:</p>
                  <p className="text-secondary">
                    432 Park Avenue, New York, New York
                  </p>
                </div>
              </div>
              <div className="tf-store-item">
                <h6 className="tf-store-title">Houston Office</h6>
                <div className="tf-store-contact">
                  <div className="tf-store-info">
                    <p className="text-button">Phone:</p>
                    <p className="text-secondary">+1 713 432 8765</p>
                  </div>
                  <div className="tf-store-info">
                    <p className="text-button">Email:</p>
                    <p className="text-secondary">traditionalalley.com.np</p>
                  </div>
                </div>
                <div className="tf-store-address tf-store-info">
                  <p className="text-button">Address:</p>
                  <p className="text-secondary">
                    789 Main Street, Houston, Texas
                  </p>
                </div>
              </div>
              <div className="tf-store-item">
                <h6 className="tf-store-title">San Francisco Office</h6>
                <div className="tf-store-contact">
                  <div className="tf-store-info">
                    <p className="text-button">Phone:</p>
                    <p className="text-secondary">+1 415 987 6543</p>
                  </div>
                  <div className="tf-store-info">
                    <p className="text-button">Email:</p>
                    <p className="text-secondary">traditionalalley.com.np</p>
                  </div>
                </div>
                <div className="tf-store-address tf-store-info">
                  <p className="text-button">Address:</p>
                  <p className="text-secondary">
                    321 Market Street, San Francisco, California
                  </p>
                </div>
              </div>
              <div className="tf-store-item">
                <h6 className="tf-store-title">Miami Office</h6>
                <div className="tf-store-contact">
                  <div className="tf-store-info">
                    <p className="text-button">Phone:</p>
                    <p className="text-secondary">+1 305 543 2109</p>
                  </div>
                  <div className="tf-store-info">
                    <p className="text-button">Email:</p>
                    <p className="text-secondary">traditionalalley.com.np</p>
                  </div>
                </div>
                <div className="tf-store-address tf-store-info">
                  <p className="text-button">Address:</p>
                  <p className="text-secondary">
                    Address: 654 Ocean Drive, Miami, Florida
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-8 col-md-7 col-12">
            <div className="wrap-map">
              <div
                id="map-contact"
                className="map-contact"
                data-map-zoom={16}
                data-map-scroll="true"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d220.89288716385607!2d85.33165326745913!3d27.646615799999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb17687d3c1077%3A0x2a49d4958a1213b2!2sJ8WJ%2BMPH%2C%20Lalitpur%2044700!5e0!3m2!1sen!2snp!4v1739266687689!5m2!1sen!2snp"
                  width={800}
                  height={600}
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
