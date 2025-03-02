"use client";

import { useState } from "react";
import { Heart, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { FaRegUser } from "react-icons/fa";
import CategoryList from "./CategoryList";
import { motion } from "framer-motion";
import { useCart } from '@/providers/CartProvider';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const  {cart} = useCart();
console.log(cart)
  return (
    <div className="w-full bg-white">
      {/* Marquee Section */}
      <div className="w-full bg-mainColor p-2">
        <div className="flex justify-center items-center max-w-7xl mx-auto w-full">
          <Marquee
            className="w-full text-sm text-[#000000]"
            speed={50}
            gradient={false}
          >
            Kauthuk is a venture "Connecting Technology, Art and the Artisan" for clean and green living. With Kauthuk we intend to research, innovate.
          </Marquee>
        </div>
      </div>

      {/* Header Section */}
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto p-2">
        <Link href={"/"}>
          <Image alt="logo" src={"/assets/images/logo.png"} width={120} height={80} />
        </Link>
        <div
          className="mx-3 rounded-full bg-[#efeeea] p-3 w-full max-w-2xl hidden md:flex items-center gap-3 cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={20} />
          <p className="text-sm text-stone-400">Search</p>
        </div>

        {/* Right Section (Icons) */}
        <div className="flex justify-end">
          <div className="flex gap-4 relative">
            <div>
              <FaRegUser size={20} color="#000000" />
            </div>
            <div>
              <Heart size={20} className="text-black" />
            </div>
            <Link href={"/cart"} className="relative">
              <ShoppingCart size={20} className="text-black" />
              {cart?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart?.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div
        className="mx-3 rounded-full bg-[#efeeea] p-3 max-w-2xl hidden max-md:flex items-center gap-3 mt-2 mb-4 cursor-pointer"
        onClick={() => setIsSearchOpen(true)}
      >
        <Search size={20} />
        <p className="text-sm text-stone-400">Search</p>
      </div>

      <div className="w-full mx-auto max-w-7xl">
        <CategoryList />
      </div>

      {/* Search Popup */}
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsSearchOpen(false)}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-black"
              onClick={() => setIsSearchOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 border-b pb-2">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full focus:outline-none text-lg"
                autoFocus
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Header;
