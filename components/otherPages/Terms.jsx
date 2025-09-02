"use client";

import { useEffect, useState } from "react";

const sectionIds = [
  "welcome",
  "privacy",
  "electronic-communications",
  "copyright",
  "trademarks",
  "site-access",
  "your-account",
  "reviews-comments",
];
const sections = [
  { id: 1, text: "Welcome", scroll: "welcome" },
  { id: 2, text: "Privacy", scroll: "privacy" },
  {
    id: 3,
    text: "Electronic Communications",
    scroll: "electronic-communications",
  },
  {
    id: 4,
    text: "Copyright",
    scroll: "copyright",
  },
  { id: 5, text: "Trademarks", scroll: "trademarks" },
  { id: 6, text: "Site Access", scroll: "site-access" },
  { id: 7, text: "Your Account", scroll: "your-account" },
  { id: 8, text: "Reviews & Comments", scroll: "reviews-comments" },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    // Create an IntersectionObserver to track visibility of sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Update active section when the section is visible in the viewport
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px", // Trigger when section is 50% visible
      }
    );

    // Observe each section
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      // Cleanup the observer when the component unmounts
      observer.disconnect();
    };
  }, [sectionIds]);

  const handleClick = (id) => {
    document
      .getElementById(id)
      .scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="flat-spacing" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="right" style={{ margin: '0 auto', maxWidth: '800px', padding: '0 20px' }}>
            <h4 className="heading" style={{ marginBottom: '30px' }}>Terms of Use</h4>
            <div className="terms-of-use-item item-scroll-target" id="welcome" style={{ marginBottom: '40px' }}>
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>1. Welcome to Traditional Alley</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  Welcome to Traditional Alley.com.np and its affiliates provide their services to you subject to the following conditions. If you visit or shop at Traditional alley.com.np, you accept these conditions. Please read them carefully.
                </p>
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  In addition, when you use any current or future Traditional Alley.com.np service or visit or purchase from any business affiliated with Traditional alley.com.np, whether or not included in the Traditional alley.com.np Web site, you also will be subject to the guidelines and conditions applicable to such service or business.
                </p>
              </div>
            </div>
            <div className="terms-of-use-item item-scroll-target" id="privacy" style={{ marginBottom: '40px' }}>
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>2. Privacy</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  Please review our Privacy Policy, which also governs your visit to Traditional alley.com.np, to understand our practices.
                </p>
              </div>
            </div>
            <div
              className="terms-of-use-item item-scroll-target"
              id="electronic-communications"
              style={{ marginBottom: '40px' }}
            >
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>3. Electronic Communications</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  When you visit Traditional alley.com.np or send e-mails to us, you are communicating with us electronically. You consent to receive communications from us electronically.
                </p>
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  We will communicate with you by e-mail or by posting notices on this site. You agree that all agreements, notices, disclosures and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing.
                </p>
              </div>
            </div>
            <div
              className="terms-of-use-item item-scroll-target"
              id="copyright"
              style={{ marginBottom: '40px' }}
            >
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>
                4. Copyright
              </h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Traditional alley.com.np or its content suppliers.
                </p>
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  The compilation of all content on this site is the exclusive property of Traditional alley.com.np. All software used on this site is the property of Traditional alley.com.np or its software suppliers.
                </p>
              </div>
            </div>
            <div className="terms-of-use-item item-scroll-target" id="trademarks" style={{ marginBottom: '40px' }}>
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>5. Trademarks</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  Traditional Alley has filed its application for registration under the Trade and Merchandise Act and Rules at Kathmandu under different classes and awaiting registration. Any violation of our trademarks will be liable for legal action.
                </p>
              </div>
            </div>
            <div className="terms-of-use-item item-scroll-target" id="site-access" style={{ marginBottom: '40px' }}>
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>6. Site Access</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  Traditional Alley.com.np grants you a limited permission to access and make personal use of this site and not to download (other than page caching) or modify it, or any portion of it. This permission does not include any resale or commercial use of this site or its contents; any collection and use of any product listings, descriptions, or prices; any derivative use of this site or its contents; any downloading or copying of account information for the benefit of another merchant; or any use of data mining, robots, or similar data gathering and extraction tools.
                </p>
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  This site or any portion of this site may not be reproduced, duplicated, copied, sold, resold, visited, or otherwise exploited for any commercial purpose without express written consent of Traditional Alley.com.np. You may not use any proprietary information (including images, text, page layout, or form) of Traditional Alley.com.np and our affiliates without express written consent.
                </p>
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  You may not use any Meta tags or any other "hidden text" utilizing Traditional Alley.com.np's name or trademarks without the express written consent of Traditional Alley.com.np. Any unauthorized use terminates the permission granted by Traditional Alley.com.np You are granted a limited, revocable, and nonexclusive right to create a hyperlink to the home page of Traditional Alley.com.np so long as the link does not portray Traditional Alley.com.np, its affiliates, or their products or services in a false, misleading, derogatory, or otherwise offensive matter.
                </p>
              </div>
            </div>
            <div className="terms-of-use-item item-scroll-target" id="your-account" style={{ marginBottom: '40px' }}>
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>7. Your Account</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  If you use this site, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password. Traditional Alley.com.np and its affiliates reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders in their sole discretion.
                </p>
              </div>
            </div>
            <div className="terms-of-use-item item-scroll-target" id="reviews-comments" style={{ marginBottom: '40px' }}>
              <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>8. Reviews, Comments, Communications, And Other Content</h5>
              <div className="terms-of-use-content">
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  Visitors may post reviews, comments, and other content; send e-Gift Certificates and other communications; and submit suggestions, ideas, comments, questions, or other information, so long as the content is not illegal, obscene, threatening, defamatory, invasive of privacy, infringing of intellectual property rights, or otherwise injurious to third parties or objectionable and does not consist of or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings, or any form of "spam."
                </p>
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  You may not use a false e-mail address, impersonate any person or entity, or otherwise mislead as to the origin of a card or other content. Traditional Alley.com.np reserves the right (but not the obligation) to remove or edit such content, but does not regularly review posted content.
                </p>
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  If you do post content or submit material, and unless we indicate otherwise, you grant Traditional Alley.com.np and its affiliates a nonexclusive, royalty-free, perpetual, irrevocable, and fully sub licensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media. You grant Traditional Alley.com.np and its affiliates and sub licensees the right to use the name that you submit in connection with such content, if they choose.
                </p>
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  You represent and warrant that you own or otherwise control all of the rights to the content that you post; that the content is accurate; that use of the content you supply does not violate this policy and will not cause injury to any person or entity; and that you will indemnify Traditional Alley.com.np or its affiliates for all claims resulting from content you supply. Traditional Alley.com.np has the right but not the obligation to monitor and edit or remove any activity or content.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
