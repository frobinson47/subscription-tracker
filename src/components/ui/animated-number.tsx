'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, duration = 0.8, formatFn, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = formatFn ? formatFn(latest) : Math.round(latest).toString();
        }
      },
    });
    return () => controls.stop();
  }, [value, duration, formatFn, motionValue]);

  return <span ref={ref} className={className}>{formatFn ? formatFn(0) : '0'}</span>;
}
