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
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  ChevronLeft,
  ShoppingBag
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
    <div 
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowShareMenu(false);
      }}
    >
      <div className="relative h-full flex flex-col overflow-hidden group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        {/* Product Tag - New */}
        {index < 2 && (
          <div className="absolute top-3 left-3 z-10 bg-[#6B2F1A] text-white text-xs font-poppins px-2 py-1 rounded">
            New
          </div>
        )}
        
        {/* Image Container */}
        <Link href={`/product/${id}`} className="block relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={title || "Product"}
            fill
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            className="object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
          />
          
          {/* Quick Shop Overlay - Appears on hover */}
          <div className={`absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 px-4 py-2 rounded-full shadow-md">
              <span className="font-poppins text-sm text-[#6B2F1A] font-medium flex items-center">
                <ShoppingBag size={14} className="mr-1" />
                Quick View
              </span>
            </div>
          </div>
        </Link>
        
        {/* Content Container */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <Link href={`/product/${id}`}>
              <h3 className="font-playfair text-base font-medium text-gray-800 line-clamp-2 hover:text-[#6B2F1A] transition-colors">
                {title || "Product"}
              </h3>
            </Link>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <p className="font-poppins text-lg font-semibold text-[#6B2F1A]">
                {formatPrice(price_rupees)}
              </p>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {/* Wishlist button */}
                <button className="w-8 h-8 rounded-full bg-[#FFF5F1] flex items-center justify-center hover:bg-[#fee3d8] transition-colors">
                  <Heart className="w-4 h-4 text-[#6B2F1A]" />
                </button>
                
                {/* Share button */}
                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={handleShare}
                    className="w-8 h-8 rounded-full bg-[#FFF5F1] flex items-center justify-center hover:bg-[#fee3d8] transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-[#6B2F1A]" />
                  </button>
                  
                  {/* Share dropdown menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 w-48 z-50"
                      >
                        <div className="p-2">
                          <div className="px-2 py-1 text-xs font-medium text-gray-500 font-poppins">
                            Share this product
                          </div>
                          
                          <button 
                            onClick={shareToFacebook}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            <Facebook size={15} className="mr-2 text-blue-600" />
                            Facebook
                          </button>
                          
                          <button 
                            onClick={shareToTwitter}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            <Twitter size={15} className="mr-2 text-blue-400" />
                            Twitter
                          </button>
                          
                          <button 
                            onClick={shareToLinkedin}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            <Linkedin size={15} className="mr-2 text-blue-700" />
                            LinkedIn
                          </button>
                          
                          <button 
                            onClick={copyLink}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
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
      <section className="w-full py-12">
        <div className=" mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-white shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-1/3 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full py-12">
        <div className=" mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-6 text-gray-800">{title}</h2>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-poppins">
            {error}
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="w-full py-12">
        <div className=" mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-6 text-gray-800">{title}</h2>
          <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center font-poppins">
            No products available
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 bg-[#FFFBF9]">
      <div className=" mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-playfair font-bold text-gray-800">
              {title}
            </h2>
            <div className="w-16 h-1 bg-[#6B2F1A]/30 mt-2"></div>
          </div>
          
          <Link 
            href={viewAllLink} 
            className="group flex items-center font-poppins text-[#6B2F1A] font-medium text-sm hover:text-[#8B3F2A] transition-colors"
          >
            View All Products
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="relative">
          {/* Left arrow */}
          <button 
            ref={prevRef} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#6B2F1A] hover:bg-[#fee3d8] transition-colors transform -translate-x-5"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Right arrow */}
          <button 
            ref={nextRef} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#6B2F1A] hover:bg-[#fee3d8] transition-colors transform translate-x-5"
            aria-label="Next products"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <Swiper
            modules={[Navigation, Autoplay, Pagination, EffectCards, EffectCoverflow]}
            spaceBetween={20}
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
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="pb-10 pt-2"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id} className={cn("h-full", swiperSlideClass)}>
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