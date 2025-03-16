"use client";

import React, { useEffect, useState } from 'react';
import CategoryProductSlider from '@/components/CategoryProductSlider';
import Hero from '@/components/MainComponents/Hero';
import ProductSlider from '@/components/MainComponents/ProductSlider';
import TestimonialSlider from '@/components/MainComponents/TestimonialSlider';
import QuickContact from '@/components/MainComponents/QuickContact';
import { getCategoriesAndSubcategories } from '@/actions/product';
import { Loader2 } from 'lucide-react';

const MainPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch categories for the product sliders
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategoriesAndSubcategories();
        
        if (categoriesData && categoriesData.length > 0) {
          // Get only active categories with products
          setCategories(categoriesData);
        } else {
          setError("No categories available");
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError("Failed to load product categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // If we're loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 animate-pulse">Loading amazing products...</p>
      </div>
    );
  }

  // If there was an error, still show the page but without category data
  const featuredCategories = categories.slice(0, 3); // Get first 3 categories for the sliders

  return (
    <div className='p-3'>
      <Hero />
      
      {/* Featured Categories Sliders */}
      {featuredCategories.length > 0 ? (
        <>
          {/* Crafted Collection - First category */}
          <ProductSlider 
            category={featuredCategories[0]?.id} 
            title={`${featuredCategories[0]?.catName} Collection`} 
            viewAllLink={`/category/${featuredCategories[0]?.id}`}
            

            limit={8}
          />
          
          {/* Eco-Friendly Products - Second category */}
          {featuredCategories.length > 1 && (
            <ProductSlider 
              category={featuredCategories[1]?.id} 
              title={`${featuredCategories[1]?.catName} Products`}
              viewAllLink={`/category/${featuredCategories[1]?.id}`}
              
              limit={8}
            />
          )}
          
          {/* Trending Now - Third category */}
          {featuredCategories.length > 2 && (
            <ProductSlider 
              category={featuredCategories[2]?.id} 
              title={`${featuredCategories[2]?.catName} Showcase`}
              viewAllLink={`/category/${featuredCategories[2]?.id}`}
              
              limit={8}
            />
          )}
        </>
      ) : (
        // Fallback if no categories found
        <>
          <ProductSlider title="Featured Products" viewAllLink="/products" limit={8} />
          <ProductSlider title="New Arrivals" viewAllLink="/products?sort=latest" displayType="coverflow" limit={8} />
          <ProductSlider title="Popular Items" viewAllLink="/products?sort=popular" displayType="cards" limit={8} />
        </>
      )}
      
      {/* Category Grid Display */}
      {/* <CategoryProductSlider /> */}
      
      {/* Testimonials */}
      <TestimonialSlider />
      
      {/* Quick Contact floating button and form */}
      <QuickContact />
    </div>
  );
};

export default MainPage;