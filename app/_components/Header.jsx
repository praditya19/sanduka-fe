"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"}>
              <Image src="/sanduka.png" width={170} height={170} alt="logo" />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pencarian Anggota Sanduka
              </Link>

              <Link
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Syarat dan Ketentuan
              </Link>

              <Link
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Kontak
              </Link>

              <Link href={"/sign-in"} className="text-blue-500">
                {" "}
                <Button>Login</Button>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
            </button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="#"
            className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
          >
            Pencarian Anggota Sanduka
          </Link>

          <Link
            href="#"
            className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
          >
            Syarat dan Ketentuan
          </Link>

          <Link
            href="#"
            className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
          >
            Kontak
          </Link>

          <Link href={"/sign-in"} className="text-blue-500">
            {" "}
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
