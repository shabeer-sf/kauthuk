'use client';

import React, { useState } from 'react';
import { useCart } from '@/providers/CartProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const ProductDetails = () => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Sample product data
  const product = {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    rating: 4.5,
    reviews: 128,
    description: "Experience crystal-clear audio with our premium wireless headphones.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.0",
      "Memory foam cushions"
    ],
    images: [
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg",
      "https://images.pexels.com/photos/335257/pexels-photo-335257.jpeg",
    ],
    colors: ["Black", "Silver", "Blue"],
    stock: 10,
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert("Please select a color");
      return;
    }
    if (quantity > product.stock) {
      alert("Quantity exceeds available stock");
      return;
    }
    addToCart({ ...product, selectedColor, quantity });
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
              className={`w-full h-full object-cover transition-transform ${isZoomed ? 'scale-150' : 'scale-100'}`}
              style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
            />
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold">${product.price}</span>
            <Badge className={product.stock > 0 ? "bg-green-500" : "bg-red-500"}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</Badge>
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Available Colors</h3>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
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
          <div>
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
              <span className="text-lg font-semibold">{quantity}</span>
              <Button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</Button>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleAddToCart} className="flex-1 h-12">
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
