"use client";

import { motion } from "framer-motion";
import React from "react";

const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Components", href: "/components" },
    { name: "Pricing", href: "/pricing" },
    { name: "How to use", href: "/docs/quick-start" },
    { name: "Account", href: "/user" },
    { name: "Login", href: "/login" },
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
                lineHeight: 0.75,
                fontFamily: "skip, sans-serif",
                fontSize: "clamp(2.5rem, 5vw, 3rem)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                color: "white",
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

const Skiper58 = () => {
    return (
        <ul
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                borderRadius: "1rem",
                padding: "2rem 1.75rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                listStyle: "none",
                margin: 0,
                width: "100%",
                maxWidth: "48rem",
            }}
        >
            {navigationItems.map((item, index) => (
                <li
                    style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    key={index}
                >
                    <TextRoll center>{item.name}</TextRoll>
                </li>
            ))}
        </ul>
    );
};

export default function Skiper58Page() {
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
                padding: "2rem",
            }}
        >
            <Skiper58 />
        </div>
    );
}
