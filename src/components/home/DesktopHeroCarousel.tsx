import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslation } from '../../i18n/useTranslation';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import '../../pages/home.css';

interface DesktopHeroCarouselProps {
  slides: string[];
}

const DesktopHeroCarousel: React.FC<DesktopHeroCarouselProps> = ({ slides }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  return (
    <div
      className="relative h-[80vh] lg:h-[90vh] hidden sm:flex items-center justify-center"
      style={{ perspective: '1600px' }}>
      <Swiper
        modules={[Navigation, Autoplay, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={true}
        loopAdditionalSlides={1}
        speed={600}
        autoplay={{
          delay: 3200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: {
            coverflowEffect: {
              rotate: 18,
              stretch: 0,
              depth: 175,
              modifier: 1,
              slideShadows: false,
            },
          },
          1024: {
            coverflowEffect: {
              rotate: 20,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: false,
            },
          },
        }}
        coverflowEffect={{
          rotate: 20,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: false,
        }}
        watchSlidesProgress={true}
        watchOverflow={true}
        resistance={true}
        resistanceRatio={0.85}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
        style={{ overflow: 'visible' }}>
        {slides.map((img, i) => (
          <SwiperSlide key={img} className="swiper-slide-custom">
            <div className="relative w-full h-full overflow-hidden rounded-[32px] lg:rounded-[40px]">
              <img
                src={img}
                alt={`Student IELTS speaking test result ${i + 1} - Manage LC success story`}
                width="1080"
                height="1920"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover rounded-[32px] lg:rounded-[40px]"
              />

              <div className="slide-glow absolute -inset-2.5 lg:-inset-3 bg-gradient-to-br from-orange-500/45 to-yellow-400/35 blur-2xl lg:blur-3xl rounded-[36px] lg:rounded-[48px] opacity-0" />

              <div className="slide-cta relative z-20 h-full flex items-end justify-center pb-12 lg:pb-16 opacity-0 pointer-events-none">
                <div className="flex flex-col sm:flex-row gap-4 px-4">
                  <Link
                    to="/courses/english"
                    className="px-8 py-3.5 lg:px-10 lg:py-4 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl font-bold text-white text-base shadow-xl hover:scale-105 transition-transform duration-200 text-center"
                    onClick={(e) => e.stopPropagation()}>
                    {t('home.exploreCourses')}
                  </Link>

                  <Link
                    to="/mock-exam"
                    className="px-8 py-3.5 lg:px-10 lg:py-4 bg-black/60 border border-white/20 rounded-2xl text-white text-base hover:bg-black/80 transition-all duration-200 text-center"
                    onClick={(e) => e.stopPropagation()}>
                    {t('mockExam.startExam')}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10"
        role="tablist"
        aria-label="Carousel navigation">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => swiperInstance?.slideToLoop(i)}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Go to slide ${i + 1} of ${slides.length}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-10 bg-orange-500 shadow-[0_0_15px_rgba(255,115,0,0.8)]'
                : 'w-2 bg-white/40 hover:bg-white/60'
            } cursor-pointer`}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopHeroCarousel;
