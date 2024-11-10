"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Modal from "react-modal";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaEdit,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaWhatsapp,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import HeaderMenu from "@/app/_components/HeaderMenu";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import SinkronData from "@/app/(auth)/singkron-data/page";

function DataAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] =
    useState("-- Unit Kerja --");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [filterCabang, setFilterCabang] = useState("");
  const [filterUnitKerja, setFilterUnitKerja] = useState("");
  const [anggota, setAnggota] = useState([]);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [rekapData, setRekapData] = useState([]);
  const [isCabangEnabled, setIsCabangEnabled] = useState(false);
  const [isUnitKerjaEnabled, setIsUnitKerjaEnabled] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, []);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);

    const filteredUnitKerja = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().startsWith(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(filteredUnitKerja.length > 0);
    setFilteredUnitKerja(filteredUnitKerja);

    const rekapFilteredByUnitKerja = originalRekapData.filter(
      (item) =>
        item.alamatKerja &&
        item.alamatKerja.toLowerCase().includes(input.toLowerCase())
    );

    if (input === "") {
      setRekapData(originalRekapData);
    } else {
      setRekapData(rekapFilteredByUnitKerja);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);

    const filtered = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang &&
        unitKerja.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
    );
    setFilteredUnitKerja(filtered);
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }

    setShowUnitKerjaDropdown(true);
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    setSelectedUnitKerja(unitKerja.unitKerja);
    setUnitKerjaInput(unitKerja.unitKerja);
    setShowUnitKerjaDropdown(false);
    const filteredRekapData = originalRekapData.filter(
      (item) => item.alamatKerja === unitKerja.unitKerja
    );
    setRekapData(filteredRekapData);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
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
      const page = 0;
      const size = 50;
      const response = await GlobalApi.getAllAnggota(page, size);
      setAnggota(response.data.content || []);
    } catch (error) {
      console.error("Error fetching anggota:", error);
      setAnggota([]);
    }
  };

  const handlePrint = () => {
    const filteredDataForPrint =
      selectedCabang === "-- Cabang --"
        ? anggota
        : anggota.filter((item) => item.cabang === selectedCabang);

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
                  text-align: center;
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
                .vertical-text {
                  display: flex;
                  flex-direction: column;
                }
              </style>
            </head>
            <body>
              <div class="title">Data Anggota ${
                selectedCabang === "-- Cabang --"
                  ? "Cabang"
                  : `Unit Kerja ${selectedCabang}`
              }</div>
              <table>
                <thead>
                  <tr class="header-row">
                    <th>No</th>
                    <th>Unit Kerja</th>
                    <th>Jumlah</th>
                    <th>Nama</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  ${groupedData
                    .slice(0, maxItems)
                    .map(
                      (group, index) => `
                    <tr>
                      <td rowspan="${group.items.length + 1}">${index + 1}</td>
                      <td rowspan="${group.items.length + 1}">${
                        group.kerja
                      }</td>
                      <td rowspan="${group.items.length + 1}">${
                        group.jumlah
                      }</td>
                    </tr>
                    ${group.items
                      .map(
                        (item, subIndex) => `
                      <tr>
                        <td>${subIndex + 1}. <span class="font-bold">${
                          item.namaLengkap
                        }</span> / ${item.npaPgri}</td>
                        <td class="vertical-text">
                            <div>KTA Digital : ${item.anggota}</div>
                            <div>Daspen : ${item.pgri}</div>
                            <div>Sanduka : </div>
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
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
    if (!Array.isArray(anggota)) return [];
    let sortableItems = [...anggota];

    if (sortConfig && sortConfig.key) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === "ascending" ? 1 : -1;

        if (a[key] < b[key]) return direction * -1;
        if (a[key] > b[key]) return direction;
        return 0;
      });
    }

    return sortableItems;
  }, [anggota, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const statusFilter =
        selectedStatus === "Semua" || item.anggota === selectedStatus;
      const cabangFilter =
        selectedCabang === "-- Cabang --" || item.cabang === selectedCabang;
      const unitKerjaFilter =
        selectedUnitKerja === "-- Unit Kerja --" ||
        item.unitKerja === selectedUnitKerja;

      const searchCabangFilter = item.cabang
        .toLowerCase()
        .includes(filterCabang.toLowerCase());
      const searchUnitKerjaFilter = item.unitKerja
        .toLowerCase()
        .includes(filterUnitKerja.toLowerCase());

      return (
        statusFilter &&
        cabangFilter &&
        unitKerjaFilter &&
        (filterCabang ? searchCabangFilter : true) &&
        (filterUnitKerja ? searchUnitKerjaFilter : true)
      );
    });
  }, [
    sortedData,
    selectedStatus,
    selectedCabang,
    selectedUnitKerja,
    filterCabang,
    filterUnitKerja,
  ]);

  const groupedData = useMemo(() => {
    const grouped = [];
    const groupByKerja = filteredData.reduce((acc, item) => {
      if (!acc[item.unitKerja]) {
        acc[item.unitKerja] = [];
      }
      acc[item.unitKerja].push(item);
      return acc;
    }, {});

    for (const [kerja, items] of Object.entries(groupByKerja)) {
      grouped.push({ kerja, jumlah: items.length, items });
    }

    return grouped;
  }, [filteredData]);

  const totalItems = groupedData.length;
  const totalPages = Math.ceil(totalItems / maxItems);

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

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const currentData = groupedData.slice(
    (currentPage - 1) * maxItems,
    currentPage * maxItems
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
              <h1 className="text-base">Anggota By Name</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderMenu />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <SinkronData />

          {!isMobile && (
            <div>
              <Button
                onClick={toggleSidebar}
                className={`p-2 rounded-md text-black ${
                  isSidebarOpen ? "bg-black" : "bg-transparent"
                } transition-colors duration-300 hover:bg-gray-500 focus:outline-none fixed top-5 sm:top-1 left-2 sm:left-4 z-50`}
              >
                <FontAwesomeIcon
                  icon={isSidebarOpen ? faTimes : faBars}
                  size="lg"
                  className={`text-black ${
                    isSidebarOpen ? "text-white" : "text-black"
                  }`}
                />
              </Button>
            </div>
          )}

          <div className="mb-4 ">
            <div className="flex flex-wrap items-start mt-40 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <div className="flex flex-col relative w-64" ref={cabangRef}>
                  <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onClick={handleCabangClick}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                    placeholder="Pilih Cabang"
                  />
                  {showCabangDropdown && (
                    <div className="absolute mt-11 w-full">
                      <Input
                        type="text"
                        onChange={(e) => handleCabangSearch(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-2"
                        placeholder="Cari atau ketik Cabang..."
                        autoFocus
                      />
                      {filteredCabangList.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1">
                          <li
                            onClick={() =>
                              handleSelectCabang({ kecamatan: "" })
                            }
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          >
                            Pilih Cabang
                          </li>
                          {filteredCabangList.map((cabang) => (
                            <li
                              key={cabang.id}
                              onClick={() => handleSelectCabang(cabang)}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              {cabang.kecamatan}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
                  <Input
                    type="text"
                    value={unitKerjaInput}
                    onFocus={handleUnitKerjaFocus}
                    onChange={handleUnitKerjaChange}
                    placeholder="Pilih Unit Kerja"
                    readOnly
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                    disabled={!selectedCabang}
                  />
                  {showUnitKerjaDropdown && (
                    <div className="absolute mt-11 w-full">
                      <Input
                        type="text"
                        onChange={(e) => handleUnitKerjaSearch(e.target.value)}
                        placeholder="Cari atau ketik Unit Kerja..."
                        autoFocus
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mt-2"
                      />
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1">
                        <li
                          onClick={() =>
                            handleUnitKerjaSelect({ unitKerja: "" })
                          }
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                          Pilih Unit Kerja
                        </li>
                        {filteredUnitKerja.length > 0 ? (
                          filteredUnitKerja.map((unitKerja) => (
                            <li
                              key={unitKerja.id}
                              onClick={() => handleUnitKerjaSelect(unitKerja)}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              {unitKerja.unitKerja}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-gray-500 cursor-default">
                            Tidak ada hasil
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  md:mb-0">
                  <option>Semua</option>
                </select>
              </div>
              <p className="text-center text-xl font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto ">
                Data Anggota By Name
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
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    No
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Unit Kerja
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700"
                    rowSpan="2"
                  >
                    Jumlah
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden"
                    rowSpan="2"
                  >
                    Nama
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden"
                    colSpan="3"
                  >
                    Keterangan
                  </th>
                  <th
                    className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden"
                    rowSpan="2"
                  >
                    Aksi
                  </th>
                </tr>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    KTA Digital
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    Daspen
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    Sanduka
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((group, groupIndex) => {
                  const globalIndex =
                    (currentPage - 1) * maxItems + groupIndex + 1;

                  return (
                    <React.Fragment key={groupIndex}>
                      <tr>
                        <td className="p-2 md:p-3 border text-center">
                          <div className="flex justify-center items-center">
                            {globalIndex}
                            <Button
                              className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden"
                              onClick={() => handleExpand(groupIndex)}
                            >
                              <FaPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>

                        <td className="border text-center text-sm">
                          {group.kerja}
                        </td>
                        <td className="border text-center text-sm">
                          {group.jumlah}
                        </td>
                        <td className="border md:table-cell hidden">
                          {group.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`mb-1 py-6 pl-2 ${
                                itemIndex < group.items.length - 1
                                  ? "border-b border-dashed"
                                  : ""
                              }`}
                            >
                              {itemIndex + 1}.{" "}
                              <span className="font-bold text-sm">
                                {item.namaLengkap}
                              </span>{" "}
                              / {item.npaPgri}
                            </div>
                          ))}
                        </td>
                        <td className="border text-center md:table-cell hidden">
                          {group.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`mb-1 pl-2 py-6 ${
                                itemIndex < group.items.length - 1
                                  ? "border-b border-dashed"
                                  : ""
                              }`}
                            >
                              <div className="text-sm">{item.anggota}</div>
                            </div>
                          ))}
                        </td>
                        <td className="border text-center md:table-cell hidden">
                          {group.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`mb-1 pl-2 py-6 ${
                                itemIndex < group.items.length - 1
                                  ? "border-b border-dashed"
                                  : ""
                              }`}
                            >
                              <div>{item.pgri}</div>
                            </div>
                          ))}
                        </td>
                        <td className="border text-center md:table-cell hidden">
                          {group.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`mb-1 pl-2 py-6 ${
                                itemIndex < group.items.length - 1
                                  ? "border-b border-dashed"
                                  : ""
                              }`}
                            >
                              <div>Aktif</div>
                            </div>
                          ))}
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
                          {group.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className={`mb-1 pl-2 py-2 ${
                                itemIndex < group.items.length - 1
                                  ? "border-b border-dashed"
                                  : ""
                              }`}
                            >
                              <Button
                                href="#"
                                className="text-white bg-blue-500 p-2 border rounded-md mx-1"
                              >
                                <FaEdit className="w-4 h-4" title="Edit Data" />
                              </Button>
                              <Button
                                className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md mx-1"
                                title="Mutasi"
                                onClick={() => openModal(item)}
                              >
                                <FaExchangeAlt className="w-4 h-4" />
                              </Button>
                              <Button
                                href="#"
                                className="text-white bg-red-500 p-2 border rounded-md mx-1"
                              >
                                <FaExclamationTriangle
                                  className="w-4 h-4"
                                  title="Lapor"
                                />
                              </Button>
                              <Button
                                href={`https://wa.me/${item.nomorHp}`}
                                className="text-white bg-green-500 p-2 border rounded-md mx-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FaWhatsapp className="w-4 h-4" title="WA" />
                              </Button>
                            </div>
                          ))}
                        </td>
                      </tr>

                      {expandedIndex === groupIndex && (
                        <tr className="md:hidden">
                          <td colSpan="7" className="p-2 border">
                            {group.items.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className={`mb-1 py-6 pl-2 ${
                                  itemIndex < group.items.length - 1
                                    ? "border-b border-dashed"
                                    : ""
                                }`}
                              >
                                {itemIndex + 1}.{" "}
                                <span className="font-bold text-sm">
                                  {item.namaLengkap}
                                </span>{" "}
                                / {item.npaPgri}
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end items-center mb-4">
              {totalItems > maxItems && (
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
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((number) => (
                          <li key={number}>
                            <Button
                              onClick={() => handlePageClick(number)}
                              className={`mx-1 px-4 py-2 border rounded-md ${
                                currentPage === number
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
                  {isCabangEnabled
                    ? "Konfirmasi Pindah Cabang"
                    : "Pindah Cabang"}
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
