"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useSpring } from "framer-motion";

export const MagneticButton = ({
  children,
  strength = 0.8,
  maxDistance = 100,
  accentColor = "#b15382",
}: {
  children: React.ReactNode;
  strength?: number;
  maxDistance?: number;
  accentColor?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const rectRef = useRef<{ width: number; height: number; left: number; top: number }>({ width: 0, height: 0, left: 0, top: 0 });

  const springConfig = { stiffness: 150, damping: 25, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const updateRect = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    rectRef.current = { width, height, left, top };
  }, []);

  const handleMouseEnter = () => {
    updateRect();
    setHasMoved(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { width, height, left, top } = rectRef.current;
    if (width === 0 || height === 0) {
      updateRect();
    }
    const { clientX, clientY } = e;

    let targetX = (clientX - (left + width / 2)) * strength;
    let targetY = (clientY - (top + height / 2)) * strength;

    const distance = Math.hypot(targetX, targetY);
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      targetX *= scale;
      targetY *= scale;
    }

    x.set(targetX);
    y.set(targetY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHasMoved(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer rounded-lg border border-dashed transition-colors duration-150"
      style={{
        borderColor: hasMoved ? accentColor : "transparent",
        backgroundColor: hasMoved
          ? `color-mix(in srgb, ${accentColor} 20%, transparent)`
          : "transparent",
      }}
    >
      <motion.div style={{ x, y }}>
        {children}
      </motion.div>
    </div>
  );
};
