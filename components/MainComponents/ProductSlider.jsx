"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronRight } from "lucide-react";
import "swiper/css";

import "swiper/css/autoplay";

import "swiper/css/navigation";
const furnitureData = [
  {
    id: 1,
    title: "Victorian Style Wooden Kitchen Cupboard For Storage & Display",
    price: 299.99,
    size: "80X 35X 30",
    image: "furniture1.jpg",
  },
  {
    id: 2,
    title: "Elegant Double Door Teak Wood Crockery Cupboard for Home Interior Decor",
    price: 499.99,
    size: "72X 36X 30",
    image: "furniture2.jpg",
  },
  {
    id: 3,
    title: "Vintage Style Mahagony Wood Crafted Crockery Cupboard with Intricate Carving Design",
    price: 399.99,
    size: "40X 38X 42",
    image: "furniture3.jpg",
  },
  {
    id: 4,
    title: "Classical Teak Wood Crafted Crockery Cupboard with Intricate Carving Design",
    price: 199.99,
    size: "45X 24X 18",
    image: "furniture4.jpg",
  },
  {
    id: 5,
    title: "Teak Wood Crafted Swing Seater Traditional Design For Living Area Decor 4feetX2feet",
    price: 399.99,
    size: "40X 38X 42",
    image: "furniture3.jpg",
  },
  {
    id: 6,
    title: "Classical Teak Wood Crafted Crockery Cupboard with Intricate Carving Design",
    price: 199.99,
    size: "45X 24X 18",
    image: "furniture4.jpg",
  },
];

const ProductCard = ({ title, price, size, image }) => (
  <div className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="relative aspect-square overflow-hidden">
      <Image
        src={`/assets/images/${image}`}
        alt={title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4 bg-white">
      <h3 className="text-lg font-medium text-gray-900 line-clamp-1 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        Size: {size} inches
      </p>
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold text-indigo-600">
          ₹{price.toLocaleString()}
        </p>
        <button className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  </div>
);

const ProductSlider = () => {
  return (
    <section className="w-full py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Our Furniture Collection
          </h2>
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>

        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="pb-12"
        >
          {furnitureData.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductSlider;