"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  FaExclamationTriangle,
  FaWhatsapp,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";
import { membersData } from "../data.js";
import { useRouter } from "next/navigation";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import Image from "next/image";

function PencarianAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
  const [selectedUnitKerja, setSelectedUnitKerja] =
    useState("-- Unit Kerja --");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedNama, setSelectedNama] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const calculateRetirementDate = (birthDate) => {
    const [day, month, year] = birthDate.split(" ");
    const birthYear = parseInt(year);
    const birthMonth = new Date(`${month} 1, ${year}`).getMonth() + 1;
    const retirementYear = birthYear + 60;
    return `${birthMonth.toString().padStart(2, "0")}-${retirementYear}`;
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

  const sortedData = React.useMemo(() => {
    let sortableItems = [...membersData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [membersData, sortConfig]);

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

  const filteredData = sortedData.filter((item) => {
    const query = searchQuery.toLowerCase();
    const statusFilter =
      selectedStatus === "Semua" || item.anggota === selectedStatus;
    const cabangFilter =
      selectedCabang === "-- Cabang --" || item.cabang === selectedCabang;
    const unitKerjaFilter =
      selectedUnitKerja === "-- Unit Kerja --" ||
      item.unitKerja === selectedUnitKerja;
    const nama = item.nama.toLowerCase().includes(query);
    const npa = item.npa.toLowerCase().includes(query);
    const cabang = item.cabang.toLowerCase().includes(query);
    const unit = item.kerja.toLowerCase().includes(query);
    const lahir = item.lahir.toLowerCase().includes(query);
    const tanggal = item.tanggal.toLowerCase().includes(query);

    return (
      statusFilter &&
      cabangFilter &&
      unitKerjaFilter &&
      (nama || npa || tanggal || cabang || lahir || unit)
    );
  });

  const jumlahAnggota = filteredData.length;

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
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
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
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
          <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <div className="mb-4">
              <div className="flex flex-wrap items-start mt-16 justify-between">
                <div className="flex flex-wrap items-center space-x-2 mb-2 md:mb-0">
                  <select
                    className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value)}
                  >
                    <option>-- Cabang --</option>
                    <option>BANGSRI</option>
                    <option>JEPARA</option>
                    {/* Add other options as needed */}
                  </select>
                  <select
                    className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
                    value={selectedUnitKerja}
                    onChange={(e) => setSelectedUnitKerja(e.target.value)}
                  >
                    <option>-- Unit Kerja --</option>
                    <option>SMAN 2 Jepara</option>
                    <option>SDN 3 Jepara</option>
                  </select>
                  {/* <select
              className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0"
              value={selectedNama}
              onChange={(e) => setSelectedNama(e.target.value)}
            >
              <option>-- Nama Anggota --</option>
              <option>Nanda Dwi Kurniawan</option>
            </select> */}
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
                    <th className="p-2 md:p-3 border text-white bg-teal-700">
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
                    <th className="p-2 md:p-3 border text-white bg-teal-700">
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
                    <th className="p-2 md:p-3 border text-white bg-teal-700">
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
                  {filteredData.slice(0, maxItems).map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="p-2 md:p-3 border text-center">
                        {index + 1}
                      </td>
                      <td className="p-2 md:p-3 border">
                        <Image
                          src={item.photoUrl}
                          className="rounded-full mx-auto"
                          width={100}
                          height={100}
                        />
                      </td>
                      <td className="p-2 md:p-3 border">
                        <div className="font-bold">{item.nama}</div>
                        <div>{item.npa}</div>
                        <div>{item.tugas}</div>
                      </td>
                      <td className="p-2 md:p-3 border">
                        <div>
                          {item.lahir}, {item.tanggal}
                        </div>
                        <div>{item.usia} Tahun</div>
                        <div>
                          Prediksi Pensiun:{" "}
                          {calculateRetirementDate(item.tanggal)}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 border">
                        <div>{item.cabang},</div>
                        <div>{item.kerja}</div>
                        <div>anggota: {item.gabung}</div>
                        <div>
                          {item.golongan}/{formatCurrency(item.iuran)}
                        </div>
                      </td>
                      <td className="p-2 text-center md:p-3 border">
                        <div
                          className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto ${
                            item.anggota === "Tidak Aktif"
                              ? "bg-red-200 text-red-900"
                              : "bg-green-200 text-green-900"
                          }`}
                        >
                          {item.anggota}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 border">
                        <div className="flex justify-center space-x-2">
                          {/* <Link href="#" className="text-white bg-blue-500 p-2 border rounded-md">
                      <FaEdit className="w-4 h-4" title="Edit Data" />
                    </Link>
                    <Button
                      className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                      title="Mutasi"
                      onClick={() => openModal(item)}
                    >
                      <FaExchangeAlt className="w-4 h-4" />
                    </Button> */}
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
                            href={`https://wa.me/${item.hp}`}
                            className="text-white bg-green-500 p-2 border rounded-md"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaWhatsapp className="w-4 h-4" title="WA" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}

export default PencarianAnggota;
