'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { loginWithMobileOTP } from '@/actions/auth';

export default function MobileLogin({ onOTPSent }) {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mobile) {
      setError('Please enter your mobile number');
      return;
    }
    
    // Basic mobile validation
    const mobileRegex = /^\d{10,12}$/;
    if (!mobileRegex.test(mobile.replace(/[^0-9]/g, ""))) {
      setError('Please enter a valid mobile number');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await loginWithMobileOTP(mobile);
      
      if (result.success) {
        // Call the onOTPSent callback with the user data and OTP (for development)
        onOTPSent({
          userId: result.user.id,
          mobile: result.user.mobile,
          name: result.user.name,
          otp: result.otp // Will be undefined in production
        });
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Mobile login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Login with Mobile</h3>
        <p className="mt-1 text-sm text-gray-500">
          We'll send a one-time code to your phone
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700"
          >
            Mobile Number
          </label>
          <div className="mt-1">
            <input
              id="mobile"
              name="mobile"
              type="tel"
              autoComplete="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your mobile number"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || !mobile}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Sending OTP...
              </>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}