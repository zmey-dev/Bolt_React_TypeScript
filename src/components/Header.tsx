import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image, Heart, HelpCircle, Sparkles, Info } from 'lucide-react';
import { HowItWorksModal } from './HowItWorksModal';

interface HeaderProps {
  wishlistCount: number;
  onShowHowItWorks: () => void;
  onShowFAQ: () => void;
}

export function Header({ wishlistCount, onShowHowItWorks, onShowFAQ }: HeaderProps) {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#260000] h-auto md:h-20 border-b border-yellow-400">
      <div className="max-w-[1400px] mx-auto px-4 md:px-16 flex flex-col md:flex-row items-center justify-between py-4 md:py-0 md:h-full gap-4 md:gap-0">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-3 text-2xl md:text-3xl font-bold text-white md:ml-8 relative hover:text-yellow-400/90 transition-colors"
          >
            <div className="relative">
              <Sparkles className="w-9 h-9 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:animate-[sparkle_1.5s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-yellow-400/30 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
            </div>
            <span className="relative inline-flex gap-2 transition-all duration-300 group-hover:scale-105">
              <span className="relative">
                Light Show
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
              <span className="text-yellow-400 relative">
                Vault
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 md:mr-8 w-full md:w-auto">
            <button
              onClick={onShowHowItWorks}
              className="flex items-center gap-1 md:gap-2 text-sm md:text-base text-white hover:text-yellow-400 transition-colors px-2 py-1 md:px-0 md:py-0 font-medium"
            >
              <Info className="w-5 h-5" strokeWidth={2.5} />
              How It Works
            </button>
            
            <button
              onClick={onShowFAQ}
              className="flex items-center gap-1 md:gap-2 text-sm md:text-base text-white hover:text-yellow-400 transition-colors px-2 py-1 md:px-0 md:py-0 font-medium"
            >
              <HelpCircle className="w-5 h-5" strokeWidth={2.5} />
              FAQ
            </button>

            <Link 
  to="/wishlist" 
  className={`flex items-center gap-1 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg transition-all text-sm md:text-base ${
    location.pathname === '/wishlist'
      ? 'bg-yellow-400 text-[#260000] font-medium shadow-lg scale-105'
      : 'bg-yellow-400 text-[#260000] font-medium hover:bg-yellow-500 hover:scale-105'
  }`}
>
  <Heart className="w-4 h-4 md:w-5 md:h-5" />
  View Wishlist ({wishlistCount})
</Link>
          </div>
      </div>
    </nav>
  );
}