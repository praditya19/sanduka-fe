"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
  FaDatabase,
  FaUpload,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <FaCheckCircle className="text-green-500 text-3xl" />,
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <FaExclamationCircle className="text-red-500 text-3xl" />,
    },
    info: { bg: "bg-blue-100", text: "text-blue-800", icon: null },
  };

  const { bg, text, icon } = colors[type] || colors.info;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${bg} rounded-lg p-8 shadow-xl z-10 w-96 text-center`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
        >
          <FaTimesCircle size={24} />
        </button>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{icon}</div>
          <h3 className={`text-xl font-bold ${text}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>
          <div className={`${text}`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

const UploadPopup = ({ onClose, onSubmit }) => {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [file, setFile] = useState(null);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  const postToBackupByNominal = async (file, tagihanUntukBulan) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tagihanUntukBulan", tagihanUntukBulan);

      const response = await axiosClient.post(
        `/api/by-nominal/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error posting to import API:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan pilih file Excel terlebih dahulu");
      return;
    }

    if (!file.name.endsWith(".xlsx")) {
      alert("Hanya file dengan format .xlsx yang diizinkan");
      return;
    }

    const tagihanUntukBulan = `${tahun}-${bulan.toString().padStart(2, "0")}`;

    setIsLoading(true);

    try {
      const result = await postToBackupByNominal(file, tagihanUntukBulan);
      alert("File berhasil diupload!");
      console.log("Upload success:", result);
      onClose(); 
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Gagal mengupload file. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md z-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <FaUpload /> Upload Data Excel
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 focus:ring-teal-400 focus:outline-none"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 focus:ring-teal-400 focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Excel (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded-md px-3 py-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function ByNominal() {
   const router = useRouter();
    const { token } = useAuth();
    const [dataNominal, setDataNominal] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState('');
  const [unitKerjaInput, setUnitKerjaInput] = useState('');
  const [namaAnggotaInput, setNamaAnggotaInput] = useState('');
  const [searchCabang, setSearchCabang] = useState('');
  const [searchUnitKerja, setSearchUnitKerja] = useState('');
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);

  // Authentication effect
  useEffect(() => {
    if (!token) router.push("/sign-in");
  }, [token, router]);

  // Combined data fetching effect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [nominalRes, cabangRes, unitRes] = await Promise.all([
          GlobalApi.getAllByNominal(),
          GlobalApi.getCabang(),
          GlobalApi.getUnitKerja()
        ]);

        setDataNominal(nominalRes || []);
        setOriginalCabangList(cabangRes.data);
        setFilteredCabangList(cabangRes.data);
        setUnitKerjaList(unitRes.data);
        
        console.log("📊 Data fetched successfully:", {
          nominal: nominalRes,
          cabang: cabangRes.data,
          unit: unitRes.data
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setNotification({
          type: "error",
          message: "Gagal mengambil data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter data effect
  useEffect(() => {
    let filtered = dataNominal;

    if (selectedCabang) {
      filtered = filtered.filter(
        (item) =>
          item.cabang &&
          item.cabang.toLowerCase().includes(selectedCabang.toLowerCase())
      );
    }

    if (unitKerjaInput) {
      filtered = filtered.filter(
        (item) =>
          item.unitKerja &&
          item.unitKerja.toLowerCase().includes(unitKerjaInput.toLowerCase())
      );
    }

    if (namaAnggotaInput) {
      filtered = filtered.filter(
        (item) =>
          item.namaAnggota &&
          item.namaAnggota
            .toLowerCase()
            .includes(namaAnggotaInput.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [dataNominal, selectedCabang, unitKerjaInput, namaAnggotaInput]);

  // Combined UI effects (click outside + sidebar + resize)
  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target))
        setShowCabangDropdown(false);
      if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target))
        setShowUnitKerjaDropdown(false);
    };

    // Resize handler
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    
    // Sidebar state
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
    
    // Initial resize check
    handleResize();

    // Event listeners
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Event handlers
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const handleUploadSubmit = (data) => {
    console.log("📦 Upload data:", data);
    setNotification({
      type: "success",
      message: `File ${
        data.file.name
      } berhasil diunggah untuk ${data.tanggal.toLocaleDateString()}`,
    });
    setShowUploadPopup(false);
  };

  const handleCabangClick = () => setShowCabangDropdown(true);

  const handleCabangSearch = useCallback((query) => {
    setSearchCabang(query);
    setFilteredCabangList(
      originalCabangList.filter((c) =>
        c.kecamatan.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [originalCabangList]);

  const handleSelectCabang = useCallback((cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
    setFilteredUnitKerja(
      unitKerjaList.filter((u) => u.cabang === cabang.kecamatan)
    );
  }, [unitKerjaList]);

  const handleUnitKerjaClick = () => {
    if (!selectedCabang) return;
    const filtered = unitKerjaList.filter((u) => u.cabang === selectedCabang);
    setFilteredUnitKerja(filtered);
    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSearch = useCallback((term) => {
    setSearchUnitKerja(term);
    const filtered = unitKerjaList.filter(
      (u) =>
        u.cabang === selectedCabang &&
        u.unitKerja.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUnitKerja(filtered);
  }, [selectedCabang, unitKerjaList]);

  const handleUnitKerjaSelect = useCallback((unit) => {
    setUnitKerjaInput(unit.unitKerja);
    setShowUnitKerjaDropdown(false);
  }, []);

  const handleSearchClick = () => {
    setNotification({
      type: "info",
      message: `Cari anggota dengan nama: ${namaAnggotaInput}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          } p-4 md:p-8`}
        >
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <div className="flex items-center justify-between mb-6 mt-14">
            <div className="flex items-center gap-2">
              <FaDatabase className="text-2xl text-gray-700" />
              <h1 className="font-semibold text-2xl">By Nominal</h1>
            </div>

            <button
              onClick={() => setShowUploadPopup(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow"
            >
              <FaUpload /> Upload Data
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col relative w-64" ref={cabangRef}>
              <p>Cabang</p>
              <Input
                type="text"
                value={selectedCabang}
                readOnly
                onClick={handleCabangClick}
                placeholder="Pilih Cabang"
                className="cursor-pointer"
              />
              {showCabangDropdown && (
                <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
                  <ul className="max-h-44 overflow-y-auto">
                    <li className="py-2 px-2">
                      <Input
                        type="text"
                        value={searchCabang}
                        onChange={(e) => handleCabangSearch(e.target.value)}
                        placeholder="Cari Cabang..."
                      />
                    </li>
                    <li
                      onClick={() => handleSelectCabang({ kecamatan: "" })}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      Pilih Cabang
                    </li>
                    {filteredCabangList.map((cabang) => (
                      <li
                        key={cabang.id}
                        onClick={() => handleSelectCabang(cabang)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {cabang.kecamatan}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
              <p>Unit Kerja</p>
              <Input
                type="text"
                value={unitKerjaInput}
                onClick={handleUnitKerjaClick}
                placeholder="Pilih Unit Kerja"
                className="cursor-pointer"
                disabled={!selectedCabang}
              />
              {showUnitKerjaDropdown && (
                <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
                  <ul className="max-h-44 overflow-y-auto">
                    <li className="py-2 px-2">
                      <Input
                        type="text"
                        value={searchUnitKerja}
                        onChange={(e) => handleUnitKerjaSearch(e.target.value)}
                        placeholder="Cari Unit Kerja..."
                      />
                    </li>
                    <li
                      onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      Pilih Unit Kerja
                    </li>
                    {filteredUnitKerja.map((unitKerja) => (
                      <li
                        key={unitKerja.id}
                        onClick={() => handleUnitKerjaSelect(unitKerja)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {unitKerja.unitKerja}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col relative w-64">
              <p>Nama Anggota</p>
              <div className="relative">
                <Input
                  type="text"
                  value={namaAnggotaInput}
                  onChange={(e) => setNamaAnggotaInput(e.target.value)}
                  placeholder="Nama anggota..."
                  className="pr-10"
                />
                <button
                  onClick={handleSearchClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#14b8a6" size={45} />
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
                <table className="min-w-full text-sm text-gray-700 border-collapse">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="px-3 py-2 border">No</th>
                      <th className="px-3 py-2 border">Cabang</th>
                      <th className="px-3 py-2 border">Unit Kerja</th>
                      <th className="px-3 py-2 border">Nama Anggota</th>
                      <th className="px-3 py-2 border">PGRI</th>
                      <th className="px-3 py-2 border">Sanduka</th>
                      <th className="px-3 py-2 border">Daspen</th>
                      <th className="px-3 py-2 border">Derap</th>
                      <th className="px-3 py-2 border">Kalender</th>
                      <th className="px-3 py-2 border">Lain-lain</th>
                      <th className="px-3 py-2 border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border text-center">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 border">{item.cabang}</td>
                        <td className="px-3 py-2 border">{item.unitKerja}</td>
                            <td className="px-3 py-2 border">
                                <p>{item.namaAnggota}</p>
                                <p>{item.nip}</p>
                                <p>{item.nomorRekening}</p>
                        </td>
                        <td className="px-3 py-2 border text-right">
                          {item.pgri.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          {item.sanduka.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          {item.daspen.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          {item.derap.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          {item.kalender.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border text-right">
                          {item.lainLain.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border text-right font-semibold">
                          {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {showUploadPopup && (
        <UploadPopup
          onClose={() => setShowUploadPopup(false)}
          onSubmit={handleUploadSubmit}
        />
      )}
    </div>
  );
}

export default ByNominal;
