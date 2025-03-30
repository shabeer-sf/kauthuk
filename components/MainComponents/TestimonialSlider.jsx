"use client"
import { getTestimonials } from '@/actions/testimonial';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const TestimonialCard = ({ name, location, description, image, rating = 5, role = "Customer" }) => (
  <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center h-full">
    <div className="testimonial-content flex-1 relative">
      <div className="quote-mark absolute -top-10 left-0 opacity-10">
        <Quote className="w-20 h-20 text-[#6B2F1A]" />
      </div>
      
      <p className="font-poppins text-xl md:text-2xl leading-relaxed text-gray-700 font-light mb-8 relative z-10">
        "{description}"
      </p>
      
      <div className="flex flex-col gap-1">
        <h4 className="playfair-italic-bold text-2xl text-[#6B2F1A]">
          {name}
        </h4>
        
        <p className="font-poppins text-gray-500">
          {location}
        </p>
        
        <div className="flex items-center gap-2 mt-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-5 h-5 ${i < rating ? 'text-[#6B2F1A] fill-[#6B2F1A]' : 'text-gray-300'}`}
            />
          ))}
          <span className="font-poppins text-sm text-gray-500 ml-2">
            {role}
          </span>
        </div>
      </div>
    </div>
    
    <div className="testimonial-image relative flex-shrink-0 w-64 h-64 md:w-80 md:h-80">
      {image ? (
        <Image 
          src={image} 
          alt={name} 
          fill
          className="object-cover rounded-full p-2 border-2 border-[#6B2F1A]/20"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-[#fee3d8] flex items-center justify-center">
          <span className="font-playfair text-[#6B2F1A] text-6xl">{name.charAt(0)}</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-full border-4 border-[#6B2F1A]/10"></div>
    </div>
  </div>
);

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await getTestimonials({
          limit: 10, // Fetch 10 testimonials
          status: 'active',
          sort: 'rating_high'
        });
        
        if (response && response.testimonials) {
          setTestimonials(response.testimonials.slice(0, 10));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-[#F9F4F0] overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="font-poppins text-sm uppercase tracking-widest text-[#6B2F1A]/70 mb-3">
            What People Say
          </p>
          <h2 className="playfair-italic text-4xl md:text-5xl text-[#6B2F1A] mb-6">
            Customer Experiences
          </h2>
          <div className="w-20 h-1 bg-[#6B2F1A]/40 mx-auto mb-6"></div>
          <p className="font-poppins text-gray-600 max-w-2xl mx-auto">
            Discover authentic stories from our customers who have experienced the artistry and craftsmanship of our handcrafted treasures
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-10">
          {testimonials.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-8 bg-[#6B2F1A]' : 'w-3 bg-[#6B2F1A]/30'
              }`}
            ></div>
          ))}
        </div>
        
        <div className="relative">
          {/* Custom navigation buttons */}
          <button 
            className="testimonial-btn prev absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-md text-[#6B2F1A] hover:bg-[#6B2F1A] hover:text-white transition-all duration-300 -left-5 md:left-0"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            className="testimonial-btn next absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-md text-[#6B2F1A] hover:bg-[#6B2F1A] hover:text-white transition-all duration-300 -right-5 md:right-0"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            effect="fade"
            speed={800}
            navigation={{
              prevEl: '.testimonial-btn.prev',
              nextEl: '.testimonial-btn.next',
            }}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="testimonial-slider pb-8"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id} className="py-8">
                <TestimonialCard 
                  name={testimonial.name}
                  location={testimonial.location}
                  description={testimonial.description}
                  image={testimonial.image || null}
                  rating={testimonial.rating || 5}
                  role={testimonial.role || "Verified Customer"}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-[#6B2F1A]/5 z-0"></div>
        <div className="absolute -right-16 top-0 w-32 h-32 rounded-full bg-[#6B2F1A]/5 z-0"></div>
        
        {/* Add custom styles */}
        <style jsx global>{`
          .swiper-fade .swiper-slide {
            opacity: 0 !important;
            transition: opacity 0.8s ease;
          }
          
          .swiper-fade .swiper-slide-active {
            opacity: 1 !important;
          }
          
          .testimonial-slider .swiper-button-disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </section>
  );
};

export default TestimonialSlider;