"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// New component for mutation notification
const MutationNotification = ({ type, message, details, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

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
        return <FaCheckCircle className="text-green-500 text-4xl mb-3" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500 text-4xl mb-3" />;
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
          <FaTimesCircle size={20} />
        </button>

        <div className="flex flex-col items-center space-y-3">
          <div className="animate-bounce">
            {getIcon()}
          </div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === 'success' ? 'Mutasi Berhasil!' : 'Mutasi Gagal!'}
          </h3>

          <p className={`${getTextColor()} text-center text-lg`}>
            {message}
          </p>
          
          {details && (
            <div className="mt-3 w-full">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const page = () => {
  const router = useRouter();
  const [cabangOptions, setCabangOptions] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  // State for new notification component
  const [notification, setNotification] = useState(null);

  const [userData, setUserData] = useState(null);
  const [cabang, setCabang] = useState("");

  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");

  const [showDropdownCabangUnit, setShowDropdownCabangUnit] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const unitKerjaRef = useRef(null);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setCabangOptions(response.data);
        setFilteredCabangOptions(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };

    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaOptions(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };

    fetchCabangData();
    fetchUnitKerjaData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const role = sessionStorage.getItem("role");
      let userId;

      if (role === "ADMIN" || role === "SUPERADMIN") {
        userId = sessionStorage.getItem("anggotaId");
      } else if (role === "USER") {
        userId = sessionStorage.getItem("userId");
      }

      if (userId) {
        try {
          const response = await GlobalApi.getUserById(userId);
          setUserData(response);
          setCabang(response.cabang || "");
          setSelectedUnitKerja(response.unitKerja || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.warn("User ID tidak ditemukan di sessionStorage.");
      }
    };

    fetchUserData();
  }, []);

  const handleCabangSelect = (cabangItem) => {
    setCabang(cabangItem.kecamatan);
    setShowDropdownCabangUnit(false);

    const filteredUnits = unitKerjaOptions.filter(
      (unit) => unit.cabang === cabangItem.kecamatan
    );

    setFilteredUnitKerjaOptions(filteredUnits);
  };

  const handleCabangSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = cabangOptions.filter((cabangItem) =>
      cabangItem.kecamatan.toLowerCase().includes(value)
    );
    setFilteredCabangOptions(filtered);
  };

  const handleUnitKerjaSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = unitKerjaOptions.filter((unit) =>
      unit.unitKerja.toLowerCase().includes(searchValue)
    );
    setFilteredUnitKerjaOptions(filtered);
  };

  const handleCancelCabangUnit = () => {
    setShowDropdownCabangUnit(false);
    setIsDropdownVisible(false);
    router.back();
  };

  const handleSaveCabangUnit = async () => {
    setIsPopupVisible(true);
  };

  const handleConfirmSave = async () => {
    const role = sessionStorage.getItem("role");
    let idAnggota;

    if (role === "ADMIN" || role === "SUPERADMIN") {
      idAnggota = sessionStorage.getItem("anggotaId");
    } else if (role === "USER") {
      idAnggota = sessionStorage.getItem("userId");
    }

    if (!idAnggota) {
      console.error("ID tidak ditemukan. Periksa role atau sessionStorage.");
      setNotification({
        type: 'error',
        message: 'ID anggota tidak valid. Silakan login ulang.',
        details: null
      });
      return;
    }

    if (!cabang || !selectedUnitKerja) {
      console.error("Cabang atau Unit Kerja tidak boleh kosong");
      setNotification({
        type: 'error',
        message: 'Silakan pilih Cabang dan Unit Kerja sebelum menyimpan.',
        details: null
      });
      setIsPopupVisible(false);
      return;
    }

    try {
      const response = await GlobalApi.mutasiCabangUnitKerja(
        idAnggota,
        cabang,
        selectedUnitKerja
      );

      // Show the new notification component
      setNotification({
        type: 'success',
        message: 'Anda telah berhasil pindah cabang dan unit kerja.',
        details: {
          'Cabang': cabang,
          'Unit Kerja': selectedUnitKerja
        }
      });

      handleCreateHistory();
      setShowDropdownCabangUnit(false);
      setIsDropdownVisible(false);

      setTimeout(() => {
        router.back();
      }, 4000);
    } catch (error) {
      console.error("Error saat memutasikan anggota:", error);
      
      setNotification({
        type: 'error',
        message: `Terjadi kesalahan: ${error?.response?.data?.message || "Silakan coba lagi."}`,
        details: null
      });
    } finally {
      setIsPopupVisible(false);
    }
  };

  const handleCancelSave = () => {
    setIsPopupVisible(false);
  };

  const handleCreateHistory = async () => {
    const now = new Date();
    
    // Format date components
    const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = now.toISOString().split("T")[0];
    const jam = now.toTimeString().split(" ")[0];
    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();
  
    // Get user details
    const userRole = sessionStorage.getItem("role");
    const namaLengkapUser = userRole === "USER" 
      ? userData.namaLengkap 
      : sessionStorage.getItem("nama");
  
    const historyData = {
      hari,
      tanggal,
      jam,
      npa: userData.npaPgri,
      nama: userData.namaLengkap,
      cabang: userData.cabang, // Use current cabang before mutation
      uraian: "Pindah Cabang",
      masuk: cabang, // New cabang as masuk
      keluar: userData.cabang, // Current cabang as keluar
      bulan,
      tahun,
      cabang_ke_2: cabang,
      user: namaLengkapUser,
    };
  
    try {
      await GlobalApi.createHistoryData(historyData);
    } catch (error) {
      console.error("Failed to create history data:", error);
      setNotification({
        type: 'error',
        message: "Gagal menyimpan riwayat mutasi",
        details: null
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownCabangUnit(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenCabangDropdown = () => {
    setSearchTerm("");
    setFilteredCabangOptions(cabangOptions);
    setShowDropdownCabangUnit(true);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* This is the original Toaster that you can remove or keep as fallback */}
      <Toaster
        toastOptions={{
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "white",
              color: "black",
            },
          },
        }}
      />
      
      {/* Add the new notification component */}
      {notification && (
        <MutationNotification
          type={notification.type}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="bg-white p-4 rounded shadow-lg w-full sm:w-3/4 md:w-2/4 lg:w-2/5 ">
        <h2 className="text-lg font-bold">MUTASI</h2>

        <div className="mb-4 mt-2 relative" ref={dropdownRef}>
          <label className="block mb-1">Cabang:</label>
          <Input
            id="cabangInput"
            type="text"
            className="border-teal-500 rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
            placeholder="Pilih Cabang"
            value={cabang}
            readOnly
            onClick={handleOpenCabangDropdown}
          />
          {showDropdownCabangUnit && (
            <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-full sm:w-[80%] md:w-[48%] lg:w-[48%]">
              {/* Input Pencarian */}
              <ul className="max-h-44 overflow-y-auto">
                <li className="py-2 px-2">
                  <Input
                    type="text"
                    className="border-b p-2 bg-white"
                    placeholder="Cari Cabang"
                    value={searchTerm}
                    onChange={handleCabangSearch}
                    autoFocus
                  />
                </li>
                {/* List Hasil Pencarian */}
                {filteredCabangOptions.map((cabangItem) => (
                  <li
                    key={cabangItem.idKecamatan}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleCabangSelect(cabangItem)}
                  >
                    {cabangItem.kecamatan}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mb-4 relative" ref={unitKerjaRef}>
          <label className="block mb-1">Unit Kerja:</label>
          <Input
            type="text"
            className="border border-teal-500 rounded w-full p-2 cursor-pointer"
            placeholder="Pilih Unit Kerja"
            value={selectedUnitKerja}
            readOnly
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          />
          {isDropdownVisible && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full sm:w-[80%] md:w-[48%] lg:w-[47%]">
              <ul className="max-h-44 overflow-y-auto">
                <li className="py-2 px-2">
                  <Input
                    type="text"
                    placeholder="Cari Unit Kerja..."
                    className="border border-gray-300 rounded w-full p-2"
                    onChange={handleUnitKerjaSearch}
                    autoFocus
                  />
                </li>
                {filteredUnitKerjaOptions.length > 0 ? (
                  filteredUnitKerjaOptions.map((unit) => (
                    <li
                      key={unit.id}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setSelectedUnitKerja(unit.unitKerja);
                        setIsDropdownVisible(false);
                      }}
                    >
                      {unit.unitKerja}
                    </li>
                  ))
                ) : (
                  <li className="p-2">Tidak ada hasil ditemukan</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleCancelCabangUnit}
            className="bg-red-500 hover:bg-red-700 mr-2"
          >
            Batal
          </Button>
          <Button
            type="button"
            className="bg-teal-500 hover:bg-teal-700"
            onClick={handleSaveCabangUnit}
          >
            Simpan
          </Button>
        </div>

        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 py-9 rounded shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-full">
              <p className="text-lg mb-12">
                Apakah Anda yakin Ingin Pindah Cabang?
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                  onClick={handleCancelSave}
                >
                  Tidak
                </button>
                <button
                  className="bg-teal-700 hover:bg-teal-500 text-white px-4 py-2 rounded"
                  onClick={handleConfirmSave}
                >
                  Ya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;