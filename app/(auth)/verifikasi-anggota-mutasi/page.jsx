"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSearch,
  faTimesCircle,
  faUser,
  faArrowLeft,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Badge } from "@/components/ui/badge";
import toast, { Toaster } from "react-hot-toast";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [fotoBase64, setFotoBase64] = useState("");

  const fetchDataAnggota = async (
    page = 0,
    size = 10,
    cabang = "",
    unitKerja = ""
  ) => {
    try {
      const response = await GlobalApi.getUnverifiedUsers(
        page,
        size,
        cabang,
        unitKerja
      );

      const fetchedData = response.data.content;

      const fotoBase64Array = [];

      if (fetchedData && fetchedData.length > 0) {
        fetchedData.forEach((item) => {
          if (item.foto) {
            try {
              const decodedString = atob(item.foto);
              fotoBase64Array.push(decodedString); // Add decoded image to the array
            } catch (error) {
              console.error("Error decoding Base64:", error);
              fotoBase64Array.push(null); // Ensure the array length matches the data length
            }
          } else {
            fotoBase64Array.push(null); // No image for this item
          }
        });
      } else {
        console.warn("No data found.");
      }

      setAnggotaData(fetchedData || []); // Set empty array if no data
      setFotoBase64(fotoBase64Array); // Set all decoded images
      setTotalPages(response.data.totalPages || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching anggota data:", error);
    }
  };

  const updateVerifyUser = async (userId) => {
    try {
      const response = await GlobalApi.verifyUser(userId);
      toast.success("Pengguna berhasil diverifikasi!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);
      fetchData();
      fetchUnitKerja();
      fetchDataAnggota(currentPage, pageSize);

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
  }, [token, router, currentPage, pageSize]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleUserClick = (rowId) => {
    const row = anggotaData.find((item) => {
      return item.id === rowId;
    });
    setSelectedRow(row);
  };

  const handleClosePopup = () => {
    setSelectedRow(null);
  };

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const updateUnitKerja = (kecamatan) => {
    const filteredUnitKerja = unitKerja.filter(
      (item) => item.cabang === kecamatan
    );
    setFilteredUnitKerja(filteredUnitKerja);
  };

  const handleCabangChange = (e) => {
    const selectedKecamatan = e.target.value;
    setSelectedCabang(selectedKecamatan);
    updateUnitKerja(selectedKecamatan);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchDataAnggota(newPage, pageSize);
  };

  const handleSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    fetchDataAnggota(0, newSize);
  };

  const handleSearchClick = () => {
    fetchDataAnggota(currentPage, pageSize, selectedCabang, selectedUnitKerja);
  };

  const handleVerifyUserClick = (rowId) => {
    updateVerifyUser(rowId);
  };

  const handleResetClick = () => {
    setSelectedCabang("");
    setFilteredUnitKerja([]);
    fetchDataAnggota(currentPage, pageSize);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster />
      {isMobile ? (
        <MobileHeader handleBackClick={handleBackClick} />
      ) : (
        <HeaderHome />
      )}
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
              handleSearchClick={handleSearchClick}
              handleResetClick={handleResetClick}
            />

            <div className="overflow-x-auto">
              <DataTable
                anggotaData={anggotaData}
                handleUserClick={handleUserClick}
                fotoBase64={fotoBase64}
                handleVerifyUserClick={handleVerifyUserClick}
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
        />
      )}
    </div>
  );
};

const MobileHeader = ({ handleBackClick }) => (
  <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
    <div className="container mx-auto flex items-center">
      <FontAwesomeIcon
        icon={faArrowLeft}
        size="sm"
        onClick={handleBackClick}
        className="cursor-pointer mr-4"
      />
      <h1 className="text-base">Verifikasi Anggota</h1>
    </div>
  </header>
);

