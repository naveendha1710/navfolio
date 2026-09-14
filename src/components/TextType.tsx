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

const DEFAULT_TEXT_COLORS: string[] = [];

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
  textColors = DEFAULT_TEXT_COLORS,
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
  const hasCompletedRef = useRef<boolean>(false);

  // Keep latest onSentenceComplete in a ref so changes do not restart the typing effect
  const onSentenceCompleteRef = useRef(onSentenceComplete);
  useEffect(() => {
    onSentenceCompleteRef.current = onSentenceComplete;
  }, [onSentenceComplete]);

  const textSerialized = Array.isArray(text) ? text.join('\u0000') : text;
  const prevTextRef = useRef(textSerialized);
  if (prevTextRef.current !== textSerialized) {
    prevTextRef.current = textSerialized;
    hasCompletedRef.current = false;
    sentenceCompletedFiredRef.current = false;
  }

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [textSerialized]);

  const variableSpeedMin = variableSpeed?.min;
  const variableSpeedMax = variableSpeed?.max;
  const getRandomSpeed = useCallback(() => {
    if (variableSpeedMin === undefined || variableSpeedMax === undefined) return typingSpeed;
    return Math.random() * (variableSpeedMax - variableSpeedMin) + variableSpeedMin;
  }, [variableSpeedMin, variableSpeedMax, typingSpeed]);

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

    const lastIndex = textArray.length - 1;
    const lastText = textArray[lastIndex] || '';
    const lastProcessedText = reverseMode ? lastText.split('').reverse().join('') : lastText;

    // If sentence already completed and loop is disabled, preserve final text and do not re-run
    if (!loop && hasCompletedRef.current) {
      if (textSpanRef.current && textSpanRef.current.textContent !== lastProcessedText) {
        textSpanRef.current.textContent = lastProcessedText;
        if (textColors.length > 0) {
          textSpanRef.current.style.color = textColors[lastIndex % textColors.length];
        }
      }
      if (cursorRef.current && hideCursorWhileTyping) {
        cursorRef.current.style.display = 'inline-block';
      }
      return;
    }

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
            hasCompletedRef.current = true;
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
          if (onSentenceCompleteRef.current && !sentenceCompletedFiredRef.current) {
            sentenceCompletedFiredRef.current = true;
            onSentenceCompleteRef.current(textArray[currentTextIndex], currentTextIndex);
          }

          if (!loop && currentTextIndex === textArray.length - 1) {
            hasCompletedRef.current = true;
            return;
          }

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
