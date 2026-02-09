"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";

export default function DiagnosticPage() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-12">
            <h1 className="text-3xl font-bold mb-8">Skiper58 Diagnostic Test</h1>

            {/* Test 1: Basic Framer Motion */}
            <div className="mb-12 p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Test 1: Basic Framer Motion Animation</h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-600 rounded"
                >
                    If you see this with fade-in effect, Framer Motion is working ✓
                </motion.div>
            </div>

            {/* Test 2: Hover Animation */}
            <div className="mb-12 p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Test 2: Hover Animation (whileHover)</h2>
                <motion.div
                    whileHover={{ scale: 1.1, backgroundColor: "#10b981" }}
                    className="p-4 bg-purple-600 rounded cursor-pointer"
                >
                    Hover over me - I should scale up and turn green
                </motion.div>
            </div>

            {/* Test 3: Variants Animation */}
            <div className="mb-12 p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Test 3: Variants (like TextRoll uses)</h2>
                <motion.div
                    initial="initial"
                    whileHover="hovered"
                    variants={{
                        initial: { y: 0 },
                        hovered: { y: -20 }
                    }}
                    className="p-4 bg-orange-600 rounded cursor-pointer"
                >
                    Hover - I should move up using variants
                </motion.div>
            </div>

            {/* Test 4: TextRoll Letter Animation */}
            <div className="mb-12 p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Test 4: Letter-by-Letter Animation (TextRoll logic)</h2>
                <motion.span
                    initial="initial"
                    whileHover="hovered"
                    className="relative block overflow-hidden text-4xl font-bold cursor-pointer"
                    style={{ lineHeight: 0.75 }}
                >
                    <div>
                        {"HOVER".split("").map((letter, i) => (
                            <motion.span
                                key={i}
                                variants={{
                                    initial: { y: 0 },
                                    hovered: { y: "-100%" }
                                }}
                                transition={{ ease: "easeInOut", delay: i * 0.035 }}
                                className="inline-block"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                    <div className="absolute inset-0 text-green-400">
                        {"HOVER".split("").map((letter, i) => (
                            <motion.span
                                key={i}
                                variants={{
                                    initial: { y: "100%" },
                                    hovered: { y: 0 }
                                }}
                                transition={{ ease: "easeInOut", delay: i * 0.035 }}
                                className="inline-block"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                </motion.span>
                <p className="text-sm text-gray-400 mt-4">
                    Hover the word - green letters should roll in from below
                </p>
            </div>

            {/* Test 5: Backdrop Blur */}
            <div className="mb-12 p-6 bg-slate-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Test 5: Backdrop Blur (Glassmorphism)</h2>
                <div className="relative h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <div
                        className="p-8 rounded-xl text-white font-bold text-xl"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        This should have a frosted glass effect
                    </div>
                </div>
            </div>

            <div className="p-6 bg-green-900 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
                <p>Check each test above. Report which tests PASS and which FAIL.</p>
                <p className="mt-2">This will help identify the exact issue!</p>
            </div>
        </div>
    );
}
