"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor } from "lucide-react";

export function MobileDesktopNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if device is mobile width (< 768px) and notice has not been dismissed in session
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
          className="fixed inset-0 z-[999] backdrop-blur-2xl bg-slate-950/85 flex items-center justify-center p-6 select-none"
        >
          <motion.div
            initial={{ scale: 0.88, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-sm rounded-2xl bg-slate-900/95 border border-slate-800 p-7 text-center shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center gap-5"
          >
            {/* Monitor Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-[#a14a6e]/20 border border-[#b15382]/40 flex items-center justify-center text-[#edcee2] shadow-inner">
              <Monitor className="w-7 h-7" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight font-sans">
                Desktop Recommended
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                For the best interactive experience with 3D physics, custom shaders, and smooth canvas graphics, we recommend viewing this portfolio on a Desktop.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#a14a6e] to-[#b15382] text-white font-mono text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer mt-1"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileDesktopNotice;
