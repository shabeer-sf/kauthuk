"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCart } from '@/providers/CartProvider';
import { toast } from 'sonner';

// UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Form handling
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Icons
import {
  AlertCircle,
  ArrowRight,
  BanknoteIcon,
  Building,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  HeartHandshake,
  Info,
  Loader2,
  Lock,
  MapPin,
  Shield,
  ShoppingBag,
  Truck,
  User,
  Wallet
} from "lucide-react";

// Order Schema
const OrderSchema = z.object({
  // Customer information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Billing information
  billingAddress1: z.string().min(5, "Address must be at least 5 characters"),
  billingAddress2: z.string().optional(),
  billingCity: z.string().min(2, "City must be at least 2 characters"),
  billingState: z.string().min(2, "State must be at least 2 characters"),
  billingPostalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  billingCountry: z.string().min(2, "Please select a country"),
  
  // Shipping information
  sameAsBilling: z.boolean().default(true),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().optional(),
  
  // Order details
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["card", "upi", "cod"]),
  notes: z.string().optional(),
  
  // Terms and privacy
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Conditional validation for shipping address based on sameAsBilling
const OrderSchemaWithConditionalValidation = OrderSchema.refine(
  (data) => {
    if (!data.sameAsBilling) {
      return (
        !!data.shippingAddress1 &&
        !!data.shippingCity &&
        !!data.shippingState &&
        !!data.shippingPostalCode &&
        !!data.shippingCountry
      );
    }
    return true;
  },
  {
    message: "Shipping address is required when different from billing",
    path: ["shippingAddress1"],
  }
);

// Server action to create an order (would be in a separate file)
async function createOrder(orderData) {
  try {
    // This would be a fetch call to your API in a real app
    return {
      success: true,
      order: {
        id: "ORD" + Math.floor(100000 + Math.random() * 900000),
        ...orderData,
        createdAt: new Date().toISOString(),
        status: "pending"
      }
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error.message || "Failed to create order"
    };
  }
}

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, totals, currency, formatPrice, itemCount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [order, setOrder] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState("contact");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger
  } = useForm({
    resolver: zodResolver(OrderSchemaWithConditionalValidation),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      billingAddress1: "",
      billingAddress2: "",
      billingCity: "",
      billingState: "",
      billingPostalCode: "",
      billingCountry: "India",
      sameAsBilling: true,
      shippingAddress1: "",
      shippingAddress2: "",
      shippingCity: "",
      shippingState: "",
      shippingPostalCode: "",
      shippingCountry: "India",
      shippingMethod: "standard",
      paymentMethod: "card",
      notes: "",
      termsAccepted: false,
    },
    mode: "onChange"
  });

  // Watch for form values
  const watchSameAsBilling = watch("sameAsBilling");
  const watchShippingMethod = watch("shippingMethod");
  const watchPaymentMethod = watch("paymentMethod");

  // Calculate order summary
  const subtotal = totals[currency];
  
  // Calculate shipping cost based on selected method
  const shippingCost = watchShippingMethod === "express" ? 100 : 0;
  
  // Calculate tax (assumed 10%)
  const taxRate = 0.10;
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax + shippingCost;

  // Check for Razorpay
  useEffect(() => {
    // Check if Razorpay is loaded from the script
    const checkRazorpayLoaded = () => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        setRazorpayLoaded(true);
      }
    };

    // Check immediately in case it's already loaded
    checkRazorpayLoaded();

    // Set up event listener for script load
    const handleScriptLoad = () => checkRazorpayLoaded();
    window.addEventListener('razorpay-loaded', handleScriptLoad);

    return () => {
      window.removeEventListener('razorpay-loaded', handleScriptLoad);
    };
  }, []);

  const initializeRazorpay = async (orderId) => {
    if (!window.Razorpay) {
      toast.error("Payment gateway is not available. Please try again later.");
      setIsProcessing(false);
      return;
    }

    // Convert to lowest currency unit (paise for INR, cents for USD)
    const amountInSmallestUnit = Math.round(total * 100);
    const currencyCode = currency === "INR" ? "INR" : "USD";

    const options = {
      key: "rzp_test_XJHuf2tDhLQjAV", // Replace with your actual Razorpay key
      amount: amountInSmallestUnit,
      currency: currencyCode,
      name: "Kauthuk",
      description: `Order #${orderId}`,
      order_id: orderId, // Would come from your backend in real implementation
      handler: function (response) {
        verifyPayment(response, orderId);
      },
      prefill: {
        name: `${getValues("firstName")} ${getValues("lastName")}`,
        email: getValues("email"),
        contact: getValues("phone"),
      },
      notes: {
        address: getValues("billingAddress1"),
        order_id: orderId,
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          toast.error("Payment cancelled");
        }
      }
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (response, orderId) => {
    setIsProcessing(true);
    
    try {
      // In a real app, you would make a server call to verify the payment
      console.log("Payment verification:", response);
      
      // Simulate a successful verification
      setTimeout(() => {
        setPaymentSuccess(true);
        setIsProcessing(false);
        
        // Clear the cart after successful payment
        clearCart();
      }, 1500);
    } catch (error) {
      toast.error("Payment verification failed. Please contact support.");
      setIsProcessing(false);
    }
  };

  const processOrder = async (data) => {
    setIsProcessing(true);
    
    try {
      // Create the order in your database
      const result = await createOrder({
        ...data,
        items: cart,
        currency,
        subtotal,
        shipping: shippingCost,
        tax,
        total,
      });
      
      if (result.success) {
        setOrder(result.order);
        setOrderCreated(true);
        
        // For COD, mark as success immediately
        if (data.paymentMethod === "cod") {
          setTimeout(() => {
            setPaymentSuccess(true);
            clearCart();
            setIsProcessing(false);
          }, 1500);
        } else {
          // For card/UPI, initialize payment gateway
          await initializeRazorpay(result.order.id);
          // Don't set isProcessing to false here - let the Razorpay flow handle it
        }
      } else {
        toast.error(result.error || "Failed to create order");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("An error occurred while processing your order");
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data) => {
    // If same as billing, copy billing address to shipping
    if (data.sameAsBilling) {
      data.shippingAddress1 = data.billingAddress1;
      data.shippingAddress2 = data.billingAddress2;
      data.shippingCity = data.billingCity;
      data.shippingState = data.billingState;
      data.shippingPostalCode = data.billingPostalCode;
      data.shippingCountry = data.billingCountry;
    }
    
    // Different behavior based on current step
    if (currentStep === "contact") {
      // Validate contact information
      const isContactValid = await trigger(["firstName", "lastName", "email", "phone"]);
      if (isContactValid) {
        setCurrentStep("shipping");
        window.scrollTo(0, 0);
      }
    } else if (currentStep === "shipping") {
      // Validate shipping & billing information
      const fieldsToValidate = [
        "billingAddress1", "billingCity", "billingState", 
        "billingPostalCode", "billingCountry", "shippingMethod"
      ];
      
      if (!watchSameAsBilling) {
        fieldsToValidate.push(
          "shippingAddress1", "shippingCity", "shippingState", 
          "shippingPostalCode", "shippingCountry"
        );
      }
      
      const isShippingValid = await trigger(fieldsToValidate);
      if (isShippingValid) {
        setCurrentStep("payment");
        window.scrollTo(0, 0);
      }
    } else if (currentStep === "payment") {
      // Validate payment information and complete the order
      const isPaymentValid = await trigger(["paymentMethod", "termsAccepted"]);
      if (isPaymentValid) {
        processOrder(data);
      }
    }
  };

  // Handle going back to previous step
  const handleBack = () => {
    if (currentStep === "shipping") {
      setCurrentStep("contact");
    } else if (currentStep === "payment") {
      setCurrentStep("shipping");
    }
    window.scrollTo(0, 0);
  };

  // If cart is empty, redirect to cart page
  if (cart.length === 0 && !orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-full shadow-sm">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Please add some products to your cart before checking out.
            </p>
            <Link href="/products">
              <Button className="px-8 py-6 text-lg bg-indigo-600 hover:bg-indigo-700">
                <ChevronLeft className="h-5 w-5 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show payment success page
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
              <div className="w-full bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order Number:</span>
                  <span>{order?.id || "ORD123456"}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Order Total:</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-8">
                We've sent a confirmation email to <strong>{getValues("email")}</strong> with all the details of your order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link href="/account/orders" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Order
                  </Button>
                </Link>
                <Link href="/products" className="flex-1">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          setRazorpayLoaded(true);
          // Dispatch a custom event that can be caught by our effect
          window.dispatchEvent(new Event('razorpay-loaded'));
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/cart" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Cart
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <div className="hidden sm:flex items-center space-x-4">
              <div className={`flex items-center ${currentStep === "contact" ? "text-indigo-600 font-medium" : "text-gray-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${currentStep === "contact" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  1
                </div>
                Contact
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              <div className={`flex items-center ${currentStep === "shipping" ? "text-indigo-600 font-medium" : "text-gray-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${currentStep === "shipping" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  2
                </div>
                Shipping
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              <div className={`flex items-center ${currentStep === "payment" ? "text-indigo-600 font-medium" : "text-gray-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${currentStep === "payment" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                  3
                </div>
                Payment
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Order Form */}
            <div className="lg:col-span-8">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Contact Information */}
                {currentStep === "contact" && (
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <User className="h-5 w-5 mr-2 text-indigo-600" />
                        Contact Information
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name*
                          </label>
                          <Input
                            id="firstName"
                            {...register("firstName")}
                            placeholder="John"
                            className={errors.firstName ? "border-red-300" : ""}
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name*
                          </label>
                          <Input
                            id="lastName"
                            {...register("lastName")}
                            placeholder="Doe"
                            className={errors.lastName ? "border-red-300" : ""}
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address*
                          </label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="john.doe@example.com"
                            className={errors.email ? "border-red-300" : ""}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number*
                          </label>
                          <Input
                            id="phone"
                            {...register("phone")}
                            placeholder="Your phone number"
                            className={errors.phone ? "border-red-300" : ""}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping & Billing */}
                {currentStep === "shipping" && (
                  <>
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                          <Building className="h-5 w-5 mr-2 text-indigo-600" />
                          Billing Information
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="sm:col-span-2">
                            <label htmlFor="billingAddress1" className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1*
                            </label>
                            <Input
                              id="billingAddress1"
                              {...register("billingAddress1")}
                              placeholder="Street address"
                              className={errors.billingAddress1 ? "border-red-300" : ""}
                            />
                            {errors.billingAddress1 && (
                              <p className="text-red-500 text-sm mt-1">{errors.billingAddress1.message}</p>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="billingAddress2" className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 2
                            </label>
                            <Input
                              id="billingAddress2"
                              {...register("billingAddress2")}
                              placeholder="Apartment, suite, unit, etc. (optional)"
                            />
                          </div>
                          <div>
                            <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                              City*
                            </label>
                            <Input
                              id="billingCity"
                              {...register("billingCity")}
                              placeholder="City"
                              className={errors.billingCity ? "border-red-300" : ""}
                            />
                            {errors.billingCity && (
                              <p className="text-red-500 text-sm mt-1">{errors.billingCity.message}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                              State/Province*
                            </label>
                            <Input
                              id="billingState"
                              {...register("billingState")}
                              placeholder="State"
                              className={errors.billingState ? "border-red-300" : ""}
                            />
                            {errors.billingState && (
                              <p className="text-red-500 text-sm mt-1">{errors.billingState.message}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code*
                            </label>
                            <Input
                              id="billingPostalCode"
                              {...register("billingPostalCode")}
                              placeholder="Postal code"
                              className={errors.billingPostalCode ? "border-red-300" : ""}
                            />
                            {errors.billingPostalCode && (
                              <p className="text-red-500 text-sm mt-1">{errors.billingPostalCode.message}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                              Country*
                            </label>
                            <Select 
                              defaultValue="India"
                              onValueChange={(value) => setValue("billingCountry", value)}
                            >
                              <SelectTrigger className={errors.billingCountry ? "border-red-300" : ""}>
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.billingCountry && (
                              <p className="text-red-500 text-sm mt-1">{errors.billingCountry.message}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                            Shipping Information
                          </h2>
                          <div className="flex items-center">
                            <Checkbox
                              id="sameAsBilling"
                              checked={watchSameAsBilling}
                              onCheckedChange={(checked) => {
                                setValue("sameAsBilling", checked === true);
                              }}
                            />
                            <label
                              htmlFor="sameAsBilling"
                              className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              Same as billing address
                            </label>
                          </div>
                        </div>

                        {!watchSameAsBilling && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                              <label htmlFor="shippingAddress1" className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1*
                              </label>
                              <Input
                                id="shippingAddress1"
                                {...register("shippingAddress1")}
                                placeholder="Street address"
                                className={errors.shippingAddress1 ? "border-red-300" : ""}
                              />
                              {errors.shippingAddress1 && (
                                <p className="text-red-500 text-sm mt-1">{errors.shippingAddress1.message}</p>
                              )}
                            </div>
                            <div className="sm:col-span-2">
                              <label htmlFor="shippingAddress2" className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2
                              </label>
                              <Input
                                id="shippingAddress2"
                                {...register("shippingAddress2")}
                                placeholder="Apartment, suite, unit, etc. (optional)"
                              />
                            </div>
                            <div>
                              <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
                                City*
                              </label>
                              <Input
                                id="shippingCity"
                                {...register("shippingCity")}
                                placeholder="City"
                                className={errors.shippingCity ? "border-red-300" : ""}
                              />
                              {errors.shippingCity && (
                                <p className="text-red-500 text-sm mt-1">{errors.shippingCity.message}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="shippingState" className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province*
                              </label>
                              <Input
                                id="shippingState"
                                {...register("shippingState")}
                                placeholder="State"
                                className={errors.shippingState ? "border-red-300" : ""}
                              />
                              {errors.shippingState && (
                                <p className="text-red-500 text-sm mt-1">{errors.shippingState.message}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="shippingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code*
                              </label>
                              <Input
                                id="shippingPostalCode"
                                {...register("shippingPostalCode")}
                                placeholder="Postal code"
                                className={errors.shippingPostalCode ? "border-red-300" : ""}
                              />
                              {errors.shippingPostalCode && (
                                <p className="text-red-500 text-sm mt-1">{errors.shippingPostalCode.message}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="shippingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                Country*
                              </label>
                              <Select 
                                defaultValue="India"
                                onValueChange={(value) => setValue("shippingCountry", value)}
                              >
                                <SelectTrigger className={errors.shippingCountry ? "border-red-300" : ""}>
                                  <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="India">India</SelectItem>
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.shippingCountry && (
                                <p className="text-red-500 text-sm mt-1">{errors.shippingCountry.message}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                          <Truck className="h-5 w-5 mr-2 text-indigo-600" />
                          Shipping Method
                        </h2>

                        <RadioGroup
                          defaultValue="standard"
                          value={watchShippingMethod}
                          onValueChange={(value) => setValue("shippingMethod", value)}
                        >
                          <div className="flex flex-col space-y-4">
                            <label 
                              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${watchShippingMethod === "standard" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}
                            >
                              <div className="flex items-center">
                                <RadioGroupItem value="standard" id="standard-shipping" />
                                <div className="ml-3">
                                  <label htmlFor="standard-shipping" className="font-medium cursor-pointer">
                                    Standard Shipping
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Delivery in 5-7 business days
                                  </p>
                                </div>
                              </div>
                              <span className="text-green-600 font-medium">Free</span>
                            </label>

                            <label 
                              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${watchShippingMethod === "express" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}
                            >
                              <div className="flex items-center">
                                <RadioGroupItem value="express" id="express-shipping" />
                                <div className="ml-3">
                                  <label htmlFor="express-shipping" className="font-medium cursor-pointer">
                                    Express Shipping
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Delivery in 2-3 business days
                                  </p>
                                </div>
                              </div>
                              <span className="font-medium">₹100.00</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Payment Methods */}
                {currentStep === "payment" && (
                  <>
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
                          Payment Method
                        </h2>

                        <RadioGroup
                          defaultValue="card"
                          value={watchPaymentMethod}
                          onValueChange={(value) => setValue("paymentMethod", value)}
                        >
                          <div className="flex flex-col space-y-4">
                            <label 
                              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${watchPaymentMethod === "card" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}
                            >
                              <div className="flex items-center">
                                <RadioGroupItem value="card" id="card-payment" />
                                <div className="ml-3">
                                  <label htmlFor="card-payment" className="font-medium cursor-pointer">
                                    Credit / Debit Card
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Pay securely with your card
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Image 
                                  src="/visa.svg" 
                                  alt="Visa" 
                                  width={32} 
                                  height={20} 
                                  className="h-5 object-contain" 
                                />
                                <Image 
                                  src="/mastercard.svg" 
                                  alt="Mastercard" 
                                  width={32} 
                                  height={20} 
                                  className="h-5 object-contain" 
                                />
                              </div>
                            </label>

                            <label 
                              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${watchPaymentMethod === "upi" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}
                            >
                              <div className="flex items-center">
                                <RadioGroupItem value="upi" id="upi-payment" />
                                <div className="ml-3">
                                  <label htmlFor="upi-payment" className="font-medium cursor-pointer">
                                    UPI / Net Banking
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Pay using UPI or bank transfer
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Image 
                                  src="/upi.svg" 
                                  alt="UPI" 
                                  width={32} 
                                  height={20} 
                                  className="h-5 object-contain" 
                                />
                                <Image 
                                  src="/gpay.svg" 
                                  alt="Google Pay" 
                                  width={32} 
                                  height={20} 
                                  className="h-5 object-contain" 
                                />
                              </div>
                            </label>

                            <label 
                              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${watchPaymentMethod === "cod" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}
                            >
                              <div className="flex items-center">
                                <RadioGroupItem value="cod" id="cod-payment" />
                                <div className="ml-3">
                                  <label htmlFor="cod-payment" className="font-medium cursor-pointer">
                                    Cash on Delivery
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Pay when you receive your order
                                  </p>
                                </div>
                              </div>
                              <div>
                                <BanknoteIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            </label>
                          </div>
                        </RadioGroup>

                        {watchPaymentMethod === "cod" && (
                          <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Cash on Delivery Information</AlertTitle>
                            <AlertDescription>
                              Please have the exact amount ready at the time of delivery. Our delivery partner will not be able to provide change.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    {/* Order Notes */}
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="order-notes">
                            <AccordionTrigger className="text-base font-medium">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 mr-2 text-indigo-600" />
                                Add Order Notes
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="mt-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                  Order Notes
                                </label>
                                <Textarea
                                  id="notes"
                                  {...register("notes")}
                                  placeholder="Any special instructions for delivery"
                                  className="h-24"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>

                    {/* Terms and Conditions */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="termsAccepted"
                            checked={watch("termsAccepted")}
                            onCheckedChange={(checked) => setValue("termsAccepted", checked === true)}
                          />
                          <div>
                            <label
                              htmlFor="termsAccepted"
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              I accept the terms and conditions
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              By placing your order, you agree to our{" "}
                              <Link href="/terms" className="text-indigo-600 hover:text-indigo-800">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800">
                                Privacy Policy
                              </Link>
                            </p>
                          </div>
                        </div>
                        {errors.termsAccepted && (
                          <p className="text-red-500 text-sm mt-2 ml-7">{errors.termsAccepted.message}</p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {currentStep !== "contact" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  <div className={`${currentStep === "contact" ? "ml-auto" : ""}`}>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : currentStep === "payment" ? (
                        <>
                          Place Order
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-indigo-600" />
                      Order Summary
                    </h2>

                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            {item.image ? (
                              <Image
                                src={`https://greenglow.in/kauthuk_test/${item.image}`}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </h3>
                            {item.variant && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.variant.attributes.map((attr, i) => (
                                  <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                                    {attr.value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="text-sm text-gray-600 mt-1">
                              {currency === "INR" ? (
                                <>{formatPrice(item.price)} × {item.quantity}</>
                              ) : (
                                <>{formatPrice(item.priceDollars)} × {item.quantity}</>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                              {currency === "INR" ? (
                                <>{formatPrice(item.price * item.quantity)}</>
                              ) : (
                                <>{formatPrice(item.priceDollars * item.quantity)}</>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="py-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        {shippingCost > 0 ? (
                          <span>{formatPrice(shippingCost)}</span>
                        ) : (
                          <span className="text-green-600">Free</span>
                        )}
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>

                      <Separator />

                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span className="text-lg">{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Trust Elements */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start space-x-2 mb-2">
                        <Shield className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Secure Checkout:</span> Your information is protected using SSL encryption.
                        </p>
                      </div>
                      <div className="flex items-start space-x-2 mb-2">
                        <HeartHandshake className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Satisfaction Guaranteed:</span> 30-day money back guarantee.
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Wallet className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Flexible Payments:</span> Pay with credit card, UPI, or cash on delivery.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="hidden lg:block">
                  <Alert className="bg-indigo-50 border-indigo-200">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-indigo-600" />
                      <AlertTitle className="text-indigo-700">Secure Checkout</AlertTitle>
                    </div>
                    <AlertDescription className="text-indigo-700/80 mt-2">
                      Your transaction is secured with 256-bit SSL encryption
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;