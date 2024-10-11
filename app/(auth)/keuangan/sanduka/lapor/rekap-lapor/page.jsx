"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dataLapor, setDataLapor] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [selectedYear, setSelectedYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GlobalApi.getRekapLaporSanduka();
        const fetchedData = response || []; // Gunakan response.data jika API mengembalikan data di bawah `data`
        console.log("Fetched Data:", fetchedData);
        setDataLapor(fetchedData); // Store full data
      } catch (error) {
        console.error("Error fetching data lapor:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data); // Assuming the response data is an array
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data); // Simpan data bulan dari API ke state
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan(); // Panggil fungsi ketika komponen pertama kali dimuat
  }, []);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  // Filter
  // Fungsi untuk menangani perubahan pilihan cabang
  const handleChange = (e) => {
    setSelectedCabang(e.target.value);
    setSelectedBulan(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

   // Memfilter data berdasarkan cabang dan bulan yang dipilih
   const filteredDataLapor = dataLapor.filter((item) => {
    const isCabangMatch = selectedCabang ? item.Cabang === selectedCabang : true;

    // Ekstrak bulan dan tahun dari item.Date_lapor yang berformat 'DD-MM-YYYY'
    let monthFromData = null;
    let yearFromData = null;

    if (item.Date_lapor) {
      const dateParts = item.Date_lapor.split("-"); // Memisahkan berdasarkan '-'
      if (dateParts.length === 3) {
        monthFromData = dateParts[1]; // Ambil bagian bulan (MM)
        yearFromData = dateParts[2]; // Ambil bagian tahun (YYYY)
      }
    }

    // Cek jika bulan dari data cocok dengan bulan yang dipilih
    const isBulanMatch = selectedBulan ? monthFromData === selectedBulan.padStart(2, '0') : true;

    // Cek jika tahun dari data cocok dengan tahun yang dipilih
    const isYearMatch = selectedYear ? yearFromData === selectedYear : true;

    return isCabangMatch && isBulanMatch && isYearMatch;
  });

  const handlePrint = () => {
    const printContent = document.getElementById("table-to-print").innerHTML; // Ambil elemen tabel
    const originalContent = document.body.innerHTML; // Simpan konten asli halaman

    // Ganti konten halaman dengan hanya tabel
    document.body.innerHTML = printContent;

    window.print(); // Panggil fungsi cetak

    // Kembalikan konten halaman ke aslinya setelah mencetak
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload halaman untuk memastikan tampilan kembali normal
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
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
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="bg-teal-700 p-4 flex flex-col sm:flex-row items-center justify-between mt-5">
              <h1 className="text-white font-bold mb-4 sm:mb-0">
                REKAP LAPOR SANDUKA
              </h1>
              <div className="flex items-end ml-auto sm:hidden">
                <button className="text-white">
                  <FontAwesomeIcon icon={faFilter} size="lg" />
                </button>
              </div>
              <div
                className={` top-0 right-0 w-64 bg-teal-700 p-4 space-y-2 sm:space-y-0 sm:space-x-2 items-center sm:flex ${
                  showFilters ? "block" : "hidden"
                } sm:relative sm:w-auto sm:p-0 sm:bg-transparent`}
              >
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  id="cabang"
                  name="cabang"
                  value={selectedCabang}
                  onChange={handleChange}
                >
                  <option value="">-- Cabang --</option>
                  {cabangList.map((cabang) => (
                    <option key={cabang.id} value={cabang.kecamatan}>
                      {cabang.kecamatan}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  id="bulan"
                  name="bulan"
                  value={selectedBulan}
                  onChange={handleChange}
                >
                  <option value="">-- Bulan --</option>
                  {bulanList.map((bulan) => (
                    <option key={bulan.angkaBulan} value={bulan.angkaBulan}>
                      {bulan.namaBulan}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  id="tahun"
          name="tahun"
          value={selectedYear}
          onChange={handleYearChange}
                >
                  <option value="">-- Tahun --</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  value={filterStatus}
                  // onChange={handleFilterChange}
                >
                  <option value="">-- Status --</option>
                  <option value="Belum">Belum</option>
                  <option value="Sudah">Terima</option>
                </select>
                <Button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full sm:w-auto"
                  onClick={handlePrint}
                >
                  Cetak
                </Button>
              </div>
            </div>
            <div id="table-to-print" className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="py-2 px-3 text-center">No</th>
                    <th className="py-2 px-3 text-center">Date lapor</th>
                    <th className="py-2 px-3 text-center">Data Meninggal</th>
                    <th className="py-2 px-3 text-center">Cabang</th>
                    <th className="py-2 px-3 text-center">Keterangan</th>
                    <th className="py-2 px-3 text-center">Diterimakan</th>
                    <th className="py-2 px-3 text-center">Action</th>
                    <th className="py-2 px-3 text-center">Bukti</th>
                    <th className="py-2 px-3 text-center">Kwitansi</th>
                  </tr>
                </thead>
                <tbody>
            {Array.isArray(filteredDataLapor) && filteredDataLapor.length > 0 ? (
              filteredDataLapor.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-3 text-center">{index + 1}</td>
                  <td className="py-2 px-3">
                    {item.Date_lapor ? item.Date_lapor : "N/A"}
                  </td>
                  <td className="py-2 px-3">{item.Data_Meninggal}</td>
                  <td className="py-2 px-3 text-center">{item.Cabang}</td>
                  <td className="py-2 px-3 text-center">{item.Keterangan}</td>
                  <td className="py-2 px-3 text-center">
                    Diterimakan (Sesuaikan jika ada)
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <button className="bg-blue-500 text-white p-2 rounded mb-2">
                      Kwitansi
                    </button>
                    <button className="bg-blue-500 text-white p-2 rounded">
                      Edit
                    </button>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button className="bg-gray-200 p-2 rounded border">
                      View
                    </button>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="file"
                      className="hidden"
                      id={`file-upload-${index}`}
                    />
                    <label
                      htmlFor={`file-upload-${index}`}
                      className="bg-green-500 text-white p-2 rounded cursor-pointer"
                    >
                      Browse...
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-2">
                  No data available
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
  );
};

export default Page;
