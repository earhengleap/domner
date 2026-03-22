"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import AuthenticatedAvatar from "./AuthenticatedAvatar";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { hasGuideAccess } from "@/lib/access";

export default function NavbarClient() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isGuide = hasGuideAccess(session?.user);
  const { updateUser } = useUser();
  const pathname = usePathname();
  const [selectedRoute, setSelectedRoute] = useState(pathname);
  
  // Global transparent-to-solid transition for all routes
  const useTransparentNav = !scrolled;

  useEffect(() => {
    setMounted(true);
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          !useTransparentNav
            ? "bg-white/90 backdrop-blur-lg text-[#A18167] shadow-lg py-2"
            : "bg-transparent text-white py-4"
        }`}
      >
        {/* Subtle top gradient for legibility when transparent */}
        {useTransparentNav && (
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/40 to-transparent -z-10 h-32 pointer-events-none" />
        )}
        
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 relative z-50 transition-transform duration-300 hover:scale-105">
            <img src="/DomnerDesktop.png" className="h-8 md:h-10 transition-all duration-300" alt="Domner Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg transition-all duration-300 relative group drop-shadow-md ${
                  !useTransparentNav
                    ? "text-[#A18167] hover:text-[#292929]"
                    : "text-white hover:text-white/80"
                } ${selectedRoute === link.href ? "font-bold" : ""}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 ${
                  !useTransparentNav ? "bg-[#A18167]" : "bg-white"
                } group-hover:w-full ${selectedRoute === link.href ? "w-full" : ""}`}></span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons and Mobile Menu Toggle */}
          <div className="flex items-center space-x-4 relative z-50">
            {mounted && (
              <>
                {isLoggedIn ? (
                  <div className="flex items-center space-x-4">
                    {!isGuide && (
                      <Button
                        className={`hidden md:flex transition-all duration-300 ${
                          !useTransparentNav
                            ? "border-[#A18167] text-[#A18167] hover:bg-[#A18167] hover:text-white"
                            : "bg-white/10 backdrop-blur-md text-white border-white hover:bg-white/20"
                        }`}
                        asChild
                        variant="outline"
                      >
                        <Link href="/become-guide">Become a Guide</Link>
                      </Button>
                    )}
                    <div className="transition-transform duration-300 hover:scale-110">
                      <AuthenticatedAvatar session={session} />
                    </div>
                  </div>
                ) : (
                  <Button
                    className={`hidden md:block transition-all duration-300 shadow-md ${
                      !useTransparentNav
                        ? "border-[#A18167] text-[#A18167] hover:bg-[#A18167] hover:text-white"
                        : "bg-white/10 backdrop-blur-md text-white border-white hover:bg-white/20"
                    }`}
                    asChild
                    variant="outline"
                  >
                    <Link href={pathname === "/login" ? "/register" : "/login"}>
                      {pathname === "/login" ? "Sign Up" : "Log in"}
                    </Link>
                  </Button>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              data-menu-button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                !useTransparentNav ? "hover:bg-gray-100 text-[#A18167]" : "hover:bg-white/10 text-white"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
                  className={`text-[#A18167] text-lg py-2 transition-colors duration-200 ${
                    selectedRoute === link.href
                      ? "text-[#292929] font-medium underline"
                      : "hover:text-[#292929]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {mounted && (
                <>
                  {isLoggedIn && !isGuide && (
                    <Link
                      href="/become-guide"
                      className="text-[#A18167] text-lg py-2 hover:text-[#292929] transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Become a Guide
                    </Link>
                  )}
                  
                  {!isLoggedIn && (
                    <Link
                      href="/login"
                      className="text-[#A18167] text-lg py-2 hover:text-[#292929] transition-colors duration-200 border-t border-gray-100 mt-2 pt-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
