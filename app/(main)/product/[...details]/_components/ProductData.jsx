"use client";

import { useCart } from "@/providers/CartProvider";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Heart,
  IndianRupee,
  Info,
  Instagram,
  Layers,
  Linkedin,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  Shield,
  ShoppingCart,
  Sparkles,
  Truck,
  Twitter
} from "lucide-react";

// Server Actions
import { getOneProduct, getProducts } from "@/actions/product";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

// Swiper components for related products
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [productImages, setProductImages] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
  // Refs for navigation buttons
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const params = useParams();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.details || !params.details[0]) {
          setLoading(false);
          return;
        }

        const productData = await getOneProduct(params.details[0]);

        if (!productData) {
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Set up initial images array
        let images = productData.ProductImages || [];
        setProductImages(images);

        // If has variants, select default variant
        if (
          productData.hasVariants &&
          productData.ProductVariants &&
          productData.ProductVariants.length > 0
        ) {
          // Find default variant or use first one
          const defaultVariant =
            productData.ProductVariants.find((v) => v.is_default) ||
            productData.ProductVariants[0];

          setSelectedVariantId(defaultVariant.id);
          setSelectedVariant(defaultVariant);

          // Initialize selected attributes based on default variant
          const initialAttributes = {};
          if (defaultVariant.VariantAttributeValues) {
            defaultVariant.VariantAttributeValues.forEach((vav) => {
              if (vav.AttributeValue && vav.AttributeValue.Attribute) {
                const attribute = vav.AttributeValue.Attribute;
                initialAttributes[attribute.id] = vav.attribute_value_id;
              }
            });
          }
          setSelectedAttributes(initialAttributes);

          // Update images if variant has its own images
          if (
            defaultVariant.ProductImages &&
            defaultVariant.ProductImages.length > 0
          ) {
            setProductImages([...defaultVariant.ProductImages, ...images]);
          }
        }
        
        // Fetch related products if subcategory exists
        if (productData.SubCategory?.id) {
          fetchRelatedProducts(productData.SubCategory.id, productData.id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.details]);

  // Fetch related products
  const fetchRelatedProducts = async (subcategoryId, productId) => {
    try {
      setLoadingRelated(true);
      // Using the same getProducts server action that's already imported
      const response = await getProducts({
        subcategory: subcategoryId,
        exclude: productId, // Assuming your getProducts action can handle an "exclude" parameter
        limit: 10,
        sort: "random" // This would help get varied related products
      });
      
      if (response && response.products) {
        // Filter out the current product if necessary
        const filteredProducts = response.products.filter(p => p.id !== parseInt(productId));
        setRelatedProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      // Don't show an error toast since this is a non-critical feature
    } finally {
      setLoadingRelated(false);
    }
  };

  // Update variant when attributes change
  useEffect(() => {
    if (!product || !product.hasVariants || !product.ProductVariants) return;

    // This function finds a variant based on selected attributes
    const findMatchingVariant = () => {
      const attrEntries = Object.entries(selectedAttributes);
      if (attrEntries.length === 0) return null;

      const matchingVariant = product.ProductVariants.find((variant) => {
        // Check if variant has VariantAttributeValues
        if (!variant.VariantAttributeValues) return false;

        // Check if all selected attributes match this variant
        return attrEntries.every(([attrId, valueId]) => {
          return variant.VariantAttributeValues.some(
            (vav) =>
              vav.AttributeValue &&
              vav.AttributeValue.Attribute &&
              vav.AttributeValue.Attribute.id.toString() === attrId &&
              vav.attribute_value_id.toString() === valueId
          );
        });
      });

      return matchingVariant;
    };

    const matchingVariant = findMatchingVariant();
    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
      setSelectedVariant(matchingVariant);

      // Update images if variant has its own
      if (
        matchingVariant.ProductImages &&
        matchingVariant.ProductImages.length > 0
      ) {
        setProductImages([
          ...matchingVariant.ProductImages,
          ...(product.ProductImages || []),
        ]);
      } else {
        setProductImages([...(product.ProductImages || [])]);
      }

      // Reset current image index
      setCurrentImageIndex(0);
    }
  }, [selectedAttributes, product]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAttributeChange = (attributeId, valueId) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  const handleAddToCart = () => {
    // Validate if all required attributes are selected for variants
    if (product.hasVariants) {
      if (!selectedVariant) {
        toast.error("Please select all required options");
        return;
      }
    }

    // Check stock
    const currentStock = selectedVariant
      ? selectedVariant.stock_count
      : product.stock_count;
    const currentStockStatus = selectedVariant
      ? selectedVariant.stock_status
      : product.stock_status;

    if (currentStockStatus === "no" || currentStock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    // Prepare cart item data
    const cartItem = {
      id: product.id,
      title: product.title,
      price: selectedVariant
        ? selectedVariant.price_rupees
        : product.price_rupees,
      priceDollars: selectedVariant
        ? selectedVariant.price_dollars
        : product.price_dollars,
      image: productImages.length > 0 ? productImages[0].image_path : null,
      quantity: quantity,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            sku: selectedVariant.sku,
            attributes: selectedVariant.VariantAttributeValues
              ? selectedVariant.VariantAttributeValues.filter(
                  (vav) => vav.AttributeValue && vav.AttributeValue.Attribute
                ).map((vav) => ({
                  name: vav.AttributeValue.Attribute.display_name,
                  value: vav.AttributeValue.display_value,
                }))
              : [],
          }
        : null,
    };

    addToCart(cartItem);
    toast.success("Added to cart successfully");
  };

  const currentPrice = selectedVariant
    ? selectedVariant.price_rupees
    : product?.price_rupees || 0;
  const currentPriceDollars = selectedVariant
    ? selectedVariant.price_dollars
    : product?.price_dollars || 0;
  const currentStock = selectedVariant
    ? selectedVariant.stock_count
    : product?.stock_count || 0;
  const currentStockStatus = selectedVariant
    ? selectedVariant.stock_status
    : product?.stock_status || "no";

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Generate full URL for sharing
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${pathname}` : "";

  // Share functions
  const handleShareClick = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    const title = product?.title || "";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToLinkedin = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const handleShare = (platform) => {
    const title = product?.title || "";
    const url = fullUrl;

    let shareUrl;
    switch (platform) {
      case "facebook":
        shareToFacebook();
        break;
      case "twitter":
        shareToTwitter();
        break;
      case "linkedin":
        shareToLinkedin();
        break;
      case "instagram":
        // Instagram doesn't have a direct share URL, but we can copy the link
        copyLink();
        break;
      default:
        // Use Web Share API if available
        if (typeof navigator !== "undefined" && navigator.share) {
          navigator
            .share({
              title: title,
              url: url,
            })
            .catch((err) => console.error("Error sharing:", err));
          return;
        }
        // Fallback: copy to clipboard
        copyLink();
        return;
    }
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Product not found
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb className="text-xs text-gray-500">
            <BreadcrumbList className="text-xs font-poppins">
              {product.SubCategory?.Category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/category/${product.SubCategory.Category.id}`}
                      className="text-[#6B2F1A]/70 hover:text-[#6B2F1A]"
                    >
                      {product.SubCategory.Category.catName}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                </>
              )}
              {product.SubCategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/subcategory/${product.SubCategory.id}`}
                      className="text-[#6B2F1A]/70 hover:text-[#6B2F1A]"
                    >
                      {product.SubCategory.subcategory}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbLink className="text-[#6B2F1A] font-medium">
                  {product.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Product layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product image gallery section */}
          <div className="space-y-4">
            {/* Main image with zoom */}
            <div className="relative aspect-square overflow-hidden rounded-lg border border-[#6B2F1A]/10 bg-white shadow-sm">
              <div
                className="w-full h-full relative cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {productImages.length > 0 ? (
                  <>
                    <Image
                      src={`https://greenglow.in/kauthuk_test/${productImages[currentImageIndex].image_path}`}
                      fill
                      alt={product.title}
                      className={`object-cover transition-transform duration-200 ${
                        isZoomed ? "scale-150" : "scale-100"
                      }`}
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                      priority
                    />
                    {isZoomed && (
                      <div className="absolute inset-0 bg-black bg-opacity-5"></div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <p>No image available</p>
                  </div>
                )}
              </div>

              {/* Image navigation controls for mobile */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1 lg:hidden">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-2.5 h-2.5 rounded-full p-0 ${
                        currentImageIndex === index
                          ? "bg-[#6B2F1A]"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => handleImageChange(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {productImages.length > 1 && (
              <div className="hidden lg:grid grid-cols-6 gap-2">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-[#6B2F1A] shadow-sm"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => handleImageChange(index)}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={`https://greenglow.in/kauthuk_test/${image.image_path}`}
                        fill
                        alt={`Product image ${index + 1}`}
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product details section */}
          <div className="space-y-6" id="product-options">
            {/* Title and badges */}
            <div>
              <div className="flex justify-between items-start">
                <h1 className="playfair-italic text-3xl font-bold text-[#6B2F1A]">
                  {product.title}
                </h1>

                <div className="flex space-x-2 relative">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B2F1A] hover:bg-[#fee3d8] transition-colors"
                          onClick={handleShareClick}
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="font-poppins">Share Product</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Share menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg z-50 w-48 border border-gray-100 overflow-hidden"
                      >
                        <div className="p-2">
                          <div className="px-2 py-1 text-xs font-medium text-gray-500 font-poppins">
                            Share this product
                          </div>
                          
                          <button 
                            onClick={shareToFacebook}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            <Facebook size={15} className="mr-2 text-blue-600" />
                            Facebook
                          </button>
                          
                          <button 
                            onClick={shareToTwitter}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            <Twitter size={15} className="mr-2 text-blue-400" />
                            Twitter
                          </button>
                          
                          <button 
                            onClick={shareToLinkedin}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            <Linkedin size={15} className="mr-2 text-blue-700" />
                            LinkedIn
                          </button>
                          
                          <button 
                            onClick={copyLink}
                            className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-[#fee3d8] rounded-md font-poppins"
                          >
                            {copied ? (
                              <Check size={15} className="mr-2 text-green-500" />
                            ) : (
                              <Copy size={15} className="mr-2 text-gray-500" />
                            )}
                            {copied ? "Copied!" : "Copy Link"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                  className={product.status === "active" ? "bg-[#6B2F1A] hover:bg-[#5A2814] font-poppins" : "font-poppins"}
                >
                  {product.status === "active" ? "Active" : "Inactive"}
                </Badge>

                {product.hasVariants && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 border-[#6B2F1A]/30 text-[#6B2F1A] font-poppins"
                  >
                    <Layers className="h-3 w-3" />
                    <span>Multiple Variants</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Price section */}
            <div className="flex flex-col">
              <div className="flex items-end gap-2">
                <div className="flex items-center">
                  <IndianRupee className="h-6 w-6 text-[#6B2F1A]" />
                  <span className="playfair-italic text-3xl font-bold text-[#6B2F1A]">
                    {formatPrice(currentPrice)}
                  </span>
                </div>
              </div>

              {/* Stock status */}
              <div className="mt-2 flex items-center font-poppins">
                {currentStockStatus === "yes" && currentStock > 0 ? (
                  <>
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-green-700 font-medium">
                      In Stock{" "}
                      {currentStock > 0 && `(${currentStock} available)`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="text-red-700 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Product highlights - Quick overview */}
            {product.highlights && (
              <div className="bg-[#FFF5F1] rounded-lg p-4 mt-2">
                <h3 className="font-playfair text-sm font-medium text-[#6B2F1A] mb-2">
                  Product Highlights
                </h3>
                <div 
                  className="font-poppins text-sm text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: product.highlights.length > 300 
                      ? `${product.highlights.slice(0, 300)}... <a href="#product-details" class="text-[#6B2F1A] font-medium">Read more</a>` 
                      : product.highlights
                  }}
                />
              </div>
            )}

            {/* Social sharing buttons */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-500 font-poppins">
                Share:
              </span>
              <button
                type="button"
                className="rounded-full h-8 w-8 flex items-center justify-center p-0 border border-[#6B2F1A]/20 text-blue-600 hover:bg-[#fee3d8] hover:text-[#6B2F1A] hover:border-[#6B2F1A]/30 transition-colors"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full h-8 w-8 flex items-center justify-center p-0 border border-[#6B2F1A]/20 text-blue-400 hover:bg-[#fee3d8] hover:text-[#6B2F1A] hover:border-[#6B2F1A]/30 transition-colors"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full h-8 w-8 flex items-center justify-center p-0 border border-[#6B2F1A]/20 text-pink-600 hover:bg-[#fee3d8] hover:text-[#6B2F1A] hover:border-[#6B2F1A]/30 transition-colors"
                onClick={() => handleShare()}
              >
                <Instagram className="h-4 w-4" />
              </button>
            </div>

            <Separator className="bg-[#6B2F1A]/10" />

            {/* Variant selection */}
            {product.hasVariants && product.ProductAttributes && (
              <div className="space-y-4">
                <h3 className="font-playfair text-lg font-semibold text-[#6B2F1A]">
                  Choose Options
                </h3>

                {product.ProductAttributes.filter(
                  (attr) => attr.Attribute && attr.Attribute.is_variant
                ).map((attr) => (
                  <div key={attr.id} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-700 font-poppins">
                        {attr.Attribute.display_name}
                        {attr.is_required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      {attr.Attribute.affects_price && (
                        <span className="text-xs text-[#6B2F1A] font-poppins">
                          Price may vary
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {attr.ProductAttributeValues &&
                        attr.ProductAttributeValues.map((attrValue) => {
                          if (!attrValue.AttributeValue) return null;

                          const isSelected =
                            selectedAttributes[attr.attribute_id] ===
                            attrValue.attribute_value_id.toString();

                          // For color attributes
                          if (attr.Attribute.type === "color") {
                            const colorCode =
                              attrValue.AttributeValue.color_code || "#ccc";
                            return (
                              <TooltipProvider key={attrValue.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className={`w-8 h-8 rounded-full transition-all ${
                                        isSelected
                                          ? "ring-2 ring-offset-2 ring-[#6B2F1A]"
                                          : "ring-1 ring-gray-200"
                                      }`}
                                      style={{ backgroundColor: colorCode }}
                                      onClick={() =>
                                        handleAttributeChange(
                                          attr.attribute_id.toString(),
                                          attrValue.attribute_value_id.toString()
                                        )
                                      }
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="font-poppins">
                                    {attrValue.AttributeValue.display_value}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }

                          // For size attributes
                         // For size attributes
                         if (attr.Attribute.type === "size") {
                          return (
                            <button
                              key={attrValue.id}
                              type="button"
                              className={`min-w-[3rem] h-9 px-3 rounded-md font-poppins transition-all ${
                                isSelected
                                  ? "bg-[#6B2F1A] text-white hover:bg-[#5A2814]"
                                  : "border border-[#6B2F1A]/20 hover:bg-[#fee3d8] hover:text-[#6B2F1A] hover:border-[#6B2F1A]/30"
                              }`}
                              onClick={() =>
                                handleAttributeChange(
                                  attr.attribute_id.toString(),
                                  attrValue.attribute_value_id.toString()
                                )
                              }
                            >
                              {attrValue.AttributeValue.display_value}
                            </button>
                          );
                        }

                        // For other attributes
                        return (
                          <button
                            key={attrValue.id}
                            type="button"
                            className={`px-3 h-9 rounded-md font-poppins transition-all ${
                              isSelected
                                ? "bg-[#6B2F1A] text-white hover:bg-[#5A2814]"
                                : "border border-[#6B2F1A]/20 hover:bg-[#fee3d8] hover:text-[#6B2F1A] hover:border-[#6B2F1A]/30"
                            }`}
                            onClick={() =>
                              handleAttributeChange(
                                attr.attribute_id.toString(),
                                attrValue.attribute_value_id.toString()
                              )
                            }
                          >
                            {attrValue.AttributeValue.display_value}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Non-variant attributes (regular options) */}
          {product.ProductAttributes &&
            product.ProductAttributes.filter(
              (attr) => attr.Attribute && !attr.Attribute.is_variant
            ).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-playfair text-lg font-semibold text-[#6B2F1A]">
                  Product Options
                </h3>

                {product.ProductAttributes.filter(
                  (attr) => attr.Attribute && !attr.Attribute.is_variant
                ).map((attr) => (
                  <div key={attr.id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 font-poppins">
                      {attr.Attribute.display_name}
                      {attr.is_required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    <Select>
                      <SelectTrigger className="w-full border-[#6B2F1A]/20 focus:ring-[#6B2F1A] font-poppins">
                        <SelectValue
                          placeholder={`Select ${attr.Attribute.display_name}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {attr.ProductAttributeValues &&
                          attr.ProductAttributeValues.map(
                            (attrValue) =>
                              attrValue.AttributeValue && (
                                <SelectItem
                                  key={attrValue.id}
                                  value={attrValue.attribute_value_id.toString()}
                                  className="font-poppins"
                                >
                                  {attrValue.AttributeValue.display_value}
                                  {attrValue.price_adjustment_rupees &&
                                    ` (+₹${attrValue.price_adjustment_rupees})`}
                                </SelectItem>
                              )
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

          {/* Quantity selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-poppins">
              Quantity
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-l-md flex items-center justify-center border border-[#6B2F1A]/20 border-r-0 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fee3d8] transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="h-10 w-12 flex items-center justify-center border-y border-[#6B2F1A]/20">
                <span className="text-gray-900 font-medium font-poppins">
                  {quantity}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(product.quantity_limit || 10, q + 1)
                  )
                }
                disabled={
                  quantity >= (product.quantity_limit || 10) ||
                  quantity >= currentStock
                }
                className="h-10 w-10 rounded-r-md flex items-center justify-center border border-[#6B2F1A]/20 border-l-0 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fee3d8] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>

              {product.quantity_limit && (
                <div className="ml-3 text-xs text-gray-500 flex items-center font-poppins">
                  <Info className="h-3 w-3 mr-1" />
                  Limit: {product.quantity_limit} per order
                </div>
              )}
            </div>
          </div>

          {/* Add to cart button */}
          <div className="flex flex-col gap-4 sm:flex-row pt-2">
            <button
              onClick={handleAddToCart}
              type="button"
              disabled={currentStockStatus === "no" || currentStock <= 0}
              className="flex-1 h-12 bg-[#6B2F1A] hover:bg-[#5A2814] text-white rounded-md flex items-center justify-center font-poppins disabled:bg-[#6B2F1A]/50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </button>
            
            <button
              type="button"
              className="h-12 w-12 rounded-md flex items-center justify-center border border-[#6B2F1A]/20 text-[#6B2F1A] hover:bg-[#fee3d8] hover:border-[#6B2F1A]/30 transition-colors"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Shipping and benefits cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-[#FFF5F1] p-3 rounded-lg flex items-center">
              <Truck className="h-5 w-5 text-[#6B2F1A] mr-3 flex-shrink-0" />
              <div>
                <p className="font-playfair text-sm font-medium text-gray-900">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-600 font-poppins">
                  On orders over ₹999
                </p>
              </div>
            </div>
            
            <div className="bg-[#FFF5F1] p-3 rounded-lg flex items-center">
              <PackageCheck className="h-5 w-5 text-[#6B2F1A] mr-3 flex-shrink-0" />
              <div>
                <p className="font-playfair text-sm font-medium text-gray-900">
                  High Quality
                </p>
                <p className="text-xs text-gray-600 font-poppins">
                  Handcrafted with care
                </p>
              </div>
            </div>
            
            <div className="bg-[#FFF5F1] p-3 rounded-lg flex items-center">
              <BadgeCheck className="h-5 w-5 text-[#6B2F1A] mr-3 flex-shrink-0" />
              <div>
                <p className="font-playfair text-sm font-medium text-gray-900">
                  Secure Payment
                </p>
                <p className="text-xs text-gray-600 font-poppins">
                  100% secure checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed product information tabs - ID for anchor link */}
      <div className="mt-12" id="product-details">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 mb-6">
            <TabsTrigger
              value="description"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#6B2F1A] data-[state=active]:shadow-none py-3 data-[state=active]:text-[#6B2F1A] font-poppins"
            >
              Description
            </TabsTrigger>

            {product.highlights && (
              <TabsTrigger
                value="highlights"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#6B2F1A] data-[state=active]:shadow-none py-3 data-[state=active]:text-[#6B2F1A] font-poppins"
              >
                Highlights
              </TabsTrigger>
            )}

            {product.terms_condition && (
              <TabsTrigger
                value="terms"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#6B2F1A] data-[state=active]:shadow-none py-3 data-[state=active]:text-[#6B2F1A] font-poppins"
              >
                Terms & Conditions
              </TabsTrigger>
            )}

            {product.hasVariants &&
              product.ProductVariants &&
              product.ProductVariants.length > 0 && (
                <TabsTrigger
                  value="variants"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#6B2F1A] data-[state=active]:shadow-none py-3 data-[state=active]:text-[#6B2F1A] font-poppins"
                >
                  Variants
                </TabsTrigger>
              )}
          </TabsList>

          <TabsContent value="description" className="mt-0">
            <Card className="border-[#6B2F1A]/10 shadow-sm">
              <CardContent className="p-6">
                <div className="prose max-w-none font-poppins">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.description || "",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {product.highlights && (
            <TabsContent value="highlights" className="mt-0">
              <Card className="border-[#6B2F1A]/10 shadow-sm">
                <CardContent className="p-6">
                  <div className="prose max-w-none font-poppins">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.highlights || "",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {product.terms_condition && (
            <TabsContent value="terms" className="mt-0">
              <Card className="border-[#6B2F1A]/10 shadow-sm">
                <CardContent className="p-6">
                  <div className="prose max-w-none font-poppins">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.terms_condition || "",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {product.hasVariants &&
            product.ProductVariants &&
            product.ProductVariants.length > 0 && (
              <TabsContent value="variants" className="mt-0">
                <Card className="border-[#6B2F1A]/10 shadow-sm">
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] border-collapse font-poppins">
                        <thead>
                          <tr className="border-b border-[#6B2F1A]/10">
                            <th className="text-left p-2 font-medium text-[#6B2F1A]">
                              SKU
                            </th>
                            {product.ProductAttributes &&
                              product.ProductAttributes.filter(
                                (attr) =>
                                  attr.Attribute && attr.Attribute.is_variant
                              ).map((attr) => (
                                <th
                                  key={attr.id}
                                  className="text-left p-2 font-medium text-[#6B2F1A]"
                                >
                                  {attr.Attribute.display_name}
                                </th>
                              ))}
                            <th className="text-left p-2 font-medium text-[#6B2F1A]">
                              Price (₹)
                            </th>
                            <th className="text-left p-2 font-medium text-[#6B2F1A]">
                              Stock
                            </th>
                            <th className="text-left p-2 font-medium text-[#6B2F1A]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.ProductVariants.map((variant) => (
                            <tr
                              key={variant.id}
                              className="border-b border-[#6B2F1A]/10 hover:bg-[#fee3d8]/20 transition-colors"
                            >
                              <td className="p-2">
                                <div className="font-medium">
                                  {variant.sku}
                                </div>
                                {variant.is_default && (
                                  <Badge 
                                    variant="outline" 
                                    className="mt-1 border-[#6B2F1A]/20 text-[#6B2F1A] font-poppins"
                                  >
                                    Default
                                  </Badge>
                                )}
                              </td>

                              {product.ProductAttributes &&
                                product.ProductAttributes.filter(
                                  (attr) =>
                                    attr.Attribute &&
                                    attr.Attribute.is_variant
                                ).map((attr) => {
                                  const attrValue =
                                    variant.VariantAttributeValues &&
                                    variant.VariantAttributeValues.find(
                                      (vav) =>
                                        vav.AttributeValue &&
                                        vav.AttributeValue.Attribute &&
                                        vav.AttributeValue.Attribute.id ===
                                          attr.attribute_id
                                    );

                                  return (
                                    <td key={attr.id} className="p-2">
                                      {attrValue && attrValue.AttributeValue
                                        ? attrValue.AttributeValue
                                            .display_value
                                        : "-"}
                                    </td>
                                  );
                                })}

                              <td className="p-2">
                                <div className="font-medium">
                                  ₹{formatPrice(variant.price_rupees)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ${formatPrice(variant.price_dollars)}
                                </div>
                              </td>

                              <td className="p-2">
                                {variant.stock_status === "yes" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-[#fee3d8] text-[#6B2F1A] border-[#6B2F1A]/20 font-poppins"
                                  >
                                    In Stock ({variant.stock_count})
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700 border-red-200 font-poppins"
                                  >
                                    Out of Stock
                                  </Badge>
                                )}
                              </td>

                              <td className="p-2">
                                <button
                                  type="button"
                                  disabled={
                                    variant.stock_status === "no" ||
                                    variant.stock_count <= 0
                                  }
                                  className="px-3 py-1 rounded-md border border-[#6B2F1A]/20 text-[#6B2F1A] hover:bg-[#fee3d8] hover:text-[#6B2F1A] hover:border-[#6B2F1A]/30 font-poppins text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  onClick={() => {
                                    // Find the attribute IDs and values for this variant
                                    const attributeSelections = {};
                                    if (variant.VariantAttributeValues) {
                                      variant.VariantAttributeValues.forEach(
                                        (vav) => {
                                          if (
                                            vav.AttributeValue &&
                                            vav.AttributeValue.Attribute
                                          ) {
                                            attributeSelections[
                                              vav.AttributeValue.Attribute.id
                                            ] =
                                              vav.attribute_value_id.toString();
                                          }
                                        }
                                      );
                                    }

                                    // Set these as selected attributes
                                    setSelectedAttributes(
                                      attributeSelections
                                    );

                                    // Scroll to the top of the product section
                                    if (typeof window !== "undefined") {
                                      window.scrollTo({
                                        top:
                                          document.getElementById(
                                            "product-options"
                                          )?.offsetTop || 0,
                                        behavior: "smooth",
                                      });
                                    }
                                  }}
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
        </Tabs>
      </div>

      {/* Extra product information accordions (for mobile-friendly view) */}
      <div className="mt-12 lg:hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-[#6B2F1A]/10">
            <AccordionTrigger className="text-[#6B2F1A] hover:text-[#5A2814] font-playfair">
              Description
            </AccordionTrigger>
            <AccordionContent className="font-poppins">
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.description || "",
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {product.highlights && (
            <AccordionItem value="highlights" className="border-[#6B2F1A]/10">
              <AccordionTrigger className="text-[#6B2F1A] hover:text-[#5A2814] font-playfair">
                Highlights
              </AccordionTrigger>
              <AccordionContent className="font-poppins">
                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.highlights || "",
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {product.terms_condition && (
            <AccordionItem value="terms" className="border-[#6B2F1A]/10">
              <AccordionTrigger className="text-[#6B2F1A] hover:text-[#5A2814] font-playfair">
                Terms & Conditions
              </AccordionTrigger>
              <AccordionContent className="font-poppins">
                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.terms_condition || "",
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>

    {/* Related Products Slider */}
    {(relatedProducts.length > 0 || loadingRelated) && (
      <div className="py-16 bg-[#FFFBF9]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="playfair-italic text-2xl md:text-3xl font-bold text-[#6B2F1A] mb-2">
                You May Also Like
              </h2>
              <div className="w-24 h-1 bg-[#6B2F1A]/30"></div>
            </div>
          </div>
          
          <div className="relative">
            {/* Navigation buttons */}
            <button 
              ref={prevRef}
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#6B2F1A] hover:bg-[#fee3d8] transition-colors transform -translate-x-5"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
              ref={nextRef}
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#6B2F1A] hover:bg-[#fee3d8] transition-colors transform translate-x-5"
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {loadingRelated ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse h-72"></div>
                ))}
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  768: { slidesPerView: 3, spaceBetween: 24 },
                  1024: { slidesPerView: 4, spaceBetween: 30 },
                }}
                onInit={(swiper) => {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }}
                className="pb-12"
              >
                {relatedProducts.map((relatedProduct) => (
                  <SwiperSlide key={relatedProduct.id}>
                    <ProductCard product={relatedProduct} layout="grid" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Trust badges */}
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center p-6 bg-[#FFF5F1] rounded-lg">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <Shield className="h-7 w-7 text-[#6B2F1A]" />
            </div>
            <h3 className="font-playfair text-lg font-medium text-[#6B2F1A] mb-2">
              Secure Payment
            </h3>
            <p className="text-sm text-gray-600 font-poppins">
              All transactions are secure and encrypted for your safety
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-[#FFF5F1] rounded-lg">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <Truck className="h-7 w-7 text-[#6B2F1A]" />
            </div>
            <h3 className="font-playfair text-lg font-medium text-[#6B2F1A] mb-2">
              Fast Shipping
            </h3>
            <p className="text-sm text-gray-600 font-poppins">
              {product.free_shipping === "yes"
                ? "Free shipping on orders over ₹999"
                : "Quick delivery to your doorstep"}
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-[#FFF5F1] rounded-lg">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <Sparkles className="h-7 w-7 text-[#6B2F1A]" />
            </div>
            <h3 className="font-playfair text-lg font-medium text-[#6B2F1A] mb-2">
              Quality Guaranteed
            </h3>
            <p className="text-sm text-gray-600 font-poppins">
              Handcrafted items made with attention to detail and quality
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

// Loading skeleton for the product details page
const ProductDetailsSkeleton = () => {
return (
  <div className="container mx-auto px-4 py-8">
    <div className="mb-6">
      <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image skeleton */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-6 gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Details skeleton */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div>
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </div>

        <Separator />

        <div className="space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-1/4" />
          <div className="flex">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
    </div>

    <div className="mt-12">
    <div className="flex gap-4 border-b mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        <Skeleton className="h-40 w-full" />
      </div>
      
      {/* Related products skeleton */}
      <div className="mt-16 py-12 bg-[#FFFBF9]">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-white shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;