"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { AnimatePresence, motion } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Sparkles,
  Minus,
  Plus,
  ChevronLeft,
  Info,
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  Layers,
  Tag,
  DollarSign,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

// Server Actions
import { getOneProduct } from "@/actions/product";
import { toast } from "sonner";
import RelatedProducts from "@/components/RelatedProducts";

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
  const pathname = usePathname();
  const { addToCart } = useCart();

  const params = useParams();

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
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.details]);

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

  // Helper function to share on social media
  const handleShare = (platform) => {
    const title = product?.title || "";
    const url = fullUrl;

    let shareUrl;
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${title} ${url}`
        )}`;
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
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard");
        }
        return;
    }

    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank", "width=600,height=400");
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
            <BreadcrumbList className="text-xs">
              {product.SubCategory?.Category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/category/${product.SubCategory.Category.id}`}
                    >
                      {product.SubCategory.Category.catName}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              {product.SubCategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/subcategory/${product.SubCategory.id}`}
                    >
                      {product.SubCategory.subcategory}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbLink className="text-gray-700 font-medium">
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
            <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg border border-gray-200">
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
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={`w-2.5 h-2.5 rounded-full p-0 ${
                        currentImageIndex === index
                          ? "bg-indigo-600"
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
                        ? "border-indigo-600"
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
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>

                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          onClick={() => handleShare()}
                        >
                          <Share2 className="h-5 w-5 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share Product</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                >
                  {product.status === "active" ? "Active" : "Inactive"}
                </Badge>

                {product.hasVariants && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>Multiple Variants</span>
                  </Badge>
                )}

                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>
                    SKU: {selectedVariant ? selectedVariant.sku : "N/A"}
                  </span>
                </Badge>
              </div>
            </div>

            {/* Price section */}
            <div className="flex flex-col">
              <div className="flex items-end gap-2">
                <div className="flex items-center">
                  <IndianRupee className="h-6 w-6 text-gray-700" />
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(currentPrice)}
                  </span>
                </div>

                {/* <div className="flex items-center text-gray-500 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-lg">
                    {formatPrice(currentPriceDollars)}
                  </span>
                </div> */}
              </div>

              {/* {product.tax && (
                <p className="text-sm text-gray-500 mt-1">
                  + {product.tax}% tax
                </p>
              )} */}

              {/* Stock status */}
              <div className="mt-2 flex items-center">
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

            {/* Social sharing buttons */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-500">Share:</span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 p-0"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 p-0"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="h-4 w-4 text-blue-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 p-0"
                onClick={() => handleShare()}
              >
                <Instagram className="h-4 w-4 text-pink-600" />
              </Button>
            </div>

            <Separator />

            {/* Variant selection */}
            {product.hasVariants && product.ProductAttributes && (
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Options</h3>

                {product.ProductAttributes.filter(
                  (attr) => attr.Attribute && attr.Attribute.is_variant
                ).map((attr) => (
                  <div key={attr.id} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm text-gray-700">
                        {attr.Attribute.display_name}
                        {attr.is_required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      {attr.Attribute.affects_price && (
                        <span className="text-xs text-indigo-600">
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
                                          ? "ring-2 ring-offset-2 ring-indigo-600"
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
                                  <TooltipContent>
                                    {attrValue.AttributeValue.display_value}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          }

                          // For size attributes
                          if (attr.Attribute.type === "size") {
                            return (
                              <Button
                                key={attrValue.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={`min-w-[3rem] ${
                                  isSelected
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleAttributeChange(
                                    attr.attribute_id.toString(),
                                    attrValue.attribute_value_id.toString()
                                  )
                                }
                              >
                                {attrValue.AttributeValue.display_value}
                              </Button>
                            );
                          }

                          // For other attributes
                          return (
                            <Button
                              key={attrValue.id}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={
                                isSelected
                                  ? "bg-indigo-600 hover:bg-indigo-700"
                                  : ""
                              }
                              onClick={() =>
                                handleAttributeChange(
                                  attr.attribute_id.toString(),
                                  attrValue.attribute_value_id.toString()
                                )
                              }
                            >
                              {attrValue.AttributeValue.display_value}
                            </Button>
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
                  <h3 className="font-semibold">Product Options</h3>

                  {product.ProductAttributes.filter(
                    (attr) => attr.Attribute && !attr.Attribute.is_variant
                  ).map((attr) => (
                    <div key={attr.id} className="space-y-2">
                      <label className="text-sm text-gray-700">
                        {attr.Attribute.display_name}
                        {attr.is_required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      <Select>
                        <SelectTrigger className="w-full">
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
              <label className="text-sm text-gray-700">Quantity</label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-r-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="h-9 px-4 flex items-center justify-center border-y border-gray-200 min-w-[3rem]">
                  <span className="text-gray-900 font-medium">{quantity}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
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
                  className="h-9 w-9 rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {product.quantity_limit && (
                  <div className="ml-3 text-xs text-gray-500 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Limit: {product.quantity_limit} per order
                  </div>
                )}
              </div>
            </div>

            {/* Add to cart button */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={handleAddToCart}
                type="button"
                disabled={currentStockStatus === "no" || currentStock <= 0}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>

            {/* Shipping and returns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start">
                <Truck className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Shipping</p>
                  <p className="text-sm text-gray-500">
                    {product.free_shipping === "yes"
                      ? "Free shipping"
                      : "Standard shipping rates apply"}
                  </p>
                </div>
              </div>

              {/* <div className="flex items-start">
                <RotateCcw className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Returns</p>
                  <p className="text-sm text-gray-500">30-day easy returns</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Detailed product information tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 mb-6">
              <TabsTrigger
                value="description"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none py-3"
              >
                Description
              </TabsTrigger>

              {product.highlights && (
                <TabsTrigger
                  value="highlights"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none py-3"
                >
                  Highlights
                </TabsTrigger>
              )}

              {product.terms_condition && (
                <TabsTrigger
                  value="terms"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none py-3"
                >
                  Terms & Conditions
                </TabsTrigger>
              )}

              {product.hasVariants &&
                product.ProductVariants &&
                product.ProductVariants.length > 0 && (
                  <TabsTrigger
                    value="variants"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none py-3"
                  >
                    Variants
                  </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="description" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
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
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
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
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
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
                  <Card>
                    <CardContent className="p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium text-gray-600">
                                SKU
                              </th>
                              {product.ProductAttributes &&
                                product.ProductAttributes.filter(
                                  (attr) =>
                                    attr.Attribute && attr.Attribute.is_variant
                                ).map((attr) => (
                                  <th
                                    key={attr.id}
                                    className="text-left p-2 font-medium text-gray-600"
                                  >
                                    {attr.Attribute.display_name}
                                  </th>
                                ))}
                              <th className="text-left p-2 font-medium text-gray-600">
                                Price (₹)
                              </th>
                              <th className="text-left p-2 font-medium text-gray-600">
                                Stock
                              </th>
                              <th className="text-left p-2 font-medium text-gray-600"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.ProductVariants.map((variant) => (
                              <tr
                                key={variant.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-2">
                                  <div className="font-medium">
                                    {variant.sku}
                                  </div>
                                  {variant.is_default && (
                                    <Badge variant="outline" className="mt-1">
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
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      In Stock ({variant.stock_count})
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-red-50 text-red-700 border-red-200"
                                    >
                                      Out of Stock
                                    </Badge>
                                  )}
                                </td>

                                <td className="p-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    disabled={
                                      variant.stock_status === "no" ||
                                      variant.stock_count <= 0
                                    }
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
                                  </Button>
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
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
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
              <AccordionItem value="highlights">
                <AccordionTrigger>Highlights</AccordionTrigger>
                <AccordionContent>
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
              <AccordionItem value="terms">
                <AccordionTrigger>Terms & Conditions</AccordionTrigger>
                <AccordionContent>
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

        {/* Trust badges */}
        <div className="mt-12 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-8 border-y border-gray-200">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-indigo-600 mb-2" />
              <h3 className="font-medium">Secure Payment</h3>
              <p className="text-sm text-gray-500">100% secure payment</p>
            </div>

            <div className="flex flex-col items-center">
              <Truck className="h-8 w-8 text-indigo-600 mb-2" />
              <h3 className="font-medium">Fast Shipping</h3>
              <p className="text-sm text-gray-500">
                {product.free_shipping === "yes"
                  ? "Free shipping option"
                  : "Quick delivery"}
              </p>
            </div>

            {/* <div className="flex flex-col items-center">
              <RotateCcw className="h-8 w-8 text-indigo-600 mb-2" />
              <h3 className="font-medium">Easy Returns</h3>
              <p className="text-sm text-gray-500">30-day return policy</p>
            </div> */}

            <div className="flex flex-col items-center">
              <Sparkles className="h-8 w-8 text-indigo-600 mb-2" />
              <h3 className="font-medium">Quality Guaranteed</h3>
              <p className="text-sm text-gray-500">Satisfaction guaranteed</p>
            </div>
          </div>
        </div>
      </div>
      {product.SubCategory && (
        <RelatedProducts
          subcategoryId={product.SubCategory.id}
          productId={product.id}
          limit={10}
        />
      )}
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
    </div>
  );
};

export default ProductDetails;
