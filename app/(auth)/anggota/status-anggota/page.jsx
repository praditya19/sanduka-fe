"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Modal from "react-modal";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  FaPlusCircle,
  FaMinusCircle,
  FaEdit,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaWhatsapp,
} from "react-icons/fa";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext.js";
import GlobalApi from "@/app/_utils/GlobalApi";



function StatusAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [filterCabang, setFilterCabang] = useState("");
  const [filterUnitKerja, setFilterUnitKerja] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedTingkat, setSelectedTingkat] = useState("");
  const [anggota, setAnggota] = useState([]);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isCabangEnabled, setIsCabangEnabled] = useState(false);
  const [isUnitKerjaEnabled, setIsUnitKerjaEnabled] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [fotoBase64, setFotoBase64] = useState("");

  const [rekapData, setRekapData] = useState([]);

  const [cabangList, setCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const profileImageUrl = "/profile.png";

  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);

  const [originalRekapData, setOriginalRekapData] = useState([]);


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

    await fetchRekapData(cabang.kecamatan);
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


    const filteredRekapData = Array.isArray(originalRekapData)
      ? originalRekapData.filter(
        (item) => item.alamatKerja === unitKerja.unitKerja
      )
      : [];

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


  const fetchRekapData = async (cabang) => {
    try {
      const data = await GlobalApi.getRekapAnggotaByCabang(cabang);
      setRekapData(data);
      setOriginalRekapData(data);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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
  }, [token, router]);

  useEffect(() => {
    const fetchAnggota = async () => {
      try {
        const page = 0;
        const size = 100;
        const response = await GlobalApi.getAllAnggota(page, size);
        const fotoBase64Array = [];

        const fetchedData = response.data.content;

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

        setFotoBase64(fotoBase64Array);
        setLoading(false);
        setAnggota(fetchedData || []);
      } catch (error) {
        console.error("Error fetching anggota:", error);
        setAnggota([]);
      }
    };
    fetchAnggota();
  }, []);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const jumlahAnggota = anggota.length;

  const countMembersByLevel = (level) => {
    return anggota.filter((member) => member.tingkatSekolah === level).length;
  };

  const aggregateData = () => {
    const aggregated = {
      JumlahPNS: 0,
      JumlahPPPK: 0,
      JumlahNON_PNS: 0,
      JumlahSemua: anggota.length,
    };

    const aggregatedByUnitKerja = {};
    anggota.forEach((item) => {
      if (!aggregatedByUnitKerja[item.unitKerja]) {
        aggregatedByUnitKerja[item.unitKerja] = {
          PNS: 0,
          PPPK: 0,
          NON_PNS: 0,
          anggota: 0,
          Iuran: 0,
        };
      }
      switch (item.statusPegawai) {
        case "PNS":
          aggregated.JumlahPNS++;
          aggregatedByUnitKerja[item.unitKerja].PNS++;
          break;
        case "PPPK":
          aggregated.JumlahPPPK++;
          aggregatedByUnitKerja[item.unitKerja].PPPK++;
          break;
        case "NON_PNS":
          aggregated.JumlahNON_PNS++;
          aggregatedByUnitKerja[item.unitKerja].NON_PNS++;
          break;
        default:
          break;
      }
      aggregatedByUnitKerja[item.unitKerja].anggota++;
      aggregatedByUnitKerja[item.unitKerja].Iuran += item.iuran;
    });

    return {
      aggregated,
      aggregatedByUnitKerja: Object.entries(aggregatedByUnitKerja).map(
        ([kerja, data], index) => ({
          kerja,
          ...data,
          index,
        })
      ),
    };
  };

  const { aggregated } = aggregateData();

  const { JumlahPNS, JumlahPPPK, JumlahNON_PNS } = aggregated;

  const tingkatSekolahMap = {
    TK_RA: "TK/RA",
    SD_MI: "SD/MI",
    SMP_MTS: "SMP/MTS",
    SMA_SMK_MA: "SMA/SMK/MA",
    PERGURUAN_TINGGI: "Perguruan Tinggi",
    PAUD: "PAUD",
  };

  const formatTingkat = (tingkat) => {
    return tingkatSekolahMap[tingkat] || tingkat;
  };

  const categories = [
    { title: "PNS", count: JumlahPNS, items: ["PAUD", "SMP_MTS"] },
    { title: "NON PNS", count: JumlahNON_PNS, items: ["TK_RA", "SMA_SMK_MA"] },
    { title: "PPPK", count: JumlahPPPK, items: ["SD_MI", "PERGURUAN_TINGGI"] },
  ];

  const handlePrint = () => {
    const filteredDataForPrint = filteredMembersData.slice(0, maxItems);
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
          <html>
            <head>
              <title>Status Anggota</title>
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
              </style>
            </head>
            <body>
              <div class="title">Status Anggota</div>
              <table>
                <thead>
                  <tr class="header-row">
                    <th>No</th>
                    <th>Foto</th>
                    <th>Data Anggota</th>
                    <th>Tingkat Sekolah</th>
                    <th>Cabang</th>
                    <th>Status</th>
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
                            <div class="font-bold">${item.namaLengkap}</div>
                            <div>${item.npaPgri}</div>
                            <div>${formatDate(
            item.tanggalLahir
          )}, ${calculateAge(item.tanggalLahir)}</div>
                            <div>Usia ${calculateAge(
            item.tanggalLahir
          )} Tahun</div>
                            <div>${item.unitKerja}</div>
                            <div>${item.jabatan}</div>
                            <div>${item.nomorHp}</div>
                          </td>
                          <td>${item.tingkatSekolah}</td>
                          <td>${item.cabang}</td>
                          <td>${item.status}</td>
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

      const tingkatSekolahFilter =
        selectedTingkat === "" || item.tingkatSekolah === selectedTingkat;

      return (
        statusFilter &&
        cabangFilter &&
        unitKerjaFilter &&
        (filterCabang ? searchCabangFilter : true) &&
        (filterUnitKerja ? searchUnitKerjaFilter : true) &&
        tingkatSekolahFilter
      );
    });
  }, [
    sortedData,
    selectedStatus,
    selectedCabang,
    selectedUnitKerja,
    filterCabang,
    filterUnitKerja,
    selectedTingkat,
  ]);

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    return age;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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

  const filteredMembersData =
    selectedCabang === "-- Cabang --"
      ? anggota
      : anggota.filter((member) => member.cabang === selectedCabang);

  const totalItems = filteredMembersData.length;
  const totalPages = Math.ceil(totalItems / maxItems);

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

  const handlePageClick = (number) => {
    setCurrentPage(number);
  };

  const handlePindahCabangUnit = () => {
    router.push("/anggota/data-anggota/mutasiCabangUnit");
  };


  const handleEditClick = () => {
    router.push("/anggota/edit-anggota");
  };

  const getVisiblePages = () => {
    const visiblePages = [];
    const leftLimit = Math.max(1, currentPage - 1);
    const rightLimit = Math.min(totalPages, currentPage + 1);

    for (let i = leftLimit; i <= rightLimit; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  const startIndex = (currentPage - 1) * maxItems;
  const endIndex = startIndex + maxItems;

  const paginatedMembersData = filteredMembersData.slice(startIndex, endIndex);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="flex flex-wrap justify-between mt-14 mb-4 mx-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-full md:w-1/3 mb-4 md:mb-0"
              >
                <div className="bg-teal-500 text-white p-2 rounded-lg mb-2 w-40 text-center">
                  {category.title}
                </div>
                <div className="text-2xl font-bold mb-2">{category.count}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between mt-4 mb-4 mx-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-full md:w-1/3 mb-4"
              >
                <div className="flex flex-wrap justify-center mx-2">
                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border rounded-lg shadow-md p-4 mb-2 w-full sm:w-60 mx-2 text-center"
                    >
                      <img
                        src={`/images/${item
                          .toLowerCase()
                          .replace(/\//g, "-")}.png`}
                        alt={item}
                        className="mb-2 w-40 mx-auto"
                      />
                      <Button className="bg-blue-500 hover:bg-blue-700 w-full">
                        {countMembersByLevel(item)} Anggota
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex flex-wrap items-start mt-2 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <div className="flex flex-col relative w-64" ref={cabangRef}>
                  <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onFocus={() => setShowCabangDropdown(true)}
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
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-0">
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

                <div className="flex flex-col md:flex">
                  <div
                    className="flex flex-col relative w-64"
                    ref={unitKerjaRef}
                  >
                    <Input
                      type="text"
                      value={unitKerjaInput}
                      onFocus={handleUnitKerjaFocus}
                      onChange={handleUnitKerjaChange}
                      placeholder="Pilih Unit Kerja"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
                      disabled={!selectedCabang}
                    />
                    {showUnitKerjaDropdown && (
                      <div className="absolute mt-11 w-full">
                        <Input
                          type="text"
                          onChange={(e) =>
                            handleUnitKerjaSearch(e.target.value)
                          }
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
                </div>
                <select
                  className="shadow appearance-none border rounded w-full md:w-44 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline md:mb-0"
                  value={selectedTingkat}
                  onChange={(e) => setSelectedTingkat(e.target.value)}
                >
                  <option value="">Pilih Tingkat Sekolah</option>
                  <option value="PAUD">PAUD</option>
                  <option value="TK_RA">TK/RA</option>
                  <option value="SD_MI">SD/MI</option>
                  <option value="SMP_MTS">SMP/MTS</option>
                  <option value="SMA_SMK_MA">SMA/SMK/MA</option>
                  <option value="PERGURUAN_TINGGI">Perguruan Tinggi</option>
                </select>
                <p className="py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                  Jumlah Anggota : {jumlahAnggota}
                </p>
              </div>
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
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">No</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Foto
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">Nama</th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    Tingkat Sekolah
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    Cabang
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    Keterangan
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembersData.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="p-2 md:p-3 border text-center">
                        {startIndex + index + 1}
                        <button
                          onClick={() => toggleRow(index)}
                          className="text-blue-500 md:hidden"
                        >
                          {expandedRows[index] ? (
                            <FaMinusCircle className="w-4 h-4" title="Collapse" />
                          ) : (
                            <FaPlusCircle className="w-4 h-4" title="Expand" />
                          )}
                        </button>
                      </td>
                      <td className="p-2 md:p-3 border md:table-cell">
                        <Image
                          src={
                            fotoBase64[index]
                              ? `data:image/jpeg;base64,${fotoBase64[index]}`
                              : profileImageUrl
                          }
                          alt={`Foto ${item.namaPelapor || "User"}`}
                          width={50}
                          height={50}
                          className="rounded"
                          unoptimized={true}
                        />
                      </td>
                      <td className="p-2 md:p-3 border">
                        <div className="font-bold text-sm">{item.namaLengkap}</div>
                        <div className="text-sm">{item.npaPgri}</div>
                        <div className="text-sm">
                          {item.tempatLahir}, {item.tanggalLahir}
                        </div>
                        <div className="text-sm">Usia: {item.usia} Tahun</div>
                        <div className="text-sm">{item.unitKerja}</div>
                        <div className="text-sm">{item.jabatan}</div>
                      </td>
                      <td className="p-2 md:p-3 border text-center text-sm md:table-cell hidden">
                        {item.tingkatSekolah}
                      </td>
                      <td className="p-2 md:p-3 border text-center text-sm md:table-cell hidden">
                        {item.cabang}
                      </td>
                      <td className="p-2 md:p-3 border text-center text-sm md:table-cell hidden">
                        <div
                          className={` inline-flex w-full justify-center rounded-md px-3 py-2 text-xs font-semibold shadow-sm ${item.status === "BUKAN ANGGOTA"
                            ? "bg-red-200 text-red-900"
                            : "bg-green-200 text-green-900"
                            }`}
                        >
                          {item.role === "USER"
                            ? "Aktif"
                            : item.status_keanggotaan}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 border text-center md:table-cell hidden">
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
                              <Button
                                className="text-white bg-cyan-500 p-2 border rounded-md cursor-not-allowed opacity-50"
                                title="Mutasi"
                                type="button"
                                disabled
                              >
                                <FaExchangeAlt className="w-4 h-4" />
                              </Button>

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

                              <Link
                                href="#"
                                className="text-white bg-red-500 hover:bg-red-600 p-2 border rounded-md"
                                title="Lapor"
                              >
                                <FaExclamationTriangle className="w-4 h-4" />
                              </Link>

                              <Link
                                href={`https://wa.me/${item.nomorHp}`}
                                className="text-white bg-green-500 hover:bg-green-600 p-2 border rounded-md"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                              >
                                <FaWhatsapp className="w-4 h-4" />
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Row for mobile */}
                    {expandedRows[index] && (
                      <tr className="md:hidden">
                        <td colSpan="3" className="p-2 bg-gray-100">
                          <div className="text-sm">Tingkat Sekolah: {item.tingkatSekolah}</div>
                          <div className="text-sm">Cabang: {item.cabang}</div>
                          <div className="text-sm">Keterangan: {item.status}</div>
                          <div
                            className={` text-center rounded-md px-3 py-2 text-sm font-semibold w-20 ${item.status === "BUKAN ANGGOTA"
                              ? "bg-red-200 text-red-900"
                              : "bg-green-200 text-green-900"
                              }`}
                          >
                            {item.role === "USER"
                              ? "Aktif"
                              : item.status_keanggotaan}
                          </div>
                          <div className="flex justify-center space-x-2 mt-2">
                            <Button
                              className="text-white bg-blue-500 hover:bg-blue-600 p-2 border rounded-md"
                              title="Edit Data"
                              onClick={() =>
                                router.push(
                                  `/anggota/edit-anggota?id=${item.id}`
                                )
                              }
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
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {totalItems >= maxItems && (
              <div className="flex justify-center mt-4 gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Prev
                </button>

                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${page === currentPage
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Last
                </button>
              </div>
            )}
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

export default StatusAnggota;
