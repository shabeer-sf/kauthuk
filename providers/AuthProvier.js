"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // Make sure to import jwtDecode correctly

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        // Decode the JWT token using jwt-decode
        const decoded = jwtDecode(token);
        console.log("decoded", decoded);
        setAdmin(decoded); // Set the decoded data
      } catch (error) {
        router.replace("/admin/login");

      }
    }
    setLoading(false); // Set loading to false after decoding
  }, []);

  useEffect(() => {
    if (!loading && !admin) {
      // Only redirect when loading is complete and admin is not set
      // router.replace("/admin/login");
    }
  }, [admin, loading, router]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
    router.replace("/admin/login");
  };

  if (loading) {
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>;
  }
  return (
    <AuthContext.Provider value={{ admin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
