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
  FaCalendarPlus,
  FaCalendarCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

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
  const [activeTab, setActiveTab] = useState(1);
  const [modalNominal, setModalNominal] = useState(false);

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
              <h1 className="text-base">Kalender</h1>
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
          <div className="p-4 bg-gray-50 rounded-lg shadow-lg">
            <div className="rounded-lg shadow-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200">
                <div className="flex justify-between items-center px-4">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab(1)}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 1
                          ? "border-teal-500 text-teal-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Rincian Kalender
                    </button>
                    <button
                      onClick={() => setActiveTab(2)}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 2
                          ? "border-teal-500 text-teal-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Pembagian Kalender
                    </button>
                  </nav>
                  <button
                    onClick={() => setModalNominal(true)}
                    className="flex items-center gap-2 bg-white text-black font-medium py-2 px-4 rounded-lg shadow-md border border-gray-300 hover:bg-blue-500 hover:text-white transition duration-150 ease-in-out"
                  >
                    <FaGear />
                    Atur Nominal Peruntukan Kalender
                  </button>
                </div>

                {modalNominal && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-teal-800">
                            Nominal Peruntukan Derap
                          </h2>
                          <p>Atur besaran nominal peruntukan untuk Derap.</p>
                        </div>
                        <button
                          onClick={() => setModalNominal(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {[
                          {
                            id: "provinsi",
                            label: "Provinsi",
                            value: provinsi,
                            onChange: handleProvinsiChange,
                          },
                          {
                            id: "kabupaten",
                            label: "Kabupaten",
                            value: kabupaten,
                            onChange: handleKabupatenChange,
                          },
                          {
                            id: "cabang",
                            label: "Cabang/Ranting",
                            value: cabang,
                            onChange: handleCabangChange,
                          },
                          {
                            id: "totalHarga",
                            label: "Total Harga",
                            value: totalHarga,
                            readOnly: true,
                            customClass: "bg-gray-200",
                          },
                        ].map((field) => (
                          <div
                            key={field.id}
                            className="flex flex-col lg:flex-row items-center mb-4"
                          >
                            <Label
                              htmlFor={field.id}
                              className="block text-gray-800 text-lg font-semibold mb-2 lg:mb-0 lg:w-full"
                            >
                              {field.label}
                            </Label>
                            <Input
                              type="number"
                              id={field.id}
                              className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out lg:ml-4 ${
                                field.customClass || ""
                              }`}
                              onKeyPress={handleKeyPress}
                              value={field.value}
                              onChange={field.onChange}
                              readOnly={field.readOnly}
                            />
                          </div>
                        ))}

                        <div className="flex flex-col lg:flex-row items-center mb-4">
                          <Label
                            htmlFor="jumlahPesanan"
                            className="block text-gray-800 text-lg font-semibold mb-2 lg:mb-0 w-full lg:w-auto mr-8"
                          >
                            Jumlah Pesanan
                          </Label>
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
                                      handleCabangSelection({
                                        kecamatan: "",
                                        id: "",
                                      })
                                    }
                                  >
                                    Pilih Cabang
                                  </li>
                                  {filteredCabangOptions.length > 0 ? (
                                    filteredCabangOptions.map((cabang) => (
                                      <li
                                        key={cabang.id}
                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                        onClick={() =>
                                          handleCabangSelection(cabang)
                                        }
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
                          <Input
                            type="number"
                            id="jumlahPesananInput"
                            className="w-full lg:w-1/3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out mt-2 lg:mt-0 lg:ml-4"
                            value={jumlahPesanan}
                            onChange={handleJumlahPesananChange}
                            onKeyPress={handleKeyPress}
                          />
                        </div>

                        <div className="flex justify-center space-x-4 mt-6">
                          <Button
                            className="bg-green-700 hover:bg-green-900 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out"
                            onClick={calculateTotalHarga}
                          >
                            Hitung
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out"
                            onClick={
                              isEditMode ? handleSaveUpdate : handleSubmit
                            }
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
                  </div>
                )}
                {/* <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
                  Besaran Inputan Kalender
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      id: "provinsi",
                      label: "Provinsi",
                      value: provinsi,
                      onChange: handleProvinsiChange,
                    },
                    {
                      id: "kabupaten",
                      label: "Kabupaten",
                      value: kabupaten,
                      onChange: handleKabupatenChange,
                    },
                    {
                      id: "cabang",
                      label: "Cabang/Ranting",
                      value: cabang,
                      onChange: handleCabangChange,
                    },
                    {
                      id: "totalHarga",
                      label: "Total Harga",
                      value: totalHarga,
                      readOnly: true,
                      customClass: "bg-gray-200",
                    },
                  ].map((field) => (
                    <div
                      key={field.id}
                      className="flex flex-col lg:flex-row items-center mb-4"
                    >
                      <Label
                        htmlFor={field.id}
                        className="block text-gray-800 text-lg font-semibold mb-2 lg:mb-0 lg:w-full"
                      >
                        {field.label}
                      </Label>
                      <Input
                        type="number"
                        id={field.id}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out lg:ml-4 ${
                          field.customClass || ""
                        }`}
                        onKeyPress={handleKeyPress}
                        value={field.value}
                        onChange={field.onChange}
                        readOnly={field.readOnly}
                      />
                    </div>
                  ))}

                  <div className="flex flex-col lg:flex-row items-center mb-4">
                    <Label
                      htmlFor="jumlahPesanan"
                      className="block text-gray-800 text-lg font-semibold mb-2 lg:mb-0 w-full lg:w-auto mr-8"
                    >
                      Jumlah Pesanan
                    </Label>
                    <div className="relative " ref={dropdownRef}>
                      <Input
                        type="text"
                        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        readOnly
                        value={selectedCabang || ""}
                        placeholder="Pilih Cabang"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        onFocus={() => {
                          setSearchQuery("");
                        }}
                      />

                      {isDropdownOpen && (
                        <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                className="w-full p-2 border-b text-gray-700 focus:outline-none"
                                placeholder="Cari cabang..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                autoFocus
                              />
                            </li>
                            {filteredCabangList.map((cabang) => (
                              <li
                                key={cabang.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() =>
                                  handleCabangSelect(cabang.kecamatan)
                                }
                              >
                                {cabang.kecamatan}
                              </li>
                            ))}
                            {filteredCabangList.length === 0 && (
                              <li className="p-2 text-gray-500">
                                Cabang tidak ditemukan
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Input
                      type="number"
                      id="jumlahPesananInput"
                      className="w-full lg:w-1/3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out mt-2 lg:mt-0 lg:ml-4"
                      value={jumlahPesanan}
                      onChange={handleJumlahPesananChange}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  <div className="flex justify-center space-x-4 mt-6">
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
                </div> */}
              </div>

              <div className="p-6">
                {activeTab === 1 ? (
                  <>
                    <div className="bg-teal-100 flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FaCalendarPlus className="text-teal-800 text-2xl" />
                        <span className="text-teal-800 text-xl font-medium">
                          Pesanan Kalender
                        </span>
                      </div>
                      <button className="p-3 text-teal-600 hover:bg-teal-500 hover:text-white bg-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3 border border-teal-600 hover:border-teal-500">
                        {" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                          <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                        </svg>
                        Cetak Rekap Pesanan
                      </button>
                    </div>

                    <div className="space-y-6 p-6">
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div ref={dropdownRef} className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cabang
                          </label>
                          <div className="relative">
                            <Input
                              type="text"
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              readOnly
                              value={selectedCabang || ""}
                              placeholder="Pilih Cabang"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              onFocus={() => {
                                setSearchQuery("");
                              }}
                            />

                            {isDropdownOpen && (
                              <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
                                <ul className="max-h-44 overflow-y-auto">
                                  <li className="py-2 px-2">
                                    <Input
                                      type="text"
                                      className="w-full p-2 border-b text-gray-700 focus:outline-none"
                                      placeholder="Cari cabang..."
                                      value={searchQuery}
                                      onChange={handleSearchChange}
                                      autoFocus
                                    />
                                  </li>
                                  {filteredCabangList.map((cabang) => (
                                    <li
                                      key={cabang.id}
                                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                      onClick={() =>
                                        handleCabangSelect(cabang.kecamatan)
                                      }
                                    >
                                      {cabang.kecamatan}
                                    </li>
                                  ))}
                                  {filteredCabangList.length === 0 && (
                                    <li className="p-2 text-gray-500">
                                      Cabang tidak ditemukan
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah (Eksemplar)
                          </label>
                          <Input
                            type="number"
                            id="jumlahPesananInput"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out"
                            value={jumlahPesanan}
                            onChange={(e) => setJumlahPesanan(e.target.value)}
                            onKeyPress={handleKeyPress}
                          />
                        </div>
                      </div>
                      <div className="flex  space-x-4 mt-6">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out gap-3"
                          onClick={isEditMode ? handleSaveUpdate : handleSubmit}
                        >
                          {" "}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                          </svg>
                          {isEditMode ? "Update" : "Simpan Pesanan"}
                        </Button>
                        <Button
                          className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-150 ease-in-out"
                          onClick={resetForm}
                        >
                          Reset
                        </Button>
                        {/* <Button
                                        className="bg-teal-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-teal-600 transition duration-150 ease-in-out"
                                        onClick={handleOtomatisClick}
                                      >
                                        Otomatis
                                      </Button> */}
                      </div>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div ref={tableRef} className="overflow-x-auto">
                        <h1 className="text-2xl font-bold text-teal-800 mb-4 sm:mb-0 mt-4">
                          Rekap Pesanan Kalender - Mei 2025{" "}
                        </h1>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left font-medium text-gray-700">
                                  No
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">
                                  Cabang
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-gray-700">
                                  Jumlah Pesanan
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTableData.length > 0 ? (
                                filteredTableData
                                  .slice(0, 5)
                                  .map((item, index) => (
                                    <tr
                                      key={item.id}
                                      className="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-150"
                                    >
                                      <td className="px-4 py-3">{index + 1}</td>
                                      <td className="px-4 py-3">
                                        {item.cabang}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        {item.jumlah}
                                      </td>
                                    </tr>
                                  ))
                              ) : (
                                <tr className="border-b border-gray-200">
                                  <td className="px-4 py-3"></td>
                                  <td className="px-4 py-3">Jumlah</td>
                                  <td className="px-4 py-3">0</td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot className="border-t border-gray-300 bg-gray-100">
                              <tr>
                                <td
                                  colSpan="2"
                                  className="px-4 py-3 font-semibold text-center"
                                >
                                  Total Pesanan Derap
                                </td>
                                {/* <td className="px-4 py-3 text-right font-semibold">
                                                {totalJumlah}
                                              </td> */}
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <div className="rounded-lg shadow-md border border-gray-200 bg-white mt-8">
                          <div className="bg-teal-100 p-4 rounded-lg shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                              {/* Title on the left */}
                              <div className="flex items-center mb-4 sm:mb-0">
                                <FaCalendarCheck className="text-teal-600 mr-3 text-2xl" />
                                <h1 className="text-2xl font-bold text-teal-800">
                                  Rekapitulasi Derap dan Pembayaran
                                </h1>
                              </div>

                              {/* Print button on the right */}
                              <button
                                className="p-3 mt-3 text-teal-600 hover:bg-teal-500 hover:text-white bg-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3 border border-teal-600 hover:border-teal-500"
                                onClick={printTable}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                                  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                                </svg>
                                Cetak Rekapitulasi
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                              {/* Filter Cabang */}
                              <div className="relative flex-1 min-w-[200px]">
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
                                  className="w-full border rounded-lg p-2 px-4 bg-white shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />

                                {dropdownVisible && (
                                  <div className="absolute z-10 mt-1 w-full border rounded-lg bg-white shadow-lg">
                                    <div className="p-2 border-b">
                                      <Input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchInputChange}
                                        className="w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Cari Cabang..."
                                        autoFocus
                                      />
                                    </div>
                                    <ul className="max-h-60 overflow-y-auto">
                                      <li
                                        className="p-3 cursor-pointer hover:bg-blue-50 text-gray-700"
                                        onClick={() =>
                                          handleCabangSelection({
                                            kecamatan: "",
                                            id: "",
                                          })
                                        }
                                      >
                                        Pilih Cabang
                                      </li>
                                      {filteredCabangOptions.length > 0 ? (
                                        filteredCabangOptions.map((cabang) => (
                                          <li
                                            key={cabang.id}
                                            className="p-3 cursor-pointer hover:bg-blue-50 text-gray-700"
                                            onClick={() =>
                                              handleCabangSelection(cabang)
                                            }
                                          >
                                            {cabang.kecamatan}
                                          </li>
                                        ))
                                      ) : (
                                        <li className="p-3 text-gray-500 cursor-default">
                                          Tidak ada hasil
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Filter Bulan */}
                              <div className="flex-1 min-w-[180px]">
                                <select
                                  className="w-full border rounded-lg py-2.5 px-4 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  id="bulanTableBaru"
                                  value={selectedBulanBaru}
                                  onChange={(e) =>
                                    setSelectedBulanBaru(e.target.value)
                                  }
                                >
                                  <option value="">Pilih Bulan</option>
                                  {bulanList.map((bulan) => (
                                    <option
                                      key={bulan.id}
                                      value={bulan.namaBulan}
                                    >
                                      {bulan.namaBulan}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Filter Tahun */}
                              <div className="flex-1 min-w-[150px]">
                                <select
                                  className="w-full border rounded-lg py-2.5 px-4 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  id="tahunTable"
                                  value={newSelectedYear}
                                  onChange={(e) =>
                                    setNewSelectedYear(e.target.value)
                                  }
                                >
                                  <option value="">Pilih Tahun</option>
                                  {years.map((year) => (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div ref={tableRef} className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                              <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    No
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Cabang
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Pesanan (Eks)
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Total Tagihan (Rp)
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Pemb. Bank (Eks)
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Pemb. Bank (Nominal Rp)
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Pemb. Tunai (Rp)
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Selisih (Rp)
                                  </th>
                                  <th
                                    scope="col"
                                    className="border px-6 py-3 text-center text-sm"
                                  >
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTableData.length > 0 ? (
                                  filteredTableData.map((item, index) => (
                                    <tr
                                      key={item.id}
                                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                      <td className="border px-6 py-4 text-center text-sm text-black">
                                        {index + 1}
                                      </td>
                                      <td className="border px-6 py-4 text-center text-sm text-black">
                                        {item.cabang}
                                      </td>
                                      <td className="border px-6 py-4 text-center text-sm text-black">
                                        {item.jumlah}
                                      </td>
                                      <td className="border px-6 py-4 text-center text-sm text-black">
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
                                        10
                                      </td>
                                      <td className="border px-6 py-4 text-center text-sm text-black">
                                        Rp 100.000
                                      </td>
                                      <td className="border px-6 py-4 text-center text-sm text-black">
                                        Rp 0
                                      </td>
                                      <td className="border px-6 py-4 text-center text-sm text-black">
                                        Rp 0
                                      </td>
                                      <td className="border px-2 py-4 text-center text-sm text-black">
                                        <button
                                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded mr-2"
                                          onClick={() => handleUpdate(item.id)}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                          onClick={() => handleDelete(item.id)}
                                        >
                                          Hapus
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4"></td>
                                    <td className="px-6 py-4">Jumlah</td>
                                    <td className="px-6 py-4">0</td>
                                    <td className="px-6 py-4">0</td>
                                    <td className="px-6 py-4"></td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* {[
                                                          {
                                                            id: "provinsi",
                                                            label: "Derap Provinsi",
                                                            value: provinsi,
                                                            onChange: handleProvinsiChange,
                                                          },
                                                          {
                                                            id: "kabupaten",
                                                            label: "Derap Kabupaten",
                                                            value: kabupaten,
                                                            onChange: handleKabupatenChange,
                                                          },
                                                          {
                                                            id: "cabang",
                                                            label: "Derap Cabang/Ranting",
                                                            value: cabang,
                                                            onChange: handleCabangChange,
                                                          },
                                                          {
                                                            id: "totalHarga",
                                                            label: "Total Harga",
                                                            value: totalHarga,
                                                            readOnly: true,
                                                            customClass: "bg-gray-200",
                                                          },
                                                        ].map((field) => (
                                                          <div
                                                            key={field.id}
                                                            className="flex flex-col lg:flex-row items-center mb-4"
                                                          >
                                                            <Label
                                                              htmlFor={field.id}
                                                              className="block text-gray-800 text-lg font-semibold mb-2 lg:mb-0 lg:w-full"
                                                            >
                                                              {field.label}
                                                            </Label>
                                                            <Input
                                                              type="number"
                                                              id={field.id}
                                                              className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out lg:ml-4 ${
                                                                field.customClass || ""
                                                              }`}
                                                              onKeyPress={handleKeyPress}
                                                              value={field.value}
                                                              onChange={field.onChange}
                                                              readOnly={field.readOnly}
                                                            />
                                                          </div>
                                                        ))}
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Jumlah Pesanan :
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>{jumlahPesanan} eksemplar</b>
                                                        </p>
                                                      </div>
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Setor Provinsi:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {setorProvinsi.toLocaleString()}</b>
                                                        </p>
                                                      </div>
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Untuk Kabupaten:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {untukKabupaten.toLocaleString()}</b>
                                                        </p>
                                                      </div>
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Untuk Cabang:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {untukCabang.toLocaleString()}</b>
                                                        </p>
                                                      </div>
                                                      <div>
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Total:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {totalHargaAkhir.toLocaleString()}</b>
                                                        </p>
                                                      </div> */}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg shadow-md border border-gray-200 bg-white">
                      <div className="bg-teal-100 p-4 rounded-lg shadow-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                          {/* Title on the left */}
                          <div className="flex items-center mb-4 sm:mb-0">
                            <FaCalendarAlt className="text-teal-600 mr-3 text-2xl" />
                              <h1 className="text-teal-800 text-xl font-medium">
                              Detail Pembagian Kalender
                            </h1>
                          </div>

                          {/* Print button on the right */}
                          <button
                            className="p-3 mt-3 text-teal-600 hover:bg-teal-500 hover:text-white bg-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-3 border border-teal-600 hover:border-teal-500"
                            onClick={printTable}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                            </svg>
                            Cetak Detail
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          {/* Filter Cabang */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="relative w-full">
                              <Input
                                type="text"
                                placeholder="Semua Cabang"
                                value={chosenCabang || "Pilih Cabang"}
                                readOnly
                                onFocus={() => {
                                  setDropdownVisible(true);
                                  setSearchTerm("");
                                  setFilteredCabangOptions(cabangOptions);
                                }}
                                className="w-full border rounded-lg p-2 px-4 bg-white shadow-sm cursor-pointer"
                              />
                              {dropdownVisible && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                  {/* Dropdown content */}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Filter Bulan */}
                          <div className="flex-1 min-w-[180px]">
                            <select
                              className="w-full border rounded-lg py-2 px-4 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              id="bulanTableBaru"
                              value={selectedBulanBaru}
                              onChange={(e) =>
                                setSelectedBulanBaru(e.target.value)
                              }
                            >
                              <option value="">Pilih Bulan</option>
                              {bulanList.map((bulan) => (
                                <option key={bulan.id} value={bulan.namaBulan}>
                                  {bulan.namaBulan}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Filter Tahun */}
                          <div className="flex-1 min-w-[150px]">
                            <select
                              className="w-full border rounded-lg py-2 px-4 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              id="tahunTable"
                              value={newSelectedYear}
                              onChange={(e) =>
                                setNewSelectedYear(e.target.value)
                              }
                            >
                              <option value="">Pilih Tahun</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div ref={tableRef} className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                          <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                No
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Cabang
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Pesanan (Buah)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Total Tagihan (Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Provinsi (Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Kabupaten (Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Prk. Cabang (Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Tmbh. Cabang (Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Pemb. Bank (Eks)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Pemb. Bank (Nominal Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Pemb. Tunai (Rp)
                              </th>
                              <th
                                scope="col"
                                className="border px-6 py-3 text-center text-sm"
                              >
                                Selisih (Rp)
                              </th>
                              {/* <th
                                              scope="col"
                                              className="border px-6 py-3 text-center text-sm"
                                            >
                                              Action
                                            </th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTableData.length > 0 ? (
                              filteredTableData.map((item, index) => (
                                <tr
                                  key={item.id}
                                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                >
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    {index + 1}
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    {item.cabang}
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    {item.jumlah}
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
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
                                    10
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 100.000
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 0
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 0
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 0
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 0
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 0
                                  </td>
                                  <td className="border px-6 py-4 text-center text-sm text-black">
                                    Rp 0
                                  </td>
                                  {/* <td className="border py-4 text-center text-sm text-black">
                                                  <button
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded mr-2"
                                                    onClick={() => handleUpdate(item.id)}
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded"
                                                    onClick={() => handleDelete(item.id)}
                                                  >
                                                    Hapus
                                                  </button>
                                                </td> */}
                                </tr>
                              ))
                            ) : (
                              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4">Jumlah</td>
                                <td className="px-6 py-4">0</td>
                                <td className="px-6 py-4">0</td>
                                <td className="px-6 py-4"></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* {[
                                                          {
                                                            id: "provinsi",
                                                            label: "Derap Provinsi",
                                                            value: provinsi,
                                                            onChange: handleProvinsiChange,
                                                          },
                                                          {
                                                            id: "kabupaten",
                                                            label: "Derap Kabupaten",
                                                            value: kabupaten,
                                                            onChange: handleKabupatenChange,
                                                          },
                                                          {
                                                            id: "cabang",
                                                            label: "Derap Cabang/Ranting",
                                                            value: cabang,
                                                            onChange: handleCabangChange,
                                                          },
                                                          {
                                                            id: "totalHarga",
                                                            label: "Total Harga",
                                                            value: totalHarga,
                                                            readOnly: true,
                                                            customClass: "bg-gray-200",
                                                          },
                                                        ].map((field) => (
                                                          <div
                                                            key={field.id}
                                                            className="flex flex-col lg:flex-row items-center mb-4"
                                                          >
                                                            <Label
                                                              htmlFor={field.id}
                                                              className="block text-gray-800 text-lg font-semibold mb-2 lg:mb-0 lg:w-full"
                                                            >
                                                              {field.label}
                                                            </Label>
                                                            <Input
                                                              type="number"
                                                              id={field.id}
                                                              className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out lg:ml-4 ${
                                                                field.customClass || ""
                                                              }`}
                                                              onKeyPress={handleKeyPress}
                                                              value={field.value}
                                                              onChange={field.onChange}
                                                              readOnly={field.readOnly}
                                                            />
                                                          </div>
                                                        ))}
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Jumlah Pesanan :
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>{jumlahPesanan} eksemplar</b>
                                                        </p>
                                                      </div>
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Setor Provinsi:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {setorProvinsi.toLocaleString()}</b>
                                                        </p>
                                                      </div>
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Untuk Kabupaten:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {untukKabupaten.toLocaleString()}</b>
                                                        </p>
                                                      </div>
                                                      <div className="mb-4">
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Untuk Cabang:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {untukCabang.toLocaleString()}</b>
                                                        </p>
                                                      </div>
                                                      <div>
                                                        <h3 className="text-lg font-bold mb-2 text-blue-600">
                                                          Total:
                                                        </h3>
                                                        <p className="text-lg text-gray-700">
                                                          <b>Rp. {totalHargaAkhir.toLocaleString()}</b>
                                                        </p>
                                                      </div> */}
                    </div>
                  </>
                )}
              </div>
              {/* <div className="p-6 rounded-lg shadow-md border border-gray-200 bg-white">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-blue-600">
                    Jumlah Pesanan :
                  </h3>
                  <p className="text-lg text-gray-700">
                    <b>{jumlahPesanan} eksemplar</b>
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-blue-600">
                    Setor Provinsi:
                  </h3>
                  <p className="text-lg text-gray-700">
                    <b>Rp. {setorProvinsi.toLocaleString()}</b>
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-blue-600">
                    Untuk Kabupaten:
                  </h3>
                  <p className="text-lg text-gray-700">
                    <b>Rp. {untukKabupaten.toLocaleString()}</b>
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-blue-600">
                    Untuk Cabang:
                  </h3>
                  <p className="text-lg text-gray-700">
                    <b>Rp. {untukCabang.toLocaleString()}</b>
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-blue-600">
                    Total:
                  </h3>
                  <p className="text-lg text-gray-700">
                    <b>Rp. {totalHargaAkhir.toLocaleString()}</b>
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KalenderForm;
