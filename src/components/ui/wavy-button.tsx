import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WavyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "destructive" | "gradient" | "link" | "success" | "info" | "warning";
  size?: "sm" | "default" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";
  radius?: "none" | "sm" | "default" | "lg" | "full";
  animationDuration?: number;
  strokeWidth?: number;
  splitDelay?: number;
  disableTextAnimation?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: "bg-[#b15382] text-white hover:bg-[#b15382]/90 border border-purple-400/30",
  destructive: "bg-red-600 text-white hover:bg-red-500",
  outline: "border-2 border-slate-500 bg-transparent text-white hover:bg-slate-800/50",
  secondary: "bg-slate-600 text-white hover:bg-slate-500",
  success: "bg-emerald-600 text-white hover:bg-emerald-500",
  warning: "bg-amber-400 text-black hover:bg-amber-300",
  info: "bg-blue-600 text-white hover:bg-blue-500",
  gradient: "bg-gradient-to-r from-purple-600 to-pink-500 text-white",
  link: "text-[#edcee2] underline-offset-4 hover:underline bg-transparent border-0 p-0 shadow-none",
};

const sizeStyles: Record<string, string> = {
  default: "h-10 px-5 py-2 text-sm font-semibold",
  sm: "h-8 rounded-md px-3 text-xs font-semibold",
  lg: "h-12 rounded-md px-8 text-base font-bold",
  xl: "h-16 px-12 text-xl font-extrabold",
  icon: "h-9 w-9 p-0 flex items-center justify-center",
  "icon-sm": "h-12 w-12 p-0 flex items-center justify-center",
  "icon-lg": "h-20 w-20 p-0 flex items-center justify-center",
};

const radiusStyles: Record<string, string> = {
  default: "rounded-full",
  sm: "rounded-lg",
  lg: "rounded-3xl",
  none: "rounded-none",
};

const strokeColors: Record<string, string> = {
  default: "#edcee2",
  destructive: "#fca5a5",
  outline: "#b15382",
  secondary: "#cbd5e1",
  success: "#86efac",
  warning: "#fde047",
  info: "#93c5fd",
  gradient: "#ec4899",
  link: "#edcee2",
};

export default function WavyButton({
  variant = "default",
  size = "default",
  radius = "default",
  animationDuration = 0.8,
  strokeWidth = 30,
  splitDelay = 0.04,
  disableTextAnimation = false,
  children,
  className,
  ...props
}: WavyButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const textString = typeof children === "string" ? children : "";

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden cursor-pointer select-none active:scale-95 group",
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.default,
        radiusStyles[radius] || radiusStyles.default,
        className
      )}
      {...props}
    >
      {/* Wave SVG Stroke Animation */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-100"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <motion.path
          d="M 0 50 Q 25 20, 50 50 T 100 50 T 150 50"
          fill="none"
          stroke={strokeColors[variant] || strokeColors.default}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animate={{
            pathLength: isHovered ? [0, 1] : 0,
            x: isHovered ? ["-30%", "0%"] : "-30%",
          }}
          transition={{
            duration: animationDuration,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* Wavy Animated Text */}
      {textString && !disableTextAnimation ? (
        <span className="relative z-10 inline-flex overflow-hidden">
          {textString.split("").map((char, index) => (
            <motion.span
              key={index}
              className="inline-block"
              animate={{
                y: isHovered ? [0, -6, 0] : 0,
              }}
              transition={{
                duration: animationDuration * 0.7,
                delay: index * splitDelay,
                ease: "easeInOut",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </span>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  );
}