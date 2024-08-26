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
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

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

  const tableData = [
    {
      no: 1,
      foto: "/sanduka.png",
      cabang: "BANGSRI",
      unitKerja: "SMAN 1 Jepara",
      nama: "Bagas Adi Prabowo, S.Pd",
      npaPGRI: "123456",
      contactNumber: "+6287839465101",
      status: "Belum di verifikasi",
    },
    {
      no: 2,
      foto: "/sanduka.png",
      cabang: "BANGSRI",
      unitKerja: "SMAN 1 Jepara",
      nama: "Nanda coding, S.Pd",
      npaPGRI: "123456",
      contactNumber: "+62895704340678",
      status: "Belum di verifikasi",
    },
  ];

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
  }, [token, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleUserClick = (rowId) => {
    const row = tableData.find((item) => item.no === rowId);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
            />

            <div className="overflow-x-auto">
              <DataTable
                tableData={tableData}
                handleUserClick={handleUserClick}
              />
            </div>

            {selectedRow && (
              <PopupDetail
                selectedRow={selectedRow}
                handleClosePopup={handleClosePopup}
              />
            )}
          </div>
        </div>
      </div>
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
  handleCabangChange,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-16 text-sm">
    <DropdownCabang
      label="Cabang"
      options={cabang}
      handleChange={handleCabangChange}
    />
    <DropdownUnitKerja
      label="Unit Kerja"
      options={unitKerja}
      disabled={!selectedCabang}
    />
    <div className="flex items-end">
      <Button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center">
        <FontAwesomeIcon icon={faSearch} size="lg" />
        <span className="ml-2">Cari data filter</span>
      </Button>
    </div>
  </div>
);

const DropdownCabang = ({ label, options, handleChange }) => (
  <div>
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <select
      className="border rounded-lg p-2 w-full bg-white shadow-sm"
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

const DropdownUnitKerja = ({ label, options, disabled }) => (
  <div>
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <select
      className="border rounded-lg p-2 w-full bg-white shadow-sm"
      disabled={disabled}
    >
      <option>Pilih {label}</option>
      {options.map((item, index) => (
        <option key={item.id} value={item.unitKerja}>
          {item.unitKerja}
        </option>
      ))}
    </select>
  </div>
);

const DataTable = ({ tableData, handleUserClick }) => (
  <table className="table-auto w-full mt-4 bg-white shadow-lg rounded-lg border border-gray-200">
    <thead className="bg-teal-700 text-white text-sm">
      <tr>
        {[
          "No.",
          "Foto",
          "Cabang",
          "Unit Kerja",
          "Nama",
          "NPA PGRI",
          "Status",
          "Whatsapp",
          "Aksi",
        ].map((header, index) => (
          <th key={index} className="px-4 py-2 text-center font-semibold">
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="text-base">
      {tableData.map((row, index) => (
        <tr key={index} className="border-b hover:bg-gray-50">
          <td className="px-4 py-2 text-center">{row.no}</td>
          <td className="px-4 py-2 text-center">
            <Image
              src={row.foto}
              width={60}
              height={60}
              alt="Anggota Foto"
              className="mx-auto"
            />
          </td>
          <td className="px-4 py-2 text-center">{row.cabang}</td>
          <td className="px-4 py-2 text-center">{row.unitKerja}</td>
          <td className="px-4 py-2 text-center">{row.nama}</td>
          <td className="px-4 py-2 text-center">{row.npaPGRI}</td>
          <td className="px-4 py-2 text-center text-yellow-500">
            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
            {row.status}
          </td>
          <td className="px-4 py-2 text-center">
            <a
              href={`https://wa.me/${row.contactNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon
                icon={faWhatsapp}
                className="text-green-500"
                size="lg"
              />
            </a>
          </td>
          <td className="px-4 py-2 text-center">
            <button
              onClick={() => handleUserClick(row.no)}
              className="text-teal-700 hover:underline flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="lg"
                className="mr-2"
              />
              <FontAwesomeIcon
                icon={faTimesCircle}
                size="lg"
                className="mr-2 text-red-500"
              />
              <FontAwesomeIcon
                icon={faUser}
                size="lg"
                className="text-yellow-500"
              />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PopupDetail = ({ selectedRow, handleClosePopup }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50 transition-opacity duration-300 ease-in-out">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-transform duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Detail Anggota</h2>
        <button
          onClick={handleClosePopup}
          className="text-gray-500 hover:text-gray-900 transition-colors duration-300 ease-in-out"
        >
          <FontAwesomeIcon icon={faTimesCircle} size="2x" />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <Image
          src={selectedRow.foto}
          width={150}
          height={150}
          alt="Anggota Foto"
          className="mb-4"
        />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {selectedRow.nama}
        </h3>
        <p className="text-gray-700 mb-1">
          Cabang: <span className="font-medium">{selectedRow.cabang}</span>
        </p>
        <p className="text-gray-700 mb-1">
          Unit Kerja:{" "}
          <span className="font-medium">{selectedRow.unitKerja}</span>
        </p>
        <p className="text-gray-700 mb-2">
          NPA PGRI: <span className="font-medium">{selectedRow.npaPGRI}</span>
        </p>
        <p
          className={`${
            selectedRow.status.includes("Aktif")
              ? "text-green-500"
              : "text-red-500"
          } flex items-center`}
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
          {selectedRow.status}
        </p>
      </div>
    </div>
  </div>
);

export default VerifikasiAnggotaMutasi;
