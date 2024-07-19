"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setIsOpenDropdown((prevState) => (prevState === menu ? null : menu));
  };

  const handleClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setIsOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Image src="/sanduka.png" width={170} height={170} alt="logo" />
            </Link>
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
          <div className="hidden md:block">
            <ul className="flex space-x-4">
              <li className="relative dropdown">
                <button
                  onClick={() => toggleDropdown("anggota")}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Anggota
                </button>
                {isOpenDropdown === "anggota" && (
                  <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/data-anggota">Cari Anggota</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/data-anggota">Data Anggota</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/rekap-anggota">Rekap Anggota</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/status-anggota">Status Anggota</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="relative dropdown">
                <button
                  onClick={() => toggleDropdown("laporan")}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Laporan
                </button>
                {isOpenDropdown === "laporan" && (
                  <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/statistik">Lapor Anggota Meninggal</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/statistik">Statistik</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/rekap-meninggal">Rekap Meninggal</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/history-data">History Data</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="relative dropdown">
                <button
                  onClick={() => toggleDropdown("lainnya")}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Lainnya
                </button>
                {isOpenDropdown === "lainnya" && (
                  <ul className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/bantuan">Bantuan</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/ketentuan">Ketentuan</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/keuangan">Keuangan</Link>
                    </li>
                    <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/pensiun">Pensiun</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="relative text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                <Link href="/kontak">Kontak</Link>
              </li>
              <li className="relative">
                <Link href="/sign-in" className="text-blue-500">
                  <Button>Login</Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <ul className="flex flex-col space-y-1">
            <li className="relative dropdown">
              <button
                onClick={() => toggleDropdown("anggota")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Anggota
              </button>
              {isOpenDropdown === "anggota" && (
                <ul className="relative mt-2 w-full bg-white border rounded-md shadow-lg z-50">
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/data-anggota">Cari Anggota</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/data-anggota">Data Anggota</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/rekap-anggota">Rekap Anggota</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/status-anggota">Status Anggota</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="relative dropdown">
              <button
                onClick={() => toggleDropdown("laporan")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Laporan
              </button>
              {isOpenDropdown === "laporan" && (
                <ul className="relative mt-2 w-full bg-white border rounded-md shadow-lg z-50">
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <Link href="/statistik">Lapor Anggota Meninggal</Link>
                    </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/statistik">Statistik</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/rekap-meninggal">Rekap Meninggal</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/history-data">History Data</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="relative dropdown">
              <button
                onClick={() => toggleDropdown("lainnya")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Lainnya
              </button>
              {isOpenDropdown === "lainnya" && (
                <ul className="relative mt-2 w-full bg-white border rounded-md shadow-lg z-50">
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/bantuan">Bantuan</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/ketentuan">Ketentuan</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/keuangan">Keuangan</Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/pensiun">Pensiun</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="relative text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              <Link href="/kontak" onClick={handleClick}>
                Kontak
              </Link>
            </li>
            <li className="relative">
              <Link
                href={"/sign-in"}
                className="text-blue-500"
                onClick={handleClick}
              >
                <Button>Login</Button>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
