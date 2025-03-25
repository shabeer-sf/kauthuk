// app/api/captcha/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCaptcha } from '@/lib/captcha';

export async function GET() {
  try {
    // Generate a captcha image and code
    const { image, code } = await generateCaptcha();
    
    // Store the captcha code in a cookie for verification
    const cookieStore = await cookies();
    await cookieStore.set({
      name: 'captcha_code',
      value: code,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
      sameSite: 'lax'
    });
    
    // Set the content type to image/svg+xml or image/png depending on your captcha library
    return new NextResponse(image, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('Captcha generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate captcha' },
      { status: 500 }
    );
  }
}

// This route handles OTP resending
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, mobile } = body;
    
    if (!userId || !mobile) {
      return NextResponse.json(
        { success: false, error: 'Missing user ID or mobile number' },
        { status: 400 }
      );
    }
    
    // Import the server action
    const { sendOTP } = await import('@/actions/auth');
    
    // Resend OTP
    const result = await sendOTP(mobile, userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('OTP resend error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
}