"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";

const Page = () => {
  const [bulanList, setBulanList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  useEffect(() => {
    const bulan = [
      { id: 1, namaBulan: "Januari" },
      { id: 2, namaBulan: "Februari" },
      { id: 3, namaBulan: "Maret" },
      { id: 4, namaBulan: "April" },
      { id: 5, namaBulan: "Mei" },
      { id: 6, namaBulan: "Juni" },
      { id: 7, namaBulan: "Juli" },
      { id: 8, namaBulan: "Agustus" },
      { id: 9, namaBulan: "September" },
      { id: 10, namaBulan: "Oktober" },
      { id: 11, namaBulan: "November" },
      { id: 12, namaBulan: "Desember" },
    ];
    setBulanList(bulan);

    const currentMonth = new Date().getMonth();
    setSelectedMonth(bulan[currentMonth].id);
    setSelectedYear(currentYear);
  }, []);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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
              <h1 className="text-base">Laporan Akhir</h1>
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
              <h1 className="text-base">Laporan Akhir</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <div className="container mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                LAPORAN AKHIR ( SALDO )
              </h2>

              <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
                    <select
                      className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {bulanList.map((bulan) => (
                        <option key={bulan.id} value={bulan.id}>
                          {bulan.namaBulan}
                        </option>
                      ))}
                    </select>
                    <select
                      className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                      Transaksi {bulanList.find(b => b.id === parseInt(selectedMonth))?.namaBulan} {selectedYear}
                    </h1>
                  </div>
                  <div className="flex justify-center space-x-4 mt-0 sm:mt-3 mr-0 sm:mr-10">
                    <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                      Cetak
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;