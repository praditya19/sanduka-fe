"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pemasukan from "../sanduka/pemasukan/page";
import Pengeluaran from "./pengeluaran/page";
import Kalender from "../data-utama/kalender/page";
import { Button } from "@/components/ui/button";

export default function Sanduka() {
  const [activeTab, setActiveTab] = useState("pemasukan");
  const [isOpenDropdown, setIsOpenDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div>
      <header className="bg-teal-700 text-white p-4 md:p-6 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-lg md:text-lg font-extrabold md:mb-0">
            Keuangan Data Utama
          </h1>
          <Button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
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
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </Button>
          <nav
            className={`md:flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
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
        </div>
      </header>

      <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6">
        <nav className="container mt-16">
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
              isActive={activeTab === "kalender"}
              onClick={() => handleTabChange("kalender")}
            >
              Laporan
            </NavItem>
          </ul>
        </nav>

        {activeTab === "pemasukan" && <Pemasukan />}
        {activeTab === "pengeluaran" && <Pengeluaran />}
        {activeTab === "kalender" && <Kalender />}
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
