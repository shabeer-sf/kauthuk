"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductListingPage from "@/components/ProductListingPage";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // Set page title based on search query
  useEffect(() => {
    if (query) {
      document.title = `Search: ${query} | Your Store Name`;
    } else {
      document.title = "Search | Your Store Name";
    }
  }, [query]);

  return (
    <main>
      {/* You can add a custom header specifically for the search page if needed */}
      {!query && (
        <div className="bg-indigo-50 py-12 mb-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Products</h1>
            <p className="max-w-2xl mx-auto text-gray-600">
              Find exactly what you're looking for in our extensive catalog.
            </p>
          </div>
        </div>
      )}
      
      {/* The ProductListingPage component handles the search parameter automatically */}
      <ProductListingPage />
    </main>
  );
}