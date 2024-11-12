"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";

const Page = () => {
  const dropdownRef = useRef(null);
  const tableRef = useRef();
  const [bulanList, setBulanList] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dataRealisasi, setDataRealisasi] = useState([]);
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [originalData, setOriginalData] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    searchCabang: "",
  });

  const router = useRouter();

  const fetchData = async (bulan, tahun) => {
    if (bulan && tahun) {
      try {
        const monthMap = {
          Januari: "01",
          Februari: "02",
          Maret: "03",
          April: "04",
          Mei: "05",
          Juni: "06",
          Juli: "07",
          Agustus: "08",
          September: "09",
          Oktober: "10",
          November: "11",
          Desember: "12",
        };

        const bulanAngka = monthMap[bulan];
        const bulanuangmasuk = `${bulanAngka}/${tahun}`;

        const data = await GlobalApi.getTableTargetRealisasi(
          tahun,
          bulanAngka,
          "",
          bulanuangmasuk
        );

        setDataRealisasi(data);
        setOriginalData(data);
      } catch (error) {
        console.error("Error fetching data realisasi:", error);
      }
    }
  };

  useEffect(() => {
    if (selectedBulan && selectedYear) {
      fetchData(selectedBulan, selectedYear);
    }
  }, [selectedBulan, selectedYear]);

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
        console.error("Error fetching bulan data:", error);
      }
    };

    fetchBulan();
  }, []);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    if (selectedCabang) {
      const filteredData = originalData.filter(
        (item) => item.cabang === selectedCabang
      );
      setDataRealisasi(filteredData);
    } else {
      setDataRealisasi(originalData);
    }
  }, [selectedCabang]);

  const handleCabangChange = (e) => {
    const selectedCabang = e.target.value;
    setSelectedCabang(selectedCabang);
  };

  const handleBulanChange = (e) => {
    const selectedBulan = e.target.value;
    setSelectedBulan(selectedBulan);
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYear(selectedYear);
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
              <h1 className="text-base">Target dan Realisasi</h1>
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
              <h1 className="text-base">Target dan Realisasi</h1>
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
          <div className="container mx-auto p-6">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                  <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5 w-full sm:w-auto">
                    <div className="flex flex-col relative" ref={dropdownRef}>
                      <Label
                        className="block text-gray-700 text-sm font-semibold mb-2"
                        htmlFor="cabang"
                      >
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

                            <li className="py-2 px-4 hover:bg-blue-500 hover:text-white">
                              <button
                                onClick={() => {
                                  setSelectedCabang("All");
                                  setFormValues((prevValues) => ({
                                    ...prevValues,
                                    searchCabang: "All",
                                  }));
                                  setIsDropdownVisible(false);
                                }}
                              >
                                Semua Cabang
                              </button>
                            </li>

                            {cabangList
                              .filter((cabang) =>
                                cabang.kecamatan
                                  .toLowerCase()
                                  .includes(
                                    formValues.searchCabang?.toLowerCase() || ""
                                  )
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
                      <Label
                        className="block text-gray-700 text-sm font-semibold mb-2"
                        htmlFor="bulan"
                      >
                        Bulan
                      </Label>
                      <select
                        className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 mt-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                        value={selectedBulan}
                        onChange={handleBulanChange}
                      >
                        <option value="">-- Bulan --</option>
                        {bulanList.map((bulan) => (
                          <option
                            key={bulan.angkaBulan}
                            value={bulan.namaBulan}
                          >
                            {bulan.namaBulan}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label
                        className="block text-gray-700 text-sm font-semibold mb-2"
                        htmlFor="tahun"
                      >
                        Tahun
                      </Label>
                      <select
                        className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 mt-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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
                  </div>
                  <div className="flex-1 flex justify-center">
                    <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                      Transaksi {selectedBulan} {selectedYear}
                    </h1>
                  </div>
                  <div className="flex justify-center space-x-4 mt-0 sm:mt-3 mr-0 sm:mr-10">
                    <Button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                      onClick={printTable}
                    >
                      Cetak
                    </Button>
                  </div>
                </div>
              </div>

              <div ref={tableRef} className="overflow-x-auto">
                <table className="min-w-full text-sm text-center text-gray-500 dark:text-gray-400">
                  <thead className="text-sm text-black uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        Cabang/Khusus
                      </th>
                      <th
                        scope="col"
                        colSpan={2}
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                      >
                        Sanduka
                      </th>
                      <th
                        scope="col"
                        colSpan={2}
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                      >
                        Realisasi
                      </th>
                      <th
                        scope="col"
                        colSpan={2}
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-center"
                      >
                        Selisih
                      </th>
                    </tr>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      ></th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      ></th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        Anggota
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        Nominal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        Anggota
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        Nominal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                      >
                        Nominal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataRealisasi.length > 0 ? (
                      dataRealisasi.map((row, index) => (
                        <tr
                          key={index}
                          className="border-b text-black text-center"
                        >
                          <td className="px-6 py-4 text-sm">{index + 1}</td>
                          <td className="px-6 py-4 text-sm">{row.cabang}</td>
                          <td className="px-6 py-4 text-sm">
                            {row.jumlahAnggota}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {formatRupiah(row.target)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {row.jumlahAnggotaByAdmin}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {formatRupiah(row.realisasi)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {formatRupiah(row.selisih)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-sm"
                        >
                          Tidak ada data yang ditemukan
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
    </div>
  );
};

export default Page;
