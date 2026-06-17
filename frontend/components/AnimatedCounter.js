"use client";

import React, { useState, useEffect } from "react";

export default function AnimatedCounter({ value, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = parseFloat(value);
    if (isNaN(target)) {
      setCount(value);
      return;
    }
    if (target === 0) {
      setCount(0);
      return;
    }
    
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing outQuad
      const easedProgress = progress * (2 - progress);
      const currentVal = easedProgress * (target - start) + start;
      
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration]);

  const isDecimal = value.toString().includes(".");

  return (
    <span className="font-numeric font-bold tracking-tight">
      {isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}
