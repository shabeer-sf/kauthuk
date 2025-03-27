"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2, 
  ChevronRight,
  Grid3x3,
  Rows3,
  ArrowRight,
  Tag,
  Filter,
  Box,
  LayoutGrid,
  Check,
  PanelTop
} from "lucide-react";

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Import server actions 
import { getProducts } from "@/actions/product";
import { getSubcategories } from "@/actions/category";

// Import ProductCard from your existing component
import ProductCard from "@/components/ProductCard";

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
  typeof window === "undefined"
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const CategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id;

  // State variables
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [currentSubcategory, setCurrentSubcategory] = useState("all");
  const [sortOption, setSortOption] = useState("latest");
  const [productCount, setProductCount] = useState(0);

  // Fetch subcategories and initial products on component mount
  useEffect(() => {
    if (!categoryId) {
      setError("Category ID is required");
      setLoading(false);
      return;
    }

    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        // Fetch subcategories
        const subcategoriesResponse = await getSubcategories(categoryId);
        
        if (!subcategoriesResponse.success) {
          throw new Error(subcategoriesResponse.error || "Failed to fetch subcategories");
        }

        // Set subcategories data
        setSubcategories(subcategoriesResponse.subcategories || []);
        
        // Get product count from subcategories
        const totalProducts = subcategoriesResponse.subcategories.reduce(
          (total, sub) => total + (sub._count?.Product || 0), 
          0
        );
        setProductCount(totalProducts);
        
        // Fetch products for this category
        const productsResponse = await getProducts({
          category: categoryId,
          limit: 12,
          sort: sortOption
        });

        if (productsResponse && productsResponse.products) {
          setProducts(productsResponse.products);
          
          // Set featured products (first 4 products)
          setFeaturedProducts(productsResponse.products.slice(0, 4));
          
          // If category name is not directly available from subcategories response,
          // extract it from the first product's category
          if (productsResponse.products.length > 0 && 
              productsResponse.products[0].SubCategory?.Category) {
            setCategory(productsResponse.products[0].SubCategory.Category);
          }
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError(err.message || "Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  // Handle subcategory change
  const handleSubcategoryChange = async (subcategoryId) => {
    try {
      setLoading(true);
      
      // If "all" is selected, fetch all products from the category
      if (subcategoryId === "all") {
        const response = await getProducts({
          category: categoryId,
          limit: 12,
          sort: sortOption
        });
        
        if (response && response.products) {
          setProducts(response.products);
          setCurrentSubcategory("all");
        }
      } else {
        // Fetch products for the selected subcategory
        const response = await getProducts({
          subcategory: subcategoryId,
          limit: 12,
          sort: sortOption
        });
        
        if (response && response.products) {
          setProducts(response.products);
          setCurrentSubcategory(subcategoryId);
        }
      }
    } catch (err) {
      console.error("Error fetching subcategory products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = async (option) => {
    try {
      setLoading(true);
      setSortOption(option);
      
      // If a subcategory is selected, fetch products for that subcategory with the new sort option
      if (currentSubcategory !== "all") {
        const response = await getProducts({
          subcategory: currentSubcategory,
          limit: 12,
          sort: option
        });
        
        if (response && response.products) {
          setProducts(response.products);
        }
      } else {
        // Fetch all products for the category with the new sort option
        const response = await getProducts({
          category: categoryId,
          limit: 12,
          sort: option
        });
        
        if (response && response.products) {
          setProducts(response.products);
        }
      }
    } catch (err) {
      console.error("Error fetching sorted products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-[#F9F4F0] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#6B2F1A] mb-4" />
        <p className="text-gray-600 animate-pulse text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>Loading category...</p>
      </div>
    );
  }

  // Error state
  if (error && !products.length) {
    return (
      <div className="min-h-screen bg-[#F9F4F0] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="bg-[#fee3d8] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Tag className="h-8 w-8 text-[#6B2F1A]" />
          </div>
          <h2 className="text-2xl font-bold text-[#6B2F1A] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>Category Not Found</h2>
          <p className="text-gray-600 mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>{error}</p>
          <Button 
            onClick={() => router.push("/products")}
            className="bg-[#6B2F1A] hover:bg-[#5A2814] text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Browse All Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F4F0] min-h-screen">
      {/* Category Hero Section */}
      <div className="bg-gradient-to-r from-[#6B2F1A] to-[#b38d4a] text-white">
        <div className="container mx-auto px-4 py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/80 hover:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products" className="text-white/80 hover:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Products
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-white font-medium" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {category?.catName || "Category"}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>{category?.catName || "Category"}</h1>
              <p className="text-white/80 max-w-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
                Explore our collection of {category?.catName || "products"} crafted with sustainable materials 
                and traditional artisanship. Perfect for your home and special occasions.
              </p>
              <div className="flex items-center mt-4">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {productCount} Products
                </Badge>
                <span className="mx-2 text-white/40">•</span>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {subcategories.length} Subcategories
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => router.push(`/products?category=${categoryId}`)}
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                View All Products
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#6B2F1A]" style={{ fontFamily: "Playfair Display, serif" }}>
                Featured {category?.catName || "Products"}
              </h2>
              <Link 
                href={`/products?category=${categoryId}&sort=popular`}
                className="text-[#6B2F1A] hover:text-[#5A2814] flex items-center"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                View more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard product={product} layout="grid" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Subcategories Section */}
      <section className="py-12 bg-[#F9F4F0]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#6B2F1A] mb-8" style={{ fontFamily: "Playfair Display, serif" }}>Browse by Subcategory</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* All Products Tab */}
            <Card 
              className={`cursor-pointer transition-all ${
                currentSubcategory === "all" 
                  ? "border-[#6B2F1A] ring-2 ring-[#6B2F1A] ring-opacity-20" 
                  : "hover:border-[#6B2F1A]/30"
              }`}
              onClick={() => handleSubcategoryChange("all")}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  currentSubcategory === "all" 
                    ? "bg-[#fee3d8] text-[#6B2F1A]" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-[#6B2F1A]" style={{ fontFamily: "Playfair Display, serif" }}>All</h3>
                <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>{productCount} items</p>
                {currentSubcategory === "all" && (
                  <Badge className="mt-2 bg-[#fee3d8] text-[#6B2F1A] border-none" style={{ fontFamily: "Poppins, sans-serif" }}>
                    <Check className="mr-1 h-3 w-3" />
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
            
            {/* Subcategory Tabs */}
            {subcategories.map((subcategory) => (
              <Card 
                key={subcategory.id}
                className={`cursor-pointer transition-all ${
                  currentSubcategory === subcategory.id 
                    ? "border-[#6B2F1A] ring-2 ring-[#6B2F1A] ring-opacity-20" 
                    : "hover:border-[#6B2F1A]/30"
                }`}
                onClick={() => handleSubcategoryChange(subcategory.id)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    currentSubcategory === subcategory.id 
                      ? "bg-[#fee3d8] text-[#6B2F1A]" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <Box className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-[#6B2F1A] line-clamp-1" style={{ fontFamily: "Playfair Display, serif" }}>{subcategory.subcategory}</h3>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>{subcategory._count?.Product || 0} items</p>
                  {currentSubcategory === subcategory.id && (
                    <Badge className="mt-2 bg-[#fee3d8] text-[#6B2F1A] border-none" style={{ fontFamily: "Poppins, sans-serif" }}>
                      <Check className="mr-1 h-3 w-3" />
                      Selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#6B2F1A]" style={{ fontFamily: "Playfair Display, serif" }}>
                {currentSubcategory === "all" 
                  ? `All ${category?.catName || "Products"}` 
                  : subcategories.find(s => s.id === currentSubcategory)?.subcategory || "Products"}
              </h2>
              <p className="text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                {products.length} products found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <button 
                  type="button"
                  className={`p-2 rounded-md ${layout === 'grid' ? 'bg-[#fee3d8] text-[#6B2F1A]' : 'bg-white text-gray-600'}`}
                  onClick={() => setLayout('grid')}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button 
                  type="button"
                  className={`p-2 rounded-md ${layout === 'list' ? 'bg-[#fee3d8] text-[#6B2F1A]' : 'bg-white text-gray-600'}`}
                  onClick={() => setLayout('list')}
                >
                  <Rows3 className="h-5 w-5" />
                </button>
              </div>
              
              <Tabs defaultValue={sortOption} onValueChange={handleSortChange}>
                <TabsList className="bg-[#F9F4F0]">
                  <TabsTrigger 
                    value="latest" 
                    className="data-[state=active]:bg-white data-[state=active]:text-[#6B2F1A]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Latest
                  </TabsTrigger>
                  <TabsTrigger 
                    value="price_low" 
                    className="data-[state=active]:bg-white data-[state=active]:text-[#6B2F1A]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Price: Low to High
                  </TabsTrigger>
                  <TabsTrigger 
                    value="price_high" 
                    className="data-[state=active]:bg-white data-[state=active]:text-[#6B2F1A]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Price: High to Low
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-[#6B2F1A] mb-4" />
              <p className="text-gray-500 animate-pulse" style={{ fontFamily: "Poppins, sans-serif" }}>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-[#F9F4F0] rounded-xl p-12 text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PanelTop className="h-8 w-8 text-[#6B2F1A]/50" />
              </div>
              <h3 className="text-xl font-medium text-[#6B2F1A] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>No Products Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
                We couldn't find any products in this subcategory. Please try another subcategory or check back later.
              </p>
              <Button 
                onClick={() => handleSubcategoryChange("all")}
                className="bg-[#6B2F1A] hover:bg-[#5A2814] text-white"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                View All Products
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              layout === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  layout={layout}
                />
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-12 text-center">
              <Button 
                onClick={() => router.push(`/products?category=${categoryId}`)}
                variant="outline"
                className="border-[#6B2F1A]/20 text-[#6B2F1A] hover:bg-[#fee3d8]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                View All {category?.catName || "Products"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;