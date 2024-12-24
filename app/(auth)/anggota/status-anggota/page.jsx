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
  FaTimes
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
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
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [fotoBase64, setFotoBase64] = useState("");
  const dropdownRef = useRef(null);
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [searchCabang, setSearchCabang] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [listCabang, setListCabang] = useState([]);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [formData, setFormData] = useState({ unit: "" });
  const [isUnitKerjaDisabled, setIsUnitKerjaDisabled] = useState(true);
  const [searchUnitKerja, setSearchUnitKerja] = useState('');
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isPopupDaspen, setIsPopupDaspen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupVisibleKeluar, setPopupVisibleKeluar] = useState(false);
  const [kategoriDaspen, setKategoriDaspen] = useState("");
  const [daspenData, setDaspenData] = useState(null);
  const [isKategoriChanged, setIsKategoriChanged] = useState(false);
  const [role, setRole] = useState("");
  const [rekapData, setRekapData] = useState([]);
  const profileImageUrl = "/profile.png";
  const [cabangList, setCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);

  const [originalRekapData, setOriginalRekapData] = useState([]);

  const handleDataDaspen = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");
    if (anggotaId) {
      try {
        const response = await GlobalApi.getUserById(anggotaId);
        // console.log("data", response)
        if (response) {
          // console.log("Data anggota yang diterima dari getUserById:", response);

          // Set kategoriDaspen dengan nilai dari response
          setKategoriDaspen(response.kategoriDaspen || "Tidak tersedia");

          const nip = response.nip;

          if (nip) {
            const fileResponse = await GlobalApi.getFileByNip(nip);

            if (fileResponse) {
              // console.log("Data file untuk NIP:", nip, fileResponse);
              setDaspenData(fileResponse);
              setIsPopupDaspen(true);
            } else {
              console.log("File tidak ditemukan untuk NIP:", nip);
            }
          } else {
            console.log("NIP tidak ditemukan dalam data anggota");
          }
        } else {
          console.log("Data anggota tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          <div style={{ textAlign: "center" }}>
            {/* Ikon silang di atas */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "48px", height: "48px", color: "red" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
              </svg>
            </div>
            {/* Teks di bawah ikon */}
            <strong style={{ fontSize: "1.75rem", display: "block" }}>
              NIP tidak ditemukan, silahkan melakukan sinkronisasi dahulu.
            </strong>
          </div>,
          {
            icon: false,
            duration: 5000,
            style: {
              borderRadius: "10px",
              background: "white",
              padding: "16px",
            },
          }
        );
      }
    } else {
      console.log("Anggota ID tidak ditemukan di sessionStorage");
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

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setFormData((prev) => ({
      ...prev,
      unit: "",
    }));
    setFilteredUnitKerja(
      allUnitKerja.filter(
        (unit) => unit.cabang.toLowerCase() === cabang.kecamatan.toLowerCase()
      )
    );
    setIsUnitKerjaDisabled(false);
    setShowDropdownCabang(false);
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

  const handleUnitKerjaSelect = (selectedItem) => {
    if (!selectedItem.unitKerja) {
      // Case: "Semua Unit Kerja" selected
      setSelectedUnitKerja("");
      setFilteredUnitKerja(allUnitKerja);
      setRekapData(originalRekapData); // Reset to original data
    } else {
      // Case: Specific unit kerja selected
      setSelectedUnitKerja(selectedItem.unitKerja);
      setFilteredUnitKerja([selectedItem]);
      const filteredRekap = originalRekapData.filter(
        item => item.alamatKerja === selectedItem.unitKerja
      );
      setRekapData(filteredRekap);
    }
    setShowDropdownUnitKerja(false);
    setSearchUnitKerja('');
  };

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const cabang = sessionStorage.getItem("cabang");
    if (role === "ADMIN" && cabang) {
      setSelectedCabang(cabang);
    }
  }, []);

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
    const fetchAnggota = async (
      page = 0,
      cabang = "",
      unitKerja = ""
    ) => {
      try {
        const fotoBase64Array = [];
        const fetchedData = await GlobalApi.getAllAnggota(page, cabang, unitKerja);

        if (fetchedData.length > 0) {
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
        setAnggota(fetchedData);
        setCurrentPage(page + 1);
      } catch (error) {
        console.error("Error fetching anggota:", error);
        setAnggota([]);
        setLoading(false);
      }
    };
    fetchAnggota();
  }, []);


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
    SMA_MA: "SMA/MA",
    SMK: "SMK",
    PERGURUAN_TINGGI: "Perguruan Tinggi",
    PAUD: "PAUD",
    SEKOLAH_LUAR_BIASA: "SEKOLAH LUAR BIASA",
    LAINNYA: "LAINNYA"
  };

  const formatTingkat = (tingkat) => {
    return tingkatSekolahMap[tingkat] || tingkat;
  };

  const categories = [
    { title: "PNS", count: JumlahPNS, items: ["PAUD", "SMP_MTS", "PERGURUAN_TINGGI"] },
    { title: "NON PNS", count: JumlahNON_PNS, items: ["TK_RA", "SMA_MA", "SEKOLAH_LUAR_BIASA"] },
    { title: "PPPK", count: JumlahPPPK, items: ["SD_MI", "SMK", "LAINNYA"] },
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
        selectedCabang === "" || item.cabang === selectedCabang;
      const unitKerjaFilter =
        selectedUnitKerja === "" || item.unitKerja === selectedUnitKerja;

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
        tingkatSekolahFilter // Tambahkan filter tingkat sekolah di sini
      );
    });
  }, [
    sortedData,
    selectedStatus,
    selectedCabang,
    selectedUnitKerja,
    filterCabang,
    filterUnitKerja,
    selectedTingkat, // Tambahkan dependensi tingkat
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
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const filteredMembersData = anggota.filter((member) => {
    const isCabangMatch =
      selectedCabang === "-- Cabang --" || member.cabang === selectedCabang;
    const isTingkatMatch =
      !selectedTingkat || member.tingkatSekolah === selectedTingkat;

    return isCabangMatch && isTingkatMatch;
  });

  const handleCabangChange = (e) => {
    const value = e.target.value;
    setSearchCabang(value);
    const filtered = cabangOptions.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCabangOptions(filtered);
  };

  const startIndex = (currentPage - 1) * maxItems;
  const endIndex = startIndex + maxItems;

  const paginatedMembersData = filteredMembersData.slice(startIndex, endIndex);

  const imageMap = {
    PAUD: "paud.png",
    SMP_MTS: "smp.png",
    TK_RA: "tk.png",
    SMA_MA: "sma.png",
    SMK: "smk.png",
    SD_MI: "sd.png",
    PERGURUAN_TINGGI: "perguruan_tinggi.png",
    SEKOLAH_LUAR_BIASA: "slb.png",
    LAINNYA: "lainnya.png",
  };

  const handlePindahCabangUnit = () => {
    router.push("/anggota/data-anggota/mutasiCabangUnit");
  };

  const handleEditClick = () => {
    router.push("/anggota/edit-anggota");
  };

  const closePopup = () => {
    setIsPopupDaspen(false);
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getVisiblePages = () => {
      let pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (currentPage <= 2) {
          endPage = 2;
        }
        if (currentPage >= totalPages - 1) {
          startPage = totalPages - 2;
        }

        if (startPage > 2) {
          pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }

        // if (endPage < totalPages - 1) {
        //   pages.push('...');
        // }

        // if (totalPages > 1) {
        //   pages.push(totalPages);
        // }
      }

      return pages;
    };

    return (
      <div className="flex justify-center mt-4 gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          First
        </button>

        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Prev
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page !== 'number'}
            className={`px-3 py-1 border rounded text-sm ${page === currentPage
              ? "bg-blue-500 text-white"
              : page === '...'
                ? "bg-white cursor-default"
                : "bg-white hover:bg-gray-50"
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Next
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          Last
        </button>
      </div>
    );
  };

  const handlePopup = () => {
    setPopupVisible(true);
  };

  const handlePopupKeluar = () => {
    setPopupVisibleKeluar(true);
  };

  const handleKategoriChange = (e) => {
    // Simpan kategori Daspen sebelumnya
    setPreviousKategoriDaspen(kategoriDaspen);
    // Set kategoriDaspen dengan nilai baru yang dipilih
    setKategoriDaspen(e.target.value);
    setIsKategoriChanged(true); // Menampilkan popup konfirmasi
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedIndex(null); // Reset expanded row when changing pages
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
                      {/* Gambar */}
                      <img
                        src={`/${imageMap[item] || "default.png"}`}
                        alt={item}
                        className="mb-2 h-16 w-auto mx-auto object-contain"
                      />

                      {/* Nama Kategori */}
                      <p className="text-md font-semibold text-gray-800 mb-2">
                        {item === "PERGURUAN_TINGGI" || item === "SEKOLAH_LUAR_BIASA"
                          ? item.replace(/_/g, ' ')
                          : item.replace(/_/g, '/')}
                      </p>

                      {/* Tombol */}
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
                <>
                  <div ref={cabangRef} className="relative w-full md:w-40">
                    <Input
                      type="text"
                      placeholder="Pilih Cabang"
                      value={selectedCabang}
                      readOnly={sessionStorage.getItem("role") === "ADMIN"}
                      onFocus={() => {
                        if (sessionStorage.getItem("role") !== "ADMIN") {
                          setShowDropdownCabang(true);
                          setFilteredCabangOptions(cabangOptions);
                        }
                      }}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />

                    {showDropdownCabang && sessionStorage.getItem("role") !== "ADMIN" && (
                      <div className="absolute z-10 border rounded bg-white shadow-sm mt-1 w-full">
                        <div className="p-2">
                          <Input
                            type="text"
                            value={searchCabang}
                            onChange={handleCabangChange}
                            placeholder="Cari Cabang..."
                            className="w-full border rounded py-2 px-3 mb-2"
                          />
                        </div>
                        <ul className="max-h-44 overflow-y-auto">
                          <li
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleCabangSelect({})}
                          >
                            Semua Cabang
                          </li>
                          {filteredCabangOptions.map((item) => (
                            <li
                              key={item.id}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleCabangSelect(item)}
                            >
                              {item.kecamatan}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Unit Kerja Dropdown */}
                  <div ref={unitKerjaRef} className="relative w-full md:w-40">
                    <Input
                      type="text"
                      placeholder="Pilih Unit Kerja"
                      value={selectedUnitKerja}
                      readOnly
                      onFocus={() => {
                        setShowDropdownUnitKerja(true);
                        setFilteredUnitKerjaOptions(
                          selectedCabang === "Pilih Cabang"
                            ? allUnitKerja
                            : allUnitKerja.filter(uk => uk.cabang === selectedCabang)
                        );
                      }}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      disabled={selectedCabang === "Pilih Cabang"}
                    />

                    {showDropdownUnitKerja && (
                      <div className="absolute z-10 border rounded bg-white shadow-sm mt-1 w-full">
                        <div className="p-2">
                          <Input
                            type="text"
                            value={searchUnitKerja}
                            onChange={handleUnitKerjaChange}
                            placeholder="Cari Unit Kerja..."
                            className="w-full border rounded py-2 px-3 mb-2"
                          />
                        </div>
                        <ul className="max-h-44 overflow-y-auto">
                          <li
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleUnitKerjaSelect({})}
                          >
                            Semua Unit Kerja
                          </li>
                          {filteredUnitKerjaOptions.map((item) => (
                            <li
                              key={item.id}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleUnitKerjaSelect(item)}
                            >
                              {item.unitKerja}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
                <select
                  className="shadow appearance-none border rounded w-full md:w-44 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline md:mb-0"
                  value={selectedTingkat}
                  onChange={(e) => setSelectedTingkat(e.target.value)}
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="PAUD">PAUD</option>
                  <option value="TK_RA">TK/RA</option>
                  <option value="SD_MI">SD/MI</option>
                  <option value="SMP_MTS">SMP/MTS</option>
                  <option value="SMA_MA">SMA/MA</option>
                  <option value="SMK">SMK</option>
                  <option value="PERGURUAN_TINGGI">Perguruan Tinggi</option>
                  <option value="SEKOLAH_LUAR_BIASA">Sekolah Luar Biasa</option>
                  <option value="LAINNYA">Lainnya</option>
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
            <table className="container w-full table-auto mb-8">
              <thead>
                <tr>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    <div className="flex justify-between items-center">
                      <span>No</span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    Foto
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700">
                    <div className="flex justify-between items-center">
                      <span>Nama</span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    <div className="flex justify-between items-center">
                      <span>Jenjang Sekolah</span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    <div className="flex justify-between items-center">
                      <span>Unit Kerja</span>
                    </div>
                  </th>
                  <th className="p-2 md:p-3 border text-white bg-teal-700 md:table-cell hidden">
                    <div className="flex justify-between items-center">
                      <span>Keterangan</span>
                      <span
                        className="ml-1 cursor-pointer"
                        onClick={() => requestSort("keterangan")}
                      >
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
                  const globalIndex = ((currentPage - 1) * itemsPerPage) + index + 1;
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
                          <div className="font-bold text-sm">
                            {item.namaLengkap}
                          </div>
                          <div className="text-sm">{item.tempatLahir},</div>
                          <div className="text-sm">
                            {formatDate(item.tanggalLahir)}
                          </div>
                          <div className="text-sm"> Usia
                            {calculateAge(item.tanggalLahir)} Tahun
                          </div>
                          <div className="text-sm">{item.unitKerja}</div>
                          <div className="text-sm">{item.npaPgri}</div>
                          <div className="text-sm">{item.jabatan}</div>
                          <div className="text-sm">{item.nomorHp}</div>
                          {/* <div
                            className={`text-sm p-1 inline-block ${item.nip
                              ? "bg-green-500 text-white rounded-full px-3"
                              : "bg-red-500 text-white rounded-full px-3"
                              }`}
                          >
                            {item.nip ? item.nip : "NIP tidak ada"}
                          </div> */}
                        </td>
                        <td className="p-2 md:p-3 border text-center text-sm md:table-cell hidden">
                          <div className="text-sm">{formatTingkat(item.tingkatSekolah)}</div>
                        </td>
                        <td className="p-2 md:p-3 border text-center text-sm md:table-cell hidden">
                          <div className="text-sm">{item.cabang}</div>
                        </td>
                        <td className="p-2 text-center md:p-3 border md:table-cell hidden">
                          <div
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-xs font-semibold shadow-sm sm:ml-3 sm:w-auto ${item.status === "BUKAN ANGGOTA"
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
                                    <FaExclamationTriangle className="w-4 h-4" />
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

                                    <h2 className="text-xl font-bold">
                                      Data Daspen
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
                                          <Link
                                            href="https://www.dansetjateng.org/"
                                            className="text-blue-400"
                                            target="_blank"
                                          >
                                            www.dansetjateng.org
                                          </Link>
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
                              <div>{item.cabang},</div>
                              <div>{item.unitKerja}</div>
                              <div>Anggota: {item.gabung}</div>
                              <div>{item.golongan}</div>
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
                                {sessionStorage.getItem("role") ===
                                  "SUPER ADMIN" ? (
                                  <Button
                                    className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                                    title="Mutasi"
                                    onClick={() => openModal(item)}
                                  >
                                    <FaExchangeAlt className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    className="text-white bg-cyan-500 hover:bg-cyan-600 p-2 border rounded-md"
                                    title="Mutasi"
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

                                <Link
                                  href={`https://wa.me/${item.nomorHp}`}
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
                                            <p className="font-semibold">
                                              Usia:
                                            </p>
                                            <p>
                                              {calculateAge(
                                                daspenData.tanggalLahir
                                              ) || "Tidak tersedia"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold">
                                              NIP:
                                            </p>
                                            <p>
                                              {daspenData.nip ||
                                                "Tidak tersedia"}
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
                                              {daspenData.kelompokJabatan ||
                                                "-"}
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
                                                  ).format(
                                                    prediksiPensiunDate
                                                  );
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
                                                ? new Intl.NumberFormat(
                                                  "id-ID",
                                                  {
                                                    style: "currency",
                                                    currency: "IDR",
                                                  }
                                                ).format(daspenData.sumbangan)
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
                                              <Link
                                                href="https://www.dansetjateng.org/"
                                                className="text-blue-400"
                                                target="_blank"
                                              >
                                                www.dansetjateng.org
                                              </Link>
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
                          Apakah Anda yakin untuk mengubah anggota menjadi
                          pensiun?
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
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default StatusAnggota;