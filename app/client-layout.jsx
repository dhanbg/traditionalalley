"use client";
import { usePathname } from "next/navigation";
import "../public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "../public/css/image-compare-viewer.min.css";
import "../public/css/custom.css"; // Custom CSS for compare products
import "../public/css/drift-basic.min.css"; // Drift zoom CSS
import { useEffect, useState } from "react";
import Context from "@/context/Context";
import { ToastProvider } from "@/context/ToastContext";
import CartModal from "@/components/modals/CartModal";


import Compare from "@/components/modals/Compare";
import MobileMenu from "@/components/modals/MobileMenu";
// import NewsLetterModal from "@/components/modals/NewsLetterModal";
import SearchModal from "@/components/modals/SearchModal";
import SizeGuide from "@/components/modals/SizeGuide";
import Wishlist from "@/components/modals/Wishlist";
import DemoModal from "@/components/modals/DemoModal";
import Categories from "@/components/modals/Categories";
import ScrollTop from "@/components/common/ScrollTop";
import NextTopLoader from 'nextjs-toploader';
import EnhancedWhatsApp from "@/components/common/EnhancedWhatsApp";
import CenterLoader from "@/components/common/CenterLoader";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Import the script only on the client side
      import("bootstrap/dist/js/bootstrap.esm").then(() => {
        // Module is imported, you can access any exported functionality if
      });
    }
  }, []);
  useEffect(() => {
    // Skip header effects for dashboard and admin pages
    if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
      return;
    }

    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) { // Add null check
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
  }, [pathname]); // Add pathname dependency

  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    // Skip scroll direction tracking for dashboard and admin pages
    if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
      return;
    }

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

    const lastScrollY = { current: window.scrollY };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);
  useEffect(() => {
    // Close any open modal
    const closeModalsAndOffcanvas = async () => {
      try {
        const bootstrap = await import("bootstrap/dist/js/bootstrap.esm.js");
        
        // Check if Modal is available
        const Modal = bootstrap.Modal || bootstrap.default?.Modal;
        if (Modal) {
          const modalElements = document.querySelectorAll(".modal.show");
          modalElements.forEach((modal) => {
            const modalInstance = Modal.getInstance(modal);
            if (modalInstance) {
              modalInstance.hide();
            }
          });
        }

        // Close any open offcanvas
        const Offcanvas = bootstrap.Offcanvas || bootstrap.default?.Offcanvas;
        if (Offcanvas) {
          const offcanvasElements = document.querySelectorAll(".offcanvas.show");
          offcanvasElements.forEach((offcanvas) => {
            const offcanvasInstance = Offcanvas.getInstance(offcanvas);
            if (offcanvasInstance) {
              offcanvasInstance.hide();
            }
          });
        }
      } catch (error) {
        console.error("Error closing modals and offcanvas:", error);
      }
    };
    
    closeModalsAndOffcanvas();
  }, [pathname]); // Runs every time the route changes

  useEffect(() => {
    // Skip header effects for dashboard and admin pages
    if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
      return;
    }

    const header = document.querySelector("header");
    if (header) { // This already has null check, good
      if (scrollDirection == "up") {
        header.style.top = "0px";
      } else {
        header.style.top = "-185px";
      }
    }
  }, [scrollDirection, pathname]);
  useEffect(() => {
    const WOW = require("@/utils/wow");
    const wow = new WOW.default({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [pathname]);

  return (
    <SessionProvider>
      <ToastProvider>
        <Context>
          <NextTopLoader showSpinner={false} />
          <CenterLoader />
          <div id="wrapper">{children}</div>
          <CartModal />
          <Compare />
          <MobileMenu />
          {/* <NewsLetterModal /> */}
          <SearchModal />
          <SizeGuide />
          <Wishlist />
          <DemoModal />
          <Categories />
          <ScrollTop />
          {/* Enhanced WhatsApp Component */}
          <EnhancedWhatsApp />
        </Context>
      </ToastProvider>
    </SessionProvider>
  );
}
