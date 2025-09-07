import type React from "react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

interface AnimatedNavItemProps {
  href: string;
  isActive: boolean;
  isExternal?: boolean;
  children: React.ReactNode;
}

export default function AnimatedNavItem({
  href,
  isActive,
  children,
  isExternal,
}: AnimatedNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      onClick={isExternal ? () => window.open(href, "_blank") : undefined}
      to={isExternal ? "#" : href}
      className={cn(
        "relative px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200",
        isActive ? "text-violet-700" : "text-gray-600 hover:text-gray-900"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10">{children}</span>

      {/* Background hover effect */}
      {isHovered && !isActive && (
        <motion.div
          className="absolute inset-0 bg-gray-100 rounded-md z-0"
          layoutId="navHover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}
