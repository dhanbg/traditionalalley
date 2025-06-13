"use client";
import { usePathname } from "next/navigation";
import "../public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "../public/css/image-compare-viewer.min.css";
import "../public/css/custom.css"; // Custom CSS for compare products
import "../public/css/drift-basic.min.css"; // Drift zoom CSS
import { useEffect, useState, useRef } from "react";
import Context from "@/context/Context";
import CartModal from "@/components/modals/CartModal";
import QuickView from "@/components/modals/QuickView";
import QuickAdd from "@/components/modals/QuickAdd";
import Compare from "@/components/modals/Compare";
import MobileMenu from "@/components/modals/MobileMenu";
// import NewsLetterModal from "@/components/modals/NewsLetterModal";
import SearchModal from "@/components/modals/SearchModal";
import SizeGuide from "@/components/modals/SizeGuide";
import Wishlist from "@/components/modals/Wishlist";
import DemoModal from "@/components/modals/DemoModal";
import Categories from "@/components/modals/Categories";
import ScrollTop from "@/components/common/ScrollTop";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Import the script only on the client side
      import("bootstrap/dist/js/bootstrap.esm").then(() => {
        // Module is imported, you can access any exported functionality if needed
      }).catch((error) => {
        console.warn('Bootstrap import failed:', error);
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add("header-bg");
        } else {
          header.classList.remove("header-bg");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  useEffect(() => {
    setScrollDirection("up");
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 250) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setScrollDirection("down");
        } else {
          // Scrolling up
          setScrollDirection("up");
        }
      } else {
        // Below 250px
        setScrollDirection("down");
      }

      lastScrollY.current = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    // Close any open modal
    if (typeof window !== "undefined") {
      try {
        import("bootstrap").then((bootstrap) => {
          const modalElements = document.querySelectorAll(".modal.show");
          modalElements.forEach((modal) => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
              modalInstance.hide();
            }
          });

          // Close any open offcanvas
          const offcanvasElements = document.querySelectorAll(".offcanvas.show");
          offcanvasElements.forEach((offcanvas) => {
            const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
            if (offcanvasInstance) {
              offcanvasInstance.hide();
            }
          });
        }).catch((error) => {
          console.warn('Bootstrap modal cleanup failed:', error);
        });
      } catch (error) {
        console.warn('Bootstrap import error:', error);
      }
    }
  }, [pathname]); // Runs every time the route changes

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      if (scrollDirection == "up") {
        header.style.top = "0px";
      } else {
        header.style.top = "-185px";
      }
    }
  }, [scrollDirection]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const WOW = require("@/utils/wow");
        const wow = new WOW.default({
          mobile: false,
          live: false,
        });
        wow.init();
      } catch (error) {
        console.warn('WOW.js initialization failed:', error);
      }
    }
  }, [pathname]);

  return (
    <ClerkProvider>
    <html lang="en">
      <body className="preload-wrapper popup-loader" suppressHydrationWarning={true}>
        <Context>
          <div id="wrapper">{children}</div>
          <CartModal />
          <QuickView />
          <QuickAdd />
          <Compare />
          <MobileMenu />

          {/* <NewsLetterModal /> */}
          <SearchModal />
          <SizeGuide />
          <Wishlist />
          <DemoModal />
          <Categories />
          <ScrollTop />

          {/* WhatsApp Floating Button */}
          <a
            href="https://wa.me/9779844594187"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 10000,
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'box-shadow 0.2s',
            }}
            aria-label="Chat with us on WhatsApp"
          >
            <img
              src="/whatsapp.svg"
              alt="WhatsApp"
              style={{ width: '38px', height: '38px', display: 'block' }}
            />
          </a>
        </Context>
      </body>
    </html>
    </ClerkProvider>
  );
}