const FilterSection = ({
  cabang,
  unitKerja,
  selectedCabang,
  selectedUnitKerja,
  handleCabangChange,
  handleUnitKerjaChange,
  handleSearchClick,
  handleResetClick,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-16 text-sm">
    <div className="flex items-end gap-4">
      <DropdownCabang
        label="Cabang"
        options={cabang}
        selectedCabang={selectedCabang}
        handleChange={handleCabangChange}
      />
      <DropdownUnitKerja
        label="Unit Kerja"
        options={unitKerja}
        disabled={!selectedCabang}
        selectedUnitKerja={selectedUnitKerja}
        handleChange={handleUnitKerjaChange}
      />
      <Button
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded-lg flex items-center h-9"
        onClick={handleSearchClick}
      >
        <FontAwesomeIcon icon={faSearch} size="lg" />
        <span className="ml-2">Cari data filter</span>
      </Button>

      <Button
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center h-9"
        onClick={handleResetClick}
      >
        <FontAwesomeIcon icon={faUndo} size="lg" />
        <span className="ml-2">Reset Filter</span>
      </Button>
    </div>
  </div>
);

const DropdownCabang = ({ label, options, handleChange, selectedCabang }) => (
  <div>
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <select
      className="border rounded-lg p-2 w-56 bg-white shadow-sm"
      value={selectedCabang}
      onChange={handleChange}
    >
      <option>Pilih {label}</option>
      {options.map((item, index) => (
        <option key={item.idKecamatan} value={item.kecamatan}>
          {item.kecamatan}
        </option>
      ))}
    </select>
  </div>
);

const DropdownUnitKerja = ({ label, options, disabled, handleChange }) => (
  <div>
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <select
      className="border rounded-lg p-2 w-56 bg-white shadow-sm"
      disabled={disabled}
      onChange={handleChange}
    >
      <option value="">Pilih {label}</option>
      {options.map((item) => (
        <option key={item.id} value={item.unitKerja}>
          {item.unitKerja}
        </option>
      ))}
    </select>
  </div>
);

const DataTable = ({
  anggotaData,
  handleUserClick,
  fotoBase64,
  handleVerifyUserClick,
}) => (
  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
    <thead className="bg-gray-100 text-gray-600 text-center">
      <tr>
        <th className="py-2 px-4 border-b">No</th>
        <th className="py-2 px-4 border-b">Foto</th>
        <th className="py-2 px-4 border-b">Cabang</th>
        <th className="py-2 px-4 border-b">Unit Kerja</th>
        <th className="py-2 px-4 border-b">Nama</th>
        <th className="py-2 px-4 border-b">NPA PGRI</th>
        <th className="py-2 px-4 border-b">Status</th>
        <th className="py-2 px-4 border-b">Aksi</th>
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
        (anggotaData || []).map((item, index) => (
          <tr
            key={item.id}
            className="hover:bg-gray-50 text-sm cursor-pointer text-center"
          >
            <td className="py-2 px-4 border-b">{index + 1}</td>
            <td className="py-2 px-4 border-b">
              <Image
                src={`data:image/jpeg;base64,${fotoBase64[index]}`}
                width={50}
                height={50}
                alt="Anggota Foto"
                className="rounded-full"
              />
            </td>
            <td className="py-2 px-4 border-b">{item.cabang}</td>
            <td className="py-2 px-4 border-b">{item.unitKerja}</td>
            <td className="py-2 px-4 border-b">{item.namaLengkap}</td>
            <td className="py-2 px-4 border-b">{item.npaPgri}</td>
            <td className="py-2 px-4 border-b">
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
            </td>
            <td className="px-4 py-2 border-b">
              <a
                href={`https://wa.me/${item.nomorHp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faWhatsapp}
                  className="text-green-500"
                  size="lg mr-4"
                />
              </a>
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="lg mr-4 text-green-500"
                onClick={() => {
                  handleVerifyUserClick(item.id);
                }}
              />
              <FontAwesomeIcon
                icon={faUser}
                size="lg text-yellow-500 cursor-pointer"
                onClick={() => {
                  handleUserClick(item.id);
                }}
              />
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const PopupDetail = ({ selectedRow, handleClosePopup, fotoBase64 }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50 transition-opacity duration-300 ease-in-out">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-transform duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Detail Anggota</h2>
        <button
          onClick={handleClosePopup}
          className="text-gray-500 hover:text-gray-900 transition-colors duration-300 ease-in-out"
        >
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
        </button>
      </div>
      <div className="flex flex-col space-y-4">
        <div>
          <Image
            src={`data:image/png;base64,${fotoBase64}`}
            width={100}
            height={100}
            alt="Anggota Foto"
            className="mb-4 rounded-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-gray-700 mb-4">
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
        <div className="grid grid-cols-2 gap-4 text-gray-700">
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
            <p className="font-medium text-gray-600">Status:</p>
            {!selectedRow.isVerified && (
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
      </div>
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        className="bg-blue-700 text-white px-4 py-2 rounded-lg"
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
      >
        Previous
      </Button>
      <Button
        className="bg-blue-700 text-white px-4 py-2 rounded-lg"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
        disabled={currentPage === totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
};

export default VerifikasiAnggotaMutasi;
