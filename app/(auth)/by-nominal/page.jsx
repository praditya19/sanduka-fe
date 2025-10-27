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
  FaTrashAlt,
  FaEdit,
  FaTimes,
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
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [namaAnggotaInput, setNamaAnggotaInput] = useState("");
  const [searchCabang, setSearchCabang] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    itemName: "",
  });
  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    data: null,
    loading: false,
  });
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [showUpdateCabangDropdown, setShowUpdateCabangDropdown] =
    useState(false);
  const [showUpdateUnitDropdown, setShowUpdateUnitDropdown] = useState(false);
  const [searchUpdateCabang, setSearchUpdateCabang] = useState("");
  const [searchUpdateUnit, setSearchUpdateUnit] = useState("");
  const [filteredUpdateUnit, setFilteredUpdateUnit] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const updateCabangRef = useRef(null);
  const updateUnitRef = useRef(null);

  const UploadPopup = ({ onClose }) => {
    const now = new Date();
    const [bulan, setBulan] = useState(now.getMonth() + 1);
    const [tahun, setTahun] = useState(now.getFullYear());
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!file) {
        alert("Silakan pilih file Excel terlebih dahulu.");
        return;
      }

      // Bentuk tanggal jadi "YYYY-MM-01"
      const tagihanUntukBulan = `${tahun}-${String(bulan).padStart(2, "0")}-01`;

      try {
        setIsLoading(true);

        const res = await GlobalApi.importByNominal(file, tagihanUntukBulan);

        setNotification({
          type: "success",
          message: res,
        });

        setShowUploadPopup(false);
        await fetchAllData(); // refresh tabel otomatis
      } catch (error) {
        console.error("❌ Upload failed:", error.response?.data || error);
        setNotification({
          type: "error",
          message:
            "Gagal mengunggah file. Coba periksa format Excel atau hubungi admin.",
        });
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
            {/* Pilihan Bulan */}
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

            {/* Pilihan Tahun */}
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

            {/* File Excel */}
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

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-60"
              >
                {isLoading ? "Mengupload..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!token) router.push("/sign-in");
  }, [token, router]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [nominalRes, cabangRes, unitRes] = await Promise.all([
        GlobalApi.getAllByNominal(),
        GlobalApi.getCabang(),
        GlobalApi.getUnitKerja(),
      ]);

      setDataNominal(nominalRes || []);
      setOriginalCabangList(cabangRes.data);
      setFilteredCabangList(cabangRes.data);
      setUnitKerjaList(unitRes.data);
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
  useEffect(() => {
    fetchAllData();
  }, []);

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

  const openUpdateModal = (item) => {
    let tagihanUntukBulan = item.tagihanUntukBulan;

    // Jika bentuknya array [2025, 10, 1] ubah ke "2025-10-01"
    if (Array.isArray(tagihanUntukBulan) && tagihanUntukBulan.length === 3) {
      const [year, month, day] = tagihanUntukBulan;
      tagihanUntukBulan = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }

    setUpdateModal({
      isOpen: true,
      data: { ...item, tagihanUntukBulan },
      loading: false,
    });
  };

  const closeUpdateModal = () => {
    setUpdateModal({
      isOpen: false,
      data: null,
      loading: false,
    });
  };

  const handleUpdateInputChange = (field, value) => {
    setUpdateModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateModal.data) return;

    try {
      setUpdateModal((prev) => ({ ...prev, loading: true }));

      const id =
        typeof updateModal.data.id === "object"
          ? updateModal.data.id.id
          : updateModal.data.id;

      const total =
        (updateModal.data.pgri || 0) +
        (updateModal.data.sanduka || 0) +
        (updateModal.data.daspen || 0) +
        (updateModal.data.derap || 0) +
        (updateModal.data.kalender || 0) +
        (updateModal.data.lainLain || 0);

      const updatedData = { ...updateModal.data, total };

      const response = await GlobalApi.updateByNominal(id, updatedData);

      setDataNominal((prevData) =>
        prevData.map((item) => (item.id === id ? updatedData : item))
      );

      setFilteredData((prevData) =>
        prevData.map((item) => (item.id === id ? updatedData : item))
      );

      setNotification({
        type: "success",
        message: "Data berhasil diperbarui.",
      });

      closeUpdateModal();
    } catch (err) {
      console.error("❌ Error updating data:", err);
      setNotification({
        type: "error",
        message: "Gagal memperbarui data. Silakan coba lagi.",
      });
    } finally {
      setUpdateModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openUpdatePopup = (item) => {
    setSelectedItem({
      ...item,
      tagihanUntukBulan: item.tagihanUntukBulan
        ? formatDate(item.tagihanUntukBulan)
        : "",
    });
    setShowUpdateModal(true);
  };
  const formatDate = (dateValue) => {
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
    return dateValue;
  };
  const closeModal = () => {
    setShowUpdateModal(false);
    setSelectedItem(null);
  };
  const handleChange = (field, value) => {
    setSelectedItem((prev) => ({ ...prev, [field]: value }));
  };
  const handleUpdate = async () => {
    try {
      setLoadingUpdate(true);
      const nip = selectedItem?.nip || "";
      const bulan = selectedItem?.tagihanUntukBulan || "";
      const payload = {
        namaAnggota: selectedItem.namaAnggota,
        nip: selectedItem.nip,
        nomorRekening: selectedItem.nomorRekening,
        cabang: selectedItem.cabang,
        unitKerja: selectedItem.unitKerja,
        pgri: Number(selectedItem.pgri),
        sanduka: Number(selectedItem.sanduka),
        daspen: Number(selectedItem.daspen),
        derap: Number(selectedItem.derap),
        kalender: Number(selectedItem.kalender),
        lainLain: Number(selectedItem.lainLain),
      };

      const res = await GlobalApi.updateByNominalByBulan(nip, bulan, payload);

      setNotification({
        type: "success",
        message: "Data berhasil diperbarui.",
      });

      closeModal();

      // 🔁 Refresh tabel otomatis
      await fetchAllData();
    } catch (error) {
      console.error("❌ Gagal update:", error);
      setNotification({
        type: "error",
        message: "Gagal memperbarui data.",
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const openDeleteModal = (id, itemName = "") => {
    setDeleteModal({
      isOpen: true,
      id: id,
      itemName: itemName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      id: null,
      itemName: "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      setLoading(true);

      await GlobalApi.deleteByNominal(deleteModal.id);

      setDataNominal((prevData) =>
        prevData.filter((item) => item.id !== deleteModal.id)
      );
      setFilteredData((prevData) =>
        prevData.filter((item) => item.id !== deleteModal.id)
      );

      setNotification({
        type: "success",
        message: "Data berhasil dihapus.",
      });
    } catch (err) {
      console.error("Error deleting data:", err);
      setNotification({
        type: "error",
        message: "Gagal menghapus data. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target))
        setShowCabangDropdown(false);
      if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target))
        setShowUnitKerjaDropdown(false);
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);

    handleResize();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        updateCabangRef.current &&
        !updateCabangRef.current.contains(event.target)
      ) {
        setShowUpdateCabangDropdown(false);
      }
      if (
        updateUnitRef.current &&
        !updateUnitRef.current.contains(event.target)
      ) {
        setShowUpdateUnitDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("isSidebarOpen", newState);
  };

  const handleUploadSubmit = (data) => {
    setNotification({
      type: "success",
      message: `File ${
        data.file.name
      } berhasil diunggah untuk ${data.tanggal.toLocaleDateString()}`,
    });
    setShowUploadPopup(false);
  };

  const handleCabangClick = () => setShowCabangDropdown(true);

  const handleCabangSearch = useCallback(
    (query) => {
      setSearchCabang(query);
      setFilteredCabangList(
        originalCabangList.filter((c) =>
          c.kecamatan.toLowerCase().includes(query.toLowerCase())
        )
      );
    },
    [originalCabangList]
  );

  const handleSelectCabang = useCallback(
    (cabang) => {
      setSelectedCabang(cabang.kecamatan);
      setShowCabangDropdown(false);
      setFilteredUnitKerja(
        unitKerjaList.filter((u) => u.cabang === cabang.kecamatan)
      );
    },
    [unitKerjaList]
  );

  const handleUnitKerjaClick = () => {
    if (!selectedCabang) return;
    const filtered = unitKerjaList.filter((u) => u.cabang === selectedCabang);
    setFilteredUnitKerja(filtered);
    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSearch = useCallback(
    (term) => {
      setSearchUnitKerja(term);
      const filtered = unitKerjaList.filter(
        (u) =>
          u.cabang === selectedCabang &&
          u.unitKerja.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
    },
    [selectedCabang, unitKerjaList]
  );

  const handleUnitKerjaSelect = useCallback((unit) => {
    setUnitKerjaInput(unit.unitKerja);
    setShowUnitKerjaDropdown(false);
  }, []);

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
              <h1 className="font-semibold text-2xl">New By Nominal</h1>
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
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader color="#14b8a6" size={45} />
            </div>
          ) : (
            <div className="flex gap-4 w-full">
              {/* Wrapper scroll horizontal */}
              <div className="bg-white rounded-xl shadow-md border w-full overflow-x-auto">
                <table className="min-w-full text-sm text-gray-700 border-collapse">
                  <thead className="bg-teal-600 text-white text-[15px]">
                    <tr>
                      <th className="px-4 py-3 border">No</th>
                      <th className="px-4 py-3 border">Cabang</th>
                      <th className="px-4 py-3 border">Unit Kerja</th>
                      <th className="px-4 py-3 border">Nama Anggota</th>
                      <th className="px-4 py-3 border">PGRI</th>
                      <th className="px-4 py-3 border">Sanduka</th>
                      <th className="px-4 py-3 border">Daspen</th>
                      <th className="px-4 py-3 border">Derap</th>
                      <th className="px-4 py-3 border">Kalender</th>
                      <th className="px-4 py-3 border">Lain-lain</th>
                      <th className="px-4 py-3 border">Total</th>
                      <th className="px-4 py-3 border">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-100 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 border text-center font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 border">{item.cabang}</td>
                        <td className="px-4 py-3 border">{item.unitKerja}</td>
                        <td className="px-4 py-3 border min-w-[200px]">
                          <p className="font-semibold">{item.namaAnggota}</p>
                          <p className="text-gray-500">{item.nip}</p>
                          <p className="text-gray-500">{item.nomorRekening}</p>
                        </td>
                        <td className="px-4 py-3 border text-right">
                          {item.pgri.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border text-right">
                          {item.sanduka.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border text-right">
                          {item.daspen.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border text-right">
                          {item.derap.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border text-right">
                          {item.kalender.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border text-right">
                          {item.lainLain.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 border text-right font-semibold">
                          {item.total.toLocaleString()}
                        </td>
                        <td className="border text-center">
                          <div className="flex items-center justify-center space-x-3 py-2">
                            {/* <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => openUpdateModal(item)}
                            title="Update Data by id"
                          >
                            <FaEdit />
                          </button> */}
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => openUpdatePopup(item)}
                              title="Perbarui Data by Bulan"
                            >
                              <FaEdit />
                            </button>

                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() =>
                                openDeleteModal(item.id, item.namaAnggota)
                              }
                              title="Hapus Data"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
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
      {updateModal.isOpen && updateModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Data Anggota
              </h3>
              <button
                onClick={closeUpdateModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={updateModal.loading}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informasi Dasar */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">
                    Informasi Dasar
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Anggota *
                    </label>
                    <Input
                      type="text"
                      value={updateModal.data.namaAnggota || ""}
                      onChange={(e) =>
                        handleUpdateInputChange("namaAnggota", e.target.value)
                      }
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIP
                    </label>
                    <Input
                      type="text"
                      value={updateModal.data.nip || ""}
                      onChange={(e) =>
                        handleUpdateInputChange("nip", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Rekening
                    </label>
                    <Input
                      type="text"
                      value={updateModal.data.nomorRekening || ""}
                      onChange={(e) =>
                        handleUpdateInputChange("nomorRekening", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* === CABANG DROPDOWN === */}
                  <div className="flex flex-col relative" ref={updateCabangRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cabang
                    </label>
                    <Input
                      type="text"
                      value={updateModal.data.cabang || ""}
                      readOnly
                      onClick={() => setShowUpdateCabangDropdown(true)}
                      placeholder="Pilih Cabang"
                      className="cursor-pointer"
                    />

                    {showUpdateCabangDropdown && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              value={searchUpdateCabang}
                              onChange={(e) => {
                                setSearchUpdateCabang(e.target.value);
                                setFilteredCabangList(
                                  originalCabangList.filter((c) =>
                                    c.kecamatan
                                      .toLowerCase()
                                      .includes(e.target.value.toLowerCase())
                                  )
                                );
                              }}
                              placeholder="Cari Cabang..."
                            />
                          </li>
                          <li
                            onClick={() => {
                              handleUpdateInputChange("cabang", "");
                              handleUpdateInputChange("unitKerja", "");
                              setShowUpdateCabangDropdown(false);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            Pilih Cabang
                          </li>
                          {filteredCabangList.map((cabang) => (
                            <li
                              key={cabang.id}
                              onClick={() => {
                                handleUpdateInputChange(
                                  "cabang",
                                  cabang.kecamatan
                                );
                                handleUpdateInputChange("unitKerja", "");
                                setFilteredUpdateUnit(
                                  unitKerjaList.filter(
                                    (u) => u.cabang === cabang.kecamatan
                                  )
                                );
                                setShowUpdateCabangDropdown(false);
                              }}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {cabang.kecamatan}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* === UNIT KERJA DROPDOWN === */}
                  <div className="flex flex-col relative" ref={updateUnitRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Kerja
                    </label>
                    <Input
                      type="text"
                      value={updateModal.data.unitKerja || ""}
                      readOnly
                      onClick={() => {
                        if (!updateModal.data.cabang) return;
                        setFilteredUpdateUnit(
                          unitKerjaList.filter(
                            (u) => u.cabang === updateModal.data.cabang
                          )
                        );
                        setShowUpdateUnitDropdown(true);
                      }}
                      placeholder="Pilih Unit Kerja"
                      className="cursor-pointer"
                      disabled={!updateModal.data.cabang}
                    />

                    {showUpdateUnitDropdown && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              value={searchUpdateUnit}
                              onChange={(e) => {
                                setSearchUpdateUnit(e.target.value);
                                setFilteredUpdateUnit(
                                  unitKerjaList.filter(
                                    (u) =>
                                      u.cabang === updateModal.data.cabang &&
                                      u.unitKerja
                                        .toLowerCase()
                                        .includes(e.target.value.toLowerCase())
                                  )
                                );
                              }}
                              placeholder="Cari Unit Kerja..."
                            />
                          </li>
                          <li
                            onClick={() => {
                              handleUpdateInputChange("unitKerja", "");
                              setShowUpdateUnitDropdown(false);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            Pilih Unit Kerja
                          </li>
                          {filteredUpdateUnit.map((unit) => (
                            <li
                              key={unit.id}
                              onClick={() => {
                                handleUpdateInputChange(
                                  "unitKerja",
                                  unit.unitKerja
                                );
                                setShowUpdateUnitDropdown(false);
                              }}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              {unit.unitKerja}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nominal */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">
                    Nominal Iuran
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PGRI
                    </label>
                    <Input
                      type="number"
                      value={updateModal.data.pgri || 0}
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "pgri",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sanduka
                    </label>
                    <Input
                      type="number"
                      value={updateModal.data.sanduka || 0}
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "sanduka",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daspen
                    </label>
                    <Input
                      type="number"
                      value={updateModal.data.daspen || 0}
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "daspen",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Derap
                    </label>
                    <Input
                      type="number"
                      value={updateModal.data.derap || 0}
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "derap",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kalender
                    </label>
                    <Input
                      type="number"
                      value={updateModal.data.kalender || 0}
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "kalender",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lain-lain
                    </label>
                    <Input
                      type="number"
                      value={updateModal.data.lainLain || 0}
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "lainLain",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="text-lg font-semibold text-teal-600">
                      {(
                        (updateModal.data.pgri || 0) +
                        (updateModal.data.sanduka || 0) +
                        (updateModal.data.daspen || 0) +
                        (updateModal.data.derap || 0) +
                        (updateModal.data.kalender || 0) +
                        (updateModal.data.lainLain || 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Tambahan */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tagihan Untuk Bulan
                    </label>
                    <Input
                      type="month"
                      value={
                        Array.isArray(updateModal.data.tagihanUntukBulan)
                          ? `${updateModal.data.tagihanUntukBulan[0]}-${String(
                              updateModal.data.tagihanUntukBulan[1]
                            ).padStart(2, "0")}`
                          : updateModal.data.tagihanUntukBulan
                          ? String(
                              updateModal.data.tagihanUntukBulan
                            ).substring(0, 7)
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateInputChange(
                          "tagihanUntukBulan",
                          e.target.value + "-01"
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  disabled={updateModal.loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50 flex items-center gap-2"
                  disabled={updateModal.loading}
                >
                  {updateModal.loading ? (
                    <>
                      <ClipLoader size={16} color="#ffffff" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showUpdateModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[480px] shadow-lg">
            <h2 className="text-lg font-semibold text-teal-600 mb-4">
              Update Data By Bulan
            </h2>

            <div className="space-y-3">
              {/* Pilih tanggal */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tagihan Untuk Bulan
                </label>
                <input
                  type="date"
                  className="border rounded-lg p-2 w-full"
                  value={selectedItem.tagihanUntukBulan || ""}
                  onChange={(e) =>
                    handleChange("tagihanUntukBulan", e.target.value)
                  }
                />
              </div>

              {/* Input nominal */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  "pgri",
                  "sanduka",
                  "daspen",
                  "derap",
                  "kalender",
                  "lainLain",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {field}
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2 text-sm"
                      value={selectedItem[field] || 0}
                      onChange={(e) =>
                        handleChange(field, Number(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={loadingUpdate}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {loadingUpdate ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Hapus
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Apakah Anda yakin ingin menghapus data ini?
                {deleteModal.itemName && (
                  <span className="font-semibold block mt-2">
                    {deleteModal.itemName}
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ByNominal;
