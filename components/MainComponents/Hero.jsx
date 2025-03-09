"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getSliders } from "@/actions/slider";

const Skeleton = () => (
  <div className="relative w-full h-[65vh] md:h-[75vh] bg-gray-200 animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading...</div>
  </div>
);

const CustomNavButton = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center 
             bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30
             hover:bg-white/30 transition-all duration-300 group
             sm:flex"
    style={{ 
      [direction === "prev" ? "left" : "right"]: "clamp(0.5rem, 5vw, 2rem)"
    }}
    aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
  >
    {direction === "prev" ? (
      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
    ) : (
      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
    )}
  </button>
);

const ProgressBar = ({ progress }) => (
  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
    <div
      className="h-full bg-white transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const SlideCounter = ({ current, total }) => (
  <div className="absolute bottom-8 right-8 z-30 hidden md:flex items-center gap-4 text-white/90">
    <span className="text-sm font-medium">
      {current.toString().padStart(2, "0")}
    </span>
    <div className="w-10 h-px bg-white/40" />
    <span className="text-sm font-medium">
      {total.toString().padStart(2, "0")}
    </span>
  </div>
);

const Hero = () => {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await getSliders({
        page: 1,
      });
      
      if (response && Array.isArray(response.sliders)) {
        setSliders(response.sliders);
      } else {
        setError("Failed to load slider data");
        console.error("Invalid slider data format:", response);
      }
    } catch (error) {
      setError("Failed to fetch sliders");
      console.error("Failed to fetch sliders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Fallback content if there are no sliders
  const noSlidersContent = (
    <div className="relative w-full h-[65vh] md:h-[75vh] bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="max-w-screen-xl mx-auto w-full px-6 md:px-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Welcome to Kauthuk</h1>
        <p className="text-white/80 text-lg mb-8">Discover our collection of beautiful products</p>
        <Link href="/products">
          <button className="px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-all duration-300 flex items-center gap-2 mx-auto">
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return <Skeleton />;
  }

  if (error || !sliders || sliders.length === 0) {
    return noSlidersContent;
  }

  return (
    <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
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
        {sliders.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />

            {slide.image ? (
              <Image
                src={`https://greenglow.in/kauthuk_test/${slide.image}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover transition-transform duration-[2s]"
                alt={slide.title || "Slide image"}
                onError={(e) => {
                  console.error(`Failed to load image: ${slide.image}`);
                  e.target.src = "/placeholder-image.jpg"; // Fallback image path
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800"></div>
            )}

            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 lg:px-24">
              <div className="max-w-screen-xl mx-auto w-full">
                <div className="max-w-2xl space-y-4 md:space-y-6 transform transition-all duration-700 translate-y-0">
                  {slide.subtitle && (
                    <span className="text-white/80 text-sm md:text-base uppercase tracking-wider font-medium">
                      {slide.subtitle}
                    </span>
                  )}

                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
                    {slide.title || "Welcome"}
                  </h1>

                  <p className="text-white/90 text-base md:text-lg max-w-xl">
                    {slide.description || ""}
                  </p>

                  {slide.link && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
                      <Link href={slide.link || "#"}>
                        <button
                          className="px-6 py-3 md:px-8 md:py-4 bg-white text-black font-medium rounded-full
                                   hover:bg-white/90 transition-all duration-300 group flex items-center gap-2"
                        >
                          {slide.linkTitle || "Explore"}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <CustomNavButton
          direction="prev"
          onClick={() => swiperRef.current?.slidePrev()}
        />
        <CustomNavButton
          direction="next"
          onClick={() => swiperRef.current?.slideNext()}
        />

        <ProgressBar progress={progress} />
      </Swiper>

      <SlideCounter current={activeIndex + 1} total={sliders.length} />
    </section>
  );
};

export default Hero;