import React, { useRef, useEffect, useCallback, memo } from 'react';

export interface MagnetLinesProps {
  rows?: number;
  columns?: number;
  containerSize?: string;
  lineColor?: string;
  lineWidth?: string;
  lineHeight?: string;
  baseAngle?: number;
  className?: string;
  style?: React.CSSProperties;
}

const MagnetLines = memo(function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = '80vmin',
  lineColor = '#efefef',
  lineWidth = '1vmin',
  lineHeight = '6vmin',
  baseAngle = -10,
  className = '',
  style,
}: MagnetLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Cache span relative positions within container (constant across scrolling)
  const cachedRectsRef = useRef<{ relX: number; relY: number }[] | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);

  const buildRectCache = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const items = container.querySelectorAll<HTMLSpanElement>('span');
    cachedRectsRef.current = Array.from(items).map(item => {
      const rect = item.getBoundingClientRect();
      return {
        relX: rect.x - containerRect.x + rect.width / 2,
        relY: rect.y - containerRect.y + rect.height / 2
      };
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLSpanElement>('span');
    if (!items.length) return;

    // Build initial rect cache
    buildRectCache();

    // Rebuild cache on resize (layout changes)
    const resizeObserver = new ResizeObserver(() => {
      cachedRectsRef.current = null; // Invalidate cache
    });
    resizeObserver.observe(container);

    // RAF-throttled pointer handler — avoids layout thrashing by querying container rect only once per frame
    const processPointer = (x: number, y: number) => {
      if (!containerRef.current) return;
      if (!cachedRectsRef.current) buildRectCache();
      const rects = cachedRectsRef.current;
      if (!rects) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      items.forEach((item, i) => {
        const { relX, relY } = rects[i];
        const cx = containerRect.x + relX;
        const cy = containerRect.y + relY;
        const b = x - cx;
        const a = y - cy;
        const c = Math.sqrt(a * a + b * b) || 1;
        const r = ((Math.acos(b / c) * 180) / Math.PI) * (y > cy ? 1 : -1);
        item.style.setProperty('--rotate', `${r}deg`);
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      pendingPointerRef.current = { x: e.clientX, y: e.clientY };
      if (rafIdRef.current !== null) return; // Already scheduled
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingPointerRef.current) {
          processPointer(pendingPointerRef.current.x, pendingPointerRef.current.y);
          pendingPointerRef.current = null;
        }
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Set initial angle
    const middle = items[Math.floor(items.length / 2)];
    const initRect = middle.getBoundingClientRect();
    processPointer(initRect.x + initRect.width / 2, initRect.y + initRect.height / 2);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      resizeObserver.disconnect();
    };
  }, [rows, columns, buildRectCache]);

  const total = rows * columns;

  return (
    <div
      ref={containerRef}
      className={`grid place-items-center ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="block origin-center transition-transform duration-75"
          style={{
            backgroundColor: lineColor,
            width: lineWidth,
            height: lineHeight,
            '--rotate': `${baseAngle}deg`,
            transform: 'rotate(var(--rotate, -10deg))',
            willChange: 'transform'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

export default MagnetLines;
