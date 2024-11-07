"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

function RekapAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const { token } = useAuth();
  const router = useRouter();
  const [rekapData, setRekapData] = useState([]);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rekapData.length / maxItems);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [originalRekapData, setOriginalRekapData] = useState([]);
<<<<<<< HEAD
  const [totalSumbanganPerCabang, setTotalSumbanganPerCabang] = useState(0);
=======
  const [expandedIndex, setExpandedIndex] = useState(null);
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
<<<<<<< HEAD

        const defaultCabang = response.data.find(
          (cabang) => cabang.kecamatan === "BANGSRI"
        );
        if (defaultCabang) {
          setSelectedCabang("BANGSRI");
          await fetchRekapData("BANGSRI");

          const filteredUnitKerja = unitKerjaList.filter(
            (unitKerja) =>
              unitKerja.cabang && unitKerja.cabang.toLowerCase() === "bangsri"
          );
          setFilteredUnitKerja(filteredUnitKerja);
        }
=======
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, [unitKerjaList]);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);

<<<<<<< HEAD
=======
    const filteredUnitKerja = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().startsWith(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(filteredUnitKerja.length > 0);
    setFilteredUnitKerja(filteredUnitKerja);

    const rekapFilteredByUnitKerja = originalRekapData.filter(
      (item) =>
        item.alamatKerja &&
        item.alamatKerja.toLowerCase().includes(input.toLowerCase())
    );

>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
    if (input === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
      setRekapData(originalRekapData);
    } else {
      const filteredUnitKerja = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang &&
          unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
          unitKerja.unitKerja.toLowerCase().startsWith(input.toLowerCase())
      );

      setShowUnitKerjaDropdown(filteredUnitKerja.length > 0);
      setFilteredUnitKerja(filteredUnitKerja);

      const rekapFilteredByUnitKerja = originalRekapData.filter(
        (item) =>
          item.alamatKerja &&
          item.alamatKerja.toLowerCase().includes(input.toLowerCase())
      );

      setRekapData(rekapFilteredByUnitKerja);
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

    await fetchRekapData(cabang.kecamatan);
<<<<<<< HEAD

=======
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
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
<<<<<<< HEAD

    if (unitKerja.unitKerja === "") {
      setRekapData(originalRekapData);
    } else {
      const filteredRekapData = originalRekapData.filter(
        (item) => item.alamatKerja === unitKerja.unitKerja
      );
      setRekapData(filteredRekapData);
    }
=======
    console.log("Unit kerja yang dipilih:", unitKerja);
    const filteredRekapData = originalRekapData.filter(
      (item) => item.alamatKerja === unitKerja.unitKerja
    );
    setRekapData(filteredRekapData);
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchRekapData = async (cabang) => {
    try {
      const data = await GlobalApi.getRekapAnggotaByCabang(cabang);
      setRekapData(data.data);
      setOriginalRekapData(data.data);
      setTotalSumbanganPerCabang(data.totalSumbanganPerCabang);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
  };

  useEffect(() => {
    console.log("Total Sumbangan Per Cabang State:", totalSumbanganPerCabang);
  }, [totalSumbanganPerCabang]);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

<<<<<<< HEAD
  const formatCurrency = (value) => {
    if (value === "-") return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

=======
  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const startIndex = (currentPage - 1) * maxItems;
  const paginatedData = rekapData.slice(startIndex, startIndex + maxItems);

  const jumlahPns = rekapData.reduce((acc, curr) => acc + curr.totalPns, 0);
  const jumlahPppk = rekapData.reduce((acc, curr) => acc + curr.totalPppk, 0);
  const jumlahNonPns = rekapData.reduce(
    (acc, curr) => acc + curr.totalNonPns,
    0
  );

  const jumlah = rekapData.reduce(
    (acc, curr) => acc + (curr.totalPns + curr.totalPppk + curr.totalNonPns),
    0
  );

  const jumlahIuran = rekapData.reduce((acc, curr) => acc + curr.totalIuran, 0);
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="mb-4 mx-12">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <div className="flex flex-col relative w-64" ref={cabangRef}>
                  <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onClick={handleCabangClick}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                    placeholder="Pilih Cabang"
                  />
                  {showCabangDropdown && (
                    <div className="absolute mt-9 w-full">
                      <Input
                        type="text"
                        onChange={(e) => handleCabangSearch(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-2"
                        placeholder="Cari atau ketik Cabang..."
                        autoFocus
                      />
                      {filteredCabangList.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1">
                          <li
                            onClick={() =>
                              handleSelectCabang({ kecamatan: "" })
                            }
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
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
                  <Input
                    type="text"
                    value={unitKerjaInput}
                    onFocus={handleUnitKerjaFocus}
                    onChange={handleUnitKerjaChange}
                    placeholder="Pilih Unit Kerja"
                    readOnly
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    disabled={!selectedCabang}
                  />
                  {showUnitKerjaDropdown && (
                    <div className="absolute mt-9 w-full">
                      <Input
                        type="text"
                        onChange={(e) => handleUnitKerjaSearch(e.target.value)}
                        placeholder="Cari atau ketik Unit Kerja..."
                        autoFocus
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mt-2"
                      />
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1">
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
              </div>
              <div className="flex items-end mt-2 md:mt-0">
                <div className="mb-4 space-x-2">
                  <label htmlFor="maxItems" className="mr-2">
                    Tampilkan:
                  </label>
                  <select
                    id="maxItems"
                    value={maxItems}
                    onChange={(e) => setMaxItems(parseInt(e.target.value))}
                    className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <button
                    onClick={() => window.print()}
                    className="p-2 px-4 bg-blue-500 text-white rounded w-full md:w-auto"
                  >
                    Cetak
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="container w-full table-auto mb-8">
              <thead>
                <tr>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    No
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Unit Kerja
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
<<<<<<< HEAD
=======
                    colSpan="3"
                  >
                    Status Anggota
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell"
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
                    rowSpan="2"
                  >
                    Jumlah
                  </th>
                  <th
<<<<<<< HEAD
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    colSpan="3"
                  >
                    Status Anggota
                  </th>
                  
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
=======
                    className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell"
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
                    rowSpan="2"
                  >
                    Iuran
                  </th>
                </tr>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    PGRI
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Sanduka
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Daspen
                  </th>
                </tr>
              </thead>
              <tbody>
                {rekapData.length > 0 && selectedCabang ? (
                  rekapData.map((item, index) => (
<<<<<<< HEAD
                    <tr key={item.id}>
                      <td className="p-2 md:p-3 border text-center">
                        {index + 1}
                      </td>
                      <td className="p-2 md:p-3 border">{item.alamatKerja}</td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.totalCount}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.pesertaKtaDigitalCount}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.pesertaSandukaCount}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.pesertaDaspenCount}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {formatCurrency(item.totalSumbangan)}
                      </td>
                    </tr>
=======
                    <>
                      <tr key={item.id}>
                        <td className="p-2 md:p-3 border text-center">
                          <div className="flex justify-center items-center">
                            {index + 1}

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
                          </div>
                        </td>
                        <td className="p-2 md:p-3 border">
                          {item.alamatKerja}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.totalPns}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.totalPppk}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.totalNonPns}
                        </td>

                        <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                          {item.jumlah}
                        </td>
                        <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                          {item.totalIuran}
                        </td>
                      </tr>

                      {expandedIndex === index && (
                        <tr className="lg:hidden bg-gray-100">
                          <td colSpan="5" className="p-2 md:p-3 border text-sm">
                            <div>
                              <strong>Jumlah:</strong> {item.jumlah}
                            </div>
                            <div>
                              <strong>Iuran:</strong> Rp.{" "}
                              {item.totalIuran.toLocaleString("id-ID")},-
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
                  ))
                ) : (
                  <tr>
                    <td className="p-2 md:p-3 border text-center">1</td>
                    <td className="p-2 md:p-3 border"></td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                      0
                    </td>
                    <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                      0
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="2"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    Jumlah :
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center"
                  colSpan="5">
                    {totalSumbanganPerCabang
        ? `Rp. ${parseInt(totalSumbanganPerCabang).toLocaleString("id-ID")},-`
        : "Data tidak tersedia"}
                  </td>
<<<<<<< HEAD
                 
=======
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {jumlahPppk}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    {jumlahNonPns}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center hidden lg:table-cell">
                    {jumlah}
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center hidden lg:table-cell">
                    Rp. {jumlahIuran.toLocaleString("id-ID")},-
                  </td>
>>>>>>> 6e17c4eceb108d0c2f8aff6051526087cb93f65d
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="mr-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;
