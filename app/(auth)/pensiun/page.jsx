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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Page = () => {
  const [pensiunList, setPensiunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const router = useRouter();
  const { token } = useAuth();
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bulanOptions, setBulanOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [filteredPensiunList, setFilteredPensiunList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const startNumber = (currentPage - 1) * itemsPerPage;
  const [statusSegeraCount, setStatusSegeraCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setSelectedStatus(status);

    const filteredItems = pensiunList.filter((pensiun) => {
      if (status === "Pensiun") {
        return pensiun.keterangan === "Pensiun";
      }

      if (status === "Segera") {
        return pensiun.keterangan === null && pensiun.status === "Segera";
      }

      return true;
    });

    setFilteredPensiunList(filteredItems);
  };

  const handleFiltersChange = (newStatus) => {
    const filteredItems = pensiunList.filter((pensiun) => {
      const statusFilter =
        newStatus === "Pensiun"
          ? pensiun.keterangan === "Pensiun"
          : newStatus === "Segera"
          ? pensiun.keterangan === null && pensiun.status === "Segera"
          : true;

      const tahunPrediksi = new Date(pensiun.prediksiPensiun).getFullYear();
      const yearFilter =
        selectedYear === "" || tahunPrediksi.toString() === selectedYear;

      return statusFilter && yearFilter;
    });

    setFilteredPensiunList(filteredItems);
  };

  const toggleStatus = () => {
    const newStatus = selectedStatus === "Segera" ? "" : "Segera";
    setSelectedStatus(newStatus);
    handleFiltersChange(newStatus);
  };

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

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);

    if (month) {
      const filtered = pensiunList.filter((item) => {
        const itemMonth = new Date(item.tanggalLahir).getMonth() + 2;
        return itemMonth === parseInt(month);
      });
      setFilteredPensiunList(filtered);
    } else {
      setFilteredPensiunList(pensiunList);
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    applyFilters(selectedMonth, year);
    setCurrentPage(1);
  };

  const handleWhatsApp = async (npa) => {
    try {
      const cekNpaResponse = await GlobalApi.cekNpa(npa);

      if (cekNpaResponse && cekNpaResponse.id) {
        const userId = cekNpaResponse.id;

        const userData = await GlobalApi.getUserById(userId);

        if (userData && userData.nomorHp) {
          let phoneNumber = userData.nomorHp;

          if (phoneNumber.startsWith("0")) {
            phoneNumber = `+62${phoneNumber.slice(1)}`;
          }

          const whatsappUrl = `https://wa.me/${phoneNumber}`;
          window.open(whatsappUrl, "_blank");
        } else {
          console.error("Nomor HP tidak ditemukan untuk pengguna ini.");
        }
      } else {
        console.error("NPA tidak valid atau ID tidak ditemukan.");
      }
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat memproses permintaan:",
        error.message
      );
    }
  };

  useEffect(() => {
    const fetchPensiunData = async () => {
      try {
        const fetchedData = await GlobalApi.getAllPensiun();

        if (fetchedData && fetchedData.data.content) {
          const allPensiunList = fetchedData.data.content;

          const segeraItems = allPensiunList.filter(
            (item) => item.keterangan === null && item.status === "Segera"
          );

          const countSegera = segeraItems.length;

          sessionStorage.setItem("statusSegera", countSegera.toString());

          setStatusSegeraCount(countSegera);

          setPensiunList(allPensiunList);

          setFilteredPensiunList(allPensiunList);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const storedStatusSegera = sessionStorage.getItem("statusSegera");
    if (storedStatusSegera) {
      setStatusSegeraCount(parseInt(storedStatusSegera, 10));
    }

    fetchPensiunData();
  }, []);

  const applyFilters = (month, year) => {
    const filteredList = pensiunList.filter((pensiun) => {
      const pensiunDate = new Date(pensiun.prediksiPensiun);
      const pensiunMonth = pensiunDate.getMonth() + 1;
      const pensiunYear = pensiunDate.getFullYear();
      return (
        (!month || pensiunMonth === parseInt(month)) &&
        (!year || pensiunYear === parseInt(year))
      );
    });

    setFilteredPensiunList(filteredList);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPensiunList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    const role = sessionStorage.getItem("role");

    if (role === "ADMIN" || role === "SUPER ADMIN") {
      const countSegera = filteredPensiunList.filter(
        (item) => item.status === "Segera"
      ).length;
      setStatusSegeraCount(countSegera);
    }
  }, [currentItems]);

  const totalPages = Math.ceil(filteredPensiunList.length / itemsPerPage);

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);

    const filtered = pensiunList.filter((item) =>
      Object.values(item).some((val) =>
        val ? val.toString().toLowerCase().includes(value) : false
      )
    );
    setFilteredPensiunList(filtered);
  };

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

  const downloadTableAsExcel = async (dataToExport) => {
    try {
      const fetchPhoneNumbers = async (npa) => {
        try {
          const cekNpaResponse = await GlobalApi.cekNpa(npa);

          if (cekNpaResponse && cekNpaResponse.id) {
            const userData = await GlobalApi.getUserById(cekNpaResponse.id);

            if (userData && userData.nomorHp) {
              let phoneNumber = userData.nomorHp;

              if (phoneNumber.startsWith("0")) {
                phoneNumber = `+62${phoneNumber.slice(1)}`;
              }
              return phoneNumber;
            }
          }
          return "Tidak tersedia";
        } catch (error) {
          console.error(
            `Error fetching phone number for NPA ${npa}:`,
            error.message
          );
          return "Error";
        }
      };

      const exportData = await Promise.all(
        dataToExport.map(async (row, index) => {
          const nomorHp = await fetchPhoneNumbers(row.npa);

          return {
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
            "Nomor HP": nomorHp,
          };
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      worksheet["!cols"] = [
        { wpx: 50 },
        { wpx: 120 },
        { wpx: 200 },
        { wpx: 100 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 150 },
        { wpx: 150 },
        { wpx: 50 },
        { wpx: 150 },
        { wpx: 100 },
        { wpx: 150 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anggota");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, "Data_Anggota_Pensiun.xlsx");
    } catch (error) {
      console.error("Gagal mengunduh file Excel:", error.message);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = selectedMonth
      ? pensiunList.filter(
          (item) =>
            new Date(item.tanggalLahir).getMonth() + 2 ===
            parseInt(selectedMonth)
        )
      : pensiunList;

    downloadTableAsExcel(dataToExport);
  };

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredData = pensiunList.filter((pensiun) => {
    return (
      (selectedMonth === "" || pensiun.bulan === selectedMonth) &&
      pensiun.keterangan !== "Pensiun"
    );
  });

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
              <div className="flex flex-wrap w-full gap-4 md:w-auto">
                <select
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

                <select
                  name="year"
                  value={selectedYear}
                  onChange={(e) => {
                    const selectedYear = e.target.value;
                    setSelectedYear(selectedYear);
                    applyFilters(selectedMonth, selectedYear);
                  }}
                  className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
                >
                  <option value="">Pilih Tahun</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Cari ..."
                  value={searchText}
                  onChange={handleSearchChange}
                  className="p-2 border rounded w-full md:w-1/3"
                />
              </div>

              <div className="w-full flex justify-center gap-2 md:w-auto">
                <button
                  onClick={toggleStatus}
                  className="p-2 border rounded w-full sm:w-1/3 md:w-auto"
                >
                  {selectedStatus === "Segera" ? "Aktif" : "Segera"}
                </button>
                <button
                  className="p-2 px-4 bg-green-500 text-white rounded w-full sm:w-auto transition duration-300 hover:bg-green-700"
                  onClick={handleExportExcel}
                >
                  Excel
                </button>
                <button className="p-2 px-4 bg-blue-500 text-white rounded w-full sm:w-auto transition duration-300 hover:bg-blue-700">
                  Cetak
                </button>
              </div>
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
                    {currentItems
                      .filter((pensiun) => pensiun.keterangan !== "Pensiun")
                      .map((pensiun, index) => (
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
                                {/* Tombol Pensiun */}
                                <button
                                  type="button"
                                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                  onClick={() => handlePopup(pensiun.npa)}
                                >
                                  Pensiun
                                </button>

                                {/* Ikon WhatsApp */}
                                <button
                                  type="button"
                                  className="flex items-center text-green-500 hover:text-green-600"
                                  onClick={() => handleWhatsApp(pensiun.npa)}
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
                                    onClick={() => handleWhatsApp(pensiun.npa)}
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
                      ))}
                  </tbody>
                </table>
              </div>
              {filteredPensiunList.length > 0 && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
