"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FaPlus,
  FaEdit,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaWhatsapp,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
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
      const anggotaId = sessionStorage.getItem("anggotaId");
      if (anggotaId) {
        try {
          const response = await GlobalApi.getUserById(anggotaId);
          setUserData(response);
          setCabang(response.cabang || "");
          setSelectedUnitKerja(response.unitKerja || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
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

    // Filter data cabang berdasarkan input
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
    // Tampilkan popup konfirmasi terlebih dahulu
    setIsPopupVisible(true);
  };

  const handleConfirmSave = async () => {
    const idAnggota = sessionStorage.getItem("anggotaId");

    if (!cabang || !selectedUnitKerja) {
      console.error("Cabang atau Unit Kerja tidak boleh kosong");
      alert("Silakan pilih Cabang dan Unit Kerja sebelum menyimpan.");
      setIsPopupVisible(false); // Tutup popup
      return;
    }

    try {
      const response = await GlobalApi.mutasiCabangUnitKerja(
        idAnggota,
        cabang,
        selectedUnitKerja
      );

      toast.success(
        `Data disimpan: Cabang: ${cabang}, Unit Kerja: ${selectedUnitKerja}`
      );
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
      setIsPopupVisible(false); // Tutup popup setelah proses selesai
    }
  };

  const handleCancelSave = () => {
    setIsPopupVisible(false); // Tutup popup jika user membatalkan
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
      if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target)) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Toaster
        toastOptions={{
          style: {
            marginTop: "16%",
            fontSize: "1.75rem", // Ukuran font
            padding: "10px", // Padding kecil
            width: "80%", // Lebar penuh
            maxWidth: "700px", // Lebar maksimal
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)", // Pusatkan dengan benar
            textAlign: "center", // Teks di tengah horizontal
            zIndex: 9999, // Memastikan toast berada di atas elemen lain
            backgroundColor: "#fff", // Warna latar (opsional)
            borderRadius: "8px", // Sudut melengkung untuk estetika
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Bayangan halus
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
      <div className="bg-white p-4 rounded shadow-lg w-2/4">
        <h2 className="text-lg font-bold">Pindah Cabang dan Unit Kerja</h2>

        <div className="mb-4" ref={dropdownRef}>
          <label className="block mb-1">Cabang:</label>
          <Input
            id="cabangInput"
            type="text"
            className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
            placeholder="Pilih Cabang"
            value={cabang}
            readOnly
          onClick={handleOpenCabangDropdown}
          />
          {showDropdownCabangUnit && (
            <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-[47%]">
              {/* Input Pencarian */}
              <Input
                type="text"
                className="border-b p-2 bg-white"
                placeholder="Cari Cabang"
                value={searchTerm}
                onChange={handleCabangSearch}
                autoFocus
              />
              {/* List Hasil Pencarian */}
              <ul className="max-h-48 overflow-y-auto">
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

        <div className="mb-4" ref={unitKerjaRef}>
          <label className="block mb-1">Unit Kerja:</label>
          <Input
            type="text"
            className="border border-gray-300 rounded w-full p-2 cursor-pointer"
            placeholder="Pilih Unit Kerja"
            value={selectedUnitKerja}
            readOnly
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          />
          {isDropdownVisible && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-[47%]">
              <Input
                type="text"
                placeholder="Cari Unit Kerja..."
                className="border border-gray-300 rounded w-full p-2"
                onChange={handleUnitKerjaSearch}
                autoFocus
              />
              <ul className="max-h-60 overflow-y-auto">
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
            className="bg-teal-700 hover:bg-teal-500 mr-2"
            onClick={handleSaveCabangUnit}
          >
            Simpan
          </Button>
          <Button
            type="button"
            onClick={handleCancelCabangUnit}
            className="bg-red-500 hover:bg-red-700"
          >
            Batal
          </Button>
        </div>
        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p className="text-lg font-medium">
                Apakah Anda yakin ingin menyimpan?
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded mr-2"
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
