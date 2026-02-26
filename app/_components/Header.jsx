"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import SignInModal from "./SignInModal";


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Berita", href: "/berita" },
    { label: "Event", href: "/event" },
    { label: "Sanduka", href: "/sanduka-home" },
    { label: "Biro Perjalanan", href: "/biro-perjalanan" },
    { label: "Bantuan", href: "/bantuan/all" },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo_pgri_jepara.svg"
              width={60}
              height={60}
              alt="Sanduka Logo"
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-5 py-2 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${isActive(item.href)
                      ? "bg-white/25 text-white"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={() => setShowSignIn(true)}
            className="
              relative overflow-hidden group
              rounded-full px-7 py-2.5
              font-medium
              bg-white text-teal-600
              hover:bg-white
              border border-white/60
              shadow-md shadow-black/10
              transition-all duration-300
              hover:scale-[1.04]
              active:scale-[0.97]
            "
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center">
              Login
              <LogIn className="ml-2 h-4 w-4" />
            </span>
          </Button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-full hover:bg-white/20"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-teal-700 to-emerald-700 shadow-inner">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg font-medium
                  ${isActive(item.href)
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10"
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowSignIn(true);
              }}
              className="flex items-center px-4 py-3 rounded-lg font-medium text-white/90 hover:bg-white/10 w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </button>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
      />
    </nav>
  );
};

export default Header;
