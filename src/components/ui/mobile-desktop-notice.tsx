"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bull = (
  <span className="inline-block mx-0.5 text-slate-400 font-bold transform scale-90 select-none">
    •
  </span>
);

export function MobileDesktopNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const dismissed = sessionStorage.getItem("mobile_notice_dismissed");

    if (isMobile && !dismissed) {
      setShowNotice(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("mobile_notice_dismissed", "true");
    setShowNotice(false);
  };

  return (
    <AnimatePresence>
      {showNotice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999] backdrop-blur-md bg-slate-950/70 flex items-center justify-center p-5 select-none"
        >
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="min-w-[280px] max-w-sm w-full bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-200/80"
          >
            {/* CardContent */}
            <div className="p-6 text-left font-sans">
              <p className="text-xs text-slate-500 font-medium tracking-wide mb-1">
                System Recommendation
              </p>

              <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center mb-1">
                Desktop Mode
              </h3>

              <p className="text-xs text-slate-500 font-mono tracking-wider mb-3">
                optimal viewing
              </p>

              <div className="text-sm text-slate-700 leading-relaxed font-sans space-y-2">
                <p>
                  For interactive 3D physics, custom shaders, and smooth canvas graphics, we recommend viewing this portfolio on a Desktop.
                </p>
                <p className="text-xs italic text-slate-500">
                  &ldquo;A smoother, full-screen interactive experience&rdquo;
                </p>
              </div>
            </div>

            {/* CardActions */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#a14a6e] hover:bg-[#a14a6e]/10 rounded transition-colors cursor-pointer outline-none"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileDesktopNotice;
