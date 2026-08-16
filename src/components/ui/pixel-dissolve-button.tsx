"use client";

import React, { useRef, useState } from 'react';

interface PixelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface PixelDissolveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  colors?: string[];
}

export const PixelDissolveButton = ({
  children,
  onClick,
  className = '',
  colors = ['#a14a6e', '#b15382', '#edcee2', '#7b2c4e', '#ffffff', '#e284b3'],
}: PixelDissolveButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const [isDissolved, setIsDissolved] = useState(false);

  const triggerDissolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDissolving || isDissolved) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      onClick?.();
      return;
    }

    const rect = container.getBoundingClientRect();
    const padding = 60;
    canvas.width = rect.width + padding * 2;
    canvas.height = rect.height + padding * 2;
    canvas.style.left = `-${padding}px`;
    canvas.style.top = `-${padding}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onClick?.();
      return;
    }

    setIsDissolving(true);

    const cols = Math.max(12, Math.floor(rect.width / 4));
    const rows = Math.max(8, Math.floor(rect.height / 4));
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;
    const particles: PixelParticle[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = padding + c * cellW + cellW / 2;
        const py = padding + r * cellH + cellH / 2;
        
        // Scatter vector outwards from button center
        const angle = Math.atan2(r - rows / 2, c - cols / 2) + (Math.random() - 0.5) * 0.9;
        const speed = 2 + Math.random() * 5.5;

        particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
          vy: Math.sin(angle) * speed - Math.random() * 2.5,
          size: Math.floor(3 + Math.random() * 3.5),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: 25 + Math.random() * 25,
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life < p.maxLife) {
          alive = true;
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95; // drag
          p.vy *= 0.95;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          // Render crisp pixel squares
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
      }

      if (alive) {
        requestAnimationFrame(render);
      } else {
        setIsDissolved(true);
        setIsDissolving(false);
      }
    };

    requestAnimationFrame(render);
    onClick?.();
  };

  if (isDissolved) return null;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none z-50 overflow-visible"
        style={{ display: isDissolving ? 'block' : 'none' }}
      />
      <div
        onClick={triggerDissolve}
        className={`transition-all duration-100 ${isDissolving ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
      >
        {children}
      </div>
    </div>
  );
};
