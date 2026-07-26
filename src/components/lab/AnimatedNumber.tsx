"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  reducedMotion: boolean;
};

export function AnimatedNumber({
  value,
  reducedMotion,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (reducedMotion) {
      previous.current = value;
      return;
    }

    const from = previous.current;
    const started = performance.now();
    let frame = 0;

    const update = (now: number) => {
      const progress = Math.min(1, (now - started) / 380);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    previous.current = value;
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, value]);

  return <>{reducedMotion ? value : displayed}</>;
}
