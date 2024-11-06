"use client";
import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  FaPlusCircle,
  FaMinusCircle,
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
import toast, { Toaster } from "react-hot-toast";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

function DataAnggota() {
  const [maxItems, setMaxItems] = useState(10);
  const [filterCabang, setFilterCabang] = useState("");
  const [filterUnitKerja, setFilterUnitKerja] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [anggota, setAnggota] = useState([]);
  const [cabang, setCabang] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [popupVisibleKeluar, setPopupVisibleKeluar] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [fotoBase64, setFotoBase64] = useState("");
  const [rekapData, setRekapData] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [searchCabang, setSearchCabang] = useState("");
  const [showDropdownCabangUnit, setShowDropdownCabangUnit] = useState(false);
  const [listCabang, setListCabang] = useState([]);
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [showDropdownUnit, setShowDropdownUnit] = useState(false);
  const [formData, setFormData] = useState({ unit: "" });
  const [isUnitKerjaDisabled, setIsUnitKerjaDisabled] = useState(true);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [searchUnit, setSearchUnit] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const unitKerjaRef = useRef(null);

  const [originalRekapData, setOriginalRekapData] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownCabangUnit(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownCabang(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (unitKerjaRef.current && !unitKerjaRef.current.contains(event.target)) {
      setShowDropdownUnit(false);
    }
  };
  useEffect(() => {
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
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setListCabang(response.data);
        setCabangOptions(response.data);
        setFilteredCabangOptions(response.data);
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
        setAllUnitKerja(response.data);
        setUnitKerjaOptions(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  useEffect(() => {
    if (selectedCabang) {
      const units = allUnitKerja.filter(
        (unit) => unit.cabang.toLowerCase() === selectedCabang.toLowerCase()
      );
      setFilteredUnitKerja(units);
      setIsUnitKerjaDisabled(false);
    } else {
      setFilteredUnitKerja([]);
      setIsUnitKerjaDisabled(true);
    }
  }, [selectedCabang, allUnitKerja]);

  const handleCabangSelect = (cabang) => {
    console.log("cabang yang dipilih:", cabang.kecamatan);
    setSelectedCabang(cabang.kecamatan);
    setShowDropdownCabang(false);
  };

  const handleUnitKerjaChange = (e) => {
    const unitValue = e.target.value;
    setFormData((prev) => ({ ...prev, unit: unitValue }));

    const filteredUnits = allUnitKerja.filter(
      (unit) =>
        unit.cabang.toLowerCase() === selectedCabang.toLowerCase() &&
        unit.unitKerja.toLowerCase().includes(unitValue.toLowerCase())
    );
    setFilteredUnitKerja(filteredUnits);
    setShowDropdownUnit(true);
  };

  useEffect(() => {
    if (!unitKerjaInput && selectedCabang) {
      fetchRekapData(selectedCabang);
    }
  }, [unitKerjaInput, selectedCabang]);

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

  const formatCurrency = (amount) =>
    `Rp ${parseInt(amount).toLocaleString("id-ID")}`;

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
                .map(
                  (item, index) => `
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
                        <div>${calculateRetirementDate(
                          item.tanggalLahir,
                          item.statusPegawai
                        )}</div>
                      </td>
                      <td>
                        <div>${item.cabang},</div>
                        <div>${item.unitKerja}</div>
                        <div>Anggota: ${
                          item.tahunDiangkat ? item.tahunDiangkat : "-"
                        }</div>
                        <div>
                          ${item.pangkatGolongan} || ${formatCurrency(
                    item.iuran
                  )}
                        </div>
                      </td>
                      <td>
                        <div>${item.status}</div>
                      </td>
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
        selectedCabang === "" || item.cabang === selectedCabang;
      const unitKerjaFilter =
        selectedUnitKerja === "" || item.unitKerja === selectedUnitKerja;

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

  const jumlahAnggota = filteredData.length;

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleCabangChange = (e) => {
    const value = e.target.value;
    setSearchCabang(value);
    const filtered = cabangOptions.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCabangOptions(filtered);
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

  const calculateRetirementDate = (birthDateString, employmentType) => {
    const birthDate = new Date(birthDateString);
    const retirementAge = employmentType === "PNS" ? 60 : 58;
    const retirementYear = birthDate.getFullYear() + retirementAge;
    const retirementDate = new Date(
      retirementYear,
      birthDate.getMonth(),
      birthDate.getDate()
    );

    const formattedRetirementDate = retirementDate
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

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

  const handlePopupKeluar = () => {
    setPopupVisibleKeluar(true);
  };

  const handleKeluarAnggota = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");
      setPopupVisibleKeluar(false);
      toast.success("Anggota berhasil dihapus!", {
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Gagal mengeluarkan anggota:", error);
      toast.error("Gagal menghapus anggota.", {
        autoClose: 3000,
      });
    }
  };

  const handleCancelKeluar = () => {
    setPopupVisibleKeluar(false);
  };

  const handlePopup = () => {
    setPopupVisible(true);
  };

  const handlePensiunAnggota = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");
      await GlobalApi.pensiunAnggota(anggotaId);
      console.log("Anggota berhasil Pensiun!");
      setPopupVisible(false);
      toast.success("Anggota berhasil Pensiun!", {
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Gagal mengeluarkan anggota:", error);
      toast.error("Gagal pensiun anggota.", {
        autoClose: 3000,
      });
    }
  };

  const handlePindahCabangUnit = () => {
    router.push("/anggota/data-anggota/mutasiCabangUnit");
  };

  const handleEditClick = () => {
    router.push("/anggota/edit-anggota");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderHome />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Toaster
            toastOptions={{
              style: {
                marginTop: "1%",
                fontSize: "1.25rem",
                padding: "16px",
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
          <div className="mb-4">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2 mb-2 md:mb-0">
                <>
                  <div
                    ref={dropdownRef}
                    className="relative flex flex-col md:flex ml-2"
                  >
                    <Input
                      type="text"
                      placeholder="Pilih Cabang"
                      value={selectedCabang}
                      readOnly
                      onFocus={() => {
                        setShowDropdownCabang(true);
                        setFilteredCabangOptions(cabangOptions);
                      }}
                      className="border rounded-lg p-2 w-full bg-white shadow-sm"
                    />

                    {showDropdownCabang && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
                        <Input
                          type="text"
                          value={searchCabang}
                          onChange={handleCabangChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out"
                          placeholder="Cari Cabang"
                        />
                        <ul className="max-h-48 overflow-y-auto">
                          {filteredCabangOptions.map((cabang) => (
                            <li
                              key={cabang.idKecamatan}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleCabangSelect(cabang)}
                            >
                              {cabang.kecamatan}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex">
                    <div className="relative" ref={unitKerjaRef}>
                      <Input
                        type="text"
                        className="border rounded-lg p-2 w-full bg-white shadow-sm mt-2"
                        placeholder="Pilih Unit Kerja"
                        readOnly
                        value={formData.unit}
                        onChange={handleUnitKerjaChange}
                        onFocus={() => {
                          setShowDropdownUnit(true);
                          setSearchUnit("");
                        }}
                        disabled={isUnitKerjaDisabled}
                      />

                      {showDropdownUnit && (
                        <div className="absolute mt-0 w-full">
                          <Input
                            type="text"
                            value={searchUnit}
                            onChange={(e) => {
                              setSearchUnit(e.target.value);
                              handleUnitKerjaChange(e);
                            }}
                            placeholder="Cari Unit Kerja"
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mt-0"
                          />
                          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                            <li
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  unit: "",
                                }));
                                setShowDropdownUnit(false);
                                setSearchUnit("");
                              }}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                            >
                              Pilihan Kosong
                            </li>

                            {/* Daftar unit kerja yang difilter */}
                            {filteredUnitKerja.length > 0 ? (
                              filteredUnitKerja.map((unit) => (
                                <li
                                  key={unit.id}
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      unit: unit.unitKerja,
                                    }));
                                    setShowDropdownUnit(false);
                                    setSearchUnit("");
                                  }}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                >
                                  {unit.unitKerja}
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
                </>
                <select
                  className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option>Semua</option>
                  <option>Aktif</option>
                  <option>Tidak Aktif</option>
                  <option>Meninggal</option>
                  <option>Keluar</option>
                </select>

                <p className="py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                  Jumlah Anggota : {jumlahAnggota}
                </p>
              </div>
              {/* <p className="text-center font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                Data Anggota
              </p> */}
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
                {currentData.map((item, index) => {
                  const globalIndex = index + 1;
                  return (
                    <React.Fragment key={index}>
                      <tr
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="p-2 md:p-3 border text-center">
                          <div className="flex justify-center items-center">
                            {globalIndex}
                            <Button
                              className="text-blue-500 bg-transparent hover:bg-transparent lg:hidden"
                              onClick={() => handleExpand(index)}
                            >
                              {expandedIndex === index ? (
                                <FaMinusCircle />
                              ) : (
                                <FaPlusCircle />
                              )}
                            </Button>
                          </div>
                        </td>
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
                          <div className="font-bold text-sm">
                            {item.namaLengkap}
                          </div>
                          <div className="text-sm">{item.npaPgri}</div>
                          <div className="text-sm">{item.jabatan}</div>
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
                          <div className="text-sm">{item.tempatLahir},</div>
                          <div className="text-sm">
                            {formatDate(item.tanggalLahir)}
                          </div>
                          <div className="text-sm">
                            {calculateAge(item.tanggalLahir)} Tahun
                          </div>
                          <div className="text-sm">
                            Pensiun :{" "}
                            {calculateRetirementDate(
                              item.tanggalLahir,
                              item.statusPegawai
                            )}
                          </div>
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
                          <div className="text-sm">{item.cabang},</div>
                          <div className="text-sm">{item.unitKerja}</div>
                          <div className="text-sm">
                            Anggota:{" "}
                            {item.tahunDiangkat ? item.tahunDiangkat : "-"}
                          </div>
                          <div className="text-sm">
                            {item.pangkatGolongan} ||{" "}
                            {formatCurrency(item.iuran)}
                          </div>
                        </td>
                        <td className="p-2 text-center md:p-3 border md:table-cell hidden">
                          <div
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-xs font-semibold shadow-sm sm:ml-3 sm:w-auto ${
                              item.status === "BUKAN ANGGOTA"
                                ? "bg-red-200 text-red-900"
                                : "bg-green-200 text-green-900"
                            }`}
                          >
                            {item.role === "USER"
                              ? "Aktif"
                              : item.status_keanggotaan}
                          </div>
                        </td>
                        <td className="p-2 md:p-3 border md:table-cell hidden">
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
                            <Button
                              className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                              title="Mutasi"
                              type="button"
                              onClick={() => {
                                sessionStorage.setItem("anggotaId", item.id);
                                openModal(item);
                              }}
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

                      <tr className="md:hidden">
                        <td colSpan="7" className="p-2 border">
                          {expandedIndex === index && (
                            <div className="mt-2">
                              <div className="font-bold">
                                {item.namaLengkap}
                              </div>
                              <div>{item.npaPgri}</div>
                              <div>{item.tugas}</div>
                              <div>
                                {item.tempatLahir},{" "}
                                {formatDate(item.tanggalLahir)}
                              </div>
                              <div>{calculateAge(item.tanggalLahir)} Tahun</div>
                              <div>
                                Prediksi Pensiun:{" "}
                                {calculateRetirementDate(
                                  item.tanggalLahir,
                                  item.statusPegawai
                                )}
                              </div>
                              <div>{item.cabang},</div>
                              <div>{item.unitKerja}</div>
                              <div>Anggota: {item.gabung}</div>
                              <div>{item.golongan}</div>
                              <div
                                className={` text-center rounded-md px-3 py-2 text-sm font-semibold w-20 ${
                                  item.status === "BUKAN ANGGOTA"
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
              {totalItems > itemsPerPage && (
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
                  <Image
                    src={
                      fotoBase64
                        ? "/profile.png"
                        : `data:image/jpeg;base64,${fotoBase64}`
                    }
                    width={80}
                    height={80}
                    alt="Anggota Foto"
                    className="rounded-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 justify-around">
                  <div className="flex flex-col text-left">
                    <p className="font-medium text-gray-600 justify-start ">
                      Nama Lengkap:
                    </p>
                    <p className="text-sm">{currentItem?.namaLengkap || ""}</p>
                    <p className="font-medium text-gray-600 mt-3">Cabang:</p>
                    <p className="text-sm">{currentItem?.cabang || ""}</p>
                  </div>

                  <div className="flex flex-col text-left ">
                    <p className="font-medium text-gray-600">NPA:</p>
                    <p className=" text-sm">{currentItem?.npaPgri || ""}</p>
                    <p className="font-medium text-gray-600 text-left mt-3">
                      Unit Kerja:
                    </p>
                    <p className="ml-0 text-sm">
                      {currentItem?.unitKerja || ""}
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
                      <div className="bg-white rounded-lg p-6 w-2/5 text-center shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Apakah Anda yakin?
                        </h2>
                        <p className="text-gray-600 mt-2 mb-4">
                          Apakah Anda yakin akan menghapus anggota ini?
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={handleKeluarAnggota}
                            className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                          >
                            Ya, Saya Yakin
                          </button>
                          <button
                            onClick={handleCancelKeluar}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                          >
                            Batal
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
                      <div className="bg-white rounded-lg p-6 w-2/5 text-center shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Apakah Anda yakin ?
                        </h2>
                        <p className="text-gray-600 mt-2 mb-4">
                          Apakah Anda yakin untuk mengubah anggota menjadi
                          pensiun?
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={handlePensiunAnggota}
                            className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-500 transition duration-200"
                          >
                            Ya, Saya Yakin
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                          >
                            Batal
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
      </div>
    </div>
  );
}

export default DataAnggota;
