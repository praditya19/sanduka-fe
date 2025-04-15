"use client";
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
import { Plus } from "lucide-react";

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
  const tableRef = useRef();
  const [notification, setNotification] = useState(null);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [nominal, setNominal] = useState("");
  const [rawNominal, setRawNominal] = useState("");
  const [keteranganOptions, setKeteranganOptions] = useState([]);
  const [isManualInput, setIsManualInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAddClick = () => {
    setShowDropdown(true);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmitForm = async () => {
    const now = new Date();
    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();

    const payload = {
      propinsi: selectedOption === "Provinsi" ? selectedOption : "",
      kabupaten: selectedOption === "Kabupaten" ? selectedOption : "",
      cabang: selectedOption === "Cabang" ? selectedOption : "",
      keterangan: keterangan,
      jumlahNominal: rawNominal,
      bulan: bulan,
      tahun: tahun,
    };

    try {
      await GlobalApi.postLainlain(payload);
      setNotification({
        type: "success",
        message: "Data berhasil disimpan!",
      });
      setShowDropdown(false);
      setSelectedOption("");
      setKeterangan("");
      setNominal("");
      fetchLainLainData();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      setNotification({
        type: "error",
        message: "Gagal menyimpan data. Silakan coba lagi.",
      });
    }
  };

  const fetchLainLainData = async () => {
    try {
      const response = await GlobalApi.getLainlain();
      setFilteredTableData(response);
    } catch (error) {
      console.error("Gagal mengambil data Lain-lain:", error);
    }
  };

  const fetchKeteranganOptions = async () => {
    try {
      const response = await GlobalApi.getKeteranganLainlain();
      setKeteranganOptions(response);
    } catch (error) {
      console.error("Gagal mengambil data keterangan:", error);
    }
  };

  const handleUpdate = (id) => {
    const item = filteredTableData.find((i) => i.id === id);
    if (!item) return;

    const tipe = item.propinsi
      ? "Provinsi"
      : item.kabupaten
      ? "Kabupaten"
      : item.cabang
      ? "Cabang"
      : "";

    setSelectedOption(tipe);
    setKeterangan(item.keterangan);
    setRawNominal(item.jumlahNominal?.toString() || "");
    setNominal(`Rp ${parseInt(item.jumlahNominal).toLocaleString("id-ID")}`);

    setIsEditing(true);
    setEditingId(id);
    setShowDropdown(true);
  };

  const handleUpdateForm = async () => {
    if (!selectedOption || !keterangan || !rawNominal) {
      alert("Semua field wajib diisi.");
      return;
    }

    const updatedData = {
      propinsi: selectedOption === "Provinsi" ? selectedOption : "",
      kabupaten: selectedOption === "Kabupaten" ? selectedOption : "",
      cabang: selectedOption === "Cabang" ? selectedOption : "",
      keterangan: keterangan,
      jumlahNominal: rawNominal,
      bulan: bulan,
      tahun: tahun,
    };

    try {
      if (isEditing && editingId) {
        await GlobalApi.updateLainlain(editingId, updatedData);
        setNotification({
          type: "success",
          message: "Data berhasil diupdate!",
        });
      }

      fetchLainLainData();
      setSelectedOption("");
      setKeterangan("");
      setRawNominal("");
      setNominal("");
      setIsEditing(false);
      setEditingId(null);
      setShowDropdown(false);
      setIsManualInput(false);
    } catch (error) {
      console.error("Gagal simpan/update:", error);
      setNotification({
        type: "error",
        message: "Gagal mengupdate data. Silakan coba lagi.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await GlobalApi.deleteLainlain(id);
      setNotification({
        type: "success",
        message: "Data berhasil dihapus!",
      });
      fetchLainLainData();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      setNotification({
        type: "error",
        message: "Gagal menghapus data. Silakan coba lagi.",
      });
    }
  };

  useEffect(() => {
    fetchLainLainData();
    fetchKeteranganOptions();
    setIsManualInput(false);
    setKeterangan("");
  }, []);

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

  const printTable = () => {
    const printContent = tableRef.current;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;

    window.print();

    document.body.innerHTML = originalContent;
    window.location.reload();
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
              <h1 className="text-base">Lain - Lain</h1>
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
              <h1 className="text-base">Lain - Lain</h1>
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
          <div className="min-h-screen bg-gray-50 p-2 md:p-4">
            <div className="p-6 rounded-lg shadow-lg border border-gray-200 bg-white">
              <h2 className="bg-teal-700 text-2xl text-white font-bold py-2 px-4 rounded mb-5 text-center">
                Lain - Lain
              </h2>

              {!showDropdown ? (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleAddClick}
                    className="text-white bg-teal-700 hover:bg-teal-800 p-6 rounded-full shadow-lg focus:outline-none"
                  >
                    <Plus size={48} />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Pilih Tipe:
                    </label>
                    <select
                      value={selectedOption}
                      onChange={handleOptionChange}
                      className="w-full border border-gray-300 p-2 rounded-md"
                    >
                      <option value="">-- Pilih --</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Kabupaten">Kabupaten</option>
                      <option value="Cabang">Cabang</option>
                    </select>
                  </div>

                  {selectedOption && (
                    <>
                      <div>
                        <label className="block mb-2 font-medium text-gray-700">
                          Keterangan
                        </label>

                        {!isManualInput ? (
                          <select
                            value={keterangan}
                            onChange={(e) => {
                              if (e.target.value === "__manual__") {
                                setKeterangan("");
                                setIsManualInput(true);
                              } else {
                                setKeterangan(e.target.value);
                              }
                            }}
                            className="w-full border border-gray-300 p-2 rounded-md"
                          >
                            <option value="">-- Pilih Keterangan --</option>
                            {keteranganOptions.map((item, idx) => (
                              <option key={idx} value={item}>
                                {item}
                              </option>
                            ))}
                            <option value="__manual__">+ Tambah Manual</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded-md mt-2"
                            placeholder="Masukkan keterangan manual"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-gray-700">
                          Nominal
                        </label>
                        <input
                          type="text"
                          value={nominal}
                          onChange={(e) => {
                            let input = e.target.value.replace(/[^0-9]/g, "");

                            setRawNominal(input);
                            setNominal(
                              input
                                ? `Rp ${parseInt(input).toLocaleString(
                                    "id-ID"
                                  )}`
                                : ""
                            );
                          }}
                          className="w-full border border-gray-300 p-2 rounded-md"
                          placeholder="Masukkan nominal"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-center space-x-4 mt-6">
                    <button
                      onClick={isEditing ? handleUpdateForm : handleSubmitForm}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      {isEditing ? "Update" : "Simpan"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setSelectedOption("");
                        setKeterangan("");
                        setNominal("");
                      }}
                      className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-end justify-end mt-2 md:mt-0 gap-4">
              <Button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out mt-3 mr-6 w-24 gap-2"
                onClick={printTable}
              >
                <span>Cetak</span>
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
              </Button>
            </div>
            <div ref={tableRef} className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-sm text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center">
                      No
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Keterangan
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Nominal
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableData && filteredTableData.length > 0 ? (
                    filteredTableData.map((item, index) => {
                      const kategori =
                        item.propinsi || item.kabupaten || item.cabang;

                      return (
                        <tr
                          key={item.id}
                          className="border px-2 py-2 text-sm text-black"
                        >
                          <td className="px-6 py-4 border text-sm text-gray-800 text-center">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 border text-sm text-gray-800 text-center">
                            {kategori}
                          </td>
                          <td className="border px-6 py-4 text-center text-sm text-black">
                            {item.keterangan}
                          </td>
                          <td className="px-6 py-4 text-center border text-sm text-gray-800">
                            {formatRupiah(item.jumlahNominal)}
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
                      );
                    })
                  ) : (
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td
                        className="border px-6 py-4 text-sm text-black text-center"
                        colSpan={5}
                      >
                        Data Tidak Ditemukan
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
  );
}

export default KalenderForm;
