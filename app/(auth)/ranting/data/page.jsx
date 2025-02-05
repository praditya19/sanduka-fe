"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { ClipLoader } from "react-spinners";

const Page = () => {
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminDataAll, setRantingData] = useState([]);
  const [adminDataAllCetak, setRantingDataCetak] = useState([]);
  const [role, setRole] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [, setListCabang] = useState([]);
  const [, setFormData] = useState({ unit: "" });
  const [cabangOptions, setCabangOptions] = useState([]);
  const [searchCabang, setSearchCabang] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [, setUnitKerjaOptions] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [, setFilteredUnitKerja] = useState([]);
  const [, setIsUnitKerjaDisabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPrintingOrDownloading, setIsPrintingOrDownloading] = useState(false);
  const [namaRanting, setNamaRanting] = useState([]);
  const [selectedRanting, setSelectedRanting] = useState("");
  const [showDropdownRanting, setShowDropdownRanting] = useState(false);
  const [filteredNamaRanting, setFilteredNamaRanting] = useState([]);
  const dropdownRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchRantingData = async (
    cabang = "",
    unitKerja = "",
    namaRanting = ""
  ) => {
    try {
      const response = await GlobalApi.getRantingSummary(
        cabang,
        unitKerja,
        namaRanting
      );

      setRantingData(response.content || []);
    } catch (error) {
      console.error("Error fetching ranting data:", error);
    }
  };

  const fetchRantingDataCetak = async (
    cabang = "",
    unitKerja = "",
    namaRanting = ""
  ) => {
    try {
      const response = await GlobalApi.getRantingSummary(
        cabang,
        unitKerja,
        namaRanting
      );

      setRantingDataCetak(response.content);
    } catch (error) {
      console.error("Error fetching ranting data:", error);
    }
  };

  const fetchCabangData = async () => {
    try {
      const cabangResponse = await GlobalApi.getCabang();
      setListCabang(cabangResponse.data);
      setCabangOptions(cabangResponse.data);
      setFilteredCabangOptions(cabangResponse.data);

      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      setRole(storedRole || "");
      if (storedRole === "ADMIN" && storedCabang) {
        setSelectedCabang(storedCabang);
      }
    } catch (error) {
      console.error("Error fetching cabang data:", error);
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

  const fetchNamaRanting = async () => {
    try {
      const response = await GlobalApi.getNamaranting();
      setNamaRanting(response);
      setFilteredNamaRanting(response);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);

      const storedRole = sessionStorage.getItem("role");
      if (storedRole) {
        setRole(storedRole);
      }

      fetchCabangData();
      fetchNamaRanting();
      fetchUnitKerjaData();
      const role = sessionStorage.getItem("role");
      const cabangFromSession = sessionStorage.getItem("cabang") || "";
      if (role === "ADMIN" && cabangFromSession) {
        setSelectedCabang(cabangFromSession);
        fetchRantingData(cabangFromSession);
      } else {
        fetchRantingData();
      }

      const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
      setIsSidebarOpen(sidebarState);

      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [token, router, currentPage, entries]);

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

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCabangChange = (e) => {
    const value = e.target.value;
    setSearchCabang(value);
    const filtered = cabangOptions.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCabangOptions(filtered);
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setFormData((prev) => ({
      ...prev,
      unit: "",
    }));
    setFilteredUnitKerja(
      allUnitKerja.filter(
        (unit) => unit.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
      )
    );
    setIsUnitKerjaDisabled(false);
    setShowDropdownCabang(false);

    fetchRantingData(cabang.kecamatan, "", "");
    fetchRantingDataCetak(cabang.kecamatan);
  };

  const handleUnitKerjaSelect = (selectedItem) => {
    setSelectedUnitKerja(selectedItem.unitKerja || "");
    setShowDropdownUnitKerja(false);
    setSearchUnitKerja("");

    fetchRantingData("", selectedItem.unitKerja, "");
    fetchRantingDataCetak(selectedItem.unitKerja);
  };

  const handleUnitKerjaChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchUnitKerja(value);

    const filteredOptions = allUnitKerja.filter((uk) =>
      uk.unitKerja.toLowerCase().includes(value)
    );

    setFilteredUnitKerjaOptions(filteredOptions);
  };

  const filteredData = [
    ...(adminDataAll || []),
    ...(isPrintingOrDownloading ? adminDataAllCetak || [] : []),
  ].filter((item) => {
    const cabang = item.cabang || "";
    const namaRanting = item.namaRanting || "";

    // Filter berdasarkan cabang dan namaRanting
    const cabangFilter = !selectedCabang || cabang === selectedCabang;
    const rantingFilter = !selectedRanting || namaRanting === selectedRanting;

    return cabangFilter && rantingFilter;
  });

  const startIndex = currentPage * entries;
  const selectedData = filteredData?.slice(startIndex, startIndex + entries);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleProcessingStatus = (status) => {
    setIsPrintingOrDownloading(status);
  };

  const handlePrint = () => {
    handleProcessingStatus(true);
    const totalAnggotaUnitKerja = filteredData.reduce(
      (total, item) => total + (item.anggotaUnitKerja || 0),
      0
    );
    const totalUnitKerja = filteredData.reduce(
      (total, item) => total + (item.totalUnitKerja || 0),
      0
    );
    const totalJumlahAnggotaRanting = filteredData.reduce(
      (total, item) => total + (item.jumlahAnggotaRanting || 0),
      0
    );
    const totalTotalAnggota = filteredData.reduce(
      (total, item) => total + (item.totalAnggota || 0),
      0
    );
    const filteredDataForPrint = filteredData;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Data Ranting</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              display: table;
              width: 100%;
              margin: 0;
            }
            .title {
              text-align: center;
              font-size: 22px;
              font-weight: bold;
              color: #00796b;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
              table-layout: fixed;
            }
            th, td {
              padding: 5px;
              border: 1px solid #ccc;
              word-wrap: break-word;
              text-align: center;
            }
            .header-row th {
              background-color: #f2f2f2;
            }
            th:nth-child(1), td:nth-child(1) { width: 5%; }  /* No */
            th:nth-child(2), td:nth-child(2) { width: 10%; } /* Cabang */
            th:nth-child(3), td:nth-child(3) { width: 10%; } /* Nama Ranting */
            th:nth-child(4), td:nth-child(4) { width: 10%; } /* Unit Kerja */
            th:nth-child(5), td:nth-child(5) { width: 35%; text-align: left; } /* Nama Anggota */
            th:nth-child(6), td:nth-child(6) { width: 10%; } /* Anggota Unit Kerja */
            th:nth-child(7), td:nth-child(7) { width: 10%; } /* Jumlah Anggota Ranting */
            th:nth-child(8), td:nth-child(8) { width: 10%; } /* Total Unit Kerja */
            th:nth-child(9), td:nth-child(9) { width: 10%; } /* Total Anggota */
            @media print {
              body {
                width: auto;
                overflow: visible;
              }
            }
          </style>
        </head>
        <body>
          <div class="title">Data Ranting</div>
          <table>
            <thead>
              <tr class="header-row">
                <th>No</th>
                <th>Cabang</th>
                <th>Nama Ranting</th>
                <th>Unit Kerja</th>
                <th>Nama Anggota</th>
                <th>Anggota Unit Kerja</th>
                <th>Jumlah Anggota Ranting</th>
                <th>Total Unit Kerja</th>
                <th>Total Anggota</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDataForPrint
                .map(
                  (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.cabang || "-"}</td>
                      <td>${item.namaRanting || "-"}</td>
                      <td>${item.unitKerja || "-"}</td>
                      <td>
                        ${
                          item.namaAnggota
                            ? item.namaAnggota
                                .split("\n")
                                .map((nama, i) => `${i + 1}. ${nama}`)
                                .join("<br>")
                            : "-"
                        }
                      </td>
                      <td>${item.anggotaUnitKerja || 0}</td>
                      <td>${item.jumlahAnggotaRanting || 0}</td>
                      <td>${item.totalUnitKerja || 0}</td>
                      <td>${item.totalAnggota || 0}</td>
                    </tr>
                  `
                )
                .join("")}
              <!-- Baris Total -->
              <tr style="font-weight: bold; background-color: #f2f2f2;">
                <td>Total</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${totalAnggotaUnitKerja}</td>
                <td>${totalJumlahAnggotaRanting}</td>
                <td>${totalUnitKerja}</td>
                <td>${totalTotalAnggota}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    handleProcessingStatus(false);
  };

  const handleDownloadExcel = () => {
    handleProcessingStatus(true);
    const data = filteredData.map((item, index) => ({
      No: index + 1,
      "Nama Ranting": item.namaRanting || "-",
      "Unit Kerja": item.unitKerja || "-",
      "Nama Anggota": item.namaAnggota
        ? item.namaAnggota
            .split("\n")
            .map((nama, i) => `${i + 1}. ${nama}`)
            .join("\n")
        : "-",
      "Anggota Unit Kerja": item.anggotaUnitKerja || 0,
      "Total Unit Kerja": item.totalUnitKerja || 0,
      "Jumlah Anggota Ranting": item.jumlahAnggotaRanting || 0,
      "Total Anggota": item.totalAnggota || 0,
    }));
    const totalAnggotaUnitKerja = filteredData.reduce(
      (total, item) => total + (item.anggotaUnitKerja || 0),
      0
    );
    const totalUnitKerja = filteredData.reduce(
      (total, item) => total + (item.totalUnitKerja || 0),
      0
    );
    const totalJumlahAnggotaRanting = filteredData.reduce(
      (total, item) => total + (item.jumlahAnggotaRanting || 0),
      0
    );
    const totalTotalAnggota = filteredData.reduce(
      (total, item) => total + (item.totalAnggota || 0),
      0
    );
    data.push({
      No: "Total",
      "Nama Ranting": "-",
      "Unit Kerja": "-",
      "Nama Anggota": "-",
      "Anggota Unit Kerja": totalAnggotaUnitKerja,
      "Total Unit Kerja": totalUnitKerja,
      "Jumlah Anggota Ranting": totalJumlahAnggotaRanting,
      "Total Anggota": totalTotalAnggota,
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 3 });
      if (ws[cellRef]) {
        ws[cellRef].s = { alignment: { wrapText: true } };
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Ranting");
    XLSX.writeFile(wb, "Data_Ranting.xlsx");
    handleProcessingStatus(false);
  };

  const handleRekapRanting = () => {
    handleProcessingStatus(true);
    const totalAnggotaUnitKerja = filteredData.reduce(
      (total, item) => total + (item.anggotaUnitKerja || 0),
      0
    );
    const totalUnitKerja = filteredData.reduce(
      (total, item) => total + (item.totalUnitKerja || 0),
      0
    );
    const totalJumlahAnggotaRanting = filteredData.reduce(
      (total, item) => total + (item.jumlahAnggotaRanting || 0),
      0
    );
    const totalTotalAnggota = filteredData.reduce(
      (total, item) => total + (item.totalAnggota || 0),
      0
    );
    const filteredDataForPrint = filteredData;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Rekap Ranting</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              display: table;
              width: 100%;
              margin: 0;
            }
            .title {
              text-align: center;
              font-size: 22px;
              font-weight: bold;
              color: #00796b;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
              table-layout: fixed;
            }
            th, td {
              padding: 5px;
              border: 1px solid #ccc;
              word-wrap: break-word;
              text-align: center;
            }
            .header-row th {
              background-color: #f2f2f2;
            }
            th:nth-child(1), td:nth-child(1)  { width: 5%; } /* No */
            th:nth-child(2), td:nth-child(2) { width: 15%; }/* Cabang */
            th:nth-child(3), td:nth-child(3)  { width: 15%; }/* Nama Ranting */
            th:nth-child(4), td:nth-child(4)  { width: 15%; }/* Unit Kerja */
            th:nth-child(6), td:nth-child(6)  { width: 10%; }/* Anggota Unit Kerja */
            th:nth-child(7), td:nth-child(7)  { width: 10%; }/* Jumlah Anggota Ranting */
            th:nth-child(8), td:nth-child(8)  { width: 10%; }/* Total Unit Kerja */
            th:nth-child(9), td:nth-child(9)  { width: 10%; }/* Total Anggota */
            @media print {
              body {
                width: auto;
                overflow: visible;
              }
            }
          </style>
        </head>
        <body>
          <div class="title">Rekap Ranting</div>
          <table>
            <thead>
              <tr class="header-row">
                <th>No</th>
                <th>Cabang</th>
                <th>Nama Ranting</th>
                <th>Unit Kerja</th>
                <th>Anggota Unit Kerja</th>
                <th>Jumlah Anggota Ranting</th>
                <th>Total Unit Kerja</th>
                <th>Total Anggota</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDataForPrint
                .map(
                  (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.cabang || "-"}</td>
                      <td>${item.namaRanting || "-"}</td>
                      <td>${item.unitKerja || "-"}</td>
                      <td>${item.anggotaUnitKerja || 0}</td>
                      <td>${item.jumlahAnggotaRanting || 0}</td>
                      <td>${item.totalUnitKerja || 0}</td>
                      <td>${item.totalAnggota || 0}</td>
                    </tr>
                  `
                )
                .join("")}
              <!-- Baris Total -->
              <tr style="font-weight: bold; background-color: #f2f2f2;">
                <td>Total</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${totalAnggotaUnitKerja}</td>
                <td>${totalJumlahAnggotaRanting}</td>
                <td>${totalUnitKerja}</td>
                <td>${totalTotalAnggota}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    handleProcessingStatus(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster />
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <nav className="ml-6 mt-12">
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
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-4">
              <div className="mb-4">
                <Label className="block flex-1 px-2">
                  <span className="text-gray-700 font-semibold">
                    Data Ranting
                  </span>
                </Label>
                <div className="flex flex-wrap items-start mt-5 justify-between space-y-4 md:space-y-0">
                  <div className="flex flex-wrap items-center space-x-2 w-full md:w-auto">
                    {/* Nama Cabang */}
                    <div
                      ref={dropdownRef}
                      className="relative flex flex-col w-full md:w-48"
                    >
                      <Input
                        type="text"
                        placeholder="Pilih Cabang"
                        value={selectedCabang}
                        readOnly
                        disabled={role === "ADMIN"}
                        onFocus={() => {
                          if (role === "SUPER ADMIN") {
                            setShowDropdownCabang(true);
                            setFilteredCabangOptions(cabangOptions);
                          }
                        }}
                        className="border rounded-lg p-2 w-full bg-white shadow-sm"
                      />
                      {showDropdownCabang && role === "SUPER ADMIN" && (
                        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                value={searchCabang}
                                onChange={handleCabangChange}
                                className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Cari Cabang..."
                                autoFocus
                              />
                            </li>
                            <li
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                handleCabangSelect({ kecamatan: "" });
                              }}
                            >
                              Pilih Cabang
                            </li>
                            {filteredCabangOptions.length > 0 ? (
                              filteredCabangOptions.map((cabang) => (
                                <li
                                  key={cabang.idKecamatan}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleCabangSelect(cabang)}
                                >
                                  {cabang.kecamatan}
                                </li>
                              ))
                            ) : (
                              <li className="px-4 py-2 text-gray-500 cursor-default">
                                Tidak ada hasil
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Nama Ranting */}
                    <div className="relative flex flex-col w-full md:w-48">
                      <Input
                        type="text"
                        placeholder="Pilih Nama Ranting"
                        value={selectedRanting}
                        readOnly
                        onFocus={() => setShowDropdownRanting(true)}
                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                          !selectedCabang ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      />

                      {showDropdownRanting && selectedCabang && (
                        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                          <div className="p-2">
                            <Input
                              type="text"
                              placeholder="Cari Nama Ranting..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="border rounded-lg p-2 w-full"
                            />
                          </div>

                          <ul className="max-h-44 overflow-y-auto">
                            <li
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setSelectedRanting("");
                                setShowDropdownRanting(false);
                                setSearchQuery("");
                              }}
                            >
                              Pilih Ranting
                            </li>

                            {(searchQuery
                              ? filteredNamaRanting.filter((ranting) =>
                                  ranting
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                                )
                              : filteredNamaRanting
                            ).length > 0 ? (
                              (searchQuery
                                ? filteredNamaRanting.filter((ranting) =>
                                    ranting
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  )
                                : filteredNamaRanting
                              ).map((ranting, index) => (
                                <li
                                  key={index}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    setSelectedRanting(ranting);
                                    setShowDropdownRanting(false);
                                    setSearchQuery("");
                                  }}
                                >
                                  {ranting}
                                </li>
                              ))
                            ) : (
                              <li className="px-4 py-2 text-gray-500 cursor-default">
                                Tidak ada hasil
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Nama Unit Kerja */}
                    <div
                      ref={unitKerjaRef}
                      className="relative w-full md:w-48 mt-4 sm:mt-0"
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
                          setShowDropdownUnitKerja(true);
                        }}
                        className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
                          !selectedRanting
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        disabled={!selectedRanting}
                      />

                      {showDropdownUnitKerja && (
                        <div className="absolute z-10 border rounded bg-white shadow-sm mt-1 w-full">
                          <div className="p-1">
                            <Input
                              type="text"
                              value={searchUnitKerja}
                              onChange={handleUnitKerjaChange}
                              placeholder="Cari Unit Kerja..."
                              className="w-full border rounded py-2 px-3 mb-2"
                            />
                          </div>
                          <ul className="max-h-44 overflow-y-auto -mt-3">
                            <li
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleUnitKerjaSelect({})}
                            >
                              Semua Unit Kerja
                            </li>
                            {filteredUnitKerjaOptions.map((item) => (
                              <li
                                key={item.id}
                                className="p-2 cursor-pointer hover:bg-gray-100"
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

                  {/* Filter */}
                  <div className="flex flex-wrap justify-between w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex items-center w-full md:w-auto space-x-4">
                      <label htmlFor="entries" className="mr-2">
                        Tampilkan:
                      </label>
                      <select
                        id="entries"
                        onChange={handleEntriesChange}
                        className="shadow border rounded w-full md:w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                    <Button
                      className="px-8 mt-4 md:mt-0 bg-blue-500"
                      onClick={handlePrint}
                    >
                      Cetak
                    </Button>
                    <Button
                      className="px-8 mt-4 md:mt-0"
                      onClick={handleDownloadExcel}
                    >
                      Download
                    </Button>
                    <Button
                      className="px-8 mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={handleRekapRanting}
                    >
                      Rekap Ranting
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-sky-100">
                      <th className="p-2 md:p-3 border text-left">No</th>
                      <th className="p-2 md:p-3 border text-left">Cabang</th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Nama Ranting
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Unit Kerja
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Nama Anggota
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Anggota Unit Kerja
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Jumlah Ranting
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Total Unit Kerja
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Total Anggota
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      <>
                        {filteredData.map((item, index) => (
                          <tr className="bg-gray-100" key={index}>
                            <td className="p-2 md:p-3 border text-center">
                              {index + 1 + currentPage * entries}
                            </td>
                            <td className="p-2 md:p-3 border text-center">
                              {item.cabang}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell">
                              {item.namaRanting || "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell">
                              {item.unitKerja || "-"}
                            </td>
                            <td
                              className="p-2 md:p-3 border hidden md:table-cell"
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {item.namaAnggota
                                ? item.namaAnggota
                                    .split("\n")
                                    .map((nama, i) => `${i + 1}. ${nama}`)
                                    .join("\n")
                                : "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell">
                              {item.anggotaUnitKerja || "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell">
                              {item.jumlahAnggotaRanting || "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell">
                              {item.totalUnitKerja || "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell">
                              {item.totalAnggota || "-"}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-200 font-bold">
                          <td colSpan="4" className="p-2 md:p-3 text-center">
                            Total
                          </td>
                          <td className="p-2 md:p-3 text-center"></td>
                          <td className="p-2 md:p-3 text-center">
                            {filteredData.reduce(
                              (total, item) =>
                                total + (item.anggotaUnitKerja || 0),
                              0
                            )}
                          </td>
                          <td className="p-2 md:p-3 text-center">
                            {filteredData.reduce(
                              (total, item) =>
                                total + (item.jumlahAnggotaRanting || 0),
                              0
                            )}
                          </td>
                          <td className="p-2 md:p-3 text-center">
                            {filteredData.reduce(
                              (total, item) =>
                                total + (item.totalUnitKerja || 0),
                              0
                            )}
                          </td>
                          <td className="p-2 md:p-3 text-center">
                            {filteredData.reduce(
                              (total, item) => total + (item.totalAnggota || 0),
                              0
                            )}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan="9" className="p-4 text-center">
                          Tidak Ada Data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
