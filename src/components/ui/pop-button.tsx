import React from "react";
import { cn } from "@/lib/utils";

export interface PopButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function PopButton({ className, children = "Learn More", ...props }: PopButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center font-bold uppercase text-slate-100 tracking-wider cursor-pointer select-none",
        "px-6 py-2.5 rounded-xl bg-[#6d284f] border border-[#b15382]/60",
        "transition-all duration-150 ease-[cubic-bezier(0,0,0.58,1)]",
        "shadow-[0_5px_0_-1px_#b15382,0_5px_0_0_#4a1835,0_8px_0_0_#1a0712]",
        "dark:shadow-[0_5px_0_-1px_#b15382,0_5px_0_0_#4a1835,0_8px_6px_-2px_rgba(0,0,0,0.7)]",
        "hover:bg-[#7d305c] hover:translate-y-0.5 hover:shadow-[0_3px_0_-1px_#b15382,0_3px_0_0_#4a1835,0_6px_0_0_#1a0712]",
        "dark:hover:shadow-[0_3px_0_-1px_#b15382,0_3px_0_0_#4a1835,0_6px_5px_-2px_rgba(0,0,0,0.7)]",
        "active:bg-[#7d305c] active:translate-y-1.5 active:shadow-[0_0px_0_-1px_#b15382,0_0px_0_0_#4a1835,0_0px_0_0_#1a0712]",
        "dark:active:shadow-[0_0px_0_-1px_#b15382,0_0px_0_0_#4a1835,0_0px_0_0_rgba(0,0,0,0)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default PopButton;
