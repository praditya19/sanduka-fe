"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
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
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

function DataAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
  const [filterCabang, setFilterCabang] = useState('');
  const [filterUnitKerja, setFilterUnitKerja] = useState('');
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("-- Unit Kerja --");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [anggota, setAnggota] = useState([]);
  const [cabang, setCabang] = useState([]);
  const [unitKerja, setUnitKerja] = useState([]);
  const [isCabangEnabled, setIsCabangEnabled] = useState(false);
  const [isUnitKerjaEnabled, setIsUnitKerjaEnabled] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCabang, setFilteredCabang] = useState([]);

  useEffect(() => {
    if (selectedCabang) {
      const filtered = unitKerja.filter(uk => uk.cabang === selectedCabang);
      setFilteredUnitKerja(filtered);
    } else {
      setFilteredUnitKerja([]);
    };

    setFilteredCabang(
      cabang.filter((item) =>
        item.kecamatan.toLowerCase().includes(filterCabang.toLowerCase())
      )
    );

    setFilteredUnitKerja(
      unitKerja.filter((item) =>
        item.unitKerja.toLowerCase().includes(filterUnitKerja.toLowerCase())
      )
    );

    fetchAnggota();
    fetchData();
    fetchUnitKerja();

    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);
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
  }, [token, router, selectedCabang, filterCabang, filterUnitKerja]);

  const fetchAnggota = async () => {
    try {
      const page = 0; // Or the page number you want to fetch
      const size = 50; // Or the number of items per page you want to fetch
      const response = await GlobalApi.getAllAnggota(page, size);
      setAnggota(response.data.content || []); // Use response.data.content if it's a Page object
    } catch (error) {
      console.error("Error fetching anggota:", error);
      setAnggota([]); // Optionally, set to an empty array if there's an error
    }
  };

  const fetchData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabang(response.data);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  const fetchUnitKerja = async () => {
    try {
      const response = await GlobalApi.getUnitKerja();
      setUnitKerja(response.data);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  const formatCurrency = (amount) => `Rp ${parseInt(amount).toLocaleString("id-ID")}`;

  const handlePrint = () => {
    const filteredDataForPrint = filteredData;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
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
          <div class="title">Data Anggota</div>
          <table>
            <thead>
              <tr class="header-row">
                <th>No</th>
                <th>Foto</th>
                <th>Nama</th>
                <th>Tanggal Lahir</th>
                <th>Unit Kerja</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDataForPrint
        .map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td></td>
                      <td>
                        <div class="font-bold">${item.namaLengkap}</div>
                        <div>${item.npaPgri}</div>
                        <div>${item.jabatan}</div>
                      </td>
                      <td>
                        <div>${item.tempatLahir},</div>
                        <div>${formatDate(item.tanggalLahir)}</div>
                        <div>${calculateAge(item.tanggalLahir)} Tahun</div>
                        <div>${calculateRetirementDate(item.tanggalLahir, item.statusPegawai)}</div>
                      </td>
                      <td>
                        <div>${item.cabang},</div>
                        <div>${item.unitKerja}</div>
                        <div>Anggota: ${item.tahunDiangkat ? item.tahunDiangkat : '-'}</div>
                        <div>
                          ${item.pangkatGolongan} || ${formatCurrency(item.iuran)}
                        </div>
                      </td>
                      <td>
                        <div>${item.status}</div>
                      </td>
                    </tr>
                  `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const sortedData = useMemo(() => {
    if (!Array.isArray(anggota)) return []; // Ensure it's an array

    let sortableItems = [...anggota];

    if (sortConfig && sortConfig.key) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        if (a[key] < b[key]) return direction * -1;
        if (a[key] > b[key]) return direction;
        return 0;
      });
    }

    return sortableItems;
  }, [anggota, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === "ascending" ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const statusFilter =
        selectedStatus === "Semua" || item.anggota === selectedStatus;
      const cabangFilter =
        selectedCabang === "-- Cabang --" || item.cabang === selectedCabang;
      const unitKerjaFilter =
        selectedUnitKerja === "-- Unit Kerja --" || item.unitKerja === selectedUnitKerja;

      const searchCabangFilter = item.cabang.toLowerCase().includes(filterCabang.toLowerCase());
      const searchUnitKerjaFilter = item.unitKerja.toLowerCase().includes(filterUnitKerja.toLowerCase());

      return statusFilter && cabangFilter && unitKerjaFilter &&
        (filterCabang ? searchCabangFilter : true) &&
        (filterUnitKerja ? searchUnitKerjaFilter : true);
    });
  }, [sortedData, selectedStatus, selectedCabang, selectedUnitKerja, filterCabang, filterUnitKerja]);

  const jumlahAnggota = filteredData.length;

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleCabangChange = () => {
    setIsCabangEnabled(true);
    setIsUnitKerjaEnabled(true);
  };

  const handleUnitKerjaChange = () => {
    setIsUnitKerjaEnabled(true);
  };

  const handlePindahCabangClick = () => {
    if (isCabangEnabled) {
      alert("Anggota berpindah cabang");
      setIsCabangEnabled(false);
      setIsUnitKerjaEnabled(false);
    } else {
      handleCabangChange();
    }
  };

  const handleUnitKerjaClick = () => {
    if (isUnitKerjaEnabled) {
      alert("Anggota berpindah Unit Kerja");
      setIsUnitKerjaEnabled(false);
    } else {
      handleUnitKerjaChange();
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateRetirementDate = (birthDateString, employmentType) => {
    const birthDate = new Date(birthDateString);
    const retirementAge = employmentType === 'PNS' ? 60 : 58;
    const retirementYear = birthDate.getFullYear() + retirementAge;
    const retirementDate = new Date(retirementYear, birthDate.getMonth(), birthDate.getDate());

    const formattedRetirementDate = retirementDate
      .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    return formattedRetirementDate;
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleKeluarAnggotaClick = () => {
    setPopupVisible(true);
  };

  const handleConfirm = () => {
    alert("Anggota dikeluarkan");
    setPopupVisible(false);
  };

  const handleCancel = () => {
    setPopupVisible(false);
  };

  const handleInputChange = (e) => {
    setFilterCabang(e.target.value);
    setShowDropdown(true);
  };

  const handleInputChangeUnit = (e) => {
    setFilterUnitKerja(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectChange = (e) => {
    setSelectedCabang(e.target.value);
    setFilterCabang(e.target.value);
    setShowDropdown(false);
  };

  const handleSelectChangeUnit = (e) => {
    setSelectedUnitKerja(e.target.value);
    setFilterUnitKerja(e.target.value);
    setShowDropdown(false);
  };

  const handleOptionClick = (kecamatan) => {
    setSelectedCabang(kecamatan);
    setFilterCabang(kecamatan);
    setShowDropdown(false);
  };

  const handleOptionClickUnit = (unitKerja) => {
    setSelectedUnitKerja(unitKerja);
    setFilterUnitKerja(unitKerja);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
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
              <h1 className="text-base">Data Anggota</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="mb-4">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2 mb-2 md:mb-0">
                <div className="relative flex flex-col md:flex">
                  <input
                    type="text"
                    placeholder="Cari Cabang..."
                    value={filterCabang}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-40 md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                  />
                  {showDropdown && filteredCabang.length > 0 && (
                    <div className="absolute left-0 mt-10 w-full bg-white border rounded shadow-lg z-10">
                      {filteredCabang.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleOptionClick(item.kecamatan)}
                        >
                          {item.kecamatan}
                        </div>
                      ))}
                    </div>
                  )}
                  <select
                    className="shadow appearance-none border rounded w-40 md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0 mt-2"
                    value={selectedCabang}
                    onChange={handleSelectChange}
                  >
                    <option value="">Pilih Cabang</option>
                    {cabang.map(item => (
                      <option key={item.id} value={item.kecamatan}>
                        {item.kecamatan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col md:flex">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari Unit Kerja..."
                      value={filterUnitKerja}
                      onChange={handleInputChangeUnit}
                      className="shadow appearance-none border rounded w-40 md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                    />
                    {showDropdown && filteredUnitKerja.length > 0 && (
                      <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-10">
                        {filteredUnitKerja.map((item) => (
                          <div
                            key={item.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => handleOptionClickUnit(item.unitKerja)}
                          >
                            {item.unitKerja}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <select
                    className="shadow appearance-none border rounded w-40 md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0 mt-2"
                    value={selectedUnitKerja}
                    onChange={handleSelectChangeUnit}
                  >
                    <option value="">Pilih Unit Kerja</option>
                    {unitKerja.map(item => (
                      <option key={item.id} value={item.unitKerja}>
                        {item.unitKerja}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-12 md:mb-0"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option>Semua</option>
                  <option>Aktif</option>
                  <option>Tidak Aktif</option>
                  <option>Meninggal</option>
                  <option>Keluar</option>
                </select>

                <p className="py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto mt-12">
                  Jumlah Anggota : {jumlahAnggota}
                </p>
              </div>
              <p className="text-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto mt-12">
                Data Anggota
              </p>
              <div className="flex items-end w-full md:w-auto mt-2 md:mt-0">
                <div className="space-x-2 w-full flex md:block mt-12 md:mt-1">
                  <label htmlFor="maxItems" className="mr-2">
                    Tampilkan:
                  </label>
                  <select
                    id="maxItems"
                    value={maxItems}
                    onChange={(e) => setMaxItems(parseInt(e.target.value))}
                    className="shadow appearance-none border rounded w-full md:w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <Button
                    className="px-8 mt-2 md:mt-0"
                    variant="outline"
                    onClick={handlePrint}
                  >
                    Cetak
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="container w-full table-auto mb-8">
              <thead>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    <div className="flex justify-between items-center">
                      <span>No</span>
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => requestSort("index")}
                      >
                        {getSortDirection("index")}
                      </span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    Foto
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    <div className="flex justify-between items-center">
                      <span>Nama</span>
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => requestSort("nama")}
                      >
                        {getSortDirection("nama")}
                      </span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    <div className="flex justify-between items-center">
                      <span>Tanggal Lahir</span>
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => requestSort("tanggal")}
                      >
                        {getSortDirection("tanggal")}
                      </span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    <div className="flex justify-between items-center">
                      <span>Unit Kerja</span>
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => requestSort("kerja")}
                      >
                        {getSortDirection("kerja")}
                      </span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    <div className="flex justify-between items-center">
                      <span>Keterangan</span>
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => requestSort("keterangan")}
                      >
                        {getSortDirection("keterangan")}
                      </span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.slice(0, maxItems).map((item, index) => {
                  const globalIndex = (currentPage - 1) * maxItems + index + 1; // Calculate globalIndex outside the JSX return
                  return (
                    <React.Fragment key={index}>
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="p-2 md:p-3 border text-center">
                          {globalIndex} {/* Use globalIndex instead of index + 1 */}
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
                          <Image
                            src={item.photoUrl}
                            className="rounded-full mx-auto"
                            width={100}
                            height={100}
                          />
                        </td>
                        <td className="p-2 md:p-3 border">
                          <div className="font-bold text-sm">{item.namaLengkap}</div>
                          <div className="text-sm">{item.npaPgri}</div>
                          <div className="text-sm">{item.jabatan}</div>
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
                          <div className="text-sm">{item.tempatLahir},</div>
                          <div className="text-sm">{formatDate(item.tanggalLahir)}</div>
                          <div className="text-sm">{calculateAge(item.tanggalLahir)} Tahun</div>
                          <div className="text-sm">
                            Pensiun : {calculateRetirementDate(item.tanggalLahir, item.statusPegawai)}
                          </div>
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
                          <div className="text-sm">{item.cabang},</div>
                          <div className="text-sm">{item.unitKerja}</div>
                          <div className="text-sm">
                            Anggota: {item.tahunDiangkat ? item.tahunDiangkat : '-'}
                          </div>
                          <div className="text-sm">
                            {item.pangkatGolongan} || {formatCurrency(item.iuran)}
                          </div>
                        </td>
                        <td className="p-2 text-center md:p-3 border md:table-cell hidden">
                          <div
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-xs font-semibold shadow-sm sm:ml-3 sm:w-auto ${item.status === "BUKAN ANGGOTA"
                              ? "bg-red-200 text-red-900"
                              : "bg-green-200 text-green-900"
                              }`}
                          >
                            {item.status}
                          </div>
                        </td>
                        <td className="p-2 md:p-3 border">
                          <div className="flex justify-center space-x-2">
                            <Link
                              href="#"
                              className="text-white bg-blue-500 p-2 border rounded-md"
                            >
                              <FaEdit className="w-4 h-4" title="Edit Data" />
                            </Link>
                            <Button
                              className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                              title="Mutasi"
                              onClick={() => openModal(item)}
                            >
                              <FaExchangeAlt className="w-4 h-4" />
                            </Button>
                            <Link
                              href="#"
                              className="text-white bg-red-500 p-2 border rounded-md"
                            >
                              <FaExclamationTriangle
                                className="w-4 h-4"
                                title="Lapor"
                              />
                            </Link>
                            <Link
                              href={`https://wa.me/${item.nomorHp}`}
                              className="text-white bg-green-500 p-2 border rounded-md"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaWhatsapp className="w-4 h-4" title="WA" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* Mobile View Row Expansion */}
                      <tr className="md:hidden">
                        <td colSpan="7" className="p-2 border">
                          <div className="flex justify-between items-center">
                            <button
                              className="text-blue-500"
                              onClick={() => handleExpand(index)}
                            >
                              <FaPlus className="w-4 h-4" />
                            </button>
                          </div>
                          {expandedIndex === index && (
                            <div className="mt-2">
                              <div className="font-bold">{item.namaLengkap}</div>
                              <div>{item.npaPgri}</div>
                              <div>{item.tugas}</div>
                              <div>{item.tempatLahir}, {formatDate(item.tanggalLahir)}</div>
                              <div>{calculateAge(item.tanggalLahir)} Tahun</div>
                              <div>Prediksi Pensiun: {calculateRetirementDate(item.tanggalLahir, item.statusPegawai)}</div>
                              <div>{item.cabang},</div>
                              <div>{item.unitKerja}</div>
                              <div>Anggota: {item.gabung}</div>
                              <div>{item.golongan}/{formatCurrency(item.iuran)}</div>
                              <div className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${item.anggota === 'Tidak Aktif' ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'}`}>
                                {item.anggota}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end items-center mb-4">
              {totalItems > 10 && (
                <>
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="mr-2"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center">
                    {totalPages > 1 && (
                      <ul className="flex space-x-1">
                        {/* Calculate the range of pages to display */}
                        {(() => {
                          let startPage = Math.max(1, currentPage - 1);
                          let endPage = Math.min(totalPages, currentPage + 1);

                          if (currentPage === 1) {
                            endPage = Math.min(3, totalPages);
                          } else if (currentPage === totalPages) {
                            startPage = Math.max(totalPages - 2, 1);
                          } else if (totalPages - currentPage < 2) {
                            startPage = Math.max(totalPages - 2, 1);
                          }

                          return Array.from(
                            { length: endPage - startPage + 1 },
                            (_, i) => startPage + i
                          );
                        })().map((number) => (
                          <li key={number}>
                            <Button
                              onClick={() => handlePageClick(number)}
                              className={`mx-1 px-4 py-2 border rounded-md ${currentPage === number
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                                }`}
                            >
                              {number}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="ml-2"
                  >
                    Next
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Modal for Mutation Actions */}
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
              <div className="flex flex-col items-center gap-2">
                <div className="w-full flex justify-center mb-2">
                  <img
                    src={currentItem?.photo || "default-photo-url"}
                    alt="Anggota"
                    className="w-32 h-32 object-cover rounded-full border border-gray-300"
                  />
                </div>
                <div className="flex flex-col items-center mb-2">
                  <Input
                    className="block text-sm font-medium w-full text-center"
                    placeholder="Nama"
                    value={currentItem?.namaLengkap || ""}
                    disabled
                  />
                  <Input
                    className="block text-sm font-medium mt-2 text-center"
                    placeholder="NPA"
                    value={currentItem?.npaPgri || ""}
                    disabled
                  />
                  <Input
                    className="block text-sm font-medium mt-2 text-center"
                    placeholder="Cabang"
                    value={currentItem?.cabang || ""}
                    disabled={!isCabangEnabled}
                  />
                  <Input
                    className="block text-sm font-medium mt-2 text-center"
                    placeholder="Unit Kerja"
                    value={currentItem?.unitKerja || ""}
                    disabled={!isUnitKerjaEnabled}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-teal-700 hover:bg-teal-500"
                  onClick={() => handlePindahCabangClick()}
                >
                  {isCabangEnabled ? "Konfirmasi Pindah Cabang" : "Pindah Cabang"}
                </Button>
                <Button
                  className="w-full bg-teal-700 hover:bg-teal-500"
                  onClick={() => handleUnitKerjaClick()}
                >
                  {isUnitKerjaEnabled ? "Konfirmasi Unit Kerja" : "Unit Kerja"}
                </Button>
                <Button
                  className="w-full bg-teal-700 hover:bg-teal-500"
                  onClick={handleKeluarAnggotaClick}
                >
                  Keluar Anggota
                </Button>
                <Button
                  className="w-full bg-teal-700 hover:bg-teal-500"
                  onClick={() => alert("Tidak Jelas")}
                >
                  Pensiun
                </Button>

                {isPopupVisible && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Keluar Anggota</h2>
                        <button
                          className=" text-xl font-bold text-gray-700 hover:text-red-500 focus:outline-none"
                          onClick={handleCancel}
                        >
                          x
                        </button>
                      </div>
                      <p>Apakah Anggota dikeluarkan?</p>
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button
                          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded"
                          onClick={handleConfirm}
                        >
                          Ya
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
                          onClick={handleCancel}
                        >
                          Tidak
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default DataAnggota;
