"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import * as XLSX from 'xlsx-js-style';

const CekData = () => {
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const tableRef = useRef();
  const [role, setRole] = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = async (
    page = currentPage,
    size = pageSize,
    cabang = "",
    unitKerja = "",
    search = ""
  ) => {
    setIsLoading(true);
    try {
      const result = await GlobalApi.getCekHistoryData(
        page,
        size,
        cabang,
        unitKerja,
        search
      );

      setData(result.content);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements);
      return result.content; // Return content for Excel download
    } catch (error) {
      console.error("Error fetching history data:", error);
      setData([]);
      return []; // Return empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");
    setRole(storedRole || "");

    const initialFetchCabang = storedRole === "ADMIN" && storedCabang ? storedCabang : selectedCabang;
    const initialFetchUnitKerja = storedRole === "ADMIN" ? "" : selectedUnitKerja; // Admin might not have a selectedUnitKerja filter initially

    if (storedRole === "ADMIN" && storedCabang) {
      setSelectedCabang(storedCabang);
      filterUnitKerjaForCabang(storedCabang);
    }
    // Always fetch data on initial load and page changes
    fetchData(
      currentPage,
      pageSize,
      initialFetchCabang,
      initialFetchUnitKerja,
      searchNama
    );


    const fetchInitialDropdownData = async () => {
      try {
        const [cabangRes, unitKerjaRes] = await Promise.all([
          GlobalApi.getCabang(),
          GlobalApi.getUnitKerja(),
        ]);

        setOriginalCabangList(cabangRes.data);
        setFilteredCabangList(cabangRes.data);
        setUnitKerjaList(unitKerjaRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchInitialDropdownData();

    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentPage, pageSize]);

  // This useEffect ensures filterUnitKerjaForCabang runs when unitKerjaList is populated
  useEffect(() => {
    if (selectedCabang && unitKerjaList.length > 0) {
      setSelectedUnitKerja("");
      setUnitKerjaInput("");
      filterUnitKerjaForCabang(selectedCabang);
    }
  }, [selectedCabang, unitKerjaList]);


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
      setFilteredUnitKerja([]); // Clear unit kerja if no cabang selected
      setShowUnitKerjaDropdown(false);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    const newCabang = cabang?.kecamatan || "";
    setSelectedCabang(newCabang);
    setShowCabangDropdown(false);

    if (newCabang) {
      const filtered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang?.toLowerCase() === newCabang.toLowerCase()
      );
      setFilteredUnitKerja(filtered);
    } else {
      setFilteredUnitKerja([]);
    }
    fetchData(0, pageSize, newCabang, selectedUnitKerja, searchNama);
    setCurrentPage(0); // Reset page to 0 when filter changes
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

  const handleUnitKerjaSelect = (unitKerja) => {
    const newUnitKerja = unitKerja?.unitKerja || "";
    setSelectedUnitKerja(newUnitKerja);
    setUnitKerjaInput(newUnitKerja);
    setShowUnitKerjaDropdown(false);
    console.log("Selected Unit Kerja:", newUnitKerja);

    fetchData(0, pageSize, selectedCabang, newUnitKerja, searchNama);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      fetchData(page, pageSize, selectedCabang, selectedUnitKerja, searchNama);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleNamaChange = (e) => {
    const query = e.target.value;
    setSearchNama(query);
    fetchData(0, pageSize, selectedCabang, selectedUnitKerja, query);
    setCurrentPage(0);
  };

  const renderTableBody = () => {
    return (
      <tbody className="text-center">
        {data.length > 0 ? (
          data.map((item, index) => {
            const namaList = (item.nama || '').split(" | ").filter(Boolean);
            const npaList = (item.npa || '').split(" | ").filter(Boolean);
            const namaKtaList = (item.ktaDigitalNama || '').split(" | ").filter(Boolean);
            const namaSandukaList = (item.sandukaNama || '').split(" | ").filter(Boolean);
            const namaDaspenList = (item.daspenNama || '').split(" | ").filter(Boolean);

            return (
              <tr
                key={index}
                className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-200 transition duration-150`}
              >
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">{item.cabang || '-'}</td>
                <td className="py-2 px-4 border">{item.unitKerja || '-'}</td>
                <td className="py-2 px-4 border whitespace-pre-line text-left">
                  {namaList.map((nama, idx) => (
                    <div key={idx}>
                      {idx + 1}. {nama}
                    </div>
                  ))}
                </td>
                <td className="py-2 px-4 border whitespace-pre-line text-left">
                  {npaList.map((npa, idx) => {
                    return (
                      <div key={idx}>
                        {idx + 1}. {npa}
                      </div>
                    );
                  })}
                </td>
                <td className="py-2 px-4 border whitespace-pre-line text-left">
                  {namaKtaList.map((namaKta, idx) => {
                    return (
                      <div key={idx}>
                        {idx + 1}. {namaKta}
                      </div>
                    );
                  })}
                </td>
                <td className="py-2 px-4 border text-center">
                  {item.ktaDigitalJumlah || 0}
                </td>
                <td className="py-2 px-4 border whitespace-pre-line text-left">
                  {namaSandukaList.map((namaSanduka, idx) => {
                    return (
                      <div key={idx}>
                        {idx + 1}. {namaSanduka}
                      </div>
                    );
                  })}
                </td>
                <td className="py-2 px-4 border text-center">
                  {item.sandukaJumlah || 0}
                </td>
                <td className="py-2 px-4 border whitespace-pre-line text-left">
                  {namaDaspenList.map((namaDaspen, idx) => {
                    return (
                      <div key={idx}>
                        {idx + 1}. {namaDaspen}
                      </div>
                    );
                  })}
                </td>
                <td className="py-2 px-4 border text-center">
                  {item.daspenJumlah || 0}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="11" className="py-4 text-center text-gray-500">
              {isLoading ? "Loading data..." : "Tidak ada data yang tersedia."}
            </td>
          </tr>
        )}
      </tbody>
    );
  };

  const renderPagination = () => {
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0 || isLoading}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          First
        </button>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: endPage - startPage + 1 }).map((_, idx) => {
          const pageNumber = startPage + idx;
          return (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              disabled={isLoading}
              className={`px-3 py-1 border rounded-md ${pageNumber === currentPage
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50"
                }`}
            >
              {pageNumber + 1}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>

        <button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Last
        </button>
      </div>
    );
  };

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL data, not just current page, for the Excel download
      // Pass totalElements as size to get all data matching current filters
      const allFilteredDataForPrint = await fetchData(
        0, // Start from page 0
        totalElements, // Fetch all elements based on current filters
        selectedCabang,
        selectedUnitKerja,
        searchNama
      );

      if (!allFilteredDataForPrint || allFilteredDataForPrint.length === 0) {
        setIsLoading(false);
        alert("Tidak ada data untuk dicetak.");
        return;
      }

      const headers = [
        "No",
        "Cabang",
        "Unit Kerja",
        "Nama Anggota",
        "Npa",
        "Nama Anggota KTA Digital",
        "Jumlah KTA Digital",
        "Nama Anggota Sanduka",
        "Jumlah Sanduka",
        "Nama Anggota Daspen",
        "Jumlah Daspen",
      ];

      const formatMultiLineStringForExcel = (value) => {
        if (!value) {
          return "-";
        }

        const parts = String(value).split(" | ").filter(Boolean);

        if (parts.length === 0) {
          return "-";
        }

        return parts.map((part, idx) => `${idx + 1}. ${part.trim()}`).join('\n');
      };

      const excelDataRows = allFilteredDataForPrint.map((item, index) => [
        index + 1,
        item.cabang || "-",
        item.unitKerja || "-",
        formatMultiLineStringForExcel(item.nama),
        formatMultiLineStringForExcel(item.npa),
        formatMultiLineStringForExcel(item.ktaDigitalNama),
        item.ktaDigitalJumlah || 0,
        formatMultiLineStringForExcel(item.sandukaNama),
        item.sandukaJumlah || 0,
        formatMultiLineStringForExcel(item.daspenNama),
        item.daspenJumlah || 0,
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelDataRows]);
      allFilteredDataForPrint.forEach((item, originalIndex) => {
        const excelRowIndex = originalIndex + 1;
        const columnsToWrap = [
          { key: 'nama', colIndex: 3 },
          { key: 'npa', colIndex: 4 },
          { key: 'ktaDigitalNama', colIndex: 5 },
          { key: 'sandukaNama', colIndex: 7 },
          { key: 'daspenNama', colIndex: 9 },
        ];

        columnsToWrap.forEach(col => {
          const cellValue = item[col.key];
          if (cellValue && String(cellValue).includes(' | ')) {
            const cellRef = XLSX.utils.encode_cell({ r: excelRowIndex, c: col.colIndex });
            if (worksheet[cellRef]) {
              worksheet[cellRef].s = { alignment: { wrapText: true, vertical: 'top' } };
            }
          }
        });
      });

      const columnWidths = headers.map((header, index) => {
        let maxWidth = header.length;
        excelDataRows.forEach(row => {
          const cellContent = String(row[index] || '');
          const lines = cellContent.split('\n');
          lines.forEach(line => {
            if (line.length > maxWidth) {
              maxWidth = line.length;
            }
          });
        });
        return { wch: maxWidth + 2 };
      });
      worksheet['!cols'] = columnWidths;


      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anggota");

      XLSX.writeFile(workbook, "Kroscek_Data.xlsx");

    } catch (error) {
      console.error("Error during Excel download process:", error);
      alert("Terjadi kesalahan saat mengunduh file Excel. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Anggota By Name</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderMenu />
      )}
      <div>
        <div className="min-h-screen flex-grow bg-gray-50 py-10 pt-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
              {/* Filter Group */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                {/* Cabang Filter */}
                <div className="w-full" ref={cabangRef}>
                  <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onClick={handleCabangClick}
                    className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition duration-150 ${role === "ADMIN" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    placeholder="Pilih Cabang"
                    disabled={role === "ADMIN"}
                  />
                  {showCabangDropdown && role !== "ADMIN" && (
                    <div className="absolute z-10 border rounded-md bg-white shadow-md mt-2">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-3">
                          <Input
                            type="text"
                            onChange={(e) => handleCabangSearch(e.target.value)}
                            className="block w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                            placeholder="Cari atau ketik Cabang..."
                            autoFocus
                          />
                        </li>
                        <li
                          onClick={() => handleSelectCabang({ kecamatan: "" })}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          Pilih Cabang
                        </li>
                        {filteredCabangList.map((cabang) => (
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

                {/* Unit Kerja Filter */}
                <div className="w-full" ref={unitKerjaRef}>
                  <Input
                    type="text"
                    value={unitKerjaInput}
                    onChange={handleUnitKerjaChange}
                    onFocus={handleUnitKerjaFocus}
                    placeholder="Pilih Unit Kerja"
                    className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition ${!selectedCabang ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    disabled={!selectedCabang}
                  />
                  {showUnitKerjaDropdown && (
                    <div className="absolute z-10 border rounded-md bg-white shadow-md mt-2">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-3">
                          <Input
                            type="text"
                            onChange={(e) =>
                              handleUnitKerjaSearch(e.target.value)
                            }
                            placeholder="Cari atau ketik Unit Kerja..."
                            autoFocus
                            className="block w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                          />
                        </li>
                        <li
                          onClick={() =>
                            handleUnitKerjaSelect({ unitKerja: "" })
                          }
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          Pilih Unit Kerja
                        </li>
                        {filteredUnitKerja.length > 0 ? (
                          filteredUnitKerja.map((unitKerja) => (
                            <li
                              key={unitKerja.id}
                              onClick={() => handleUnitKerjaSelect(unitKerja)}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              {unitKerja.unitKerja}
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

                {/* Search Filter */}
                <div>
                  <Input
                    type="text"
                    className="block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    placeholder="Cari Data"
                    onChange={handleNamaChange}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleDownloadExcel}
              >
                Cetak
              </Button>
            </div>
          </div>

          <div
            ref={tableRef}
            className="overflow-x-auto relative shadow-md sm:rounded-lg"
          >
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-white uppercase bg-teal-700 text-center">
                <tr>
                  <th colSpan="5" className="py-3 px-6 border border-white">
                    Kroscek Data
                  </th>
                  <th colSpan="2" className="py-3 px-6 border border-white">
                    KTA DIGITAL
                  </th>
                  <th colSpan="2" className="py-3 px-6 border border-white">
                    SANDUKA
                  </th>
                  <th colSpan="3" className="py-3 px-6 border border-white">
                    DASPEN
                  </th>
                </tr>
                <tr>
                  <th scope="col" className="py-3 px-6 border border-white">
                    No
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Cabang
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Unit Kerja
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Nama Anggota
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 border border-white w-32"
                  >
                    Npa
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Nama Anggota
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Jumlah
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Nama Anggota
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Jumlah
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Nama Anggota
                  </th>
                  <th scope="col" className="py-3 px-6 border border-white">
                    Jumlah
                  </th>
                </tr>
              </thead>

              {renderTableBody()}
            </table>
          </div>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default CekData;