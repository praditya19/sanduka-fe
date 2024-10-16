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
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState([]);

  // Fungsi untuk memanggil data dari API berdasarkan tahun yang dipilih
  const fetchData = async (year) => {
    try {
      const response = await GlobalApi.getLaporanPengeluaranTahunan(year); // Panggil API dengan tahun yang dipilih
      setData(response); // Asumsi response berisi array data dari API
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Gunakan useEffect untuk set default bulan dan tahun sesuai waktu sekarang
  useEffect(() => {
    const currentDate = new Date();

    // Mendapatkan bulan saat ini (0 = Januari, jadi tambahkan 1 untuk membuatnya lebih manusiawi)
    const currentBulan = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");

    // Mendapatkan tahun saat ini
    const currentYear = currentDate.getFullYear().toString();

    // Set bulan dan tahun saat ini sebagai default
    setSelectedBulan(currentBulan);
    setSelectedYear(currentYear);

    // Lakukan fetch data untuk bulan dan tahun saat ini
    fetchData(currentBulan, currentYear);
  }, []);

  // Fetch data ketika tahun berubah atau komponen pertama kali di-mount
  useEffect(() => {
    if (selectedYear) {
      fetchData(selectedYear); // Panggil fetch data dengan tahun yang dipilih
    }
  }, [selectedYear]); // Akan dijalankan setiap kali selectedYear berubah

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value); // Update tahun yang dipilih
  };

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const formatRupiah = (value) => {
    // Ubah value menjadi integer jika ada koma atau titik
    const numberValue = parseInt(value.toString().replace(/,/g, ""));

    // Format angka ke dalam bentuk rupiah
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    // Temporarily replace body content with table content
    document.body.innerHTML = printContent.innerHTML;

    window.print(); // Trigger the print dialog

    // Restore the original content after printing
    document.body.innerHTML = originalContent;
    window.location.reload(); // Refresh the page to re-apply React events
  };

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
              <h1 className="text-base">
                Laporan Pengeluaran Tahunan Organisasi
              </h1>
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
              <h1 className="text-base">
                Laporan Pengeluaran Tahunan Organisasi
              </h1>
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
                LAPORAN PENGELUARAN TAHUNAN
              </h2>

              <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
                    <select
                      className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                      id="tahun"
                      name="tahun"
                      value={selectedYear}
                      onChange={handleYearChange} // Pastikan handler untuk tahun diaktifkan
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
                      LAPORAN PENGELUARAN TAHUN {selectedYear}
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
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-sm text-black uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                    <tr className="bg-gray-200 text-black text-center">
                      <th className="px-6 py-3 text-sm">No</th>
                      <th className="px-6 py-3 text-sm">Bulan</th>
                      <th className="px-6 py-3 text-sm">Pemasukan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data && data.length > 0 ? (
                      data.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b text-black text-center"
                        >
                          <td className="px-6 py-4 text-sm">{index + 1}</td>
                          <td className="px-6 py-4 text-sm">{item.bulan}</td>
                          <td className="px-6 py-4 text-sm">
                            {formatRupiah(item.pengeluaran)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-center text-sm"
                        >
                          Tidak ada data yang tersedia.
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
