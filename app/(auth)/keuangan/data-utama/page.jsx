"use client";
import React, { useState } from "react";
import IuranPgri from "../data-utama/iuran-pgri/page";
import Daspen from "../data-utama/daspen/page";
import Derap from "../data-utama/derap/page";
import Kalender from "../data-utama/kalender/page";

export default function DataUtama() {
  const [activeTab, setActiveTab] = useState("iuran-pgri");

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

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
              <NavItem href="#">Sanduka</NavItem>
              <NavItem href="#">Organisasi</NavItem>
            </ul>
          </nav>
        </div>
      </header>
      <nav className="container mt-4">
        <ul className="flex flex-wrap space-x-4 md:space-x-6">
          <NavItem
            isActive={activeTab === "iuran-pgri"}
            onClick={() => handleTabChange("iuran-pgri")}
          >
            Iuran PGRI
          </NavItem>
          <NavItem
            isActive={activeTab === "daspen"}
            onClick={() => handleTabChange("daspen")}
          >
            Daspen
          </NavItem>
          <NavItem
            isActive={activeTab === "derap"}
            onClick={() => handleTabChange("derap")}
          >
            Derap
          </NavItem>
          <NavItem
            isActive={activeTab === "kalender"}
            onClick={() => handleTabChange("kalender")}
          >
            Kalender
          </NavItem>
        </ul>
      </nav>

      {activeTab === "iuran-pgri" && <IuranPgri />}
      {activeTab === "daspen" && <Daspen />}
      {activeTab === "derap" && <Derap />}
      {activeTab === "kalender" && <Kalender />}
    </div>
  );
}

function NavItem({ children, isActive, onClick }) {
  const activeClass = isActive ? "text-green-700 font-bold" : "";

  return (
    <li className={`cursor-pointer ${activeClass}`} onClick={onClick}>
      {children}
    </li>
  );
}
