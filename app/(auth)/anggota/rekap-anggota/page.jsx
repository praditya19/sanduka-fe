"use client";
import React, { useState, useEffect } from "react";
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

  const [cabangList, setCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);

  const [unitKerjaList, setUnitKerjaList] = useState([]); // Store unit kerja list
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]); // Store filtered unit kerja
  const [selectedUnitKerja, setSelectedUnitKerja] = useState(""); // Store selected unit kerja
  const [unitKerjaInput, setUnitKerjaInput] = useState(""); // Input for searching unit kerja
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);

  // Fetch cabang data
  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data); // Assuming the response data is an array
        setFilteredCabangList(response.data); // Set initial filtered list
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
        const response = await GlobalApi.getUnitKerja(); // Fetch unit kerja data
        setUnitKerjaList(response.data); // Assuming response is an array
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };

    fetchUnitKerjaData();
  }, []);

  // Filter unit kerja based on selected cabang
  useEffect(() => {
    if (selectedCabang) {
      const filtered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang // Adjust based on your data structure
      );

      // Handle cases where unitKerja might be empty
      setFilteredUnitKerja(filtered.filter((unit) => unit.unitKerja)); // Only include units that have a valid unitKerja
    } else {
      setFilteredUnitKerja([]); // Reset if no cabang is selected
    }
  }, [selectedCabang, unitKerjaList]);

  // Handle input change for cabang
  const handleInputChange = (e) => {
    const input = e.target.value;
    setSelectedCabang(input);

    // Filter the cabang list based on input
    const filtered = cabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCabangList(filtered);

    // Show the dropdown only if input is not empty
    setShowCabangDropdown(input !== "");
  };

  // Handle cabang selection
  const handleSelectCabang = (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false); // Hide the dropdown after selection
  };

  // Handle focus on unit kerja input
  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      // Show dropdown only if a cabang is selected
      setFilteredUnitKerja(unitKerjaList); // Show all unit kerja initially
      setShowUnitKerjaDropdown(true); // Show the dropdown
    }
  };

  // Handle input change for unit kerja
  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input); // Store input value

    // Filter based on input
    const filtered = unitKerjaList.filter((unitKerja) =>
      unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
    );

    setFilteredUnitKerja(filtered);
  };

  // Handle selection of unit kerja
  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja); // Pastikan unitKerja.unitKerja adalah string
    setUnitKerjaInput(unitKerja.unitKerja); // Set input to the selected unit kerja
    setShowUnitKerjaDropdown(false); // Hide dropdown after selection
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

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderHome />}
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
                <div className="flex flex-col relative w-64">
                  <input
                    type="text"
                    value={selectedCabang}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                    placeholder="Pilih Cabang"
                  />
                  {showCabangDropdown && filteredCabangList.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-12">
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
                <div className="flex flex-col relative w-64">
                  <input
                    type="text"
                    value={unitKerjaInput}
                    onFocus={handleUnitKerjaFocus}
                    onChange={handleUnitKerjaChange}
                    placeholder="Pilih Unit Kerja"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    disabled={!selectedCabang} // Disable if no cabang is selected
                  />
                  {showUnitKerjaDropdown && filteredUnitKerja.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-12 max-h-40 overflow-y-auto">
                      {filteredUnitKerja.slice(0, 5).map(
                        (
                          unitKerja // Limit to 5 items
                        ) => (
                          <li
                            key={unitKerja.id}
                            onClick={() => handleUnitKerjaSelect(unitKerja)} // Memanggil fungsi pemilihan unit kerja
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          >
                            {unitKerja.unitKerja}
                          </li>
                        )
                      )}
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
                    colSpan="3"
                  >
                    Status Anggota
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Jumlah
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Iuran
                  </th>
                </tr>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    PNS
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    PPPK
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Non PNS
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Default Empty Row */}
                <tr>
                  <td className="p-2 md:p-3 border text-center">1</td>
                  <td className="p-2 md:p-3 border"></td>
                  <td className="p-2 md:p-3 border text-center">0</td>
                  <td className="p-2 md:p-3 border text-center">0</td>
                  <td className="p-2 md:p-3 border text-center">0</td>
                  <td className="p-2 md:p-3 border text-center">0</td>
                  <td className="p-2 md:p-3 border text-center">0</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="2"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    Jumlah :
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    0
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    0
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    0
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    0
                  </td>
                  <td className="p-2 md:p-3 border bg-green-200 text-center">
                    0
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    Total Sumbangan :
                  </td>
                  <td
                    colSpan="5"
                    className="p-2 md:p-3 border bg-green-200 text-left"
                  >
                    Rp. 0,-
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;