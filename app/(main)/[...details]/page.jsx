'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const ProductDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // Sample product data
  const product = {
    name: "Premium Wireless Headphones",
    price: 299.99,
    rating: 4.5,
    reviews: 128,
    description: "Experience crystal-clear audio with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium memory foam ear cushions for maximum comfort.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.0",
      "Memory foam cushions"
    ],
    images: [
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg",
      "https://images.pexels.com/photos/335257/pexels-photo-335257.jpeg",
      "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg",
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg"
    ],
    colors: ["Black", "Silver", "Blue"],
    inStock: true
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div 
            className="relative w-full aspect-square rounded-lg overflow-hidden border"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={product.images[selectedImage]}
              alt={`Product view ${selectedImage + 1}`}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              }}
            />
          </div>
          
          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold">${product.price}</span>
            {product.inStock ? (
              <Badge className="bg-green-500">In Stock</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Available Colors</h3>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className="rounded-full px-4"
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button className="flex-1 h-12">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button variant="outline" className="h-12">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
