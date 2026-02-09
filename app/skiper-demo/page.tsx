"use client";
import React from "react";
import { Skiper40 } from "@/components/ui/skiper-ui/skiper40";
import { SkiperCard } from "@/components/ui/skiper-ui/skiper-card";
import { MinimalCard, MinimalCardImage, MinimalCardTitle, MinimalCardDescription, MinimalCardContent, MinimalCardFooter } from "@/components/ui/skiper-ui/minimal-card";
import Link from "next/link";

// Import demo images (using placeholders if specific ones aren't available, but adapting to project)
import card1 from "@/public/images/card1.webp"; // Assuming this exists from previous `ls`

export default function SkiperDemoPage() {
    const demoImages = {
        step1dark1: card1,
        step1dark2: card1,
        step1light1: card1,
        step1light2: card1,
        step2dark1: card1,
        step2dark2: card1,
        step2light1: card1,
        step2light2: card1,
        step3dark: card1,
        step3light: card1,
        step4light: card1,
        alt: "Demo Image"
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 md:p-20 font-sans">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Skiper UI Showcase</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    This page demonstrates the newly installed Skiper UI components and the global design system integration.
                    The colors and fonts are now powered by the Skiper UI theme (OKLCH).
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition">
                        Back to Home
                    </Link>
                </div>
            </header>

            <section className="mb-20">
                <h2 className="text-2xl font-semibold mb-8 border-b pb-2">1. Animated Links (Skiper40)</h2>
                <div className="h-[200px] border rounded-xl overflow-hidden bg-card relative">
                    <Skiper40 />
                </div>
            </section>

            <section className="mb-20">
                <h2 className="text-2xl font-semibold mb-8 border-b pb-2">2. Feature Cards (SkiperCard)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SkiperCard
                        title="Interactive Features"
                        description="Hover over this card to see the spotlight effect. It uses motion/react for smooth animations."
                        image={demoImages}
                    />
                    <SkiperCard
                        title="Responsive Design"
                        description="These cards adapt to screen size and support dark mode automatically."
                        image={demoImages}
                    />
                </div>
            </section>

            <section className="mb-20">
                <h2 className="text-2xl font-semibold mb-8 border-b pb-2">3. Minimal Cards</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <MinimalCard key={i}>
                            <MinimalCardImage src={card1.src} alt="Minimal Card" />
                            <MinimalCardContent>
                                <MinimalCardTitle>Minimal Card {i}</MinimalCardTitle>
                                <MinimalCardDescription>
                                    Clean, simple, and elegant. Perfect for blogs or product listings.
                                </MinimalCardDescription>
                            </MinimalCardContent>
                            <MinimalCardFooter>
                                <button className="text-sm font-medium text-primary">Read More →</button>
                            </MinimalCardFooter>
                        </MinimalCard>
                    ))}
                </div>
            </section>

            <section className="mb-20">
                <h2 className="text-2xl font-semibold mb-8 border-b pb-2">4. Color System Test</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-lg bg-background border flex flex-col items-center justify-center aspect-square shadow-sm">
                        <span className="font-bold">Background</span>
                        <span className="text-xs text-muted-foreground">var(--background)</span>
                    </div>
                    <div className="p-6 rounded-lg bg-card border flex flex-col items-center justify-center aspect-square shadow-sm">
                        <span className="font-bold">Card</span>
                        <span className="text-xs text-muted-foreground">var(--card)</span>
                    </div>
                    <div className="p-6 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center aspect-square shadow-sm">
                        <span className="font-bold">Primary</span>
                        <span className="text-xs opacity-80">var(--primary)</span>
                    </div>
                    <div className="p-6 rounded-lg bg-secondary text-secondary-foreground flex flex-col items-center justify-center aspect-square shadow-sm">
                        <span className="font-bold">Secondary</span>
                        <span className="text-xs opacity-80">var(--secondary)</span>
                    </div>
                    <div className="p-6 rounded-lg bg-accent text-accent-foreground flex flex-col items-center justify-center aspect-square shadow-sm">
                        <span className="font-bold">Accent</span>
                        <span className="text-xs opacity-80">var(--accent)</span>
                    </div>
                    <div className="p-6 rounded-lg bg-brand-400 text-black flex flex-col items-center justify-center aspect-square shadow-sm">
                        <span className="font-bold">Brand 400</span>
                        <span className="text-xs opacity-80">#A3D65C</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
