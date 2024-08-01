"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pemasukan from "../sanduka/pemasukan/page";
import Pengeluaran from "./pengeluaran/page";
import Derap from "../data-utama/derap/page";
import Kalender from "../data-utama/kalender/page";

export default function Sanduka() {
  const [activeTab, setActiveTab] = useState("pemasukan");
  const [isOpenDropdown, setIsOpenDropdown] = useState(null);

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
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Keuangan Data Utama
          </h1>
          <nav className="mt-4">
            <ul className="flex flex-wrap space-x-4 md:space-x-6">
              <NavItem href="/keuangan/home">Home</NavItem>
              <NavItem href="/keuangan/data-utama">Data Utama</NavItem>
              <NavItem href="/keuangan/sanduka">Sanduka</NavItem>
              <NavItem href="/keuangan/organisasi">Organisasi</NavItem>
            </ul>
          </nav>
        </div>
      </header>
      <nav className="container mt-4">
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
