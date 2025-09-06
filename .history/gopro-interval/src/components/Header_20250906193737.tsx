import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedNavItem from "./animated-nav-item";
import AnimatedMobileNavItem from "./animated-mobile-nav-item";
import { Link, useLocation } from "@tanstack/react-router";
import Logo from "./ui/logo";

// Navigation items
const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Legacy", href: "./gopro.html", external: true },
];

export default function Header() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out flex items-center",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-2"
          : "bg-white/90 backdrop-blur-sm"
      )}
    >
      <div className="w-full px-6 md:px-12 lg:px-16 grid auto-rows-auto grid-rows-2">
        {/* auto size rows */}
        <div className={cn("flex items-center gap-2 grow justify-between h-18 row-start-1", isScrolled ? "" : "py-4")}>
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
            {/* <div className="hidden md:flex relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[180px] lg:w-[240px] h-9 bg-gray-50 border border-gray-200 focus-visible:ring-1 focus-visible:ring-violet-500"
              />
            </div>

            <FluidNotificationsDropdown />

            <FluidAccountDropdown user={user} /> */}

            {/* Mobile menu button */}
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

        {/* Mobile Navigation Menu */}
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
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-9 bg-gray-50 border border-gray-200"
                  />
                </div>

                {/* Mobile Nav Links - Now with animated mobile nav items */}
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <AnimatedMobileNavItem
                      key={item.name}
                      href={item.href}
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
