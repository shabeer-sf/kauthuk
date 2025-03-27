"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Heart,
  Search,
  ShoppingCart,
  X,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Marquee from "react-fast-marquee";
import { useCart } from "@/providers/CartProvider";
import {
  getAnnouncements,
  getFeaturedCategories,
  searchProducts,
  getPopularSearchTerms,
  getCurrentUser,
  getCategories3,
} from "@/actions/category";

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Close as PopoverClose } from "@radix-ui/react-popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Import the CategoryList component
const CategoryList = dynamic(() => import("../CategoryList"), { ssr: false });

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const {
    cart,
    itemCount,
    totals,
    currency,
    toggleCurrency,
    formatPrice,
  } = useCart();
  const pathname = usePathname();

  const [userData, setUserData] = useState(null);
  const isAuthenticated = !!userData;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset search when changing pages
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsSearchPopoverOpen(false);
  }, [pathname]);

  // Fetch data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch announcements
        const { announcements: fetchedAnnouncements } =
          await getAnnouncements();
        setAnnouncements(fetchedAnnouncements);

        // Fetch categories for navigation
        const { categories: fetchedAllCategories } = await getCategories3();
        setCategories(fetchedAllCategories);
        setCategoriesLoading(false);

        // Fetch popular search terms
        const { popularTerms } = await getPopularSearchTerms();
        setPopularSearches(popularTerms);

        // Get current user
        const { user } = await getCurrentUser();
        setUserData(user);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setCategoriesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle search input
  const handleSearchChange = async (value) => {
    setSearchQuery(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const { products } = await searchProducts(value);
      setSearchResults(products);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setIsSearchPopoverOpen(false);
    }
  };

  // Navigation categories - now coming from API data dynamically
  // These will match what's in your admin panel
  const getNavIcon = (categoryName) => {
    const icons = {
      "Paintings": "🖼️",
      "Gifts & Souvenirs": "🎁",
      "Decor & Crafts": "🏠",
      "Apparels & Accessories": "👕",
      "Furniture": "🪑",
      "Living Essentials": "🏡"
    };
    return icons[categoryName] || "📦";
  };
  
  // We'll generate navigation items from fetched categories
  const getNavCategories = () => {
    // Filter only active categories
    const activeCategories = categories.filter(cat => cat.showHome === 'active');
    
    return activeCategories.map(category => ({
      id: category.id,
      name: category.catName.toUpperCase(),
      href: `/category/${category.id}`,
      icon: getNavIcon(category.catName),
      subcategories: category.SubCategory || []
    }));
  };

  return (
    <header className="w-full bg-white sticky top-0 z-40">
      {/* Announcement Bar with Brown Background */}
      <div className="w-full bg-[#b38d4a] text-white py-1.5 px-4">
        <div className="mx-auto w-full">
          <Marquee
            className="w-full text-xs font-normal"
            speed={40}
            gradient={false}
          >
            <div className="flex items-center space-x-8">
              {announcements.map((announcement, index) => (
                <span key={index} className="px-4">
                  {announcement}
                </span>
              ))}
            </div>
          </Marquee>
        </div>
      </div>

      {/* Main Header Section */}
      <div className={cn("w-full bg-[#6B2F1A] transition-all duration-300", isScrolled ? "py-2" : "py-3")}>
        <div className="mx-auto px-4 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#5A2814]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu />
            </Button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-28 md:w-32">
              <Image
                src="/assets/images/logo.png"
                fill
                alt="Kauthuk Logo"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Main Navigation - Desktop */}
          <div className="flex-1 max-md:hidden">
          <CategoryList />

          </div>
          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            {/* Search Icon */}
            <Popover
              open={isSearchPopoverOpen}
              onOpenChange={setIsSearchPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#5A2814]"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[320px] sm:w-[400px] p-0"
                align="end"
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full p-3 pl-10 outline-none text-sm border-b"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>

                {searchResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <PopoverClose asChild key={product.id}>
                        <Link
                          href={`/product/${product.id}`}
                          className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 mr-3">
                            {product.thumbnail && (
                              <Image
                                src={`https://greenglow.in/kauthuk_test/${product.thumbnail}`}
                                fill
                                alt={product.title}
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-sm font-medium text-[#6B2F1A] mt-1">
                              {currency === "INR"
                                ? formatPrice(product.price, "INR")
                                : formatPrice(product.priceDollars, "USD")}
                            </p>
                          </div>
                        </Link>
                      </PopoverClose>
                    ))}
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="mb-2">
                      <h3 className="text-xs font-medium text-gray-500">
                        Popular Searches
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSearchChange(term)}
                          className="text-xs h-7"
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 border-t">
                  <Button
                    className="w-full bg-[#6B2F1A] hover:bg-[#5A2814]"
                    onClick={handleSearchSubmit}
                    disabled={!searchQuery.trim()}
                  >
                    Search Now
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Currency Display (₹) */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#5A2814]"
              onClick={toggleCurrency}
            >
              <span className="text-base">
                {currency === "INR" ? "₹" : "$"}
              </span>
            </Button>

            {/* Wishlist Icon removed as requested */}

            {/* User Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#5A2814]"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button className="w-full text-left cursor-pointer">
                        Log out
                      </button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2">
                      <Link href="/login">
                        <Button variant="outline" className="w-full justify-start">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full justify-start bg-[#6B2F1A] hover:bg-[#5A2814] mt-3">
                          Register
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Icon */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#5A2814] relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-white text-[#6B2F1A] text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation - We're removing this since we'll use the CategoryList component instead */}

                  {/* Mobile Menu (Sheet) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-0 left-0 h-full w-[280px] bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#6B2F1A] flex justify-between items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="relative h-10 w-24">
                  <Image
                    src="/assets/images/logo.png"
                    fill
                    alt="Kauthuk Logo"
                    className="object-contain"
                  />
                </div>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Nav Menu */}
            <div className="p-4">
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Categories</div>
                <div className="space-y-2">
                  {getNavCategories().map(category => (
                    <Link 
                      key={category.id}
                      href={category.href}
                      className="flex items-center py-2 border-b border-gray-100 text-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{category.icon}</span>
                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Account</div>
                <div className="space-y-2">
                  <Link 
                    href="/login"
                    className="block py-2 border-b border-gray-100 text-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register"
                    className="block py-2 border-b border-gray-100 text-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                  <Link 
                    href="/cart"
                    className="block py-2 border-b border-gray-100 text-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cart ({itemCount})
                  </Link>
                  <Link 
                    href="/wishlist"
                    className="block py-2 border-b border-gray-100 text-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;