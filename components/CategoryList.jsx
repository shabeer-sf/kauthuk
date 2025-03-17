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
  
  // Add CSS to ensure the dropdown stays visible when moving to subcategories
  useEffect(() => {
    // Add custom CSS to fix hover issues
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
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <nav className="bg-white border-b border-gray-100 relative">
      <div className="flex items-center gap-8 py-3 px-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative mega-menu-item"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              href={`/category/${category.id}`}
              className={`whitespace-nowrap py-2 text-sm font-medium ${
                hoveredCategory === category.id ? 'text-green-600' : 'text-gray-700'
              } transition-colors relative hover:text-green-600`}
            >
              {category.catName}
              {category.SubCategory?.length > 0 && (
                <span 
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transition-transform origin-left duration-300 ${
                    hoveredCategory === category.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                ></span>
              )}
            </Link>
            
            {/* Mega menu dropdown */}
            {category.SubCategory?.length > 0 && hoveredCategory === category.id && (
              <div 
                className="absolute left-0 bg-white shadow-lg rounded-b-lg z-50 w-[300px] mt-1 border-t-2 border-green-500 py-3 mega-menu-dropdown"
              >
                <div className="px-2">
                  <h3 className="font-medium text-green-700 mb-2 px-4 uppercase text-xs tracking-wide">
                    Browse {category.catName}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-1">
                    {category.SubCategory.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/subcategory/${subcat.id}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
                      >
                        <span>{subcat.subcategory}</span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>
                    ))}
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-100 px-4">
                    <Link
                      href={`/category/${category.id}`}
                      className="flex items-center justify-center w-full py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
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