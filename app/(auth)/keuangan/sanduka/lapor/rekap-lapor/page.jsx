"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaTimes,
  FaExclamationCircle,
} from "react-icons/fa";
import Kwitansi from "@/app/_components/Kwitansi";
import { ClipLoader } from "react-spinners";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const dropdownRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userDetails, setUserDetails] = useState({ id: null, npaPgri: null });
  const [dataLaporDiterima, setDataLaporDiterima] = useState([]);
  const [dataLaporBelum, setDataLaporBelum] = useState([]);
  const [displayedDataLapor, setDisplayedDataLapor] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [cabangList, setCabangList] = useState([]);
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [selectedYear, setSelectedYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("Terima");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [filterText, setFilterText] = useState("");
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [filteredCabangList, setFilteredCabangList] = useState(cabangList);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kwitansi
  const [showPopup, setShowPopup] = useState(false);

  const handleKwitansiClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchDataLapor = async () => {
      setIsLoading(true);
      try {
        let response;
        if (!selectedBulan && !selectedYear && !selectedCabang) {
          response = await GlobalApi.getRekapLaporDiterima();
        } else {
          response = await GlobalApi.getRekapLaporDiterima(
            selectedBulan,
            selectedYear,
            selectedCabang
          );
        }
        setDataLaporDiterima(response || []);
        setDisplayedDataLapor(response || []);
      } catch (error) {
        console.error("Error fetching data lapor diterima:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataLapor();
  }, [selectedBulan, selectedYear, selectedCabang]);

  useEffect(() => {
    const fetchDataBelum = async () => {
      setIsLoading(true);
      try {
        const response = await GlobalApi.getRekapLaporBelom();
        const fetchedDataBelum = response || [];
        setDataLaporBelum(fetchedDataBelum);
      } catch (error) {
        console.error("Error fetching data lapor belum:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataBelum();
  }, []);

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

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data);
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan();
  }, []);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowFilterInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang ? cabang.kecamatan : "");
    setShowFilterInput(false);
    setFilterText("");
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    const filtered = cabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleFocus = () => {
    setShowFilterInput(true);
    setFilteredCabangList(cabangList);
  };

  const handleCabangChange = (e) => {
    setSelectedCabang(e.target.value);
  };

  const handleBulanChange = (e) => {
    setSelectedBulan(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  useEffect(() => {
    if (filterStatus === "Terima") {
      setDisplayedDataLapor(dataLaporDiterima);
    } else if (filterStatus === "Belum") {
      setDisplayedDataLapor(dataLaporBelum);
    } else {
      setDisplayedDataLapor([]);
    }
  }, [filterStatus, dataLaporDiterima, dataLaporBelum]);

  const handlePrint = () => {
    const tableContent = document.getElementById("table-to-print").innerHTML;

    const title = `<h2 class="text-center text-xl font-bold mb-4">Rekap Lapor Meninggal</h2>`;

    const updatedTable = tableContent.replace(
      /<th class="py-3 px-4 text-center border-b">Action<\/th>(.*?)<\/tr>/,
      ""
    );
    const tableWithoutActionColumn = updatedTable.replace(
      /<td class="py-3 px-4 space-x-2 text-center">(.*?)<\/td>/g,
      ""
    );

    const tableWithBlackHeader = tableWithoutActionColumn.replace(
      /<th /g,
      `<th style="color: black;" `
    );

    const printContent = title + tableWithBlackHeader;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
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
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="p-4 mt-5">
              <h1 className="text-teal-700 font-bold text-xl mb-4">
                REKAP LAPOR SANDUKA
              </h1>

              <div className="flex flex-wrap sm:flex-nowrap sm:space-x-4 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="cabang"
                  >
                    Pilih Cabang
                  </label>
                  <Input
                    className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    placeholder="Pilih Cabang"
                    value={selectedCabang}
                    readOnly
                    onFocus={handleFocus}
                  />
                  {showFilterInput && (
                    <div className="absolute bg-white border rounded w-full mt-1 z-10 shadow-lg">
                      <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-2">
                          <Input
                            className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            type="text"
                            placeholder="Cari Cabang..."
                            value={filterText}
                            onChange={handleFilterChange}
                            autoFocus
                          />
                        </li>

                        <li
                          className="p-2 px-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                          onClick={() => handleCabangSelect(null)}
                        >
                          Pilih Cabang
                        </li>

                        {filteredCabangList.map((cabang) => (
                          <li
                            key={cabang.id}
                            className="p-2 px-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleCabangSelect(cabang)}
                          >
                            {cabang.kecamatan}
                          </li>
                        ))}

                        {filteredCabangList.length === 0 && (
                          <div className="p-2 text-gray-500 text-center">
                            Cabang tidak ditemukan
                          </div>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-64">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="bulan"
                  >
                    Pilih Bulan
                  </label>
                  <select
                    className="bg-white p-2 rounded border w-full"
                    id="bulan"
                    name="bulan"
                    value={selectedBulan}
                    onChange={handleBulanChange}
                  >
                    <option value="">-- Bulan --</option>
                    {bulanList.map((bulan) => (
                      <option key={bulan.angkaBulan} value={bulan.angkaBulan}>
                        {bulan.namaBulan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-64">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="tahun"
                  >
                    Pilih Tahun
                  </label>
                  <select
                    className="bg-white p-2 rounded border w-full"
                    id="tahun"
                    name="tahun"
                    value={selectedYear}
                    onChange={handleYearChange}
                  >
                    <option value="">-- Tahun --</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-64">
                  <label
                    className="block text-gray-700 text-sm font-semibold mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    className="bg-white p-2 rounded border w-full"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Terima">Terima</option>
                    <option value="Belum">Belum</option>
                  </select>
                </div>

                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                  <Button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full sm:w-auto"
                    onClick={handlePrint}
                  >
                    Cetak
                  </Button>
                </div>
              </div>
            </div>

            {showPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-11/12 h-4/5 overflow-y-scroll relative">
                  <Kwitansi />
                  <div className="absolute top-1 right-1">
                    <button
                      onClick={handleClosePopup}
                      className="absolute right-2 p-2 bg-white rounded-full"
                    >
                      <FaTimes className="h-6 w-6 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              id="table-to-print"
              className="overflow-x-auto shadow-lg rounded-lg"
            >
              <table className="min-w-full bg-white text-sm border-collapse">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="py-3 px-4 text-center border-b">No</th>
                    <th className="py-3 px-4 text-center border-b">
                      Date lapor
                    </th>
                    <th className="py-3 px-4 text-center border-b">
                      Data Meninggal
                    </th>
                    <th className="py-3 px-4 text-center border-b">Cabang</th>
                    <th className="py-3 px-4 text-center border-b">
                      Keterangan
                    </th>
                    <th className="py-3 px-4 text-center border-b">
                      Diterimakan
                    </th>
                    <th className="py-3 px-4 text-center border-b">Nominal</th>
                    <th className="py-3 px-4 text-center border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-16">
                        <div className="flex justify-center items-center">
                          <ClipLoader color="#3498db" size={50} />
                          <span className="ml-4 text-gray-600">
                            Memuat data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : Array.isArray(displayedDataLapor) &&
                    displayedDataLapor.length > 0 ? (
                    displayedDataLapor.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t text-sm hover:bg-teal-100 transition-colors"
                      >
                        <td className="py-3 px-4 text-center">{index + 1}</td>
                        <td className="py-3 px-4">
                          {item.Date_lapor || "N/A"}
                        </td>
                        <td className="py-3 px-4">{item.Data_Meninggal}</td>
                        <td className="py-3 px-4 text-center">{item.Cabang}</td>
                        <td className="py-3 px-4 text-center">
                          {item.Keterangan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {filterStatus === "Terima"
                            ? `Diterimakan (${item.Nama_Penerima})`
                            : "Belum Diterimakan"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {filterStatus === "Terima"
                            ? new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(item.Nominal)
                            : "-"}
                        </td>
                        <td className="py-3 px-4 space-x-2 text-center">
                          <button
                            className="bg-blue-500 text-white p-2 rounded mb-2 hover:bg-blue-600 transition-colors"
                            onClick={handleKwitansiClick}
                          >
                            Kwitansi
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-2">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
