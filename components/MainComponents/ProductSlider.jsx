"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronRight, Loader2 } from "lucide-react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

// Import the getProducts server action
import { getProducts } from "@/actions/product";

const ProductCard = ({ id, title, price_rupees, weight, images }) => {
  // Choose the first image or use a fallback
  const imageUrl = images && images.length > 0 
    ? `https://greenglow.in/kauthuk_test/${images[0].image_path}`
    : '/assets/images/placeholder.jpg';

  return (
    <div className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageUrl}
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
          {weight ? `Weight: ${weight} kg` : '\u00A0'} {/* Non-breaking space if no weight */}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-indigo-600">
            ₹{parseFloat(price_rupees).toLocaleString()}
          </p>
          <button className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
            <Link href={`/product/${id}`}>
              View Details
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductSlider = ({ category, limit = 6, title = "Our Products" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          limit,
          category: category || '',
          sort: 'latest'
        });
        
        if (response && response.products) {
          setProducts(response.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, limit]);

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-gray-500">No products available in this category.</p>
      </div>
    );
  }

  return (
    <section className="w-full py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <Link 
            href="/products" 
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
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard 
                id={product.id}
                title={product.title}
                price_rupees={product.price_rupees}
                weight={product.weight}
                images={product.ProductImages}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductSlider;