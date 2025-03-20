'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useUserAuth } from '@/providers/UserProvider';
import MobileLogin from '@/components/auth/MobileLogin';
import OTPVerification from '@/components/auth/OTPVerification';

export default function LoginPage() {
  const [formErrors, setFormErrors] = useState({});
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
  const [otpData, setOtpData] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const { login, clearError, error: authError, loading: authLoading } = useUserAuth();

  const validateForm = (formData) => {
    const errors = {};

    // Email validation
    const email = formData.get('email')?.trim() || '';
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    const password = formData.get('password') || '';
    if (!password) {
      errors.password = 'Password is required';
    }

    // Captcha validation if shown
    if (showCaptcha && !captchaInput) {
      errors.captcha = 'Please enter the captcha';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (formData) => {
    // Validate form
    if (!validateForm(formData)) {
      return;
    }

    try {
      clearError?.(); // Clear any previous auth context errors

      // Check if captcha is required and validate it
      if (showCaptcha) {
        const captchaValue = formData.get('captcha');
        
        // In a real implementation, you would verify the captcha with a server action
        // For this example, we'll just check if it's not empty
        if (!captchaValue) {
          setFormErrors({ captcha: 'Please enter the captcha code' });
          return;
        }
        
        // You would validate the captcha here
        // For example: const captchaValid = await verifyCaptcha(captchaValue);
      }

      // Create a copy of the FormData with trimmed values
      const processedFormData = new FormData();
      processedFormData.append('email', formData.get('email')?.trim() || '');
      processedFormData.append('password', formData.get('password') || '');

      // Call login function from auth context
      const result = await login(processedFormData);

      if (!result.success) {
        // If login fails multiple times, show captcha
        setShowCaptcha(true);
        
        // In a real implementation, you would fetch a captcha image from your server
        // For this example, we'll use a placeholder image
        if (!captchaImage) {
          await refreshCaptcha();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setShowCaptcha(true);
      await refreshCaptcha();
    }
  };

  const refreshCaptcha = async () => {
    // In a real implementation, you would fetch a new captcha from your server
    // For this example, we'll just set a placeholder
    setCaptchaImage('/api/captcha?' + new Date().getTime());
    setCaptchaInput('');
  };

  const handleOTPSent = (data) => {
    setOtpData(data);
  };

  // If OTP has been sent, show the OTP verification form
  if (otpData) {
    return (
      <OTPVerification 
        userId={otpData.userId} 
        mobile={otpData.mobile} 
        otp={otpData.otp} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {authError && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{authError}</p>
            </div>
          )}

          <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email">Email & Password</TabsTrigger>
              <TabsTrigger value="mobile">Mobile OTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form action={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`appearance-none block w-full px-3 py-2 border ${
                        formErrors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className={`appearance-none block w-full px-3 py-2 border ${
                        formErrors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                {showCaptcha && (
                  <div>
                    <label
                      htmlFor="captcha"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Security Code
                    </label>
                    <div className="mt-1">
                      <div className="flex space-x-2 mb-2">
                        {captchaImage && (
                          <img 
                            src={captchaImage} 
                            alt="CAPTCHA" 
                            className="h-10 border border-gray-300 rounded" 
                          />
                        )}
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Refresh
                        </button>
                      </div>
                      <input
                        id="captcha"
                        name="captcha"
                        type="text"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        required={showCaptcha}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          formErrors.captcha ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="Enter the code shown above"
                      />
                      {formErrors.captcha && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.captcha}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember_me"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="mobile">
              <MobileLogin onOTPSent={handleOTPSent} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}