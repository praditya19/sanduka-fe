"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faFileExcel,
  faSpinner,
  faBoxOpen,
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import * as XLSX from 'xlsx-js-style';

const CekData = () => {
  // --- STATE MANAGEMENT ---
  // All original state variables are preserved
  const [data, setData] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [searchNama, setSearchNama] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // UI/User Role State
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isDownloading, setIsDownloading] = useState(false);
  const [role, setRole] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // --- REFS ---
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const router = useRouter();

  // --- DATA FETCHING ---
  const fetchData = async (
    page = currentPage,
    size = pageSize,
    cabang = "",
    unitKerja = "",
    search = ""
  ) => {
    setIsLoading(true);
    try {
      const result = await GlobalApi.getCekHistoryData(page, size, cabang, unitKerja, search);
      setData(result.content || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
      return result.content || [];
    } catch (error) {
      console.error("Error fetching history data:", error);
      setData([]); // Reset data on error
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFFECTS ---
  // Initial data load and handling external events
  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");
    setRole(storedRole || "");

    if (storedRole === "ADMIN" && storedCabang) {
      setSelectedCabang(storedCabang);
    }

    // Fetch dropdown data and main table data concurrently
    const initializeData = async () => {
      try {
        // Fetch dropdown lists
        const [cabangRes, unitKerjaRes] = await Promise.all([
          GlobalApi.getCabang(),
          GlobalApi.getUnitKerja(),
        ]);
        setOriginalCabangList(cabangRes.data);
        setFilteredCabangList(cabangRes.data);
        setUnitKerjaList(unitKerjaRes.data);

        // Fetch initial table data
        const initialCabang = storedRole === "ADMIN" ? storedCabang : "";
        await fetchData(0, pageSize, initialCabang, "", "");
      } catch (error) {
        console.error("Error initializing data:", error);
        setIsLoading(false); // Ensure loading is stopped on error
      }
    };

    initializeData();

    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) setShowCabangDropdown(false);
      if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target)) setShowUnitKerjaDropdown(false);
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Initial check

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Runs only once on mount

  // Handles re-fetching data when filters or page change
  useEffect(() => {
    // We separate this from the initial load to avoid complex dependency arrays.
    // The actual fetch is triggered by handler functions.
    // This effect is now primarily for cascading dropdown logic.
    if (selectedCabang && unitKerjaList.length > 0) {
      setSelectedUnitKerja("");
      setUnitKerjaInput("");
      const filtered = unitKerjaList.filter(
        (unit) => unit.cabang?.toLowerCase() === selectedCabang.toLowerCase()
      );
      setFilteredUnitKerja(filtered);
    }
  }, [selectedCabang, unitKerjaList]);


  // --- EVENT HANDLERS (No logic changes, just kept as is) ---
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      fetchData(page, pageSize, selectedCabang, selectedUnitKerja, searchNama);
    }
  };

  const handleFilterChange = (cabang, unitKerja, search) => {
    setCurrentPage(0); // Reset to first page on any filter change
    fetchData(0, pageSize, cabang, unitKerja, search);
  };

  const handleSelectCabang = (cabang) => {
    const newCabang = cabang?.kecamatan || "";
    setSelectedCabang(newCabang);
    setShowCabangDropdown(false);
    setUnitKerjaInput(""); // Clear unit kerja input
    setSelectedUnitKerja(""); // Clear selected unit kerja
    handleFilterChange(newCabang, "", searchNama);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    const newUnitKerja = unitKerja?.unitKerja || "";
    setSelectedUnitKerja(newUnitKerja);
    setUnitKerjaInput(newUnitKerja);
    setShowUnitKerjaDropdown(false);
    handleFilterChange(selectedCabang, newUnitKerja, searchNama);
  };

  const handleNamaChange = (e) => {
    const query = e.target.value;
    setSearchNama(query);
    handleFilterChange(selectedCabang, selectedUnitKerja, query);
  };

  // Other handlers remain the same...
  const filterUnitKerjaForCabang = (cabang) => {
    const filtered = unitKerjaList.filter(
      (unitKerja) => unitKerja.cabang?.toLowerCase() === cabang?.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };
  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      filterUnitKerjaForCabang(selectedCabang);
      setShowUnitKerjaDropdown(true);
    }
  };
  const handleCabangClick = () => {
    if (role !== "ADMIN") {
      setFilteredCabangList(originalCabangList);
      setShowCabangDropdown(true);
    }
  };
  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);
    if (selectedCabang) {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang?.toLowerCase() === selectedCabang?.toLowerCase() &&
          unitKerja.unitKerja?.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
      setShowUnitKerjaDropdown(true);
    } else {
      setFilteredUnitKerja([]);
      setShowUnitKerjaDropdown(false);
    }
  };
  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };
  const handleUnitKerjaSearch = (searchTerm) => {
    const allFilteredByCabang = unitKerjaList.filter(
      (unitKerja) => unitKerja.cabang?.toLowerCase() === selectedCabang?.toLowerCase()
    );

    if (searchTerm === "") {
      setFilteredUnitKerja(allFilteredByCabang);
    } else {
      const filtered = allFilteredByCabang.filter(
        (unitKerja) => unitKerja.unitKerja?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
    }
    setShowUnitKerjaDropdown(true);
  };


  // --- EXCEL DOWNLOAD ---
  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      const allData = await GlobalApi.getCekHistoryData(
        0,
        totalElements > 0 ? totalElements : 1000, // Fetch all or a large number
        selectedCabang,
        selectedUnitKerja,
        searchNama
      );

      if (!allData.content || allData.content.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const headers = ["No", "Cabang", "Unit Kerja", "Nama Anggota", "Npa", "Nama Anggota KTA Digital", "Jumlah KTA Digital", "Nama Anggota Sanduka", "Jumlah Sanduka", "Nama Anggota Daspen", "Jumlah Daspen"];

      const formatMultiLine = (value) => value ? String(value).split(" | ").filter(Boolean).map((part, idx) => `${idx + 1}. ${part.trim()}`).join('\n') : "-";

      const excelData = allData.content.map((item, index) => [
        index + 1,
        item.cabang || "-",
        item.unitKerja || "-",
        formatMultiLine(item.nama),
        formatMultiLine(item.npa),
        formatMultiLine(item.ktaDigitalNama),
        item.ktaDigitalJumlah || 0,
        formatMultiLine(item.sandukaNama),
        item.sandukaJumlah || 0,
        formatMultiLine(item.daspenNama),
        item.daspenJumlah || 0,
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);

      // Apply wrap text style to multi-line columns
      allData.content.forEach((item, originalIndex) => {
        const excelRowIndex = originalIndex + 1; // +1 for header row
        const columnsToWrap = [
          { key: 'nama', colIndex: 3 }, { key: 'npa', colIndex: 4 },
          { key: 'ktaDigitalNama', colIndex: 5 }, { key: 'sandukaNama', colIndex: 7 },
          { key: 'daspenNama', colIndex: 9 }
        ];
        columnsToWrap.forEach(col => {
          if (item[col.key] && String(item[col.key]).includes(' | ')) {
            const cellRef = XLSX.utils.encode_cell({ r: excelRowIndex, c: col.colIndex });
            if (worksheet[cellRef]) {
              worksheet[cellRef].s = { alignment: { wrapText: true, vertical: 'top' } };
            }
          }
        });
      });

      // Auto-fit column widths
      const columnWidths = headers.map((header, i) => ({
        wch: Math.max(
          header.length,
          ...excelData.map(row => String(row[i] || '').split('\n').reduce((max, line) => Math.max(max, line.length), 0))
        ) + 2 // Add padding
      }));
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anggota");
      XLSX.writeFile(workbook, "Kroscek_Data_Anggota.xlsx");

    } catch (error) {
      console.error("Error during Excel download:", error);
      alert("Gagal mengunduh file Excel. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- RENDER METHODS ---
  const renderMobileHeader = () => (
    <header className="bg-teal-700 text-white font-bold p-3 shadow-md fixed top-0 left-0 w-full z-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <FontAwesomeIcon icon={faArrowLeft} onClick={() => router.back()} className="cursor-pointer" />
        <h1 className="text-lg">Anggota By Name</h1>
      </div>
    </header>
  );

  const renderTable = () => (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-white uppercase bg-teal-700 text-center">
          <tr>
            <th colSpan="5" className="py-3 px-4 border border-white">Kroscek Data</th>
            <th colSpan="2" className="py-3 px-4 border border-white">KTA DIGITAL</th>
            <th colSpan="2" className="py-3 px-4 border border-white">SANDUKA</th>
            <th colSpan="2" className="py-3 px-4 border border-white">DASPEN</th>
          </tr>
          <tr>
            <th scope="col" className="py-3 px-4 border-r border-white">No</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Cabang</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Unit Kerja</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Nama Anggota</th>
            <th scope="col" className="py-3 px-4 border-r border-white w-32">Npa</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Nama Anggota</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Jumlah</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Nama Anggota</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Jumlah</th>
            <th scope="col" className="py-3 px-4 border-r border-white">Nama Anggota</th>
            <th scope="col" className="py-3 px-4">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b bg-white hover:bg-gray-50 transition-colors">
              <td className="py-2 px-4 border text-center">{currentPage * pageSize + index + 1}</td>
              <td className="py-2 px-4 border">{item.cabang || '-'}</td>
              <td className="py-2 px-4 border">{item.unitKerja || '-'}</td>
              <td className="py-2 px-4 border whitespace-pre-line text-left">
                {(item.nama || '').split(" | ").filter(Boolean).map((nama, idx) => <div key={idx}>{idx + 1}. {nama}</div>)}
              </td>
              <td className="py-2 px-4 border whitespace-pre-line text-left">
                {(item.npa || '').split(" | ").filter(Boolean).map((npa, idx) => <div key={idx}>{idx + 1}. {npa}</div>)}
              </td>
              <td className="py-2 px-4 border whitespace-pre-line text-left">
                {(item.ktaDigitalNama || '').split(" | ").filter(Boolean).map((nama, idx) => <div key={idx}>{idx + 1}. {nama}</div>)}
              </td>
              <td className="py-2 px-4 border text-center">{item.ktaDigitalJumlah || 0}</td>
              <td className="py-2 px-4 border whitespace-pre-line text-left">
                {(item.sandukaNama || '').split(" | ").filter(Boolean).map((nama, idx) => <div key={idx}>{idx + 1}. {nama}</div>)}
              </td>
              <td className="py-2 px-4 border text-center">{item.sandukaJumlah || 0}</td>
              <td className="py-2 px-4 border whitespace-pre-line text-left">
                {(item.daspenNama || '').split(" | ").filter(Boolean).map((nama, idx) => <div key={idx}>{idx + 1}. {nama}</div>)}
              </td>
              <td className="py-2 px-4 border text-center">{item.daspenJumlah || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-64">
      <FontAwesomeIcon icon={faSpinner} className="fa-spin text-teal-700 text-4xl" />
      <p className="ml-4 text-lg text-gray-600">Memuat data...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
      <FontAwesomeIcon icon={faBoxOpen} className="text-5xl text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700">Data Tidak Ditemukan</h3>
      <p className="text-gray-500 mt-2">
        Tidak ada data yang cocok dengan kriteria filter Anda. <br />
        Silakan coba ubah atau hapus filter.
      </p>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-700">
          Halaman <span className="font-semibold">{currentPage + 1}</span> dari <span className="font-semibold">{totalPages}</span>. Total <span className="font-semibold">{totalElements}</span> data.
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => handlePageChange(0)} disabled={currentPage === 0 || isLoading}><FontAwesomeIcon icon={faAngleDoubleLeft} /></Button>
          <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0 || isLoading}><FontAwesomeIcon icon={faAngleLeft} /></Button>
          {pageNumbers.map(num => (
            <Button key={num} variant={num === currentPage ? 'default' : 'outline'} size="icon" onClick={() => handlePageChange(num)} disabled={isLoading}>
              {num + 1}
            </Button>
          ))}
          <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}><FontAwesomeIcon icon={faAngleRight} /></Button>
          <Button variant="outline" size="icon" onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1 || isLoading}><FontAwesomeIcon icon={faAngleDoubleRight} /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {isMobile ? renderMobileHeader() : <HeaderMenu />}

      <main className="p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-screen-2xl mx-auto space-y-6">
          {/* --- Page Header --- */}
          <div className="mb-6 mt-10">
            <h1 className="text-3xl font-bold text-gray-800">Analisis Data Anggota</h1>
            <p className="text-gray-600 mt-1">Gunakan filter untuk melakukan kroscek data KTA Digital, Sanduka, dan Daspen.</p>
          </div>

          {/* --- Filter and Action Controls --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

              {/* Cabang Filter */}
              <div ref={cabangRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
                <Input
                  type="text"
                  value={selectedCabang}
                  readOnly
                  onClick={handleCabangClick}
                  placeholder="Pilih Cabang"
                  disabled={role === "ADMIN"}
                  className={`w-full ${role === "ADMIN" ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
                />
                {showCabangDropdown && role !== "ADMIN" && (
                  <div className="absolute z-20 w-full mt-1 border rounded-md bg-white shadow-lg">
                    <div className="p-2">
                      <Input type="text" onChange={(e) => handleCabangSearch(e.target.value)} placeholder="Cari Cabang..." autoFocus />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      <li onClick={() => handleSelectCabang({ kecamatan: "" })} className="px-4 py-2 cursor-pointer hover:bg-gray-100">Semua Cabang</li>
                      {filteredCabangList.map((c) => (
                        <li key={c.id} onClick={() => handleSelectCabang(c)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{c.kecamatan}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Unit Kerja Filter */}
              <div ref={unitKerjaRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
                <Input
                  type="text"
                  value={unitKerjaInput}
                  onChange={handleUnitKerjaChange}
                  onFocus={handleUnitKerjaFocus}
                  placeholder="Pilih Unit Kerja"
                  disabled={!selectedCabang}
                  className={`w-full ${!selectedCabang ? 'cursor-not-allowed bg-gray-100' : ''}`}
                />
                {showUnitKerjaDropdown && (
                  <div className="absolute z-20 w-full mt-1 border rounded-md bg-white shadow-lg">
                    <div className="p-2">
                      <Input type="text" onChange={(e) => handleUnitKerjaSearch(e.target.value)} placeholder="Cari Unit Kerja..." autoFocus />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      <li onClick={() => handleUnitKerjaSelect({ unitKerja: "" })} className="px-4 py-2 cursor-pointer hover:bg-gray-100">Semua Unit Kerja</li>
                      {filteredUnitKerja.length > 0 ? (
                        filteredUnitKerja.map((u) => <li key={u.id} onClick={() => handleUnitKerjaSelect(u)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{u.unitKerja}</li>)
                      ) : <li className="px-4 py-2 text-gray-500">Tidak ada hasil</li>}
                    </ul>
                  </div>
                )}
              </div>

              {/* Search by Name Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama Anggota / NPA</label>
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-9 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ketik untuk mencari..."
                  onChange={handleNamaChange}
                  className="pl-10 w-full"
                />
              </div>

              {/* Action Button */}
              <Button
                onClick={handleDownloadExcel}
                disabled={isDownloading || isLoading || data.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white w-full lg:w-auto"
              >
                <FontAwesomeIcon icon={isDownloading ? faSpinner : faFileExcel} className={`mr-2 ${isDownloading ? 'fa-spin' : ''}`} />
                {isDownloading ? "Memproses..." : "Unduh Excel"}
              </Button>
            </div>
          </div>

          {/* --- Data Table Section --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {isLoading ? renderLoadingState() :
              (data.length > 0 ? renderTable() : renderEmptyState())
            }
            {!isLoading && data.length > 0 && renderPagination()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CekData;