import React, { useState, useEffect, type Ref } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AnimatedNavItem from "./animated-nav-item";
import AnimatedMobileNavItem from "./animated-mobile-nav-item";
import { Link, useLocation } from "@tanstack/react-router";
import Logo from "./ui/logo";
import { ModeSwitch } from "./mode-switch";

// Navigation items
const navigationItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Legacy", href: "./gopro.html", external: true },
];

interface HeaderProps {
  scrollElement?: React.RefObject<HTMLElement | null>;
}

export default function Header({ scrollElement }: HeaderProps) {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const target = scrollElement?.current || window;

    const handleScroll = (e: Event) => {
      const scrollTop =
        target === window
          ? window.scrollY
          : (target as HTMLDivElement).scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, [scrollElement?.current]);

  return (
    <header
      className={cn(
        "w-full z-50 transition-all duration-300 ease-in-out flex items-center",
        isScrolled || isMobileMenuOpen
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-white/90 backdrop-blur-sm"
      )}
    >
      <div className="w-full px-6 md:px-12 lg:px-16 grid grid-rows-[auto_auto]">
        {/* auto size rows */}
        <div
          className={cn(
            "flex transition-all duration-300 ease-in-out items-center gap-2 grow justify-between h-18 row-start-1",
            isScrolled || isMobileMenuOpen ? "py-2" : "h-20"
          )}
        >
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Logo fill="url(#svg-gradient)" className="h-full" />
              </motion.div>
              <div>
                <span className="font-bold leading-tight text-lg bg-clip-text text-transparent bg-gradient-primary">
                  GOPRO
                </span>
                <span className="text-base leading-tight font-semibold block -mt-1 bg-clip-text text-transparent bg-gradient-primary">
                  QR Gen
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Now with animated nav items */}
            <nav className="hidden md:flex items-center justify-center space-x-1">
              <AnimatePresence>
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <AnimatedNavItem
                      key={item.name}
                      href={item.href}
                      isExternal={item.external}
                      isActive={isActive}
                    >
                      {item.name}
                    </AnimatedNavItem>
                  );
                })}
              </AnimatePresence>
            </nav>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <ModeSwitch />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden row-start-2"
            >
              <div className="py-4 space-y-1">
                {/* Mobile Nav Links - Now with animated mobile nav items */}
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <AnimatedMobileNavItem
                      key={item.name}
                      href={item.href}
                      isExternal={item.external}
                      isActive={isActive}
                    >
                      {item.name}
                    </AnimatedMobileNavItem>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
