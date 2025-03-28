"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Navigation,
  Pagination,
  EffectCards,
  EffectCoverflow,
} from "swiper/modules";
import {
  ChevronRight,
  Heart,
  Share2,
  Loader2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Copy,
  X,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Import styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import "swiper/css/effect-coverflow";

// Import the getProducts server action
import { getProducts } from "@/actions/product";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

const ProductCard = ({ id, title, price_rupees, images, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef(null);

  // Choose the first image or use a fallback
  const imageUrl =
    images && images.length > 0
      ? `https://greenglow.in/kauthuk_test/${images[0].image_path}`
      : "/assets/images/placeholder.png";

  // Format price to show with rupee symbol
  const formatPrice = (price) => {
    const formattedPrice = parseFloat(price || 0).toLocaleString('en-IN');
    return `₹${formattedPrice}`;
  };

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle sharing to various platforms
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const shareToFacebook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/product/${id}`)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToTwitter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this product: ${title}`)}&url=${encodeURIComponent(`${window.location.origin}/product/${id}`)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToLinkedin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/product/${id}`)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const copyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  return (
    <div className="h-full">
      <div className="relative h-full flex flex-col border border-gray-200 rounded-md overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {images && images.length > 0 ? (
            <Link href={`/product/${id}`}>
              <Image
                src={imageUrl}
                alt={title || "Product"}
                fill
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                className="object-cover transition-all duration-500 ease-in-out hover:scale-105"
              />
            </Link>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {/* Action buttons container - now at the bottom */}
          <div className="absolute bottom-2 right-2 z-10 flex items-center space-x-2">
            {/* Wishlist button */}
            <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-[#fee3d8] transition-colors">
              <Heart className="w-4 h-4 text-[#6B2F1A]" />
            </button>
            
            {/* Share button */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-[#fee3d8] transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#6B2F1A]" />
              </button>
              
              {/* Share dropdown menu */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute bottom-full right-0 mb-2 bg-white rounded-md shadow-lg overflow-hidden border border-gray-100 w-48"
                  >
                    <div className="p-2">
                      <div className="px-2 py-1 text-xs font-medium text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                        Share this product
                      </div>
                      
                      <button 
                        onClick={shareToFacebook}
                        className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <Facebook size={15} className="mr-2 text-blue-600" />
                        Facebook
                      </button>
                      
                      <button 
                        onClick={shareToTwitter}
                        className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <Twitter size={15} className="mr-2 text-blue-400" />
                        Twitter
                      </button>
                      
                      <button 
                        onClick={shareToLinkedin}
                        className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <Linkedin size={15} className="mr-2 text-blue-700" />
                        LinkedIn
                      </button>
                      
                      <button 
                        onClick={copyLink}
                        className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {copied ? (
                          <Check size={15} className="mr-2 text-green-500" />
                        ) : (
                          <Copy size={15} className="mr-2 text-gray-500" />
                        )}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="p-3 flex flex-col justify-between flex-grow">
          <Link href={`/product/${id}`}>
            <h3 className="text-base font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]" style={{ fontFamily: "Playfair Display, serif" }}>
              {title || "Product"}
            </h3>
          </Link>
          
          <div className="mt-auto">
            <p className="text-lg font-semibold text-[#6B2F1A]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {formatPrice(price_rupees)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductSlider = ({
  category,
  subcategory,
  limit = 8,
  title = "Featured Products",
  viewAllLink = "/products",
  displayType = "default",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = {
          limit,
          sort: "latest",
        };

        if (category) {
          params.category = category;
        }

        if (subcategory) {
          params.subcategory = subcategory;
        }

        const response = await getProducts(params);

        if (response && response.products) {
          setProducts(response.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory, limit]);

  // Swiper configuration based on displayType
  let swiperEffect = {};
  let swiperSlideClass = "";

  switch (displayType) {
    case "cards":
      swiperEffect = { effect: "cards" };
      swiperSlideClass = "!w-72";
      break;
    case "coverflow":
      swiperEffect = {
        effect: "coverflow",
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
      };
      break;
    default:
      swiperEffect = {}; // Standard grid/slider
  }

  // Loading state
  if (loading) {
    return (
      <section className="w-full py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-md overflow-hidden">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded mt-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>{title}</h2>
          <div className="text-center py-12 text-red-600">
            {error}
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="w-full py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>{title}</h2>
          <div className="text-center py-12 text-gray-500">
            No products available
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Playfair Display, serif" }}>
            {title}
          </h2>
          
          <Link href={viewAllLink} className="text-[#6B2F1A] font-medium flex items-center" style={{ fontFamily: "Poppins, sans-serif" }}>
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="relative">
          {/* Left arrow */}
          <button 
            ref={prevRef} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transform -translate-x-4"
            aria-label="Previous products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          {/* Right arrow */}
          <button 
            ref={nextRef} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transform translate-x-4"
            aria-label="Next products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          
          <Swiper
            modules={[Navigation, Autoplay, Pagination, EffectCards, EffectCoverflow]}
            spaceBetween={25}
            slidesPerView={2}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            loop={products.length > 4}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            {...swiperEffect}
            breakpoints={{
              640: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="pb-6"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id} className={swiperSlideClass}>
                <ProductCard
                  id={product.id}
                  title={product.title}
                  price_rupees={product.price_rupees}
                  images={product.ProductImages}
                  index={index}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;