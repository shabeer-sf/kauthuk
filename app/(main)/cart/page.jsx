"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/providers/CartProvider';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  CreditCard, 
  Lock, 
  Info,
  DollarSign,
  IndianRupee,
  Shield,
  Truck,
  ShoppingCart,
  ChevronLeft,
  Layers,
  AlertCircle
} from 'lucide-react';

const ProductCart = () => {
  const { 
    cart, 
    itemCount,
    totals, 
    currency, 
    formatPrice, 
    toggleCurrency, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  
  // Calculate subtotal
  const subtotal = totals[currency];
  
  // Calculate tax (assumed 10%)
  const taxRate = 0.10;
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-full shadow-sm">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="px-8 py-6 text-lg bg-indigo-600 hover:bg-indigo-700">
                <ChevronLeft className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Review and modify your items before checkout</p>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                onClick={toggleCurrency}
              >
                {currency === 'INR' ? (
                  <><IndianRupee className="h-4 w-4 mr-1" /> INR</>
                ) : (
                  <><DollarSign className="h-4 w-4 mr-1" /> USD</>
                )}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear your shopping cart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from your cart. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative group">
                      {item.image ? (
                        <div className="relative w-40 h-40">
                          <Image
                            src={`https://greenglow.in/kauthuk_test/${item.image}`}
                            alt={item.title}
                            fill
                            className="rounded-xl object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        
                        {/* Show variant info if available */}
                        {item.variant && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                              <Layers className="h-3 w-3" />
                              Variant
                            </Badge>
                            {item.variant.attributes && item.variant.attributes.map((attr, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-50">
                                {attr.name}: {attr.value}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* SKU if available */}
                        {item.variant?.sku && (
                          <p className="text-gray-500 text-xs mt-1">
                            SKU: {item.variant.sku}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white rounded-md transition-colors"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white rounded-md transition-colors"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            disabled={item.maxStock && item.quantity >= item.maxStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => removeFromCart(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                      
                      {item.maxStock && item.quantity >= item.maxStock && (
                        <div className="flex items-start gap-1 text-amber-600 text-xs">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>Maximum available quantity reached</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-semibold">
                        {currency === 'INR' ? (
                          <>{formatPrice(item.price * item.quantity)}</>
                        ) : (
                          <>{formatPrice(item.priceDollars * item.quantity)}</>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {currency === 'INR' ? (
                          <>{formatPrice(item.price)} each</>
                        ) : (
                          <>{formatPrice(item.priceDollars)} each</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Continue Shopping Button */}
            <div className="flex justify-start">
              <Link href="/products">
                <Button variant="outline" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
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
                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center text-gray-600">
                          Tax
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>10% tax applied to the subtotal</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Shipping & Payment info */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-sm py-2">Shipping Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm space-y-2 text-gray-600">
                        <p className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-indigo-600" />
                          Free standard shipping (5-7 business days)
                        </p>
                        <p className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-indigo-600" />
                          All items are securely packed and insured
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="payment">
                    <AccordionTrigger className="text-sm py-2">Payment Methods</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm space-y-2 text-gray-600">
                        <p className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-indigo-600" />
                          Credit/Debit Cards
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-indigo-600" />
                          UPI/Net Banking
                        </p>
                        {cart.some(item => item.codAvailable) && (
                          <p className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-indigo-600" />
                            Cash on Delivery
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-700 flex items-start gap-2">
                  <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Your transaction is secured with 256-bit SSL encryption
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full h-12 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Link href="/checkout" className="flex items-center gap-2 w-full justify-center">
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5" />
                  </Link>
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