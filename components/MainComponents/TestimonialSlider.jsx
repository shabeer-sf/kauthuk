"use client"
import { getTestimonials } from '@/actions/testimonial';
import { Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

const TestimonialCard = ({ name, location, description, role = "Customer" }) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 relative">
    <div className="absolute -top-5 left-8 bg-green-600 p-2 rounded-full">
      <Quote className="text-white w-6 h-6" />
    </div>
    
    <div className="pt-4">
      <p className="text-gray-700 text-lg leading-relaxed">
        "{description}"
      </p>
    </div>
    
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-gray-500 text-sm">{location}</p>
        </div>
        
        <div className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
          {role}
        </div>
      </div>
    </div>
  </div>
);

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await getTestimonials({
          limit: 6, // Fetch a few more than we need
          status: 'active',
          sort: 'rating_high'
        });
        
        if (response && response.testimonials) {
          // Take only the top 3 testimonials
          setTestimonials(response.testimonials.slice(0, 3));
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
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Customer Testimonials
          </h2>
          <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover what our customers have to say about their experiences with our eco-friendly products
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={true}
          pagination={{ 
            clickable: true,
            dynamicBullets: true 
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="testimonial-slider pb-16"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto py-4">
              <TestimonialCard 
                name={testimonial.name}
                location={testimonial.location}
                description={testimonial.description}
                role={testimonial.role || "Customer"}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Add some custom styles to match your brand */}
        <style jsx global>{`
          .testimonial-slider .swiper-pagination-bullet-active {
            background-color: #16a34a; /* Green-600 */
          }
          
          .testimonial-slider .swiper-button-next,
          .testimonial-slider .swiper-button-prev {
            color: #16a34a;
            opacity: 0.7;
            transition: all 0.3s ease;
          }
          
          .testimonial-slider .swiper-button-next:hover,
          .testimonial-slider .swiper-button-prev:hover {
            opacity: 1;
          }
        `}</style>
      </div>
    </section>
  );
};

export default TestimonialSlider;