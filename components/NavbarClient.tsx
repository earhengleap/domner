"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import AuthenticatedAvatar from "./AuthenticatedAvatar";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function NavbarClient() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isGuide = session?.user?.role === "GUIDE";
  const { updateUser } = useUser();
  const pathname = usePathname();
  const [selectedRoute, setSelectedRoute] = useState(pathname);
  
  // Add a state to track if we're on a white background page
  const isWhiteBackground = ['/about-us', '/posts', '/login', '/become-guide'].includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (session?.user?.name && session?.user?.email) {
      updateUser(session.user.name, session.user.email);
    }
  }, [session, updateUser]);

  useEffect(() => {
    setSelectedRoute(pathname);
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about-us", label: "About" },
    { href: "/explore", label: "Explore" },
    { href: "/posts", label: "Discover" }
  ];

  return (
    <div>
      <nav
        className={`fixed w-full mx-auto top-0 left-[50%] translate-x-[-50%] z-20 transition-all duration-300 ${
          scrolled || isWhiteBackground
            ? "bg-white/30 backdrop-blur-md text-gray-900 shadow-md"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 relative z-50">
            <img src="/DomnerDesktop.png" className="h-8" alt="Domner Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg transition-colors duration-200 ${
                  scrolled || isWhiteBackground ? "hover:text-green-600" : "hover:text-green-300"
                } ${selectedRoute === link.href ? "text-green-400" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons and Mobile Menu Toggle */}
          <div className="flex items-center space-x-4 relative z-50">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {!isGuide && (
                  <Button
                    className={`hidden md:block ${
                      scrolled || isWhiteBackground
                        ? "bg-black-500 text-black"
                        : "bg-white/20 text-white"
                    }`}
                    asChild
                    variant="outline"
                  >
                    <Link href="/become-guide">Become a Guide</Link>
                  </Button>
                )}
                <AuthenticatedAvatar session={session} />
              </div>
            ) : (
              <Button
                className={`hidden md:block text-black ${
                  scrolled || isWhiteBackground ? "bg-green-500" : ""
                }`}
                asChild
                variant="outline"
              >
                <Link href="/login">Log in</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              data-menu-button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${scrolled || isWhiteBackground ? "text-gray-900" : "text-white"}`} />
              ) : (
                <Menu className={`w-6 h-6 ${scrolled || isWhiteBackground ? "text-gray-900" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        
        {/* Mobile Menu Content */}
        <div
          className={`absolute top-20 right-4 w-72 bg-white rounded-lg shadow-lg transform transition-all duration-300 ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-8 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-900 text-lg py-2 transition-colors duration-200 ${
                    selectedRoute === link.href
                      ? "text-green-600 font-medium"
                      : "hover:text-green-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {isLoggedIn && !isGuide && (
                <Link
                  href="/become-guide"
                  className="text-gray-900 text-lg py-2 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Guide
                </Link>
              )}
              
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="text-black text-lg py-2 hover:text-green-600 transition-colors duration-200 border-t border-gray-100 mt-2 pt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}