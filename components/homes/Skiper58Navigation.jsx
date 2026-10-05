"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchCollectionsCached } from "@/utils/api";
import { defaultNavigationCollections } from "@/data/defaultCollections";

const navigationItems = [
    { name: "Home", href: "/", categoryKey: null },
    { name: "Women", href: "/women", categoryKey: "women" },
    { name: "Men", href: "/men", categoryKey: "men" },
    { name: "Blogs", href: "/blog-list", categoryKey: null },
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
                fontFamily: '"Outfit", sans-serif',
                fontSize: "1rem", // 16px to match standard nav
                fontWeight: 500, // Reduced from 800 for a cleaner look
                textTransform: "uppercase",
                letterSpacing: "0", // Standard spacing
                color: "currentColor",
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

const DropdownItem = ({ collection, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={`/collections/${collection.slug}`}
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: isHovered ? "#FEF2F2" : "transparent",
                color: isHovered ? "#E43131" : "#2D3748",
                transform: isHovered ? "translateX(3px)" : "translateX(0)",
                transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span
                    style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: isHovered ? "#E43131" : "#CBD5E0",
                        flexShrink: 0,
                        transition: "background-color 0.2s, transform 0.2s",
                        transform: isHovered ? "scale(1.2)" : "scale(1)",
                    }}
                />
                <span
                    style={{
                        fontSize: "13.5px",
                        fontWeight: 500,
                        fontFamily: '"Outfit", sans-serif',
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {collection.name}
                </span>
            </div>
            <span
                style={{
                    fontSize: "12px",
                    color: "#E43131",
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateX(0)" : "translateX(-4px)",
                    transition: "all 0.18s ease",
                    marginLeft: "6px",
                }}
            >
                →
            </span>
        </Link>
    );
};

export default function Skiper58Navigation() {
    const pathname = usePathname();
    const [collections, setCollections] = useState(defaultNavigationCollections);
    const [activeCategory, setActiveCategory] = useState(null);
    const leaveTimeoutRef = useRef(null);

    // Fetch dynamic collections from API with caching and fallback to defaultNavigationCollections
    useEffect(() => {
        let isMounted = true;
        const loadCollections = async () => {
            try {
                const res = await fetchCollectionsCached();
                if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setCollections(res.data);
                }
            } catch (err) {
                console.error("Failed to load nav collections:", err);
            }
        };
        loadCollections();
        return () => {
            isMounted = false;
            if (leaveTimeoutRef.current) {
                clearTimeout(leaveTimeoutRef.current);
            }
        };
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setActiveCategory(null);
    }, [pathname]);

    // Group collections by category
    const categorizedCollections = useMemo(() => {
        const womenSlugs = [
            'graduation', 'kurtha', 'dresses', 'sareesets', 'corsets',
            'gown', 'bosslady', 'lehenga', 'tops', 'coordinates'
        ];
        const menSlugs = ['dauracoat', 'blazer', 'nepalidhaka'];

        const women = collections.filter(collection => {
            const slug = (collection.slug || '').toLowerCase();
            return womenSlugs.includes(slug) || collection.category?.title?.toLowerCase() === 'women';
        }).map(collection => ({
            name: collection.name || 'Unnamed Collection',
            slug: collection.slug || `collection-${collection.id}`,
            id: collection.id,
        }));

        const men = collections.filter(collection => {
            const slug = (collection.slug || '').toLowerCase();
            return menSlugs.includes(slug) || collection.category?.title?.toLowerCase() === 'men';
        }).map(collection => ({
            name: collection.name || 'Unnamed Collection',
            slug: collection.slug || `collection-${collection.id}`,
            id: collection.id,
        }));

        return { women, men };
    }, [collections]);

    const handleMouseEnter = (categoryKey) => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
        if (categoryKey) {
            setActiveCategory(categoryKey);
        }
    };

    const handleMouseLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
        }, 180);
    };

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "10px 0",
                position: "relative",
            }}
        >
            <style jsx global>{`
                .nav-category-item:hover .nav-dropdown-wrapper {
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: auto !important;
                    transform: translateX(-50%) translateY(0) !important;
                }
                .nav-category-item:hover .nav-chevron {
                    transform: rotate(180deg) !important;
                    color: #E43131 !important;
                    opacity: 1 !important;
                }
            `}</style>
            <ul
                style={{
                    display: "flex",
                    flexDirection: "row", // Horizontal layout for header
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2.2rem",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                }}
            >
                {navigationItems.map((item, index) => {
                    const hasCollections = Boolean(item.categoryKey && categorizedCollections[item.categoryKey]?.length > 0);
                    const isDropdownActive = activeCategory === item.categoryKey && hasCollections;
                    const categoryCollections = item.categoryKey ? (categorizedCollections[item.categoryKey] || []) : [];

                    return (
                        <li
                            key={index}
                            className={`nav-category-item ${isDropdownActive ? "is-active" : ""}`}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                            onMouseEnter={() => handleMouseEnter(item.categoryKey)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Link
                                href={item.href}
                                style={{
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "6px 0",
                                }}
                            >
                                <TextRoll center>{item.name}</TextRoll>
                                {hasCollections && (
                                    <svg
                                        className="nav-chevron"
                                        width="10"
                                        height="6"
                                        viewBox="0 0 10 6"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{
                                            marginLeft: "6px",
                                            display: "inline-block",
                                            color: isDropdownActive ? "#E43131" : "currentColor",
                                            opacity: isDropdownActive ? 1 : 0.65,
                                            transform: isDropdownActive ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease, color 0.2s ease, opacity 0.2s ease",
                                        }}
                                    >
                                        <path
                                            d="M1 1L5 5L9 1"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </Link>

                            {/* Dropdown Menu on Category Hover */}
                            {hasCollections && (
                                <div
                                    className={`nav-dropdown-wrapper ${isDropdownActive ? "is-open" : ""}`}
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: "50%",
                                        transform: `translateX(-50%) translateY(${isDropdownActive ? "0px" : "8px"})`,
                                        paddingTop: "14px", // Invisible hover bridge
                                        zIndex: 1050,
                                        opacity: isDropdownActive ? 1 : 0,
                                        visibility: isDropdownActive ? "visible" : "hidden",
                                        pointerEvents: isDropdownActive ? "auto" : "none",
                                        transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s",
                                    }}
                                    onMouseEnter={() => handleMouseEnter(item.categoryKey)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div
                                        style={{
                                            background: "rgba(255, 255, 255, 0.98)",
                                            backdropFilter: "blur(20px)",
                                            WebkitBackdropFilter: "blur(20px)",
                                            borderRadius: "16px",
                                            border: "1px solid rgba(0, 0, 0, 0.08)",
                                            boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(0, 0, 0, 0.04)",
                                            padding: "20px",
                                            width: item.categoryKey === "women" ? "460px" : "290px",
                                            boxSizing: "border-box",
                                            cursor: "default",
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                paddingBottom: "12px",
                                                borderBottom: "1px solid #F1F5F9",
                                                marginBottom: "14px",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span
                                                    style={{
                                                        fontFamily: '"Outfit", sans-serif',
                                                        fontWeight: 600,
                                                        fontSize: "0.95rem",
                                                        color: "#181818",
                                                        letterSpacing: "0.02em",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {item.name}&apos;s Collections
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        color: "#E43131",
                                                        backgroundColor: "#FEF2F2",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        lineHeight: "1.4",
                                                    }}
                                                >
                                                    {categoryCollections.length}
                                                </span>
                                            </div>
                                            <Link
                                                href={item.href}
                                                onClick={() => setActiveCategory(null)}
                                                style={{
                                                    fontFamily: '"Outfit", sans-serif',
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: "#E43131",
                                                    textDecoration: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    transition: "opacity 0.2s",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                                            >
                                                <span>View All</span>
                                                <span style={{ fontSize: "13px" }}>→</span>
                                            </Link>
                                        </div>

                                        {/* Collections Grid */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: item.categoryKey === "women" ? "repeat(2, 1fr)" : "1fr",
                                                gap: "4px 8px",
                                            }}
                                        >
                                            {categoryCollections.map((collection, colIdx) => (
                                                <DropdownItem
                                                    key={collection.id || collection.slug || colIdx}
                                                    collection={collection}
                                                    onSelect={() => setActiveCategory(null)}
                                                />
                                            ))}
                                        </div>

                                        {/* Bottom Footer Bar */}
                                        <div
                                            style={{
                                                marginTop: "14px",
                                                paddingTop: "12px",
                                                borderTop: "1px solid #F1F5F9",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#718096",
                                                    fontFamily: '"Kumbh Sans", sans-serif',
                                                }}
                                            >
                                                Authentic Nepali Ethnic Wear
                                            </span>
                                            <Link
                                                href="/collections"
                                                onClick={() => setActiveCategory(null)}
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color: "#181818",
                                                    textDecoration: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    transition: "color 0.2s",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = "#E43131")}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "#181818")}
                                            >
                                                <span>All Collections</span>
                                                <span>→</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
