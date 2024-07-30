"use client";
import React, { useState } from "react";
import Link from "next/link";
import Pemasukan from "../organisasi/pemasukan/page";
import Pengeluaran from "./pengeluaran/page";
import Lapor from "../organisasi/lapor/page";
import Kwitansi from "../organisasi/kwitansi/page";

export default function Sanduka() {
  const [activeTab, setActiveTab] = useState("pemasukan");

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            Keuangan Organisasi
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
          <NavItem
            isActive={activeTab === "lapor"}
            onClick={() => handleTabChange("lapor")}
          >
            Laporan
          </NavItem>
          <NavItem
            isActive={activeTab === "kwitansi"}
            onClick={() => handleTabChange("kwitansi")}
          >
            Kwitansi
          </NavItem>
        </ul>
      </nav>

      {activeTab === "pemasukan" && <Pemasukan />}
      {activeTab === "pengeluaran" && <Pengeluaran />}
      {activeTab === "lapor" && <Lapor />}
      {activeTab === "kwitansi" && <Kwitansi />}
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
