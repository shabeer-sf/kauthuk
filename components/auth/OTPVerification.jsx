'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { verifyOTP, skipOTPAndRegister } from '@/actions/auth';

export default function OTPVerification({ userId, mobile, otp = null }) {
  const [userOtp, setUserOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();

  // Timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-fill OTP in development mode if provided
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && otp) {
      setUserOtp(otp);
    }
  }, [otp]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userOtp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await verifyOTP(userId, userOtp);

      if (result.success) {
        setSuccess('Mobile number verified successfully!');
        setError('');
        // Redirect to dashboard or homepage after successful verification
        setTimeout(() => {
          router.push('/my-account');
        }, 1500);
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setError('');

      // Call the sendOTP action from your auth.js file
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, mobile }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('OTP sent successfully!');
        setError('');
        setCountdown(30); // Reset the countdown
        
        // If in development and OTP is returned, auto-fill it
        if (process.env.NODE_ENV === 'development' && result.otp) {
          setUserOtp(result.otp);
        }
      } else {
        setError(result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSkipVerification = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await skipOTPAndRegister(userId);

      if (result.success) {
        setSuccess('Registration completed successfully!');
        // Redirect to dashboard or homepage
        setTimeout(() => {
          router.push('/my-account');
        }, 1500);
      } else {
        setError(result.error || 'Failed to complete registration. Please try again.');
      }
    } catch (error) {
      console.error('Skip verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Mobile Number
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a verification code to {mobile}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code (OTP)
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !userOtp || userOtp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify Mobile Number'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  onClick={handleResendOTP}
                  disabled={resendLoading || countdown > 0}
                  className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="animate-spin inline-block mr-1 h-3 w-3" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend OTP in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>
              <div className="text-sm">
                <button
                  onClick={handleSkipVerification}
                  disabled={loading}
                  className="font-medium text-gray-600 hover:text-gray-800"
                >
                  Skip Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}