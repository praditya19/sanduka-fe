"use client";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  faUserPlus,
  faUserMinus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Seldata from "../statistik/Seldata/page";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [bulanOptions, setBulanOptions] = useState([]);
  const dropdownRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  const [totalAnggota, setTotalAnggota] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleString("default", { month: "long" });
    const currentYear = today.getFullYear();

    setSelectedBulan(currentMonth);
    setSelectedTahun(currentYear);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const bulanResponse = await GlobalApi.getBulan();
        if (bulanResponse?.data) {
          setBulanOptions(bulanResponse.data);

          const currentMonthIndex = new Date().getMonth();
          const currentMonth = bulanResponse.data[currentMonthIndex]?.id;

          if (currentMonth) {
            setSelectedBulan(currentMonth);
          }
        } else {
          console.error("Unexpected data format", bulanResponse);
        }

        const tahunArray = Array.from(
          { length: 11 },
          (_, index) => 2020 + index
        );
        setTahunOptions(tahunArray);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangOptions(response.data);
        setFilteredOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GlobalApi.getTotalAnggota();
        setTotalAnggota(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCalculateSanduka = async () => {
    try {
      const data = await GlobalApi.getCalculateSanduka(
        selectedBulan,
        selectedTahun,
        selectedCabang || null
      );
      if (Array.isArray(data)) {
        setTableData(data);
      } else {
        console.error("API response is not an array:", data);
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching calculate-sanduka data:", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchCalculateSanduka();
  }, [selectedBulan, selectedTahun, selectedCabang]);

  useEffect(() => {}, [tableData]);

  const handleCabangClick = () => {
    setSearchTerm("");
    setFilteredOptions(cabangOptions);
    setShowDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    const filtered = cabangOptions.filter((option) =>
      option.kecamatan.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredOptions(filtered);
    setShowDropdown(value.length > 0);

    if (value.trim() === "") {
      setSelectedCabang("");
    }
  };

  const handleOptionClick = (option) => {
    setSelectedCabang(option ? option.kecamatan : "");
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handleBulanChange = (event) => {
    setSelectedBulan(event.target.value);
  };

  const handleTahunChange = (event) => {
    setSelectedTahun(event.target.value);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Data Statistik</title>");
    printWindow.document.write(
      "<style>@media print { .no-print { display: none; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(
      '<button class="no-print" onclick="window.print()">Print</button>'
    );
    printWindow.document.write(
      '<table class="table-auto w-full border-collapse border border-gray-300 text-sm">'
    );
    printWindow.document.write('<thead class="bg-gray-100">');
    printWindow.document.write(
      "<tr><th>No</th><th>Cabang</th><th>Data Lalu</th><th>Mutasi Baru</th><th>Pensiun</th><th>Meninggal</th><th>Keluar Anggota</th><th>Masuk</th><th>Keluar</th><th>Data Sekarang</th></tr>"
    );
    printWindow.document.write("</thead>");
    printWindow.document.write('<tbody class="divide-y divide-gray-200">');

    tableData.forEach((item, index) => {
      printWindow.document.write("<tr>");
      printWindow.document.write(`<td>${index + 1}</td>`);
      printWindow.document.write(`<td>${item.cabang}</td>`);
      printWindow.document.write(`<td>${item.dataLalu}</td>`);
      printWindow.document.write(`<td>${item.baru}</td>`);
      printWindow.document.write(`<td>${item.pensiun}</td>`);
      printWindow.document.write(`<td>${item.meninggal}</td>`);
      printWindow.document.write(`<td>${item.keluarAnggota}</td>`);
      printWindow.document.write(`<td>${item.pindahCabangMasuk}</td>`);
      printWindow.document.write(`<td>${item.pindahCabangKeluar}</td>`);
      printWindow.document.write(`<td>${item.dataSekarang}</td>`);
      printWindow.document.write("</tr>");
    });

    printWindow.document.write("</tbody>");
    printWindow.document.write("</table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

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
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="w-full p-4 container shadow-lg rounded-lg mt-5">
            <div className="rounded-md flex flex-col py-4">
              <div className="container px-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center bg-white shadow-md rounded-lg p-2 sm:p-4">
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full w-8 h-8 sm:w-12 sm:h-12 mt-4">
                        <FontAwesomeIcon
                          icon={faUserPlus}
                          className="text-blue-600 w-4 h-4 sm:w-6 sm:h-6"
                        />
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-4">
                      <div className="text-base sm:text-base font-semibold text-gray-800">
                        153
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Anggota Masuk
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-white shadow-md rounded-lg p-2 sm:p-4">
                    <div className="flex items-center justify-center bg-red-100 rounded-full w-8 h-8 sm:w-12 sm:h-12">
                      <FontAwesomeIcon
                        icon={faUserMinus}
                        className="text-red-600 w-4 h-4 sm:w-6 sm:h-6"
                      />
                    </div>
                    <div className="ml-2 sm:ml-4">
                      <div className="text-base sm:text-base font-semibold text-gray-800">
                        2
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Anggota Keluar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-white shadow-md rounded-lg p-2 sm:p-4">
                    <div className="flex items-center justify-center bg-green-100 rounded-full w-8 h-8 sm:w-12 sm:h-12">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-green-600 w-4 h-4 sm:w-6 sm:h-6"
                      />
                    </div>
                    <div className="ml-2 sm:ml-4">
                      <div className="text-base sm:text-base font-semibold text-gray-800">
                      <p>{totalAnggota !== null ? totalAnggota : 'No data available'}</p>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total Anggota
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
                  <div className="w-full grid grid-cols-1 gap-4 md:flex md:space-x-4">
                    <div
                      className="relative w-full md:w-auto"
                      ref={dropdownRef}
                    >
                      <Input
                        type="text"
                        placeholder="Cabang terpilih"
                        value={selectedCabang}
                        readOnly
                        className="p-2 border border-gray-300 rounded-md w-full"
                        onClick={handleCabangClick}
                      />
                      {showDropdown && (
                        <div className="absolute z-10 border rounded-lg bg-white shadow-sm w-full mt-1">
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                placeholder="Cari atau ketik Cabang..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                className="p-2 border-b border-gray-300 w-full"
                                autoFocus
                              />
                            </li>
                            <li
                              className="p-2 hover:bg-blue-100 cursor-pointer text-gray-700"
                              onClick={() => handleOptionClick(null)}
                            >
                              Pilih Cabang
                            </li>
                            {filteredOptions.length > 0 ? (
                              filteredOptions.map((option, index) => (
                                <li
                                  key={index}
                                  className="p-2 hover:bg-blue-100 cursor-pointer"
                                  onClick={() => handleOptionClick(option)}
                                >
                                  {option.kecamatan}
                                </li>
                              ))
                            ) : (
                              <li className="p-2 text-gray-500">
                                Tidak ada hasil
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <select
                      onChange={handleBulanChange}
                      value={selectedBulan}
                      className="p-2 border border-gray-300 rounded-md w-full md:w-40"
                    >
                      {Array.isArray(bulanOptions) &&
                        bulanOptions.map((bulan) => (
                          <option key={bulan.id} value={bulan.id}>
                            {bulan.namaBulan}
                          </option>
                        ))}
                    </select>

                    <select
                      value={selectedTahun}
                      onChange={handleTahunChange}
                      className="p-2 border border-gray-300 rounded-md w-full md:w-40"
                    >
                      <option value="">Pilih Tahun</option>
                      {tahunOptions.map((tahun) => (
                        <option key={tahun} value={tahun}>
                          {tahun}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-auto">
                    <button
                      onClick={handlePrint}
                      className="w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      Cetak
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th
                          rowSpan="2"
                          className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white"
                        >
                          No
                        </th>
                        <th
                          rowSpan="2"
                          className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                        >
                          Cabang
                        </th>
                        <th
                          rowSpan="2"
                          className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                        >
                          Data Lalu
                        </th>
                        <th
                          colSpan="4"
                          className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                        >
                          Mutasi
                        </th>
                        <th
                          colSpan="2"
                          className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                        >
                          Pindah Cabang
                        </th>
                        <th
                          rowSpan="2"
                          className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                        >
                          Data Sekarang
                        </th>
                      </tr>
                      <tr>
                        <th className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                          Baru
                        </th>
                        <th className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                          Pensiun
                        </th>
                        <th className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                          Meninggal
                        </th>
                        <th className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                          Keluar Anggota
                        </th>
                        <th className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                          Masuk
                        </th>
                        <th className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                          Keluar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(tableData) && tableData.length > 0 ? (
                        tableData.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-gray-100" : "bg-white"
                            }
                          >
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                              {index + 1}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs">
                              {item.cabang}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.dataLalu}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.baru}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.pensiun}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.meninggal}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.keluarAnggota}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.pindahCabangMasuk}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.pindahCabangKeluar}
                            </td>
                            <td className="border border-gray-300 p-2 text-xs text-center">
                              {item.dataSekarang}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="11"
                            className="px-6 py-4 text-center text-gray-500 text-sm"
                          >
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div
              style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}
            ></div>
            <Seldata />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
