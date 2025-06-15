import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function ZoneTixFooter() {
  return (
    <footer className="bg-[#474E93] shadow text-white py-8 mt-16 border-t-4 border-[#72BAA9]">
      <div className="container mx-auto px-6 text-center">
        
        {/* Logo */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold">
            <span className="text-[#D5E7B5]">zone</span><span className="text-[#72BAA9]">Tix</span>
          </h3>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center items-center space-x-8 mb-6 text-gray-300">
          <a href="/about" className="hover:text-white transition-colors">Apa itu ZoneTix?</a>
          <span className="text-gray-500">•</span>
          <a href="/terms-and-condition" className="hover:text-white transition-colors">Syarat dan Ketentuan</a>
          <span className="text-gray-500">•</span>
          <a href="/privacy-policy" className="hover:text-white transition-colors">Kebijakan Privasi</a>
        </div>

        {/* Copyright */}
        <div className="text-white text-sm">
          ©2025. PT ZoneTix. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
