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
import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClipLoader } from "react-spinners";

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
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
  const [buatNamaRanting, setBuatNamaRanting] = useState("");

  const addRanting = async () => {
    if (!selectedRanting || !selectedCabang) {
      toast.error("Harap lengkapi Nama Ranting dan Cabang!");
      return;
    }
    try {
      const rantingData = {
        cabang: selectedCabang,
        namaRanting: selectedRanting,
        unitKerja: selectedUnitKerja,
      };
      const response = await GlobalApi.createRanting(rantingData);

      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Ranting berhasil ditambahkan!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setSelectedRanting("");
      setSelectedCabang("");
      setSelectedUnitKerja("");
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal menambahkan ranting. Coba lagi.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      console.error("Error adding ranting:", error);
    }
  };

  const addNamaRanting = async () => {
    if (!buatNamaRanting || !selectedNamaRantingCabang) {
      toast.error("Harap lengkapi Nama Ranting dan Cabang!");
      return;
    }

    try {
      const namaRanting = {
        cabang: selectedNamaRantingCabang,
        namaRanting: buatNamaRanting,
      };
      const response = await GlobalApi.createNamaRanting(namaRanting);

      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Nama Ranting berhasil ditambahkan!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setBuatNamaRanting("");
      setSelectedNamaRantingCabang("");
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Menambahkan Nama Ranting. Coba lagi.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      console.error("Error adding ranting:", error);
    }
  };

  const fetchData = async (page = currentPage, size = entries) => {
    try {
      const response = await GlobalApi.getGroupedNamaRantingWithCabang(
        page,
        size
      );
      setNamaRanting(response.content);
      setTotalEntries(response.totalElements);
      setTotalPages(response.totalPages);
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
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Ranting Berhasil Dihapus!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  const fetchRantingByCabang = async (cabang) => {
    if (!cabang) {
      console.warn("Cabang belum dipilih!");
      return;
    }

    try {
      const cabangToFetch = cabang.kecamatan || cabang;

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
    if (cabang.id === "All" && role === "SUPER ADMIN") {
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

  const handleUnitKerjaChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchUnitKerja(value);

    const filteredOptions = allUnitKerja.filter((uk) =>
      uk.unitKerja.toLowerCase().includes(value)
    );

    setFilteredUnitKerjaOptions(filteredOptions);
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

  const startIndex = currentPage * entries;
  const selectedData = filteredData?.slice(startIndex, startIndex + entries);

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchData(newPage, entries);
    }
  };

  const handleDeleteAdminClick = (deleteByNamaRanting) => {
    deleteRanting(deleteByNamaRanting);
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
    if (cabang.id === "All" && role === "SUPER ADMIN") {
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

    if (cabang.id === "All" && role === "SUPER ADMIN") {
      setSelectedNamaRantingCabang("All");
      setShowNamaRantingCabangDropdown(false);
    } else if (cabang.id !== "All") {
      setSelectedNamaRantingCabang(cabang.kecamatan);
      setShowNamaRantingCabangDropdown(false);
    } else {
      console.error("Role tidak memiliki akses ke opsi 'All'");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 mt-4 sm:mt-0 ml-4 sm:ml-0">
      <Toaster />
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-col md:flex-row">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
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
                <div className="bg-white p-6 rounded-lg shadow-md">
                  {/* Tambah Nama Cabang */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Cabang
                    </label>
                    <div className="flex items-center relative">
                      <Input
                        type="text"
                        value={selectedCabang}
                        readOnly
                        disabled={role === "ADMIN"}
                        onClick={handleCabangClick}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        placeholder="Pilih Cabang"
                      />
                      {showCabangDropdown && (
                        <div
                          className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                          style={{ top: "100%", left: 0 }}
                        >
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                onChange={(e) =>
                                  handleCabangSearch(e.target.value)
                                }
                                className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
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
                              "SUPER ADMIN"
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

                  {/* Tambah Nama Ranting */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Ranting
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={selectedRanting}
                        readOnly
                        onClick={() => setShowRantingDropdown(true)}
                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                          !selectedCabang ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        placeholder="Pilih Nama Ranting"
                      />
                      {showRantingDropdown && selectedCabang && (
                        <div
                          className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                          style={{ top: "100%", left: 0 }}
                        >
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                onChange={(e) =>
                                  handleRantingSearch(e.target.value)
                                }
                                className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                                placeholder="Cari atau ketik Nama Ranting..."
                                autoFocus
                              />
                            </li>

                            <li
                              onClick={() =>
                                handleSelectRanting({ namaRanting: "" })
                              }
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              Pilih Nama Ranting
                            </li>

                            {allRantingList.map((ranting) => (
                              <li
                                key={ranting.id}
                                onClick={() => handleSelectRanting(ranting)}
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

                  {/* Tambah Unit Kerja */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Unit Kerja
                    </label>
                    <div
                      ref={unitKerjaRef}
                      className="relative w-full mt-4 sm:mt-0"
                    >
                      <Input
                        type="text"
                        placeholder="Pilih Unit Kerja"
                        value={selectedUnitKerja}
                        readOnly
                        onFocus={() => {
                          if (
                            selectedRanting &&
                            selectedCabang !== "Pilih Cabang"
                          ) {
                            setShowDropdownUnitKerja(true);
                            setFilteredUnitKerjaOptions(
                              selectedCabang === "Pilih Cabang"
                                ? allUnitKerja
                                : allUnitKerja.filter(
                                    (uk) => uk.cabang === selectedCabang
                                  )
                            );
                          }
                        }}
                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                          !selectedRanting
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        disabled={!selectedRanting}
                      />

                      {showDropdownUnitKerja &&
                        selectedCabang !== "Pilih Cabang" && (
                          <div className="absolute z-10 border rounded bg-white shadow-lg mt-1 w-full max-w-full">
                            <div className="p-2 w-full">
                              <Input
                                type="text"
                                value={searchUnitKerja}
                                onChange={handleUnitKerjaChange}
                                placeholder="Cari Unit Kerja..."
                                className="w-full border rounded py-2 px-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              />
                            </div>
                            <ul className="max-h-56 overflow-y-auto mt-1 rounded-md">
                              <li
                                className="p-3 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
                                onClick={() => handleUnitKerjaSelect({})}
                              >
                                Semua Unit Kerja
                              </li>
                              {filteredUnitKerjaOptions.map((item) => (
                                <li
                                  key={item.id}
                                  className="p-3 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
                                  onClick={() => handleUnitKerjaSelect(item)}
                                >
                                  {item.unitKerja}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Tambah Ranting */}
                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150"
                      onClick={addRanting}
                    >
                      Tambah
                    </Button>
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

                <div className="relative mb-4 flex items-end gap-x-4">
                  {/* Input Search */}
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="p-2 pl-10 border rounded w-full"
                      onChange={handleSearchChange}
                    />
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                    />
                  </div>

                  {/* Nama Cabang */}
                  <div className="flex-grow">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Cabang
                    </label>
                    <div className="flex items-center relative">
                      <Input
                        type="text"
                        value={filteredCabang}
                        readOnly
                        disabled={role === "ADMIN"}
                        onClick={handleFilteredCabangClick}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                        placeholder="Pilih Cabang"
                      />
                      {showFilteredCabangDropdown && (
                        <div
                          className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                          style={{ top: "100%", left: 0 }}
                        >
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                onChange={(e) =>
                                  handleFilteredCabangSearch(e.target.value)
                                }
                                className="block w-full px-4 py-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
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
                              "SUPER ADMIN"
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
                  <div className="flex-grow">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Nama Ranting
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={filteredRanting}
                        readOnly
                        onClick={() => setShowFilteredRantingDropdown(true)}
                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                          !filteredCabang ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        placeholder="Pilih Nama Ranting"
                      />
                      {showFilteredRantingDropdown && filteredCabang && (
                        <div
                          className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full"
                          style={{ top: "100%", left: 0 }}
                        >
                          <ul className="max-h-44 overflow-y-auto">
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

                        {/* Nama Cabang */}
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
                                    "SUPER ADMIN"
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
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 md:p-3 border">No</th>
                        <th className="p-2 md:p-3 border ">Cabang</th>
                        <th className="p-2 md:p-3 border hidden md:table-cell">
                          Nama Ranting
                        </th>
                        <th className="p-2 md:p-3 border hidden md:table-cell">
                          Unit Kerja
                        </th>
                        <th className="p-2 border text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const showTotalAnggota =
                            index === 0 ||
                            item.cabang !== filteredData[index - 1].cabang;

                          return (
                            <React.Fragment key={item.id}>
                              <tr className="bg-gray-100">
                                <td className="p-2 md:p-3 border">
                                  {index + 1 + currentPage * entries}
                                </td>
                                <td className="p-2 md:p-3 border hidden md:table-cell">
                                  {item.cabangList}
                                </td>
                                <td className="p-2 md:p-3 border">
                                  {item.namaRanting}
                                </td>
                                <td className="p-2 md:p-3 border">
                                  {item.unitKerja.split(", ").map((uk, i) => (
                                    <div key={i}>
                                      {i + 1}. {uk}
                                    </div>
                                  ))}
                                </td>
                                <td className="p-2 border text-center">
                                  <div className="flex space-x-2 justify-center">
                                    <>
                                      <Button
                                        className="bg-red-500 text-white px-2 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                        onClick={() =>
                                          handleDeleteAdminClick(
                                            item.namaRanting
                                          )
                                        }
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </Button>
                                    </>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-4 text-center">
                            Tidak Ada Data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between text-sm mt-4 items-center space-y-2 md:space-y-0 md:space-x-2">
                  <span className="text-center md:text-left">
                    Showing {currentPage * entries + 1} to{" "}
                    {Math.min((currentPage + 1) * entries, totalEntries)} of{" "}
                    {totalEntries} entries
                  </span>

                  <div className="flex flex-wrap justify-center md:justify-end space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`px-3 py-1 border text-sm rounded ${
                        currentPage === 0 ? "bg-gray-300" : "bg-white"
                      }`}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => {
                      if (
                        index < 3 ||
                        index > totalPages - 4 ||
                        (index >= currentPage - 1 && index <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`px-3 py-1 border text-sm rounded ${
                              currentPage === index
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                            }`}
                          >
                            {index + 1}
                          </button>
                        );
                      }
                      if (index === 3 || index === totalPages - 4) {
                        return (
                          <span
                            key={index}
                            className="px-3 py-1 border text-sm rounded text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`px-3 py-1 border text-sm rounded ${
                        currentPage === totalPages - 1
                          ? "bg-gray-300"
                          : "bg-white"
                      }`}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </button>
                  </div>
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
