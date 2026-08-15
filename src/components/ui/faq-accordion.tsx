"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: "Education & Qualifications",
    answer: (
      <div className="space-y-1.5 font-sans">
        <h4 className="font-bold text-slate-900 text-base sm:text-lg">
          B. Sc Artificial Intelligence & Machine Learning
        </h4>
        <p className="text-slate-600 text-sm">
          Rathinam global deemed to be university, Coimbatore
        </p>
        <div className="text-xs font-mono text-slate-500 mt-1">
          2024 – 2027
        </div>
      </div>
    ),
  },
  {
    question: "AI Developer — Rathinam Group of Institutions (Internship)",
    answer: (
      <div className="space-y-2 font-sans text-sm sm:text-base leading-relaxed text-slate-700">
        <div className="text-xs font-mono text-slate-500 mb-2">Sep 2025 – Aug 2026</div>
        <ul className="space-y-1.5 list-disc pl-4">
          <li>
            Developed an institution-wide ERP System as an AI developer, currently live with 100+ users and active in production use.
          </li>
          <li>
            Built modules for ticketing and asset management, enabling tracking of 50,000+ labeled assets across the institution.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "Software Tester — SMARTMATE Systems (Internship)",
    answer: (
      <div className="space-y-2 font-sans text-sm sm:text-base leading-relaxed text-slate-700">
        <div className="text-xs font-mono text-slate-500 mb-2">Jan 2025 – Aug 2025</div>
        <ul className="space-y-1.5 list-disc pl-4">
          <li>
            Identified and reported 80+ UI/UX bugs across the application, improving user experience and software stability.
          </li>
          <li>
            Conducted cross-device testing to ensure consistent functionality and interface quality.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "BNB Chain x YZi Labs Hack Series — Bengaluru",
    answer: (
      <div className="space-y-2 font-sans text-sm sm:text-base leading-relaxed text-slate-700">
        <div className="text-xs font-mono text-slate-500 mb-2">Feb 2026 • National Hackathon</div>
        <ul className="space-y-1.5 list-disc pl-4">
          <li>
            Finals (Top 50) in the Web3 Track.
          </li>
          <li>
            Finalist in the national hack series held in Bengaluru.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "Certifications & Specializations",
    answer: (
      <div className="space-y-2.5 font-sans text-sm sm:text-base leading-relaxed text-slate-700">
        <div className="text-xs font-mono text-slate-500 mb-2">Verified Professional Certifications</div>
        <ul className="space-y-2 list-none p-0">
          <li className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
            <span className="font-medium text-slate-900">Building with the Claude API</span>
            <a
              href="https://verify.skilljar.com/c/vf88223oydx7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
            >
              Verify ↗
            </a>
          </li>
          <li className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
            <span className="font-medium text-slate-900">Claude 101</span>
            <a
              href="https://verify.skilljar.com/c/os379o7gmra2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
            >
              Verify ↗
            </a>
          </li>
          <li className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
            <span className="font-medium text-slate-900">Introduction to Agent Skills</span>
            <a
              href="https://verify.skilljar.com/c/qe93iuagc3zy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
            >
              Verify ↗
            </a>
          </li>
          <li className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
            <span className="font-medium text-slate-900">Introduction to Model Context Protocol (MCP)</span>
            <a
              href="https://verify.skilljar.com/c/sutmkqburgbd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
            >
              Verify ↗
            </a>
          </li>
          <li className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
            <span className="font-medium text-slate-900">Agentic AI for Developers: Concepts and Application for Enterprises</span>
            <a
              href="https://www.linkedin.com/learning/certificates/a3df8a5f5c782b922851344e2d0057a1dd29b586ada70f57b5755e9b1ec2299a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
            >
              Verify ↗
            </a>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-900">Docker Foundations Professional Certificate</span>
            <a
              href="https://www.linkedin.com/learning/certificates/058d254049f204ba9297a5c20d68ccc5be0286a52070c329cc618b9c41a690c9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
            >
              Verify ↗
            </a>
          </li>
        </ul>
      </div>
    ),
  },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
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
