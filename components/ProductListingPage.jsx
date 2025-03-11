"use client";

import React, { useState, useEffect, useCallback,Suspense  } from 'react';
import Image from "next/image";
import Link from "next/link";
import {  useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  Eye, 
  Grid3x3, 
  Rows3, 
  CheckCircle2,
  Loader2
} from "lucide-react";

// Import UI components
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import the getProducts server action
import { getProducts } from "@/actions/product";
import { getCategories } from "@/actions/category"; // Assuming you have this action
import { toast } from 'sonner';

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

// Product card component
const ProductCard = ({ product, layout = "grid", onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  console.log("product?.ProductImages",product?.ProductImages)
  // Safely handle image URLs
  const imageUrl = product?.ProductImages && product.ProductImages.length > 0 
    ? `https://greenglow.in/kauthuk_test/${product.ProductImages[0].image_path}`
    : '/assets/images/placeholder.jpg';
  
  // Calculate discount if applicable (should come from the API in a real app)
  const hasDiscount = product?.base_price > product?.price_rupees;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.base_price - product.price_rupees) / product.base_price) * 100) 
    : 0;
  
  // Determine if product is in stock
  const inStock = product?.stock_status === 'yes' && product?.stock_count > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && inStock) {
      onAddToCart(product);
    } else if (!inStock) {
      toast("Product Out of Stock");
    }
  };

  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const gridCard = (
    <motion.div 
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div 
        className="group h-full rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={product?.title || 'Product Image'}
            fill
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            className={`object-cover transition-all duration-700 ease-in-out ${isHovered ? "scale-110" : "scale-100"}`}
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="px-2 py-1 bg-red-500 text-white font-bold shadow-sm">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
          
          {/* Stock status badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge className={`px-2 py-1 font-medium shadow-sm ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
          
          {/* Action buttons overlay */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <Link href={`/product/${product?.id}`}>
              <button className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors shadow-md">
                <Eye className="w-5 h-5" />
              </button>
            </Link>
            
            
          </div>
        </div>
        
        <div className="p-5">
          
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
            {product?.title || 'Product Name'}
          </h3>
          
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {truncateDescription(product?.description)} 
          </p>
          
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-indigo-600">
              ₹{parseFloat(product?.price_rupees || 0).toLocaleString()}
            </p>
            {hasDiscount && (
              <p className="text-sm text-gray-500 line-through">
                ₹{parseFloat(product?.base_price || 0).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex gap-2">
            <Link href={`/product/${product?.id}`} className="flex-1">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                View Details
              </button>
            </Link>
            <button 
              type="button"
              className={`p-2.5 ${inStock ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-lg transition-colors`}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const listCard = (
    <motion.div 
      className="h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div 
        className="group h-full rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 p-4 flex flex-col md:flex-row gap-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {console.log("imageUrl",imageUrl)}
        <div className="relative w-full md:w-1/4 aspect-square md:aspect-auto overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={product?.title || 'Product Image'}
            fill
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            className={`object-cover transition-all duration-700 ease-in-out ${isHovered ? "scale-110" : "scale-100"}`}
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="px-2 py-1 bg-red-500 text-white font-bold shadow-sm">
                -{discountPercentage}%
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="mb-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
                <span className="text-xs text-gray-500 ml-2">(24)</span>
              </div>
              
              <Badge className={`px-2 py-1 font-medium shadow-sm ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {product?.title || 'Product Name'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4 md:line-clamp-3">
              {product?.description || 'No description available'} 
            </p>
            
            {/* Additional product details */}
            <div className="hidden md:grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
              {product?.weight && (
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span>Weight: {product.weight} kg</span>
                </div>
              )}
              {product?.hasVariants && (
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span>Multiple variants available</span>
                </div>
              )}
              {product?.SubCategory && (
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span>Category: {product.SubCategory.subcategory}</span>
                </div>
              )}
              {product?.free_shipping === 'yes' && (
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span>Free Shipping</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-indigo-600">
                ₹{parseFloat(product?.price_rupees || 0).toLocaleString()}
              </p>
              {hasDiscount && (
                <p className="text-sm text-gray-500 line-through">
                  ₹{parseFloat(product?.base_price || 0).toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                type="button"
                className={`px-4 py-2 ${inStock ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} rounded-full transition-colors`}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <Link href={`/product/${product?.id}`}>
                <button 
                  type="button"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return layout === "grid" ? gridCard : listCard;
};

// Filter sidebar component
const FilterSidebar = ({ isOpen, onClose, categories, onFilter, initialFilters }) => {
  const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || [0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState(initialFilters?.categories || []);
  const [selectedAvailability, setSelectedAvailability] = useState(initialFilters?.availability || "all");
  
 
  // Availability options
  const availability = [
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "all", label: "All Products" },
  ];
  
  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setPriceRange(initialFilters.priceRange || [0, 50000]);
      setSelectedCategories(initialFilters.categories || []);
      setSelectedAvailability(initialFilters.availability || "all");
    }
  }, [initialFilters]);
  
  const handleCategoryChange = (category, checked) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, category]
        : prev.filter(cat => cat !== category)
    );
  };
  
  const applyFilters = () => {
    onFilter({
      priceRange,
      categories: selectedCategories,
      availability: selectedAvailability,
    });
    
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };
  
  const resetFilters = () => {
    setPriceRange([0, 50000]);
    setSelectedCategories([]);
    setSelectedAvailability("all");
    
    onFilter({
      priceRange: [0, 50000],
      categories: [],
      availability: "all",
    });
  };

  return (
    <>
      {/* Mobile filter sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-md sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">Filters</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="font-medium text-lg mb-4">Price Range</h3>
              <Slider
                value={priceRange}
                max={50000}
                step={100}
                onValueChange={setPriceRange}
                className="mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">₹{priceRange[0].toLocaleString()}</span>
                <span className="text-sm text-gray-600">₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Category Selection */}
            <div>
              <h3 className="font-medium text-lg mb-4">Categories</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`category-${category.id}`} 
                        checked={selectedCategories.includes(category.catName)}
                        onCheckedChange={(checked) => handleCategoryChange(category.catName, checked)}
                        className="mr-2"
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-gray-700">
                        {category.catName}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No categories available</p>
                )}
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            
                        
            {/* Availability */}
            <div>
              <h3 className="font-medium text-lg mb-4">Availability</h3>
              <RadioGroup value={selectedAvailability} onValueChange={setSelectedAvailability}>
                {availability.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`availability-${option.value}`} />
                    <Label htmlFor={`availability-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <div className="hidden md:block w-full sticky top-24">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-xl mb-6">Filters</h3>
          
          <Accordion type="multiple" defaultValue={["price", "category", "availability"]} className="space-y-4">
            {/* Price Range */}
            <AccordionItem value="price" className="border-b-0">
              <AccordionTrigger className="py-2 text-base font-medium hover:no-underline">
                Price Range
              </AccordionTrigger>
              <AccordionContent>
                <Slider
                  value={priceRange}
                  max={50000}
                  step={100}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">₹{priceRange[0].toLocaleString()}</span>
                  <span className="text-sm text-gray-600">₹{priceRange[1].toLocaleString()}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Category Selection */}
            <AccordionItem value="category" className="border-b-0">
              <AccordionTrigger className="py-2 text-base font-medium hover:no-underline">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox 
                          id={`desktop-category-${category.id}`} 
                          checked={selectedCategories.includes(category.catName)}
                          onCheckedChange={(checked) => handleCategoryChange(category.catName, checked)}
                          className="mr-2"
                        />
                        <Label htmlFor={`desktop-category-${category.id}`} className="text-gray-700">
                          {category.catName}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No categories available</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
          
            
            {/* Availability */}
            <AccordionItem value="availability" className="border-b-0">
              <AccordionTrigger className="py-2 text-base font-medium hover:no-underline">
                Availability
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup value={selectedAvailability} onValueChange={setSelectedAvailability}>
                  {availability.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`desktop-availability-${option.value}`} />
                      <Label htmlFor={`desktop-availability-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Active filters component
const ActiveFilters = ({ filters, onRemove, onClearAll }) => {
  if (!filters) return null;
  
  // Don't render if no filters are active
  if (
    (!filters.categories || filters.categories.length === 0) && 
    (filters.priceRange?.[0] === 0 && filters.priceRange?.[1] === 50000) &&
    filters.availability === "all"
  ) {
    return null;
  }
  
  // Helper function to get readable filter values
  const getAvailabilityLabel = (value) => {
    switch (value) {
      case "in-stock": return "In Stock";
      case "out-of-stock": return "Out of Stock";
      default: return null;
    }
  };
  
 
  
  const availabilityLabel = getAvailabilityLabel(filters.availability);
  
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Active Filters:</span>
      
      {/* Category filters */}
      {filters.categories?.map((category) => (
        <Badge key={category} variant="outline" className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200">
          {category}
          <button type="button" onClick={() => onRemove("category", category)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {/* Price range filter */}
      {filters.priceRange && (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000) && (
        <Badge variant="outline" className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200">
          ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
          <button type="button" onClick={() => onRemove("priceRange")}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
   
      
      {/* Availability filter */}
      {availabilityLabel && (
        <Badge variant="outline" className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200">
          {availabilityLabel}
          <button type="button" onClick={() => onRemove("availability")}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      <button 
        type="button"
        onClick={onClearAll}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Clear All
      </button>
    </div>
  );
};

function SearchParamsHandler({ onParamsChange }) {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (!searchParams) return;
    
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortParam = searchParams.get('sort') || 'latest';
    
    onParamsChange({
      query,
      categoryParam,
      page,
      sortParam
    });
  }, [searchParams, onParamsChange]);
  
  return null;
}
// Main product listing component
const ProductListingPage = () => {
  const router = useRouter();
 
  
  // State variables
 
  const [urlParams, setUrlParams] = useState({
    query: '',
    categoryParam: '',
    page: 1,
    sortParam: 'latest'
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState("grid"); // grid or list
  const [sortOption, setSortOption] = useState(urlParams.sortParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(urlParams.page);
  const [searchQuery, setSearchQuery] = useState(urlParams.query);

  // Filter state
 const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    categories: urlParams.categoryParam ? [urlParams.categoryParam] : [],
    availability: "all",
  });
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const handleUrlParamsChange = useCallback((params) => {
    setUrlParams(params);
    setSearchQuery(params.query);
    setSortOption(params.sortParam);
    setCurrentPage(params.page);
    
    // Update categories filter when category param changes
    if (params.categoryParam && (!filters.categories.includes(params.categoryParam))) {
      setFilters(prev => ({
        ...prev,
        categories: params.categoryParam ? [params.categoryParam] : prev.categories
      }));
    }
  }, [filters.categories]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      categories: urlParams.categoryParam ? [urlParams.categoryParam] : prev.categories
    }));
  }, [urlParams.categoryParam]);

  // Function to update URL with search parameters
  const updateURLParams = useCallback((newParams) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    
    // Update existing params or add new ones
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    // Update the URL without reloading the page
    router.push(url.pathname + url.search, { scroll: false });
  }, [router]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // If you have a getCategories action, use it
        const response = await getCategories();
        if (response && response.categories) {
          setCategories(response.categories);
        } else {
          // Fallback to placeholder data
          setCategories([
            { id: 1, catName: "Electronics" },
            { id: 2, catName: "Clothing" },
            { id: 3, catName: "Home & Kitchen" },
            { id: 4, catName: "Beauty" },
            { id: 5, catName: "Books" }
          ]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Use placeholder data on error
        setCategories([
          { id: 1, catName: "Electronics" },
          { id: 2, catName: "Clothing" },
          { id: 3, catName: "Home & Kitchen" },
          { id: 4, catName: "Beauty" },
          { id: 5, catName: "Books" }
        ]);
      }
    };
    
    fetchCategories();
  }, []);
  // Update sort option and URL when sort changes
  useEffect(() => {
    if (sortOption !== urlParams.sortParam) {
      updateURLParams({ sort: sortOption });
    }
  }, [sortOption, urlParams.sortParam, updateURLParams]);

  // Update page number in URL when current page changes
  useEffect(() => {
    if (currentPage !== urlParams.page) {
      updateURLParams({ page: currentPage });
    }
  }, [currentPage, urlParams.page, updateURLParams]);
  
  // Fetch products with search, category, pagination, and sorting
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Create params object for API call
        const params = {
          page: currentPage,
          limit: 9, // Products per page
          category: urlParams.categoryParam || '',
          sort: sortOption,
          search: urlParams.query || ''
        };
        
        const response = await getProducts(params);
        
        if (response) {
          if (response.products) {
            setProducts(response.products);
            applyFilters(response.products, filters);
          }
          
          if (response.total) {
            setTotalProducts(response.total);
            setTotalPages(Math.ceil(response.total / 9)); // 9 products per page
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [urlParams.query, urlParams.categoryParam, sortOption, currentPage, filters]);
  
  // Apply filters to products
  const applyFilters = useCallback((productsToFilter, currentFilters) => {
    if (!productsToFilter || !Array.isArray(productsToFilter)) {
      setFilteredProducts([]);
      return;
    }
    
    const filtered = productsToFilter.filter(product => {
      // Price filter
      const price = parseFloat(product?.price_rupees || 0);
      if (price < currentFilters?.priceRange?.[0] || price > currentFilters?.priceRange?.[1]) {
        return false;
      }
      
      // Category filter
      if (currentFilters?.categories && currentFilters.categories.length > 0) {
        const productCategory = product?.SubCategory?.Category?.catName;
        if (!productCategory || !currentFilters.categories.includes(productCategory)) {
          return false;
        }
      }
      
   
      // Availability filter
      if (currentFilters?.availability !== "all") {
        const inStock = product?.stock_status === 'yes' && product?.stock_count > 0;
        if (
          (currentFilters.availability === "in-stock" && !inStock) ||
          (currentFilters.availability === "out-of-stock" && inStock)
        ) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredProducts(filtered);
  }, []);

  // Effect to filter products when filters or products change
  useEffect(() => {
    applyFilters(products, filters);
  }, [products, filters, applyFilters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };
  
  // Handle removing individual filters
  const handleRemoveFilter = (type, value) => {
    if (!filters) return;
    
    let updatedFilters = { ...filters };
    
    switch (type) {
      case "category":
        updatedFilters.categories = filters.categories ? 
          filters.categories.filter(cat => cat !== value) : [];
        break;
      case "priceRange":
        updatedFilters.priceRange = [0, 50000];
        break;
      case "availability":
        updatedFilters.availability = "all";
        break;
      default:
        break;
    }
    
    setFilters(updatedFilters);
  };
  
  // Handle clearing all filters
  const handleClearAllFilters = () => {
    const resetFilters = {
      priceRange: [0, 50000],
      categories: [],
      availability: "all",
    };
    setFilters(resetFilters);
  };
  
  // Handle search submissions
  const handleSearch = (e) => {
    e.preventDefault();
    updateURLParams({ q: searchQuery, page: 1 });
  };
  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('');
    updateURLParams({ q: '', page: 1 });
  };
  
  // Handle adding to cart
  const handleAddToCart = (product) => {
    toast({
      title: "Added to Cart",
      description: `${product?.title || 'Product'} has been added to your cart.`,
      duration: 3000,
    });
    // Here you would typically call your cart service or API
  };
  
  
  // Generate page title based on search or category
  const getPageTitle = () => {
    if (urlParams.query) return `Search Results for "${urlParams.query}"`;
    if (urlParams.categoryParam) return urlParams.categoryParam;
    return "All Products";
  };
  
  
  // Create pagination array
  const getPaginationArray = () => {
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const halfWay = Math.floor(maxPagesToShow / 2);
    
    // If current page is close to the beginning
    if (currentPage <= halfWay) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    
    // If current page is close to the end
    if (currentPage > totalPages - halfWay) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Current page is in the middle
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages
    ];
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsChange={handleUrlParamsChange} />
      </Suspense>
      {/* Search and page header */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button 
                  type="button"
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={handleClearSearch}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm font-medium"
              >
                Search
              </button>
            </form>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
            <p className="text-gray-600">{filteredProducts.length} products found</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar for desktop */}
          <div className="hidden md:block w-1/4">
            <FilterSidebar 
              isOpen={false} 
              onClose={() => {}} 
              categories={categories}
              onFilter={handleFilterChange}
              initialFilters={filters}
            />
          </div>
          
          <div className="w-full md:w-3/4">
            {/* Mobile filter button and sort options */}
            <div className="flex items-center justify-between mb-6">
              <button 
                type="button"
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <button 
                    type="button"
                    className={`p-2 rounded-md ${layout === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600'}`}
                    onClick={() => setLayout('grid')}
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </button>
                  <button 
                    type="button"
                    className={`p-2 rounded-md ${layout === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600'}`}
                    onClick={() => setLayout('list')}
                  >
                    <Rows3 className="h-5 w-5" />
                  </button>
                </div>
                
                <Select defaultValue='latest' value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Active filters */}
            <ActiveFilters 
              filters={filters} 
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
            
            {/* Products grid/list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500 text-lg animate-pulse">Loading products...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-xl p-6 text-center">
                <p className="text-red-500 font-medium text-lg mb-2">Oops! Something went wrong</p>
                <p className="text-gray-600">{error}</p>
                <button 
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-10 text-center">
                <p className="text-gray-600 font-medium text-xl mb-3">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <button 
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  className={`grid gap-6 ${
                    layout === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}
                  layout
                >
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product?.id || Math.random().toString()} 
                      product={product} 
                      layout={layout}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center gap-1">
                  <button 
                    type="button"
                    className={`w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  
                  {getPaginationArray().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button 
                          type="button"
                          className={`w-10 h-10 flex items-center justify-center rounded-md ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  
                  <button 
                    type="button"
                    className={`w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile filter */}
      <FilterSidebar 
        isOpen={isMobileFilterOpen} 
        onClose={() => setIsMobileFilterOpen(false)} 
        categories={categories}
        onFilter={handleFilterChange}
        initialFilters={filters}
      />
    </div>
  );
};

export default ProductListingPage;