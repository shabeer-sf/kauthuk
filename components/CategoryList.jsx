"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories3 } from "@/actions/category";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categories: fetchedCategories } = await getCategories3();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // We're now using global CSS instead of injected styles
  useEffect(() => {
    // Add class to body when component is mounted to help with specificity if needed
    document.body.classList.add('has-mega-menu');
    
    return () => {
      document.body.classList.remove('has-mega-menu');
    };
  }, []);
  
  // Function to get the icon for each category
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Paintings": "🖼️",
      "Gifts & Souvenirs": "🎁",
      "Decor & Crafts": "🏠",
      "Apparels & Accessories": "👕",
      "Furniture": "🪑",
      "Living Essentials": "🏡"
    };
    return icons[categoryName] || "📦";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between py-3 px-4 overflow-x-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-5 bg-gray-200 rounded animate-pulse w-24 mx-2"></div>
        ))}
      </div>
    );
  }

  return (
    <nav className="">
      {/* Main Categories */}
      <div className="flex items-center gap-10 py-4 px-4 max-w-7xl">
        {categories
          .filter(category => category.showHome === 'active')
          .map((category) => (
          <div
            key={category.id}
            className="relative mega-menu-item"
            // Using both React state and CSS hover for better compatibility
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              href={`/category/${category.id}`}
              className="whitespace-nowrap py-2 text-sm font-bold uppercase text-[#fee3d8] transition-colors relative hover:text-[#8D4425] flex items-center subcategory-item"
            >
              <span className="mr-2">{getCategoryIcon(category.catName)}</span>
              {category.catName}
              <span className="category-underline"></span>
            </Link>
            
            {/* Dropdown menu - visibility controlled by CSS hover */}
            {category.SubCategory?.length > 0 && (
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 bg-[#fee3d8] shadow-md rounded-b-md z-50 w-[250px] mt-2 py-3 mega-menu-dropdown text-[#6B2F1A]"
                style={{ borderTop: '2px solid #6B2F1A' }}
              >
                <div className="px-2">
                  <h3 
                    className="font-medium mb-2 px-4 uppercase text-xs tracking-wide text-[#6B2F1A] category-heading"
                  >
                    Browse {category.catName}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-1">
                    {category.SubCategory.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/subcategory/${subcat.id}`}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#F9F4F0] hover:text-[#6B2F1A] rounded-md transition-colors category-heading"
                      >
                        <span>{subcat.subcategory}</span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>
                    ))}
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100 px-4">
                    <Link
                      href={`/category/${category.id}`}
                      className="flex items-center justify-center w-full py-2 text-sm font-medium text-white bg-[#6B2F1A] hover:bg-[#5A2814] rounded-md transition-colors category-heading px-3"
                    >
                      View All {category.catName}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default CategoryList;