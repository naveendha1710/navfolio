import React, { useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: string;
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  tag?: any;
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text = 'Hi!',
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag: Tag = 'p',
  onLetterAnimationComplete
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);

  // Split text into characters array
  const letters = useMemo(() => text.split(''), [text]);

  useGSAP(
    () => {
      if (!ref.current || lettersRef.current.length === 0) return;

      const startPct = (1 - threshold) * 100;
      const start = `top ${startPct}%`;

      gsap.fromTo(
        lettersRef.current,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: ref.current,
            start,
            toggleActions: 'play reverse play reverse',
            fastScrollEnd: true
          },
          onComplete: () => {
            onLetterAnimationComplete?.();
          }
        }
      );
    },
    {
      dependencies: [text, delay, duration, ease, JSON.stringify(from), JSON.stringify(to), threshold],
      scope: ref
    }
  );

  return (
    <Tag
      ref={ref}
      style={{ textAlign, wordWrap: 'break-word', willChange: 'transform, opacity' }}
      className={`split-parent overflow-hidden inline-block whitespace-normal ${className}`}
    >
      {letters.map((char, index) => (
        <span
          key={index}
          ref={el => {
            if (el) lettersRef.current[index] = el;
          }}
          className="inline-block"
          style={{ willChange: 'transform, opacity', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
