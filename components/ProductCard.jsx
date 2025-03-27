"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Shimmer effect for image loading
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

const ProductCard = ({ product, layout = "grid", onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Safely handle image URLs
  const imageUrl =
    product?.ProductImages && product.ProductImages.length > 0
      ? `https://greenglow.in/kauthuk_test/${product.ProductImages[0].image_path}`
      : "/assets/images/placeholder.png";

  // Calculate discount if applicable
  const hasDiscount = product?.base_price > product?.price_rupees;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.base_price - product.price_rupees) / product.base_price) * 100
      )
    : 0;

  // Determine if product is in stock
  const inStock = product?.stock_status === "yes" && product?.stock_count > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && inStock) {
      onAddToCart(product);
      toast.success("Added to cart successfully!");
    } else if (!inStock) {
      toast.error("Product Out of Stock");
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Added to wishlist!");
  };

  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const gridCard = (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div
        className="group h-full rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-500 ease-out border border-[#6B2F1A]/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={product?.title || "Product Image"}
            fill
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
              shimmer(700, 475)
            )}`}
            className={`object-cover transition-all duration-700 ease-in-out ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="px-2 py-1 bg-[#b38d4a] text-white font-bold shadow-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Stock status badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge
              className={`px-2 py-1 font-medium shadow-sm ${
                inStock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Action buttons overlay */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link href={`/product/${product?.id}`}>
              <button className="w-10 h-10 rounded-full bg-white text-[#6B2F1A] flex items-center justify-center hover:bg-[#6B2F1A] hover:text-white transition-colors shadow-md">
                <Eye className="w-5 h-5" />
              </button>
            </Link>
            {/* <button
              onClick={handleAddToWishlist}
              className="w-10 h-10 rounded-full bg-white text-[#6B2F1A] flex items-center justify-center hover:bg-[#6B2F1A] hover:text-white transition-colors shadow-md"
            >
              <Heart className="w-5 h-5" />
            </button> */}
            {inStock && (
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-white text-[#6B2F1A] flex items-center justify-center hover:bg-[#6B2F1A] hover:text-white transition-colors shadow-md"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          <h3 
            className="text-lg font-medium text-gray-900 line-clamp-1 mb-1 group-hover:text-[#6B2F1A] transition-colors" 
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {product?.title || "Product Name"}
          </h3>

          <div className="flex items-baseline gap-2">
            <p 
              className="text-xl font-bold text-[#6B2F1A]" 
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              ₹{parseFloat(product?.price_rupees || 0).toLocaleString()}
            </p>
            {hasDiscount && (
              <p 
                className="text-sm text-gray-500 line-through" 
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                ₹{parseFloat(product?.base_price || 0).toLocaleString()}
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Link href={`/product/${product?.id}`} className="flex-1">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#6B2F1A] hover:bg-[#5A2814] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const listCard = (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div
        className="group h-full rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-500 p-4 flex flex-col md:flex-row gap-6 border border-[#6B2F1A]/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full md:w-1/4 aspect-square md:aspect-auto overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={product?.title || "Product Image"}
            fill
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
              shimmer(700, 475)
            )}`}
            className={`object-cover transition-all duration-700 ease-in-out ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <Badge 
                className="px-2 py-1 bg-[#b38d4a] text-white font-bold shadow-sm"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Action buttons overlay */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* <button
              onClick={handleAddToWishlist}
              className="w-8 h-8 rounded-full bg-white text-[#6B2F1A] flex items-center justify-center hover:bg-[#6B2F1A] hover:text-white transition-colors shadow-md"
            >
              <Heart className="w-4 h-4" />
            </button> */}
            {inStock && (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-full bg-white text-[#6B2F1A] flex items-center justify-center hover:bg-[#6B2F1A] hover:text-white transition-colors shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-auto">
            <div className="flex items-center justify-between mb-2">
              <Badge
                className={`px-2 py-1 font-medium shadow-sm ${
                  inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <h3 
              className="text-xl font-medium text-gray-900 mb-2 group-hover:text-[#6B2F1A] transition-colors" 
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {product?.title || "Product Name"}
            </h3>
            
            {product?.description && (
              <p 
                className="text-gray-600 line-clamp-2 mb-2" 
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {truncateDescription(product.description, 120)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <p 
                className="text-2xl font-bold text-[#6B2F1A]" 
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                ₹{parseFloat(product?.price_rupees || 0).toLocaleString()}
              </p>
              {hasDiscount && (
                <p 
                  className="text-sm text-gray-500 line-through" 
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  ₹{parseFloat(product?.base_price || 0).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Link href={`/product/${product?.id}`}>
                <button
                  type="button"
                  className="px-6 py-2 bg-[#6B2F1A] hover:bg-[#5A2814] text-white rounded-lg transition-colors"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  View Details
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return layout === "grid" ? gridCard : listCard;
};

export default ProductCard;