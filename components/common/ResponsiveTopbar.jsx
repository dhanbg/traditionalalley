"use client";
import { useState, useEffect } from "react";
import Topbar6 from "@/components/headers/Topbar6";

export default function ResponsiveTopbar({ bgColor = "bg-blue-2" }) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Match the CSS breakpoint: max-width: 991.98px
      const desktop = window.innerWidth > 991.98;
      setIsDesktop(desktop);
    };

    // Set mounted to true after first render
    setMounted(true);
    
    // Check initial screen size
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Only render Topbar6 on desktop (matching CSS behavior)
  if (!isDesktop) {
    return null;
  }

  return <Topbar6 bgColor={bgColor} />;
}