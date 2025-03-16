"use client"
import { getTestimonials } from '@/actions/testimonial';
import { Loader2, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

const TestimonialCard = ({ name, location, description, rating, role = "Customer" }) => (
  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
    <div className="flex items-start gap-4 mb-6">
      <Quote className="text-indigo-600 w-10 h-10 flex-shrink-0" />
      <p className="text-gray-700 text-lg leading-relaxed italic">
        "{description}"
      </p>
    </div>
    
    <div className="flex items-center gap-4 mt-8">
      {/* <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
     
      </div> */}
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-gray-600 text-sm">{role}</p>
        <p className="text-gray-500 text-sm">{location}</p>
      </div>
      
      {/* Rating stars - uncomment if you want to show ratings */}
      {/* <div className="flex gap-1">
        {[...Array(rating)].map((_, index) => (
          <Star 
            key={index} 
            className="w-5 h-5 fill-yellow-400 text-yellow-400" 
          />
        ))}
      </div> */}
    </div>
  </div>
);

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        // Only fetch published/active testimonials
        const response = await getTestimonials({
          limit: 12, // Fetch more testimonials for a better slider experience
          status: 'active', // Assuming 'active' is the status for published testimonials
          sort: 'rating_high' // Show highest rated testimonials first
        });
        
        if (response && response.testimonials) {
          setTestimonials(response.testimonials);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
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
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // If no testimonials are available, don't render the section
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

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
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-16"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto">
              <TestimonialCard 
                name={testimonial.name}
                location={testimonial.location}
                description={testimonial.description}
                rating={testimonial.rating}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialSlider;