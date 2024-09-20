"use client";
import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import Image from "next/image";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

function PencarianAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
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
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedNama, setSelectedNama] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [query, setQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [fotoBase64, setFotoBase64] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (selectedCabang) {
      const filtered = unitKerja.filter(uk => uk.cabang === selectedCabang);
      setFilteredUnitKerja(filtered);
    } else {
      setFilteredUnitKerja([]);
    };

    // setFilteredCabang(
    //   cabang.filter((item) =>
    //     item.kecamatan.toLowerCase().includes(filterCabang.toLowerCase())
    //   )
    // );

    // setFilteredUnitKerja(
    //   unitKerja.filter((item) =>
    //     item.unitKerja.toLowerCase().includes(filterUnitKerja.toLowerCase())
    //   )
    // );

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
  }, [token, router, selectedCabang]);

  const fetchAnggota = async () => {
    try {
      const page = 0;
      const size = 50;
      const response = await GlobalApi.getAllAnggota(page, size);
      const fotoBase64Array = [];

      const fetchedData = response.data.content;

      if (fetchedData && fetchedData.length > 0) {
        fetchedData.forEach((item) => {
          console.log('test', item)
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

      setFotoBase64(fotoBase64Array);
      setLoading(false);
      setAnggota(fetchedData || []);

    } catch (error) {
      console.error("Error fetching anggota:", error);
      setAnggota([]);
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

  const formatCurrency = (amount) => {
    return `Rp ${parseInt(amount).toLocaleString("id-ID")}`;
  };

  const handlePrint = () => {
    const filteredDataForPrint = filteredData;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Data Anggota</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .title, .subtitle {
              text-align: center;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #00796b;
            }
            .subtitle {
              font-size: 20px;
              font-weight: normal;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #ccc;
            }
            th, td {
              padding: 8px;
              border: 1px solid #ccc;
            }
            .header-row th[colspan="2"] {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
              background-color: #e0f2f1;
            }
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
        .map(
          (item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td></td>
                      <td>
                        <div class="font-bold">${item.nama}</div>
                        <div>${item.npa}</div>
                        <div>${item.tugas}</div>
                      </td>
                      <td>
                        <div>${item.lahir}, ${item.tanggal}</div>
                        <div>${item.usia} Tahun</div>
                        <div>Prediksi Pensiun: ${calculateRetirementDate(
            item.tanggal
          )}</div>
                      </td>
                      <td>
                      <div>${item.cabang},</div>
                      <div>${item.kerja},</div>
                        <div>anggota: ${item.gabung}</div>
                        <div>${item.golongan}/${formatCurrency(
            item.iuran
          )}</div>
                      </td>
                      <td>${item.anggota}</td>
                    </tr>
                  `
        )
        .join("")}
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
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
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

      const searchLower = searchQuery.toLowerCase();

      const searchFilter =
        item.namaLengkap?.toLowerCase().includes(searchLower) ||
        item.npaPgri?.toLowerCase().includes(searchLower) ||
        item.jabatan?.toLowerCase().includes(searchLower) ||
        item.tempatLahir?.toLowerCase().includes(searchLower) ||
        item.cabang?.toLowerCase().includes(searchLower) ||
        item.unitKerja?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower);

      return statusFilter && cabangFilter && unitKerjaFilter && searchFilter;
    });
  }, [sortedData, selectedStatus, selectedCabang, selectedUnitKerja, searchQuery]); // Updated dependency array

  const jumlahAnggota = filteredData.length;

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-2"
              />
              <h1 className="text-base">Pencarian Anggota</h1>
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
          <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <div className="mb-4">
              <div className="flex flex-wrap items-start mt-16 justify-between">
                <div className="flex flex-wrap items-center space-x-2 mb-2 md:mb-0">
                  <select
                    className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value)}
                  >
                    <option value="">Pilih Cabang</option>
                    {cabang.map(item => (
                      <option key={item.id} value={item.kecamatan}>
                        {item.kecamatan}
                      </option>
                    ))}
                  </select>

                  <select
                    className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                    value={selectedUnitKerja}
                    onChange={(e) => setSelectedUnitKerja(e.target.value)}
                  >
                    <option value="">Pilih Unit Kerja</option>
                    {filteredUnitKerja.map(item => (
                      <option key={item.id} value={item.unitKerja}>
                        {item.unitKerja}
                      </option>
                    ))}
                  </select>
                  <input
                    className="shadow appearance-none border rounded w-full md:w-80 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                    type="text"
                    placeholder="Cari Anggota"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                    Jumlah Anggota : {jumlahAnggota}
                  </p>
                </div>
                <p className="text-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                  Pencarian Anggota
                </p>
                <div className="flex items-end w-full md:w-auto mt-2 md:mt-0">
                  <div className="space-x-2 w-full flex md:block">
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
                    <th className="p-2 md:p-3 border text-white bg-teal-700">
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
                    <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.slice(0, maxItems).map((item, index) => {
                    const isEvenRow = index % 2 === 0;
                    const isNotMember = item.status === "BUKAN ANGGOTA";
                    const itemStatusClass = isNotMember ? "bg-red-200 text-red-900" : "bg-green-200 text-green-900";
                    const globalIndex = (currentPage - 1) * maxItems + index + 1;

                    return (
                      <React.Fragment key={index}>
                        <tr className={isEvenRow ? "bg-gray-50" : "bg-white"}>
                          <td className="p-2 md:p-3 border text-center">
                            <div className="flex justify-center items-center">
                              {globalIndex}
                              <Button
                                className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden"  // `lg:hidden` makes the button hidden on screens larger than the "lg" size
                                onClick={() => handleExpand(index)}
                              >
                                <FaPlus className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                          {/* <td className="p-2 md:p-3 border text-center">{index + 1}</td> */}
                          <td className="p-2 md:p-3 border">
                            {fotoBase64[index] ? (
                              <Image
                                src={`data:image/jpeg;base64,${fotoBase64[index]}`}
                                className="rounded-full mx-auto"
                                width={100}
                                height={100}
                                alt="Belum ada Foto"
                              />
                            ) : (
                              <span>Belum ada foto</span>
                            )}
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
                            <div className="text-sm">Pensiun: {calculateRetirementDate(item.tanggalLahir, item.statusPegawai)}</div>
                          </td>
                          <td className="p-2 md:p-3 border md:table-cell hidden">
                            <div className="text-sm">{item.cabang},</div>
                            <div className="text-sm">{item.unitKerja}</div>
                            <div className="text-sm">Anggota: {item.tahunDiangkat || '-'}</div>
                            <div className="text-sm">{item.pangkatGolongan} || {formatCurrency(item.iuran)}</div>
                          </td>
                          <td className="p-2 text-center md:p-3 border md:table-cell hidden">
                            <div
                              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-xs font-semibold shadow-sm sm:ml-3 sm:w-auto ${item.status === "BUKAN ANGGOTA"
                                ? "bg-red-200 text-red-900"
                                : "bg-green-200 text-green-900"
                                }`}
                            >
                              {item.status === "ANGGOTA" ? "Aktif" : item.status}
                            </div>
                          </td>
                          <td className="p-2 md:p-3 border md:table-cell hidden">
                            <div className="flex justify-center space-x-2">
                              <Button
                                className="text-white bg-blue-500 hover:bg-blue-600 p-2 border rounded-md"
                                title="Edit Data"
                                onClick={() => router.push('/anggota/edit-anggota')}
                              >
                                <FaEdit className="w-4 h-4" />
                              </Button>
                              <Button
                                className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                                title="Mutasi"
                                onClick={() => openModal(item)}
                              >
                                <FaExchangeAlt className="w-4 h-4" />
                              </Button>
                              <Link href="#" className="text-white bg-red-500 p-2 border rounded-md">
                                <FaExclamationTriangle className="w-4 h-4" title="Lapor" />
                              </Link>
                              <Link href={`https://wa.me/${item.hp}`} className="text-white bg-green-500 p-2 border rounded-md" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp className="w-4 h-4" title="WA" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {/* Mobile View Row Expansion */}
                        {expandedIndex === index && (
                          <tr className="md:hidden">
                            <td colSpan="7" className="p-2 border">
                              <div className="mt-2">
                                <div className="font-bold">{item.namaLengkap}</div>
                                <div>{item.npaPgri}</div>
                                <div>{item.jabatan}</div>
                                <div>{item.tempatLahir}, {formatDate(item.tanggalLahir)}</div>
                                <div>{calculateAge(item.tanggalLahir)} Tahun</div>
                                <div>Pensiun: {calculateRetirementDate(item.tanggalLahir, item.statusPegawai)}</div>
                                <div>{item.cabang},</div>
                                <div>{item.unitKerja}</div>
                                <div>Anggota: {item.tahunDiangkat || '-'}</div>
                                <div>{item.golongan}/{formatCurrency(item.iuran)}</div>
                                <div className={`text-center rounded-md px-3 py-2 text-sm font-semibold w-20 ${itemStatusClass}`}>
                                  {item.status === "ANGGOTA" ? "Aktif" : item.status}
                                </div>
                                <div className="flex justify-center space-x-2 mt-2">
                                  <Link href="#" className="text-white bg-blue-500 p-2 border rounded-md">
                                    <FaEdit className="w-4 h-4" title="Edit Data" />
                                  </Link>
                                  <Button className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md" title="Mutasi" onClick={() => openModal(item)}>
                                    <FaExchangeAlt className="w-4 h-4" />
                                  </Button>
                                  <Link href="#" className="text-white bg-red-500 p-2 border rounded-md">
                                    <FaExclamationTriangle className="w-4 h-4" title="Lapor" />
                                  </Link>
                                  <Link href={`https://wa.me/${item.hp}`} className="text-white bg-green-500 p-2 border rounded-md" target="_blank" rel="noopener noreferrer">
                                    <FaWhatsapp className="w-4 h-4" title="WA" />
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
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
                <div className="space-y-2">
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-500"
                    onClick={() => alert("Pindah Cabang")}
                  >
                    Pindah Cabang
                  </Button>
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-500"
                    onClick={() => alert("Unit Kerja")}
                  >
                    Unit Kerja
                  </Button>
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-500"
                    onClick={() => alert("Keluar Anggota")}
                  >
                    Keluar Anggota
                  </Button>
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-500"
                    onClick={() => alert("Tidak Jelas")}
                  >
                    Tidak Jelas
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div >
  );
}

export default PencarianAnggota;