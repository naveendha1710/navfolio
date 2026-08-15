import React, { memo } from 'react';
import DynamicWeight from './originkit/ui/dynamic-weight';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Easing, RepeatType } from 'framer-motion';

const aiGamerTermsList = [
  "CUDA",
  "Transformer",
  "Far Cry 3",
  "NLP",
  "Joystick",
  "RNN",
  "60 FPS",
  "Ray Tracing",
  "PyTorch",
  "Attention Mechanism",
  "VRAM Bottleneck",
  "Thermal Paste",
  "TensorFlow",
  "Overclock",
  "Gradient Descent",
  "No-Scope",
  "Neural Network",
  "RGB Sync",
  "LLM Fine-Tuning",
  "Zero-Shot Prompting"
];

// Positions and colors are stable constants - no useMemo needed
const snippetPositions = [
  { top: "12%", left: "8%", color: "text-emerald-400/80" },
  { top: "8%", right: "12%", color: "text-purple-400/75" },
  { top: "22%", left: "12%", color: "text-blue-400/75" },
  { top: "20%", right: "10%", color: "text-pink-400/80" },
  { top: "42%", left: "4%", color: "text-amber-400/75" },
  { top: "45%", right: "5%", color: "text-cyan-400/75" },
  { top: "70%", left: "8%", color: "text-pink-400/80" },
  { top: "66%", left: "18%", color: "text-[#edcee2]/60" },
  { top: "82%", left: "10%", color: "text-emerald-400/75" },
  { top: "88%", left: "28%", color: "text-blue-400/80" },
  { top: "85%", right: "14%", color: "text-slate-300/75" },
  { top: "74%", right: "12%", color: "text-purple-400/70" },
  { top: "15%", left: "36%", color: "text-indigo-400/70" },
  { top: "86%", right: "34%", color: "text-rose-400/75" },
  { top: "34%", left: "20%", color: "text-teal-400/70" },
  { top: "32%", right: "22%", color: "text-violet-400/75" },
];

// Pre-computed animation terms — computed once at module load, never in render
const animatedTerms = snippetPositions.map((pos, i) => {
  const text = aiGamerTermsList[i % aiGamerTermsList.length];
  const duration = (2.5 + (i % 4) * 0.8) * 2.0;
  const delay = (i * 0.7) % 4;
  return { ...pos, text, duration, delay };
});

const REPEAT_REVERSE: RepeatType = "reverse"
const EASE_IN_OUT: Easing = "easeInOut"

const termAnimations = animatedTerms.map(term => ({
  animate: { opacity: [0.15, 1.0, 0.15], scale: [0.95, 1.05, 0.95] },
  transition: {
    duration: term.duration,
    delay: term.delay,
    repeat: Infinity,
    repeatType: REPEAT_REVERSE,
    ease: EASE_IN_OUT,
  }
}));

const StuckWithItSection = memo(function StuckWithItSection() {
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full min-h-screen bg-transparent flex items-center justify-center overflow-hidden border-t border-slate-900/60"
    >
      {/* Background Dark Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2430_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Floating Ambient AI & Gamer Words */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none select-none font-mono text-xs sm:text-sm font-semibold tracking-wider">
        {animatedTerms.map((term, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${term.color} backdrop-blur-[1px] px-2 py-1 border border-white/5 rounded-md bg-white/[0.02]`}
            style={{
              top: term.top,
              left: term.left,
              right: term.right,
              whiteSpace: "nowrap"
            }}
            animate={termAnimations[idx].animate}
            transition={termAnimations[idx].transition}
          >
            {term.text}
          </motion.div>
        ))}
      </motion.div>

      {/* Main Central Text Animation with Skiper31 3D Character Scroll Effect + Dynamic Weight Proximity */}
      <div className="relative z-10 text-center px-4 w-full flex items-center justify-center">
        <DynamicWeight
          label="and I stuck with it."
          fromWeight={400}
          toWeight={900}
          strength={30}
          fontSize={58}
          color="#ffffff"
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          scrollYProgress={scrollYProgress}
        />
      </div>
    </section>
  );
});

export default StuckWithItSection;
