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
  LogOut,
  ShoppingBag,
  Settings,
  DollarSign,
  IndianRupee,
  Package,
  Home,
  Info,
  Phone,
  Bookmark,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import {
  getAnnouncements,
  getFeaturedCategories,
  searchProducts,
  getPopularSearchTerms,
  getCurrentUser,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Close as PopoverClose } from "@radix-ui/react-popover";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import CategoryList from "../CategoryList";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);

  const {
    cart,
    itemCount,
    totals,
    currency,
    toggleCurrency,
    formatPrice,
    removeFromCart,
    updateQuantity,
    clearCart,
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

        // Fetch featured categories
        const { featuredCategories: fetchedCategories } =
          await getFeaturedCategories();
        setFeaturedCategories(fetchedCategories);

        // Fetch popular search terms
        const { popularTerms } = await getPopularSearchTerms();
        setPopularSearches(popularTerms);

        // Get current user
        const { user } = await getCurrentUser();
        setUserData(user);
      } catch (error) {
        console.error("Error fetching initial data:", error);
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
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setIsSearchPopoverOpen(false);
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-40">
      {/* Announcement Bar with Gradient Background */}
      <div className="w-full bg-gradient-to-r from-green-50 via-green-100 to-green-50 py-2 px-4">
        <div className="mx-auto w-full">
          <Marquee
            className="w-full text-sm font-medium text-green-800"
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
      <div
        className={cn(
          "w-full transition-all duration-300 border-b",
          isScrolled ? "py-2 shadow-sm" : "py-3"
        )}
      >
        <div className="mx-auto px-4 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100">
                  <Link
                    href="/"
                    className="flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="relative h-12 w-28">
                      <Image
                        src="/assets/images/logo.png"
                        fill
                        alt="Kauthuk Logo"
                        className="object-contain"
                        priority
                      />
                    </div>
                  </Link>
                </div>

                <div className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <Link
                      href="/"
                      className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="h-4 w-4 text-green-600" />
                      <span
                        className={
                          pathname === "/" ? "font-medium text-green-600" : ""
                        }
                      >
                        Home
                      </span>
                    </Link>

                    <Link
                      href="/pages/about"
                      className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Info className="h-4 w-4 text-green-600" />
                      <span
                        className={
                          pathname === "/pages/about"
                            ? "font-medium text-green-600"
                            : ""
                        }
                      >
                        About Us
                      </span>
                    </Link>

                    <Link
                      href="/contact"
                      className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Phone className="h-4 w-4 text-green-600" />
                      <span
                        className={
                          pathname === "/contact"
                            ? "font-medium text-green-600"
                            : ""
                        }
                      >
                        Contact
                      </span>
                    </Link>
                  </div>

                  <Separator className="my-4" />

                  {/* Mobile Categories */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 px-3 py-1">
                      Categories
                    </h3>
                    {featuredCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.id}`}
                        className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Bookmark className="h-4 w-4 text-green-600" />
                        <span>{category.catName}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t">
                  <div className="flex flex-col space-y-4 w-full">
                    {isAuthenticated ? (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {userData.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {userData.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {userData.email}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href="/login"
                          className="flex-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link
                          href="/register"
                          className="flex-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Register
                          </Button>
                        </Link>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={toggleCurrency}
                    >
                      {currency === "INR" ? (
                        <>
                          <IndianRupee className="h-4 w-4" /> INR
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4" /> USD
                        </>
                      )}
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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

          {/* Desktop Nav Links - Hidden on Mobile */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/"
                        ? "text-green-600 font-medium"
                        : "text-gray-700"
                    )}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/pages/about" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/pages/about"
                        ? "text-green-600 font-medium"
                        : "text-gray-700"
                    )}
                  >
                    About Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === "/contact"
                        ? "text-green-600 font-medium"
                        : "text-gray-700"
                    )}
                  >
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar */}
          <Popover
            open={isSearchPopoverOpen}
            onOpenChange={setIsSearchPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="hidden md:flex ml-auto mr-6 w-full max-w-md justify-start border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
              >
                <Search className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-500 text-sm">
                  Search for products...
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[320px] sm:w-[400px] p-0"
              align="center"
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
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                )}
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
                          {product.thumbnail ? (
                            <Image
                              src={`https://greenglow.in/kauthuk_test/${product.thumbnail}`}
                              fill
                              alt={product.title}
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                          <p className="text-sm font-medium text-green-600 mt-1">
                            {currency === "INR"
                              ? formatPrice(product.price, "INR")
                              : formatPrice(product.priceDollars, "USD")}
                          </p>
                        </div>
                      </Link>
                    </PopoverClose>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No products found</p>
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
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleSearchSubmit}
                  disabled={!searchQuery.trim()}
                >
                  Search Now
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Right Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Currency Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCurrency}
                    className="hidden md:flex hover:bg-gray-100"
                  >
                    {currency === "INR" ? (
                      <IndianRupee className="h-4 w-4 text-gray-700" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-gray-700" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {currency === "INR" ? "USD" : "INR"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Search Icon (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4 text-gray-700" />
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 text-gray-700" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Account</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-2 py-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>
                          {userData.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{userData.name}</p>
                        <p className="text-xs text-gray-500">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="cursor-pointer flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/orders"
                        className="cursor-pointer flex items-center"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button className="w-full text-left cursor-pointer flex items-center text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2">
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full justify-start bg-green-600 hover:bg-green-700 mt-3">
                          Register
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Go to Cart Button - visible on desktop */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/cart">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden md:flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden lg:inline">Cart</span>
                      <Badge className="ml-1 bg-green-600 hover:bg-green-600 text-white">
                        {itemCount}
                      </Badge>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  View Cart • {formatPrice(totals.current)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Cart Sheet Trigger */}
            {/* <Sheet>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-gray-100"
                      >
                        <ShoppingCart className="h-4 w-4 text-gray-700" />
                        {itemCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 px-1 h-4 flex items-center justify-center bg-green-600 hover:bg-green-600 text-[10px]">
                            {itemCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Cart • {formatPrice(totals.current)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Cart</h2>
                    <Badge variant="outline" className="bg-white">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 h-[calc(100vh-220px)] overflow-y-auto">
                  {itemCount > 0 ? (
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex space-x-4">
                          <div className="relative w-16 h-16 bg-gray-100 rounded">
                            {item.image ? (
                              <Image
                                src={`https://greenglow.in/kauthuk_test/${item.image}`}
                                fill
                                alt={item.title}
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">
                              {item.title}
                            </h4>
                            {item.variant && (
                              <p className="text-xs text-gray-500">
                                {item.variant.name}
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() =>
                                  updateQuantity(index, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                <span className="text-xs">-</span>
                              </Button>
                              <span className="mx-2 text-xs">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() =>
                                  updateQuantity(index, item.quantity + 1)
                                }
                                disabled={
                                  item.maxStock &&
                                  item.quantity >= item.maxStock
                                }
                              >
                                <span className="text-xs">+</span>
                              </Button>
                            </div>
                            <p className="text-sm font-medium text-green-600 mt-1">
                              {currency === "INR"
                                ? formatPrice(item.price * item.quantity, "INR")
                                : formatPrice(
                                    item.priceDollars * item.quantity,
                                    "USD"
                                  )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <ShoppingCart className="h-16 w-16 text-gray-300" />
                      <p className="text-gray-500">Your cart is empty</p>
                      <SheetClose asChild>
                        <Link href="/products">
                          <Button className="bg-green-600 hover:bg-green-700">
                            Continue Shopping
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>

                {itemCount > 0 && (
                  <div className="border-t p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(totals.current)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        Calculated at checkout
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        {formatPrice(totals.current)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <Link href="/checkout">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Checkout
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/cart">
                          <Button variant="outline" className="w-full">
                            View Cart
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 mt-2"
                      onClick={() => {
                        clearCart();
                        toast.success("Cart has been cleared");
                      }}
                    >
                      Clear Cart
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet> */}
          </div>
        </div>
      </div>

      {/* Category Navigation - Desktop Only */}
      <div className="hidden md:block w-full border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-2 px-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-2"
                  ></div>
                ))}
              </div>
            }
          >
            <div className="overflow-hidden">
              <CategoryList />
            </div>
          </Suspense>
        </div>
      </div>

      {/* Full-screen Search Modal for Mobile */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg mt-20 rounded-xl overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full p-4 pl-12 outline-none text-base"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>

              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto divide-y">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex items-center p-4 hover:bg-gray-50"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-gray-100 mr-3">
                        {product.thumbnail ? (
                          <Image
                            src={`https://greenglow.in/kauthuk_test/${product.thumbnail}`}
                            fill
                            alt={product.title}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {product.description}
                        </p>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          {currency === "INR"
                            ? formatPrice(product.price, "INR")
                            : formatPrice(product.priceDollars, "USD")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="p-4 border-t">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-500">
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
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;