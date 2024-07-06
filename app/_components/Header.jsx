"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function Header() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="p-5 shadow-md bg-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={"/"}>
            <Image src="/logo.png" alt="logo" width={150} height={100} />
          </Link>
        </div>
        <nav className="flex flex-col md:flex-row items-center gap-5 mt-4 md:mt-0">
          <a href="#profil" className="text-gray-700 font-semibold">
            Profil
          </a>
          <div className="relative">
            <button
              onClick={() => toggleDropdown("jaminan")}
              className="text-gray-700 font-semibold cursor-pointer flex items-center"
            >
              Jaminan
              <svg
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                  openDropdown === "jaminan" ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "jaminan" && (
              <div className="absolute left-0 mt-2 bg-white rounded-md shadow-lg z-10 p-3 w-48">
                <a href="#jaminan-1" className="block text-gray-600 py-1">
                  Submenu 1
                </a>
                <a href="#jaminan-2" className="block text-gray-600 py-1">
                  Submenu 2
                </a>
                <a href="#jaminan-3" className="block text-gray-600 py-1">
                  Submenu 3
                </a>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown("layanan")}
              className="text-gray-700 font-semibold cursor-pointer flex items-center"
            >
              Layanan
              <svg
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                  openDropdown === "layanan" ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openDropdown === "layanan" && (
              <div className="absolute left-0 mt-2 bg-white rounded-md shadow-lg z-10 p-3 w-48">
                <a href="#layanan-1" className="block text-gray-600 py-1">
                  Submenu 1
                </a>
                <a href="#layanan-2" className="block text-gray-600 py-1">
                  Submenu 2
                </a>
                <a href="#layanan-3" className="block text-gray-600 py-1">
                  Submenu 3
                </a>
              </div>
            )}
          </div>
          <a href="#kontak" className="text-gray-700 font-semibold">
            Kontak
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
