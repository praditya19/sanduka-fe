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
  const [adminDataAll, setRantingData] = useState([]);
  const [adminDataAllCetak, setRantingDataCetak] = useState([]);
  const [role, setRole] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [, setUnitKerjaOptions] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrintingOrDownloading, setIsPrintingOrDownloading] = useState(false);
  const [namaRanting, setNamaRanting] = useState([]);
  const [filteredNamaRanting, setFilteredNamaRanting] = useState([]);
  const unitKerjaRef = useRef(null);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedRanting, setSelectedRanting] = useState("");
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [originalRantingList, setOriginalRantingList] = useState([]);
  const [allRantingList, setAllRantingList] = useState([]);
  const [showRantingDropdown, setShowRantingDropdown] = useState(false);

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

      setOriginalCabangList(cabangResponse.data);
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
    } catch (error) {
      console.error("Error fetching nama ranting:", error);
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
        fetchRantingByCabang(cabangFromSession);
        setSelectedCabang(cabangFromSession);
        fetchRantingData(cabangFromSession);
      } else {
        fetchRantingByCabang(selectedCabang);
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
  }, [token, router, selectedCabang]);

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

    let lastCabang = null;
    let lastNamaRanting = null;

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
            th:nth-child(4), td:nth-child(4) { width: 12%; } /* Unit Kerja */
            th:nth-child(5), td:nth-child(5) { width: 30%; text-align: left; } /* Nama Anggota */
            th:nth-child(6), td:nth-child(6) { width: 10%; } /* Anggota Unit Kerja */
            th:nth-child(7), td:nth-child(7) { width: 10%; } /* Jumlah Anggota Ranting */
            th:nth-child(8), td:nth-child(8) { width: 10%; } /* Total Unit Kerja */
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
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map((item, index) => {
                  let cabangText =
                    item.cabang !== lastCabang ? item.cabang || "-" : "-";
                  lastCabang = item.cabang;

                  let namaRanting =
                    item.namaRanting !== lastNamaRanting
                      ? item.namaRanting || "-"
                      : "-";
                  lastNamaRanting = item.namaRanting;
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${cabangText}</td>
                      <td>${namaRanting}</td>
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
                    </tr>
                  `;
                })
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
    const seenCabangs = new Set();
    const processedDataForExcel = filteredData.map((item) => {
      if (seenCabangs.has(item.cabang)) {
        return { ...item, cabang: "-" };
      } else {
        seenCabangs.add(item.cabang);
        return item;
      }
    });

    const data = processedDataForExcel.map((item, index) => ({
      No: index + 1,
      Cabang: item.cabang || "-",
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
      "Jumlah Anggota Ranting": item.jumlahAnggotaRanting,
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

    data.push({
      No: "Total",
      Cabang: "-",
      "Nama Ranting": "-",
      "Unit Kerja": "-",
      "Nama Anggota": "-",
      "Anggota Unit Kerja": totalAnggotaUnitKerja,
      "Total Unit Kerja": totalUnitKerja,
      "Jumlah Anggota Ranting": totalJumlahAnggotaRanting,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Ranting");
    XLSX.writeFile(wb, "Data_Ranting.xlsx");

    handleProcessingStatus(false);
  };

  const handleRekapRanting = () => {
    handleProcessingStatus(true);

    const groupedData = {};
    filteredData.forEach((item) => {
      if (!groupedData[item.cabang]) {
        groupedData[item.cabang] = [];
      }
      groupedData[item.cabang].push(item);
    });

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
            th:nth-child(1), td:nth-child(1) { width: 5%; } /* No */
            th:nth-child(2), td:nth-child(2) { width: 15%; }/* Cabang */
            th:nth-child(3), td:nth-child(3) { width: 15%; }/* Nama Ranting */
            th:nth-child(4), td:nth-child(4) { width: 15%; }/* Unit Kerja */
            th:nth-child(5), td:nth-child(5) { width: 10%; }/* Anggota Unit Kerja */
            th:nth-child(6), td:nth-child(6) { width: 10%; }/* Jumlah Anggota Ranting */
            th:nth-child(7), td:nth-child(7) { width: 10%; }/* Total Unit Kerja */
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
              </tr>
            </thead>
            <tbody>
            ${Object.keys(groupedData)
              .map((cabang, cabangIndex) => {
                let lastNamaRanting = null;
                const rantingRows = groupedData[cabang]
                  .map((item, index) => {
                    let namaRanting =
                      item.namaRanting !== lastNamaRanting
                        ? item.namaRanting || "-"
                        : "-";
                    lastNamaRanting = item.namaRanting;

                    return `
            <tr>
              ${
                index === 0
                  ? `<td rowspan="${groupedData[cabang].length}">${
                      cabangIndex + 1
                    }</td>`
                  : ""
              }
              ${
                index === 0
                  ? `<td rowspan="${groupedData[cabang].length}">${cabang}</td>`
                  : ""
              }
              <td>${namaRanting}</td>
              <td>${item.unitKerja || "-"}</td>
              <td>${item.anggotaUnitKerja || 0}</td>
              <td>${item.jumlahAnggotaRanting || 0}</td>
              <td>${item.totalUnitKerja || 0}</td>
            </tr>
          `;
                  })
                  .join("");
                return rantingRows;
              })
              .join("")}
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
                <Label className="block flex-1">
                  <span className="text-gray-700 font-semibold">
                    Data Ranting
                  </span>
                </Label>
                <div className="flex flex-wrap items-start mt-5 justify-between space-y-4 md:space-y-0">
                  <div className="flex flex-wrap items-center space-x-2 w-full md:w-auto">
                    {/* Nama Cabang */}
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

                    {/* Nama Ranting */}
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
                            !selectedCabang
                              ? "cursor-not-allowed opacity-50"
                              : ""
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

                    {/* Nama Unit Kerja */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Nama Unit Kerja
                      </label>
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
                  </div>

                  {/* Filter */}
                  <div className="flex flex-wrap justify-between w-full md:w-auto">
                    <div className="mt-5 flex flex-wrap gap-4 justify-center md:justify-start">
                      <Button
                        className="px-8 w-full sm:w-auto bg-blue-500"
                        onClick={handlePrint}
                      >
                        Cetak
                      </Button>
                      <Button
                        className="px-8 w-full sm:w-auto"
                        onClick={handleDownloadExcel}
                      >
                        Download
                      </Button>
                      <Button
                        className="px-8 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleRekapRanting}
                      >
                        Rekap Ranting
                      </Button>
                      {sessionStorage.getItem("role") === "SUPER ADMIN" && (
                        <Button
                          className="px-8 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={handleRekapRanting}
                        >
                          Rekap Ranting All
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-sky-100">
                      <th className="p-2 md:p-3 border md:table-cell">No</th>
                      <th className="p-2 md:p-3 border md:table-cell">
                        Cabang
                      </th>
                      <th className="p-2 md:p-3 border md:table-cell">
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      <>
                        {filteredData.map((item, index) => (
                          <tr className="bg-gray-100" key={index}>
                            <td className="p-2 md:p-3 border text-left align-top">
                              {index + 1 + currentPage * entries}
                            </td>
                            <td className="p-2 md:p-3 border text-left align-top">
                              {index === 0 ||
                              filteredData[index - 1].cabang !== item.cabang
                                ? item.cabang
                                : "-"}
                            </td>
                            <td className="p-2 md:p-3 border md:table-cell text-left align-top">
                              {index === 0 ||
                              filteredData[index - 1].namaRanting !==
                                item.namaRanting
                                ? item.namaRanting
                                : "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell text-left align-top">
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
                            <td className="p-2 md:p-3 border hidden md:table-cell text-left align-top">
                              {item.anggotaUnitKerja || "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell text-left align-top">
                              {item.jumlahAnggotaRanting || "-"}
                            </td>
                            <td className="p-2 md:p-3 border hidden md:table-cell text-left align-top">
                              {item.totalUnitKerja || "-"}
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
