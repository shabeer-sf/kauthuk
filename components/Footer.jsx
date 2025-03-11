"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ArrowRight,
  ChevronDown,
  Send,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FooterLinkGroup = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:cursor-default"
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
        <ChevronDown 
          size={18} 
          className={`transition-transform md:hidden ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`mt-4 space-y-3 transition-all overflow-hidden md:block ${isOpen ? 'max-h-96' : 'max-h-0 md:max-h-none'}`}>
        {children}
      </div>
    </div>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      
      
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* About column - wider on larger screens */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center">
                <div className="relative w-28 h-10 mr-2 rounded-lg  flex items-center justify-center text-white overflow-hidden">
                  <Image 
                    src="/assets/images/logo.png" 
                    alt="Company Logo" 
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                      e.target.parentNode.innerHTML = '<span class="text-lg font-bold">YB</span>';
                    }}
                  />
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">Kauthuk</span>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We're dedicated to providing high-quality products with exceptional customer service. Our mission is to make your shopping experience seamless, enjoyable and convenient.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#" 
                aria-label="Facebook" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-pink-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-400 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                aria-label="Twitter" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-blue-400 dark:text-slate-400 dark:hover:text-blue-300 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                aria-label="YouTube" 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              {/* Quick Links */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 md:border-0 md:pb-0">
                <FooterLinkGroup title="Quick Links">
                  <ul className="space-y-3">
                    <li>
                      <Link href="/pages/about" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Shop
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        FAQ
                      </Link>
                    </li>
                  </ul>
                </FooterLinkGroup>
              </div>

              {/* Policy Links */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 md:border-0 md:pb-0">
                <FooterLinkGroup title="Customer Service">
                  <ul className="space-y-3">
                    <li>
                      <Link href="/pages/shipping" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Shipping Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/pages/returns" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Returns & Refunds
                      </Link>
                    </li>
                    <li>
                      <Link href="/pages/privacy" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/pages/terms" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link href="/track-order" className="group text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-400 mr-2 transition-colors"></span>
                        Track Your Order
                      </Link>
                    </li>
                  </ul>
                </FooterLinkGroup>
              </div>

              {/* Contact */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 md:border-0 md:pb-0">
                <FooterLinkGroup title="Contact Us">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0">
                        <MapPin size={16} />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        123 Commerce Street<br/>
                        Business City, 12345
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0">
                        <Phone size={16} />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        +1 (555) 123-4567
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0">
                        <Mail size={16} />
                      </div>
                      <a 
                        href="mailto:contact@yourbrand.com" 
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        contact@yourbrand.com
                      </a>
                    </div>
                  </div>
                </FooterLinkGroup>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer with accent line */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <p>© {currentYear} Kauthuk. All rights reserved.</p>
              <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <Link 
                href="/pages/privacy" 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <Link 
                href="/pages/terms" 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <span>Made with</span>
              <Heart size={14} className="mx-1 text-red-500" />
              <span>by Kauthuk</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;