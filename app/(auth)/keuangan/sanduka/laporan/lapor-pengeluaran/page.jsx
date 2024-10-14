"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const tableRef = useRef();
  const [selectedBulan, setSelectedBulan] = useState("");
  const [bulanList, setBulanList] = useState([]);
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [selectedYear, setSelectedYear] = useState("");
  const [laporanData, setLaporanData] = useState([]);

  // Fungsi untuk fetch data
  const fetchData = async () => {
    if (selectedBulan && selectedYear) {
      // Format bulan dan tahun
      const bulanFormatted = `${selectedYear}-${selectedBulan.padStart(
        2,
        "0"
      )}`; // Pastikan bulan selalu dalam format dua digit
      try {
        const response = await GlobalApi.getLaporanPengeluaran(bulanFormatted);
        // Ambil dataTransaksi dari response dan simpan ke state
        setLaporanData(response.dataTransaksi); // Simpan data ke state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  // Panggil fetchData saat bulan atau tahun berubah
  useEffect(() => {
    if (selectedBulan && selectedYear) {
      fetchData();
    }
  }, [selectedBulan, selectedYear]);

  // useEffect untuk fetch data bulan
  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data);
      } catch (error) {
        console.error("Error fetching bulan data:", error);
      }
    };

    fetchBulan();
  }, []);

  // Handle perubahan bulan
  const handleBulanChange = (e) => {
    const selectedBulan = e.target.value;
    setSelectedBulan(selectedBulan);
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYear(selectedYear);
  };

  // Data untuk tahun (years range)
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

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
              <h1 className="text-base">Laporan Pengeluaran Organisasi</h1>
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
              <h1 className="text-base">Laporan Pengeluaran Sanduka</h1>
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
              <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                LAPORAN PENGELUARAN Sanduka
              </h2>

              <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
                    <select
                      className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      value={selectedBulan}
                      onChange={handleBulanChange}
                    >
                      <option value="">-- Bulan --</option>
                      {bulanList.map((bulan) => (
                        <option key={bulan.angkaBulan} value={bulan.angkaBulan}>
                          {bulan.namaBulan}
                        </option>
                      ))}
                    </select>
                    <select
                      className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      id="tahun"
                      name="tahun"
                      value={selectedYear}
                      onChange={handleYearChange} // Pastikan handler untuk tahun diaktifkan
                    >
                      <option value="">-- Tahun --</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                      Transaksi {selectedBulan} {selectedYear}
                    </h1>
                  </div>
                  <div className="flex justify-center space-x-4 mt-0 sm:mt-3 mr-0 sm:mr-10">
                    <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                      Cetak
                    </Button>
                  </div>
                </div>
              </div>
              <div ref={tableRef} className="overflow-x-auto">
                <table className="min-w-full text-sm text-center text-gray-500 dark:text-gray-400">
                  <thead className="text-sm text-black uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                        No
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                        Tanggal Transaksi
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                        Uraian
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanData.length > 0 ? (
                      laporanData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b text-black text-center"
                        >
                          <td className="px-6 py-4 text-sm">{index + 1}</td>
                          <td className="px-6 py-4 text-sm">
                            {item.tanggalTransaksi}
                          </td>
                          <td className="px-6 py-4 text-sm">{item.uraian}</td>
                          <td className="px-6 py-4 text-sm">{item.nominal}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-4 text-sm text-center text-gray-500"
                        >
                          Data tidak tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
