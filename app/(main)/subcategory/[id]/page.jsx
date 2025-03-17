"use client";

import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Box,
    Grid3x3,
    Loader2,
    PanelTop,
    Rows3,
    Tag
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// UI Components
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";

// Import server actions 
import { getSubcategories } from "@/actions/category";
import { getProducts } from "@/actions/product";

// Import ProductCard from your existing component
import ProductCard from "@/components/ProductCard";

const SubcategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const subcategoryId = params?.id;

  // State variables
  const [subcategory, setSubcategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [sortOption, setSortOption] = useState("latest");
  const [productCount, setProductCount] = useState(0);
  const [relatedSubcategories, setRelatedSubcategories] = useState([]);

  // Fetch subcategory and initial products on component mount
  useEffect(() => {
    if (!subcategoryId) {
      setError("Subcategory ID is required");
      setLoading(false);
      return;
    }

    const fetchSubcategoryData = async () => {
      try {
        setLoading(true);

        // Fetch products for this subcategory
        const productsResponse = await getProducts({
          subcategory: subcategoryId,
          limit: 20,
          sort: sortOption
        });

        if (productsResponse && productsResponse.products) {
          setProducts(productsResponse.products);
          setProductCount(productsResponse.products.length);
          
          // Set featured products (first 4 products)
          setFeaturedProducts(productsResponse.products.slice(0, 4));
          
          // Extract subcategory and parent category info from the first product
          if (productsResponse.products.length > 0 && 
              productsResponse.products[0].SubCategory) {
            const firstProduct = productsResponse.products[0];
            setSubcategory(firstProduct.SubCategory);
            
            if (firstProduct.SubCategory.Category) {
              setParentCategory(firstProduct.SubCategory.Category);
              
              // Fetch related subcategories from the same parent category
              const subcategoriesResponse = await getSubcategories(firstProduct.SubCategory.Category.id);
              if (subcategoriesResponse.success) {
                // Filter out the current subcategory from related subcategories
                const filtered = subcategoriesResponse.subcategories.filter(
                  sub => sub.id !== parseInt(subcategoryId)
                );
                setRelatedSubcategories(filtered || []);
              }
            }
          } else if (productsResponse.products.length === 0) {
            // If no products, try to fetch subcategory info directly
            // Note: You might need to create a specific API function for this
            // For now, we'll handle the empty state gracefully
            setError("No products found in this subcategory");
          }
        }
      } catch (err) {
        console.error("Error fetching subcategory data:", err);
        setError(err.message || "Failed to load subcategory data");
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategoryData();
  }, [subcategoryId]);

  // Handle sort change
  const handleSortChange = async (option) => {
    try {
      setLoading(true);
      setSortOption(option);
      
      const response = await getProducts({
        subcategory: subcategoryId,
        limit: 20,
        sort: option
      });
      
      if (response && response.products) {
        setProducts(response.products);
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600 animate-pulse text-lg">Loading subcategory...</p>
      </div>
    );
  }

  // Error state
  if (error && !products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="bg-red-50 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Tag className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subcategory Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => router.push("/products")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Browse All Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Subcategory Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-white/80 hover:text-white">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products" className="text-white/80 hover:text-white">
                  Products
                </BreadcrumbLink>
              </BreadcrumbItem>
              {parentCategory && (
                <>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/category/${parentCategory.id}`} className="text-white/80 hover:text-white">
                      {parentCategory.catName}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-white font-medium">
                  {subcategory?.subcategory || "Subcategory"}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{subcategory?.subcategory || "Subcategory"}</h1>
              <p className="text-white/80 max-w-xl">
                Discover our handcrafted {subcategory?.subcategory || "products"} made with eco-friendly materials 
                and traditional techniques by skilled artisans.
              </p>
              <div className="flex items-center mt-4">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                  {productCount} Products
                </Badge>
                {parentCategory && (
                  <>
                    <span className="mx-2 text-white/40">•</span>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                      {parentCategory.catName}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {parentCategory && (
                <Button 
                  onClick={() => router.push(`/category/${parentCategory.id}`)}
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to {parentCategory.catName}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Featured {subcategory?.subcategory || "Products"}
              </h2>
              <Link 
                href={`/products?subcategory=${subcategoryId}&sort=popular`}
                className="text-teal-600 hover:text-teal-800 flex items-center"
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

      {/* Related Subcategories Section */}
      {relatedSubcategories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Subcategories</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedSubcategories.map((sub) => (
                <Card 
                  key={sub.id}
                  className="cursor-pointer transition-all hover:border-teal-200"
                  onClick={() => router.push(`/subcategory/${sub.id}`)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-gray-100 text-gray-600">
                      <Box className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-gray-900 line-clamp-1">{sub.subcategory}</h3>
                    <p className="text-sm text-gray-500 mt-1">{sub._count?.Product || 0} items</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All {subcategory?.subcategory || "Products"}
              </h2>
              <p className="text-gray-500">
                {products.length} products found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <button 
                  type="button"
                  className={`p-2 rounded-md ${layout === 'grid' ? 'bg-teal-100 text-teal-700' : 'bg-white text-gray-600'}`}
                  onClick={() => setLayout('grid')}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button 
                  type="button"
                  className={`p-2 rounded-md ${layout === 'list' ? 'bg-teal-100 text-teal-700' : 'bg-white text-gray-600'}`}
                  onClick={() => setLayout('list')}
                >
                  <Rows3 className="h-5 w-5" />
                </button>
              </div>
              
              <Tabs defaultValue={sortOption} onValueChange={handleSortChange}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="latest" className="data-[state=active]:bg-white">Latest</TabsTrigger>
                  <TabsTrigger value="price_low" className="data-[state=active]:bg-white">Price: Low to High</TabsTrigger>
                  <TabsTrigger value="price_high" className="data-[state=active]:bg-white">Price: High to Low</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
              <p className="text-gray-500 animate-pulse">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PanelTop className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We couldn't find any products in this subcategory. Please try another subcategory or check back later.
              </p>
              {parentCategory && (
                <Button 
                  onClick={() => router.push(`/category/${parentCategory.id}`)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Back to {parentCategory.catName}
                </Button>
              )}
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

          {products.length > 0 && parentCategory && (
            <div className="mt-12 text-center">
              <Button 
                onClick={() => router.push(`/category/${parentCategory.id}`)}
                variant="outline"
                className="border-teal-200 text-teal-600 hover:bg-teal-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {parentCategory.catName}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SubcategoryPage;