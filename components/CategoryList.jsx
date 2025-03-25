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
  
  // Add custom CSS for hover effects
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .mega-menu-item {
        position: relative;
      }
      .mega-menu-item:hover .mega-menu-dropdown {
        display: block;
      }
      .mega-menu-dropdown {
        display: none;
      }
      
      @font-face {
        font-family: 'Playfair Display';
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2) format('woff2');
      }
      
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2');
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
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
    <nav className="bg-white">
      {/* Main Categories */}
      <div className="flex items-center justify-center gap-10 py-4">
        {categories
          .filter(category => category.showHome === 'active')  // Only show active categories
          .map((category) => (
          <div
            key={category.id}
            className="relative mega-menu-item"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              href={`/category/${category.id}`}
              className="whitespace-nowrap py-2 text-sm font-medium text-[#6B2F1A] transition-colors relative hover:text-[#8D4425] flex items-center"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <span className="mr-2">{getCategoryIcon(category.catName)}</span>
              {category.catName}
              {category.SubCategory?.length > 0 && (
                <span 
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#6B2F1A] transition-transform origin-left duration-300 ${
                    hoveredCategory === category.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                ></span>
              )}
            </Link>
            
            {/* Dropdown menu */}
            {category.SubCategory?.length > 0 && hoveredCategory === category.id && (
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-b-md z-50 w-[250px] mt-1 py-3 mega-menu-dropdown"
                style={{ borderTop: '2px solid #6B2F1A' }}
              >
                <div className="px-2">
                  <h3 
                    className="font-medium mb-2 px-4 uppercase text-xs tracking-wide text-[#6B2F1A]"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Browse {category.catName}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-1">
                    {category.SubCategory.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/subcategory/${subcat.id}`}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#F9F4F0] hover:text-[#6B2F1A] rounded-md transition-colors"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <span>{subcat.subcategory}</span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>
                    ))}
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100 px-4">
                    <Link
                      href={`/category/${category.id}`}
                      className="flex items-center justify-center w-full py-2 text-sm font-medium text-white bg-[#6B2F1A] hover:bg-[#5A2814] rounded-md transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
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