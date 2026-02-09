import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import './home.css';

import Result1 from '../assets/images/results/1.webp';
import Result2 from '../assets/images/results/2.webp';
import Result3 from '../assets/images/results/3.webp';
import Result4 from '../assets/images/results/4.webp';
import Result5 from '../assets/images/results/5.webp';
import Result6 from '../assets/images/results/6.webp';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const slides = [Result1, Result2, Result3, Result4, Result5, Result6];

  return (
    <div className="bg-transparent">
      <section className="relative w-full pt-28 pb-16 sm:pt-40 sm:pb-24 lg:pt-52 lg:pb-32 overflow-hidden -mt-24">
        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0e0e0e] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,115,0,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,215,0,0.25),transparent_60%)]" />

        {/* SLIDER */}
        <div
          className="relative h-[65vh] sm:h-[80vh] lg:h-[90vh] flex items-center justify-center"
          style={{ perspective: '1600px' }}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            loopAdditionalSlides={1}
            speed={600}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: {
                coverflowEffect: {
                  rotate: 15,
                  stretch: 0,
                  depth: 150,
                  modifier: 1,
                  slideShadows: false,
                },
              },
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
            pagination={false}
            watchSlidesProgress={true}
            watchOverflow={true}
            preventInteractionOnTransition={false}
            resistance={true}
            resistanceRatio={0.85}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-full"
            style={{ overflow: 'visible' }}>
            {slides.map((img, i) => (
              <SwiperSlide key={i} className="swiper-slide-custom">
                <div className="relative w-full h-full overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]"
                  />

                  {/* glow - only on active slide */}
                  <div className="slide-glow absolute -inset-2 sm:-inset-2.5 lg:-inset-3 bg-gradient-to-br from-orange-500/45 to-yellow-400/35 blur-2xl sm:blur-2xl lg:blur-3xl rounded-[28px] sm:rounded-[36px] lg:rounded-[48px] opacity-0" />

                  {/* CTA - only on active slide */}
                  <div className="slide-cta relative z-20 h-full flex items-end justify-center pb-8 sm:pb-12 lg:pb-16 opacity-0 pointer-events-none">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4">
                      <Link
                        to="/courses/english"
                        className="px-6 py-3 sm:px-8 sm:py-3.5 lg:px-10 lg:py-4 bg-gradient-to-r from-orange-500 to-yellow-400
                                 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base shadow-xl hover:scale-105 transition-transform duration-200 text-center"
                        onClick={(e) => e.stopPropagation()}>
                        {t('home.exploreCourses')}
                      </Link>

                      <Link
                        to="/mock-exam"
                        className="px-6 py-3 sm:px-8 sm:py-3.5 lg:px-10 lg:py-4 bg-black/60 border border-white/20
                                 rounded-xl sm:rounded-2xl text-white text-sm sm:text-base hover:bg-black/80 transition-all duration-200 text-center"
                        onClick={(e) => e.stopPropagation()}>
                        {t('mockExam.startExam')}
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Custom dots */}
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => swiperInstance?.slideToLoop(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 sm:w-10 bg-orange-500 shadow-[0_0_10px_rgba(255,115,0,0.8)] sm:shadow-[0_0_15px_rgba(255,115,0,0.8)]'
                  : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
              } cursor-pointer`}
            />
          ))}
        </div>
      </section>
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b0b] via-[#120c06] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,115,0,0.25),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(124,58,237,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-24">
            <h2
              className="
        text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-4 sm:mb-6
        text-white
        drop-shadow-[0_12px_45px_rgba(255,115,0,0.35)]
        px-4
      ">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {t('home.heroCta')}
              </span>
            </h2>

            <div className="w-20 sm:w-24 md:w-28 h-1 sm:h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-14">
            <div
              onClick={() => navigate('/courses/english')}
              className="
          group relative cursor-pointer
          rounded-[24px] sm:rounded-[32px] md:rounded-[42px]
          p-6 sm:p-8 md:p-12
          bg-white/5 backdrop-blur-xl
          border border-white/15
          shadow-[0_15px_60px_rgba(0,0,0,0.9)] md:shadow-[0_25px_90px_rgba(0,0,0,0.9)]
          transition-all duration-500
          hover:-translate-y-2 hover:scale-[1.02] md:hover:scale-[1.05]
          hover:shadow-[0_30px_100px_rgba(255,140,0,0.45)] md:hover:shadow-[0_45px_140px_rgba(255,140,0,0.45)]
        ">
              <div
                className="
          absolute -inset-3 sm:-inset-4 rounded-[28px] sm:rounded-[36px] md:rounded-[46px]
          bg-gradient-to-br from-orange-400/45 via-amber-300/35 to-pink-400/30
          blur-2xl md:blur-3xl opacity-0
          group-hover:opacity-100
          transition duration-500
        "
              />

              <div className="relative z-10">
                <div
                  className="
            w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
            rounded-xl sm:rounded-2xl
            mb-5 sm:mb-6 md:mb-8
            bg-gradient-to-br from-orange-500 to-yellow-400
            flex items-center justify-center
            shadow-[0_12px_35px_rgba(255,140,0,0.6)] md:shadow-[0_18px_50px_rgba(255,140,0,0.6)]
            transition-transform duration-500
            group-hover:scale-110
          ">
                  <span className="text-white text-2xl sm:text-3xl md:text-4xl font-black">EN</span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 sm:mb-4">
                  {t('homeExtended.titleEnglish')}
                </h3>

                <p className="text-white/65 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 md:mb-8 max-w-md">
                  {t('homeExtended.descriptionEnglish')}
                </p>

                <div
                  className="
            flex items-center gap-2 sm:gap-3
            text-orange-400 font-bold text-base sm:text-lg
            transition-all duration-300
            group-hover:gap-4 sm:group-hover:gap-6
          ">
                  {t('homeExtended.learnMore')} <span>→</span>
                </div>
              </div>
            </div>

            <div
              className="
          relative
          rounded-[24px] sm:rounded-[32px] md:rounded-[42px]
          p-6 sm:p-8 md:p-12
          bg-white/4 backdrop-blur-xl
          border border-white/10
          opacity-60
          shadow-[0_15px_50px_rgba(0,0,0,0.8)] md:shadow-[0_20px_70px_rgba(0,0,0,0.8)]
        ">
              <div
                className="
          w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
          rounded-xl sm:rounded-2xl
          mb-5 sm:mb-6 md:mb-8
          bg-gradient-to-br from-zinc-700 to-zinc-800
          flex items-center justify-center
        ">
                <span className="text-zinc-300 text-2xl sm:text-3xl md:text-4xl font-black">
                  MA
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-300 mb-3 sm:mb-4">
                {t('homeExtended.mathematics')}
              </h3>

              <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 md:mb-8 max-w-md">
                {t('homeExtended.descriptionMath')}
              </p>

              <div className="text-zinc-400 text-sm sm:text-base font-bold">
                {t('homeExtended.comingSoon')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
