import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(12px)",
    scale: 0.96
  },
  in: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    filter: "blur(12px)",
    scale: 0.96
  }
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.5
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
