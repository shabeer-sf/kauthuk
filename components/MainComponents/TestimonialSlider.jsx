"use client"
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import "swiper/css";

import "swiper/css/autoplay";

import "swiper/css/navigation";
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Interior Designer",
    location: "New York, NY",
    image: "customer1.jpg",
    rating: 5,
    quote: "The attention to detail and craftsmanship is exceptional. Every piece I've purchased has exceeded my expectations and perfectly complements my clients' spaces.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Home Owner",
    location: "San Francisco, CA",
    image: "customer2.jpg",
    rating: 5,
    quote: "I was hesitant about buying furniture online, but their customer service and product quality won me over. My living room has never looked better!",
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Architect",
    location: "London, UK",
    image: "customer3.jpeg",
    rating: 5,
    quote: "As an architect, I appreciate the blend of functionality and aesthetics. Their furniture pieces are not just beautiful, they're thoughtfully designed for modern living.",
  },
];

const TestimonialCard = ({ name, role, location, image, rating, quote }) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start gap-4 mb-6">
      <Quote className="text-indigo-600 w-10 h-10 flex-shrink-0" />
      <p className="text-gray-700 text-lg leading-relaxed italic">
        "{quote}"
      </p>
    </div>
    
    <div className="flex items-center gap-4 mt-8">
      <div className="relative w-16 h-16 rounded-full overflow-hidden">
        <Image
          src={`/assets/images/${image}`}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-gray-600 text-sm">{role}</p>
        <p className="text-gray-500 text-sm">{location}</p>
      </div>
      
      <div className="flex gap-1">
        {[...Array(rating)].map((_, index) => (
          <Star 
            key={index} 
            className="w-5 h-5 fill-yellow-400 text-yellow-400" 
          />
        ))}
      </div>
    </div>
  </div>
);

const TestimonialSlider = () => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read genuine reviews from our valued customers about their experience with our furniture and service.
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <TestimonialCard {...testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
            View All Reviews
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;