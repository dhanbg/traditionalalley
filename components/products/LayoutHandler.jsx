import { useEffect } from "react";

export default function LayoutHandler({ setActiveLayout }) {
  useEffect(() => {
    const handleResize = () => {
      setActiveLayout(window.innerWidth < 768 ? 2 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setActiveLayout]);

  return null;
}
