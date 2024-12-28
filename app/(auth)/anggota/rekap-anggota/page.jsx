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
import { ClipLoader } from "react-spinners";

function RekapAnggota() {
  const [data, setData] = useState([]);
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
  const totalPages = Math.ceil(data.length / maxItems);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [totals, setTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    iuran: 0
  });
  const [loading, setLoading] = useState(true);


  const getVisiblePages = () => {
    const maxVisiblePages = 2;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisiblePages);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if end page is less than max visible pages
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  };

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
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
    setSelectedUnitKerja(input);

    if (!selectedCabang) return;

    // Filter unit kerja list based on input
    const filteredList = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(true);
    setFilteredUnitKerja(filteredList);

    // Filter data based on input
    if (input === "") {
      const cabangData = data.filter(
        item => selectedCabang === "" || item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
      );
      setData(cabangData);
      calculateTotals(cabangData);
    } else {
      const filteredData = data.filter(
        (item) =>
          item.alamatKerja?.toLowerCase().includes(input.toLowerCase())
      );
      setData(filteredData);
      calculateTotals(filteredData);
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
    setSelectedUnitKerja(""); // Reset unit kerja when changing cabang
    setUnitKerjaInput(""); // Reset unit kerja input

    try {
      const response = await GlobalApi.getRekapAnggota(cabang.kecamatan || "");
      setData(response);
      setOriginalRekapData(response); // Store original data
      calculateTotals(response);

      // Filter unit kerja list for selected cabang
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang &&
          unitKerja.cabang.toLowerCase() === (cabang.kecamatan || "").toLowerCase()
      );
      setFilteredUnitKerja(filtered);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
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
    const selectedValue = unitKerja.unitKerja;
    setSelectedUnitKerja(selectedValue);
    setUnitKerjaInput(selectedValue);
    setShowUnitKerjaDropdown(false);

    if (!selectedValue) {
      // If "Pilih Unit Kerja" is selected, show all data for selected cabang
      setData(originalRekapData);
      calculateTotals(originalRekapData);
    } else {
      // Filter data for selected unit kerja
      const filteredData = originalRekapData.filter(
        item => item.alamatKerja?.toLowerCase() === selectedValue.toLowerCase()
      );
      setData(filteredData);
      calculateTotals(filteredData);
    }
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get stored role and cabang from sessionStorage
        const storedRole = sessionStorage.getItem("role");
        const storedCabang = sessionStorage.getItem("cabang");

        // If user is admin and has an assigned cabang
        if (storedRole === "ADMIN" && storedCabang) {
          setIsAdmin(true);
          setSelectedCabang(storedCabang);
          // Fetch data for the admin's cabang
          const response = await GlobalApi.getRekapAnggota(storedCabang);
          setData(response);
          setOriginalRekapData(response);
          calculateTotals(response);

          // Filter unit kerja list for the admin's cabang
          const filtered = unitKerjaList.filter(
            (unitKerja) =>
              unitKerja.cabang &&
              unitKerja.cabang.toLowerCase() === storedCabang.toLowerCase()
          );
          setFilteredUnitKerja(filtered);
        } else {
          // For non-admin users, fetch all data as before
          const response = await GlobalApi.getRekapAnggota("");
          setData(response);
          setOriginalRekapData(response);
          calculateTotals(response);
        }
        setLoading(false); // Add this line to set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false); // Add this line to set loading to false in case of error
      }
    };
    fetchInitialData();
  }, [unitKerjaList]);

  const calculateTotals = (dataArray) => {
    const newTotals = dataArray.reduce((acc, item) => ({
      jumlah: acc.jumlah + (parseInt(item.jumlah) || 0),
      pgri: acc.pgri + (parseInt(item.totalPns) || 0),
      sanduka: acc.sanduka + (parseInt(item.totalNonPns) || 0),
      daspen: acc.daspen + (parseInt(item.totalPppk) || 0),
      iuran: acc.iuran + (parseFloat(item.totalIuran) || 0)
    }), {
      jumlah: 0,
      pgri: 0,
      sanduka: 0,
      daspen: 0,
      iuran: 0
    });
    setTotals(newTotals);
  };

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

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const startIndex = (currentPage - 1) * maxItems;
  const paginatedData = data.slice(startIndex, startIndex + maxItems);

  // const jumlahPns = rekapData.reduce((acc, curr) => acc + curr.totalPns, 0);
  // const jumlahPppk = rekapData.reduce((acc, curr) => acc + curr.totalPppk, 0);
  // const jumlahNonPns = rekapData.reduce(
  //   (acc, curr) => acc + curr.totalNonPns,
  //   0
  // );

  // const jumlah = rekapData.reduce(
  //   (acc, curr) => acc + (curr.totalPns + curr.totalPppk + curr.totalNonPns),
  //   0
  // );

  // const jumlahIuran = rekapData.reduce((acc, curr) => acc + curr.totalIuran, 0);


  const renderCabangInput = () => {
    return (
      <div className="flex flex-col relative w-64" ref={cabangRef}>
        <Input
          type="text"
          value={selectedCabang}
          readOnly
          onClick={!isAdmin ? handleCabangClick : undefined}
          className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${isAdmin ? 'bg-gray-100' : ''
            }`}
          placeholder="Pilih Cabang"
          disabled={isAdmin}
        />
        {!isAdmin && showCabangDropdown && (
          <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
            <ul className="max-h-44 overflow-y-auto">
              <li className="py-2 px-2">
                <Input
                  type="text"
                  onChange={(e) => handleCabangSearch(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                  placeholder="Cari ketik Cabang..."
                  autoFocus
                />
              </li>
              <li
                onClick={() => handleSelectCabang({ kecamatan: "" })}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Pilih Cabang
              </li>
              {filteredCabangList.map((cabang) => (
                <li
                  key={cabang.id}
                  onClick={() => handleSelectCabang(cabang)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {cabang.kecamatan}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderUnitKerjaInput = () => (
    <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
      <Input
        type="text"
        value={unitKerjaInput}
        onChange={handleUnitKerjaChange}
        onFocus={handleUnitKerjaFocus}
        placeholder="Pilih Unit Kerja"
        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
        disabled={!selectedCabang}
      />
      {showUnitKerjaDropdown && (
        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
          <ul className="max-h-44 overflow-y-auto">
            <li
              onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              Pilih Unit Kerja
            </li>
            {filteredUnitKerja.map((unitKerja) => (
              <li
                key={unitKerja.id}
                onClick={() => handleUnitKerjaSelect(unitKerja)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {unitKerja.unitKerja}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="mb-4 mx-12">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                {renderCabangInput()}

                {renderUnitKerjaInput()}
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
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
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
                    className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell"
                    rowSpan="2"
                  >
                    Jumlah
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
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700 hidden lg:table-cell"
                  >
                    Iuran
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td className="p-2 md:p-3 border text-center">
                          <div className="flex justify-center items-center">
                            {startIndex + index + 1}
                            <Button
                              className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden"
                              onClick={() => handleExpand(startIndex + index)}
                            >
                              {expandedIndex === startIndex + index ? (
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
                          {item.jumlah}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.totalPns}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.totalNonPns}
                        </td>
                        <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                          {item.totalPppk}
                        </td>
                        <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                          Rp. {parseInt(item.totalIuran).toLocaleString("id-ID")}
                        </td>
                      </tr>

                      {expandedIndex === startIndex + index && (
                        <tr className="lg:hidden bg-gray-100">
                          <td colSpan="5" className="p-2 md:p-3 border text-sm">
                            <div>
                              <strong>Jumlah:</strong> {item.jumlah}
                            </div>
                            <div>
                              <strong>Iuran:</strong> Rp.{" "}
                              {parseInt(item.totalIuran).toLocaleString("id-ID")}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-2 md:p-3 border text-center">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="2" className="p-2 md:p-3 border text-right">
                    Total:
                  </td>
                  <td className="p-2 md:p-3 border text-center">
                    {totals.jumlah}
                  </td>
                  <td className="p-2 md:p-3 border text-center">
                    {totals.pgri}
                  </td>
                  <td className="p-2 md:p-3 border text-center">
                    {totals.sanduka}
                  </td>
                  <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                    {totals.daspen}
                  </td>
                  <td className="p-2 md:p-3 border text-center hidden lg:table-cell">
                    Rp. {parseInt(totals.iuran).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-center mt-4 gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Prev
            </button>

            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-50"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;
