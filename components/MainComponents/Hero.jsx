"use client";

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";

import "swiper/css/autoplay";

import "swiper/css/navigation";
const heroSlides = [
  {
    id: 1,
    mainTitle: "Elegant Interiors",
    title: "Discover Timeless Furniture",
    description: "Explore our exclusive collection of handcrafted furniture designed to bring elegance and comfort to your home.",
    image: "hero1.jpg",
    cta: "Explore Collection",
  },
  {
    id: 2,
    mainTitle: "Modern Living",
    title: "Enhance Your Space",
    description: "Our latest designs blend sophistication with functionality, perfect for contemporary homes.",
    image: "hero2.jpeg",
    cta: "View Latest Designs",
  },
  {
    id: 3,
    mainTitle: "Luxury Redefined",
    title: "Quality Meets Design",
    description: "Experience luxury with our premium furniture collection crafted with precision and style.",
    image: "hero3.jpg",
    cta: "Shop Premium",
  },
];

const CustomNavButton = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center 
               bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20
               hover:bg-white/20 transition-all duration-300 group
               hidden md:flex"
    style={{ [direction === 'prev' ? 'left' : 'right']: '2rem' }}
  >
    {direction === 'prev' ? 
      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" /> : 
      <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
    }
  </button>
);

const ProgressBar = ({ progress }) => (
  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
    <div 
      className="h-full bg-white transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const Hero = () => {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} w-2 h-2 bg-white/50 hover:bg-white transition-all duration-300"></span>`;
          },
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
          setProgress(0);
        }}
        onAutoplayTimeLeft={(_, time, progress) => {
          setProgress((1 - progress) * 100);
        }}
        modules={[Autoplay, Navigation, EffectFade, Pagination]}
        className="h-full w-full"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 z-10" />
            
            <Image
              src={`/assets/images/${slide.image}`}
              fill
              priority={index === 0}
              className="object-cover transform scale-105 transition-transform duration-[2s]"
              alt={slide.title}
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 lg:px-24">
              <div className="max-w-screen-xl mx-auto w-full">
                <div className="max-w-2xl space-y-6">
                  <span className="text-white/80 text-sm md:text-base uppercase tracking-wider font-medium">
                    {slide.mainTitle}
                  </span>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
                    {slide.title}
                  </h1>
                  
                  <p className="text-white/90 text-base md:text-lg max-w-xl">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/collection">
                      <button className="px-8 py-4 bg-white text-black font-medium rounded-full
                                     hover:bg-white/90 transition-all duration-300 group flex items-center gap-2">
                        {slide.cta}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    <Link href="/catalog">
                      <button className="px-8 py-4 bg-transparent text-white font-medium rounded-full
                                     border border-white/30 hover:bg-white/10 transition-all duration-300">
                        View Catalog
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <CustomNavButton direction="prev" onClick={() => document.querySelector('.swiper-button-prev')?.click()} />
        <CustomNavButton direction="next" onClick={() => document.querySelector('.swiper-button-next')?.click()} />
        
        <ProgressBar progress={progress} />
      </Swiper>

      <div className="absolute bottom-8 right-8 z-30 hidden md:flex items-center gap-4 text-white/80">
        <span className="text-sm font-medium">
          {(activeIndex + 1).toString().padStart(2, '0')}
        </span>
        <div className="w-10 h-px bg-white/30" />
        <span className="text-sm font-medium">
          {heroSlides.length.toString().padStart(2, '0')}
        </span>
      </div>
    </section>
  );
};

export default Hero;