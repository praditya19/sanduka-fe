"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle, FaDollarSign, FaSave, FaList } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowRightArrowLeft } from "react-icons/fa6";
import { IoReload } from "react-icons/io5";

const PROVINSI_PERCENTAGE = 0.895;
const CABANG_PERCENTAGE = 0.065;
const KABUPATEN_PERCENTAGE = 0.04;

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal!'}
          </h3>

          <div className={`${getTextColor()} text-center`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Daspen() {
  const dropdownRef = useRef(null);
  const [kuota, setKuota] = useState(700);
  const [katagori1, setKatagori1] = useState(0);
  const [katagori2, setKatagori2] = useState(0);
  const [katagori3, setKatagori3] = useState(0);
  const [katagori1Lainnya, setKatagori1Lainnya] = useState(0);
  const [katagori2Lainnya, setKatagori2Lainnya] = useState(0);
  const [katagori3Lainnya, setKatagori3Lainnya] = useState(0);
  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [valueKat1, setValueKat1] = useState(0);
  const [valueKat2, setValueKat2] = useState(0);
  const [valueKat3, setValueKat3] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [perolehanCabang, setPerolehanCabang] = useState(0);
  const [perolehanKabupaten, setPerolehanKabupaten] = useState(0);
  const [perolehanProvinsi, setPerolehanProvinsi] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("");
  const tableRef = useRef();
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const [activeTab, setActiveTab] = useState("target");
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [isUnitKerjaDropdownOpen, setIsUnitKerjaDropdownOpen] = useState(false);
  const [searchQueryUnitKerja, setSearchQueryUnitKerja] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTableData, setFilteredTableData] = useState(tableData);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [chosenCabang, setChosenCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCabangList, setNewCabangList] = useState([]);
  const [selectedBulanBaru, setSelectedBulanBaru] = useState("");
  const [selectedCabangRekap, setSelectedCabangRekap] = useState("");
  const [isDropdownOpenRekap, setIsDropdownOpenRekap] = useState(false);
  const [searchQueryRekap, setSearchQueryRekap] = useState("");
  const [newSelectedYear, setNewSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [notification, setNotification] = useState(null);
  const [showBesaranModal, setShowBesaranModal] = useState(false);

  const fetchData = async () => {
    try {
      const data = await GlobalApi.getTableDaspen(
        selectedBulanBaru,
        newSelectedYear,
        newCabangList,
        selectedUnitKerja?.id || ""
      );
      console.log(data)
      const jumlahRow = data.find((row) => row["Cabang/Khusus"] === "Jumlah");
      const filteredData = data.filter(
        (row) => row["Cabang/Khusus"] !== "Jumlah"
      );

      const sortedData = jumlahRow
        ? [...filteredData, jumlahRow]
        : filteredData;

      setTableData(sortedData);
      setFilteredTableData(sortedData);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    if (selectedBulanBaru && newSelectedYear) {
      fetchData();
    }
  }, [selectedBulanBaru, newSelectedYear, newCabangList, selectedUnitKerja]);

  useEffect(() => {
    if (!selectedBulanBaru || !newSelectedYear) {
      setTableData([]);
    }
  }, [selectedBulanBaru, newSelectedYear]);

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
    const fetchUnitKerja = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja:", error);
      }
    };

    fetchUnitKerja();
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

  const filteredUnitKerjaList = unitKerjaList.filter((unit) =>
    unit?.namaUnit?.toLowerCase()?.includes(searchQueryUnitKerja.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang);
    setIsDropdownOpen(false);
  };

  const handleUnitKerjaSelect = (unit) => {
    setSelectedUnitKerja(unit);
    setIsUnitKerjaDropdownOpen(false);

    if (unit.cabang) {
      setSelectedCabangRekap(unit.cabang);
    }
  };

  const handleSearchChangeRekap = (e) => {
    setSearchQueryRekap(e.target.value);
  };

  const handleCabangSelectRekap = (cabang) => {
    setSelectedCabangRekap(cabang);
    setIsDropdownOpenRekap(false);
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
        (row) => row["Cabang/Khusus"] === cabang.kecamatan
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

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);

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

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("daspenData");

    if (storedData) {
      const data = JSON.parse(storedData);

      const firstItem = data;

      if (firstItem) {
        setKuota(Number(firstItem.pb));
        setKatagori1(Number(firstItem.propinsi));
        setKatagori2(Number(firstItem.kabupaten));
        setKatagori3(Number(firstItem.cabang));
      }
    }
  }, []);

  useEffect(() => {
    setKatagori1Lainnya(kuota * katagori1);
    setKatagori2Lainnya(kuota * katagori2);
    setKatagori3Lainnya(kuota * katagori3);
  }, [kuota, katagori1, katagori2, katagori3]);

  useEffect(() => {
    const total =
      katagori1Lainnya * kat1 +
      katagori2Lainnya * kat2 +
      katagori3Lainnya * kat3;
    setTotalTarget(total);

    const provinsi = total * PROVINSI_PERCENTAGE;
    setPerolehanProvinsi(provinsi);

    const cabang = total * CABANG_PERCENTAGE;
    setPerolehanCabang(cabang);

    const kabupaten = total * KABUPATEN_PERCENTAGE;
    setPerolehanKabupaten(kabupaten);
  }, [kat1, kat2, kat3, katagori1, katagori2, katagori3]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      propinsi: katagori1,
      kabupaten: katagori2,
      cabang: katagori3,
      pb: kuota,
      sanduka: "",
      iuran: "DASPEN",
    };

    try {
      const id = 4;
      const result = await GlobalApi.updateIuranData(id, payload);
      setNotification({
        type: 'success',
        message: `Data Berhasil Diperbarui!`
      });
    } catch (error) {
      setNotification({
        type: 'success',
        message: `Gagal Memperbarui Data!`
      });
    }
  };

  const handleSubmitTarget = async (event) => {
    event.preventDefault();

    const valueKat1 = kat1 * katagori1Lainnya;
    const valueKat2 = kat2 * katagori2Lainnya;
    const valueKat3 = kat3 * katagori3Lainnya;

    const payload = {
      bulan: selectedBulan,
      tahun: selectedYear,
      cabang: selectedCabang,
      kategori1: kat1,
      kategori2: kat2,
      kategori3: kat3,
      perolehanCabang: perolehanCabang,
      perolehanKabupaten: perolehanKabupaten,
      valueKat1: valueKat1,
      valueKat2: valueKat2,
      valueKat3: valueKat3,
    };

    try {
      await GlobalApi.createTargetDaspen(payload);
      setNotification({
        type: 'success',
        message: `Data Berhasil Disimpan!`
      });
      await fetchData();
      handleReset();
    } catch (error) {
      console.error("Error creating data target daspen:", error);
      setNotification({
        type: 'success',
        message: `Gagal Menyimpan Data!`
      });
    }
  };

  const CircleValue = ({ count, amount, borderColor = "border-green-500", textColor = "text-green-500" }) => (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 bg-white ${borderColor} ${textColor} border rounded-full flex items-center justify-center text-xs font-bold mb-1`}>
        {count}
      </div>
      <div className="text-xs">
        Rp {parseInt(amount || 0).toLocaleString("id-ID")}
      </div>
    </div>
  );

  // Komponen untuk tombol action
  const ActionButtons = ({ onSetor, onDetail }) => (
    <div className="flex flex-col gap-2">
      <button
        onClick={onSetor}
        className="flex items-center justify-center gap-1 px-3 py-1 border border-blue-500 text-blue-500 text-xs rounded hover:bg-blue-100"
      >
        <FaArrowRightArrowLeft className="w-4 h-4" />
        <span>Setor</span>
      </button>
      <button
        onClick={onDetail}
        className="flex items-center justify-center gap-1 px-3 py-1 border border-purple-500 text-purple-500 text-xs rounded hover:bg-purple-100"
      >
        <FaList className="w-4 h-4" />
        <span>Detail</span>
      </button>
    </div>
  );

  const handleEdit = (row) => {
    setSelectedRow(row);
    setSelectedCabang(row["Cabang/Khusus"] || "");
    setKat1(row["Anggota Kategori I"] || 0);
    setKat2(row["Anggota Kategori II"] || 0);
    setKat3(row["Anggota Kategori III"] || 0);
    // setBulan(row["Bulan"] || "");
    // setTahun(row["Tahun"] || "");
    // setSelectedItemId(row.id);
    setIsEditing(true);
  };

  // const handleSaveUpdate = async () => {
  //   const updatedData = {
  //     cabang: selectedCabang,
  //     kategori1: isNaN(kat1) ? 0 : kat1,
  //     kategori2: isNaN(kat2) ? 0 : kat2,
  //     kategori3: isNaN(kat3) ? 0 : kat3,
  //     bulan:"",
  //     tahun:"",
  //   };

  //   try {
  //     await GlobalApi.updateTargetDaspen(selectedItemId, updatedData);

  //     setIsEditing(false);
  //     setSelectedItemId(null);
  //   } catch (error) {
  //     alert("Gagal memperbarui data.");
  //   }
  // };  

  const handleDelete = async (id) => {
    try {
      await GlobalApi.deleteTargetDaspen(id);
      setTableData((prevData) => prevData.filter((item) => item.ID !== id));
      setFilteredTableData((prevData) => prevData.filter((item) => item.ID !== id));
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Gagal menghapus data!");
    }
  };

  useEffect(() => {
    setValueKat1(kat1 * katagori1Lainnya);
    setValueKat2(kat2 * katagori2Lainnya);
    setValueKat3(kat3 * katagori3Lainnya);
  }, [kat1, kat2, kat3, katagori1Lainnya, katagori2Lainnya, katagori3Lainnya]);

  const handleReset = () => {
    const storedData = JSON.parse(sessionStorage.getItem("daspenData"));

    if (storedData && storedData.length > 0) {
      const daspen = storedData[0];

      setKuota(parseInt(daspen.pb));
      setKatagori1(parseInt(daspen.propinsi));
      setKatagori2(parseInt(daspen.kabupaten));
      setKatagori3(parseInt(daspen.cabang));
    }
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
              <h1 className="text-base">Daspen</h1>
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
              <h1 className="text-base">Daspen</h1>
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
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <div className="flex justify-between items-center mb-6 mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Manajemen Dana Sosial Pensiun (Daspen)</h1>
            </div>
            <button
              onClick={() => setShowBesaranModal(true)}
              className="bg-white hover:bg-blue-50 border-2 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Atur Besaran Sumbangan Daspen</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-full">
            <button
              className={`flex-1 py-3 px-6 font-medium text-sm rounded-md transition-all duration-200 ${activeTab === "target"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                }`}
              onClick={() => setActiveTab("target")}
            >
              Target & Realisasi Daspen
            </button>
            <button
              className={`flex-1 py-3 px-6 font-medium text-sm rounded-md transition-all duration-200 ${activeTab === "rekapitulasi"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                }`}
              onClick={() => setActiveTab("rekapitulasi")}
            >
              Rekapitulasi Kategori Daspen
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg shadow-lg">
            {activeTab === "target" ? (
              <>
                {/* Filter Section */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <h3 className="font-bold text-lg mb-3">Filter Data Daspen</h3>
                  <p className="text-sm mb-2">Filter data Tagihan & Realisasi Daspen berdasarkan Cabang, Bulan, dan Tahun.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1">Cabang</Label>
                      <div className="relative" ref={dropdownRef}>
                        <Input
                          type="text"
                          className="w-full"
                          readOnly
                          value={selectedCabang || "Semua Cabang"}
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        />
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                            <ul className="max-h-44 overflow-y-auto">
                              <li className="py-2 px-2">
                                <Input
                                  type="text"
                                  className="w-full p-2 border-b"
                                  placeholder="Cari cabang..."
                                  value={searchQuery}
                                  onChange={handleSearchChange}
                                  autoFocus
                                />
                              </li>
                              <li
                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleCabangSelect("")}
                              >
                                Semua Cabang
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
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Bulan</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={selectedBulanBaru}
                        onChange={(e) => setSelectedBulanBaru(e.target.value)}
                      >
                        {bulanList.map((bulan) => (
                          <option key={bulan.id} value={bulan.namaBulan}>
                            {bulan.namaBulan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Tahun</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={newSelectedYear}
                        onChange={(e) => setNewSelectedYear(e.target.value)}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {showBesaranModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold text-gray-800">Atur Besaran Sumbangan Daspen</h2>
                          <button
                            onClick={() => setShowBesaranModal(false)}
                            className="text-gray-500 hover:text-red-700"
                          >
                            <FaTimesCircle size={24} />
                          </button>
                        </div>

                        <div className="space-y-8"> {/* Ubah dari grid gap-8 ke space-y-8 untuk stack vertikal */}
                          {/* Bagian Besaran Sumbangan */}
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="mb-6">
                              <div className="flex items-center gap-3 mb-3">
                                <FaDollarSign className="text-blue-700 w-6 h-6" />
                                <h2 className="text-2xl font-bold text-gray-800">
                                  Besaran Sumbangan Daspen
                                </h2>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                Atur kuota, jumlah default, persentase perolehan, dan lihat proyeksi berdasarkan total target.
                              </p>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="kuota" className="block text-gray-700 text-sm font-semibold mb-2">
                                  Kuota
                                </Label>
                                <Input
                                  type="number"
                                  id="kuota"
                                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                                  value={kuota}
                                  onChange={(e) => setKuota(parseInt(e.target.value))}
                                />
                              </div>

                              {/* Kategori I */}
                              <div className="space-y-2">
                                <h4 className="font-bold text-md">Kategori I</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                  <div>
                                    <Label className="text-gray-700 text-sm font-semibold mb-1 block">
                                      Besaran (Rp)
                                    </Label>
                                    <Input
                                      type="text"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                      value={`Rp ${katagori1Lainnya.toLocaleString("id-ID")}`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-gray-700 text-sm font-semibold mb-1 block">
                                      Jumlah Default
                                    </Label>
                                    <Input
                                      type="number"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                      value={katagori1}
                                      onChange={(e) => setKatagori1(parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Kategori II */}
                              <div className="space-y-2 mt-6">
                                <h4 className="font-bold text-md">Kategori II</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                  <div>
                                    <Label className="text-gray-700 text-sm font-semibold mb-1 block">
                                      Besaran (Rp)
                                    </Label>
                                    <Input
                                      type="text"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                      value={`Rp ${katagori2Lainnya.toLocaleString("id-ID")}`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-gray-700 text-sm font-semibold mb-1 block">
                                      Jumlah Default
                                    </Label>
                                    <Input
                                      type="number"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                      value={katagori2}
                                      onChange={(e) => setKatagori2(parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Kategori III */}
                              <div className="space-y-2 mt-6">
                                <h4 className="font-bold text-md">Kategori III</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                  <div>
                                    <Label className="text-gray-700 text-sm font-semibold mb-1 block">
                                      Besaran (Rp)
                                    </Label>
                                    <Input
                                      type="text"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                      value={`Rp ${katagori3Lainnya.toLocaleString("id-ID")}`}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-gray-700 text-sm font-semibold mb-1 block">
                                      Jumlah Default
                                    </Label>
                                    <Input
                                      type="number"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                      value={katagori3}
                                      onChange={(e) => setKatagori3(parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-center space-x-4 pt-4">
                                <Button
                                  className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 flex items-center space-x-2"
                                  onClick={handleSubmit}
                                >
                                  <FaSave />
                                  <span>Simpan</span>
                                </Button>
                                <Button
                                  className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 flex items-center space-x-2"
                                  onClick={handleReset}
                                >
                                  <IoReload />
                                  <span>Reset</span>
                                </Button>
                                <Button
                                  className="bg-gray-200 text-black px-6 py-2 rounded-md shadow-md hover:bg-gray-400"
                                  onClick={() => setShowBesaranModal(false)}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Bagian Input Manual Target */}
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            {/* <h2 className="bg-teal-700 text-xl text-white font-bold py-2 px-4 rounded mb-4 text-center">
                              Inputan Manual Target Daspen
                            </h2> */}
                            <div className="space-y-4">
                              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="block text-gray-700 text-sm font-semibold mb-2">
                                    Bulan
                                  </Label>
                                  <select
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    value={selectedBulan}
                                    onChange={(e) => setSelectedBulan(e.target.value)}
                                  >
                                    {bulanList.map((bulan) => (
                                      <option key={bulan.id} value={bulan.namaBulan}>
                                        {bulan.namaBulan}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <Label className="block text-gray-700 text-sm font-semibold mb-2">
                                    Tahun
                                  </Label>
                                  <select
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                  >
                                    {years.map((year) => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div> */}

                              {/* <div>
                                <Label className="block text-gray-700 text-sm font-semibold mb-2">
                                  Cabang
                                </Label>
                                <div className="relative" ref={dropdownRef}>
                                  <Input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    readOnly
                                    value={selectedCabang || ""}
                                    placeholder="Pilih Cabang"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                  />
                                  {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                                      <Input
                                        type="text"
                                        className="w-full p-2 border-b"
                                        placeholder="Cari cabang..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        autoFocus
                                      />
                                      <ul className="max-h-44 overflow-y-auto">
                                        {filteredCabangList.map((cabang) => (
                                          <li
                                            key={cabang.id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            onClick={() => handleCabangSelect(cabang.kecamatan)}
                                          >
                                            {cabang.kecamatan}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div> */}

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-gray-700 text-sm font-semibold mb-2">
                                    Kat I
                                  </Label>
                                  <Input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    value={kat1}
                                    onChange={(e) => setKat1(e.target.value ? parseInt(e.target.value) : 0)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-700 text-sm font-semibold mb-2">
                                    Kat II
                                  </Label>
                                  <Input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    value={kat2}
                                    onChange={(e) => setKat2(e.target.value ? parseInt(e.target.value) : 0)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-700 text-sm font-semibold mb-2">
                                    Kat III
                                  </Label>
                                  <Input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                    value={kat3}
                                    onChange={(e) => setKat3(e.target.value ? parseInt(e.target.value) : 0)}
                                  />
                                </div>
                              </div>

                              <div className="mb-8">
                                {/* Header Section */}
                                <div className="flex items-center gap-3 mb-4">
                                  <FaArrowTrendUp className="text-green-600 w-6 h-6" />
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                      Proyeksi Perolehan Berdasarkan Total Target
                                    </h3>
                                    <p className="text-sm text-gray-800">
                                      (Rp {totalTarget.toLocaleString("id-ID")})
                                    </p>
                                  </div>
                                </div>

                                {/* Cards Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  {/* Provinsi Card */}
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Perolehan Provinsi (89.5%):
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold text-green-600">
                                      Rp {perolehanProvinsi.toLocaleString("id-ID")}
                                    </p>
                                  </div>

                                  {/* Cabang Card */}
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Perolehan Cabang (6.5%):
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold text-blue-600">
                                      Rp {perolehanCabang.toLocaleString("id-ID")}
                                    </p>
                                  </div>

                                  {/* Kabupaten Card */}
                                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Perolehan Kabupaten (4%):
                                      </span>
                                    </div>
                                    <p className="text-xl font-bold text-purple-600">
                                      Rp {perolehanKabupaten.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>

                                {/* Footer Note */}
                                <p className="text-xs text-gray-500 italic">
                                  *Proyeksi ini dihitung berdasarkan Total Target dari inputan manual di
                                  halaman utama dan persentase yang diatur di atas.
                                </p>
                              </div>

                              <div className="flex justify-center space-x-4 pt-4">
                                <Button
                                  className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 flex items-center space-x-2"
                                  onClick={isEditing ? handleSaveUpdate : handleSubmitTarget}
                                >
                                  {isEditing ? "Update" : "Submit"}
                                </Button>
                                <Button
                                  className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 flex items-center space-x-2"
                                  onClick={handleReset}
                                >
                                  <IoReload />
                                  <span>Reset</span>
                                </Button>
                                <Button
                                  className="bg-gray-200 text-black px-6 py-2 rounded-md shadow-md hover:bg-gray-400"
                                  onClick={() => setShowBesaranModal(false)}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Besaran Sumbangan dan Inputan Manual */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
                      Besaran Sumbangan Daspen
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="kuota"
                          className="block text-gray-700 text-sm font-semibold mb-2"
                        >
                          Kuota
                        </Label>
                        <Input
                          type="number"
                          id="kuota"
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                          value={kuota}
                          onChange={(e) => setKuota(parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex flex-col w-1/2">
                          <Label
                            htmlFor="katagori1"
                            className="text-gray-700 text-sm font-semibold mb-2"
                          >
                            Katagori I
                          </Label>
                          <Input
                            type="text"
                            id="katagori1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${katagori1Lainnya.toLocaleString("id-ID")}`}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col w-1/2 mt-7">
                          <Input
                            type="number"
                            id="katagori1-2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                            value={katagori1}
                            onChange={(e) => setKatagori1(parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex flex-col w-1/2">
                          <Label
                            htmlFor="katagori2"
                            className="text-gray-700 text-sm font-semibold mb-2"
                          >
                            Katagori II
                          </Label>
                          <Input
                            type="text"
                            id="katagori2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${katagori2Lainnya.toLocaleString("id-ID")}`}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col w-1/2 mt-7">
                          <Input
                            type="number"
                            id="katagori2-2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                            value={katagori2}
                            onChange={(e) => setKatagori2(parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex flex-col w-1/2">
                          <Label
                            htmlFor="katagori3"
                            className="text-gray-700 text-sm font-semibold mb-2"
                          >
                            Katagori III
                          </Label>
                          <Input
                            type="text"
                            id="katagori3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${katagori3Lainnya.toLocaleString("id-ID")}`}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col w-1/2 mt-7">
                          <Input
                            type="number"
                            id="katagori3-2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                            value={katagori3}
                            onChange={(e) => setKatagori3(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="mt-8 flex justify-center space-x-4">
                        <Button
                          className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-150 ease-in-out"
                          onClick={handleSubmit}
                        >
                          Submit
                        </Button>
                        <Button
                          className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition duration-150 ease-in-out"
                          onClick={handleReset}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-5 text-center">
                      Inputan Manual Target Daspen
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <Label
                            htmlFor="bulan"
                            className="block text-gray-700 text-sm font-semibold mb-2"
                          >
                            Bulan
                          </Label>
                          <select
                            id="bulan"
                            value={selectedBulan}
                            onChange={(e) => setSelectedBulan(e.target.value)}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                          >
                            {bulanList.map((bulan) => (
                              <option key={bulan.id} value={bulan.namaBulan}>
                                {bulan.namaBulan}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <Label
                            htmlFor="tahun"
                            className="block text-gray-700 text-sm font-semibold mb-2"
                          >
                            Tahun
                          </Label>
                          <select
                            id="tahun"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col ">
                          <Label
                            htmlFor="cabang"
                            className="block text-gray-700 text-sm font-semibold mb-2"
                          >
                            Cabang
                          </Label>
                          <div className="relative w-full" ref={dropdownRef}>
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
                              <div className="absolute w-40 mt-1 bg-white border rounded shadow-lg z-10">
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
                        <div className="flex flex-col">
                          <Label htmlFor="kat1" className="text-gray-700 text-sm font-semibold mb-2">
                            Kat I
                          </Label>
                          <Input
                            type="number"
                            id="kat1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                            value={kat1}
                            onChange={(e) => setKat1(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label htmlFor="kat2" className="text-gray-700 text-sm font-semibold mb-2">
                            Kat II
                          </Label>
                          <Input
                            type="number"
                            id="kat2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                            value={kat2}
                            onChange={(e) => setKat2(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label htmlFor="kat3" className="text-gray-700 text-sm font-semibold mb-2">
                            Kat III
                          </Label>
                          <Input
                            type="number"
                            id="kat3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                            value={kat3}
                            onChange={(e) => setKat3(e.target.value ? parseInt(e.target.value) : 0)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                          <Label
                            htmlFor="totalTarget"
                            className="text-gray-700 text-sm font-semibold mb-2 mt-5"
                          >
                            Total Target
                          </Label>
                          <Input
                            type="text"
                            id="totalTarget"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${totalTarget.toLocaleString("id-ID")}`}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label
                            htmlFor="perolehanProvinsi"
                            className="text-gray-700 text-sm font-semibold mb-2"
                          >
                            Perolehan Provinsi (89,5%)
                          </Label>
                          <Input
                            type="text"
                            id="perolehanProvinsi"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${perolehanProvinsi.toLocaleString(
                              "id-ID"
                            )}`}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label
                            htmlFor="perolehanCabang"
                            className="text-gray-700 text-sm font-semibold mb-2"
                          >
                            Perolehan Cabang (6,5%)
                          </Label>
                          <Input
                            type="text"
                            id="perolehanCabang"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${perolehanCabang.toLocaleString("id-ID")}`}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label
                            htmlFor="perolehanKabupaten"
                            className="text-gray-700 text-sm font-semibold mb-2"
                          >
                            Perolehan Kabupaten (4%)
                          </Label>
                          <Input
                            type="text"
                            id="perolehanKabupaten"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out bg-gray-200"
                            value={`Rp ${perolehanKabupaten.toLocaleString(
                              "id-ID"
                            )}`}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="mt-8 flex justify-center space-x-4">
                        <Button
                          className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-150 ease-in-out"
                          onClick={isEditing ? handleSaveUpdate : handleSubmitTarget}
                        >
                          {isEditing ? "Update" : "Submit"}
                        </Button>
                        <Button
                          className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition duration-150 ease-in-out"
                          onClick={handleReset}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Data Table Section */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">Data Tagihan & Realisasi Daspen ({selectedCabang || "Semua Cabang"}) {selectedBulanBaru} {newSelectedYear}</h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-3 border text-center font-bold">NO</th>
                          <th className="px-2 py-3 border text-center font-bold">CABANG</th>

                          {/* Tagihan Columns */}
                          <th className="px-2 py-3 border text-center font-bold">
                            KATEGORI I<br />
                            <span className="text-xs font-normal">(Anggota / Tagihan)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            KATEGORI II<br />
                            <span className="text-xs font-normal">(Anggota / Tagihan)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            KATEGORI III<br />
                            <span className="text-xs font-normal">(Anggota / Tagihan)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            TOTAL ANGGOTA<br />
                            <span className="text-xs font-normal">/ TAGIHAN (Rp)</span>
                          </th>

                          {/* Realisasi Columns */}
                          <th className="px-2 py-3 border text-center font-bold">
                            KATEGORI I<br />
                            <span className="text-xs font-normal">(Anggota / Realisasi)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            KATEGORI II<br />
                            <span className="text-xs font-normal">(Anggota / Realisasi)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            KATEGORI III<br />
                            <span className="text-xs font-normal">(Anggota / Realisasi)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            TOTAL ANGGOTA<br />
                            <span className="text-xs font-normal">/ REALISASI (Rp)</span>
                          </th>

                          {/* New Columns */}
                          <th className="px-2 py-3 border text-center font-bold">
                            POT. BANK<br />
                            <span className="text-xs font-normal">(Rp)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            SETOR TUNAI<br />
                            <span className="text-xs font-normal">(Rp)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            SELISIH<br />
                            <span className="text-xs font-normal">(Rp)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            PERUNTUKAN PROVINSI<br />
                            <span className="text-xs font-normal">(Rp) </span>
                            <span className="text-xs text-gray-500">(89.5%)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            PERUNTUKAN KABUPATEN<br />
                            <span className="text-xs font-normal">(Rp) </span>
                            <span className="text-xs text-gray-500">(4%)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">
                            PERUNTUKAN CABANG<br />
                            <span className="text-xs font-normal">(Rp) </span>
                            <span className="text-xs text-gray-500">(6.5%)</span>
                          </th>
                          <th className="px-2 py-3 border text-center font-bold">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTableData.map((row, index) => {
                          // Perhitungan untuk kolom-kolom baru
                          const realisasiTotal = parseInt(row["Realisasi Total"] || row["Sumbangan Total"] || 0);
                          const potBank = parseInt(row["Pot Bank"] || Math.round(realisasiTotal * 0.025) || 0); // contoh 2.5%
                          const setorTunai = realisasiTotal - potBank;
                          const tagihan = parseInt(row["Sumbangan Total"] || 0);
                          const selisih = tagihan - realisasiTotal;

                          // Perhitungan peruntukan berdasarkan realisasi total
                          const peruntukanProvinsi = Math.round(realisasiTotal * 0.895);
                          const peruntukanKabupaten = Math.round(realisasiTotal * 0.04);
                          const peruntukanCabang = Math.round(realisasiTotal * 0.065);

                          return (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2 text-center font-semibold">{index + 1}</td>
                              <td className="px-4 py-2 font-medium">{row["Cabang/Khusus"] || "-"}</td>

                              {/* Kolom Tagihan dengan Lingkaran */}
                              <td className="px-4 py-2 text-center">
                                <CircleValue
                                  count={row["Anggota Kategori I"] || 0}
                                  amount={row["Sumbangan Kategori I"] || 0}
                                  bgColor="bg-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <CircleValue
                                  count={row["Anggota Kategori II"] || 0}
                                  amount={row["Sumbangan Kategori II"] || 0}
                                  bgColor="bg-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <CircleValue
                                  count={row["Anggota Kategori III"] || 0}
                                  amount={row["Sumbangan Kategori III"] || 0}
                                  bgColor="bg-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">
                                  {(parseInt(row["Anggota Kategori I"] || 0) + parseInt(row["Anggota Kategori II"] || 0) + parseInt(row["Anggota Kategori III"] || 0))}
                                </div>
                                <div className="text-xs font-semibold">
                                  Rp {parseInt(row["Sumbangan Total"] || 0).toLocaleString("id-ID")}
                                </div>
                              </td>

                              {/* Kolom Realisasi dengan Lingkaran Hijau */}
                              <td className="px-4 py-2 text-center">
                                <CircleValue
                                  count={row["Realisasi Anggota Kategori I"] || row["Anggota Kategori I"] || 0}
                                  amount={row["Realisasi Sumbangan Kategori I"] || row["Sumbangan Kategori I"] || 0}
                                  borderColor="border-blue-500"
                                  textColor="text-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <CircleValue
                                  count={row["Realisasi Anggota Kategori II"] || row["Anggota Kategori II"] || 0}
                                  amount={row["Realisasi Sumbangan Kategori II"] || row["Sumbangan Kategori II"] || 0}
                                  borderColor="border-blue-500"
                                  textColor="text-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <CircleValue
                                  count={row["Realisasi Anggota Kategori III"] || row["Anggota Kategori III"] || 0}
                                  amount={row["Realisasi Sumbangan Kategori III"] || row["Sumbangan Kategori III"] || 0}
                                  borderColor="border-blue-500"
                                  textColor="text-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">
                                  {(parseInt(row["Realisasi Anggota Kategori I"] || row["Anggota Kategori I"] || 0) +
                                    parseInt(row["Realisasi Anggota Kategori II"] || row["Anggota Kategori II"] || 0) +
                                    parseInt(row["Realisasi Anggota Kategori III"] || row["Anggota Kategori III"] || 0))}
                                </div>
                                <div className="text-xs font-semibold">
                                  Rp {realisasiTotal.toLocaleString("id-ID")}
                                </div>
                              </td>

                              {/* Kolom-kolom Baru */}
                              <td className="px-4 py-2 text-center">
                                <span className="text-sm font-medium">
                                  Rp {potBank.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className="text-sm font-medium">
                                  Rp {setorTunai.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className={`text-sm font-medium ${selisih > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  Rp {Math.abs(selisih).toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className="text-sm font-medium">
                                  Rp {peruntukanProvinsi.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className="text-sm font-medium">
                                  Rp {peruntukanKabupaten.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className="text-sm font-medium">
                                  Rp {peruntukanCabang.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <ActionButtons
                                  onSetor={() => handleSetor(row, index)}
                                  onDetail={() => handleDetail(row, index)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Rekapitulasi Kategori Daspen */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <h3 className="font-bold text-lg mb-3">Filter Rekapitulasi Kategori Daspen</h3>
                  <p className="text-sm mb-2">Filter data Rekapitulasi Kategori Daspen berdasarkan Cabang, Unit Kerja, Bulan, Tahun, dan Keterangan Pembayaran.</p>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1">Cabang</Label>
                      <div className="relative" ref={dropdownRef}>
                        <Input
                          type="text"
                          className="w-full"
                          readOnly
                          value={selectedCabangRekap || "Semua Cabang"}
                          onClick={() => setIsDropdownOpenRekap(!isDropdownOpenRekap)}
                        />
                        {isDropdownOpenRekap && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                            <ul className="max-h-44 overflow-y-auto">
                              <li className="py-2 px-2">
                                <Input
                                  type="text"
                                  className="w-full p-2 border-b"
                                  placeholder="Cari cabang..."
                                  value={searchQueryRekap}
                                  onChange={handleSearchChangeRekap}
                                  autoFocus
                                />
                              </li>
                              <li
                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleCabangSelectRekap("")}
                              >
                                Semua Cabang
                              </li>
                              {cabangList
                                .filter((cabang) =>
                                  cabang.kecamatan
                                    .toLowerCase()
                                    .includes(searchQueryRekap.toLowerCase())
                                )
                                .map((cabang) => (
                                  <li
                                    key={cabang.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() =>
                                      handleCabangSelectRekap(cabang.kecamatan)
                                    }
                                  >
                                    {cabang.kecamatan}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Unit Kerja</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          className="w-full"
                          readOnly
                          value={selectedUnitKerja?.unitKerja || "Pilih Unit Kerja"}
                          onClick={() => setIsUnitKerjaDropdownOpen(!isUnitKerjaDropdownOpen)}
                        />
                        {isUnitKerjaDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                            <ul className="max-h-44 overflow-y-auto">
                              <li className="py-2 px-2">
                                <Input
                                  type="text"
                                  className="w-full p-2 border-b"
                                  placeholder="Cari unit kerja..."
                                  value={searchQueryUnitKerja}
                                  onChange={(e) => setSearchQueryUnitKerja(e.target.value)}
                                  autoFocus
                                />
                              </li>
                              <li
                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleUnitKerjaSelect({})}
                              >
                                Semua Unit Kerja
                              </li>
                              {unitKerjaList
                                .filter(unit =>
                                  (!selectedCabangRekap || unit.cabang === selectedCabangRekap) &&
                                  unit.unitKerja.toLowerCase().includes(searchQueryUnitKerja.toLowerCase())
                                )
                                .map((unit) => (
                                  <li
                                    key={unit.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => handleUnitKerjaSelect(unit)}
                                  >
                                    {unit.unitKerja}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Bulan</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={selectedBulanBaru}
                        onChange={(e) => setSelectedBulanBaru(e.target.value)}
                      >
                        {bulanList.map((bulan) => (
                          <option key={bulan.id} value={bulan.namaBulan}>
                            {bulan.namaBulan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Tahun</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={newSelectedYear}
                        onChange={(e) => setNewSelectedYear(e.target.value)}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-1">Ket. Pembayaran</Label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      // value={selectedKeterangan || ""}
                      // onChange={(e) => setSelectedKeterangan(e.target.value)}
                      >
                        <option value="">Semua Keterangan</option>
                        <option value="Potongan Bank">Potongan Bank</option>
                        <option value="Setoran Tunai">Setoran Tunai</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Kategori */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <h3 className="font-bold text-lg mb-3">Ringkasan Kategori Daspen</h3>
                  <p className="text-sm mb-4">Total anggota dan nominal berdasarkan filter yang dipilih.</p>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <h4 className="font-medium text-blue-800">Kategori I</h4>
                      </div>
                      <p className="text-blue-700">Anggota: 6</p>
                      <p className="text-blue-900 font-semibold">Rp 76.500</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <h4 className="font-medium text-green-800">Kategori II</h4>
                      </div>
                      <p className="text-green-700">Anggota: 5</p>
                      <p className="text-green-900 font-semibold">Rp 85.000</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <h4 className="font-medium text-purple-800">Kategori III</h4>
                      </div>
                      <p className="text-purple-700">Anggota: 4</p>
                      <p className="text-purple-900 font-semibold">Rp 85.000</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <h4 className="font-medium text-orange-800">Potongan Bank</h4>
                      </div>
                      <p className="text-orange-700">Anggota: 10</p>
                      <p className="text-orange-900 font-semibold">Rp 148.750</p>
                    </div>

                    <div className="bg-teal-50 border border-teal-200 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                        <h4 className="font-medium text-teal-800">Setoran Tunai</h4>
                      </div>
                      <p className="text-teal-700">Anggota: 5</p>
                      <p className="text-teal-900 font-semibold">Rp 97.750</p>
                    </div>
                  </div>
                </div>

                {/* Rekapitulasi Table */}
                {/* Rekapitulasi Table */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">
                      Rekapitulasi Kategori Daspen ({selectedCabangRekap || "Semua Cabang"}) {selectedBulanBaru} {newSelectedYear}
                    </h3>
                    <button
                      onClick={printTable}
                      className="bg-white hover:bg-blue-50 border border-blue-500 text-blue-500 px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Cetak Rekap Kategori
                    </button>
                  </div>

                  {/* <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <h4 className="font-medium text-orange-800">Potongan Bank</h4>
                    </div>
                    <p className="text-orange-700">Anggota: 10</p>
                    <p className="text-orange-900 font-semibold">Rp 148.750</p>
                  </div> */}

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className=" text-left">
                        <tr>
                          <th className="px-4 py-2 text-gray-500">No.</th>
                          <th className="px-4 py-2 text-gray-500">Cabang</th>
                          <th className="px-4 py-2 text-gray-500">Unit Kerja</th>
                          <th className="px-4 py-2 text-gray-500">Nama</th>
                          <th className="px-4 py-2 text-gray-500">NIP</th>
                          <th className="px-4 py-2 text-gray-500">Kategori Daspen</th>
                          <th className="px-4 py-2 text-right text-gray-500">Nominal Daspen</th>
                          <th className="px-4 py-2 text-gray-500">Keterangan Pembayaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-center">1</td>
                          <td className="px-4 py-4">Cabang A</td>
                          <td className="px-4 py-4">SDN 1 Cabang A</td>
                          <td className="px-4 py-4">Anggota A1</td>
                          <td className="px-4 py-4">111222333</td>
                          <td className="px-4 py-4">Kategori I</td>
                          <td className="px-4 py-4 text-right">Rp 12.750</td>
                          <td className="px-4 py-4">
                            <span className="bg-green-100 text-green-800 border border-green-500 px-2 py-1 rounded-2xl text-sm">
                              Potongan Bank
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-center">2</td>
                          <td className="px-4 py-4">Cabang A</td>
                          <td className="px-4 py-4">SMPN 2 Cabang A</td>
                          <td className="px-4 py-4">Anggota A2</td>
                          <td className="px-4 py-4">444555666</td>
                          <td className="px-4 py-4">Kategori II</td>
                          <td className="px-4 py-4 text-right">Rp 17.000</td>
                          <td className="px-4 py-4">
                            <span className="bg-blue-100 text-blue-800 border border-blue-500 px-2 py-1 rounded-2xl text-sm">
                              Setoran Tunai
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-center">3</td>
                          <td className="px-4 py-2">Cabang B</td>
                          <td className="px-4 py-2">SMAM 1 Cabang B</td>
                          <td className="px-4 py-2">Anggota B1</td>
                          <td className="px-4 py-2">777888999</td>
                          <td className="px-4 py-2">Kategori III</td>
                          <td className="px-4 py-2 text-right">Rp 21.250</td>
                          <td className="px-4 py-2">
                            <span className="bg-green-100 text-green-800 border border-green-500 px-2 py-1 rounded-2xl text-sm">
                              Potongan Bank
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-center">4</td>
                          <td className="px-4 py-2">Cabang C</td>
                          <td className="px-4 py-2">TK-Perhwi Cabang C</td>
                          <td className="px-4 py-2">Anggota C1</td>
                          <td className="px-4 py-2">000111222</td>
                          <td className="px-4 py-2">Kategori I</td>
                          <td className="px-4 py-2 text-right">Rp 12.750</td>
                          <td className="px-4 py-2">
                            <span className="bg-green-100 text-green-800 border border-green-500 px-2 py-1 rounded-2xl text-sm">
                              Potongan Bank
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-center">5</td>
                          <td className="px-4 py-2">Cabang A</td>
                          <td className="px-4 py-2">SDN 1 Cabang A</td>
                          <td className="px-4 py-2">Anggota A3</td>
                          <td className="px-4 py-2">111222334</td>
                          <td className="px-4 py-2">Kategori I</td>
                          <td className="px-4 py-2 text-right">Rp 12.750</td>
                          <td className="px-4 py-2">
                            <span className="bg-green-100 text-green-800 border border-green-500 px-2 py-1 rounded-2xl text-sm">
                              Potongan Bank
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
