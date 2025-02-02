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
import { ClipLoader } from "react-spinners";

function DataAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] =
    useState("-- Unit Kerja --");
  const [role, setRole] = useState("");
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
      const size = 7000;
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
        </div>
      </div>
    </div>
  );
}

export default DataAnggota;
