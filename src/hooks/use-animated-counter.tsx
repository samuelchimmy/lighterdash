import { useEffect, useRef, useState } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
}

export const useAnimatedCounter = (
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
) => {
  const { duration = 1000, decimals = 2 } = options;
  const sanitize = (v: number) => (Number.isFinite(v) ? v : 0);
  const [displayValue, setDisplayValue] = useState(sanitize(targetValue));
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(sanitize(targetValue));

  useEffect(() => {
    const nextTarget = sanitize(targetValue);
    // If target hasn't changed or is same as display, no animation needed
    if (nextTarget === displayValue) {
      return;
    }

    startValueRef.current = displayValue;
    startTimeRef.current = undefined;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue =
        startValueRef.current + (nextTarget - startValueRef.current) * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration, displayValue]);

  return displayValue;
};
