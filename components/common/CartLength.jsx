"use client";

import { useContextElement } from "@/context/Context";

export default function CartLength() {
  const { getSelectedCartItems } = useContextElement();
  return <>{getSelectedCartItems().length}</>;
}
