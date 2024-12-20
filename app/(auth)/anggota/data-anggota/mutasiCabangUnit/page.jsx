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

const page = () => {
  const router = useRouter();
  const [cabangOptions, setCabangOptions] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);

  const [isPopupVisible, setIsPopupVisible] = useState(false);

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

      if (role === "ADMIN" || role === "SUPER ADMIN") {
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
    const role = sessionStorage.getItem("role"); // Ambil role dari sessionStorage
    let idAnggota;
  
    // Tentukan ID berdasarkan role
    if (role === "ADMIN" || role === "SUPER ADMIN") {
      idAnggota = sessionStorage.getItem("anggotaId");
    } else if (role === "USER") {
      idAnggota = sessionStorage.getItem("userId");
    }
  
    if (!idAnggota) {
      console.error("ID tidak ditemukan. Periksa role atau sessionStorage.");
      alert("ID anggota tidak valid. Silakan login ulang.");
      return;
    }
  
    if (!cabang || !selectedUnitKerja) {
      console.error("Cabang atau Unit Kerja tidak boleh kosong");
      alert("Silakan pilih Cabang dan Unit Kerja sebelum menyimpan.");
      setIsPopupVisible(false);
      return;
    }
  
    try {
      const response = await GlobalApi.mutasiCabangUnitKerja(
        idAnggota,
        cabang,
        selectedUnitKerja
      );

      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {`Mutasi Berhasil!`}
          </strong>
          <span style={{ fontSize: "1.75rem" }}>
            {` Cabang: ${cabang}, Unit Kerja: ${selectedUnitKerja}`}
          </span>
        </div>,
        {
          icon: null,
          duration: 5000,
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
        }
      );
      handleCreateHistory();
      setShowDropdownCabangUnit(false);
      setIsDropdownVisible(false);
  
      setTimeout(() => {
        router.back();
      }, 5000);
    } catch (error) {
      console.error("Error saat memutasikan anggota:", error);
      console.error("Response data:", error.response?.data);
  
      toast.error(
        `Terjadi kesalahan: ${
          error?.response?.data?.message || "Silakan coba lagi."
        }`
      );
    } finally {
      setIsPopupVisible(false);
    }
  };
  
  const handleCancelSave = () => {
    setIsPopupVisible(false); // Tutup popup jika user membatalkan
  };

  const handleCreateHistory = async () => {
    const now = new Date();

    const options = { weekday: "long" };
    const hari = now.toLocaleDateString("id-ID", options);
    const tanggal = now.toISOString().split("T")[0];
    const jam = now.toTimeString().split(" ")[0];

    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();

    const npaPgri = sessionStorage.getItem("npaPgri");
    const namaLengkap = sessionStorage.getItem("nama");

    const historyData = {
      hari: hari,
      tanggal: tanggal,
      jam: jam,
      npa: npaPgri,
      nama: namaLengkap,
      cabang: userData.cabangSebelumnya,
      uraian: "Pindah Cabang",
      masuk: "Baru",
      keluar: "",
      bulan: bulan,
      tahun: tahun,
      cabang_ke_2: cabang,
      user: namaLengkap,
    };

    try {
      const response = await GlobalApi.createHistoryData(historyData);
      console.log("History data created successfully:", response);
    } catch (error) {
      console.error("Failed to create history data:", error);
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
            <div className="bg-white p-6 rounded shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-full">
              <p className="text-lg font-medium">
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
