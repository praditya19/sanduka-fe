"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faUser,
  faPlusCircle,
  faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Badge } from "@/components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
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

const VerifikasiAnggotaMutasi = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cabang, setCabang] = useState([]);
  const [unitKerja, setUnitKerja] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [anggotaData, setAnggotaData] = useState([]);
  const [anggotaUnverifiedCount, setAnggotaUnverifiedCount] = useState(0);
  const [
    anggotaUnverifiedCountSuperAdmin,
    setAnggotaUnverifiedCountSuperAdmin,
  ] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [fotoBase64, setFotoBase64] = useState("");
  const [SelectedRowIndex, setSelectedRowIndex] = useState(null);
  const [nama, setNama] = useState("");
  const [notification, setNotification] = useState(null);

  const fetchDataAnggota = async (
    page = 0,
    size = 10,
    cabang = "",
    unitKerja = "",
    keyword = ""
  ) => {
    try {
      const response = await GlobalApi.getUnverifiedUsers(
        page,
        size,
        cabang,
        unitKerja,
        keyword
      );

      const fetchedData = response.data.content;

      const fotoBase64Array = [];

      if (fetchedData && fetchedData.length > 0) {
        fetchedData.forEach((item) => {
          if (item.foto) {
            try {
              const decodedString = atob(item.foto);
              fotoBase64Array.push(decodedString);
            } catch (error) {
              console.error("Error decoding Base64:", error);
              fotoBase64Array.push(null);
            }
          } else {
            fotoBase64Array.push(null);
          }
        });
      } else {
        console.warn("No data found.");
      }

      setAnggotaData(fetchedData || []);
      setFotoBase64(fotoBase64Array);
      setTotalPages(response.data.totalPages || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching anggota data:", error);
    }
  };

  const handleCreateHistory = async () => {
    if (!selectedRow) return;

    const now = new Date();
    const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = now.toISOString().split("T")[0];
    const jam = now.toTimeString().split(" ")[0];
    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();

    const userData = selectedRow;
    const userRole = sessionStorage.getItem("role");
    const namaLengkapUser =
      userRole === "USER"
        ? userData.namaLengkap
        : sessionStorage.getItem("nama");

    const historyData = {
      hari,
      tanggal,
      jam,
      npa: userData.npaPgri,
      nama: userData.namaLengkap,
      cabang: userData.cabang,
      uraian: "Anggota Sudah Diverifikasi",
      masuk: userData.cabang,
      keluar: "",
      bulan,
      tahun,
      cabang_ke_2: "",
      user: namaLengkapUser,
    };

    try {
      await GlobalApi.createHistoryData(historyData);
    } catch (error) {
      console.error("Gagal menyimpan riwayat verifikasi:", error);
    }
  };

  const updateVerifyUser = async (userId) => {
    try {
      const response = await GlobalApi.verifyUser(userId);
      setNotification({
        type: "success",
        message: `Anggota Berhasil Diverifikasi!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error verifying user:", error);
      setNotification({
        type: "error",
        message: `Anggota Gagal Diverifikasi!`,
      });
    }
  };

  const rejectUser = async (userId) => {
    try {
      const response = await GlobalApi.RejectUser(userId);
      setNotification({
        type: "success",
        message: `Anggota Berhasil Dihapus!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error rejecting user:", error);
      setNotification({
        type: "error",
        message: `Gagal Menghapus Anggota!`,
      });
    }
  };

  const fetchData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabang(response.data);
    } catch (error) {
      console.error("Error fetching cabang:", error);
    }
  };

  const fetchUnitKerja = async () => {
    try {
      const response = await GlobalApi.getUnitKerja();
      setUnitKerja(response.data);
    } catch (error) {
      console.error("Error fetching unit kerja:", error);
    }
  };

  const fetchUnverifiedUsersCountByCabang = async (cabang = "") => {
    try {
      const response = await GlobalApi.getUnverifiedUsersCountByCabang(cabang);
      setAnggotaUnverifiedCount(response.data || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching anggota data:", error);
    }
  };

  const fetchUnverifiedUsersCountBySuperAdmin = async () => {
    try {
      const response = await GlobalApi.getUnverifiedUsersCountSuperAdmin();
      setAnggotaUnverifiedCountSuperAdmin(response.unverifiedCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching anggota data:", error);
    }
  };

  const handleNamaChange = (e) => {
    const namaAnggota = e.target.value;
    setNama(namaAnggota);
    fetchDataAnggota(
      0,
      pageSize,
      selectedCabang,
      selectedUnitKerja,
      namaAnggota
    );
  };

  const handleCabangChange = (value) => {
    const selectedKecamatan = value;
    setSelectedCabang(selectedKecamatan);
    updateUnitKerja(selectedKecamatan);
    fetchDataAnggota(
      currentPage,
      pageSize,
      selectedKecamatan,
      selectedUnitKerja,
      nama
    );
    fetchUnverifiedUsersCountByCabang(selectedKecamatan);
  };

  const handleUnitKerjaChange = (value) => {
    setSelectedUnitKerja(value);
    fetchDataAnggota(currentPage, pageSize, selectedCabang, value, nama);
  };

  const updateUnitKerja = (kecamatan) => {
    const filteredUnitKerja = unitKerja.filter(
      (item) => item.cabang === kecamatan
    );
    setFilteredUnitKerja(filteredUnitKerja);
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!token) {
        router.push("/sign-in");
      } else {
        setLoading(false);
        fetchData();
        fetchUnitKerja();

        const role = sessionStorage.getItem("role");
        const cabangFromSession = sessionStorage.getItem("cabang") || "";
        if (role === "ADMIN" && cabangFromSession) {
          setSelectedCabang(cabangFromSession);
          handleCabangChange(cabangFromSession);
          fetchUnverifiedUsersCountByCabang(cabangFromSession);
        } else {
          fetchDataAnggota(currentPage, pageSize, selectedCabang);
          fetchUnverifiedUsersCountBySuperAdmin();
        }

        const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
        setIsSidebarOpen(sidebarState);

        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }
    };

    initializeData();
  }, [token, router, currentPage, pageSize]);

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

  const handleUserClick = (rowId, index) => {
    const row = anggotaData.find((item) => item.id === rowId);
    setSelectedRow(row);
    setSelectedRowIndex(index);
  };

  const handleClosePopup = () => {
    setSelectedRow(null);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchDataAnggota(
      newPage,
      pageSize,
      selectedCabang,
      selectedUnitKerja,
      nama
    );
  };

  const handleSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    fetchDataAnggota(0, newSize, selectedCabang, selectedUnitKerja, nama);
  };

  const handleSearchClick = () => {
    setCurrentPage(0);
    fetchDataAnggota(0, pageSize, selectedCabang, selectedUnitKerja, nama);
  };

  const handleVerifyUserClick = async (rowId) => {
    try {
      await handleCreateHistory();
      await updateVerifyUser(rowId);
    } catch (error) {
      console.error("Gagal memverifikasi anggota:", error);
    }
  };

  const handleRejectUserClick = (rowId) => {
    rejectUser(rowId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="container mx-auto p-4 md:p-6">
            <FilterSection
              cabang={cabang}
              unitKerja={filteredUnitKerja}
              selectedCabang={selectedCabang}
              handleCabangChange={handleCabangChange}
              handleUnitKerjaChange={handleUnitKerjaChange}
              handleSearchClick={handleSearchClick}
              handleNamaChange={handleNamaChange}
              nama={nama}
              anggotaUnverifiedCount={anggotaUnverifiedCount}
              anggotaUnverifiedCountSuperAdmin={
                anggotaUnverifiedCountSuperAdmin
              }
            />

            <div className="overflow-x-auto">
              <DataTable
                anggotaData={anggotaData}
                handleUserClick={handleUserClick}
                fotoBase64={fotoBase64}
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>
      {selectedRow && (
        <PopupDetail
          selectedRow={selectedRow}
          handleClosePopup={handleClosePopup}
          fotoBase64={fotoBase64}
          handleVerifyUserClick={handleVerifyUserClick}
          handleRejectUserClick={handleRejectUserClick}
        />
      )}
    </div>
  );
};

