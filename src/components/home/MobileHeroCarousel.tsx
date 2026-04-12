import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface MobileHeroCarouselProps {
  slides: string[];
  exploreLabel: string;
  examLabel: string;
}

const MobileHeroCarousel: React.FC<MobileHeroCarouselProps> = ({
  slides,
  exploreLabel,
  examLabel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let nextIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        nextIndex = index;
      }
    });

    setActiveIndex(nextIndex);
  }, []);

  useEffect(() => {
    updateActiveIndex();
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [updateActiveIndex]);

  const handleScroll = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(updateActiveIndex);
  };

  const scrollToSlide = (index: number) => {
    const slide = slideRefs.current[index];
    if (!slide) return;

    slide.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    setActiveIndex(index);
  };

  return (
    <div className="relative px-4 sm:hidden">
      <div className="mx-auto max-w-[380px]">
        <div className="pointer-events-none absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent" />

          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 pt-3 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slides.map((image, index) => {
              const isActive = index === activeIndex;

              return (
                <article
                  key={image}
                  ref={(element) => {
                    slideRefs.current[index] = element;
                  }}
                  className={`snap-center shrink-0 w-[82vw] max-w-[320px] transition-all duration-300 ease-out ${
                    isActive
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'translate-y-4 scale-[0.92] opacity-55'
                  }`}>
                  <div className="relative">
                    {isActive && (
                      <div className="absolute inset-x-6 -bottom-2 top-6 rounded-[28px] bg-orange-500/22 blur-2xl" />
                    )}
                    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_20px_65px_rgba(0,0,0,0.72)]">
                      <img
                        src={image}
                        alt={`Student IELTS speaking test result ${index + 1}`}
                        width="1080"
                        height="1920"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : undefined}
                        decoding="async"
                        className="w-full aspect-[9/16] object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.02)_58%,rgba(0,0,0,0.48)_100%)]" />

                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4">
                        <div className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white/82 backdrop-blur-md">
                          Manage LC
                        </div>
                        <div className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[11px] font-semibold text-white/88 backdrop-blur-md">
                          {index + 1} / {slides.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-center gap-2">
          {slides.map((_, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'h-2 w-8 bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.75)]'
                    : 'h-2 w-2 bg-white/35'
                }`}
              />
            );
          })}
        </div>

        <div className="mt-6 grid gap-3">
          <Link
            to="/courses/english"
            className="rounded-[20px] bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 px-6 py-3.5 text-center text-sm font-bold text-white shadow-[0_18px_34px_rgba(249,115,22,0.26)]">
            {exploreLabel}
          </Link>
          <Link
            to="/mock-exam"
            className="rounded-[20px] border border-white/14 bg-white/[0.05] px-6 py-3.5 text-center text-sm font-semibold text-white/92 backdrop-blur-xl">
            {examLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileHeroCarousel;
