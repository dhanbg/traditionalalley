"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Context from "@/context/Context";
import { ToastProvider } from "@/context/ToastContext";
import ScrollTop from "@/components/common/ScrollTop";
import NextTopLoader from 'nextjs-toploader';
import CenterLoader from "@/components/common/CenterLoader";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ui/skiper-ui/theme-provider";
import ThemeToggleButton from "@/components/ui/skiper-ui/theme-toggle-button";
import QueryProvider from "@/providers/QueryProvider";

// Code-split heavy modals and non-critical widgets to reduce initial bundle size
const CartModal = dynamic(() => import("@/components/modals/CartModal"), { ssr: false });
const Compare = dynamic(() => import("@/components/modals/Compare"), { ssr: false });
const MobileMenu = dynamic(() => import("@/components/modals/MobileMenu"), { ssr: false });
const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), { ssr: false });
const SizeGuide = dynamic(() => import("@/components/modals/SizeGuide"), { ssr: false });
const Categories = dynamic(() => import("@/components/modals/Categories"), { ssr: false });
const EnhancedWhatsApp = dynamic(() => import("@/components/common/EnhancedWhatsApp"), { ssr: false });

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm").catch(() => {});
    }
  }, []);
  
  // Consolidated throttled scroll handler with requestAnimationFrame and passive listener
  useEffect(() => {
    if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const header = document.querySelector("header");

          if (header) {
            // Background toggle
            if (currentScrollY > 100) {
              header.classList.add("header-bg");
            } else {
              header.classList.remove("header-bg");
            }

            // Direction & hide/show
            if (currentScrollY > 250) {
              if (currentScrollY > lastScrollY) {
                header.style.top = "-185px";
              } else {
                header.style.top = "0px";
              }
            } else {
              header.style.top = "0px";
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    // Close any open modal on route change
    const closeModalsAndOffcanvas = async () => {
      try {
        const bootstrap = await import("bootstrap/dist/js/bootstrap.esm.js");
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
  }, [pathname]);

  useEffect(() => {
    let wowInstance = null;
    import("@/utils/wow").then((WOW) => {
      wowInstance = new (WOW.default || WOW)({
        mobile: false,
        live: false,
      });
      wowInstance.init();
    }).catch(() => {});

    return () => {
      if (wowInstance && typeof wowInstance.stop === "function") {
        wowInstance.stop();
      }
    };
  }, [pathname]);

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ToastProvider>
            <Context>
              <NextTopLoader showSpinner={false} />
              <CenterLoader />
              <div id="wrapper">{children}</div>
              <CartModal />
              <Compare />
              <MobileMenu />
              <SearchModal />
              <SizeGuide />
              <Categories />
              <ScrollTop />
              <EnhancedWhatsApp />
              {/* Floating Dark Mode Toggle Button */}
              <ThemeToggleButton className="floating-theme-toggle" start="bottom-left" />
            </Context>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}