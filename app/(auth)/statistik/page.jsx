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
  faSearch,
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
import { ClipLoader } from "react-spinners";

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
  const [role, setRole] = useState("");
  const [anggotaMasuk, setAnggotaMasuk] = useState(0);
  const [anggotaKeluar, setAnggotaKeluar] = useState(0);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentTableData = tableData.slice(indexOfFirstItem, indexOfLastItem);
  // const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // const getVisiblePages = () => {
  //   const range = 2; // Number of pages to show on each side of current page
  //   let start = Math.max(1, currentPage - range);
  //   let end = Math.min(totalPages, currentPage + range);

  //   const pages = [];
  //   for (let i = start; i <= end; i++) {
  //     pages.push(i);
  //   }
  //   return pages;
  // };

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
      const filteredData = data
        .filter((item) => item.cabang !== "KABUPATEN")
        .map((item) => ({
          ...item,
          dataSekarang:
            (item.dataLalu || 0) +
            (item.baru || 0) -
            (item.pensiun || 0) -
            (item.meninggal || 0) -
            (item.keluarAnggota || 0) +
            (item.pindahCabangMasuk || 0) -
            (item.pindahCabangKeluar || 0),
        }));

      setTableData(filteredData);

      const totalMasuk = filteredData.reduce(
        (sum, item) => sum + (item.baru || 0),
        0
      );
      const totalKeluar = filteredData.reduce(
        (sum, item) =>
          sum +
          (item.pensiun || 0) +
          (item.meninggal || 0) +
          (item.keluarAnggota || 0),
        0
      );
      const totalSekarang = filteredData.reduce(
        (sum, item) => sum + (item.dataSekarang || 0),
        0
      );

      setAnggotaMasuk(totalMasuk);
      setAnggotaKeluar(totalKeluar);
      setTotalAnggota(totalSekarang);
    } else {
      console.error("API response is not an array:", data);
      setTableData([]);
      setAnggotaMasuk(0);
      setAnggotaKeluar(0);
      setTotalAnggota(0);
    }
  } catch (error) {
    console.error("Error fetching calculate-sanduka data:", error);
    setTableData([]);
    setAnggotaMasuk(0);
    setAnggotaKeluar(0);
    setTotalAnggota(0);
  }
};

  useEffect(() => {
    fetchCalculateSanduka();
  }, [selectedBulan, selectedTahun, selectedCabang]);

  useEffect(() => {}, [tableData]);

  const handleCabangClick = () => {
    if (role !== "ADMIN") {
      setShowDropdown(!showDropdown);
    }
    setSearchTerm("");
    setFilteredOptions(cabangOptions);
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

    let totalDataLalu = 0,
      totalBaru = 0,
      totalPensiun = 0,
      totalMeninggal = 0,
      totalKeluarAnggota = 0,
      totalMasuk = 0,
      totalKeluar = 0,
      totalDataSekarang = 0;

    tableData.forEach((item, index) => {
      totalDataLalu += item.dataLalu;
      totalBaru += item.baru;
      totalPensiun += item.pensiun;
      totalMeninggal += item.meninggal;
      totalKeluarAnggota += item.keluarAnggota;
      totalMasuk += item.pindahCabangMasuk;
      totalKeluar += item.pindahCabangKeluar;
      totalDataSekarang += item.dataSekarang;

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

    // Menambahkan baris total
    printWindow.document.write(
      "<tr style='font-weight: bold; background-color: #f8f8f8;'>"
    );
    printWindow.document.write("<td colspan='2'>Total</td>");
    printWindow.document.write(`<td>${totalDataLalu}</td>`);
    printWindow.document.write(`<td>${totalBaru}</td>`);
    printWindow.document.write(`<td>${totalPensiun}</td>`);
    printWindow.document.write(`<td>${totalMeninggal}</td>`);
    printWindow.document.write(`<td>${totalKeluarAnggota}</td>`);
    printWindow.document.write(`<td>${totalMasuk}</td>`);
    printWindow.document.write(`<td>${totalKeluar}</td>`);
    printWindow.document.write(`<td>${totalDataSekarang}</td>`);
    printWindow.document.write("</tr>");

    printWindow.document.write("</tbody>");
    printWindow.document.write("</table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    // Redirect jika token tidak ada
    if (!token) {
      router.push("/sign-in");
      return; // Hentikan eksekusi di sini jika token tidak ada
    }

    // Ambil role dan cabang dari sessionStorage
    const storedRole = sessionStorage.getItem("role");
    const storedCabang = sessionStorage.getItem("cabang");

    setRole(storedRole || "");
    if (storedRole === "ADMIN") {
      setSelectedCabang(storedCabang || ""); // Set default cabang jika role ADMIN
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar with transition */}
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          {/* Main content area with smooth transition */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "ml-0 md:ml-64" : "ml-0"
            }`}
          >
            <div className="w-full p-4 bg-white shadow-xl rounded-xl mt-5 border border-gray-100">
              {/* Stats Cards Section */}
              <div className="container px-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  Ringkasan Anggota
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {/* Anggota Masuk Card */}
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-blue-500">
                    <div className="flex p-4 items-center">
                      <div className="flex items-center justify-center bg-blue-100 rounded-full w-14 h-14">
                        <FontAwesomeIcon
                          icon={faUserPlus}
                          className="text-blue-600 w-6 h-6"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-800">
                          {anggotaMasuk}
                        </div>
                        <div className="text-sm text-gray-500">
                          Anggota Masuk
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2">
                      <span className="text-xs text-blue-700">
                        +{anggotaMasuk} bulan ini
                      </span>
                    </div>
                  </div>

                  {/* Anggota Keluar Card */}
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-red-500">
                    <div className="flex p-4 items-center">
                      <div className="flex items-center justify-center bg-red-100 rounded-full w-14 h-14">
                        <FontAwesomeIcon
                          icon={faUserMinus}
                          className="text-red-600 w-6 h-6"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-800">
                          {anggotaKeluar}
                        </div>
                        <div className="text-sm text-gray-500">
                          Anggota Keluar
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 px-4 py-2">
                      <span className="text-xs text-red-700">
                        -{anggotaKeluar} bulan ini
                      </span>
                    </div>
                  </div>

                  {/* Total Anggota Card */}
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-green-500">
                    <div className="flex p-4 items-center">
                      <div className="flex items-center justify-center bg-green-100 rounded-full w-14 h-14">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="text-green-600 w-6 h-6"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-800">
                          {totalAnggota}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total Anggota
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 px-4 py-2">
                      <span className="text-xs text-green-700">
                        Total keseluruhan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filters and Controls Section */}
                <div className="w-full bg-white p-4 rounded-xl shadow-md mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Filter Data
                  </h3>
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Cabang Dropdown */}
                    <div className="relative w-full" ref={dropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cabang
                      </label>
                      <Input
                        type="text"
                        placeholder="Cabang terpilih"
                        value={selectedCabang}
                        readOnly={role === "ADMIN"}
                        className={`p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          role === "ADMIN"
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={handleCabangClick}
                      />
                      {showDropdown && (
                        <div className="absolute z-10 border rounded-lg bg-white shadow-lg w-full mt-1">
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                placeholder="Cari atau ketik Cabang..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            </li>
                            <li
                              className="p-2 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors duration-150"
                              onClick={() => handleOptionClick(null)}
                            >
                              Pilih Cabang
                            </li>
                            {filteredOptions.length > 0 ? (
                              filteredOptions.map((option, index) => (
                                <li
                                  key={index}
                                  className="p-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
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

                    {/* Bulan Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bulan
                      </label>
                      <select
                        onChange={handleBulanChange}
                        value={selectedBulan}
                        className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Array.isArray(bulanOptions) &&
                          bulanOptions.map((bulan) => (
                            <option key={bulan.id} value={bulan.id}>
                              {bulan.namaBulan}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Tahun Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun
                      </label>
                      <select
                        value={selectedTahun}
                        onChange={handleTahunChange}
                        className="p-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Tahun</option>
                        {tahunOptions.map((tahun) => (
                          <option key={tahun} value={tahun}>
                            {tahun}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Print Button */}
                    <div className="flex items-end">
                      <button
                        onClick={handlePrint}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={handlePrint} className="mr-2" />
                        Cetak Laporan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Section with Card style */}
                <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Data Mutasi Anggota
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="table-auto w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th
                            rowSpan="2"
                            className="border border-gray-300 p-2 text-center font-bold bg-teal-700 text-white sticky top-0"
                          >
                            No
                          </th>
                          <th
                            rowSpan="2"
                            className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-700 text-white sticky top-0"
                          >
                            Cabang
                          </th>
                          <th
                            rowSpan="2"
                            className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-700 text-white sticky top-0"
                          >
                            Data Lalu
                          </th>
                          <th
                            colSpan="4"
                            className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-700 text-white sticky top-0"
                          >
                            Mutasi
                          </th>
                          <th
                            colSpan="2"
                            className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-700 text-white sticky top-0"
                          >
                            Pindah Cabang
                          </th>
                          <th
                            rowSpan="2"
                            className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-700 text-white sticky top-0"
                          >
                            Data Sekarang
                          </th>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-600 text-white sticky top-0">
                            Baru
                          </th>
                          <th className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-600 text-white sticky top-0">
                            Pensiun
                          </th>
                          <th className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-600 text-white sticky top-0">
                            Meninggal
                          </th>
                          <th className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-600 text-white sticky top-0">
                            Keluar Anggota
                          </th>
                          <th className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-600 text-white sticky top-0">
                            Masuk
                          </th>
                          <th className="border border-gray-300 p-2 text-xs text-center font-bold bg-teal-600 text-white sticky top-0">
                            Keluar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Array.isArray(tableData) && tableData.length > 0 ? (
                          tableData.map((item, index) => (
                            <tr
                              key={index}
                              className={`hover:bg-gray-50 transition-colors duration-150 ${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }`}
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                {index + 1}
                              </td>
                              <td className="border border-gray-200 p-2 text-xs">
                                {item.cabang}
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                {item.dataLalu}
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  {item.baru}
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                  {item.pensiun}
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                  {item.meninggal}
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                  {item.keluarAnggota}
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  {item.pindahCabangMasuk}
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                  {item.pindahCabangKeluar}
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2 text-xs text-center font-bold">
                                {item.dataSekarang}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="11"
                              className="px-6 py-8 text-center text-gray-500 text-sm bg-gray-50"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faSearch}
                                  className="text-gray-400 text-3xl mb-2"
                                />
                                <p>Tidak ada data tersedia</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Coba ubah filter pencarian
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Baris total dengan highlight */}
                        <tr className="font-bold bg-teal-50">
                          <td
                            className="px-4 py-3 text-center font-bold text-teal-800"
                            colSpan={2}
                          >
                            Total
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.dataLalu,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.baru,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.pensiun,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.meninggal,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.keluarAnggota,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.pindahCabangMasuk,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.pindahCabangKeluar,
                              0
                            )}
                          </td>
                          <td className="border border-gray-200 p-2 text-xs text-center font-bold text-teal-800">
                            {tableData.reduce(
                              (acc, item) => acc + item.dataSekarang,
                              0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="my-6 border-t border-gray-200"></div>

                {/* Seldata component with card style */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                  <Seldata />
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
