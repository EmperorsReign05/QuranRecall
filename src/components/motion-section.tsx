"use client";

import { motion } from "framer-motion";
import type { ComponentProps } from "react";

type MotionSectionProps = ComponentProps<typeof motion.div> & {
  delay?: number;
};

export function MotionSection({ delay = 0, ...props }: MotionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      {...props}
    />
  );
}
