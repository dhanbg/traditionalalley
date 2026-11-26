"use client";
import React, { useEffect, useState } from "react";

/**
 * Renders an email address without contiguous `user@domain` text or `mailto:`
 * in SSR HTML so Cloudflare Email Address Obfuscation cannot rewrite DOM nodes
 * before React hydration.
 */
export default function SafeEmail({
  user,
  domain,
  asLink = false,
  className,
  style,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const email = `${user}@${domain}`;

  if (!asLink) {
    return (
      <span className={className} style={style}>
        {user}
        <span>{"@"}</span>
        {domain}
      </span>
    );
  }

  return (
    <a
      href={mounted ? `mailto:${email}` : "#"}
      className={className}
      style={style}
      aria-label={mounted ? email : undefined}
    >
      {user}
      <span>{"@"}</span>
      {domain}
    </a>
  );
}

