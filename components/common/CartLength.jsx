"use client";

import { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";

export default function CartLength() {
  const [mounted, setMounted] = useState(false);
  const { getSelectedCartItems } = useContextElement();

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{mounted ? (getSelectedCartItems()?.length || 0) : 0}</>;
}

