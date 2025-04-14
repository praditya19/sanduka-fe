"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

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

function KalenderForm() {
  const dropdownRef = useRef(null);
  const [provinsi, setProvinsi] = useState(0);
  const [kabupaten, setKabupaten] = useState(0);
  const [cabang, setCabang] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0);
  const [totalHargaAkhir, setTotalHargaAkhir] = useState(0);
  const [jumlahPesanan, setJumlahPesanan] = useState(0);
  const [setorProvinsi, setSetorProvinsi] = useState(0);
  const [untukKabupaten, setUntukKabupaten] = useState(0);
  const [untukCabang, setUntukCabang] = useState(0);
  const [selectedBulan, setSelectedBulan] = useState("");
  const [jenisCabang, setJenisCabang] = useState("");
  const [tableData, setTableData] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [cabangList, setCabangList] = useState([]);
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [newCabangList, setNewCabangList] = useState([]);
  const [selectedBulanBaru, setSelectedBulanBaru] = useState("");
  const [newSelectedYear, setNewSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [bulanList, setBulanList] = useState([]);
  const tableRef = useRef();
  const [notification, setNotification] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTableData, setFilteredTableData] = useState(tableData);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [chosenCabang, setChosenCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setShowDropdown(false);
    // bisa tambahkan aksi spesifik jika item tertentu dipilih
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedBulanBaru && newSelectedYear) {
          const data = await GlobalApi.getTableKalender(
            selectedBulanBaru,
            newSelectedYear,
            newCabangList
          );
          setTableData(data);
          setFilteredTableData(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedBulanBaru, newSelectedYear, newCabangList]);

  useEffect(() => {
    if (!selectedBulanBaru || !newSelectedYear) {
      setTableData([]);
    }
  }, [selectedBulanBaru, newSelectedYear]);

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const getCurrentMonthAndYear = () => {
    const now = new Date();
    const month = now.toLocaleString("id-ID", { month: "long" });
    const year = now.getFullYear();

    return { month, year };
  };

  useEffect(() => {
    const { month, year } = getCurrentMonthAndYear();
    setSelectedBulan(month);
    setSelectedYear(year);
  }, []);

  useEffect(() => {
    const fetchBulan = async () => {
      try {
        const response = await GlobalApi.getBulan();
        setBulanList(response.data || []);
      } catch (error) {
        console.error("Error fetching bulan:", error);
      }
    };

    fetchBulan();
  }, []);

  useEffect(() => {
    if (bulanList.length > 0) {
      const currentMonthIndex = new Date().getMonth();
      const currentMonth = bulanList[currentMonthIndex]?.namaBulan || "";
      setSelectedBulanBaru(currentMonth);
    }
  }, [bulanList]);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangList(response.data);
        setCabangOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    fetchCabangData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const filteredCabangList = cabangList.filter((cabang) =>
    cabang.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang);
    setIsDropdownOpen(false);
  };

  const handleSearchInputChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filteredOptions = cabangOptions.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(searchValue)
    );
    setFilteredCabangOptions(filteredOptions);
  };

  const handleCabangSelection = (cabang) => {
    setChosenCabang(cabang.kecamatan || "Pilih Cabang");
    setDropdownVisible(false);

    if (cabang.kecamatan) {
      const filteredData = tableData.filter(
        (row) => row.cabang === cabang.kecamatan
      );
      setFilteredTableData(filteredData);
    } else {
      setFilteredTableData(tableData);
    }
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest(".relative")) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [dropdownVisible]);

  useEffect(() => {
    const storedData = sessionStorage.getItem("kalenderData");

    if (storedData) {
      const data = JSON.parse(storedData);
      const firstItem = data;

      if (firstItem) {
        setProvinsi(firstItem.propinsi);
        setKabupaten(firstItem.kabupaten);
        setCabang(firstItem.cabang);
      }
    }
  }, []);

  const handleProvinsiChange = (e) => {
    setProvinsi(e.target.value);
  };

  const handleKabupatenChange = (e) => {
    setKabupaten(e.target.value);
  };

  const handleCabangChange = (e) => {
    setCabang(e.target.value);
  };

  const handleJumlahPesananChange = (e) => {
    setJumlahPesanan(e.target.value);
  };

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleJenisCabangChange = (e) => {
    setJenisCabang(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      pb: "",
      propinsi: provinsi,
      kabupaten: kabupaten,
      cabang: cabang,
      sanduka: "",
      iuran: "KALENDER",
    };

    const payload2 = {
      cabang: selectedCabang,
      jumlah: jumlahPesanan,
      bulan: selectedBulan,
      tahun: selectedYear,
      perolehanKabupaten: untukKabupaten,
      perolehanCabang: untukCabang,
    };

    try {
      const id = 1;
      const result1 = await GlobalApi.updateIuranData(id, payload);
      const result2 = await GlobalApi.createTargetKalender(payload2);

      setFilteredTableData((prevTableData) => [
        ...prevTableData,
        {
          id: result2.id,
          cabang: selectedCabang,
          jumlah: jumlahPesanan,
          bulan: selectedBulan,
          tahun: selectedYear,
          total: calculateTotal(
            jumlahPesanan,
            untukCabang,
            untukKabupaten,
            provinsi
          ),
        },
      ]);
      setNotification({
        type: "success",
        message: `Data Berhasil disimpan!`,
      });
    } catch (error) {
      console.error("Error saat menyimpan data: ", error);
      setNotification({
        type: "success",
        message: `Gagal Menyimpan Data!`,
      });
    }
  };

  const handleUpdate = (id) => {
    const selectedItem = filteredTableData.find((item) => item.id === id);
    if (selectedItem) {
      setSelectedCabang(selectedItem.cabang);
      setJumlahPesanan(selectedItem.jumlah);
      setBulan(selectedItem.bulan); // Ambil bulan dari data API
      setTahun(selectedItem.tahun); // Ambil tahun dari data API
      setSelectedItemId(id);
      setIsEditMode(true); // Aktifkan mode edit
    }
  };

  const handleSaveUpdate = async () => {
    if (!selectedItemId) return;

    const updatedData = {
      cabang: selectedCabang,
      jumlah: jumlahPesanan,
      bulan,
      tahun,
    };

    try {
      await GlobalApi.updateKalender(selectedItemId, updatedData);

      setTableData((prevData) =>
        prevData.map((item) =>
          item.id === selectedItemId ? { ...item, ...updatedData } : item
        )
      );

      setFilteredTableData((prevData) =>
        prevData.map((item) =>
          item.id === selectedItemId ? { ...item, ...updatedData } : item
        )
      );

      setIsEditMode(false);
      setSelectedItemId(null);
    } catch (error) {
      alert("Gagal memperbarui data.");
    }
  };

  const handleDelete = async (id) => {
    console.log("Hapus item dengan ID:", id);
    try {
      await GlobalApi.deleteKalender(id);
      setTableData((prevData) => prevData.filter((item) => item.id !== id));
      setFilteredTableData((prevData) =>
        prevData.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Gagal menghapus data!");
    }
  };

  const kalenderData = JSON.parse(sessionStorage.getItem("kalenderData"));

  const firstItem = kalenderData
    ? kalenderData
    : { cabang: 0, kabupaten: 0, propinsi: 0 };

  const calculateTotal = (jumlah, cabang, kabupaten, propinsi) => {
    const cabangMultiplier = cabang || 0;
    const kabupatenMultiplier = kabupaten || 0;
    const propinsiMultiplier = propinsi || 0;

    const resultCabang = jumlah * cabangMultiplier;
    const resultKabupaten = jumlah * kabupatenMultiplier;
    const resultProvinsi = jumlah * propinsiMultiplier;

    return resultCabang + resultKabupaten + resultProvinsi;
  };

  const calculateTotalHarga = () => {
    const hargaProvinsi = parseInt(provinsi) || 0;
    const hargaKabupaten = parseInt(kabupaten) || 0;
    const hargaCabang = parseInt(cabang) || 0;
    const jumlahPesananInt = parseInt(jumlahPesanan) || 1;

    const setorProvinsiTotal = hargaProvinsi * jumlahPesananInt;
    const untukKabupatenTotal = hargaKabupaten * jumlahPesananInt;
    const untukCabangTotal = hargaCabang * jumlahPesananInt;

    const total = hargaProvinsi + hargaKabupaten + hargaCabang;
    setTotalHarga(total);

    const totalAkhir =
      setorProvinsiTotal + untukKabupatenTotal + untukCabangTotal;
    setTotalHargaAkhir(totalAkhir);

    setSetorProvinsi(setorProvinsiTotal);
    setUntukKabupaten(untukKabupatenTotal);
    setUntukCabang(untukCabangTotal);
  };

  const resetForm = () => {
    const storedData = sessionStorage.getItem("kalenderData");

    if (storedData) {
      const data = JSON.parse(storedData);
      const firstItem = data;

      if (firstItem) {
        setProvinsi(firstItem.propinsi || 0);
        setKabupaten(firstItem.kabupaten || 0);
        setCabang(firstItem.cabang || 0);
        setTotalHarga(firstItem.totalHarga || 0);
      }
    } else {
      setProvinsi(0);
      setKabupaten(0);
      setCabang(0);
      setTotalHarga(0);
    }

    setJumlahPesanan(0);
    setSetorProvinsi(0);
    setUntukKabupaten(0);
    setUntukCabang(0);
    setTotalHargaAkhir(0);
    setJenisCabang("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      calculateTotalHarga();
      e.preventDefault();
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
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
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
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
              <h1 className="text-base">Kalender</h1>
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
              <h1 className="text-base">Lain-Lain</h1>
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
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
          <div className="min-h-screen bg-gray-50 p-2 md:p-4 mt-6">
            <div className="p-6 rounded-lg shadow-lg border border-gray-200 bg-white">
              <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded mb-5 text-center">
                Lain - Lain
              </h2>

              {/* Tombol Plus */}
              <div className="flex justify-center">
                <button
                  className="text-white bg-teal-700 hover:bg-teal-800 font-bold text-4xl w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition duration-300 ease-in-out"
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  +
                </button>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="mt-4 flex justify-center">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-md w-64">
                    <ul className="divide-y divide-gray-200">
                      {["PGRI", "Sanduka", "KTA"].map((item) => (
                        <li
                          key={item}
                          className="px-4 py-3 hover:bg-teal-100 cursor-pointer text-center"
                          onClick={() => handleSelect(item)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="space-y-6 mt-6">
                <div className="flex justify-center space-x-4">
                  <Button
                    className="bg-green-700 hover:bg-green-900 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out"
                    onClick={calculateTotalHarga}
                  >
                    Hitung
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out"
                    onClick={isEditMode ? handleSaveUpdate : handleSubmit}
                  >
                    {isEditMode ? "Update" : "Simpan"}
                  </Button>
                  <Button
                    className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-150 ease-in-out"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-teal-800 p-2 rounded-lg shadow-lg mt-5">
              <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
                <div className="flex flex-wrap gap-4 mb-4 sm:mb-0 px-5 mt-5">
                  <div className="relative flex flex-col md:flex ml-2">
                    <Input
                      type="text"
                      placeholder="Pilih Cabang"
                      value={chosenCabang || "Pilih Cabang"}
                      readOnly
                      onFocus={() => {
                        setDropdownVisible(true);
                        setSearchTerm("");
                        setFilteredCabangOptions(cabangOptions);
                      }}
                      className="border rounded-lg p-2 px-4 w-52 bg-white shadow-sm cursor-pointer"
                    />

                    {dropdownVisible && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              value={searchTerm}
                              onChange={handleSearchInputChange}
                              className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Cari Cabang..."
                              autoFocus
                            />
                          </li>
                          <li
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCabangSelection({ kecamatan: "", id: "" })
                            }
                          >
                            Pilih Cabang
                          </li>
                          {filteredCabangOptions.length > 0 ? (
                            filteredCabangOptions.map((cabang) => (
                              <li
                                key={cabang.id}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCabangSelection(cabang)}
                              >
                                {cabang.kecamatan}
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
                  <select
                    className="shadow appearance-none border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="bulanTableBaru"
                    value={selectedBulanBaru}
                    onChange={(e) => setSelectedBulanBaru(e.target.value)}
                  >
                    <option value="">Pilih Bulan</option>
                    {bulanList.map((bulan) => (
                      <option key={bulan.id} value={bulan.namaBulan}>
                        {bulan.namaBulan}
                      </option>
                    ))}
                  </select>
                  <select
                    className="shadow-lg border rounded w-full sm:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    id="tahunTable"
                    value={newSelectedYear}
                    onChange={(e) => setNewSelectedYear(e.target.value)}
                  >
                    <option value="">Pilih Tahun</option>

                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0 mt-4">
                  Transaksi {selectedBulanBaru} {newSelectedYear}
                </h1>
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out mt-3 mr-6 w-24"
                  onClick={printTable}
                >
                  Cetak
                </Button>
              </div>
            </div>

            <div ref={tableRef} className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center">
                      No
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Cabang Khusus
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Pesanan
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableData.length > 0 ? (
                    filteredTableData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border px-2 py-2 text-sm text-black"
                      >
                        <td className="px-6 py-4 border text-sm text-gray-800 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 border text-sm text-gray-800">
                          {item.cabang}
                        </td>
                        <td className="border px-6 py-4 text-center text-sm text-black">
                          {item.jumlah}
                        </td>
                        <td className="px-6 py-4 text-center border text-sm text-gray-800">
                          {formatRupiah(
                            calculateTotal(
                              item.jumlah,
                              parseInt(firstItem.cabang),
                              parseInt(firstItem.kabupaten),
                              parseInt(firstItem.propinsi)
                            )
                          )}
                        </td>
                        <td className="border px-6 py-4 text-center text-sm text-black">
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
                            onClick={() => handleUpdate(item.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                            onClick={() => handleDelete(item.id)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="border px-6 py-4 text-center text-sm text-black"></td>
                      <td className="border px-6 py-4 text-sm text-black">
                        Jumlah
                      </td>
                      <td className="border px-6 py-4 text-sm text-black">0</td>
                      <td className="border px-6 py-4 text-sm text-black">0</td>
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
}

export default KalenderForm;
