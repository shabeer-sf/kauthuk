"use client"
import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const ProductCart = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 199.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg",
      color: "Matte Black",
      brand: "SoundPro"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 299.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg",
      color: "Space Gray",
      brand: "TechWear"
    }
  ]);

  const updateQuantity = (id, increment) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        const newQuantity = product.quantity + increment;
        return {
          ...product,
          quantity: newQuantity > 0 ? newQuantity : 1
        };
      }
      return product;
    }));
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const subtotal = products.reduce((sum, product) => 
    sum + (product.price * product.quantity), 0
  );

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-500">Review and modify your items before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="rounded-xl w-40 h-40 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-2 right-2 bg-white text-black">
                        {product.brand}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                        <p className="text-gray-500 text-sm">{product.color}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white rounded-md transition-colors"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{product.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white rounded-md transition-colors"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => removeProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-semibold">
                        ${(product.price * product.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${product.price} each
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Order date: {currentDate}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({products.length})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>${(subtotal * 0.1).toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${(subtotal + (subtotal * 0.1)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Free shipping on all orders
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full h-12 text-lg font-medium bg-black hover:bg-gray-800">
                  Checkout Now
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Secure checkout powered by RazorPay
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;