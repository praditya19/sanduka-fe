"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

export default function Home() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const tahunList = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const bulanList = [
    { id: "01", namaBulan: "Januari" },
    { id: "02", namaBulan: "Februari" },
    { id: "03", namaBulan: "Maret" },
    { id: "04", namaBulan: "April" },
    { id: "05", namaBulan: "Mei" },
    { id: "06", namaBulan: "Juni" },
    { id: "07", namaBulan: "Juli" },
    { id: "08", namaBulan: "Agustus" },
    { id: "09", namaBulan: "September" },
    { id: "10", namaBulan: "Oktober" },
    { id: "11", namaBulan: "November" },
    { id: "12", namaBulan: "Desember" },
  ];
  const getNamaBulan = (bulanId) => {
    const bulan = bulanList.find((b) => b.id === bulanId.padStart(2, "0")); // Pastikan angka bulan berbentuk dua digit
    return bulan ? bulan.namaBulan : bulanId; // Jika tidak ditemukan, kembalikan angka bulan
  };
  const [queryCabang, setQueryCabang] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [data, setData] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState(currentMonth); // Bulan otomatis
  const [selectedTahun, setSelectedTahun] = useState(currentYear.toString()); // Tahun otomatis
  const cabang = sessionStorage.getItem("cabang");

  const groupDataByMonth = (data) => {
    const bulanMap = {
      Januari: "1",
      Februari: "2",
      Maret: "3",
      April: "4",
      Mei: "5",
      Juni: "6",
      Juli: "7",
      Agustus: "8",
      September: "9",
      Oktober: "10",
      November: "11",
      Desember: "12",
    };

    const grouped = data.reduce((acc, curr) => {
      // Normalisasi nilai bulan
      const bulan = bulanMap[curr.bulan] || curr.bulan; // Ubah nama bulan menjadi angka jika perlu

      if (!bulan) return acc; // Abaikan jika bulan undefined

      if (!acc[bulan]) {
        acc[bulan] = [];
      }
      acc[bulan].push(curr);
      return acc;
    }, {});

    // Ubah objek menjadi array
    return Object.keys(grouped).map((key) => ({
      month: key,
      items: grouped[key],
    }));
  };

  const fetchData = async () => {
    if (!selectedBulan || !selectedTahun) return;

    const bulan1 = selectedBulan;
    const bulan2 =
      selectedBulan === "01"
        ? "12"
        : (parseInt(selectedBulan) - 1).toString().padStart(2, "0");
    const bulan3 =
      selectedBulan === "01"
        ? "11"
        : (parseInt(selectedBulan) - 2).toString().padStart(2, "0");

    const namaBulan1 = bulanList.find((b) => b.id === bulan1)?.namaBulan || "";
    const namaBulan2 = bulanList.find((b) => b.id === bulan2)?.namaBulan || "";
    const namaBulan3 = bulanList.find((b) => b.id === bulan3)?.namaBulan || "";

    const params = {
      bulan1,
      bulan2,
      bulan3,
      namaBulan1,
      namaBulan2,
      namaBulan3,
      tahun: selectedTahun,
      cabang,
    };

    try {
      const response = await GlobalApi.getDetailKeuangan(params);
      console.log("Data fetched:", response); // Debugging
      const groupedData = groupDataByMonth(response || []);
      console.log("Grouped Data:", groupedData); // Debugging
      setData(groupedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBulan, selectedTahun]);

  const { token } = useAuth();
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  const fetchCabang = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabangOptions(response.data || []);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  useEffect(() => {
    fetchCabang();
  }, []);

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan || "Pilih Cabang");
    setShowDropdownCabang(false);
    setQueryCabang(""); // Reset pencarian setelah memilih cabang
  };

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
                className="cursor-pointer mr-2"
              />
              <h1 className="text-base">Detail</h1>
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
              <h1 className="text-base">Detail</h1>
            </div>
          </div>
        </header>
      )}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div>
          <div className="flex flex-wrap justify-between space-y-4 space-x-0 md:space-y-0 md:space-x-4 mb-4 mt-16">
            {/* Filter Bulan */}
            <div className="flex-1 min-w-[250px] flex flex-col items-start">
              <label className="block text-sm font-medium mb-1">Bulan</label>
              <select
                className="border p-2 rounded w-full"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
              >
                <option value="">Pilih Bulan</option>
                {bulanList.map((bulan) => (
                  <option key={bulan.id} value={bulan.id}>
                    {bulan.namaBulan}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tahun */}
            <div className="flex-1 min-w-[250px] flex flex-col items-start">
              <label className="block text-sm font-medium mb-1">Tahun</label>
              <select
                className="border p-2 rounded w-full"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
              >
                <option value="">Pilih Tahun</option>
                {tahunList.map((tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Cabang */}
            <div className="flex-1 min-w-[250px] flex flex-col items-start relative">
              <label className="block text-sm font-medium mb-1">
                Cabang / Khusus
              </label>
              <input
                id="cabangInput"
                type="text"
                className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
                placeholder="Pilih Cabang"
                value={selectedCabang || queryCabang}
                readOnly
                onClick={() => setShowDropdownCabang(true)}
              />
              {showDropdownCabang && (
                <div
                  id="dropdownCabang"
                  className="absolute z-10 border rounded-lg bg-white shadow-sm mt-2 w-full"
                >
                  <ul className="max-h-44 overflow-y-auto">
                    <li className="py-2 px-2">
                      <input
                        type="text"
                        className="border-b p-2 w-full bg-white"
                        placeholder="Cari Cabang..."
                        value={queryCabang}
                        onChange={(e) => setQueryCabang(e.target.value)}
                        autoFocus
                      />
                    </li>
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        handleCabangSelect({ kecamatan: "", idKecamatan: null })
                      }
                    >
                      Pilih Cabang
                    </li>
                    {cabangOptions
                      .filter((cabang) =>
                        cabang.kecamatan
                          .toLowerCase()
                          .includes(queryCabang.toLowerCase())
                      )
                      .map((cabang) => (
                        <li
                          key={cabang.idKecamatan}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCabangSelect(cabang)}
                        >
                          {cabang.kecamatan}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-green-600 text-center mb-2">
            Kekurangan Setoran Cabang {cabang}
          </h2>

          <div className="max-w-4xl mx-auto p-6">
            {Array.isArray(data) && data.length > 0 ? (
              data.map((monthData, index) => (
                <div key={index} className="mb-8">
                  <h3 className="font-bold text-lg mb-4">
                    Bulan {getNamaBulan(monthData.month)}{" "}
                    {monthData.year || selectedTahun}
                  </h3>
                  <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="py-3 px-4">Jenis</th>
                        <th className="py-3 px-4">Setor Kabupaten</th>
                        <th className="py-3 px-4">Peruntukan Cabang/Ranting</th>
                        <th className="py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthData.items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-3 px-4">{item.jenisSetor}</td>
                          <td className="py-3 px-4">
                            {item.setorKabupaten.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            {item.peruntukanCabangRanting.toLocaleString(
                              "id-ID"
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {item.total.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                Tidak ada data untuk ditampilkan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
