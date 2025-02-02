"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";

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

      if (result && result.content && Array.isArray(result.content)) {
        setData(result.content);
        setTotalPages(result.totalPages || 0);
        setTotalElements(result.totalElements);
        return result.content;
      } else {
        console.warn("Data tidak sesuai format yang diharapkan.");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching history data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");
    setRole(storedRole || "");

    if (storedRole === "ADMIN" && storedCabang) {
      setSelectedCabang(storedCabang);
      filterUnitKerjaForCabang(storedCabang);
      fetchData(currentPage, pageSize, storedCabang);
    } else {
      fetchData(
        currentPage,
        pageSize,
        selectedCabang,
        selectedUnitKerja,
        searchNama
      );
    }

    const fetchInitialData = async () => {
      try {
        const [cabangRes, unitKerjaRes] = await Promise.all([
          GlobalApi.getCabang(),
          GlobalApi.getUnitKerja(),
        ]);

        setOriginalCabangList(cabangRes.data);
        setFilteredCabangList(cabangRes.data);
        setUnitKerjaList(unitKerjaRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchInitialData();

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

  useEffect(() => {
    if (selectedCabang) {
      setSelectedUnitKerja("");
      setUnitKerjaInput("");
      filterUnitKerjaForCabang(selectedCabang);
    }
  }, [selectedCabang]);

  const filterUnitKerjaForCabang = (cabang) => {
    const filtered = unitKerjaList.filter(
      (unitKerja) => unitKerja.cabang.toLowerCase() === cabang.toLowerCase()
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
          unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
          unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredUnitKerja(filtered);
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);

    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
    fetchData(0, pageSize, cabang.kecamatan, "", "");
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }

    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja);
    setUnitKerjaInput(unitKerja.unitKerja);
    setShowUnitKerjaDropdown(false);
    console.log(unitKerja.unitKerja);

    fetchData(0, pageSize, "", unitKerja.unitKerja, "");
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      fetchData(page, pageSize, selectedCabang);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleNamaChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchNama(e.target.value.toLowerCase());
    fetchData(0, pageSize, "", "", query);
  };

  // const removeTitle = (fullName) => {
  //   return fullName
  //     .replace(
  //       /\s*,?\s*(S\.?\s*Pd\.?\s*I?|M\.?\s*Pd\.?\s*I?|S\.?\s*Ag|S\.Ag|M\.?\s*Ag|M\.Ag|S\.?\s*H\.I|M\.?\s*H\.I|S\.H\.I|M\.H\.I|S\.?\s*E|S\.?\s*Si|S\.?\s*Sos|S\.?\s*Kom|S\.?\s*Ak|S\.?\s*Or|S\.?\s*Fil\.?\s*I|S\.?\s*Ds|Gr|SPd\s*SD|S\.?\s*Kom|S\.?\s*PD|S\.?\s*Si|S\.?\s*Pust|S\.?\s*Ps\s*I|M\.?\s*Kom|A\.?\s*Md|S\.?\s*Ps|S\.?\s*PDi|S\.?\s*M|SD)\.?\s*/gi,
  //       ""
  //     )
  //     .replace(/\s+/g, " ")
  //     .trim();
  // };

  const ensureArray = (data) =>
    Array.isArray(data) ? data : data.split(",").map((n) => n.trim());

  const formatNama = (nama) => {
    return ensureArray(nama)
      .map((part, index) => (index === 0 ? part.trim() : `\n${part.trim()}`))
      .join(", ");
  };

  const checkMissingData = (nama, ktaDigitalNama, sandukaNama, daspenNama) => {
    const formattedNama = formatNama(nama);
    const namesToCheck = formattedNama
      .split(",")
      .map((name) => name.trim().toLowerCase());

    const ktaDigitalNames = ktaDigitalNama
      .split(",")
      .map((name) => name.trim().toLowerCase());
    const sandukaNames = sandukaNama
      .split(",")
      .map((name) => name.trim().toLowerCase());
    const daspenNames = daspenNama
      .split(",")
      .map((name) => name.trim().toLowerCase());

    return namesToCheck.map((name) => ({
      name: name,
      isMissing: !(
        ktaDigitalNames.includes(name) &&
        sandukaNames.includes(name) &&
        daspenNames.includes(name)
      ),
    }));
  };

  const renderName = (nama, isMissingArray) => {
    const names = formatNama(nama).split(",");

    return names.map((name, idx) => {
      const trimmedName = name.trim();
      const status = isMissingArray[idx];
      const isLast = idx === names.length - 1;

      return (
        <div key={idx} className={`${status?.isMissing ? "text-red-500" : ""}`}>
          {trimmedName}
          {!isLast && ","}
        </div>
      );
    });
  };

  const renderTableBody = () => {
    return (
      <tbody className="text-center">
        {data?.map((item, index) => {
          const [
            cabang,
            unitKerja,
            nama,
            npa,
            ktaDigitalNama,
            ktaDigitalJumlah,
            sandukaNama,
            sandukaJumlah,
            daspenNama,
            daspenJumlah,
          ] = item;

          const missingStatus = checkMissingData(
            nama,
            ktaDigitalNama,
            sandukaNama,
            daspenNama
          );

          return (
            <tr
              key={index}
              className={`border-b ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-200 transition duration-150`}
            >
              <td className="py-2 px-4 border">{index + 1}</td>
              <td className="py-2 px-4 border">{cabang}</td>
              <td className="py-2 px-4 border">{unitKerja}</td>
              <td className="p-2 md:p-3 border hidden md:table-cell">
                {renderName(nama, missingStatus)}
              </td>
              <td className="py-2 px-4 border">{npa}</td>
              <td className="py-2 px-4 border whitespace-pre-line">
                {formatNama(ktaDigitalNama)}{" "}
              </td>
              <td className="py-2 px-4 border text-center">
                {ktaDigitalJumlah}
              </td>
              <td className="py-2 px-4 border whitespace-pre-line">
                {formatNama(sandukaNama)}{" "}
              </td>
              <td className="py-2 px-4 border text-center">{sandukaJumlah}</td>
              <td className="py-2 px-4 border whitespace-pre-line">
                {formatNama(daspenNama)}{" "}
              </td>
              <td className="py-2 px-4 border text-center">{daspenJumlah}</td>
            </tr>
          );
        })}
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
              className={`px-3 py-1 border rounded-md ${
                pageNumber === currentPage
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
      const filteredDataForPrint = await fetchData(
        currentPage,
        totalElements,
        selectedCabang,
        selectedUnitKerja,
        searchNama
      );

      if (!filteredDataForPrint || filteredDataForPrint.length === 0) {
        setIsLoading(false);
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

      const data = filteredDataForPrint.map((item, index) => [
        index + 1,
        item[0] || "-",
        item[1] || "-",
        item[2] || "-",
        item[3] || "-",
        item[4] || "-",
        item[5] || "0",
        item[6] || "-",
        item[7] || "0",
        item[8] || "-",
        item[9] || "0",
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anggota");

      XLSX.writeFile(workbook, "Kroscek_Data.xlsx");
    } catch (error) {
      console.error("Error during Excel download process:", error);
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
                    className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition duration-150 ${
                      role === "ADMIN" ? "bg-gray-100 cursor-not-allowed" : ""
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
                    className={`block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none transition ${
                      !selectedCabang ? "bg-gray-100 cursor-not-allowed" : ""
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
                  <th scope="col" className="py-3 px-6 border border-white">
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
