"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories3 } from "@/actions/category";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  
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

  const handleCategoryHover = (categoryId) => {
    setActiveCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between py-2 px-4 overflow-x-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between py-2 overflow-x-auto px-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative group"
            onMouseEnter={() => handleCategoryHover(category.id)}
            onMouseLeave={() => handleCategoryHover(null)}
          >
            <Link
              href={`/category/${category.id}`}
              className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              {category.catName}
            </Link>
            
            {/* Subcategory dropdown */}
            {category.SubCategory.length > 0 && activeCategory === category.id && (
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-md overflow-hidden z-10 min-w-[200px] border border-gray-100">
                <div className="py-2">
                  {category.SubCategory.map((subcat) => (
                    <Link
                      key={subcat.id}
                      href={`/subcategory/${subcat.id}`}
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      <span>{subcat.subcategory}</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;