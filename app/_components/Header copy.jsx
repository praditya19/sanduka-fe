"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const menus = [
  { label: "Layanan Kami", id: "layananKamiSection" },
  { label: "Galeri Kegiatan", id: "galeriSec" },
  { label: "Proses Pendaftaran", id: "daftarSec" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-4 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Floating Glass Container */}
        <div className="
          flex items-center justify-between
          px-6 py-3
          rounded-2xl

          bg-teal-600/80
          backdrop-blur-xl

          border border-white/20
          shadow-2xl shadow-black/20
        ">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/sanduka_bg_white.png"
              width={56}
              height={56}
              alt="logo"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={`#${menu.id}`}
                onClick={scrollToSection(menu.id)}
                className="
                  relative
                  text-white/90 font-medium
                  transition-all duration-300

                  hover:text-white
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0
                  after:bg-white after:rounded-full
                  after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {menu.label}
              </Link>
            ))}
          </div>

          {/* Login */}
          <div className="hidden md:block">
            <Link href="/sign-in">
              <Button className="
                rounded-full
                bg-white text-teal-700
                hover:bg-white/90
                px-6
              ">
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="
            md:hidden mt-3
            rounded-2xl
            bg-teal-600/90 backdrop-blur-xl
            border border-white/20
            shadow-xl
            p-4 space-y-2
          ">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={`#${menu.id}`}
                onClick={scrollToSection(menu.id)}
                className="
                  block px-4 py-2
                  rounded-lg
                  text-white
                  hover:bg-white/10
                "
              >
                {menu.label}
              </Link>
            ))}

            <Link href="/sign-in">
              <Button className="w-full mt-2 bg-white text-teal-700">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
// =====================================
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ChevronDown  } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Deteksi section aktif saat scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["layananKamiSection", "galeriSec", "daftarSec"];
      const currentSection = sections.find(section => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => setIsOpen(false);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
    handleClick();
  };

  const navItems = [
    { label: "Layanan Kami", id: "layananKamiSection" },
    { label: "Galeri Kegiatan", id: "galeriSec" },
    { label: "Proses Pendaftaran", id: "daftarSec" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <Image
                  src="/sanduka_bg_white.png"
                  width={60}
                  height={60}
                  alt="Sanduka Logo"
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Tengah */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-2 py-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={scrollToSection(item.id)}
                  className={`
                    relative px-5 py-2 rounded-full
                    text-sm font-medium
                    transition-all duration-200
                    ${activeSection === item.id
                      ? "text-white bg-white/20"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Login Button - Kanan */}
          
           <div className="ml-4">
              <Link href="/sign-in">
                <Button className={`
                  relative overflow-hidden group
                  rounded-full px-7 py-2.5
                  font-medium
                  transition-all duration-300
                `}>
                  {/* Efek hover shine */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  
                  <span className="relative">Login</span>
                  <LogIn  className="ml-2 h-4 w-4 " />
                </Button>
              </Link>
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              className="text-white p-2 hover:bg-white/20 rounded-full"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-teal-700 to-emerald-700 shadow-inner animate-slideDown">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={scrollToSection(item.id)}
                className={`
                  block px-4 py-3 rounded-lg
                  font-medium transition-colors
                  ${activeSection === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10"
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4">
              <Link href="/sign-in" onClick={handleClick}>
                <Button className="
                  w-full rounded-lg py-3
                  bg-white text-teal-600
                  hover:bg-gray-100
                  font-medium
                  flex items-center justify-center gap-2
                ">
                  <LogIn className="h-4 w-4" />
                  Masuk ke Akun
                </Button>
              </Link>
            </div>
            <div className="pt-4 px-2">
            <Link href="/sign-in" onClick={handleClick}>
              <Button className={`
                w-full rounded-xl py-3
                font-medium
                transition-all duration-300
                ${scrolled 
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-lg" 
                  : "bg-white text-teal-600 hover:bg-teal-50"
                }
              `}>
                Masuk ke Akun
              </Button>
            </Link>
            <p className={`text-xs text-center mt-3 ${scrolled ? "text-gray-500" : "text-white/70"}`}>
              Belum punya akun?{" "}
              <Link 
                href="/sign-up" 
                className={`font-medium underline ${scrolled ? "text-teal-600" : "text-white"}`}
                onClick={handleClick}
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;