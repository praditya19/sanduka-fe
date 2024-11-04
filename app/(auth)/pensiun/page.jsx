"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const [pensiunList, setPensiunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const { token } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(""); // State untuk tahun
  const [bulanOptions, setBulanOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]); // State untuk opsi tahun
  const [filteredPensiunList, setFilteredPensiunList] = useState([]);

  // Mengambil data bulan dari API saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanOptions(response.data);
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan();
  }, []);

  // Fungsi untuk menangani perubahan bulan yang dipilih
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    applyFilters(month, selectedYear); // Terapkan filter saat bulan berubah
  };

  // Fungsi untuk menangani perubahan tahun yang dipilih
  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    applyFilters(selectedMonth, year); // Terapkan filter saat tahun berubah
  };

  // Ambil data pensiun
  useEffect(() => {
    const fetchPensiunData = async () => {
      try {
        const response = await GlobalApi.getAllPensiun();
        setPensiunList(response.data.content);
        setFilteredPensiunList(response.data.content); // Set daftar pensiun awal

        // Ambil daftar tahun unik dari kolom prediksiPensiun
        const years = Array.from(
          new Set(response.data.content.map((pensiun) =>
            new Date(pensiun.prediksiPensiun).getFullYear()
          ))
        );
        setYearOptions(years); // Set opsi tahun
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPensiunData();
  }, []);

  // Fungsi untuk menerapkan filter berdasarkan bulan dan tahun
  const applyFilters = (month, year) => {
    const filteredList = pensiunList.filter((pensiun) => {
      const pensiunDate = new Date(pensiun.prediksiPensiun);
      const pensiunMonth = pensiunDate.getMonth() + 1; // Mendapatkan bulan (0-11 menjadi 1-12)
      const pensiunYear = pensiunDate.getFullYear(); // Mendapatkan tahun
      return (
        (!month || pensiunMonth === parseInt(month)) && // Filter berdasarkan bulan jika dipilih
        (!year || pensiunYear === parseInt(year)) // Filter berdasarkan tahun jika dipilih
      );
    });

    setFilteredPensiunList(filteredList); // Update daftar pensiun yang terfilter
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", options);
  };

  // Cek token saat komponen dimuat
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  // Mengatur status sidebar dari localStorage
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  // Menangani perubahan ukuran layar
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full flex items-center justify-between mb-4 mt-16">
              <div className="flex w-full space-x-2">
                {/* Bulan Dropdown */}
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-2 border rounded w-full md:w-auto"
                >
                  <option value="">-- Pilih Bulan --</option>
                  {bulanOptions.map((bulan) => (
                    <option key={bulan.id} value={bulan.angkaBulan}>
                      {bulan.namaBulan}
                    </option>
                  ))}
                </select>

                {/* Tahun Dropdown */}
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="p-2 border rounded w-full md:w-auto"
                >
                  <option value="">-- Pilih Tahun --</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Cetak */}
              <button
                className="p-2 px-4 bg-blue-500 text-white rounded w-full md:w-auto transition duration-300 hover:bg-blue-700"
              >
                Cetak
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between mb-4">
                <span>Cabang: Tampil Semua</span>
                <span>Jumlah Anggota: {filteredPensiunList.length} Orang</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white mt-4">
                  <thead className="bg-teal-700 text-white">
                    <tr>
                      <th className="py-2 px-3 text-center">No.</th>
                      <th className="py-2 px-3 text-center">Foto</th>
                      <th className="py-2 px-3 text-center">
                        Prediksi Pensiun
                      </th>
                      <th className="py-2 px-3 text-center">Data Anggota</th>
                      <th className="py-2 px-3 text-center">Keanggotaan</th>
                      <th className="py-2 px-3 text-center">Cabang</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPensiunList.map((pensiun, index) => (
                      <tr key={pensiun.id} className="border-t">
                        <td className="py-2 px-3 text-center">{index + 1}</td>
                        <td className="py-2 px-3 text-center">
                          <img
                            src={pensiun.fotoUrl}
                            alt="Foto"
                            className="w-10 h-10 rounded-full"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {formatDate(pensiun.prediksiPensiun)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div>{pensiun.namaLengkap}</div>
                          <div>{pensiun.npa}</div>
                          <div>{pensiun.tempatLahir}</div>
                          <div>{formatDate(pensiun.tanggalLahir)}</div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div>{pensiun.jabatan}</div>
                          <div>{pensiun.unitKerja}</div>
                          <div>Usia: {pensiun.usia}</div>
                          <div>{pensiun.cabang}</div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {pensiun.cabang}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {pensiun.status}
                        </td>
                      </tr>
                    ))}
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