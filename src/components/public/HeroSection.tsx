'use client'

import Link from "next/link";
import { Zap, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSectionProps {
  locale: string;
  heroBadge: string | null;
  heroImage: string;
  heroImages?: string[];
  ui: {
    home: {
      heroTitle1: string;
      heroTitleAccent: string;
      heroTitle2: string;
      heroSubtitle: string;
      ctaProjects: string;
      ctaContact: string;
    };
  };
  projectsUrl: string;
  contactUrl: string;
}

export default function HeroSection({ 
  locale, 
  heroBadge, 
  heroImage, 
  heroImages,
  ui,
  projectsUrl,
  contactUrl
}: HeroSectionProps) {
  const slides = (heroImages && heroImages.length > 0 ? heroImages : [heroImage]).filter(
    (image): image is string => Boolean(image)
  );

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: true,
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !w-2 !h-2 !bg-white/40 !opacity-100 hover:!bg-white/60 !transition-all',
            bulletActiveClass: '!w-8 !bg-[#D4A843]',
            renderBullet: function (index: number, className: string) {
              return `<span class="${className}" aria-label="Slide ${index + 1}"></span>`;
            },
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          loop={true}
          className="w-full h-full"
          style={{ position: 'absolute', inset: 0 }}
        >
          {slides.map((image, index) => (
            <SwiperSlide key={`${image}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={locale === "pt" ? "Vista aérea de Benguela, Angola, com o litoral e a cidade" : "Aerial view of Benguela, Angola"}
                className="w-full h-full object-cover"
                fetchPriority={index === 0 ? "high" : "low"}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0F2B5B]/80 via-[#0F2B5B]/60 to-[#091d3f]/90" aria-hidden="true" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Botões de navegação personalizados */}
      <button 
        className="swiper-button-prev-custom absolute left-4 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
        aria-label="Slide anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        className="swiper-button-next-custom absolute right-4 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
        aria-label="Próximo slide"
      >
        <ChevronRight size={24} />
      </button>


      {/* Conteúdo - FIXO */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-5 sm:px-6 text-center">
        {heroBadge ? (
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <Zap size={14} aria-hidden="true" />
            {heroBadge}
          </div>
        ) : null}

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-['Montserrat'] leading-tight mb-6">
          {ui.home.heroTitle1}
          <span className="text-[#D4A843]">{ui.home.heroTitleAccent}</span>
          {ui.home.heroTitle2}
        </h1>

        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">{ui.home.heroSubtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={projectsUrl}
            className="inline-flex items-center gap-2 bg-[#E8821A] hover:bg-[#c96d10] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            {ui.home.ctaProjects} <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link
            href={contactUrl}
            className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
          >
            {ui.home.ctaContact}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center" aria-hidden="true">
        <div className="animate-bounce w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}