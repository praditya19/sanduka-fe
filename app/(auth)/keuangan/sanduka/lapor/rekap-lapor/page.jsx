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
  const [dataLaporDiterima, setDataLaporDiterima] = useState([]);
  const [dataLaporBelum, setDataLaporBelum] = useState([]);
  const [displayedDataLapor, setDisplayedDataLapor] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [selectedYear, setSelectedYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Diterima
  useEffect(() => {
    const fetchDataDiterima = async () => {
      try {
        const response = await GlobalApi.getRekapLaporDiterima();
        const fetchedDataDiterima = response || []; // Gunakan response.data jika API mengembalikan data di bawah `data`
        setDataLaporDiterima(fetchedDataDiterima); // Store data Diterima
      } catch (error) {
        console.error("Error fetching data lapor diterima:", error);
      }
    };

    fetchDataDiterima();
  }, []);
  // Belum Diterima
  useEffect(() => {
    const fetchDataBelum = async () => {
      try {
        const response = await GlobalApi.getRekapLaporBelom();
        const fetchedDataBelum = response || []; // Gunakan response.data jika API mengembalikan data di bawah `data`
        setDataLaporBelum(fetchedDataBelum); // Store data Belum
      } catch (error) {
        console.error("Error fetching data lapor belum:", error);
      }
    };

    fetchDataBelum();
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
  const handleCabangChange = (e) => {
    setSelectedCabang(e.target.value);
  };

  const handleBulanChange = (e) => {
    setSelectedBulan(e.target.value); // Angka bulan
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value); // Menyimpan nilai tahun yang dipilih
  };

  useEffect(() => {
    if (filterStatus === "Terima") {
      setDisplayedDataLapor(dataLaporDiterima); // Set data diterima
    } else if (filterStatus === "Belum") {
      setDisplayedDataLapor(dataLaporBelum); // Set data belum
    } else {
      setDisplayedDataLapor([]); // Kosongkan jika tidak ada filter
    }
  }, [filterStatus, dataLaporDiterima, dataLaporBelum]);

  useEffect(() => {
    // Menggabungkan semua filter status, cabang, bulan, dan tahun
    const filterData = () => {
      let filteredData = [];
  
      if (filterStatus === "Terima") {
        filteredData = dataLaporDiterima;
      } else if (filterStatus === "Belum") {
        filteredData = dataLaporBelum;
      } else {
        filteredData = [...dataLaporDiterima, ...dataLaporBelum]; // Tampilkan semua data jika filterStatus kosong
      }
  
      const finalFilteredData = filteredData.filter((item) => {
        // Filter Cabang
        const isCabangMatch = selectedCabang ? item.Cabang === selectedCabang : true;
  
        // Ekstrak tanggal lapor
        let monthFromData = null;
        let yearFromData = null;
        if (item.Date_lapor) {
          const dateMatch = item.Date_lapor.match(/\b\d{2}-\d{2}-\d{4}\b/);
          if (dateMatch) {
            const dateParts = dateMatch[0].split("-");
            monthFromData = dateParts[1]; // Bulan
            yearFromData = dateParts[2];  // Tahun
          }
        }
  
        // Filter Bulan dan Tahun
        const isBulanMatch = selectedBulan ? monthFromData === selectedBulan : true;
        const isYearMatch = selectedYear ? yearFromData === selectedYear : true;
  
        // Hasil akhir dari filter gabungan
        return isCabangMatch && isBulanMatch && isYearMatch;
      });
  
      setDisplayedDataLapor(finalFilteredData);
    };
  
    filterData();
  }, [filterStatus, selectedCabang, selectedBulan, selectedYear, dataLaporDiterima, dataLaporBelum]);

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
                  onChange={handleCabangChange}
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
                  onChange={handleBulanChange} // Update ini
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
                  onChange={handleYearChange} // Pastikan handler untuk tahun diaktifkan
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
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Terima">Terima</option>
                  <option value="Belum">Belum</option>
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
                  {Array.isArray(displayedDataLapor) &&
                  displayedDataLapor.length > 0 ? (
                    displayedDataLapor.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-3 text-center">{index + 1}</td>
                        <td className="py-2 px-3">
                          {item.Date_lapor ? item.Date_lapor : "N/A"}
                        </td>
                        <td className="py-2 px-3">{item.Data_Meninggal}</td>
                        <td className="py-2 px-3 text-center">{item.Cabang}</td>
                        <td className="py-2 px-3 text-center">
                          {item.Keterangan}
                        </td>
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
