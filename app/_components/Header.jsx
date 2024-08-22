"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    setIsOpen(false);
  };

  const scrollToSection = (sectionId) => (event) => {
    event.preventDefault(); // Prevent default link behavior
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    handleClick(); // Close the menu if it's open (for mobile view)
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src={isScrolled ? "/sanduka.png" : "/sanduka_bg_white.png"}
                width={120}
                height={120}
                alt="logo"
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="#layananKamiSection"
              onClick={scrollToSection("layananKamiSection")}
              className={`text-base ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Layanan Kami
            </Link>
            <Link
              href="#galeriSec"
              onClick={scrollToSection("galeriSec")}
              className={`text-base ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Galeri Kegiatan
            </Link>
            <Link
              href="#daftarSec"
              onClick={scrollToSection("daftarSec")}
              className={`text-base ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Proses Pendaftaran
            </Link>
            <div className="border-r border-gray-700 h-6 mx-4"></div>
            <Link
              href={"/sign-in"}
              className={`transition-all duration-300 ${
                isScrolled ? "text-white" : "text-white"
              }`}
            >
              <Button
                className={`transition-all duration-300 ${
                  isScrolled
                    ? "bg-teal-400 text-white hover:bg-teal-500"
                    : "bg-transparent text-white hover:bg-teal-400"
                }`}
              >
                Login
              </Button>
            </Link>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isScrolled ? "bg-transparent" : "bg-transparent"
              } ${
                isScrolled ? "text-black" : "text-white"
              } hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <ul className="flex flex-col space-y-1">
            <li className="relative">
              <Link
                href="#layananKamiSection"
                onClick={scrollToSection("layananKamiSection")}
                className={`text-base ${
                  isScrolled ? "text-gray-900" : "text-white"
                } hover:bg-gray-200 hover:text-gray-900 block px-4 py-2 rounded-md`}
              >
                Layanan Kami
              </Link>
            </li>
            <li className="relative">
              <Link
                href="#galeriSec"
                onClick={scrollToSection("galeriSec")}
                className={`text-base ${
                  isScrolled ? "text-gray-900" : "text-white"
                } hover:bg-gray-200 hover:text-gray-900 block px-4 py-2 rounded-md`}
              >
                Galeri Kegiatan
              </Link>
            </li>
            <li className="relative">
              <Link
                href="#daftarSec"
                onClick={scrollToSection("daftarSec")}
                className={`text-base ${
                  isScrolled ? "text-gray-900" : "text-white"
                } hover:bg-gray-200 hover:text-gray-900 block px-4 py-2 rounded-md`}
              >
                Proses Pendaftaran
              </Link>
            </li>
            <li className="relative">
              <Link
                href={"/sign-in"}
                className={`transition-all duration-300 ${
                  isScrolled ? "text-white" : "text-white"
                }`}
                onClick={handleClick}
              >
                <Button
                  className={`transition-all duration-300 ${
                    isScrolled
                      ? "bg-teal-400 text-white hover:bg-teal-500"
                      : "bg-transparent text-white hover:bg-teal-400"
                  }`}
                >
                  Login
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
