import React, { useEffect, useState, useRef } from 'react';

export interface DecryptedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover';
}

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = DEFAULT_CHARS,
  className = '',
  encryptedClassName = '',
  parentClassName = '',
  animateOn = 'view',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  const availableChars = useOriginalCharsOnly
    ? Array.from(new Set(text.split(''))).filter(char => char !== ' ').join('')
    : characters;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const scramble = () => {
      let iteration = 0;
      setIsScrambling(true);

      interval = setInterval(() => {
        setDisplayText(() =>
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';

              if (sequential) {
                if (iteration / maxIterations > index / text.length) {
                  return text[index];
                }
              } else {
                if (iteration >= maxIterations) {
                  return text[index];
                }
              }

              return availableChars[Math.floor(Math.random() * availableChars.length)];
            })
            .join('')
        );

        iteration += 1;

        if (iteration > maxIterations * (sequential ? text.length : 1)) {
          clearInterval(interval);
          setDisplayText(text);
          setIsScrambling(false);
        }
      }, speed);
    };

    if (animateOn === 'view') {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              scramble();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    } else if (animateOn === 'hover' && isHovered) {
      scramble();
      return () => clearInterval(interval);
    }
  }, [text, speed, maxIterations, sequential, availableChars, animateOn, isHovered]);

  return (
    <span
      ref={containerRef}
      className={`inline-block select-none ${parentClassName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <span className={isScrambling ? encryptedClassName || className : className}>
        {displayText}
      </span>
    </span>
  );
}
