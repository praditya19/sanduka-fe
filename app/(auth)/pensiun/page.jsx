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

  const itemsPerPage = 10;
  // end
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const router = useRouter();
  const { token } = useAuth();
  const [popupVisible, setPopupVisible] = useState(false);
  const startNumber = (currentPage - 1) * itemsPerPage;
  const [statusSegeraCount, setStatusSegeraCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchPensiunData = async (
    page,
    size = 50,
    cabang = "",
    search = ""
  ) => {
    setLoading(true);
    try {
      const fetchedData = await GlobalApi.getAllPensiun(
        page,
        size,
        cabang,
        search
      );
      console.log("Data yang diambil dari API:", fetchedData.data.content);

      if (fetchedData && fetchedData.data.content) {
        setPensiunList((prevList) =>
          page === 0
            ? fetchedData.data.content
            : [...prevList, ...fetchedData.data.content]
        );
        setTotalPages(fetchedData.data.totalPages || 0);
        setHasMore(fetchedData.data.content.length > 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    fetchPensiunData(0, 50, selectedCabang);
  }, [selectedCabang]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    filteredPensiunList.length > itemsPerPage
      ? filteredPensiunList.slice(indexOfFirstItem, indexOfLastItem)
      : filteredPensiunList;

  const handleNextPage = () => {
    if (indexOfLastItem < pensiunList.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (hasMore) {
      fetchPensiunData(currentPage, 50, selectedCabang);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan || "");
    setQueryCabang("");
    setShowDropdownCabang(false);
    setCurrentPage(1);
    fetchPensiunData(0, 50, cabang.kecamatan || "");
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
      const fetchedData = await GlobalApi.getAllPensiun(
        0,
        itemsPerPage,
        selectedCabang,
        month,
        year
      );
      console.log(
        "Data yang diambil dari API setelah filter:",
        fetchedData.data.content
      );

      if (fetchedData && fetchedData.data.content) {
        setPensiunList(fetchedData.data.content);
        setTotalPages(fetchedData.data.totalPages || 0);
        setHasMore(fetchedData.data.content.length > 0);
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
    applyFilters(month, selectedYear);
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    applyFilters(selectedMonth, year);
  };

  useEffect(() => {
    applyFilters("", "");
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

      console.log("Response Data:", response.data);

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
        // Jika nomor HP diawali dengan "0", ubah ke format "+62"
        let phoneNumber = nomorHp.startsWith("0")
          ? `+62${nomorHp.slice(1)}`
          : nomorHp;

        // Buat URL WhatsApp
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
    const uniqueYears = Array.from(
      new Set(
        pensiunList.map((pensiun) =>
          new Date(pensiun.prediksiPensiun).getFullYear()
        )
      )
    ).sort();
    setYearOptions(uniqueYears);
  }, [pensiunList]);

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
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <Toaster
        toastOptions={{
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
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "#f44336",
              color: "#fff",
            },
          },
        }}
      />
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full flex flex-wrap items-center justify-between mb-4 mt-16 gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                {/* Filter Cabang */}
                <div className="w-full sm:w-1/4 flex flex-col items-start relative">
                  <label
                    htmlFor="cabangInput"
                    className="text-sm font-medium mb-1"
                  >
                    Pilih Cabang
                  </label>
                  <Input
                    id="cabangInput"
                    type="text"
                    className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
                    placeholder={selectedCabang || "Pilih Cabang"}
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
                        className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[27%] w-full"
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
                                if (value.trim().length > 0)
                                  setQueryCabang(value);
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
                <div className="w-full sm:w-1/4 flex flex-col">
                  <label
                    htmlFor="bulanInput"
                    className="text-sm font-medium mb-1"
                  >
                    Pilih Bulan
                  </label>
                  <select
                    id="bulanInput"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
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
                <div className="w-full sm:w-1/4 flex flex-col">
                  <label
                    htmlFor="tahunInput"
                    className="text-sm font-medium mb-1"
                  >
                    Pilih Tahun
                  </label>
                  <select
                    id="tahunInput"
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
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
                <div className="w-full sm:w-1/4 flex flex-col">
                  <label
                    htmlFor="searchInput"
                    className="text-sm font-medium mb-1"
                  >
                    Cari Anggota
                  </label>
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Cari ..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
                  />
                </div>
              </div>

              <div className="w-full flex justify-center gap-2 md:w-auto">
                <button
                  className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-blue-700"
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
                      className="animate-spin h-5 w-5 text-white"
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
                    "Download Excel"
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between mb-4">
                <span>Jumlah Anggota: {filteredPensiunList.length} Orang</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white mt-4">
                  <thead className="bg-teal-700 text-white">
                    <tr>
                      <th className="py-2 px-3 text-center">No.</th>
                      <th className="py-2 px-3 text-center">Foto</th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Prediksi Pensiun
                      </th>
                      <th className="py-2 px-3 text-center">Data Anggota</th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Keanggotaan
                      </th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Cabang
                      </th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center hidden lg:table-cell">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <ClipLoader color="#3498db" size={50} />
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((pensiun, index) => (
                        <>
                          <tr key={pensiun.id} className="border-t">
                            <td className="py-2 px-3 text-center">
                              {startNumber + index + 1}
                              <Button
                                className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden"
                                onClick={() => handleExpand(index)}
                              >
                                {expandedIndex === index ? (
                                  <FaMinusCircle />
                                ) : (
                                  <FaPlusCircle />
                                )}
                              </Button>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <img
                                src="/profile.png"
                                alt="Foto"
                                className="w-10 h-10 rounded-full"
                              />
                            </td>
                            <td className="py-2 px-3 text-center hidden lg:table-cell">
                              {formatDate(pensiun.prediksiPensiun)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div>{pensiun.namaLengkap}</div>
                              <div>{pensiun.npa}</div>
                              <div>
                                {pensiun.tempatLahir},{" "}
                                {formatDate(pensiun.tanggalLahir)}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center hidden lg:table-cell">
                              <div>{pensiun.jabatan}</div>
                              <div>{pensiun.unitKerja}</div>
                              <div>Usia: {pensiun.usia}</div>
                            </td>
                            <td className="py-2 px-3 text-center hidden lg:table-cell">
                              {pensiun.cabang}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {pensiun.keterangan === null
                                ? pensiun.status === "Segera"
                                  ? "Segera"
                                  : "Aktif"
                                : "Aktif"}
                            </td>
                            <td className="py-2 px-3 text-center hidden lg:table-cell">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  type="button"
                                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                  onClick={() => handlePopup(pensiun.npa)}
                                >
                                  Pensiun
                                </button>
                                <button
                                  type="button"
                                  className="flex items-center text-green-500 hover:text-green-600"
                                  onClick={() =>
                                    handleWhatsApp(pensiun.nomorHp)
                                  }
                                >
                                  <FaWhatsapp className="h-6 w-6 mr-2" />
                                </button>
                              </div>
                              {popupVisible && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex justify-center items-center z-50">
                                  <div className="bg-white rounded-lg p-6 w-2/5 text-center shadow-lg">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                      Apakah Anda yakin ?
                                    </h2>
                                    <p className="text-gray-600 mt-2 mb-4">
                                      Apakah Anda yakin untuk mengubah anggota
                                      menjadi pensiun?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                      <button
                                        onClick={handleCancelKeluar}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={handlePensiunAnggota}
                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                                      >
                                        Ya, Saya Yakin
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                          {expandedIndex === index && (
                            <tr className="bg-gray-100 lg:hidden">
                              <td
                                colSpan="3"
                                className="py-2 px-3 text-sm border-t"
                              >
                                <div>
                                  <strong>Prediksi Pensiun:</strong>{" "}
                                  {formatDate(pensiun.prediksiPensiun)}
                                </div>
                                <div>
                                  <strong>Keanggotaan:</strong>{" "}
                                  {pensiun.jabatan}, {pensiun.unitKerja}
                                </div>
                                <div>
                                  <strong>Usia:</strong> {pensiun.usia}
                                </div>
                                <div>
                                  <strong>Cabang ke-2:</strong> {pensiun.cabang}
                                </div>
                                <div>
                                  <strong>Status:</strong> {pensiun.status}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={() => handlePopup(pensiun.npa)}
                                  >
                                    Pensiun
                                  </button>
                                  <button
                                    type="button"
                                    className="flex items-center text-green-500 hover:text-green-600"
                                    onClick={() =>
                                      handleWhatsApp(pensiun.nomorHp)
                                    }
                                  >
                                    <FaWhatsapp className="h-6 w-6 mr-2" />
                                  </button>
                                </div>
                                {popupVisible && (
                                  <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex justify-center items-center z-50">
                                    <div className="bg-white rounded-lg p-6 w-4/5 sm:w-2/5 md:w-1/3 text-center shadow-lg">
                                      <h2 className="text-lg font-semibold text-gray-800">
                                        Apakah Anda yakin ?
                                      </h2>
                                      <p className="text-gray-600 mt-2 mb-4">
                                        Apakah Anda yakin untuk mengubah anggota
                                        menjadi pensiun?
                                      </p>
                                      <div className="flex justify-center gap-4">
                                        <button
                                          onClick={handleCancelKeluar}
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                                        >
                                          Batal
                                        </button>
                                        <button
                                          onClick={handlePensiunAnggota}
                                          className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                                        >
                                          Ya, Saya Yakin
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="flex flex-wrap justify-center mt-4 gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  First
                </button>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Prev
                </button>

                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      page === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {totalPages > 5 && currentPage < totalPages - 3 && (
                  <span className="px-2">...</span>
                )}

                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Last
                </button>
              </div>

              {/* {filteredPensiunList.length > 0 && (
                <div className="flex justify-center mt-4 gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    First
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Prev
                  </button>
                  {getVisiblePages().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        page === currentPage
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Last
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
