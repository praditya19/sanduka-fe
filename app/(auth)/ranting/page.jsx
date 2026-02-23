"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import GlobalApi from "@/app/_utils/GlobalApi";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  faMagnifyingGlass,
  faMinusCircle,
  faPlusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClipLoader } from "react-spinners";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal!'}
          </h3>

          <div className={`${getTextColor()} text-center`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [namaRanting, setNamaRanting] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [, setUnitKerjaOptions] = useState([]);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const router = useRouter();
  const unitKerjaRef = useRef(null);
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedRanting, setSelectedRanting] = useState("");
  const [originalRantingList, setOriginalRantingList] = useState([]);
  const [allRantingList, setAllRantingList] = useState([]);
  const [showRantingDropdown, setShowRantingDropdown] = useState(false);
  const [role, setRole] = useState("");
  const [filteredCabang, setFilteredCabang] = useState("");
  const [showFilteredCabangDropdown, setShowFilteredCabangDropdown] =
    useState(false);
  const [filteredRanting, setFilteredRanting] = useState("");
  const [showFilteredRantingDropdown, setShowFilteredRantingDropdown] =
    useState(false);
  const [allFilteredRantingList, setAllFilteredRantingList] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedNamaRantingCabang, setSelectedNamaRantingCabang] =
    useState("");
  const [showNamaRantingCabangDropdown, setShowNamaRantingCabangDropdown] =
    useState(false);
  const [filteredNamaRantingCabangList, setFilteredNamaRantingCabangList] =
    useState([]);
  const [originalTambahRantingList, setOriginalTambahRantingList] = useState(
    []
  );
  const [notification, setNotification] = useState(null);
  const [buatNamaRanting, setBuatNamaRanting] = useState("");
  const [checkedUnitKerja, setCheckedUnitKerja] = useState([]);
  const dropdownRef = useRef(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isPopupDeleteVisible, setIsPopupDeleteVisible] = useState(false);
  const [isPopupDeleteNamaRantingVisible, setIsPopupDeleteNamaRantingVisible] =
    useState(false);
  const [rantingToDelete, setRantingToDelete] = useState(null);

  const addRanting = async () => {
    if (!selectedRanting || !selectedCabang) {
      setNotification({
        type: 'error',
        message: `Harap lengkapi nama ranting dan cabang!`,
      });
      return;
    }
    try {
      const rantingData = {
        cabang: selectedCabang,
        namaRanting: selectedRanting,
        unitKerja: selectedUnitKerja,
      };
      const response = await GlobalApi.createRanting(rantingData);

      setNotification({
        type: 'success',
        message: `Ranting berhasil ditambahkan!`,
      });
      setSelectedRanting("");
      setSelectedCabang("");
      setSelectedUnitKerja("");
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Gagal menambahkan ranting. Coba lagi.`,
      });
      console.error("Error adding ranting:", error);
    }
  };

  const addNamaRanting = async () => {
    if (!buatNamaRanting || !selectedNamaRantingCabang) {
      setNotification({
        type: 'error',
        message: `Hara lengkapi nama ranting dan cabang!`,
      });
      return;
    }

    try {
      const namaRanting = {
        cabang: selectedNamaRantingCabang,
        namaRanting: buatNamaRanting,
      };
      const response = await GlobalApi.createNamaRanting(namaRanting);

      setNotification({
        type: 'success',
        message: `Nama Ranting berhasil ditambahkan!`,
      });
      setBuatNamaRanting("");
      setSelectedNamaRantingCabang("");
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Gagal menambahkan nama ranting. Coba lagi.`,
      });
      console.error("Error adding ranting:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await GlobalApi.getGroupedNamaRantingWithCabang();
      setNamaRanting(response);
    } catch (error) {
      console.error("Error fetching ranting data:", error);
    }
  };

  const fetchUnitKerjaData = async () => {
    try {
      const unitKerjaResponse = await GlobalApi.getUnitKerja();
      setAllUnitKerja(unitKerjaResponse.data);
      setUnitKerjaOptions(unitKerjaResponse.data);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  const fetchCabangData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setOriginalCabangList(response.data);
      setFilteredCabangList(response.data);
      setFilteredNamaRantingCabangList(response.data);
      setOriginalTambahRantingList(response.data);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  const deleteRanting = async (namaRanting) => {
    try {
      const response = await GlobalApi.deleteRanting(namaRanting);
      setNotification({
        type: 'success',
        message: `Ranting berhasil dihapus!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  const deleteUnitKerjaRanting = async () => {
    if (checkedUnitKerja.length === 0) {
      setNotification({
        type: 'error',
        message: `Pilih setidaknya satu unit kerja untuk dihapus!`,
      });
      return;
    }

    try {
      const unitKerjaIds = checkedUnitKerja.map((item) => item.unitKerjaId); // Ambil hanya ID
      await GlobalApi.deleteUnitKerjaRanting(unitKerjaIds);

      setNotification({
        type: 'success',
        message: `Unit kerja berhasil dihapus!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 4000);
      setCheckedUnitKerja([]);
    } catch (error) {
      console.error("Error menghapus unit kerja:", error);
      setNotification({
        type: 'error',
        message: `Gagal menghapus unit kerja. Coba lagi.`,
      });
    }
  };

  const fetchRantingByCabang = async (cabang) => {
    if (!cabang) {
      console.warn("Cabang belum dipilih!");
      return;
    }

    try {
      const cabangToFetch = decodeURIComponent(cabang.kecamatan || cabang);

      const response = await GlobalApi.getNamaRantingByCabang(cabangToFetch);

      setOriginalRantingList(response.data);
      setAllRantingList(response.data);
      setAllFilteredRantingList(response.data);
    } catch (error) {
      console.error("Error fetching nama ranting:", error);
    }
  };

  useEffect(() => {
    if (!token) router.push("/sign-in");
    else {
      setLoading(false);
      fetchCabangData();
      fetchUnitKerjaData();
      fetchData(currentPage, entries);

      const storedRole = sessionStorage.getItem("role");
      if (storedRole) {
        setRole(storedRole);
      }

      const role = sessionStorage.getItem("role");
      const cabangFromSession = sessionStorage.getItem("cabang") || "";
      if (role === "ADMIN" && cabangFromSession) {
        fetchRantingByCabang(cabangFromSession);
        setSelectedCabang(cabangFromSession);
        setFilteredCabang(cabangFromSession);
      } else {
        fetchRantingByCabang(selectedCabang);
        fetchRantingByCabang(filteredCabang);
      }

      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [token, router, selectedCabang, filteredCabang]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
        setShowRantingDropdown(false);
        setShowDropdownUnitKerja(false);
        setShowFilteredCabangDropdown(false);
        setShowFilteredRantingDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleSelectCabang = async (cabang) => {
    const role = sessionStorage.getItem("role");
    if (cabang.id === "All" && role === "SUPERADMIN") {
      setSelectedCabang("All");
      setShowCabangDropdown(false);
      const allCabang = filteredCabangList.map((item) => item.kecamatan);
    } else if (cabang.id !== "All") {
      setSelectedCabang(cabang.kecamatan);
      setShowCabangDropdown(false);
    } else {
      console.error("Role tidak memiliki akses ke opsi 'All'");
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    fetchData(0, entries, query);
  };

  const handleUnitKerjaSelect = (selectedItem) => {
    setSelectedUnitKerja(selectedItem.unitKerja || "");
    setShowDropdownUnitKerja(false);
    setSearchUnitKerja("");
  };

  const handleCheckboxChange = (unitKerjaId, unitKerjaName) => {
    setCheckedUnitKerja((prev) =>
      prev.some((item) => item.unitKerjaId === unitKerjaId)
        ? prev.filter((item) => item.unitKerjaId !== unitKerjaId)
        : [...prev, { unitKerjaId, unitKerjaName }]
    );
  };

  const handleUnitKerjaChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchUnitKerja(value);

    const filteredOptions = allUnitKerja.filter((uk) => {
      return (
        uk.cabang === selectedCabang &&
        uk.unitKerja.toLowerCase().includes(value.toLowerCase())
      );
    });

    setFilteredUnitKerjaOptions(filteredOptions);
  };

  const handleRemoveRanting = (id) => {
    setRantingToDelete(id);
    setIsPopupDeleteNamaRantingVisible(true);
  };

  const filteredData = namaRanting?.filter((item) => {
    const namaRanting = item.namaRanting?.toLowerCase().trim() || "";
    const namaCabang = item.cabangList?.toLowerCase().trim() || "";
    const selectedCabang = filteredCabang?.toLowerCase().trim() || "";
    const selectedRanting = filteredRanting?.toLowerCase().trim() || "";

    return (
      namaRanting.includes(searchQuery.toLowerCase()) &&
      (selectedCabang ? namaCabang.includes(selectedCabang) : true) &&
      (selectedRanting ? namaRanting.includes(selectedRanting) : true)
    );
  });

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handleDeleteAdminClick = (deleteByNamaRanting) => {
    if (checkedUnitKerja.length > 0) {
      deleteUnitKerjaRanting();
    } else {
      deleteRanting(deleteByNamaRanting);
    }
    setIsPopupDeleteVisible(false);
  };

  const handleSelectRanting = (ranting) => {
    setSelectedRanting(ranting.namaRanting);
    setShowRantingDropdown(false);
  };

  const handleRantingSearch = (searchTerm) => {
    const allRantingList = originalRantingList.filter((ranting) =>
      ranting.namaRanting.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAllRantingList(allRantingList);
  };

  const handleFilteredCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowFilteredCabangDropdown(true);
  };

  const handleFilteredCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handlefilteredCabang = async (cabang) => {
    const role = sessionStorage.getItem("role");
    if (cabang.id === "All" && role === "SUPERADMIN") {
      setFilteredCabang("All");
      setShowFilteredCabangDropdown(false);
      const allCabang = filteredCabangList.map((item) => item.kecamatan);
    } else if (cabang.id !== "All") {
      setFilteredCabang(cabang.kecamatan);
      setShowFilteredCabangDropdown(false);
    } else {
      console.error("Role tidak memiliki akses ke opsi 'All'");
    }
  };

  const handleFilteredRantingSearch = (searchTerm) => {
    const allRantingList = originalRantingList.filter((ranting) =>
      ranting.namaRanting.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAllFilteredRantingList(allRantingList);
  };

  const handleSelectFilteredRanting = (ranting) => {
    setFilteredRanting(ranting.namaRanting);
    setShowFilteredRantingDropdown(false);
  };

  const handleOpenPopup = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const handleCabangNamaRantingClick = () => {
    setFilteredNamaRantingCabangList(originalTambahRantingList);
    setShowNamaRantingCabangDropdown(true);
  };

  const handleTambahRanting = (query) => {
    const filtered = originalTambahRantingList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNamaRantingCabangList(filtered);
  };

  const handleSelectNamaRantingCabang = async (cabang) => {
    const role = sessionStorage.getItem("role");

    if (cabang.id === "All" && role === "SUPERADMIN") {
      setSelectedNamaRantingCabang("All");
      setShowNamaRantingCabangDropdown(false);
    } else if (cabang.id !== "All") {
      setSelectedNamaRantingCabang(cabang.kecamatan);
      setShowNamaRantingCabangDropdown(false);
    } else {
      console.error("Role tidak memiliki akses ke opsi 'All'");
    }
  };

  const toggleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const confirmDeleteRanting = async () => {
    if (rantingToDelete) {
      try {
        await GlobalApi.deleteNamaRanting(rantingToDelete);
        setAllRantingList((prev) =>
          prev.filter((ranting) => ranting.id !== rantingToDelete)
        );
      } catch (error) {
        console.error("Gagal menghapus Nama Ranting", error);
      }
      setRantingToDelete(null);
      setIsPopupDeleteNamaRantingVisible(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 mt-4 sm:mt-0 ml-4 sm:ml-0">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-col md:flex-row">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <main className="min-h-screen bg-gray-50 p-4 md:p-6">
            <nav className=" mt-6">
              <ul className="flex flex-wrap space-x-4 md:space-x-6">
                <li>
                  <Link
                    href="/ranting"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Tambah Ranting
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ranting/data"
                    className="text-gray-700 hover:text-teal-600"
                  >
                    Data Ranting
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-2">
                <h3 className="text-base font-bold mb-2">Tambah Ranting</h3>
                <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
                  {/* Kontainer Flex untuk Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                    {/* Tambah Nama Cabang */}
                    <div className="w-full">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Nama Cabang
                      </label>
                      <div className="relative w-full">
                        <Input
                          type="text"
                          value={selectedCabang}
                          readOnly
                          disabled={role === "ADMIN"}
                          onClick={handleCabangClick}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                          placeholder="Pilih Cabang"
                        />
                        {showCabangDropdown && (
                          <div
                            ref={dropdownRef}
                            className="absolute z-50 w-full border rounded-lg bg-white shadow-sm mt-1"
                          >
                            <ul className="max-h-44 overflow-y-auto">
                              <li className="py-2 px-2">
                                <Input
                                  type="text"
                                  onChange={(e) =>
                                    handleCabangSearch(e.target.value)
                                  }
                                  className="w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                                  placeholder="Cari atau ketik Cabang..."
                                  autoFocus
                                />
                              </li>

                              <li
                                onClick={() =>
                                  handleSelectCabang({ kecamatan: "" })
                                }
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                              >
                                Pilih Cabang
                              </li>
                              {[
                                ...(sessionStorage.getItem("role") ===
                                  "SUPERADMIN"
                                  ? [{ id: "All", kecamatan: "All" }]
                                  : []),
                                ...filteredCabangList,
                              ].map((cabang) => (
                                <li
                                  key={cabang.id}
                                  onClick={() => handleSelectCabang(cabang)}
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                >
                                  {cabang.kecamatan}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nama Ranting */}
                    <div className="w-full">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Nama Ranting
                      </label>
                      <div className="relative w-full">
                        <Select
                          value={selectedRanting}
                          onValueChange={(value) => setSelectedRanting(value)}
                          disabled={!selectedCabang}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Nama Ranting" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {allRantingList.map((ranting) => (
                                <SelectItem key={ranting.id} value={ranting.namaRanting}>
                                  {ranting.namaRanting}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Popup Konfirmasi Hapus */}
                    {isPopupDeleteNamaRantingVisible && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-3/4 md:w-2/4 lg:w-1/3 transform transition-all duration-300 scale-95 sm:scale-100">
                          <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
                            Apakah Anda yakin ingin menghapus data ini?
                          </h2>
                          <div className="flex justify-center gap-4 mt-4">
                            <button
                              onClick={() =>
                                setIsPopupDeleteNamaRantingVisible(false)
                              }
                              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition duration-200 shadow-sm"
                            >
                              Batal
                            </button>
                            <button
                              onClick={confirmDeleteRanting}
                              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 shadow-sm"
                            >
                              Ya, Saya Yakin
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tambah Unit Kerja */}
                    <div className="w-full">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Nama Unit Kerja
                      </label>
                      <div className="relative w-full">
                        <Select
                          value={selectedUnitKerja}
                          onValueChange={(value) => setSelectedUnitKerja(value === "ALL" ? "" : value)}
                          disabled={!selectedCabang}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Unit Kerja" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="ALL">Semua Unit Kerja</SelectItem>
                              {allUnitKerja
                                .filter((uk) => uk.cabang === selectedCabang)
                                .map((item) => (
                                  <SelectItem key={item.id} value={item.unitKerja}>
                                    {item.unitKerja}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tambah Ranting */}
                    <div className="w-full flex justify-end col-span-full">
                      <Button
                        type="button"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        onClick={addRanting}
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0 py-6">
                  <div className="flex items-center  space-x-2">
                    <Label htmlFor="entries" className="mr-2">
                      Show
                    </Label>
                    <select
                      id="entries"
                      className="border rounded p-1"
                      onChange={handleEntriesChange}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span className="ml-2">entries</span>
                  </div>
                </div>

                <div className="relative mb-4 flex flex-wrap items-end gap-4 md:flex-nowrap">
                  {/* Input Search */}
                  <div className="relative flex-grow min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="p-2 pl-10 border rounded w-full focus:ring-2 focus:ring-blue-500"
                      onChange={handleSearchChange}
                    />
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                    />
                  </div>

                  {/* Nama Cabang */}
                  <div className="flex-grow min-w-[200px]">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Cabang
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={filteredCabang}
                        readOnly
                        disabled={role === "ADMIN"}
                        onClick={handleFilteredCabangClick}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Pilih Cabang"
                      />
                      {showFilteredCabangDropdown && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-50 border rounded-lg bg-white shadow-md w-full max-h-44 overflow-y-auto"
                        >
                          <ul>
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                onChange={(e) =>
                                  handleFilteredCabangSearch(e.target.value)
                                }
                                className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Cari atau ketik Cabang..."
                                autoFocus
                              />
                            </li>

                            <li
                              onClick={() =>
                                handlefilteredCabang({ kecamatan: "" })
                              }
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              Pilih Cabang
                            </li>
                            {[
                              ...(sessionStorage.getItem("role") ===
                                "SUPERADMIN"
                                ? [{ id: "All", kecamatan: "All" }]
                                : []),
                              ...filteredCabangList,
                            ].map((cabang) => (
                              <li
                                key={cabang.id}
                                onClick={() => handlefilteredCabang(cabang)}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                              >
                                {cabang.kecamatan}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nama Ranting */}
                  <div className="flex-grow min-w-[200px]">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Ranting
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={filteredRanting}
                        readOnly
                        onClick={() => setShowFilteredRantingDropdown(true)}
                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 ${!filteredCabang ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        placeholder="Pilih Nama Ranting"
                      />
                      {showFilteredRantingDropdown && filteredCabang && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-50 border rounded-lg bg-white shadow-md w-full max-h-44 overflow-y-auto"
                        >
                          <ul>
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                onChange={(e) =>
                                  handleFilteredRantingSearch(e.target.value)
                                }
                                className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                                placeholder="Cari atau ketik Nama Ranting..."
                                autoFocus
                              />
                            </li>

                            <li
                              onClick={() =>
                                handleSelectFilteredRanting({ namaRanting: "" })
                              }
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              Pilih Nama Ranting
                            </li>

                            {allFilteredRantingList.map((ranting) => (
                              <li
                                key={ranting.id}
                                onClick={() =>
                                  handleSelectFilteredRanting(ranting)
                                }
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                              >
                                {ranting.namaRanting}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol Tambah Nama Ranting */}
                  <div className="flex-shrink-0">
                    <Button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={handleOpenPopup}
                    >
                      Tambah Nama Ranting
                    </Button>
                  </div>

                  {/* Popup */}
                  {isPopupVisible && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white p-6 rounded shadow-lg w-full sm:w-3/4 md:w-2/4 lg:w-2/5">
                        <h2 className="text-lg font-bold mb-4">
                          Tambah Nama Ranting
                        </h2>

                        {/* Nama Cabang dan Nama Ranting*/}
                        <div className="flex-grow">
                          <label className="block text-gray-700 text-sm font-bold mb-1">
                            Nama Cabang
                          </label>
                          <div className="flex items-center relative">
                            <Input
                              type="text"
                              value={selectedNamaRantingCabang}
                              readOnly
                              onClick={handleCabangNamaRantingClick}
                              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                              placeholder="Pilih Cabang"
                            />
                            {showNamaRantingCabangDropdown && (
                              <div
                                className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                                style={{ top: "100%", left: 0 }}
                              >
                                <ul className="max-h-44 overflow-y-auto">
                                  <li className="py-2 px-2">
                                    <Input
                                      type="text"
                                      onChange={(e) =>
                                        handleTambahRanting(e.target.value)
                                      }
                                      className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                                      placeholder="Cari atau ketik Cabang..."
                                      autoFocus
                                    />
                                  </li>

                                  <li
                                    onClick={() =>
                                      handleSelectNamaRantingCabang({
                                        kecamatan: "",
                                      })
                                    }
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                  >
                                    Pilih Cabang
                                  </li>
                                  {[
                                    ...(sessionStorage.getItem("role") ===
                                      "SUPERADMIN"
                                      ? [{ id: "All", kecamatan: "All" }]
                                      : []),
                                    ...filteredNamaRantingCabangList,
                                  ].map((cabang) => (
                                    <li
                                      key={cabang.id}
                                      onClick={() =>
                                        handleSelectNamaRantingCabang(cabang)
                                      }
                                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                                    >
                                      {cabang.kecamatan}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Input Nama Ranting */}
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-1 mt-3">
                              Nama Ranting
                            </label>
                            <Input
                              type="text"
                              className="border rounded w-full p-2"
                              placeholder="Masukkan Nama Ranting"
                              value={buatNamaRanting}
                              onChange={(e) =>
                                setBuatNamaRanting(e.target.value)
                              }
                            />
                          </div>

                          {/* Tombol Aksi */}
                          <div className="flex justify-end">
                            <Button
                              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded mr-2"
                              onClick={handleClosePopup}
                            >
                              Batal
                            </Button>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                              onClick={addNamaRanting}
                            >
                              Simpan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-max divide-y divide-gray-200 text-sm md:text-base">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 md:p-3 border text-left">No</th>
                        <th className="p-2 md:p-3 border text-left">Cabang</th>
                        <th className="p-2 md:p-3 border sm:table-cell text-left">
                          Nama Ranting
                        </th>
                        <th className="p-2 md:p-3 border hidden md:table-cell text-left">
                          Unit Kerja
                        </th>
                        <th className="p-2 md:p-3 border text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(filteredData) &&
                        filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <tr className="bg-gray-100">
                              <td className="p-2 md:p-3 border text-left align-top">
                                <>
                                  {index + 1 + currentPage * entries}
                                  {isMobile && (
                                    <FontAwesomeIcon
                                      icon={
                                        expandedRow === index
                                          ? faMinusCircle
                                          : faPlusCircle
                                      }
                                      className="text-blue-500 cursor-pointer ml-2"
                                      size="lg"
                                      onClick={() => toggleExpandRow(index)}
                                    />
                                  )}
                                </>
                              </td>
                              <td className="p-2 md:p-3 border text-left align-top">
                                {item.cabangList}
                              </td>
                              <td className="p-2 md:p-3 border text-left align-top">
                                {item.namaRanting}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.unitKerja?.split(", ").map((uk, i) => {
                                  const [unitKerjaId, unitKerjaName] =
                                    uk.split(":");
                                  return (
                                    <div
                                      key={unitKerjaId || i}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`unitKerja-${item.id}-${unitKerjaId || i
                                          }`}
                                        name={`unitKerja-${item.id}`}
                                        value={unitKerjaId}
                                        className="w-4 h-4"
                                        onChange={() =>
                                          handleCheckboxChange(unitKerjaId)
                                        }
                                      />
                                      <label
                                        htmlFor={`unitKerja-${item.id}-${unitKerjaId || i
                                          }`}
                                        className="whitespace-nowrap"
                                      >
                                        {unitKerjaName || uk}
                                      </label>
                                    </div>
                                  );
                                })}
                              </td>
                              <td className="p-2 md:p-3 border text-center">
                                <div className="flex flex-wrap justify-center space-x-2">
                                  <button
                                    className="bg-red-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-150"
                                    onClick={() => {
                                      item.id;
                                      setIsPopupDeleteVisible(true);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>
                              {isPopupDeleteVisible && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
                                  <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-3/4 md:w-2/4 lg:w-1/3 transform transition-all duration-300 scale-95 sm:scale-100">
                                    <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
                                      Apakah Anda yakin ingin menghapus data
                                      ini?
                                    </h2>
                                    <div className="flex justify-center gap-4 mt-4">
                                      <button
                                        onClick={() =>
                                          setIsPopupDeleteVisible(false)
                                        }
                                        className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition duration-200 shadow-sm"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteAdminClick(
                                            item.namaRanting
                                          )
                                        }
                                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 shadow-sm"
                                      >
                                        Ya, Saya Yakin
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </tr>
                            {expandedRow === index && (
                              <tr>
                                <td
                                  colSpan="9"
                                  className="px-4 py-4 bg-gray-50"
                                >
                                  <div className="flex flex-col items-center space-y-4">
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                      <div className="text-left">
                                        <h3 className="font-semibold">
                                          Unit Kerja:
                                        </h3>
                                        {item.unitKerja
                                          ?.split(", ")
                                          .map((uk, i) => {
                                            const [unitKerjaId, unitKerjaName] =
                                              uk.split(":");
                                            return (
                                              <div
                                                key={unitKerjaId || i}
                                                className="flex items-center space-x-2"
                                              >
                                                <input
                                                  type="checkbox"
                                                  id={`unitKerja-${item.id}-${unitKerjaId || i
                                                    }`}
                                                  name={`unitKerja-${item.id}`}
                                                  value={unitKerjaId}
                                                  className="w-4 h-4"
                                                  onChange={() =>
                                                    handleCheckboxChange(
                                                      unitKerjaId
                                                    )
                                                  }
                                                />
                                                <label
                                                  htmlFor={`unitKerja-${item.id
                                                    }-${unitKerjaId || i}`}
                                                  className="whitespace-nowrap"
                                                >
                                                  {unitKerjaName || uk}
                                                </label>
                                              </div>
                                            );
                                          })}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">
                                          Action:
                                        </h3>
                                        <button
                                          className="bg-red-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-150"
                                          onClick={() => {
                                            item.id;
                                            setIsPopupDeleteVisible(true);
                                          }}
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Tidak Ada Data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
