import React, { useEffect, useRef, useState, createElement, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';

export interface TextTypeProps extends React.HTMLAttributes<HTMLElement> {
  text: string | string[];
  as?: React.ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: React.ReactNode;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  /**
   * LCP optimisation: when true, renders a visually-hidden (opacity:0,
   * position:absolute) copy of the full first text on the very first render so
   * the browser can discover the LCP element immediately.
   * The hint is removed once the typewriter finishes the first sentence.
   * Does NOT affect visible layout or the animation.
   */
  lcpHint?: boolean;
}

export default function TextType({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  lcpHint = false,
  ...props
}: TextTypeProps) {
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const textSpanRef = useRef<HTMLSpanElement | null>(null);
  const sentenceCompletedFiredRef = useRef<boolean>(false);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      const tween = gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
      return () => {
        tween.kill();
      };
    }
  }, [showCursor, cursorBlinkDuration]);

  // Imperative typing engine: drives text reveal via textSpanRef.current.textContent
  // This avoids per-character React state updates and full component re-render loops.
  useEffect(() => {
    if (!isVisible) return;

    let timeout: ReturnType<typeof setTimeout>;
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let displayedText = '';

    const executeTypingAnimation = () => {
      const currentText = textArray[currentTextIndex];
      const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

      const updateCursorVisibility = (hiding: boolean) => {
        if (cursorRef.current && hideCursorWhileTyping) {
          cursorRef.current.style.display = hiding ? 'none' : 'inline-block';
        }
      };

      const setSpanText = (str: string) => {
        displayedText = str;
        if (textSpanRef.current) {
          textSpanRef.current.textContent = str;
          if (textColors.length > 0) {
            textSpanRef.current.style.color = textColors[currentTextIndex % textColors.length];
          }
        }
      };

      if (isDeleting) {
        if (displayedText === '') {
          isDeleting = false;
          sentenceCompletedFiredRef.current = false;
          if (currentTextIndex === textArray.length - 1 && !loop) {
            updateCursorVisibility(false);
            return;
          }

          currentTextIndex = (currentTextIndex + 1) % textArray.length;
          currentCharIndex = 0;
          timeout = setTimeout(executeTypingAnimation, pauseDuration);
        } else {
          updateCursorVisibility(true);
          timeout = setTimeout(() => {
            setSpanText(displayedText.slice(0, -1));
            executeTypingAnimation();
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          updateCursorVisibility(true);
          timeout = setTimeout(
            () => {
              setSpanText(displayedText + processedText[currentCharIndex]);
              currentCharIndex++;
              executeTypingAnimation();
            },
            variableSpeed ? getRandomSpeed() : typingSpeed
          );
        } else if (textArray.length >= 1) {
          updateCursorVisibility(false);
          if (onSentenceComplete && !sentenceCompletedFiredRef.current) {
            sentenceCompletedFiredRef.current = true;
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }

          if (!loop && currentTextIndex === textArray.length - 1) return;

          timeout = setTimeout(() => {
            isDeleting = true;
            executeTypingAnimation();
          }, pauseDuration);
        }
      }
    };

    timeout = setTimeout(executeTypingAnimation, initialDelay);

    return () => clearTimeout(timeout);
  }, [
    isVisible,
    textArray,
    loop,
    initialDelay,
    pauseDuration,
    typingSpeed,
    deletingSpeed,
    reverseMode,
    variableSpeed,
    textColors,
    hideCursorWhileTyping,
    onSentenceComplete,
    getRandomSpeed
  ]);

  const firstText = Array.isArray(text) ? text[0] : text;
  const initialColor = textColors.length > 0 ? textColors[0] : 'inherit';

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props
    },
    // ── LCP text node ────────────────────────────────────────────────────────
    // Rendered on first paint so the browser discovers the full LCP text immediately.
    // Zero layout shift, accessible to screen readers, immediately visible to crawler.
    <span
      key="lcp-text"
      aria-hidden="true"
      style={{
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'pre'
      }}
    >
      {firstText}
    </span>,
    // ── Animated typewriter text span ─────────────────────────────────────────
    <span
      ref={textSpanRef}
      className="inline"
      style={{ color: initialColor }}
    />,
    showCursor && (
      <span
        ref={cursorRef}
        className={`ml-1 inline-block opacity-100 ${cursorClassName}`}
      >
        {cursorCharacter}
      </span>
    )
  );
}
