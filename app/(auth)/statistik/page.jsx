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
  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [data, setData] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [bulanOptions, setBulanOptions] = useState([]);
  const dropdownRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleString("default", { month: "long" }); // e.g., "September"
    const currentYear = today.getFullYear(); // e.g., 2024

    setSelectedBulan(currentMonth);
    setSelectedTahun(currentYear);
  }, []);

  // Effect for fetching options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const bulanResponse = await GlobalApi.getBulan();
        if (bulanResponse?.data) {
          setBulanOptions(bulanResponse.data);

          const currentMonthIndex = new Date().getMonth();
          const currentMonth = bulanResponse.data[currentMonthIndex]?.namaBulan;

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

  const handleCabangClick = () => {
    setSearchTerm("");
    setFilteredOptions(cabangOptions);
    setShowDropdown(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let result;
        const bulan = selectedBulan || null;
        const tahun = selectedTahun || null;

        if (selectedCabang) {
          result = await GlobalApi.getCalculateSanduka(
            bulan,
            tahun,
            selectedCabang
          );
          const dataArray = [
            {
              cabang: selectedCabang,
              ...result,
            },
          ];
          setData(dataArray);
        } else if (searchTerm.trim() === "") {
          result = await GlobalApi.getCalculateSandukaAll(bulan, tahun);

          if (typeof result === "object" && result !== null) {
            const dataArray = Object.entries(result).map(
              ([cabang, values]) => ({
                cabang,
                ...values,
              })
            );
            setData(dataArray);
          } else {
            setData([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedBulan, selectedTahun, selectedCabang, searchTerm]);

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
          <div className="w-full p-4 container shadow-lg rounded-lg mt-12">
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
                        6950
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total Anggota
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex mb-4">
                  <div className="w-full flex space-x-4">
                    <div className="relative" ref={dropdownRef}>
                      <Input
                        type="text"
                        placeholder="Cabang terpilih"
                        value={selectedCabang}
                        readOnly
                        className="p-2 border border-gray-300 rounded-md mb-2 w-64"
                        onClick={handleCabangClick} 
                      />

                      {showDropdown && (
                        <div className="absolute z-10 border rounded-lg bg-white shadow-sm -mt-1 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                        <li className="py-2 px-2">
                          <Input
                            type="text"
                            placeholder="Cari atau ketik Cabang..."
                            value={searchTerm}
                            onChange={handleInputChange}
                            className="p-2 border-b border-gray-300 w-full mt-1"
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

                    {/* Dropdown for Bulan */}
                    <div>
                      <select
                        onChange={handleBulanChange}
                        value={selectedBulan}
                        className="p-2 border border-gray-300 rounded-md mb-2 w-40"
                      >
                        {Array.isArray(bulanOptions) &&
                          bulanOptions.map((bulan) => (
                            <option key={bulan.id} value={bulan.namaBulan}>
                              {bulan.namaBulan}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Dropdown for Tahun */}
                    <div>
                      <select
                        value={selectedTahun}
                        onChange={handleTahunChange}
                        className="p-2 border border-gray-300 rounded-md mb-2 w-40"
                      >
                        <option value="">Pilih Tahun</option>
                        {tahunOptions.map((tahun) => (
                          <option key={tahun} value={tahun}>
                            {tahun}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <Table className="table-auto w-full border-collapse border border-gray-300 text-sm">
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead
                        rowSpan="2"
                        className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        No
                      </TableHead>
                      <TableHead
                        rowSpan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Cabang
                      </TableHead>
                      <TableHead
                        rowSpan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Data Lalu
                      </TableHead>
                      <TableHead
                        colSpan="5"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Mutasi
                      </TableHead>
                      <TableHead
                        colSpan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Pindah Cabang
                      </TableHead>
                      <TableHead
                        rowSpan="2"
                        className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                      >
                        Data Sekarang
                      </TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        Baru
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        Aktif
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        Pensiun
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        Meninggal
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        Keluar Anggota
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        masuk
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                        keluar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="border border-gray-300 p-2 text-center text-gray-500"
                        >
                          Tidak ada data. Silakan pilih filter untuk melihat
                          hasil.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (() => {
                        // Inisialisasi variabel untuk menghitung total
                        let totalLalu = 0,
                          totalMurni = 0,
                          totalAktifkan = 0,
                          totalPensiun = 0,
                          totalMeninggal = 0,
                          totalKeluarLainnya = 0,
                          totalMasuk = 0,
                          totalKeluar = 0,
                          totalDataSekarang = 0;

                        return (
                          <>
                            {data.map((item, index) => {
                              // Hitung dataSekarang
                              const dataSekarang =
                                item.jumlahLalu +
                                item.jumlahMurni -
                                item.jumlahPensiun -
                                item.jumlahMeninggal -
                                item.jumlahKeluarLainnya +
                                item.jumlahMasuk -
                                item.jumlahKeluar;

                              // Akumulasi nilai ke variabel total
                              totalLalu += item.jumlahLalu;
                              totalMurni += item.jumlahMurni;
                              totalAktifkan += item.jumlahAktifkan;
                              totalPensiun += item.jumlahPensiun;
                              totalMeninggal += item.jumlahMeninggal;
                              totalKeluarLainnya += item.jumlahKeluarLainnya;
                              totalMasuk += item.jumlahMasuk;
                              totalKeluar += item.jumlahKeluar;
                              totalDataSekarang += dataSekarang;

                              return (
                                <TableRow key={index}>
                                  <TableCell className="text-center border">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs">
                                    {item.cabang || selectedCabang}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahLalu}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahMurni}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahAktifkan}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahPensiun}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahMeninggal}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahKeluarLainnya}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahMasuk}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {item.jumlahKeluar}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                    {dataSekarang}
                                  </TableCell>
                                </TableRow>
                              );
                            })}

                            {/* Baris Total */}
                            <TableRow className="bg-gray-200">
                              <TableCell
                                colSpan="2"
                                className="border border-gray-300 p-2 text-xs font-bold text-center"
                              >
                                Total
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalLalu}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalMurni}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalAktifkan}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalPensiun}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalMeninggal}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalKeluarLainnya}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalMasuk}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalKeluar}
                              </TableCell>
                              <TableCell className="border border-gray-300 p-2 text-xs text-center">
                                {totalDataSekarang}
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })()
                    )}
                  </TableBody>
                </Table>
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
