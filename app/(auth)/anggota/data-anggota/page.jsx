"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faPlusCircle,
  faMinusCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
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
  FaEdit,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaTimes,
  FaWhatsapp,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("../../../_components/MapComponent"),
  {
    ssr: false,
  }
);

const DataAnggota = () => {
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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [fotoBase64, setFotoBase64] = useState("");
  const [setSelectedRowIndex] = useState(null);
  const [nama, setNama] = useState("");
  const [status, setStatus] = React.useState("Aktif");
  const [role, setRole] = useState("");
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filesByNip, setFilesByNip] = useState([]);

  const fetchDataAnggota = async (
    page = 0,
    size = 10,
    cabang = null,
    unitKerja = null,
    keyword = null,
    statusKeanggotaan = "Aktif"
  ) => {
    setLoading(true);

    try {
      const response = await GlobalApi.getAllAnggota(
        page,
        size,
        cabang,
        unitKerja,
        keyword,
        statusKeanggotaan
      );

      const fetchedData = response.content;
      const fotoBase64Array = [];
      const filesByNipArray = [];

      if (fetchedData && fetchedData.length > 0) {
        fetchedData.forEach((item) => {
          console.log("NIP:", item.nip);
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

        const filePromises = fetchedData.map(async (item) => {
          try {
            const fileResponse = await GlobalApi.getFileByNip(item.nip);
            return fileResponse;
          } catch (error) {
            console.error(`Error fetching file for NIP ${item.nip}:`, error);
            return null;
          }
        });

        const resolvedFiles = await Promise.all(filePromises);
        filesByNipArray.push(...resolvedFiles);
      } else {
        console.warn("No data found.");
      }

      setAnggotaData(fetchedData || []);
      setFotoBase64(fotoBase64Array);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setFilesByNip(filesByNipArray);

      setLoading(false);
      return fetchedData || [];
    } catch (error) {
      console.error("Error fetching anggota data:", error);
      setLoading(false);
    }
  };

  const getUserById = async (userId) => {
    try {
      const response = await GlobalApi.getUserById(userId);
      setAnggotaData(response ? [response] : []);
    } catch (error) {
      console.error("Error fetching cabang:", error);
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

        const userId = sessionStorage.getItem("userId");
        const role = sessionStorage.getItem("role");
        const cabangFromSession = sessionStorage.getItem("cabang") || "";
        if (role === "ADMIN" && cabangFromSession) {
          setSelectedCabang(cabangFromSession);
          handleCabangChange(cabangFromSession);
        } else if (role === "USER") {
          getUserById(userId);
          setRole(role);
        } else {
          fetchDataAnggota(currentPage, pageSize, null, null, null, status);
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
  }, [token, router, currentPage, pageSize, status]);

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
    fetchDataAnggota(
      newPage,
      pageSize,
      selectedCabang,
      selectedUnitKerja,
      nama,
      status
    );
    setCurrentPage(newPage);
  };

  const handleSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    fetchDataAnggota(
      0,
      newSize,
      selectedCabang,
      selectedUnitKerja,
      nama,
      status
    );
  };

  const handleSearchClick = () => {
    setCurrentPage(0);
    fetchDataAnggota(0, pageSize, selectedCabang, selectedUnitKerja, nama);
  };

  const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length !== 3) {
      return "-";
    }

    const [year, month, day] = dateArray;
    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");
    return `${formattedDay}-${formattedMonth}-${year}`;
  };

  const calculateAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} tahun`;
  };

  const formatRetirementDate = (timestamp) => {
    const retirementDate = new Date(timestamp);

    const formattedRetirementDate = retirementDate
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    return formattedRetirementDate;
  };

  const handleEditClick = () => {
    router.push("/anggota/edit-anggota");
  };

  const handlePindahCabangUnit = () => {
    router.push("/anggota/data-anggota/mutasiCabangUnit");
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    fetchDataAnggota(
      0,
      pageSize,
      selectedCabang,
      selectedUnitKerja,
      nama,
      newStatus
    );
  };

  const formatCurrency = (amount) =>
    `Rp ${parseInt(amount).toLocaleString("id-ID")}`;

  const handlePrint = async () => {
    setIsLoading(true);
    try {
      const filteredDataForPrint = await fetchDataAnggota(
        currentPage,
        totalElements,
        selectedCabang,
        selectedUnitKerja,
        nama
      );

      if (!filteredDataForPrint || filteredDataForPrint.length === 0) {
        console.warn("No data available for printing.");
        return;
      }

      const printWindow = window.open("", "_blank", "width=800,height=600");

      const htmlContent = `
        <html>
          <head>
            <title>Data Anggota</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .title, .subtitle { text-align: center; margin-bottom: 10px; }
              .title { font-size: 28px; font-weight: bold; color: #00796b; }
              .subtitle { font-size: 20px; font-weight: normal; color: #555; }
              table { width: 100%; border-collapse: collapse; border: 1px solid #ccc; }
              th, td { padding: 8px; border: 1px solid #ccc; }
              .header-row th[colspan="2"] { text-align: center; }
              .total-row { font-weight: bold; background-color: #e0f2f1; }
            </style>
          </head>
          <body>
            <div class="title">Data Anggota Cabang ${selectedCabang}</div>
            <div class="subtitle">Jumlah Anggota: ${filteredDataForPrint.length
        }</div>
            <table>
              <thead>
                <tr class="header-row">
                  <th>No</th>
                  <th>Unit Kerja</th>
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>Tanggal Lahir</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                ${filteredDataForPrint
          .map(
            (item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                         <td>
                          <div>${item.cabang},</div>
                          <div>${item.unitKerja}</div>
                        </td>
                        <td>${item.foto
                ? `<img src="data:image/png;base64,${item.foto}" alt="foto" width="50" height="50"/>`
                : ""
              }</td>
                        <td>
                          <div class="font-bold">${item.namaLengkap}</div>
                          <div>${item.npaPgri}</div>
                        </td>
                        <td>
                          <div>${formatDate(item.tanggalLahir)} ${item.nip
              },</div>
                           <div>${item.jabatan}</div>
                          <div>${formatRetirementDate(
                item.prediksiPensiun
              )}</div>
                        </td>
                       
                        <td>
                          <div>${item.statusKeanggotaan
                ? item.statusKeanggotaan
                : "-"
              }</div>
                           <div>
  ${item.updatedAt
                ? `${item.updatedAt[2]}-${item.updatedAt[1]}-${item.updatedAt[0]}`
                : "-"
              }
</div>
                        </td>
                      </tr>
                    `
          )
          .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Error during print process:", error);
    } finally {
      setIsLoading(false);
    }
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
              handleStatusChange={handleStatusChange}
              status={status}
              role={role}
              handlePrint={handlePrint}
              totalElements={totalElements}
              isLoading={isLoading}
              pageSize={pageSize}
              handleSizeChange={handleSizeChange}
            />

            <div className="overflow-x-auto mt-8">
              <DataTable
                anggotaData={anggotaData}
                formatDate={formatDate}
                calculateAge={calculateAge}
                handleEditClick={handleEditClick}
                handlePindahCabangUnit={handlePindahCabangUnit}
                formatRetirementDate={formatRetirementDate}
                handleUserClick={handleUserClick}
                fotoBase64={fotoBase64}
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                filesByNip={filesByNip}
                fetchDataAnggota={fetchDataAnggota}
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
  handleStatusChange,
  status,
  role,
  handlePrint,
  totalElements,
  isLoading,
  pageSize,
  handleSizeChange
}) => {
  if (role === "USER") return null;

  return (
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
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0 w-44"
              type="text"
              placeholder="Cari Anggota"
              value={nama}
              onChange={handleNamaChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="searchInput" className="font-semibold text-gray-800">
            Status Anggota
          </label>
          <div className="w-full">
            <select
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-44"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Pensiun">Pensiun</option>
              <option value="Meninggal">Meninggal</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-center md:ml-20 ml-0">
          <p className="py-2 rounded focus:outline-none focus:shadow-outline w-44 text-base">
            Jumlah Anggota : {totalElements}
          </p>
        </div>

        <div className="flex w-full flex-col md:flex-row justify-end md:ml-40 ml-0 gap-2">
          {/* Show Entries */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center gap-2 ml-0 sm:-ml-20">
            <label className="text-sm text-gray-700 whitespace-nowrap">Show</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={pageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={150}>150</option>
              <option value={200}>200</option>
            </select>

          </div>

          {/* Tombol Cetak */}
          <Button
            className="px-8 mt-2 md:mt-0 flex items-center justify-center"
            variant="outline"
            onClick={handlePrint}
            disabled={role === "USER" || isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Cetak"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

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

  const filteredOptions = options.filter((option) =>
    option.kecamatan.toLowerCase().includes(filterQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isDisabled) {
      setQuery(selectedCabang);
    }
  }, [selectedCabang]);

  return (
    <div className="relative inline-block w-44" ref={dropdownRef}>
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
    <div className="relative inline-block w-44" ref={dropdownRef}>
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
  formatDate,
  calculateAge,
  formatRetirementDate,
  fotoBase64,
  currentPage,
  pageSize,
  handleEditClick,
  handlePindahCabangUnit,
  loading,
  filesByNip,
  fetchDataAnggota,
}) => {
  const currentPageNumber = Number(currentPage) || 0;
  const pageSizeNumber = Number(pageSize) || 20;
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPopupDaspen, setIsPopupDaspen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [popupVisibleKeluar, setPopupVisibleKeluar] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupVisibleAktifasi, setPopupVisibleAktifasi] = useState(false);
  const [kategoriDaspen, setKategoriDaspen] = useState("");
  const [daspenData, setDaspenData] = useState(null);
  const [isKategoriChanged, setIsKategoriChanged] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previousKategoriDaspen, setPreviousKategoriDaspen] =
    useState(kategoriDaspen);
  const profileImageUrl = "/profile.png";
  const router = useRouter();

  const handleOpenPopup = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const handleConfirmChange = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");

    if (anggotaId) {
      try {
        const userData = await GlobalApi.getUserById(anggotaId);

        if (userData) {
          const formatTanggal = (tanggal) => {
            const date = new Date(tanggal);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          const formattedTanggalLahir = formatTanggal(userData.tanggalLahir);
          const formattedTahunDiangkat = formatTanggal(userData.tahunDiangkat);
          const formattedMulaiJadiAnggota = formatTanggal(
            userData.mulaiJadiAnggotaPgri
          );

          const formData = new FormData();

          formData.append(
            "pesertaKtaDigital",
            userData.pesertaKtaDigital || ""
          );
          formData.append("pesertaDaspen", userData.pesertaDaspen || "");
          formData.append("mengajar", userData.mengajar || "");
          formData.append("golonganJabatan", userData.golonganJabatan || "");
          formData.append(
            "mulaiJadiAnggotaPgri",
            formattedMulaiJadiAnggota || ""
          );
          formData.append(
            "pendidikanTerakhir",
            userData.pendidikanTerakhir || ""
          );
          formData.append("pangkatGolongan", userData.pangkatGolongan || "");
          formData.append("tahunDiangkat", formattedTahunDiangkat || "");
          formData.append("statusPegawai", userData.statusPegawai || "");
          formData.append("sertifikatPendidik", userData.sertifikatPendidik);
          formData.append("statusSekolah", userData.statusSekolah || "");
          formData.append("tingkatSekolah", userData.tingkatSekolah || "");
          formData.append("jabatan", userData.jabatan || "");
          formData.append("unitKerja", userData.unitKerja || "");
          formData.append("cabang", userData.cabang || "");
          formData.append("foto", userData.foto || "");
          formData.append("namaAnak", JSON.stringify(userData.namaAnak || []));
          formData.append("namaSuamiIstri", userData.namaSuamiIstri || "");
          formData.append("nomorHp", userData.nomorHp || "");
          formData.append("kodePos", userData.kodePos || "");
          formData.append("longitude", userData.longitude || 0);
          formData.append("latitude", userData.latitude || 0);
          formData.append("alamat", userData.alamat || "");
          formData.append("golonganDarah", userData.golonganDarah || "");
          formData.append("agama", userData.agama || "");
          formData.append("jenisKelamin", userData.jenisKelamin || "");
          formData.append("kategoriDaspen", kategoriDaspen);
          formData.append("tanggalLahir", formattedTanggalLahir || "");
          formData.append("tempatLahir", userData.tempatLahir || "");
          formData.append("namaLengkap", userData.namaLengkap || "");
          formData.append("nik", userData.nik || "");
          formData.append("nip", userData.nip || "");
          formData.append("npaPgri", userData.npaPgri || "");
          formData.append("password", userData.password || "");
          formData.append("email", userData.email || "");

          for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
          }

          const response = await GlobalApi.updateUserById(anggotaId, formData);

          setDaspenData(response);
          setIsKategoriChanged(false);
          setIsPopupDaspen(false);

          toast.success(
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-bounce">
                <FaCheckCircle className="text-green-500 text-5xl" />
              </div>
              <h4 className="text-xl font-bold text-green-800">Berhasil!</h4>
              <div className="text-green-800 text-center">
                Kategori Daspen Berhasil Diupdate!
              </div>
            </div>,
            {
              icon: null,
              duration: 3000,
              style: {
                background: "rgb(220, 252, 231)",
                borderRadius: "0.5rem",
                padding: "2rem",
                width: "24rem",
                maxWidth: "90%",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
                zIndex: 50,
              },
              closeButton: true,
              closeOnClick: true,
            }
          );
        } else {
          console.log("Data pengguna tidak ditemukan.");
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        toast.error(
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-bounce">
              <FaExclamationCircle className="text-red-500 text-5xl" />
            </div>
            <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
            <div className="text-red-800 text-center">
              Gagal memperbarui data. Periksa kembali input.
            </div>
          </div>,
          {
            icon: null,
            duration: 3000,
            style: {
              background: "rgb(254, 226, 226)",
              borderRadius: "0.5rem",
              padding: "2rem",
              width: "24rem",
              maxWidth: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative",
              zIndex: 50,
            },
            closeButton: true,
            closeOnClick: true,
          }
        );
      }
    } else {
      console.log("Anggota ID tidak ditemukan di sessionStorage");
    }
  };

  const handleDataDaspen = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");
    if (anggotaId) {
      try {
        const response = await GlobalApi.getUserById(anggotaId);
        console.log(response);

        if (response) {
          setKategoriDaspen(response.kategoriDaspen || "Tidak tersedia");

          const nip = response.nip?.trim();

          if (nip) {
            const fileResponse = await GlobalApi.getFileByNip(nip);

            if (fileResponse) {
              setDaspenData(fileResponse);
              setIsPopupDaspen(true);
            } else {
              console.log("File tidak ditemukan untuk NIP:", nip);
            }
          } else {
            toast.error(
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-bounce">
                  <FaExclamationCircle className="text-red-500 text-5xl" />
                </div>
                <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
                <div className="text-red-800 text-center">
                  Data Sinkron tidak ada. Silahkan hubungi admin!
                </div>
              </div>,
              {
                icon: null,
                duration: 3000,
                style: {
                  background: "rgb(254, 226, 226)",
                  borderRadius: "0.5rem",
                  padding: "2rem",
                  width: "24rem",
                  maxWidth: "90%",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                  zIndex: 50,
                },
                closeButton: true,
                closeOnClick: true,
              }
            );
          }
        } else {
          console.log("Data anggota tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-bounce">
              <FaExclamationCircle className="text-red-500 text-5xl" />
            </div>
            <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
            <div className="text-red-800 text-center">
              Data Sinkron tidak ada. Silahkan hubungi admin!
            </div>
          </div>,
          {
            icon: null,
            duration: 3000,
            style: {
              background: "rgb(254, 226, 226)",
              borderRadius: "0.5rem",
              padding: "2rem",
              width: "24rem",
              maxWidth: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative",
              zIndex: 50,
            },
            closeButton: true,
            closeOnClick: true,
          }
        );
      }
    } else {
      console.log("Anggota ID tidak ditemukan di sessionStorage");
    }
  };

  const handlePensiunAnggota = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");

      await GlobalApi.pensiunAnggota(anggotaId);
      setPopupVisible(false);
      toast.success(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-green-800">Berhasil!</h4>
          <div className="text-green-800 text-center">
            Anggota berhasil dipensiunkan.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(220, 252, 231)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaExclamationCircle className="text-red-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
          <div className="text-red-800 text-center">
            Gagal pensiunkan anggota.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(254, 226, 226)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  const handleKategoriChange = (e) => {
    setPreviousKategoriDaspen(kategoriDaspen);

    setKategoriDaspen(e.target.value);
    setIsKategoriChanged(true);
  };

  const handleKeluarAnggota = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");

      if (!anggotaId) {
        toast.error(
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-bounce">
              <FaExclamationCircle className="text-red-500 text-5xl" />
            </div>
            <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
            <div className="text-red-800 text-center">
              ID anggota tidak ditemukan.
            </div>
          </div>,
          {
            icon: null,
            duration: 3000,
            style: {
              background: "rgb(254, 226, 226)",
              borderRadius: "0.5rem",
              padding: "2rem",
              width: "24rem",
              maxWidth: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative",
              zIndex: 50,
            },
            closeButton: true,
            closeOnClick: true,
          }
        );
        return;
      }

      const result = await GlobalApi.keluarAnggota(anggotaId);

      toast.success(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-green-800">Berhasil!</h4>
          <div className="text-green-800 text-center">
            Data anggota berhasil dihapus.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(220, 252, 231)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );

      setTimeout(() => {
        window.location.reload();
      }, 2000);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Gagal Menghapus Data:", error);
      toast.error(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaExclamationCircle className="text-red-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
          <div className="text-red-800 text-center">
            Gagal menghapus data anggota.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(254, 226, 226)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );
    }
  };

  const handleDeleteClick = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");

      if (!anggotaId) {
        toast.error(
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-bounce">
              <FaExclamationCircle className="text-red-500 text-5xl" />
            </div>
            <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
            <div className="text-red-800 text-center">
              ID anggota tidak ditemukan.
            </div>
          </div>,
          {
            icon: null,
            duration: 3000,
            style: {
              background: "rgb(254, 226, 226)",
              borderRadius: "0.5rem",
              padding: "2rem",
              width: "24rem",
              maxWidth: "90%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative",
              zIndex: 50,
            },
            closeButton: true,
            closeOnClick: true,
          }
        );
        return;
      }

      const result = await GlobalApi.deleteUser(anggotaId);

      toast.success(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-green-800">Berhasil!</h4>
          <div className="text-green-800 text-center">
            Data Anggota Berhasil Dihapus!
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(220, 252, 231)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );

      setTimeout(() => {
        window.location.reload();
      }, 2000);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Gagal Menghapus Data:", error);
      toast.error(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaExclamationCircle className="text-red-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
          <div className="text-red-800 text-center">
            Gagal pensiunkan anggota.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(254, 226, 226)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );
    }
  };

  const handleSync = async () => {
    try {
      setLoadingButton(true);

      const userId = sessionStorage.getItem("anggotaId");
      if (!userId) {
        toast.error("User ID tidak ditemukan!");
        setLoadingButton(false);
        return;
      }

      const userData = await GlobalApi.getUserById(userId);
      if (!userData || !userData.nip) {
        toast.error("NIP tidak ditemukan!");
        setLoadingButton(false);
        return;
      }

      const nip = userData.nip;
      const data = await GlobalApi.getByNIP(nip);
      if (!data) {
        toast.error("Data dengan NIP ini tidak ditemukan!");
        setLoadingButton(false);
        return;
      }

      const nipData = await GlobalApi.getFileByNip(nip);
      if (nipData?.verifikasi === true) {
        toast.success("Data Anda sudah tersinkronisasi!");
        setLoadingButton(false);
        return;
      }
      const response = await GlobalApi.updateRegisUser(userId, data);
      toast.success("Data berhasil disinkronkan!");
      await fetchDataAnggota(currentPage, pageSize);
    } catch (error) {
      // toast.error("Terjadi kesalahan saat mengirim data. NIP tidak sesuai.");
    } finally {
      setLoadingButton(false);
    }
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

  const toggleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    sessionStorage.removeItem("anggotaId");
  };

  const handlePopupKeluar = () => {
    setPopupVisibleKeluar(true);
  };

  const handlePopup = () => {
    setPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupDaspen(false);
  };

  const updateAktivasiUser = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");
      console.log(anggotaId);

      const response = await GlobalApi.activasiUser(anggotaId);
      toast.success(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-green-800">Berhasil!</h4>
          <div className="text-green-800 text-center">
            Anggota Berhasil Diaktifkan.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(220, 252, 231)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("Error fetching cabang:", error);
      toast.error(
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <FaExclamationCircle className="text-red-500 text-5xl" />
          </div>
          <h4 className="text-xl font-bold text-red-800">Gagal!</h4>
          <div className="text-red-800 text-center">
            Anggota Gagal Diaktifkan.
          </div>
        </div>,
        {
          icon: null,
          duration: 3000,
          style: {
            background: "rgb(254, 226, 226)",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "24rem",
            maxWidth: "90%",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
            zIndex: 50,
          },
          closeButton: true,
          closeOnClick: true,
        }
      );
    }
  };

  const handleCancelKeluar = () => {
    setPopupVisibleKeluar(false);
    setPopupVisible(false);
  };

  const handlePopupAktivasi = () => {
    setPopupVisibleAktifasi(true);
  };

  const handleCancelKeluarAktivasi = () => {
    setPopupVisibleAktifasi(false);
  };

  const handleDetailAnggota = () => {
    router.push("/anggota/detail-anggota");
  };

  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="p-2 md:p-3 border text-white bg-teal-700">
              <div className="flex justify-between items-center">
                <span>No</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700">
              <div className="text-center">
                <span>Foto</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700">
              <div className="text-center">
                <span>Nama</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
              <div className="text-center">
                <span>Tanggal Lahir</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
              <div className="text-center">
                <span>Unit Kerja</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
              <div className="text-center">
                <span>Keterangan</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
              <div className="text-center">
                <span>Lokasi</span>
              </div>
            </th>
            <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
              <div className="text-center">
                <span>Aksi</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="py-4 px-4">
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
            (anggotaData || []).map((item, index) => {
              const nomorUrut = currentPageNumber * pageSizeNumber + index + 1;
              // cari file berdasarkan nip
              return (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50 text-sm">
                    <td className="py-2 px-4 border text-center">
                      {nomorUrut}
                      <div className="flex justify-between items-center">
                        {isMobile && (
                          <FontAwesomeIcon
                            icon={
                              expandedRow === index
                                ? faMinusCircle
                                : faPlusCircle
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
                        <div className="w-16 h-16 flex flex-col items-center justify-center">
                          <Image
                            src={
                              fotoBase64[index]
                                ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                : profileImageUrl
                            }
                            width={50}
                            height={50}
                            alt="Anggota Foto"
                            className="object-cover"
                            unoptimized={true}
                          />
                        </div>
                      </td>
                    ) : (
                      <td className="py-2 px-4 border-b">
                        <div className="w-16 h-16 overflow-hidden">
                          <Image
                            src={
                              fotoBase64[index]
                                ? `data:image/jpeg;base64,${fotoBase64[index]}`
                                : profileImageUrl
                            }
                            width={50}
                            height={50}
                            alt="Anggota Foto"
                            className="object-cover"
                          />
                        </div>
                      </td>
                    )}
                    <td className="p-2 md:p-3 border">
                      <div className="font-bold text-sm">
                        {item.namaLengkap}
                      </div>
                      <div className="text-sm">{item.npaPgri}</div>
                      <div className="text-sm">{item.jabatan}</div>
                      <div
                        className={`text-sm p-1 inline-block ${item.nip && item.nip !== "0"
                          ? "bg-green-500 text-white rounded-full px-3"
                          : "bg-red-500 text-white rounded-full px-3"
                          }`}
                      >
                        {item.nip && item.nip !== "0"
                          ? item.nip
                          : "Tidak Terdaftar Daspen"}
                      </div>
                    </td>
                    {!isMobile && (
                      <>
                        <td className="py-2 px-4 border">
                          <div className="text-sm">{item.tempatLahir},</div>
                          <div className="text-sm">
                            {formatDate(item.tanggalLahir)}
                          </div>
                          <div className="text-sm">
                            {calculateAge(item.tanggalLahir)}
                          </div>
                          <div className="text-sm">
                            Pensiun :{" "}
                            {item.prediksiPensiun
                              ? formatRetirementDate(item.prediksiPensiun)
                              : "-"}
                          </div>
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="text-sm">{item.cabang},</div>
                          <div className="text-sm">{item.unitKerja}</div>
                          <div className="text-sm">
                            Anggota:{" "}
                            {item.tahunDiangkat
                              ? (() => {
                                const date = new Date(item.tahunDiangkat);
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                const month = String(
                                  date.getMonth() + 1
                                ).padStart(2, "0");
                                const year = date.getFullYear();
                                return `${day}-${month}-${year}`;
                              })()
                              : "-"}
                          </div>

                          <div className="text-sm">{item.pangkatGolongan}</div>
                        </td>
                        <td className="py-2 px-4 border w-36 text-center">
                          <div className="text-xs font-semibold">
                            {item.statusKeanggotaan}
                          </div>

                          <div
                            className={`text-sm mt-1 font-medium px-2 py-1 rounded-full inline-block ${filesByNip.find(
                              (file) => String(file?.nip) === String(item.nip)
                            )?.verifikasi === true
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {filesByNip.find(
                              (file) => String(file?.nip) === String(item.nip)
                            )?.verifikasi === true
                              ? "Sudah Sinkronisasi"
                              : "Belum Sinkronisasi"}
                          </div>
                        </td>
                        <td className="py-2 px-4 border text-center">
                          <div
                            className="text-sm cursor-pointer text-blue-500 hover:underline"
                            onClick={() => {
                              const url = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
                              window.open(url, "_blank");
                            }}
                          >
                            {item.latitude}, {item.longitude}
                          </div>
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex justify-center space-x-2">
                            <Button
                              type="button"
                              className="text-white bg-blue-500 hover:bg-blue-600 p-2 border rounded-md"
                              title="Edit Data"
                              onClick={() => {
                                sessionStorage.setItem("anggotaId", item.id);
                                handleEditClick();
                              }}
                            >
                              <FaEdit className="w-4 h-4" />
                            </Button>

                            {sessionStorage.getItem("role") === "USER" ? (
                              <>
                                <Link
                                  href="#"
                                  className="text-white bg-cyan-500 p-2 border rounded-md cursor-not-allowed opacity-50"
                                  title="Mutasi"
                                  type="button"
                                  disabled
                                >
                                  <FaExchangeAlt className="w-4 h-4" />
                                </Link>

                                <Link
                                  href="#"
                                  className="text-white bg-red-500 p-2 border rounded-md cursor-not-allowed opacity-50"
                                  title="Lapor"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <FaExclamationTriangle className="w-4 h-4" />
                                </Link>

                                <Link
                                  href="#"
                                  className="text-white bg-green-500 p-2 border rounded-md cursor-not-allowed opacity-50"
                                  title="WhatsApp"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <FaWhatsapp className="w-4 h-4" />
                                </Link>
                              </>
                            ) : (
                              <>
                                <Button
                                  className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                                  title="Mutasi"
                                  type="button"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "anggotaId",
                                      item.id
                                    );
                                    openModal(item);
                                  }}
                                >
                                  <FaExchangeAlt className="w-4 h-4" />
                                </Button>

                                {sessionStorage.getItem("role") ===
                                  "SUPER ADMIN" ? (
                                  <Button
                                    className="text-white bg-red-500 hover:bg-red-600 p-2 border rounded-md"
                                    onClick={() => {
                                      sessionStorage.setItem(
                                        "anggotaId",
                                        item.id
                                      );
                                      setIsPopupVisible(true);
                                    }}
                                  >
                                    <FaExclamationTriangle className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Link
                                    href="#"
                                    className="text-white bg-red-500 p-2 border rounded-md cursor-not-allowed opacity-50"
                                    title="Lapor"
                                    type="button"
                                    disabled
                                  >
                                    <FaExclamationTriangle className="w-5 h-4" />
                                  </Link>
                                )}

                                {isPopupVisible && (
                                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-40 w-screen h-screen">
                                    <div className="bg-white p-6 rounded-lg shadow-md w-96">
                                      <h2 className="text-xl text-center mb-4">
                                        Apakah Anda Yakin ingin Menghapus Data
                                        Anggota ini?
                                      </h2>
                                      <div className="flex justify-end gap-4">
                                        <button
                                          onClick={() =>
                                            setIsPopupVisible(false)
                                          }
                                          className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
                                        >
                                          Batal
                                        </button>
                                        <button
                                          onClick={handleDeleteClick}
                                          className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                                        >
                                          Ya, Saya Sakin
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <Link
                                  href={`https://wa.me/${item.nomorHp?.replace(
                                    /^0/,
                                    "62"
                                  )}`}
                                  className="text-white bg-green-500 hover:bg-green-600 p-2 border rounded-md"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp"
                                >
                                  <FaWhatsapp className="w-4 h-4" />
                                </Link>
                              </>
                            )}
                            <div>
                              <Button
                                type="button"
                                className="text-white bg-blue-500 hover:bg-blue-600 p-2 border rounded-md"
                                title="Data Daspen"
                                onClick={() => {
                                  sessionStorage.setItem("anggotaId", item.id);
                                  handleDataDaspen();
                                }}
                              >
                                Daspen
                              </Button>

                              {isPopupDaspen && daspenData && (
                                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-10 z-50">
                                  <div className="bg-white p-6 rounded-md w-5/12 relative">
                                    <button
                                      onClick={closePopup}
                                      className="absolute top-2 right-2 p-2 bg-white rounded-full"
                                    >
                                      <FaTimes className="h-6 w-6 text-red-600" />
                                    </button>

                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                      Data Daspen
                                      <span
                                        className={`text-lg font-semibold px-3 py-2 rounded-full ${daspenData.verifikasi === true
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                          }`}
                                      >
                                        {daspenData.verifikasi === true
                                          ? "Sudah Sinkronisasi"
                                          : "Belum Sinkronisasi"}
                                      </span>
                                    </h2>

                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-semibold">
                                          Nama Anggota:
                                        </p>
                                        <p>
                                          {daspenData.namaAnggota ||
                                            "Tidak tersedia"}
                                        </p>
                                      </div>
                                      {/* <div>
                                        <p className="font-semibold">
                                          Kategori Daspen:
                                        </p>
                                        <select
                                          className="w-full p-2 border rounded-md border-teal-500"
                                          value={kategoriDaspen}
                                          onChange={handleKategoriChange}
                                        >
                                          <option value="I">I</option>
                                          <option value="II">II</option>
                                          <option value="III">III</option>
                                        </select>

                                        {isKategoriChanged && (
                                          <div className="popup">
                                            <p>
                                              Apakah Anda yakin ingin mengganti
                                              kategori Daspen?
                                            </p>

                                            <button
                                              onClick={handleConfirmChange}
                                              className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-200 px-6"
                                            >
                                              Ya
                                            </button>

                                            <button
                                              onClick={() => {
                                                setKategoriDaspen(
                                                  previousKategoriDaspen
                                                );
                                                setIsKategoriChanged(false);
                                              }}
                                              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200 ml-2 px-4"
                                            >
                                              Tidak
                                            </button>
                                          </div>
                                        )}
                                      </div> */}
                                      <div>
                                        <p className="font-semibold">
                                          Kategori Daspen:
                                        </p>
                                        <p>{kategoriDaspen}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">
                                          Tanggal Lahir:
                                        </p>
                                        <p>
                                          {daspenData.tanggalLahir
                                            ? new Intl.DateTimeFormat("id-ID", {
                                              day: "2-digit",
                                              month: "long",
                                              year: "numeric",
                                            }).format(
                                              new Date(
                                                daspenData.tanggalLahir
                                              )
                                            )
                                            : "Tidak tersedia"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">Usia:</p>
                                        <p>
                                          {calculateAge(
                                            daspenData.tanggalLahir
                                          ) || "Tidak tersedia"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">NIP:</p>
                                        <p>
                                          {daspenData.nip || "Tidak tersedia"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">
                                          Mulai Jadi Anggota:
                                        </p>
                                        <p>
                                          {daspenData.mulaiJadiAnggotaDaspen
                                            ? new Intl.DateTimeFormat("id-ID", {
                                              day: "2-digit",
                                              month: "long",
                                              year: "numeric",
                                            }).format(
                                              new Date(
                                                daspenData.mulaiJadiAnggotaDaspen
                                              )
                                            )
                                            : "Tidak tersedia"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">
                                          Kelompok Jabatan:
                                        </p>
                                        <p>
                                          {daspenData.kelompokJabatan || "-"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">
                                          Prediksi Pensiun:
                                        </p>
                                        <p>
                                          {daspenData.prediksiPensiun
                                            ? (() => {
                                              const prediksiPensiunDate =
                                                new Date(
                                                  daspenData.prediksiPensiun
                                                );
                                              prediksiPensiunDate.setMonth(
                                                prediksiPensiunDate.getMonth() +
                                                1
                                              );
                                              return new Intl.DateTimeFormat(
                                                "id-ID",
                                                {
                                                  day: "2-digit",
                                                  month: "long",
                                                  year: "numeric",
                                                }
                                              ).format(prediksiPensiunDate);
                                            })()
                                            : "Tidak tersedia"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">
                                          Sumbangan:
                                        </p>
                                        <p>
                                          {daspenData.sumbangan
                                            ? new Intl.NumberFormat("id-ID", {
                                              style: "currency",
                                              currency: "IDR",
                                            }).format(daspenData.sumbangan)
                                            : "Tidak tersedia"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-semibold">
                                          Untuk Lihat Data Lengkap:
                                        </p>
                                        <div className="flex items-center">
                                          <p className="text-sm mr-1">
                                            Link Website:
                                          </p>
                                          <a
                                            href="https://www.dansetjateng.org/"
                                            className="bg-teal-500 text-white px-2 py-1 rounded-md text-sm hover:bg-teal-600 transform hover:scale-105 transition-all duration-300"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            www.dansetjateng.org
                                          </a>
                                        </div>
                                        <div>
                                          {/* Menampilkan status error atau success */}
                                          {error && (
                                            <p className="text-red-500 text-sm mt-2">
                                              {error}
                                            </p>
                                          )}
                                          {success && (
                                            <p className="text-green-500 text-sm mt-2">
                                              {success}
                                            </p>
                                          )}

                                          {/* Popup informasi */}
                                          {isPopupVisible && (
                                            <div className="fixed inset-0 flex justify-center items-center z-50">
                                              <div className="bg-white rounded-lg p-6 w-11/12 max-w-md text-center shadow-xl transform transition-all">
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-16 w-16 mx-auto text-yellow-500 mb-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                  />
                                                </svg>
                                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                                  Informasi Sinkronisasi{" "}
                                                </h2>
                                                <p className="text-black mb-6">
                                                  Data yang Anda akses melalui
                                                  sistem kami tidak langsung
                                                  tersinkronisasi dengan
                                                  database DASPEN Jawa Tengah.
                                                  Data yang ditampilkan
                                                  merupakan hasil identifikasi
                                                  berdasarkan Nomor Induk
                                                  Pegawai (NIP) dan Tanggal
                                                  Lahir yang Anda input.
                                                </p>
                                                <div className="flex justify-center gap-4">
                                                  <button
                                                    onClick={handleClosePopup}
                                                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                                                  >
                                                    Tutup
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 w-full">
                                      <div className="flex-1 flex justify-center items-center space-x-2">
                                        <FontAwesomeIcon
                                          icon={faInfoCircle}
                                          className="w-6 h-6 text-blue-500 cursor-pointer hover:text-blue-600"
                                          onClick={handleOpenPopup}
                                        />
                                        <button
                                          onClick={handleSync}
                                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-lg font-semibold hover:bg-blue-600 transform hover:scale-110 transition-all duration-300"
                                          disabled={loadingButton}
                                        >
                                          {loadingButton
                                            ? "Sinkronisasi..."
                                            : "Sinkronisasi"}
                                        </button>
                                      </div>

                                      {/* Button Tutup di ujung kanan */}
                                      <div className="flex justify-end">
                                        <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                          onClick={closePopup}
                                        >
                                          Tutup
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {["SUPER ADMIN", "ADMIN"].includes(
                              sessionStorage.getItem("role")
                            ) && (
                                <div className="flex justify-center">
                                  <Button
                                    type="button"
                                    className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white p-2 border-none rounded-md shadow-md transition-all duration-200 ease-in-out flex items-center gap-2"
                                    title="Detail Anggota"
                                    onClick={() => {
                                      sessionStorage.setItem(
                                        "anggotaId",
                                        item.id
                                      );
                                      handleDetailAnggota();
                                    }}
                                  >
                                    Detail Anggota
                                  </Button>
                                </div>
                              )}
                          </div>
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
                              <h3 className="font-semibold">Tanggal Lahir:</h3>
                              <div className="text-sm">{item.tempatLahir},</div>
                              <div className="text-sm">
                                {formatDate(item.tanggalLahir)}
                              </div>
                              <div className="text-sm">
                                {calculateAge(item.tanggalLahir)}
                              </div>
                              <div className="text-sm">
                                Pensiun :{" "}
                                {item.prediksiPensiun
                                  ? formatRetirementDate(item.prediksiPensiun)
                                  : "-"}
                              </div>
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold">Unit Kerja:</h3>
                              <div className="text-sm">{item.cabang},</div>
                              <div className="text-sm">{item.unitKerja}</div>
                              <div className="text-sm">
                                Anggota:{" "}
                                {item.tahunDiangkat
                                  ? (() => {
                                    const date = new Date(item.tahunDiangkat);
                                    const day = String(
                                      date.getDate()
                                    ).padStart(2, "0");
                                    const month = String(
                                      date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const year = date.getFullYear();
                                    return `${day}-${month}-${year}`;
                                  })()
                                  : "-"}
                              </div>

                              <div className="text-sm">
                                {item.pangkatGolongan}
                              </div>
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold">
                                Status Keanggotaan:
                              </h3>
                              {item.statusKeanggotaan}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-center">Aksi:</h3>
                            <div className="flex justify-center space-x-2 mt-2">
                              <Button
                                className="text-white bg-blue-500 hover:bg-blue-600 p-2 border rounded-md"
                                title="Edit Data"
                                onClick={() => {
                                  sessionStorage.setItem("anggotaId", item.id);
                                  handleEditClick();
                                }}
                              >
                                <FaEdit className="w-4 h-4" />
                              </Button>

                              {sessionStorage.getItem("role") ===
                                "SUPER ADMIN" ||
                                sessionStorage.getItem("role") === "ADMIN" ? (
                                <Button
                                  className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                                  title="Mutasi"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "anggotaId",
                                      item.id
                                    );
                                    openModal(item);
                                  }}
                                >
                                  <FaExchangeAlt className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                                  title="Mutasi"
                                  disabled
                                >
                                  <FaExchangeAlt className="w-4 h-4" />
                                </Button>
                              )}

                              {sessionStorage.getItem("role") ===
                                "SUPER ADMIN" ? (
                                <Button
                                  className="text-white bg-red-500 hover:bg-red-600 p-2 border rounded-md"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "anggotaId",
                                      item.id
                                    );
                                    setIsPopupVisible(true);
                                  }}
                                >
                                  <FaExclamationTriangle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  className="text-white bg-red-500 p-2 border rounded-md cursor-not-allowed opacity-50"
                                  title="Lapor"
                                  type="button"
                                  disabled
                                >
                                  <FaExclamationTriangle className="w-4 h-4" />
                                </Button>
                              )}
                              {isPopupVisible && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-40 w-screen h-screen">
                                  <div className="bg-white p-6 rounded-lg shadow-md w-96">
                                    <h2 className="text-xl text-center mb-4">
                                      Apakah Anda Yakin ingin Menghapus Data
                                      Anggota ini?
                                    </h2>
                                    <div className="flex justify-end gap-4">
                                      <button
                                        onClick={() => setIsPopupVisible(false)}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={handleDeleteClick}
                                        className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                                      >
                                        Ya, Saya Sakin
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <Link
                                href={`https://wa.me/62${item.nomorHp}`}
                                className="text-white bg-green-500 p-2 border rounded-md"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FaWhatsapp className="w-4 h-4" title="WA" />
                              </Link>
                              <div>
                                <Button
                                  type="button"
                                  className="text-white bg-blue-500 hover:bg-blue-600 p-2 border rounded-md"
                                  title="Data Daspen"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "anggotaId",
                                      item.id
                                    );
                                    handleDataDaspen();
                                  }}
                                >
                                  Daspen
                                </Button>
                                {isPopupDaspen && daspenData && (
                                  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white p-6 rounded-md w-11/12 sm:w-8/12 md:w-6/12 lg:w-5/12 xl:w-4/12 relative max-h-[80vh] overflow-y-auto">
                                      <button
                                        onClick={closePopup}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full"
                                      >
                                        <FaTimes className="h-6 w-6 text-red-600" />
                                      </button>

                                      <h2 className="text-xl font-bold">
                                        Data Daspen
                                      </h2>

                                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <p className="font-semibold">
                                            Nama Anggota:
                                          </p>
                                          <p>
                                            {daspenData.namaAnggota ||
                                              "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Kategori Daspen:
                                          </p>
                                          <select
                                            className="w-full p-2 border rounded-md border-teal-500"
                                            value={kategoriDaspen}
                                            onChange={handleKategoriChange}
                                          >
                                            <option value="I">I</option>
                                            <option value="II">II</option>
                                            <option value="III">III</option>
                                          </select>

                                          {isKategoriChanged && (
                                            <div className="popup">
                                              <p>
                                                Apakah Anda yakin ingin
                                                mengganti kategori Daspen?
                                              </p>

                                              <button
                                                onClick={handleConfirmChange}
                                                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-200 px-6"
                                              >
                                                Ya
                                              </button>

                                              <button
                                                onClick={() => {
                                                  setKategoriDaspen(
                                                    previousKategoriDaspen
                                                  );
                                                  setIsKategoriChanged(false);
                                                }}
                                                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200 ml-2 px-4"
                                              >
                                                Tidak
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Tanggal Lahir:
                                          </p>
                                          <p>
                                            {daspenData.tanggalLahir
                                              ? new Intl.DateTimeFormat(
                                                "id-ID",
                                                {
                                                  day: "2-digit",
                                                  month: "long",
                                                  year: "numeric",
                                                }
                                              ).format(
                                                new Date(
                                                  daspenData.tanggalLahir
                                                )
                                              )
                                              : "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">Usia:</p>
                                          <p>
                                            {calculateAge(
                                              daspenData.tanggalLahir
                                            ) || "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">NIP:</p>
                                          <p>
                                            {daspenData.nip || "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Mulai Jadi Anggota:
                                          </p>
                                          <p>
                                            {daspenData.mulaiJadiAnggotaDaspen
                                              ? new Intl.DateTimeFormat(
                                                "id-ID",
                                                {
                                                  day: "2-digit",
                                                  month: "long",
                                                  year: "numeric",
                                                }
                                              ).format(
                                                new Date(
                                                  daspenData.mulaiJadiAnggotaDaspen
                                                )
                                              )
                                              : "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Kelompok Jabatan:
                                          </p>
                                          <p>
                                            {daspenData.kelompokJabatan || "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Prediksi Pensiun:
                                          </p>
                                          <p>
                                            {daspenData.prediksiPensiun
                                              ? (() => {
                                                const prediksiPensiunDate =
                                                  new Date(
                                                    daspenData.prediksiPensiun
                                                  );
                                                prediksiPensiunDate.setMonth(
                                                  prediksiPensiunDate.getMonth() +
                                                  1
                                                );
                                                return new Intl.DateTimeFormat(
                                                  "id-ID",
                                                  {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                  }
                                                ).format(prediksiPensiunDate);
                                              })()
                                              : "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Sumbangan:
                                          </p>
                                          <p>
                                            {daspenData.sumbangan
                                              ? new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                              }).format(daspenData.sumbangan)
                                              : "Tidak tersedia"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">
                                            Untuk Lihat Data Lengkap:
                                          </p>
                                          <div className="flex items-center">
                                            <p className="text-sm mr-1">
                                              Link Website:
                                            </p>
                                            <a
                                              href="https://www.dansetjateng.org/"
                                              className="bg-teal-500 text-white px-2 py-1 rounded-md text-sm hover:bg-teal-600 transform hover:scale-105 transition-all duration-300"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              www.dansetjateng.org
                                            </a>
                                          </div>
                                          <div>
                                            <div className="flex items-center space-x-2">
                                              <button
                                                onClick={handleSync}
                                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transform hover:scale-105 transition-all duration-300"
                                                disabled={loadingButton}
                                              >
                                                {loadingButton
                                                  ? "Sinkronisasi..."
                                                  : "Sinkronisasi"}
                                              </button>
                                              <FontAwesomeIcon
                                                icon={faInfoCircle}
                                                className="w-6 h-6 text-blue-500 cursor-pointer hover:text-blue-600"
                                                onClick={handleOpenPopup}
                                              />
                                            </div>

                                            {/* Menampilkan status error atau success */}
                                            {error && (
                                              <p className="text-red-500 text-sm mt-2">
                                                {error}
                                              </p>
                                            )}
                                            {success && (
                                              <p className="text-green-500 text-sm mt-2">
                                                {success}
                                              </p>
                                            )}

                                            {/* Popup informasi */}
                                            {isPopupVisible && (
                                              <div className="fixed inset-0 flex justify-center items-center z-50">
                                                <div className="bg-white rounded-lg p-6 w-11/12 max-w-md text-center shadow-xl transform transition-all">
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-16 w-16 mx-auto text-yellow-500 mb-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                    />
                                                  </svg>
                                                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                                    Informasi Sinkronisasi{" "}
                                                  </h2>
                                                  <p className="text-black mb-6">
                                                    Data yang Anda akses melalui
                                                    sistem kami tidak langsung
                                                    tersinkronisasi dengan
                                                    database DASPEN Jawa Tengah.
                                                    Data yang ditampilkan
                                                    merupakan hasil identifikasi
                                                    berdasarkan Nomor Induk
                                                    Pegawai (NIP) dan Tanggal
                                                    Lahir yang Anda input.
                                                  </p>
                                                  <div className="flex justify-center gap-4">
                                                    <button
                                                      onClick={handleClosePopup}
                                                      className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                                                    >
                                                      Tutup
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex justify-end mt-4">
                                        <button
                                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                                          onClick={closePopup}
                                        >
                                          Tutup
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {["SUPER ADMIN", "ADMIN"].includes(
                                sessionStorage.getItem("role")
                              ) && (
                                  <div className="flex justify-center">
                                    <Button
                                      type="button"
                                      className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white p-2 border-none rounded-md shadow-md transition-all duration-200 ease-in-out flex items-center gap-2"
                                      title="Detail Anggota"
                                      onClick={() => {
                                        sessionStorage.setItem(
                                          "anggotaId",
                                          item.id
                                        );
                                        handleDetailAnggota();
                                      }}
                                    >
                                      Detail Anggota
                                    </Button>
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="text-center mt-4 w-full">
                            <h3 className="font-semibold">Lokasi:</h3>
                            {item.latitude && item.longitude ? (
                              <>
                                <p>
                                  {item.latitude.toFixed(6)},{" "}
                                  {item.longitude.toFixed(6)}
                                </p>
                                <div className="mt-8">
                                  <div
                                    className="relative w-full"
                                    style={{
                                      height: "400px",
                                      maxWidth: "800px",
                                      margin: "0 auto",
                                    }}
                                  >
                                    <MapComponent
                                      latitude={item.latitude}
                                      longitude={item.longitude}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500">
                                Lokasi tidak tersedia
                              </p>
                            )}
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Mutation Actions"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Mutasi Anggota</h2>
            <button
              className="text-2xl font-bold text-gray-700 hover:text-red-500 focus:outline-none"
              onClick={closeModal}
            >
              x
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 p-4 rounded-md shadow-md bg-white">
            <div className="w-full flex justify-center mb-4">
              <Image
                src={
                  fotoBase64
                    ? "/profile.png"
                    : `data:image/jpeg;base64,${fotoBase64}`
                }
                width={100}
                height={100}
                alt="Anggota Foto"
                className="rounded-full border-2 border-gray-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="flex flex-col">
                <p className="font-semibold text-gray-700 text-sm">
                  Nama Lengkap:
                </p>
                <p className="text-base text-gray-900">
                  {currentItem?.namaLengkap || "-"}
                </p>
                <p className="font-semibold text-gray-700 text-sm mt-4">
                  Cabang:
                </p>
                <p className="text-base text-gray-900">
                  {currentItem?.cabang || "-"}
                </p>
              </div>

              <div className="flex flex-col">
                <p className="font-semibold text-gray-700 text-sm">NPA:</p>
                <p className="text-base text-gray-900">
                  {currentItem?.npaPgri || "-"}
                </p>
                <p className="font-semibold text-gray-700 text-sm mt-4">
                  Unit Kerja:
                </p>
                <p className="text-base text-gray-900">
                  {currentItem?.unitKerja || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div>
              <Button
                className="w-full bg-teal-700 hover:bg-teal-500"
                onClick={handlePindahCabangUnit}
              >
                Pindah Cabang dan Unit Kerja
              </Button>
            </div>
            <div>
              <Button
                className="w-full bg-teal-700 hover:bg-teal-500"
                onClick={handlePopupKeluar}
              >
                Keluar Anggota
              </Button>

              {popupVisibleKeluar && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-6 w-11/12 sm:w-2/5 md:w-1/3 lg:w-1/4 text-center shadow-lg max-w-md">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Apakah Anda yakin?
                    </h2>
                    <p className="text-gray-600 mt-2 mb-4">
                      Apakah Anda yakin akan menghapus anggota ini?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleCancelKeluar}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleKeluarAnggota}
                        className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                      >
                        Ya, Saya Yakin
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Button
                className="w-full bg-teal-700 hover:bg-teal-500"
                onClick={handlePopup}
              >
                Pensiun
              </Button>
              {popupVisible && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-6 w-11/12 sm:w-2/5 md:w-1/3 lg:w-1/4 text-center shadow-lg max-w-md">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Apakah Anda yakin ?
                    </h2>
                    <p className="text-gray-600 mt-2 mb-4">
                      Apakah Anda yakin untuk mengubah anggota menjadi pensiun?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleCancelKeluar}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handlePensiunAnggota}
                        className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                      >
                        Ya, Saya Yakin
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Button
                className="w-full bg-teal-700 hover:bg-teal-500"
                onClick={handlePopupAktivasi}
              >
                Aktivasi Anggota
              </Button>
              {popupVisibleAktifasi && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-6 w-11/12 sm:w-2/5 md:w-1/3 lg:w-1/4 text-center shadow-lg max-w-md">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Apakah Anda yakin ?
                    </h2>
                    <p className="text-gray-600 mt-2 mb-4">
                      Apakah Anda yakin untuk mengaktifkan anggota menjadi
                      Aktif?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleCancelKeluarAktivasi}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                      >
                        Batal
                      </button>
                      <button
                        onClick={updateAktivasiUser}
                        className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                      >
                        Ya, Saya Yakin
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
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
    setShowConfirmReject(false);
    handleRejectUserClick(selectedRow.id);
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

export default DataAnggota;
