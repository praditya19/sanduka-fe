"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaPlusCircle, FaMinusCircle, FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { ClipLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const Page = () => {
  // baru
  const [pensiunList, setPensiunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [queryCabang, setQueryCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredPensiunList, setFilteredPensiunList] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [fetchedPages, setFetchedPages] = useState([]);
  const itemsPerPage = 10;
  // end
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [totalAnggota, setTotalAnggota] = useState(0); // State untuk menyimpan jumlah total anggota
  const router = useRouter();
  const { token } = useAuth();
  const [popupVisible, setPopupVisible] = useState(false);
  const startNumber = (currentPage - 1) * itemsPerPage;
  const [statusSegeraCount, setStatusSegeraCount] = useState(0);
  const [fotoBase64, setFotoBase64] = useState("");
  const profileImageUrl = "/profile.png";

  const fetchPensiunData = async (page, size = 10, cabang = "", searchText = "", month = "", year = "") => {
    setLoading(true);
    try {
      const fetchedData = await GlobalApi.getAllPensiun(
        page,
        size,
        cabang,
        month,
        year,
        searchText
      );

      if (fetchedData && fetchedData.data.content) {
        const fotoBase64Array = [];

        fetchedData.data.content.forEach((item) => {
          if (item.foto) {
            try {
              const decodedString = atob(item.foto);
              fotoBase64Array.push(decodedString);
            } catch (error) {
              console.error("Error decoding Base64:", error);
              fotoBase64Array.push(null);
            }
          } else {
            fotoBase64Array.push(null);
          }
        });

        setFotoBase64(fotoBase64Array);

        setPensiunList(fetchedData.data.content);
        setTotalPages(fetchedData.data.totalPages || 0);
        setHasMore(fetchedData.data.content.length > 0);
        setTotalAnggota(fetchedData.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setCurrentPage(1); 
    fetchPensiunData(0, 10, selectedCabang, value, selectedMonth, selectedYear);
  };

  useEffect(() => {
    const filterData = () => {
      if (!searchText) {
        setFilteredPensiunList(pensiunList);
        return;
      }
      const filtered = pensiunList.filter((item) =>
        Object.values(item).some((val) =>
          val
            ? val.toString().toLowerCase().includes(searchText.toLowerCase())
            : false
        )
      );
      setFilteredPensiunList(filtered);
    };

    filterData();
  }, [searchText, pensiunList]);

  useEffect(() => {
    fetchPensiunData(0, itemsPerPage, selectedCabang, searchText, selectedMonth, selectedYear);
  }, [selectedCabang, selectedMonth, selectedYear]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    filteredPensiunList.length > itemsPerPage
      ? filteredPensiunList.slice(indexOfFirstItem, indexOfLastItem)
      : filteredPensiunList;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
      fetchPensiunData(currentPage + 1, itemsPerPage, selectedCabang, searchText, selectedMonth, selectedYear);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      fetchPensiunData(currentPage - 1, itemsPerPage, selectedCabang, searchText, selectedMonth, selectedYear);
    }
  };

  const getVisiblePages = () => {
    const visibleRange = 2;
    const pages = [];

    for (
      let i = Math.max(1, currentPage - visibleRange);
      i <= Math.min(totalPages, currentPage + visibleRange);
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageClick = async (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      fetchPensiunData(pageNumber - 1, itemsPerPage, selectedCabang, searchText, selectedMonth, selectedYear);
    }
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan || "");
    setQueryCabang("");
    setShowDropdownCabang(false);
    setCurrentPage(1);
    fetchPensiunData(0, itemsPerPage, cabang.kecamatan || "", searchText, selectedMonth, selectedYear);
  };

  useEffect(() => {
    const fetchCabang = async () => {
      try {
        const response = await GlobalApi.getCabang();
        const sortedCabang = response.data.sort((a, b) =>
          a.kecamatan.localeCompare(b.kecamatan)
        );
        setCabangOptions(sortedCabang || []);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    const role = sessionStorage.getItem("role");
    if (role === "ADMIN") {
      const cabang = sessionStorage.getItem("cabang");
      setSelectedCabang(cabang || "");
    } else if (role === "SUPER ADMIN") {
      fetchCabang();
    }
  }, []);

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

  const applyFilters = async (month, year) => {
    setLoading(true);
    try {
      const size = month || year ? 50 : itemsPerPage;

      const fetchedData = await GlobalApi.getAllPensiun(
        0,
        size,
        selectedCabang,
        month,
        year
      );

      if (fetchedData && fetchedData.data.content) {
        setFilteredPensiunList(fetchedData.data.content);
        setIsFiltered(true);
        setTotalPages(
          Math.ceil(fetchedData.data.content.length / itemsPerPage)
        );
        setHasMore(fetchedData.data.content.length > 0);
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    setCurrentPage(1);
    fetchPensiunData(0, itemsPerPage, selectedCabang, searchText, month, selectedYear);
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    setCurrentPage(1);
    fetchPensiunData(0, itemsPerPage, selectedCabang, searchText, selectedMonth, year);
  };

  useEffect(() => {
    applyFilters("", "");
  }, []);

  useEffect(() => {
    fetchPensiunData(0, itemsPerPage, "");

    const role = sessionStorage.getItem("role");
    if (role === "ADMIN") {
      const cabang = sessionStorage.getItem("cabang");
      setSelectedCabang(cabang || "");
    } else if (role === "SUPER ADMIN") {
      const fetchCabang = async () => {
        try {
          const response = await GlobalApi.getCabang();
          const sortedCabang = response.data.sort((a, b) =>
            a.kecamatan.localeCompare(b.kecamatan)
          );
          setCabangOptions(sortedCabang || []);
        } catch (error) {
          console.error("Error fetching cabang data:", error);
        }
      };
      fetchCabang();
    }
  }, []);

  const handleDownloadExcel = async (cabang, bulan, tahun) => {
    setIsLoading(true);
    try {
      const response = await GlobalApi.getAllPensiun(
        0,
        500,
        cabang,
        bulan,
        tahun
      );
  
      const jsonData = Array.isArray(response.data.content)
        ? response.data.content
        : [];
  
      if (jsonData.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }
  
      const filteredData = jsonData.map((row, index) => ({
        "No.": index + 1,
        "Prediksi Pensiun": formatDate(row.prediksiPensiun),
        Nama: row.namaLengkap,
        NPA: row.npa,
        "Tempat Lahir": row.tempatLahir,
        "Tanggal Lahir": formatDate(row.tanggalLahir),
        Jabatan: row.jabatan,
        "Unit Kerja": row.unitKerja,
        Usia: row.usia,
        Cabang: row.cabang,
        Status:
          row.keterangan === null
            ? row.status === "Segera"
              ? "Segera"
              : "Aktif"
            : "Aktif",
        "Nomor HP": row.nomorHp || "-",
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pensiun");
  
      XLSX.writeFile(workbook, `data_pensiun_${tahun}_${bulan || "all"}.xlsx`);
    } catch (error) {
      console.error("Gagal mendownload data:", error);
      alert("Terjadi kesalahan saat mendownload data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (nomorHp) => {
    try {
      if (nomorHp) {
        let phoneNumber = nomorHp.startsWith("0")
          ? `+62${nomorHp.slice(1)}`
          : nomorHp;

        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, "_blank");
      } else {
        console.error("Nomor HP tidak ditemukan atau tidak valid.");
      }
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat memproses permintaan:",
        error.message
      );
    }
  };

  useEffect(() => {
    const role = sessionStorage.getItem("role");

    if (role === "ADMIN" || role === "SUPER ADMIN") {
      const countSegera = filteredPensiunList.filter(
        (item) => item.status === "Segera"
      ).length;
      setStatusSegeraCount(countSegera);
    }
  }, [currentItems]);

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", options);
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const futureYears = Array.from({ length: 11 }, (_, i) => currentYear + i);
    setYearOptions(futureYears);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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

  const handlePopup = async (npa) => {
    try {
      const response = await GlobalApi.cekNpa(npa);

      if (response && response && response.id) {
        const id = response.id;

        sessionStorage.setItem("idPensiun", id);

        setPopupVisible(true);
      } else {
        console.error("ID tidak ditemukan dalam respon API");
      }
    } catch (error) {
      console.error("Error saat mengambil NPA:", error);
    }
  };

  const handleCancelKeluar = () => {
    setPopupVisible(false);
  };

  const handlePensiunAnggota = async () => {
    try {
      const idPensiun = sessionStorage.getItem("idPensiun");
      await GlobalApi.pensiunAnggota(idPensiun);
      setPopupVisible(false);

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
            Anggota berhasil Pensiun!
          </strong>
        </div>,
        {
          icon: null,
          duration: 2000,
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
      }, 2000);
    } catch (error) {
      console.error("Gagal pensiun anggota:", error);
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
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Anggota Gagal Pensiun.
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
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
    }
  };

  if (error) return <div>Error: {error}</div>;

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        toastOptions={{
          style: {
            marginTop: "16%",
            fontSize: "1.25rem",
            padding: "16px",
            width: "90%",
            maxWidth: "500px",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            style: {
              background: "white",
              color: "#10b981",
              border: "1px solid #10b981",
            },
          },
          error: {
            style: {
              background: "white",
              color: "#ef4444",
              border: "1px solid #ef4444",
            },
          },
        }}
      />

      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="p-4 md:p-6 pt-20">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 mt-5">
                Data Anggota Pensiun
              </h1>

              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Filter Cabang */}
                <div className="relative">
                  <label
                    htmlFor="cabangInput"
                    className="text-sm font-medium text-gray-600 mb-1 block"
                  >
                    Pilih Cabang
                  </label>
                  <Input
                    id="cabangInput"
                    type="text"
                    className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
                    placeholder={selectedCabang || "Tampil Semua"}
                    value={
                      sessionStorage.getItem("role") === "SUPER ADMIN"
                        ? selectedCabang
                        : sessionStorage.getItem("cabang") || "Tampil Semua"
                    }
                    disabled={sessionStorage.getItem("role") !== "SUPER ADMIN"}
                    readOnly={sessionStorage.getItem("role") !== "SUPER ADMIN"}
                    onClick={() => {
                      if (sessionStorage.getItem("role") === "SUPER ADMIN") {
                        setShowDropdownCabang(true);
                      }
                    }}
                  />
                  {showDropdownCabang &&
                    sessionStorage.getItem("role") === "SUPER ADMIN" && (
                      <div
                        id="dropdownCabang"
                        className="absolute z-10 border rounded-lg bg-white shadow-md mt-1 w-full"
                      >
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              className="border-b p-2 w-full bg-white"
                              placeholder="Cari Cabang..."
                              value={queryCabang}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.trim().length > 0) setQueryCabang(value);
                              }}
                              autoFocus
                            />
                          </li>
                          <li
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCabangSelect({
                                kecamatan: "",
                                idKecamatan: null,
                              })
                            }
                          >
                            Tampil Semua
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

                {/* Filter Bulan */}
                <div>
                  <label
                    htmlFor="bulanInput"
                    className="text-sm font-medium text-gray-600 mb-1 block"
                  >
                    Pilih Bulan
                  </label>
                  <select
                    id="bulanInput"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="p-2 border rounded-lg w-full bg-white shadow-sm"
                  >
                    <option value="">Pilih Bulan</option>
                    {bulanOptions.map((bulan) => (
                      <option key={bulan.id} value={bulan.angkaBulan}>
                        {bulan.namaBulan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Tahun */}
                <div>
                  <label
                    htmlFor="tahunInput"
                    className="text-sm font-medium text-gray-600 mb-1 block"
                  >
                    Pilih Tahun
                  </label>
                  <select
                    id="tahunInput"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="p-2 border rounded-lg w-full bg-white shadow-sm"
                  >
                    <option value="">Pilih Tahun</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Cari */}
                <div>
                  <label
                    htmlFor="searchInput"
                    className="text-sm font-medium text-gray-600 mb-1 block"
                  >
                    Cari Anggota
                  </label>
                  <div className="relative">
                    <input
                      id="searchInput"
                      type="text"
                      placeholder="Cari nama, NPA..."
                      value={searchText}
                      onChange={handleSearchChange}
                      className="p-2 pl-8 border rounded-lg w-full bg-white shadow-sm"
                    />
                    <span className="absolute left-2 top-2 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary and Actions */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    Jumlah Anggota: {totalAnggota} Orang {/* Tampilkan totalAnggota */}
                  </span>
                </div>

                <button
                  className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  onClick={() =>
                    !isLoading &&
                    handleDownloadExcel(
                      selectedCabang,
                      selectedMonth,
                      selectedYear
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 100 8H4z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  )}
                  Download Excel
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <ClipLoader color="#3498db" size={50} />
                  <span className="ml-4 text-gray-600">
                    Memuat data anggota...
                  </span>
                </div>
              ) : filteredPensiunList.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 mt-4">
                    Tidak ada data anggota yang ditemukan
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-teal-700 text-white">
                          <th className="py-3 px-4 text-center">No.</th>
                          <th className="py-3 px-4 text-center">Foto</th>
                          <th className="py-3 px-4 text-center hidden lg:table-cell">
                            Prediksi Pensiun
                          </th>
                          <th className="py-3 px-4 text-left">Data Anggota</th>
                          <th className="py-3 px-4 text-left hidden lg:table-cell">
                            Keanggotaan
                          </th>
                          <th className="py-3 px-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((pensiun, index) => (
                          <React.Fragment key={pensiun.id}>
                            <tr
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="py-3 px-4 text-center">
                                {startNumber + index + 1}
                                <Button
                                  className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden ml-2"
                                  onClick={() => handleExpand(index)}
                                >
                                  {expandedIndex === index ? (
                                    <FaMinusCircle />
                                  ) : (
                                    <FaPlusCircle />
                                  )}
                                </Button>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center">
                                  <div className="w-12 h-12 relative overflow-hidden rounded-full border-2 border-teal-600">
                                    <Image
                                      src={
                                        fotoBase64[index]
                                          ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                          : profileImageUrl
                                      }
                                      layout="fill"
                                      objectFit="cover"
                                      alt="Anggota Foto"
                                      unoptimized={true}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center hidden lg:table-cell">
                                <span className="bg-orange-100 text-orange-800 py-1 px-2 rounded-full text-sm">
                                  {formatDate(pensiun.prediksiPensiun)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-800">
                                  {pensiun.namaLengkap}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  NPA: {pensiun.npa}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  {pensiun.tempatLahir},{" "}
                                  {formatDate(pensiun.tanggalLahir)}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  Cabang: {pensiun.cabang}
                                </div>
                              </td>
                              <td className="py-3 px-4 hidden lg:table-cell">
                                <div className="font-medium">
                                  {pensiun.jabatan}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  {pensiun.unitKerja}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  Usia: {pensiun.usia} tahun
                                </div>
                                <div className="mt-1">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${pensiun.status === "Segera"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                      }`}
                                  >
                                    {pensiun.keterangan === null
                                      ? pensiun.status === "Segera"
                                        ? "Segera Pensiun"
                                        : "Aktif"
                                      : "Aktif"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    type="button"
                                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center"
                                    onClick={() => handlePopup(pensiun.npa)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                                      />
                                    </svg>
                                    Pensiun
                                  </button>
                                  <button
                                    type="button"
                                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                                    onClick={() =>
                                      handleWhatsApp(pensiun.nomorHp)
                                    }
                                  >
                                    <FaWhatsapp className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedIndex === index && (
                              <tr className="bg-gray-100 lg:hidden">
                                <td
                                  colSpan="4"
                                  className="py-3 px-4 text-sm border-t"
                                >
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                      <div className="text-teal-700 font-medium mb-1">
                                        Prediksi Pensiun
                                      </div>
                                      <div>
                                        {formatDate(pensiun.prediksiPensiun)}
                                      </div>
                                    </div>

                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                      <div className="text-teal-700 font-medium mb-1">
                                        Keanggotaan
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Jabatan:
                                        </span>{" "}
                                        {pensiun.jabatan}
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Unit Kerja:
                                        </span>{" "}
                                        {pensiun.unitKerja}
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Usia:
                                        </span>{" "}
                                        {pensiun.usia} tahun
                                      </div>
                                      <div className="mt-1">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${pensiun.status === "Segera"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                          {pensiun.keterangan === null
                                            ? pensiun.status === "Segera"
                                              ? "Segera Pensiun"
                                              : "Aktif"
                                            : "Aktif"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 mt-2">
                                      <button
                                        type="button"
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex-1 flex items-center justify-center"
                                        onClick={() => handlePopup(pensiun.npa)}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 mr-1"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                                          />
                                        </svg>
                                        Pensiun
                                      </button>
                                      <button
                                        type="button"
                                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                                        onClick={() =>
                                          handleWhatsApp(pensiun.nomorHp)
                                        }
                                      >
                                        <FaWhatsapp className="h-6 w-6" />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="p-4 border-t">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => handlePageClick(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                          />
                        </svg>
                        First
                      </button>
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Prev
                      </button>

                      {getVisiblePages().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-3 py-1 border rounded-md text-sm ${page === currentPage
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white hover:bg-gray-50"
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      {totalPages > 3 && currentPage < totalPages - 3 && (
                        <span className="px-2 py-1">...</span>
                      )}

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageClick(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                      >
                        Last
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {popupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md text-center shadow-xl transform transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-yellow-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Konfirmasi Pensiun
            </h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin untuk mengubah status anggota menjadi pensiun?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelKeluar}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handlePensiunAnggota}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition duration-200 font-medium"
              >
                Ya, Saya Yakin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
