import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import type { DashboardTab } from "../../App";
import { cn } from "@/lib/utils";

// Register GSAP Plugins safely
if (typeof window !== "undefined") {
    gsap.registerPlugin(CustomEase);
}

interface NavProps {
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
}

export function SterlingGateNavigation({ activeTab, onTabChange }: NavProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Initial Registration of Main Ease
    useEffect(() => {
        try {
            if (!gsap.parseEase("main")) {
                CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
            }
        } catch (e) {
            console.warn("GSAP Ease registration failed", e);
        }
    }, []);

    // Hover logic - Setup once on mount
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const menuItems = containerRef.current?.querySelectorAll(".menu-list-item[data-shape]");
            const shapesContainer = containerRef.current?.querySelector(".ambient-background-shapes");

            menuItems?.forEach((item) => {
                const shapeIndex = item.getAttribute("data-shape");
                const shape = shapesContainer?.querySelector(`.bg-shape-${shapeIndex}`);
                const linkText = item.querySelector(".nav-link-text");
                const hoverBg = item.querySelector(".nav-link-hover-bg");

                const onEnter = () => {
                    if (shape) gsap.to(shape, { opacity: 1, duration: 0.4 });
                    if (linkText) gsap.to(linkText, { x: 30, color: "#000000", duration: 0.3 });
                    if (hoverBg) gsap.to(hoverBg, { scaleX: 1, duration: 0.4, ease: "power2.out" });
                };

                const onLeave = () => {
                    if (shape) gsap.to(shape, { opacity: 0, duration: 0.3 });
                    if (linkText) {
                        gsap.to(linkText, {
                            x: 0,
                            color: item.getAttribute("data-active") === "true" ? "#FFCC00" : "#FFFFFF",
                            duration: 0.3
                        });
                    }
                    if (hoverBg) gsap.to(hoverBg, { scaleX: 0, duration: 0.3, ease: "power2.in" });
                };

                item.addEventListener("mouseenter", onEnter);
                item.addEventListener("mouseleave", onLeave);
            });
        }, containerRef.current);

        return () => ctx.revert();
    }, []);

    // Open/Close Animation trigger
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const backdropLayers = containerRef.current?.querySelectorAll(".backdrop-layer");
            const menuItems = containerRef.current?.querySelectorAll(".menu-list-item");
            const closeBtnText = containerRef.current?.querySelectorAll(".menu-button-text p");
            const closeBtnIcon = containerRef.current?.querySelector(".menu-button-icon");

            if (isMenuOpen) {
                // Open Animation
                if (backdropLayers && backdropLayers.length > 0) {
                    gsap.set(backdropLayers, { scaleY: 0, transformOrigin: "top" });
                }
                if (menuItems && menuItems.length > 0) {
                    gsap.set(menuItems, { y: 100, opacity: 0 });
                }

                const tl = gsap.timeline();
                if (backdropLayers && backdropLayers.length > 0) {
                    tl.to(backdropLayers, {
                        scaleY: 1,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "main"
                    });
                }
                if (menuItems && menuItems.length > 0) {
                    tl.to(menuItems, {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.05,
                        ease: "power3.out"
                    }, "-=0.4");
                }
                if (closeBtnText && closeBtnText.length > 0) {
                    tl.to(closeBtnText, { y: "-100%", duration: 0.5, ease: "main" }, 0);
                }
                if (closeBtnIcon) {
                    tl.to(closeBtnIcon, { rotate: 45, duration: 0.5, ease: "main" }, 0);
                }
            } else {
                // Close Animation
                const tl = gsap.timeline();
                if (menuItems && menuItems.length > 0) {
                    tl.to(menuItems, {
                        y: -50,
                        opacity: 0,
                        duration: 0.4,
                        stagger: 0.02,
                        ease: "power2.in"
                    });
                }
                if (backdropLayers && backdropLayers.length > 0) {
                    tl.to(backdropLayers, {
                        scaleY: 0,
                        duration: 0.8,
                        stagger: -0.1,
                        transformOrigin: "bottom",
                        ease: "main"
                    }, "-=0.2");
                }
                if (closeBtnText && closeBtnText.length > 0) {
                    tl.to(closeBtnText, { y: "0%", duration: 0.5, ease: "main" }, 0);
                }
                if (closeBtnIcon) {
                    tl.to(closeBtnIcon, { rotate: 0, duration: 0.5, ease: "main" }, 0);
                }
            }
        }, containerRef.current);

        return () => ctx.revert();
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div ref={containerRef} className="relative z-[2000]">
            <div className="fixed top-8 right-12 z-[2100]">
                <div className="flex items-center gap-6">
                    {!isMenuOpen && (
                        <div className="nav-toggle-label cursor-pointer" onClick={toggleMenu}>
                            <span className="text-[12px] font-accent italic text-[#888888] hover:text-white transition-colors">
                                click me
                            </span>
                        </div>
                    )}

                    <button className="nav-close-btn flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full transition-all group overflow-hidden" onClick={toggleMenu}>
                        <div className="menu-button-text relative h-6 overflow-hidden">
                            <p className="text-white font-display text-xl uppercase tracking-widest block h-6">Menu</p>
                            <p className="text-white font-display text-xl uppercase tracking-widest block h-6">Close</p>
                        </div>
                        <div className="icon-wrap">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="menu-button-icon text-white transform transition-transform duration-500">
                                <path d="M7 16V0H9V16H7Z" fill="currentColor"></path>
                                <path d="M16 9H0V7H16V9Z" fill="currentColor"></path>
                            </svg>
                        </div>
                    </button>
                </div>
            </div>

            <section className={cn("fixed inset-0 z-[2000] pointer-events-none transition-all duration-300", isMenuOpen ? "pointer-events-auto" : "invisible")}>
                <div className="nav-overlay-wrapper absolute inset-0">
                    <div className="overlay absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeMenu}></div>
                    <nav className="menu-content absolute inset-0 overflow-hidden flex items-center justify-center">
                        <div className="menu-bg absolute inset-0">
                            <div className="backdrop-layer first absolute inset-0 bg-[#0A0A0A]"></div>
                            <div className="backdrop-layer second absolute inset-0 bg-[#0D0D0D]"></div>
                            <div className="backdrop-layer absolute inset-0 bg-black"></div>

                            <div className="ambient-background-shapes absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                                <svg className="bg-shape bg-shape-1 absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300" viewBox="0 0 400 400" fill="none">
                                    <circle className="shape-element" cx="80" cy="120" r="40" fill="rgba(255,204,0,0.15)" />
                                    <circle className="shape-element" cx="300" cy="80" r="60" fill="rgba(249,115,22,0.12)" />
                                    <circle className="shape-element" cx="200" cy="300" r="80" fill="rgba(255,204,0,0.1)" />
                                    <circle className="shape-element" cx="350" cy="280" r="30" fill="rgba(249,115,22,0.15)" />
                                </svg>

                                <svg className="bg-shape bg-shape-2 absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300" viewBox="0 0 400 400" fill="none">
                                    <path className="shape-element" d="M0 200 Q100 100, 200 200 T 400 200" stroke="rgba(255,204,0,0.2)" strokeWidth="60" fill="none" />
                                    <path className="shape-element" d="M0 280 Q100 180, 200 280 T 400 280" stroke="rgba(249,115,22,0.15)" strokeWidth="40" fill="none" />
                                </svg>

                                <svg className="bg-shape bg-shape-3 absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300" viewBox="0 0 400 400" fill="none">
                                    <circle className="shape-element" cx="50" cy="50" r="8" fill="rgba(255,204,0,0.3)" />
                                    <circle className="shape-element" cx="150" cy="50" r="8" fill="rgba(249,115,22,0.3)" />
                                    <circle className="shape-element" cx="250" cy="50" r="8" fill="rgba(255,204,0,0.3)" />
                                    <circle className="shape-element" cx="350" cy="50" r="8" fill="rgba(249,115,22,0.3)" />
                                    <circle className="shape-element" cx="100" cy="150" r="12" fill="rgba(255,204,0,0.25)" />
                                    <circle className="shape-element" cx="200" cy="150" r="12" fill="rgba(249,115,22,0.25)" />
                                    <circle className="shape-element" cx="300" cy="150" r="12" fill="rgba(255,204,0,0.25)" />
                                    <circle className="shape-element" cx="50" cy="250" r="10" fill="rgba(249,115,22,0.3)" />
                                    <circle className="shape-element" cx="150" cy="250" r="10" fill="rgba(255,204,0,0.3)" />
                                    <circle className="shape-element" cx="250" cy="250" r="10" fill="rgba(249,115,22,0.3)" />
                                    <circle className="shape-element" cx="350" cy="250" r="10" fill="rgba(255,204,0,0.3)" />
                                    <circle className="shape-element" cx="100" cy="350" r="6" fill="rgba(249,115,22,0.3)" />
                                    <circle className="shape-element" cx="200" cy="350" r="6" fill="rgba(255,204,0,0.3)" />
                                    <circle className="shape-element" cx="300" cy="350" r="6" fill="rgba(249,115,22,0.3)" />
                                </svg>

                                <svg className="bg-shape bg-shape-4 absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300" viewBox="0 0 400 400" fill="none">
                                    <path className="shape-element" d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100" fill="rgba(255,204,0,0.12)" />
                                    <path className="shape-element" d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q250 300 Q200 250, 250 200" fill="rgba(249,115,22,0.1)" />
                                </svg>
                            </div>
                        </div>

                        <div className="menu-content-wrapper relative z-10 w-full max-w-5xl px-12">
                            <ul className="menu-list flex flex-col gap-0 border-l border-white/10">
                                {(['dashboard', 'map', 'profile', 'security'] as DashboardTab[]).map((item, idx) => (
                                    <li key={item} className="menu-list-item relative overflow-hidden group py-2" data-shape={(idx % 4) + 1} data-active={activeTab === item ? "true" : "false"}>
                                        <a href="#" className="nav-link w-full block px-8 relative" onClick={(e) => {
                                            e.preventDefault();
                                            onTabChange(item);
                                            closeMenu();
                                        }}>
                                            <div className="nav-link-hover-bg absolute inset-0 bg-white z-[1] scale-x-0 origin-left" />

                                            <p className={cn(
                                                "nav-link-text relative z-[10] font-display text-[100px] sm:text-[120px] leading-[0.85] uppercase tracking-tighter display-font transition-colors",
                                                activeTab === item ? "text-primary" : "text-white"
                                            )}>
                                                {item}
                                            </p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>
                </div>
            </section>
        </div>
    );
}
