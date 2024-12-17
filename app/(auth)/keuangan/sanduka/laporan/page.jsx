"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import Link from "next/link";

export default function Lapor() {
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Laporan</h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Laporan</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="container mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                LAPORAN SANDUKA
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <NavItem href="/keuangan/sanduka/laporan/target-realisasi">
                  Target dan Realisasi
                </NavItem>
                <NavItem href="/keuangan/sanduka/laporan/lapor-pengeluaran">
                  Laporan Pengeluaran
                </NavItem>
                <NavItem href="/keuangan/sanduka/laporan/lapor-pemasukan">
                  Laporan Pemasukan
                </NavItem>
                <NavItem href="/keuangan/sanduka/laporan/laporan-pengeluaran-tahunan">
                  Laporan Pengeluaran Tahunan
                </NavItem>
                <NavItem href="/keuangan/sanduka/laporan/laporan-pemasukan-tahunan">
                  Laporan Pemasukan Tahunan
                </NavItem>
                <NavItem href="/keuangan/sanduka/laporan/laporan-akhir">
                  Laporan Akhir (Saldo)
                </NavItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ children, href }) {
  return (
    <Link
      href={href}
      className="bg-teal-600 text-white font-bold py-4 rounded flex items-center justify-center px-4 transform transition-transform duration-300 hover:scale-105"
    >
      {children}
    </Link>
  );
}
