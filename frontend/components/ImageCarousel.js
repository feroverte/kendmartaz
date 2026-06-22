"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageCarousel({ photos }) {
  const [idx, setIdx] = React.useState(0);
  const timerRef = useRef(null);

  const prev = useCallback(() => setIdx((i) => (i === 0 ? photos.length - 1 : i - 1)), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i === photos.length - 1 ? 0 : i + 1)), [photos.length]);

  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    timerRef.current = setInterval(() => next(), 5000);
    return () => clearInterval(timerRef.current);
  }, [next, photos]);

  if (!photos || photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center">
          <img src={photos[0]} alt="" className="w-[80%] md:w-[70%] h-[280px] md:h-[370px] object-cover rounded-2xl shadow-xl" />
        </div>
      </section>
    );
  }

  const total = photos.length;
  const allPositions = photos.map((_, i) => {
    const dist = ((i - idx) % total + total) % total;
    const normDist = dist > total / 2 ? dist - total : dist;
    return { dist: normDist, index: i, url: photos[i] };
  });

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="relative h-[320px] md:h-[400px] flex items-center justify-center">
        {allPositions.map((card) => {
          const d = card.dist;
          const isCenter = d === 0;
          const isLeft = d === -1;
          const isRight = d === 1;
          const isFarLeft = d <= -2;
          const isFarRight = d >= 2;

          let transform, zIndex, opacity, w, h, shadow, cursor;

          if (isCenter) {
            transform = `translateX(0%) scale(1)`;
            zIndex = 3; opacity = 1;
            w = 'w-[80%] md:w-[70%]'; h = 'h-[280px] md:h-[370px]';
            shadow = 'shadow-xl'; cursor = 'cursor-pointer';
          } else if (isLeft) {
            transform = `translateX(-58%) scale(0.85)`;
            zIndex = 1; opacity = 0.6;
            w = 'w-[75%] md:w-[65%]'; h = 'h-[260px] md:h-[340px]';
            shadow = 'shadow-md'; cursor = 'cursor-default';
          } else if (isRight) {
            transform = `translateX(58%) scale(0.85)`;
            zIndex = 1; opacity = 0.6;
            w = 'w-[75%] md:w-[65%]'; h = 'h-[260px] md:h-[340px]';
            shadow = 'shadow-md'; cursor = 'cursor-default';
          } else if (isFarLeft) {
            transform = `translateX(-110%) scale(0.85)`;
            zIndex = 0; opacity = 0;
            w = 'w-[75%] md:w-[65%]'; h = 'h-[260px] md:h-[340px]';
            shadow = 'shadow-md'; cursor = 'cursor-default';
          } else {
            transform = `translateX(110%) scale(0.85)`;
            zIndex = 0; opacity = 0;
            w = 'w-[75%] md:w-[65%]'; h = 'h-[260px] md:h-[340px]';
            shadow = 'shadow-md'; cursor = 'cursor-default';
          }

          return (
            <div
              key={card.index}
              className={`absolute transition-all duration-500 ease-in-out ${w} ${cursor}`}
              style={{ transform, zIndex, opacity }}
            >
              <img
                src={card.url}
                alt=""
                className={`w-full ${h} object-cover rounded-2xl ${shadow}`}
              />
            </div>
          );
        })}

        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all hover:scale-105">
          <ChevronLeft className="w-5 h-5 text-emerald-950" />
        </button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all hover:scale-105">
          <ChevronRight className="w-5 h-5 text-emerald-950" />
        </button>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? "bg-emerald-900 w-6" : "bg-emerald-900/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}