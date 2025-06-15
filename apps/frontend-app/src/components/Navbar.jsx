'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import SearchBox from './SearchBox';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth'; // Import the auth hook

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Use the auth hook instead of manual state management
  const { user, loading: isLoading, logout, getInitials } = useAuth();

  // Handle logout using the auth hook
  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    router.push('/');
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const ProfileAvatar = ({ user, onClick }) => (
    <button
      onClick={onClick}
      className="w-10 h-10 bg-gradient-to-r from-[#72BAA9] to-[#D5E7B5] rounded-full flex items-center justify-center text-[#474E93] font-bold text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200"
    >
      {getInitials(user.first_name, user.last_name)}
    </button>
  );

  const ProfileDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
    >
      {/* User Info Section */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#72BAA9] to-[#D5E7B5] rounded-full flex items-center justify-center text-[#474E93] font-bold">
            {getInitials(user.first_name, user.last_name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <Link
          href="/profile"
          onClick={() => setProfileMenuOpen(false)}
          className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <User size={16} />
          <span className="text-sm">Profil Saya</span>
        </Link>

        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#474E93] shadow p-6 m-2 px-4 py-3 mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-6xl rounded-2xl">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-1">
          <Link href="/">
            <span className="text-2xl font-bold text-[#D5E7B5]">
              zone<span className="text-[#72BAA9]">Tix</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#D5E7B5]">
            <motion.div
              animate={menuOpen ? "open" : "closed"}
              variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/event" className="text-[#ffffff] hover:text-[#72BAA9] transition-colors">
            Event
          </Link>

          <div className="w-60 md:w-72">
            <SearchBox />
          </div>

          {/* Authentication Section */}
          {isLoading ? (
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative profile-menu-container">
              <ProfileAvatar 
                user={user} 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
              />
              <AnimatePresence>
                {profileMenuOpen && <ProfileDropdown />}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <button className="bg-[#D5E7B5] font-bold text-[#7E5CAD] px-4 py-2 rounded hover:bg-[#a8bf81] hover:text-[#7E5CAD] transition">
                Masuk
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 space-y-3"
          >
            <Link 
              href="/event" 
              className="block text-[#ffffff] hover:text-[#72BAA9] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Event
            </Link>
            <SearchBox />
            
            {/* Mobile Authentication Section */}
            {isLoading ? (
              <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
            ) : user ? (
              <div className="space-y-2">
                {/* Mobile User Info */}
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#72BAA9] to-[#D5E7B5] rounded-full flex items-center justify-center text-[#474E93] font-bold text-sm">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                {/* Mobile Menu Items */}
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center space-x-3 text-[#ffffff] hover:text-[#72BAA9] transition-colors"
                >
                  <User size={16} />
                  <span>Profil Saya</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-red-300 hover:text-red-200 transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button 
                  className="bg-[#D5E7B5] font-bold text-[#7E5CAD] px-3 py-2 rounded w-full hover:bg-[#a8bf81] hover:text-[#7E5CAD] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Masuk
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}