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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [fotoBase64, setFotoBase64] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [nama, setNama] = useState("");

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

  const updateVerifyUser = async (userId) => {
    try {
      const response = await GlobalApi.verifyUser(userId);
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
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <h3
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Anggota Berhasil Diverifikasi!
          </h3>
        </div>,
        {
          icon: null,
          duration: 2000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
      toast.error(
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
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Anggota Gagal Diverifikasi.
          </h3>
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
    }
  };

  const rejectUser = async (userId) => {
    try {
      const response = await GlobalApi.RejectUser(userId);
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
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <h3
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Pengguna berhasil diHapus!
          </h3>
        </div>,
        {
          icon: null,
          duration: 2000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
      toast.error(
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
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal Menghapus Pengguna.
          </h3>
        </div>,
        {
          icon: null,
          duration: 2000,
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
      setAnggotaUnverifiedCount(response.data);
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
          fetchDataAnggota(currentPage, pageSize);
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

  const handleVerifyUserClick = (rowId) => {
    updateVerifyUser(rowId);
  };

  const handleRejectUserClick = (rowId) => {
    rejectUser(rowId);
  };

  const handleResetClick = () => {
    setSelectedCabang("");
    setSelectedUnitKerja("");
    setFilteredUnitKerja([]);
    setNama("");
    fetchDataAnggota(currentPage, pageSize, "", "", "");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
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
              handleResetClick={handleResetClick}
              handleNamaChange={handleNamaChange}
              nama={nama}
              anggotaUnverifiedCount={anggotaUnverifiedCount}
            />

            <div className="overflow-x-auto">
              <DataTable
                anggotaData={anggotaData}
                handleUserClick={handleUserClick}
                fotoBase64={fotoBase64}
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
        {Object.entries(anggotaUnverifiedCount).length > 0 ? (
          Object.entries(anggotaUnverifiedCount).map(([cabang, count]) => (
            <div key={cabang} className="w-full md:w-auto self-start">
              <p className="w-72 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg p-3 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out transform">
                Anggota Belum Terverifikasi: {count}
              </p>
            </div>
          ))
        ) : (
          <div className="w-full md:w-auto self-start">
            <p className="w-72 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg p-3 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out transform">
              Anggota Belum Terverifikasi:
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
      handleChange(cabangFromSession); // Tetap panggil hanya sekali saat komponen pertama kali render
    }
  }, []);

  useEffect(() => {
    // Set event listener untuk klik di luar dropdown
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

  // useEffect(() => {
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
    // Sinkronisasi query dengan selectedCabang jika bukan ADMIN
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
        disabled={isDisabled} // Input akan ter-disable jika role adalah ADMIN
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
              filteredOptions.map((item) => (
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
    setQuery(item.unitKerja || ""); // Jika kosong, set kembali ke default
    setShowDropdown(false);

    // Kirim "" ke handler hanya jika memilih "Pilih Unit Kerja"
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

  // Reset query when selectedCabang changes
  React.useEffect(() => {
    setQuery("");
  }, [selectedCabang]);

  return (
    <div className="relative inline-block w-56" ref={dropdownRef}>
      <label className="block mb-2 font-semibold text-gray-800">{label}</label>
      <input
        type="text"
        className="border rounded-lg p-2 w-full bg-white shadow-sm"
        placeholder={`Pilih ${label}`}
        value={query}
        readOnly
        onFocus={() => {
          setFilterQuery("");
          setShowDropdown(true);
        }}
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
                {filteredOptions.map((item) => (
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
}) => {
  const currentPageNumber = Number(currentPage) || 0;
  const pageSizeNumber = Number(pageSize) || 10;
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const profileImageUrl = "/profile.png";

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
      createdAt[0], // Tahun
      createdAt[1] - 1, // Bulan (0-based)
      createdAt[2], // Hari
      createdAt[3], // Jam
      createdAt[4], // Menit
      createdAt[5] // Detik
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

    const dayName = dayNames[date.getDay()]; // Ambil nama hari

    return `${dayName}, ${date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Format 24-jam
    })}`;
  };

  return (
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
      <thead className="bg-teal-700 text-white text-center">
        <tr>
          <th className="py-2 px-4 border-b">No</th>
          {isMobile && <th className="py-2 px-4 border-b">Foto & Nama</th>}
          {!isMobile && <th className="py-2 px-4 border-b">Foto</th>}
          <th className="py-2 px-4 border-b">Registrasi</th>
          {!isMobile && (
            <>
              <th className="py-2 px-4 border-b">Cabang</th>
              <th className="py-2 px-4 border-b">Unit Kerja</th>
              <th className="py-2 px-4 border-b">Nama</th>
              <th className="py-2 px-4 border-b">NPA PGRI</th>
              <th className="py-2 px-4 border-b">Status</th>

              <th className="py-2 px-4 border-b">Aksi</th>
            </>
          )}
          {/* {isMobile && <th className="py-2 px-4 border-b">Lihat Data</th>} */}
        </tr>
      </thead>
      <tbody>
        {(anggotaData || []).length === 0 ? (
          <tr>
            <td colSpan="9" className="py-4 px-4 text-center text-gray-600">
              Data tidak ditemukan
            </td>
          </tr>
        ) : (
          (anggotaData || []).map((item, index) => {
            const nomorUrut = currentPageNumber * pageSizeNumber + index + 1;
            return (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-gray-50 text-sm cursor-pointer text-center">
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-between items-center">
                      {/* Calculate the row number based on current page and page size */}
                      <td className="py-2 px-4 border-b">
                        {/* Hitung nomor urut berdasarkan halaman dan index */}
                        {nomorUrut}
                      </td>
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
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src={
                            fotoBase64[index]
                              ? `data:image/jpeg;base64,${fotoBase64[index]}`
                              : profileImageUrl
                          }
                          width={50}
                          height={50}
                          alt="Anggota Foto"
                          className="rounded"
                          unoptimized={true}
                        />
                        <div>{item.namaLengkap}</div>
                      </div>
                    </td>
                  ) : (
                    <td className="py-2 px-4 border-b">
                      <Image
                        src={
                          fotoBase64[index]
                            ? `data:image/jpeg;base64,${fotoBase64[index]}`
                            : profileImageUrl
                        }
                        width={50}
                        height={50}
                        alt="Anggota Foto"
                        className="rounded-full"
                      />
                    </td>
                  )}
                  <td className="px-4 py-2 border-b">
                    {formatCreatedAt(item.createdAt)}
                  </td>
                  {!isMobile && (
                    <>
                      <td className="py-2 px-4 border-b">{item.cabang}</td>
                      <td className="py-2 px-4 border-b">{item.unitKerja}</td>
                      <td className="py-2 px-4 border-b">{item.namaLengkap}</td>
                      <td className="py-2 px-4 border-b">{item.npaPgri}</td>

                      <td className="py-2 px-4 border-b">
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

                      <td className="px-4 py-2 border-b">
                        {/* <a
                        href={`https://wa.me/${item.nomorHp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon
                          icon={faWhatsapp}
                          className="text-green-500 mr-4"
                          size="lg"
                        />
                      </a>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size="lg"
                        className="text-green-500 mr-4 cursor-pointer"
                        onClick={() => handleVerifyUserClick(item.id)}
                      />
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        size="lg"
                        className="text-red-500 mr-4 cursor-pointer"
                        onClick={() => handleRejectUserClick(item.id)}
                      /> */}
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
                        {/* Foto di tengah atas */}
                        <div className="flex flex-col items-center justify-center">
                          <Image
                            src={
                              fotoBase64[index]
                                ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                : profileImageUrl
                            }
                            width={50}
                            height={50}
                            alt="Anggota Foto"
                            className="rounded-full"
                          />
                          <div>{item.namaLengkap}</div>
                        </div>
                        {/* Data dalam layout grid */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                          {/* Cabang di kiri */}
                          <div className="text-left">
                            <h3 className="font-semibold">Cabang:</h3>
                            <p>{item.cabang}</p>
                          </div>
                          {/* Unit kerja di kanan */}
                          <div className="text-left">
                            <h3 className="font-semibold">Unit Kerja:</h3>
                            <p>{item.unitKerja}</p>
                          </div>
                          {/* NPA PGRI di bawah cabang */}
                          <div className="text-left">
                            <h3 className="font-semibold">NPA PGRI:</h3>
                            <p>{item.npaPgri}</p>
                          </div>
                          {/* Aksi di bawah unit kerja */}
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
                        </div>
                        {/* Status di tengah bawah */}
                        <div className="text-center mt-4">
                          <h3 className="font-semibold">Aksi:</h3>
                          <FontAwesomeIcon
                            icon={faUser}
                            size="lg"
                            className="text-yellow-500 cursor-pointer"
                            onClick={() => handleUserClick(item.id)}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
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
  fotoBase64,
  handleVerifyUserClick,
  handleRejectUserClick,
  selectedRowIndex,
}) => {
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const profileImageUrl = "/profile.png";

  const handleRejectConfirmation = () => {
    setShowConfirmReject(false); // Close the confirmation pop-up
    handleRejectUserClick(selectedRow.id); // Trigger reject action
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50 transition-opacity duration-300 ease-in-out">
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
          {/* Profile Image */}
          <div className="flex justify-center">
            <Image
              src={
                fotoBase64[selectedRowIndex]
                  ? `data:image/jpeg;base64,${fotoBase64[selectedRowIndex]}`
                  : profileImageUrl
              }
              width={80}
              height={80}
              alt="Anggota Foto"
              className="rounded-full"
            />
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
              <p className="font-medium text-gray-600">NIK:</p>
              <p>{selectedRow.nik}</p>
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
              <a
                href={`https://wa.me/${selectedRow.nomorHp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-green-500"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="mr-2" size="lg" />
                <span>{selectedRow.nomorHp}</span>
              </a>
            </div>
            <div>
              <p className="font-medium text-gray-600 mr-4">Status:</p>
              <div className="flex text-center justify-between px-1">
                <Button className="w-24 hover:bg-green-600">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size="2xl"
                    className="cursor-pointer"
                    onClick={() => handleVerifyUserClick(selectedRow.id)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-60">
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
          className={`px-3 py-1 border rounded text-sm ${
            page - 1 === currentPage
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
