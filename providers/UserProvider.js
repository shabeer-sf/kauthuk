"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getUserProfile 
} from "@/actions/user";

// Define a mock checkAuthStatus function if it's not available
const checkAuthStatus = async () => {
  try {
    // Try to get the user profile which should contain authentication info
    const profileResponse = await getUserProfile();
    
    if (profileResponse.success && profileResponse.user) {
      return {
        authenticated: true,
        user: profileResponse.user
      };
    }
    
    return {
      authenticated: false,
      user: null
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      authenticated: false,
      user: null,
      error: error.message
    };
  }
};

// Routes that require authentication
const PROTECTED_ROUTES = ['/checkout', '/my-account', '/orders', '/wishlist'];

// Create the authentication context
const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { authenticated, user } = await checkAuthStatus();
        
        if (authenticated && user) {
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect to login if accessing protected routes without authentication
  useEffect(() => {
    if (!loading && !user && pathname) {
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
      
      if (isProtectedRoute) {
        // Save the attempted URL to redirect back after login
        if (typeof window !== 'undefined') {
          localStorage.setItem("redirectAfterLogin", pathname);
        }
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, loading, pathname, router]);

  // Login function
  const login = async (formData) => {
    try {
      setLoading(true);
      const result = await loginUser(formData);
      
      if (result.success) {
        setUser(result.user);
        
        // Check if there's a redirect URL
        let redirectUrl = "/my-account";
        if (typeof window !== 'undefined') {
          const storedRedirect = localStorage.getItem("redirectAfterLogin");
          if (storedRedirect) {
            redirectUrl = storedRedirect;
            localStorage.removeItem("redirectAfterLogin");
          }
        }
        
        router.push(redirectUrl);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Login failed' 
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (formData) => {
    try {
      setLoading(true);
      const result = await registerUser(formData);
      
      if (result.success) {
        setUser(result.user);
        router.push("/my-account");
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get full profile data
  const getProfile = async () => {
    try {
      setLoading(true);
      const result = await getUserProfile();
      
      if (result.success) {
        setUser(result.user);
        return { success: true, data: result.user };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to fetch profile' 
        };
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Content with loading state
  const content = loading ? (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  ) : (
    children
  );

  // Provide authentication context to children
  return (
    <UserAuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        getProfile,
        isAuthenticated,
        loading
      }}
    >
      {content}
    </UserAuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};