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
  FaTimes,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { ClipLoader } from "react-spinners";

function StatusAnggota() {
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
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [searchCabang, setSearchCabang] = useState("");
  const [listCabang, setListCabang] = useState([]);
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [showDropdownUnit, setShowDropdownUnit] = useState(false);
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [filteredUnitKerjaOptions, setFilteredUnitKerjaOptions] = useState([]);
  const [formData, setFormData] = useState({ unit: "" });
  const [isUnitKerjaDisabled, setIsUnitKerjaDisabled] = useState(true);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const unitKerjaRef = useRef(null);
  const profileImageUrl = "/profile.png";
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [role, setRole] = useState("");
  const [isPopupDaspen, setIsPopupDaspen] = useState(false);
  const [daspenData, setDaspenData] = useState(null);
  const [kategoriDaspen, setKategoriDaspen] = useState("");
  const [previousKategoriDaspen, setPreviousKategoriDaspen] =
    useState(kategoriDaspen);
  const [isKategoriChanged, setIsKategoriChanged] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTingkat, setSelectedTingkat] = useState("");
  const dropdownCabangRef = useRef(null);
  const dropdownUnitKerjaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownCabangRef.current && !dropdownCabangRef.current.contains(event.target)) {
        setShowDropdownCabang(false);
      }
      if (dropdownUnitKerjaRef.current && !dropdownUnitKerjaRef.current.contains(event.target)) {
        setShowDropdownUnitKerja(false);
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
      const fetchAnggota = async () => {
        setLoading(true);
        try {
          const anggotaResponse = await GlobalApi.getAllAnggota();

          if (anggotaResponse && anggotaResponse.content) {
            setAnggota(anggotaResponse.content);
          } else {
            setAnggota([]);
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };

      const fetchCabangAndUnitKerja = async () => {
        try {
          const cabangResponse = await GlobalApi.getCabang();
          setListCabang(cabangResponse.data);
          setCabangOptions(cabangResponse.data);
          setFilteredCabangOptions(cabangResponse.data);

          const unitKerjaResponse = await GlobalApi.getUnitKerja();
          setAllUnitKerja(unitKerjaResponse.data);
          setUnitKerjaOptions(unitKerjaResponse.data);
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      };

      fetchAnggota().then(() => fetchCabangAndUnitKerja());

      const storedRole = sessionStorage.getItem("role");
      const storedCabang = sessionStorage.getItem("cabang");

      setRole(storedRole || "");
      if (storedRole === "ADMIN" && storedCabang) {
        setSelectedCabang(storedCabang);
      } else if (storedRole === "USER") {
        const userName = sessionStorage.getItem("nama") || "";
        setSearchKeyword(userName);
      }

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

  const handleDataDaspen = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");
    if (anggotaId) {
      try {
        const response = await GlobalApi.getUserById(anggotaId);

        if (response) {
          setKategoriDaspen(response.kategoriDaspen || "Tidak tersedia");

          const nip = response.nip;

          if (nip) {
            const fileResponse = await GlobalApi.getFileByNip(nip);

            if (fileResponse) {
              setDaspenData(fileResponse);
              setIsPopupDaspen(true);
            } else {
              console.log("File tidak ditemukan untuk NIP:", nip);
            }
          } else {
            toast.error(
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "150px",
                      height: "150px",
                      color: "red",
                      marginBottom: "16px",
                    }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                    <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
                  </svg>
                </div>

                <h3 style={{ fontSize: "1.75rem", display: "block" }}>
                  NIP tidak ditemukan, silahkan melakukan sinkronisasi dahulu.
                </h3>
              </div>,
              {
                icon: null,
                duration: 4000,
                style: {
                  marginTop: "12%",
                  fontSize: "1.75rem",
                  padding: "10px",
                  width: "80%",
                  maxWidth: "450px",
                  height: "50%",
                  maxHeight: "400px",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  zIndex: 9999,
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                },
              }
            );
          }
        } else {
          console.log("Data anggota tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          <div style={{ textAlign: "center" }}>
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

            <h3 style={{ fontSize: "1.75rem", display: "block" }}>
              NIP tidak ditemukan, silahkan melakukan sinkronisasi dahulu.
            </h3>
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

  const closePopup = () => {
    setIsPopupDaspen(false);
  };

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

  const handleUnitKerjaSelect = (selectedItem) => {
    setSelectedUnitKerja(selectedItem.unitKerja || "");
    setShowDropdownUnitKerja(false);
    setSearchUnitKerja("");
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleKategoriChange = (e) => {
    setPreviousKategoriDaspen(kategoriDaspen);

    setKategoriDaspen(e.target.value);
    setIsKategoriChanged(true);
  };

  const handleConfirmChange = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");

    if (anggotaId) {
      try {
        const userData = await GlobalApi.getUserById(anggotaId);

        if (userData) {
          console.log("Data yang diterima:", userData);

          const formatTanggal = (tanggal) => {
            const date = new Date(tanggal);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          const formattedTanggalLahir = formatTanggal(userData.tanggalLahir);
          const formattedTahunDiangkat = formatTanggal(userData.tahunDiangkat);
          const formattedMulaiJadiAnggota = formatTanggal(
            userData.mulaiJadiAnggotaPgri
          );

          const formData = new FormData();

          formData.append(
            "pesertaKtaDigital",
            userData.pesertaKtaDigital || ""
          );
          formData.append("pesertaDaspen", userData.pesertaDaspen || "");
          formData.append("mengajar", userData.mengajar || "");
          formData.append("golonganJabatan", userData.golonganJabatan || "");
          formData.append(
            "mulaiJadiAnggotaPgri",
            formattedMulaiJadiAnggota || ""
          );
          formData.append(
            "pendidikanTerakhir",
            userData.pendidikanTerakhir || ""
          );
          formData.append("pangkatGolongan", userData.pangkatGolongan || "");
          formData.append("tahunDiangkat", formattedTahunDiangkat || "");
          formData.append("statusPegawai", userData.statusPegawai || "");
          formData.append("sertifikatPendidik", userData.sertifikatPendidik);
          formData.append("statusSekolah", userData.statusSekolah || "");
          formData.append("tingkatSekolah", userData.tingkatSekolah || "");
          formData.append("jabatan", userData.jabatan || "");
          formData.append("unitKerja", userData.unitKerja || "");
          formData.append("cabang", userData.cabang || "");
          formData.append("foto", userData.foto || "");
          formData.append("namaAnak", JSON.stringify(userData.namaAnak || []));
          formData.append("namaSuamiIstri", userData.namaSuamiIstri || "");
          formData.append("nomorHp", userData.nomorHp || "");
          formData.append("kodePos", userData.kodePos || "");
          formData.append("longitude", userData.longitude || 0);
          formData.append("latitude", userData.latitude || 0);
          formData.append("alamat", userData.alamat || "");
          formData.append("golonganDarah", userData.golonganDarah || "");
          formData.append("agama", userData.agama || "");
          formData.append("jenisKelamin", userData.jenisKelamin || "");
          formData.append("kategoriDaspen", kategoriDaspen);
          formData.append("tanggalLahir", formattedTanggalLahir || "");
          formData.append("tempatLahir", userData.tempatLahir || "");
          formData.append("namaLengkap", userData.namaLengkap || "");
          formData.append("nik", userData.nik || "");
          formData.append("nip", userData.nip || "");
          formData.append("npaPgri", userData.npaPgri || "");
          formData.append("password", userData.password || "");
          formData.append("email", userData.email || "");

          console.log("FormData yang akan dikirim:");
          for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
          }

          const response = await GlobalApi.updateUserById(anggotaId, formData);

          setDaspenData(response);
          setIsKategoriChanged(false);
          setIsPopupDaspen(false);

          toast.success(
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: "150px",
                  height: "150px",
                  color: "#06D001",
                  marginBottom: "16px",
                  marginTop: "14px",
                }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <h3
                style={{
                  fontSize: "2rem",
                  display: "block",
                  marginBottom: "28px",
                }}
              >
                Kategori Daspen Berhasil Diupdate!
              </h3>
            </div>,
            {
              icon: null,
              duration: 4000,
              style: {
                marginTop: "12%",
                fontSize: "1.75rem",
                padding: "10px",
                width: "80%",
                maxWidth: "450px",
                height: "50%",
                maxHeight: "400px",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                zIndex: 9999,
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            }
          );
        } else {
          console.log("Data pengguna tidak ditemukan.");
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        toast.error(
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "150px",
                height: "150px",
                color: "red",
                marginBottom: "16px",
              }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
              <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
            </svg>
            <h3
              style={{
                fontSize: "1.75rem",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Gagal memperbarui data. Periksa kembali input.
            </h3>
          </div>,
          {
            icon: null,
            duration: 4000,
            style: {
              marginTop: "12%",
              fontSize: "1.75rem",
              padding: "10px",
              width: "80%",
              maxWidth: "450px",
              height: "50%",
              maxHeight: "400px",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 9999,
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
          }
        );
      }
    } else {
      console.log("Anggota ID tidak ditemukan di sessionStorage");
    }
  };

  const formatCurrency = (amount) =>
    `Rp ${parseInt(amount).toLocaleString("id-ID")}`;

  const handlePrint = () => {
    const filteredDataForPrint = filteredData.slice(0, maxItems);
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

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const statusFilter =
        selectedStatus === "Semua" || item.statusKeanggotaan === selectedStatus;
      const cabangFilter =
        selectedCabang === "" || item.cabang === selectedCabang;
      const unitKerjaFilter =
        selectedUnitKerja === "" || item.unitKerja === selectedUnitKerja;
      const tingkatFilter =
        selectedTingkat === "" || item.tingkatSekolah === selectedTingkat; // Tambahkan filter ini

      const searchCabangFilter = item.cabang
        .toLowerCase()
        .includes(filterCabang.toLowerCase());
      const searchUnitKerjaFilter = item.unitKerja
        .toLowerCase()
        .includes(filterUnitKerja.toLowerCase());

      const globalSearchFilter = Object.values(item).some(
        (value) =>
          String(value).toLowerCase().includes(searchKeyword.toLowerCase())
      );

      return (
        statusFilter &&
        cabangFilter &&
        unitKerjaFilter &&
        tingkatFilter && // Pastikan filter ini ada
        (filterCabang ? searchCabangFilter : true) &&
        (filterUnitKerja ? searchUnitKerjaFilter : true) &&
        (searchKeyword ? globalSearchFilter : true)
      );
    });
  }, [
    sortedData,
    selectedStatus,
    selectedCabang,
    selectedUnitKerja,
    selectedTingkat, // Tambahkan ini
    filterCabang,
    filterUnitKerja,
    searchKeyword,
  ]);
  const jumlahAnggota = filteredData.length;

  const openModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    sessionStorage.removeItem("anggotaId");
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
    return ` ${age} `;
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

  const handlePopupKeluar = () => {
    setPopupVisibleKeluar(true);
  };

  const handleKeluarAnggota = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");
      await GlobalApi.keluarAnggota(anggotaId);
      setPopupVisibleKeluar(false);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <h3
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Anggota berhasil dikeluar!
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    } catch (error) {
      console.error("Gagal mengeluarkan anggota:", error);
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal mengeluarkan anggota.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    }
  };

  const handleDeleteClick = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");

      if (!anggotaId) {
        toast.error(
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "150px",
                height: "150px",
                color: "red",
                marginBottom: "16px",
              }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
              <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
            </svg>
            <h3
              style={{
                fontSize: "1.75rem",
                display: "block",
                marginBottom: "8px",
              }}
            >
              ID Anggota tidak ditemukan.
            </h3>
          </div>,
          {
            icon: null,
            duration: 4000,
            style: {
              marginTop: "12%",
              fontSize: "1.75rem",
              padding: "10px",
              width: "80%",
              maxWidth: "450px",
              height: "50%",
              maxHeight: "400px",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 9999,
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
          }
        );
        return;
      }

      const result = await GlobalApi.deleteUser(anggotaId);

      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <h3
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Data Anggota Berhasil Dihapus!
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );

      setTimeout(() => {
        window.location.reload();
      }, 4000);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 4000);
    } catch (error) {
      console.error("Gagal Menghapus Data:", error);
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal pensiun anggota.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    }
  };

  const handleCancelKeluar = () => {
    setPopupVisibleKeluar(false);
    setPopupVisible(false);
  };

  const handlePopup = () => {
    setPopupVisible(true);
  };

  const handlePensiunAnggota = async () => {
    try {
      const anggotaId = sessionStorage.getItem("anggotaId");
      await GlobalApi.pensiunAnggota(anggotaId);
      setPopupVisible(false);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
              marginTop: "14px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <h3
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Anggota berhasil Pensiun!
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    } catch (error) {
      console.error("Gagal mengeluarkan anggota:", error);
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <h3
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal pensiun anggota.
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    }
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

  const FilteredCategories = ({ anggota, selectedCabang, selectedUnitKerja, selectedTingkat }) => {
    const filteredCounts = useMemo(() => {
      // Filter anggota berdasarkan semua filter yang dipilih
      const filteredAnggota = anggota.filter(member => {
        const cabangMatch = !selectedCabang || member.cabang === selectedCabang;
        const unitKerjaMatch = !selectedUnitKerja || member.unitKerja === selectedUnitKerja;
        const tingkatMatch = !selectedTingkat || member.tingkatSekolah === selectedTingkat; // Pastikan ini ada
        return cabangMatch && unitKerjaMatch && tingkatMatch;
      });

      // Hitung berdasarkan status
      const statusCounts = {
        PNS: filteredAnggota.filter(member => member.statusPegawai === "PNS").length,
        NON_PNS: filteredAnggota.filter(member => member.statusPegawai === "NON_PNS").length,
        PPPK: filteredAnggota.filter(member => member.statusPegawai === "PPPK").length
      };

      // Hitung berdasarkan tingkat sekolah
      const tingkatCounts = {
        PAUD: filteredAnggota.filter(member => member.tingkatSekolah === "PAUD").length,
        TK_RA: filteredAnggota.filter(member => member.tingkatSekolah === "TK_RA").length,
        SD_MI: filteredAnggota.filter(member => member.tingkatSekolah === "SD_MI").length,
        SMP_MTS: filteredAnggota.filter(member => member.tingkatSekolah === "SMP_MTS").length,
        SMA_MA: filteredAnggota.filter(member => member.tingkatSekolah === "SMA_MA").length,
        SMK: filteredAnggota.filter(member => member.tingkatSekolah === "SMK").length,
        PERGURUAN_TINGGI: filteredAnggota.filter(member => member.tingkatSekolah === "PERGURUAN_TINGGI").length,
        SEKOLAH_LUAR_BIASA: filteredAnggota.filter(member => member.tingkatSekolah === "SEKOLAH_LUAR_BIASA").length,
        LAINNYA: filteredAnggota.filter(member => member.tingkatSekolah === "LAINNYA").length
      };

      const categories = [
        {
          title: "Status Kepegawaian",
          items: [
            { title: "PNS", count: statusCounts.PNS },
            { title: "NON PNS", count: statusCounts.NON_PNS },
            { title: "PPPK", count: statusCounts.PPPK }
          ]
        },
        {
          title: "Jenjang Pendidikan",
          items: [
            { type: "PAUD", count: tingkatCounts.PAUD },
            { type: "TK_RA", count: tingkatCounts.TK_RA },
            { type: "SD_MI", count: tingkatCounts.SD_MI },
            { type: "SMP_MTS", count: tingkatCounts.SMP_MTS },
            { type: "SMA_MA", count: tingkatCounts.SMA_MA },
            { type: "SMK", count: tingkatCounts.SMK },
            { type: "PERGURUAN_TINGGI", count: tingkatCounts.PERGURUAN_TINGGI },
            { type: "SEKOLAH_LUAR_BIASA", count: tingkatCounts.SEKOLAH_LUAR_BIASA },
            { type: "LAINNYA", count: tingkatCounts.LAINNYA }
          ]
        }
      ];

      return categories;
    }, [anggota, selectedCabang, selectedUnitKerja, selectedTingkat]);

    return (
      <div className="flex flex-col mt-14 mb-4 mx-4 space-y-8">
        {/* Status Kepegawaian Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center items-center mx-auto">
          {filteredCounts[0].items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-lg shadow-md p-6 w-full sm:w-64 text-center"
            >
              <div className="bg-teal-500 text-white p-2 rounded-lg mb-4">
                {item.title}
              </div>
              <div className="text-3xl font-bold text-gray-700">{item.count}</div>
              <div className="text-sm text-gray-500 mt-2">Anggota</div>
            </div>
          ))}
          <div className="bg-white border rounded-lg shadow-md p-6 w-full sm:w-64 text-center">
            <div className="bg-teal-500 text-white p-2 rounded-lg mb-4">
              Total Anggota
            </div>
            <div className="text-3xl font-bold text-gray-700">{jumlahAnggota}</div>
            <div className="text-sm text-gray-500 mt-2">Anggota</div>
          </div>
        </div>

        {/* Jenjang Pendidikan Section - Modified to show 3x3 grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-6 justify-items-center items-center">
          {filteredCounts[1].items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-lg shadow-md p-2 sm:p-3 w-full sm:w-80 text-center flex flex-col items-center"
            >
              <img
                src={`/${imageMap[item.type] || "default.png"}`}
                alt={item.type}
                className="mb-2 h-14 sm:h-16 w-auto object-contain"
              />
              <p className="text-xs sm:text-sm font-bold text-gray-800 mb-2">
                {item.type === "PERGURUAN_TINGGI" || item.type === "SEKOLAH_LUAR_BIASA"
                  ? item.type.replace(/_/g, " ")
                  : item.type.replace(/_/g, "/")}
              </p>
              <Button className="bg-blue-500 hover:bg-blue-700 w-full text-xs sm:text-sm">
                {item.count} Anggota
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <Toaster
            toastOptions={{
              style: {
                marginTop: "16%",
                fontSize: "1.75rem",
                padding: "10px",
                width: "80%",
                maxWidth: "700px",
                height: "50%",
                maxHeight: "400px",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                zIndex: 9999,
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
                {role !== "USER" && (
                  <>
                    <div ref={dropdownCabangRef} className="relative">
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
                        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-full">
                          <ul className="max-h-44 overflow-y-auto">
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

                    {/* Dropdown Pilih Unit Kerja */}
                    <div ref={dropdownUnitKerjaRef} className="relative">
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
                              : allUnitKerja.filter((uk) => uk.cabang === selectedCabang)
                          );
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      {showDropdownUnitKerja && (
                        <div className="absolute z-10 border rounded bg-white shadow-sm mt-1 w-full">
                          <ul className="max-h-44 overflow-y-auto">
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
                )}
                {/* {role !== "USER" && (
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
                )} */}
                <select
                  className="shadow appearance-none border rounded w-full md:w-44 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline md:mb-0"
                  value={selectedTingkat}
                  onChange={(e) => setSelectedTingkat(e.target.value)} // Pastikan ini ada
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
                {role !== "USER" && (
                  <div className="flex flex-wrap items-center space-x-2 w-full md:w-40">
                    <Input
                      type="text"
                      placeholder="Cari..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="border rounded-lg p-2 w-full md:w-60 bg-white shadow-sm"
                      disabled={role === "USER"}
                    />
                  </div>
                )}
              </div>
              {role !== "USER" && (
                <p className="py-2 rounded focus:outline-none focus:shadow-outline w-full md:w-40 ">
                  Jumlah Anggota : {jumlahAnggota}
                </p>
              )}
              <div className="flex items-end w-full md:w-auto mt-2 md:mt-0">
                <div className="space-x-2 w-full flex md:block">
                  {/* <label htmlFor="maxItems" className="mr-2">
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
                  </select> */}
                  {role !== "USER" && (
                    <Button
                      className="px-8 mt-2 md:mt-0"
                      variant="outline"
                      onClick={handlePrint}
                      disabled={role === "USER"}
                    >
                      Cetak
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <FilteredCategories
            anggota={anggota}
            selectedCabang={selectedCabang}
            selectedUnitKerja={selectedUnitKerja}
            selectedTingkat={selectedTingkat} // Add this prop
          />

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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
              <div className="flex flex-col items-center gap-4 p-4 rounded-md shadow-md bg-white">
                <div className="w-full flex justify-center mb-4">
                  <Image
                    src={
                      fotoBase64
                        ? "/profile.png"
                        : `data:image/jpeg;base64,${fotoBase64}`
                    }
                    width={100}
                    height={100}
                    alt="Anggota Foto"
                    className="rounded-full border-2 border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-700 text-sm">
                      Nama Lengkap:
                    </p>
                    <p className="text-base text-gray-900">
                      {currentItem?.namaLengkap || "-"}
                    </p>
                    <p className="font-semibold text-gray-700 text-sm mt-4">
                      Cabang:
                    </p>
                    <p className="text-base text-gray-900">
                      {currentItem?.cabang || "-"}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-700 text-sm">NPA:</p>
                    <p className="text-base text-gray-900">
                      {currentItem?.npaPgri || "-"}
                    </p>
                    <p className="font-semibold text-gray-700 text-sm mt-4">
                      Unit Kerja:
                    </p>
                    <p className="text-base text-gray-900">
                      {currentItem?.unitKerja || "-"}
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