import CategoryProductSlider from '@/components/CategoryProductSlider'
import Hero from '@/components/MainComponents/Hero'
import ProductSlider from '@/components/MainComponents/ProductSlider'
import TestimonialSlider from '@/components/MainComponents/TestimonialSlider'
import React from 'react'

const MainPage = () => {
  return (
    <div className='p-3'>
      <Hero />
      <ProductSlider />
      <ProductSlider />
      <ProductSlider />
      <CategoryProductSlider />
      <TestimonialSlider />
    </div>
  )
}

export default MainPage