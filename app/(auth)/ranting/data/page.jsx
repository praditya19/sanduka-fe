"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faMinusCircle,
  faPlusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
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
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const dropdownRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchRantingData = async (
    page = currentPage,
    size = entries,
    cabang = "",
    unitKerja = "",
    namaRanting = ""
  ) => {
    try {
      const response = await GlobalApi.getRantingSummary(
        page,
        size,
        cabang,
        unitKerja,
        namaRanting
      );

      const filteredData = response.content.filter((item) =>
        item.namaAnggota.toLowerCase().includes(namaRanting.toLowerCase())
      );

      setRantingData(filteredData);
      setTotalEntries(response.totalElements);
      setTotalPages(response.totalPages);
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
        0,
        500,
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
      fetchUnitKerjaData();
      fetchRantingData(currentPage, entries);
      fetchRantingDataCetak();

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

  const deleteAdmin = async (idAdmin) => {
    try {
      const response = await GlobalApi.deleteAdmin(idAdmin);
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
            Admin Berhasil Dihapus!
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

  const handleEntriesChange = (e) => {
    setEntries(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchRantingData(newPage, entries);
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

    fetchRantingData(0, entries, cabang.kecamatan, "", "");
    fetchRantingDataCetak(cabang.kecamatan);
  };

  const handleUnitKerjaSelect = (selectedItem) => {
    setSelectedUnitKerja(selectedItem.unitKerja || "");
    setShowDropdownUnitKerja(false);
    setSearchUnitKerja("");

    fetchRantingData(0, entries, "", selectedItem.unitKerja, "");
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

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    console.log(query);

    fetchRantingData(0, entries, "", "", query);
    fetchRantingDataCetak(query);
  };

  const filteredData = [
    ...(adminDataAll || []),
    ...(adminDataAllCetak || []),
  ].filter((item) => {
    const cabang = item.cabang || "";
    const namaRanting = item.namaRanting || "";

    return (
      cabang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      namaRanting.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const startIndex = currentPage * entries;
  const selectedData = filteredData?.slice(startIndex, startIndex + entries);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleDeleteAdminClick = (idAdmin) => {
    deleteAdmin(idAdmin);
  };

  const toggleDetails = (id) => {
    setExpandedRow((prevExpandedRow) => (prevExpandedRow === id ? null : id));
  };

  const handlePrint = () => {
    const filteredDataForPrint = filteredData;
    console.log(filteredDataForPrint.length);
    const printWindow = window.open();

    printWindow.document.write(`
      <html>
        <head>
          <title>Data Ranting</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .title, .subtitle {
              text-align: center;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #00796b;
            }
            .subtitle {
              font-size: 20px;
              font-weight: normal;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ccc;
            }
            .header-row th[colspan="2"] {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
              background-color: #e0f2f1;
            }
            /* Prevent page breaks inside the table */
            table, tr, td {
              page-break-inside: avoid;
            }
            /* Ensure no page break between rows */
            tr {
              page-break-after: auto;
            }
            /* Allow table content to overflow if necessary */
            body {
              width: 100%;
              overflow: auto;
            }
            /* Additional styling to avoid large table content breaking */
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
                <th>Jumlah Anggota Ranting</th>
                <th>Total Anggota Cabang</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDataForPrint
                .map(
                  (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.cabang}</td>
                      <td>${item.namaRanting}</td>
                      <td>${item.lokasi}</td>
                      <td>${item.namaAnggota}</td>
                      <td>${item.totalAnggota}</td>
                      <td>${item.totalKegiatan}</td>
                    </tr>
                  `
                )
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
  };

  const handleDownloadExcel = () => {
    const data = filteredData.map((item, index) => ({
      No: index + 1,
      Cabang: item.cabang,
      NamaRanting: item.namaRanting,
      UnitKerja: item.lokasi,
      NamaAnggota: item.namaAnggota,
      JumlahAnggota: item.totalAnggota,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Ranting");

    XLSX.writeFile(wb, "Data_Ranting.xlsx");
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
                          setShowDropdownUnitKerja(true);
                          setFilteredUnitKerjaOptions(
                            selectedCabang === "Pilih Cabang"
                              ? allUnitKerja
                              : allUnitKerja.filter(
                                  (uk) => uk.cabang === selectedCabang
                                )
                          );
                        }}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={selectedCabang === "Pilih Cabang"}
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

                    <div className="relative w-full md:w-48 mt-4 sm:mt-0">
                      <input
                        type="text"
                        placeholder="Pilih Nama Ranting"
                        className="p-2 pl-10 border rounded max-w-sm w-full"
                        onChange={handleSearchChange}
                      />
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                      />
                    </div>
                  </div>

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
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 md:p-3 border text-left">No</th>
                      <th className="p-2 md:p-3 border text-left ">Cabang</th>
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
                        Jumlah Anggota Ranting
                      </th>
                      <th className="p-2 md:p-3 border hidden md:table-cell">
                        Total Anggota Cabang
                      </th>
                      {isMobile && (
                        <th className="p-2 md:p-3 border md:table-cell">
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => {
                        return (
                          <React.Fragment key={item.id}>
                            <tr className="bg-gray-100">
                              <td className="p-2 md:p-3 border text-center">
                                {index + 1 + currentPage * entries}
                              </td>
                              <td className="p-2 md:p-3 border text-center">
                                {item.cabang}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.namaRanting}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.lokasi}
                              </td>
                              <td
                                className="p-2 md:p-3 border hidden md:table-cell"
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {item.namaAnggota}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.totalAnggota}
                              </td>
                              <td className="p-2 md:p-3 border hidden md:table-cell">
                                {item.totalKegiatan}
                              </td>
                              {isMobile && (
                                <td className="p-2 border text-center">
                                  <div className="flex justify-center">
                                    <Button
                                      className="bg-blue-500 text-white  text-sm shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-300 transition ease-in-out duration-150"
                                      onClick={() => toggleDetails(item.id)}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          expandedRow === item.id
                                            ? faMinusCircle
                                            : faPlusCircle
                                        }
                                      />
                                    </Button>
                                  </div>
                                </td>
                              )}
                            </tr>
                            {expandedRow === item.id && (
                              <tr className="bg-gray-200">
                                <td colSpan="7" className="p-4">
                                  <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/2">
                                      <strong>Nama Ranting:</strong>{" "}
                                      {item.namaRanting}
                                      <br />
                                      <strong>Unit Kerja:</strong> {item.nama}
                                      <br />
                                      <strong>Nama Anggota:</strong>{" "}
                                      {item.npaPgri}
                                      <br />
                                      {isMobile && (
                                        <>
                                          <strong>
                                            Jumlah Anggota Ranting:
                                          </strong>{" "}
                                          {item.noHp}
                                          <br />
                                        </>
                                      )}
                                      {isMobile && (
                                        <>
                                          <strong>Total Anggota Cabang:</strong>{" "}
                                          {item.noHp}
                                          <br />
                                        </>
                                      )}
                                      <div className="flex flex-col space-y-2 mt-2">
                                        <strong className="text-lg font-semibold">
                                          Action:
                                        </strong>
                                        <div className="flex space-x-2">
                                          <Button
                                            className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition ease-in-out duration-150"
                                            onClick={() =>
                                              handleDeleteAdminClick(item.id)
                                            }
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center">
                          No data found
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
