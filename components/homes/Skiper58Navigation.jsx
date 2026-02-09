"use client";

import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";

const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Women", href: "/women" },
    { name: "Men", href: "/men" },
    { name: "Blogs", href: "/blog-list" },
];

const STAGGER = 0.035;

const TextRoll = ({ children, center = false }) => {
    return (
        <motion.span
            initial="initial"
            whileHover="hovered"
            style={{
                position: "relative",
                display: "block",
                overflow: "hidden",
                lineHeight: 1, // Tighter line height
                fontFamily: "skip, sans-serif",
                fontSize: "1rem", // 16px to match standard nav
                fontWeight: 500, // Reduced from 800 for a cleaner look
                textTransform: "uppercase",
                letterSpacing: "0", // Standard spacing
                color: "black", // Changed to black
            }}
        >
            <div>
                {children.split("").map((l, i) => {
                    const delay = center
                        ? STAGGER * Math.abs(i - (children.length - 1) / 2)
                        : STAGGER * i;
                    return (
                        <motion.span
                            variants={{
                                initial: { y: 0 },
                                hovered: { y: "-100%" },
                            }}
                            transition={{ ease: "easeInOut", delay }}
                            style={{ display: "inline-block" }}
                            key={i}
                        >
                            {l === " " ? "\u00A0" : l}
                        </motion.span>
                    );
                })}
            </div>
            <div style={{ position: "absolute", inset: 0 }}>
                {children.split("").map((l, i) => {
                    const delay = center
                        ? STAGGER * Math.abs(i - (children.length - 1) / 2)
                        : STAGGER * i;
                    return (
                        <motion.span
                            variants={{
                                initial: { y: "100%" },
                                hovered: { y: 0 },
                            }}
                            transition={{ ease: "easeInOut", delay }}
                            style={{ display: "inline-block" }}
                            key={i}
                        >
                            {l === " " ? "\u00A0" : l}
                        </motion.span>
                    );
                })}
            </div>
        </motion.span>
    );
};

export default function Skiper58Navigation() {
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "10px 0",
            }}
        >
            <ul
                style={{
                    display: "flex",
                    flexDirection: "row", // Horizontal layout for header
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2rem",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    // Removed all container styling (bg, border, shadow)
                }}
            >
                {navigationItems.map((item, index) => (
                    <li
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        key={index}
                    >
                        <Link href={item.href} style={{ textDecoration: "none" }}>
                            <TextRoll center>{item.name}</TextRoll>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
