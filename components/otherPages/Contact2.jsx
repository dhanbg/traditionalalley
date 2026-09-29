"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
export default function Contact2() {
  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const sendMail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("service_noj8796", "template_fs3xchn", formRef.current, {
        publicKey: "iG4SCmR-YtJagQ4gV",
      })
      .then((res) => {
        if (res.status === 200) {
          setSuccess(true);
          handleShowMessage();

          // Track Meta Pixel Contact event
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Contact', {
              contact_method: 'contact_form',
            });
            console.log('📢 [META-PIXEL] Tracked Contact event (Contact Form)');
          }

          // Google Analytics / GTM contact event
          if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
              event: 'contact',
              method: 'contact_form',
            });
          }

          formRef.current.reset();
        } else {
          setSuccess(false);
          handleShowMessage();
        }
      })
      .catch((err) => {
        // Remove console.log statements
      });
  };
  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="contact-us-content">
          <div className="left">
            <h4>Get In Touch</h4>
            <p className="text-secondary-2">
              Use the form below to get in touch with the sales team
            </p>
            <div
              className={`tfSubscribeMsg  footer-sub-element ${
                showMessage ? "active" : ""
              }`}
            >
              {success ? (
                <p style={{ color: "rgb(52, 168, 83)" }}>
                  You have successfully subscribed.
                </p>
              ) : (
                <p style={{ color: "red" }}>Something went wrong</p>
              )}
            </div>
            <form
              onSubmit={sendMail}
              ref={formRef}
              id="contactform"
              className="form-leave-comment"
            >
              <div className="wrap">
                <div className="cols">
                  <fieldset className="">
                    <input
                      className=""
                      type="text"
                      placeholder="Your Name*"
                      name="name"
                      id="name"
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                    />
                  </fieldset>
                  <fieldset className="">
                    <input
                      className=""
                      type="email"
                      placeholder="Your Email*"
                      name="email"
                      id="email"
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                    />
                  </fieldset>
                </div>
                <fieldset className="">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    placeholder="Your Message*"
                    tabIndex={2}
                    aria-required="true"
                    required
                    defaultValue={""}
                  />
                </fieldset>
              </div>
              <div className="button-submit send-wrap">
                <button className="tf-btn btn-fill" type="submit">
                  <span className="text text-button">Send message</span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4>Information</h4>
            <div className="mb_20">
              <div className="text-title mb_8">Phone:</div>
              <p className="text-secondary">
                <a href="tel:+9779844594187" className="text-secondary">+977 9844594187</a>
              </p>
            </div>
            <div className="mb_20">
              <div className="text-title mb_8">Email:</div>
              <p className="text-secondary">
                <a href="mailto:contact@traditionalalley.com.np" className="text-secondary">contact@traditionalalley.com.np</a>
              </p>
            </div>
            <div className="mb_20">
              <div className="text-title mb_8">Address:</div>
              <p className="text-secondary">
                44700 Hattiban, Lalitpur, Bagmati, Nepal
              </p>
            </div>
            <div>
              <div className="text-title mb_8">Open Time:</div>
              <p className="mb_4 open-time">
                <span className="text-secondary">Mon - Sun:</span> 10:00am - 7:00pm NPT
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
