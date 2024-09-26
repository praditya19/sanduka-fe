"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

function RekapAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const { token } = useAuth();
  const router = useRouter();
  const [rekapData, setRekapData] = useState([]);

  const [cabangList, setCabangList] = useState([]);
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

  // Close dropdowns when clicking outside
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
      setRekapData(data);
      setOriginalRekapData(data); // Simpan data asli saat mengambil data
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
  };

  // Fetch cabang data
  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, []);

  // Fetch unit kerja data
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

  // Filter unit kerja berdasarkan cabang yang dipilih
  useEffect(() => {
    if (selectedCabang) {
      console.log("Selected Cabang:", selectedCabang);

      const filtered = unitKerjaList.filter((unitKerja) => {
        return (
          unitKerja.cabang &&
          unitKerja.cabang.toLowerCase().includes(selectedCabang.toLowerCase())
        );
      });

      console.log("Filtered Unit Kerja:", filtered);
      setFilteredUnitKerja(filtered);
    } else {
      setFilteredUnitKerja([]); // Kosongkan jika tidak ada cabang yang dipilih
    }
  }, [selectedCabang, unitKerjaList]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSelectedCabang(input);
    
    // Filter cabang berdasarkan input
    const filtered = cabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCabangList(filtered);
    
    // Tampilkan dropdown meskipun input kosong
    setShowCabangDropdown(true);
    
    // Jika input kosong, tampilkan semua cabang
    if (input === "") {
      setFilteredCabangList(cabangList); // Tampilkan semua cabang jika input kosong
    }
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);

    // Fetch rekap data based on selected cabang
    await fetchRekapData(cabang.kecamatan);

    // Now filter the unit kerja based on the selected cabang
    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      // Jika input kosong, tampilkan semua unit kerja terkait cabang
      // if (unitKerjaInput) {
      //   const filtered = unitKerjaList.filter((unitKerja) =>
      //     unitKerja.cabang &&
      //     unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase()
      //   );
      //   setFilteredUnitKerja(filtered);
      // }
      setShowUnitKerjaDropdown(true); // Tampilkan dropdown
    }
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
  
    // Filter unit kerja berdasarkan input dan cabang
    const filteredUnitKerja = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().startsWith(input.toLowerCase())
    );
  
    // Tampilkan dropdown jika ada hasil filter
    setShowUnitKerjaDropdown(filteredUnitKerja.length > 0);
    setFilteredUnitKerja(filteredUnitKerja);
  
    // Filter data rekap berdasarkan input unit kerja
    const rekapFilteredByUnitKerja = originalRekapData.filter(
      (item) =>
        item.alamatKerja &&
        item.alamatKerja.toLowerCase().includes(input.toLowerCase())
    );
  
    // Jika input kosong, kembalikan data tabel ke data awal
    if (input === "") {
      setRekapData(originalRekapData);
    } else {
      setRekapData(rekapFilteredByUnitKerja);
    }
  };
  

  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja);
    setUnitKerjaInput(unitKerja.unitKerja);
    setShowUnitKerjaDropdown(false);
  
    // Update rekapData berdasarkan unit kerja yang dipilih
    const filteredRekapData = originalRekapData.filter(
      (item) => item.alamatKerja === unitKerja.unitKerja
    );
    setRekapData(filteredRekapData);
  };

  useEffect(() => {
    if (!unitKerjaInput && selectedCabang) {
      fetchRekapData(selectedCabang); // Fetch kembali data berdasarkan cabang yang dipilih
    }
  }, [unitKerjaInput, selectedCabang]);

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

  // Determine the start and end index of the items to display based on the current page
  const startIndex = (currentPage - 1) * maxItems;
  const paginatedData = rekapData.slice(startIndex, startIndex + maxItems);

  const jumlahPns = rekapData.reduce((acc, curr) => acc + curr.totalPns, 0);
  const jumlahPppk = rekapData.reduce((acc, curr) => acc + curr.totalPppk, 0);
  const jumlahNonPns = rekapData.reduce((acc, curr) => acc + curr.totalNonPns, 0);

  // Correct the syntax here by accessing `curr` directly
  const jumlah = rekapData.reduce((acc, curr) => acc + (curr.totalPns + curr.totalPppk + curr.totalNonPns), 0);

  const jumlahIuran = rekapData.reduce((acc, curr) => acc + curr.totalIuran, 0);



  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderHome />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}
        >
          <div className="mb-4 mx-12">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <div className="flex flex-col relative w-64" ref={cabangRef}>
                  <input
                    type="text"
                    value={selectedCabang}
                    onFocus={() => setShowCabangDropdown(true)}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                    placeholder="Pilih Cabang"
                  />
                  {showCabangDropdown && filteredCabangList.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-12 max-h-40 overflow-y-auto">
                      {filteredCabangList.map((cabang) => (
                        <li
                          key={cabang.id} // Unique key for each cabang
                          onClick={() => handleSelectCabang(cabang)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          {cabang.kecamatan}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
                  <input
                    type="text"
                    value={unitKerjaInput}
                    onFocus={handleUnitKerjaFocus}
                    onChange={handleUnitKerjaChange}
                    placeholder="Pilih Unit Kerja"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    disabled={!selectedCabang}
                  />
                  {showUnitKerjaDropdown && filteredUnitKerja.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-12 max-h-40 overflow-y-auto">
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
                    onClick={() => window.print()} // Fungsi untuk mencetak halaman
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
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">No</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">Unit Kerja</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" colSpan="3">Status Anggota</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">Jumlah</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700" rowSpan="2">Iuran</th>
                </tr>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">PNS</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">PPPK</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">Non PNS</th>
                </tr>
              </thead>
              <tbody>
                {rekapData.length > 0 && selectedCabang ? ( // Tampilkan tabel hanya jika ada data dan filter yang dipilih
                  rekapData.map((item, index) => (
                    <tr key={item.id}>
                      <td className="p-2 md:p-3 border text-center">
                        {index + 1}
                      </td>
                      <td className="p-2 md:p-3 border">{item.alamatKerja}</td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.totalPns}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.totalPppk}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.totalNonPns}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.jumlah}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {item.totalIuran}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 md:p-3 border text-center">1</td>
                    <td className="p-2 md:p-3 border"></td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                    <td className="p-2 md:p-3 border text-center">0</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="p-2 md:p-3 border bg-green-200 text-left">
                    Jumlah :
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">{jumlahPns}</td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">{jumlahPppk}</td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">{jumlahNonPns}</td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">{jumlah}</td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">{`Rp. ${jumlahIuran.toLocaleString("id-ID")},-`}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination controls */}
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
