"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";

const PaymentPage = () => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // ✅ Load Razorpay script using Next.js <Script> component
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const initializeRazorpay = () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }

    const options = {
      key: "rzp_test_XJHuf2tDhLQjAV",
      amount: 50000, // Amount in smallest currency unit (e.g., paise for INR)
      currency: "INR",
      name: "Kauthuk",
      description: "Test Transaction",
      handler: function (response) {
        toast.success(`Payment ID: ${response.razorpay_payment_id}`);
        verifyPayment(response);
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Your Company Address",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const verifyPayment = async (response) => {
    toast.success("Payment created successfully.");
    console.log("Verify Payment Response:", response);
  };

  return (
    <>
      {/* ✅ Load Razorpay script properly */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Make a Payment</h1>
          <p className="mb-4">Amount: ₹500.00</p>
          <button
            onClick={initializeRazorpay}
            disabled={!razorpayLoaded}
            className={`px-6 py-2 rounded transition-colors ${
              razorpayLoaded
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            {razorpayLoaded ? "Pay Now" : "Loading..."}
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
