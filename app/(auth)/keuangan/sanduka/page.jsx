"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pemasukan from "../sanduka/pemasukan/page";
import Pengeluaran from "./pengeluaran/page";
import Laporan from "../sanduka/laporan/page";
import { useRouter } from "next/navigation";
import { faArrowLeft, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Sanduka() {
  const [activeTab, setActiveTab] = useState("pemasukan");
  const [isOpenDropdown, setIsOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = (menu) => {
    setIsOpenDropdown((prevState) => (prevState === menu ? null : menu));
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName !== "lapor") {
      setIsOpenDropdown(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setIsOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div>
      <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
        <div className="container mx-auto flex items-center justify-between">
      
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="sm"
              onClick={handleBackClick}
              className="cursor-pointer mr-2"
            />
            <h1 className="text-base">Keuangan Data Utama</h1>
          </div>

         
          <nav className="hidden md:flex">
            <ul className="flex space-x-6 text-base">
              <li className="cursor-pointer">
                <Link href="/keuangan/home">Home</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/data-utama">Data Utama</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/sanduka">Sanduka</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/organisasi">Organisasi</Link>
              </li>
            </ul>
          </nav>

      
          <button className="md:hidden ml-auto" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>

       
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-teal-700 text-white">
            <ul className="flex flex-col space-y-2 p-4">
              <li className="cursor-pointer">
                <Link href="/keuangan/home">Home</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/data-utama">Data Utama</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/sanduka">Sanduka</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/keuangan/organisasi">Organisasi</Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6">
        <nav className="container mt-12">
          <ul className="flex flex-wrap space-x-4 md:space-x-6">
            <NavItem
              isActive={activeTab === "pemasukan"}
              onClick={() => handleTabChange("pemasukan")}
            >
              Pemasukan
            </NavItem>
            <NavItem
              isActive={activeTab === "pengeluaran"}
              onClick={() => handleTabChange("pengeluaran")}
            >
              Pengeluaran
            </NavItem>
            <li className="relative">
              <button
                onClick={() => toggleDropdown("lapor")}
                className={`text-gray-700 hover:text-gray-900 rounded-md text-base font-medium ${
                  activeTab === "lapor" || isOpenDropdown === "lapor"
                    ? "text-green-700 font-bold"
                    : ""
                }`}
                aria-haspopup="true"
                aria-expanded={isOpenDropdown === "lapor"}
              >
                Lapor
              </button>
              {isOpenDropdown === "lapor" && (
                <ul className="dropdown-menu absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/keuangan/sanduka/lapor/lapor-cabang">
                      Lapor dari cabang
                    </Link>
                  </li>
                  <li className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <Link href="/keuangan/sanduka/lapor/rekap-lapor">
                      Rekap lapor
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <NavItem
              isActive={activeTab === "laporan"}
              onClick={() => handleTabChange("laporan")}
            >
              Laporan
            </NavItem>
          </ul>
        </nav>

        {activeTab === "pemasukan" && <Pemasukan />}
        {activeTab === "pengeluaran" && <Pengeluaran />}
        {activeTab === "laporan" && <Laporan />}
      </div>
    </div>
  );
}

function NavItem({ children, isActive, onClick, href }) {
  const activeClass = isActive ? "text-green-700 font-bold" : "";

  if (href) {
    return (
      <li>
        <Link href={href} className={`cursor-pointer ${activeClass}`}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li className={`cursor-pointer ${activeClass}`} onClick={onClick}>
      {children}
    </li>
  );
}