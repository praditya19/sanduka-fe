"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const [bulanList, setBulanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Add this state
  const [formValues, setFormValues] = useState({ // Add this state
    searchCabang: "",
  });

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  // Fetch cabang data
  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  // Fetch bulan data
  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data);

        // Set default month to current month
        const currentMonth = new Date().getMonth();
        if (response.data && response.data.length > 0) {
          setSelectedMonth(response.data[currentMonth].namaBulan);
        }

        // Set default year to current year
        setSelectedYear(currentYear.toString());
      } catch (error) {
        console.error("Error fetching bulan data:", error);
      }
    };

    fetchBulan();
  }, []);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  const handleCabangChange = (e) => {
    setSelectedCabang(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

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
              <h1 className="text-base">Kurang Setor Cabang</h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Kurang Setor Cabang</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="container mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
                KURANG SETOR CABANG
              </h2>

              <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
                    <div className="flex flex-col relative" ref={dropdownRef}>
                      <Label className="block text-white text-sm font-semibold mb-2" htmlFor="cabang">
                        Cabang
                      </Label>
                      <input
                        type="text"
                        placeholder="Cabang yang dipilih"
                        className="shadow border rounded py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedCabang || ""}
                        readOnly
                        onFocus={() => setIsDropdownVisible(true)}
                      />

                      {isDropdownVisible && (
                        <div className="absolute top-full left-0 w-full z-10 mt-1 border bg-white shadow-lg rounded-b">
                          <ul className="max-h-48 overflow-y-auto">
                            <li className="py-2 px-4">
                              <input
                                type="text"
                                placeholder="Cari Cabang..."
                                className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formValues.searchCabang || ""}
                                autoFocus
                                onChange={(e) => {
                                  const searchValue = e.target.value;
                                  setFormValues((prevValues) => ({
                                    ...prevValues,
                                    searchCabang: searchValue,
                                  }));
                                }}
                              />
                            </li>

                            <li className="py-2 px-4 hover:bg-blue-500 hover:text-white">
                              <button
                                onClick={() => {
                                  setSelectedCabang("");
                                  setFormValues((prevValues) => ({
                                    ...prevValues,
                                    searchCabang: "",
                                  }));
                                  setIsDropdownVisible(false);
                                }}
                              >
                                Pilih Cabang
                              </button>
                            </li>

                            {cabangList
                              .filter((cabang) =>
                                cabang.kecamatan
                                  .toLowerCase()
                                  .includes(formValues.searchCabang?.toLowerCase() || "")
                              )
                              .map((cabang) => (
                                <li
                                  key={cabang.id}
                                  className="py-1 px-4 hover:bg-blue-500 hover:text-white"
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedCabang(cabang.kecamatan);
                                      setFormValues((prevValues) => ({
                                        ...prevValues,
                                        searchCabang: "",
                                      }));
                                      setIsDropdownVisible(false);
                                    }}
                                  >
                                    {cabang.kecamatan}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="block text-white text-sm font-semibold mb-2" htmlFor="bulan">
                        Bulan
                      </Label>

                      <select
                        className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                      >
                        {bulanList.map((bulan) => (
                          <option key={bulan.angkaBulan} value={bulan.namaBulan}>
                            {bulan.namaBulan}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="block text-white text-sm font-semibold mb-2" htmlFor="tahun">
                        Tahun
                      </Label>
                      <select
                        className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                        value={selectedYear}
                        onChange={handleYearChange}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center items-center mt-4 sm:mt-3">
                    <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 text-center">
                      Transaksi {selectedMonth} {selectedYear}
                    </h1>
                  </div>
                  <div className="flex flex-wrap justify-center space-x-4 mt-4 sm:mt-3 mr-0 sm:mr-10 w-full sm:w-auto">
                    <select className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white">
                      <option>Tampil Semua</option>
                      <option>Iuran/Sanduka</option>
                      <option>DASPEN</option>
                    </select>
                    <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 sm:mt-0 mt-3 px-4 rounded transition duration-300">
                      Cetak
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;