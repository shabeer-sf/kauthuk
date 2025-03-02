"use client"
// pages/payment.js
import { useEffect } from 'react';
import Script from 'next/script';
import { toast } from 'sonner';

const PaymentPage = () => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const initializeRazorpay = () => {
    // Initialize payment
    const options = {
      key: "rzp_test_XJHuf2tDhLQjAV",
      amount: 50000, // Amount in smallest currency unit (e.g., paise for INR)
      currency: "INR",
      name: "Kauthuk",
      description: "Test Transaction",
      handler: function (response) {
        alert(`Payment ID: ${response.razorpay_payment_id}`);
        // Handle successful payment here
        verifyPayment(response);
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999"
      },
      notes: {
        address: "Your Company Address"
      },
      theme: {
        color: "#3399cc"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const verifyPayment = async (response) => {
    toast.success("Payment created successfully.");

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Make a Payment</h1>
        <p className="mb-4">Amount: ₹500.00</p>
        <button
          onClick={initializeRazorpay}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;