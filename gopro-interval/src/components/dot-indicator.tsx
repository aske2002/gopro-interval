import { motion } from "framer-motion";

interface DotIndicatorProps {
  count?: number;
  activeIndex?: number;
  title?: string;
}

export default function DotIndicator({
  count = 5,
  activeIndex = 0,
}: DotIndicatorProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: i * 0.05,
            }}
            className="relative"
          >
            {/* Background dot */}
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                i === activeIndex ? "bg-primary" : "bg-gray-400"
              }`}
            />

            {/* Animated ring around active dot */}
            {i === activeIndex && (
              <motion.div
                layoutId="active-ring"
                className="absolute -inset-1 rounded-full border-2 border-primary"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