const FilterSection = ({
  cabang,
  selectedCabang,
  selectedUnitKerja,
  handleCabangChange,
  handleUnitKerjaChange,
  handleNamaChange,
  nama,
  anggotaUnverifiedCount,
  anggotaUnverifiedCountSuperAdmin,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-16 text-sm">
    <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
      <div className="w-full md:w-auto">
        <DropdownCabang
          label="Cabang"
          options={cabang}
          selectedCabang={selectedCabang}
          handleChange={handleCabangChange}
        />
      </div>
      <div className="w-full md:w-auto">
        <DropdownUnitKerja
          label="Unit Kerja"
          selectedCabang={selectedCabang}
          selectedUnitKerja={selectedUnitKerja}
          handleChange={handleUnitKerjaChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="searchInput" className="font-semibold text-gray-800">
          Cari Anggota
        </label>
        <div className="w-full">
          <input
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0 w-56"
            type="text"
            placeholder="Cari Anggota"
            value={nama}
            onChange={handleNamaChange}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
        {selectedCabang && Object.entries(anggotaUnverifiedCount).length > 0 ? (
          Object.entries(anggotaUnverifiedCount).map(([cabang, count]) => {
            return (
              <div key={cabang} className="w-full md:w-auto self-start">
                <p className="w-72 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg p-3 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out transform">
                  Anggota Belum Terverifikasi: {count || 0}{" "}
                </p>
              </div>
            );
          })
        ) : (
          <div className="w-full md:w-auto self-start">
            <p className="w-80 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg p-3 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out transform">
              Anggota Belum Terverifikasi:{" "}
              {anggotaUnverifiedCountSuperAdmin || 0}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const DropdownCabang = ({ label, options, selectedCabang, handleChange }) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const roleFromSession = sessionStorage.getItem("role");
    const cabangFromSession = sessionStorage.getItem("cabang") || "";

    if (roleFromSession === "ADMIN") {
      setIsDisabled(true);
      setQuery(cabangFromSession);
      handleChange(cabangFromSession);
    }
  }, []);

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
  //   const roleFromSession = sessionStorage.getItem("role");
  //   const cabangFromSession = sessionStorage.getItem("cabang") || "";

  //   if (roleFromSession === "ADMIN") {
  //     setIsDisabled(true);
  //     setQuery(cabangFromSession);
  //     handleChange(cabangFromSession); // Trigger perubahan ke handler
  //   }
  // }, [handleChange]);

  const filteredOptions = options.filter((option) =>
    option.kecamatan.toLowerCase().includes(filterQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isDisabled) {
      setQuery(selectedCabang);
    }
  }, [selectedCabang]);

  return (
    <div className="relative inline-block w-56" ref={dropdownRef}>
      <label className="block mb-2 font-semibold text-gray-800">{label}</label>
      <input
        type="text"
        className="border rounded-lg p-2 w-full bg-white shadow-sm"
        placeholder={`Pilih ${label}`}
        value={isDisabled ? sessionStorage.getItem("cabang") : query}
        readOnly
        onFocus={() => {
          if (!isDisabled) {
            setQuery("");
            setShowDropdown(true);
            setFilterQuery("");
          }
        }}
        disabled={isDisabled}
      />

      {showDropdown && !isDisabled && (
        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-full">
          <ul className="max-h-44 overflow-y-auto">
            <li className="py-2 px-2">
              <input
                type="text"
                className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Filter ${label}`}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                autoFocus
              />
            </li>

            <li
              key="default-option"
              className="p-2 cursor-pointer hover:bg-gray-100 font-semibold text-gray-600"
              onClick={() => {
                setQuery("");
                handleChange("");
                setShowDropdown(false);
                setFilterQuery("");
              }}
            >
              Pilih Cabang
            </li>

            {filteredOptions.length > 0 ? (
              filteredOptions
                .sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, "id"))
                .map((item) => (
                <li
                  key={item.idKecamatan}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setQuery(item.kecamatan);
                    handleChange(item.kecamatan);
                    setShowDropdown(false);
                    setFilterQuery("");
                  }}
                >
                  {item.kecamatan}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const DropdownUnitKerja = ({
  label,
  selectedCabang,
  selectedUnitKerja,
  handleChange,
}) => {
  const [query, setQuery] = React.useState(selectedUnitKerja || "");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [filterQuery, setFilterQuery] = React.useState("");
  const [unitKerja, setUnitKerja] = React.useState([]);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const fetchUnitKerja = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerja(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja:", error);
      }
    };

    fetchUnitKerja();
  }, []);

  const filteredOptions = unitKerja
    .filter((option) =>
      selectedCabang
        ? option.cabang.trim().toLowerCase() ===
        selectedCabang.trim().toLowerCase()
        : true
    )
    .filter((option) =>
      option.unitKerja.toLowerCase().includes(filterQuery.toLowerCase())
    );

  const handleOptionSelect = (item) => {
    setQuery(item.unitKerja || "");
    setShowDropdown(false);
    handleChange(item.unitKerja || "");
  };

  React.useEffect(() => {
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

  React.useEffect(() => {
    setQuery("");
  }, [selectedCabang]);

  return (
    <div className="relative inline-block w-56" ref={dropdownRef}>
      <label className="block mb-2 font-semibold text-gray-800">{label}</label>
      <input
        type="text"
        className={`border rounded-lg p-2 w-full bg-white shadow-sm ${!selectedCabang ? "bg-gray-200 cursor-not-allowed" : ""
          }`}
        placeholder={
          !selectedCabang ? "Pilih cabang terlebih dahulu" : `Pilih ${label}`
        }
        value={query}
        readOnly
        onFocus={() => {
          if (selectedCabang) {
            setFilterQuery("");
            setShowDropdown(true);
          }
        }}
        disabled={!selectedCabang}
      />

      {showDropdown && (
        <div className="absolute z-50 border rounded-lg bg-white shadow-sm mt-1 w-full">
          <ul className="max-h-44 overflow-y-auto">
            {unitKerja.length === 0 ? (
              <div className="p-2 text-gray-500">Loading...</div>
            ) : (
              <>
                <li className="py-2 px-2">
                  <input
                    type="text"
                    className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Filter ${label}`}
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    autoFocus
                  />
                </li>
                <li
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOptionSelect({ unitKerja: "" })}
                >
                  Pilih Unit Kerja
                </li>
                {filteredOptions
                  .sort((a, b) => a.unitKerja.localeCompare(b.unitKerja, "id"))
                  .map((item) => (
                  <li
                    key={item.id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleOptionSelect(item)}
                  >
                    {item.unitKerja}
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const DataTable = ({
  anggotaData,
  handleUserClick,
  fotoBase64,
  currentPage,
  pageSize,
  loading,
}) => {
  const currentPageNumber = Number(currentPage) || 0;
  const pageSizeNumber = Number(pageSize) || 10;
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const profileImageUrl = "/profile.png";
  const [zoomedImage, setZoomedImage] = useState(null);

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

  const toggleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const formatCreatedAt = (createdAt) => {
    const date = new Date(
      createdAt[0],
      createdAt[1] - 1,
      createdAt[2],
      createdAt[3],
      createdAt[4],
      createdAt[5]
    );

    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const dayName = dayNames[date.getDay()];

    const formattedDate = date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return `${dayName}, ${formattedDate}\npukul ${formattedTime}`;
  };

  return (
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
      <thead className="bg-teal-700 text-white text-center">
        <tr>
          <th className="p-2 md:p-3 border">No</th>
          {isMobile && <th className="p-2 md:p-3 border">Foto & Nama</th>}
          {!isMobile && <th className="p-2 md:p-3 border">Foto</th>}
          <th className="p-2 md:p-3 border">Registrasi</th>
          {!isMobile && (
            <>
              <th className="p-2 md:p-3 border">Data Anggota</th>
              <th className="p-2 md:p-3 border">Status</th>
              <th className="p-2 md:p-3 border">Aksi</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="9" className="py-4 px-4 text-center text-gray-600">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "10vh",
                }}
              >
                <ClipLoader color="#3498db" size={50} />
              </div>
            </td>
          </tr>
        ) : anggotaData.length === 0 ? (
          <tr>
            <td colSpan="9" className="py-4 px-4 text-center text-gray-600">
              <span>Tidak Ada Anggota</span>
            </td>
          </tr>
        ) : (
          anggotaData.map((item, index) => {
            const nomorUrut = currentPageNumber * pageSizeNumber + index + 1;
            return (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-gray-50 text-sm cursor-pointer text-center">
                  <td className="py-2 px-4 border">
                    <div className="flex justify-between items-center">
                      <span>{nomorUrut}</span>
                      {isMobile && (
                        <FontAwesomeIcon
                          icon={
                            expandedRow === index ? faMinusCircle : faPlusCircle
                          }
                          className="text-blue-500 cursor-pointer"
                          size="lg"
                          onClick={() => toggleExpandRow(index)}
                        />
                      )}
                    </div>
                  </td>
                  {isMobile ? (
                    <td className="py-2 px-4 border">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity rounded-md">
                          <Image
                            onClick={() => setZoomedImage(
                              fotoBase64[index] ? `data:image/jpeg;base64,${fotoBase64[index]}` : profileImageUrl
                            )}
                            src={
                              fotoBase64[index]
                                ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                : profileImageUrl
                            }
                            width={60}
                            height={60}
                            alt="Anggota Foto"
                            className="object-cover w-full h-full"
                            unoptimized={true}
                          />
                        </div>
                      </div>
                    </td>
                  ) : (
                    <td className="py-2 px-2 border">
                      <div className="flex items-center justify-center">
                        <div className="w-20 h-20 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity rounded-md">
                          <Image
                            onClick={() => setZoomedImage(
                              fotoBase64[index] ? `data:image/jpeg;base64,${fotoBase64[index]}` : profileImageUrl
                            )}
                            src={
                              fotoBase64[index]
                                ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                : profileImageUrl
                            }
                            width={60}
                            height={60}
                            alt="Anggota Foto"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-2 border whitespace-pre-line">
                    {formatCreatedAt(item.createdAt)}
                  </td>
                  {!isMobile && (
                    <>
                      <td className="py-2 px-4 border whitespace-pre-line">
                        {`${item.namaLengkap}\n${item.npaPgri}\n${item.cabang}\n${item.unitKerja}`}
                      </td>
                      <td className="py-2 px-4 border">
                        {!item.isVerified && (
                          <Badge variant="destructive">
                            <FontAwesomeIcon
                              icon={faTimesCircle}
                              className="mr-2 p-1 text-white"
                              size="lg"
                            />
                            <span>Belum Terverifikasi</span>
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        <FontAwesomeIcon
                          icon={faUser}
                          size="lg"
                          className="text-yellow-500 cursor-pointer"
                          onClick={() => handleUserClick(item.id, index)} // Pass the index here
                        />
                      </td>
                    </>
                  )}
                </tr>
                {expandedRow === index && (
                  <tr>
                    <td colSpan="9" className="px-4 py-4 bg-gray-50">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                          <div className="text-left">
                            <h3 className="font-semibold">Nama Lengkap:</h3>
                            <p>{item.namaLengkap}</p>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Email:</h3>
                            <p>{item.email}</p>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">NPA PGRI:</h3>
                            <p>{item.npaPgri}</p>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Tanggal Lahir:</h3>
                            <p>
                              {new Intl.DateTimeFormat("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                                .format(new Date(item.tanggalLahir))
                                .replace(/\//g, "-")}
                            </p>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Cabang:</h3>
                            <p>{item.cabang}</p>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Unit Kerja:</h3>
                            <p>{item.unitKerja}</p>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Status:</h3>
                            {!item.isVerified && (
                              <Badge variant="destructive">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  className="mr-2 text-white"
                                  size="lg"
                                />
                                <span>Belum Terverifikasi</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">Aksi:</h3>
                            <FontAwesomeIcon
                              icon={faUser}
                              size="lg"
                              className="text-yellow-500 cursor-pointer"
                              onClick={() => handleUserClick(item.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {zoomedImage && (
                  <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setZoomedImage(null)}
                  >
                    <div className="relative flex flex-col items-center animate-in zoom-in duration-200">
                      <button
                        className="absolute -top-3 -right-3 bg-white text-gray-600 hover:text-red-500 hover:bg-gray-100 shadow-md rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold z-50 border border-gray-200 transition-colors"
                        onClick={() => setZoomedImage(null)}
                      >
                        &times;
                      </button>
                      <img
                        src={zoomedImage}
                        alt="Zoomed Profil"
                        className="max-w-[250px] md:max-w-[400px] max-h-[85vh] object-contain rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </table>
  );
};

const PopupDetail = ({
  selectedRow,
  handleClosePopup,
  handleVerifyUserClick,
  handleRejectUserClick,
}) => {
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [decodedImage, setDecodedImage] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null); // STATE BARU UNTUK ZOOM
  const profileImageUrl = "/profile.png";

  useEffect(() => {
    if (selectedRow.foto) {
      try {
        const decodedString = atob(selectedRow.foto);
        setDecodedImage(`data:image/jpeg;base64,${decodedString}`);
      } catch (error) {
        console.error("Error decoding Base64:", error);
      }
    }
  }, [selectedRow.foto]);

  const handleRejectConfirmation = () => {
    setShowConfirmReject(false);
    handleRejectUserClick(selectedRow.id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 transition-opacity duration-300 ease-in-out z-50">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Detail Anggota
          </h2>
          <button
            onClick={handleClosePopup}
            className="text-red-500 hover:text-gray-900 transition-colors duration-300 ease-in-out"
          >
            <FontAwesomeIcon icon={faTimesCircle} size="lg" />
          </button>
        </div>

        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 overflow-hidden rounded-md cursor-pointer hover:opacity-80 transition-opacity shadow-sm">
              <Image
                onClick={() => setZoomedImage(decodedImage || profileImageUrl)}
                src={decodedImage || profileImageUrl}
                width={80}
                height={80}
                alt="Anggota Foto"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Verification Badge */}
          <div className="text-center">
            {!selectedRow.isVerified && (
              <Badge variant="destructive" className="">
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="mr-1 p-1 text-white"
                  size="lg"
                />
                <span>Belum Terverifikasi</span>
              </Badge>
            )}
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 mb-4">
            <div>
              <p className="font-medium text-gray-600">Nama Lengkap:</p>
              <p>{selectedRow.namaLengkap}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Email:</p>
              <p>{selectedRow.email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">NPA PGRI:</p>
              <p>{selectedRow.npaPgri}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Tanggal Lahir:</p>
              <p>
                {selectedRow.tanggalLahir 
                  ? new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                      .format(new Date(selectedRow.tanggalLahir))
                      .replace(/\//g, "-")
                  : "-"}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium text-gray-600">Cabang:</p>
              <p>{selectedRow.cabang}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Unit Kerja:</p>
              <p>{selectedRow.unitKerja}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Nomor Hp:</p>
              {selectedRow.nomorHp ? (
                <a
                  href={`https://wa.me/${selectedRow.nomorHp.replace(
                    /^0/,
                    "62"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-green-500"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="mr-2" size="lg" />
                  <span>{selectedRow.nomorHp}</span>
                </a>
              ) : (
                <p>-</p>
              )}
            </div>

            <div>
              <p className="font-medium text-gray-600 mr-4">Status:</p>
              <div className="flex text-center justify-between px-1">
                <Button className="w-24 hover:bg-green-600" onClick={() => handleVerifyUserClick(selectedRow.id)}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size="2xl"
                    className="cursor-pointer"
                  />
                </Button>
                <Button
                  className="w-24 bg-red-500 hover:bg-red-600"
                  onClick={() => setShowConfirmReject(true)}
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="2xl"
                    className="cursor-pointer"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmReject && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <p className="text-center text-gray-800 font-semibold mb-4">
              Apa Anda yakin tidak memverifikasi Anggota ini?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleRejectConfirmation}
              >
                Ya
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={() => setShowConfirmReject(false)}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP ZOOM GAMBAR */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative flex flex-col items-center animate-in zoom-in duration-200">
            <button
              className="absolute -top-3 -right-3 bg-white text-gray-600 hover:text-red-500 hover:bg-gray-100 shadow-md rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold z-50 border border-gray-200 transition-colors"
              onClick={() => setZoomedImage(null)}
            >
              &times;
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed Profil"
              className="max-w-[250px] md:max-w-[400px] max-h-[85vh] object-contain rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 4;
    let startPage = Math.max(1, currentPage);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4 gap-1">
      <button
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
      >
        First
      </button>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
        className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
      >
        Prev
      </button>

      {getVisiblePages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page - 1)}
          className={`px-3 py-1 border rounded text-sm ${page - 1 === currentPage
            ? "bg-blue-500 text-white"
            : "bg-white hover:bg-gray-50"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
      >
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
      >
        Last
      </button>
    </div>
  );
};

export default VerifikasiAnggotaMutasi;

// "use client";
// import React from "react";
// import Image from "next/image";
// import { FaTools } from "react-icons/fa";

// export default function MaintenancePage() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
//       <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full">
//         <div className="flex justify-center mb-6 animate-bounce">
//           <FaTools className="text-6xl text-yellow-500" />
//         </div>
//         <h1 className="text-2xl font-bold text-gray-800 mb-4">
//           Situs Sedang Dalam Perbaikan
//         </h1>
//         <p className="text-gray-600 mb-6">
//           Kami sedang melakukan perawatan sistem untuk meningkatkan layanan.
//           <br />
//           Silakan kembali lagi nanti.
//         </p>
//       </div>
//       <p className="mt-8 text-gray-500 text-sm">
//         &copy; {new Date().getFullYear()} Sanduka. Semua Hak Dilindungi.
//       </p>
//     </div>
//   );
// }