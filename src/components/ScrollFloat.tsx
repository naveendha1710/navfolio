import React, { useEffect, useMemo, useRef, memo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollFloatProps {
  children: React.ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

const ScrollFloat = memo(function ScrollFloat({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=30%',
  stagger = 0.03
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="scroll-float-char inline-block" key={index}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
    // Intentionally only depends on children string content
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current ?? window;
    const charElements = el.querySelectorAll('.scroll-float-char');

    const anim = gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%'
      },
      {
        duration: animationDuration,
        ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true
        }
      }
    );

    return () => {
      anim.kill();
    };
    // Note: scrollContainerRef excluded — ref objects are stable and checking .current inside effect is sufficient
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);
  // ^ Removed `children` from deps — splitText handles changes, and re-creating GSAP anim on every char change is wasteful

  return (
    <h2 ref={containerRef} className={`my-0 py-0 overflow-hidden ${containerClassName}`}>
      <span className={`inline-block font-black leading-[0.9] ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  );
});

export default ScrollFloat;
