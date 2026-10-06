"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { faqItemsData, FaqItemData } from "@/data/profile";

export type FaqItem = FaqItemData;

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

export function FaqAccordion({
  items = faqItemsData,
  title = "Background & Credentials",
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-2xl py-8 relative font-sans", className)} {...props}>
      {title && (
        <h2 className="text-left font-extrabold text-3xl md:text-4xl mb-8 text-slate-900 tracking-tight font-sans">
          {title}
        </h2>
      )}
      
      <ul className="w-full list-none p-0 flex flex-col">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b border-slate-300/80",
                "last:border-b-0",
                isActive ? "border-b border-slate-400" : ""
              )}
            >
              <button
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[56px] py-3.5 relative m-0 px-4 pl-12 cursor-pointer",
                  "border-l-[4px] md:border-l-[6px] transition-colors duration-200 text-left outline-none text-base md:text-lg font-sans",
                  isActive 
                    ? "border-l-slate-900 bg-white/70 backdrop-blur-sm text-slate-900 font-bold shadow-sm" 
                    : "border-l-slate-400 bg-white/30 backdrop-blur-xs text-slate-800 hover:border-l-slate-700 hover:text-slate-950 hover:bg-white/50"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus/Minus Icon */}
                <span 
                  className={cn(
                    "absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none",
                    isActive ? "text-[28px] md:text-[34px] font-light text-slate-900" : "text-[20px] md:text-[24px] font-light text-slate-600"
                  )}
                >
                  {isActive ? "-" : "+"}
                </span>
                
                <span className="pr-8 tracking-tight">{item.question}</span>
                
                {/* Chevron */}
                <span 
                  className={cn(
                    "absolute right-5 block w-2 h-2 border-t-[2.5px] border-r-[2.5px] transition-transform duration-200 ease-in-out",
                    isActive ? "rotate-[-44deg] border-slate-900" : "rotate-[133deg] border-slate-600"
                  )}
                />
              </button>

              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[4px] md:border-l-[6px]",
                  isActive ? "grid-rows-[1fr] border-l-slate-900 bg-white/80 backdrop-blur-md" : "grid-rows-[0fr] border-l-slate-400 bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-4 pl-12 pb-6 pt-3 text-sm md:text-base font-normal text-slate-800">
                    <span className="opacity-95">{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
