"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";

function Kwitansi() {
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
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Kwitansi</h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Kwitansi</h1>
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
          <div className="container mx-auto p-6 mt-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col space-y-2">
                  <select className="border border-gray-300 rounded p-2">
                    <option>-- Cabang --</option>
                    {/* Add other options as needed */}
                  </select>
                  <select className="border border-gray-300 rounded p-2">
                    <option>Januari</option>
                    {/* Add other months as needed */}
                  </select>
                  <select className="border border-gray-300 rounded p-2">
                    <option>2021</option>
                    {/* Add other years as needed */}
                  </select>
                  <select className="border border-gray-300 rounded p-2">
                    <option>IURAN PGRI</option>
                    <option>DERAP</option>
                    <option>DASPEN</option>
                    <option>KALENDER</option>
                    {/* Add other years as needed */}
                  </select>
                </div>
                <div className="flex flex-col items-center">
                  <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4" />
                  <div className="text-center">
                    <p>Persatuan Guru Republik Indonesia (PGRI)</p>
                    <p>Kabupaten Jepara</p>
                    <p>Jl. Bata Putih, Demaan VI, Demaan,</p>
                    <p>Kec. Jepara, Kabupaten Jepara, Jawa Tengah 59419</p>
                    <p>Telp. 0291 592 479 email: pgrijepara@gmail.com</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <p>Date transaksi :</p>
                <p>No. Kwitansi :</p>
                <p>Pembayaran</p>
                <p>1.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Kwitansi;
