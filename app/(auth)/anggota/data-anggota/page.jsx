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
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const unitKerjaRef = useRef(null);
  const profileImageUrl = "/profile.png";
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [role, setRole] = useState("");
  const [isPopupDaspen, setIsPopupDaspen] = useState(false);
  const [daspenData, setDaspenData] = useState(null);
  const [kategoriDaspen, setKategoriDaspen] = useState("");
  const [isKategoriChanged, setIsKategoriChanged] = useState(false);
  const [tempKategoriDaspen, setTempKategoriDaspen] = useState(kategoriDaspen);

  const handleDataDaspen = async () => {
    const anggotaId = sessionStorage.getItem("anggotaId");
    if (anggotaId) {
      try {
        const response = await GlobalApi.getUserById(anggotaId);

        if (response) {
          console.log("Data anggota yang diterima dari getUserById:", response);

          // Set kategoriDaspen dengan nilai dari response
          setKategoriDaspen(response.kategoriDaspen || "Tidak tersedia");

          const nip = response.nip;

          if (nip) {
            const fileResponse = await GlobalApi.getFileByNip(nip);

            if (fileResponse) {
              console.log("Data file untuk NIP:", nip, fileResponse);
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

  const closePopup = () => {
    setIsPopupDaspen(false);
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole || "");
  }, []);

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

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const cabang = sessionStorage.getItem("cabang");
    if (role === "ADMIN" && cabang) {
      setSelectedCabang(cabang);
    }
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
    const searchTerm = e.target.value.toLowerCase();
    setSearchUnit(searchTerm);
    const filtered = allUnitKerja.filter((unit) =>
      unit.unitKerja.toLowerCase().includes(searchTerm)
    );
    setFilteredUnitKerja(filtered);
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

  const fetchAnggota = async (page = 0, cabang = "", unitKerja = "") => {
    try {
      const role = sessionStorage.getItem("role");
      const userId = sessionStorage.getItem("userId");

      const fotoBase64Array = [];
      let fetchedData = [];

      if (role === "USER" && userId) {
        const userData = await GlobalApi.getUserById(userId);

        if (userData.foto) {
          try {
            const decodedString = atob(userData.foto);
            fotoBase64Array.push(decodedString);
          } catch (error) {
            console.error("Error decoding Base64:", error);
            fotoBase64Array.push(null);
          }
        } else {
          fotoBase64Array.push(null);
        }

        fetchedData = [userData];
      } else {
        fetchedData = await GlobalApi.getAllAnggota(page, cabang, unitKerja);
      }
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

  const handleKategoriChange = (event) => {
    const newKategori = event.target.value;
  
    if (newKategori !== daspenData.kategoriDaspen) {
      setTempKategoriDaspen(newKategori); // Simpan kategori sementara
      setIsKategoriChanged(true); // Tampilkan popup konfirmasi jika ada perubahan
    } else {
      setTempKategoriDaspen(newKategori); // Tetap simpan kategori jika tidak ada perubahan
    }
  };

  // const handleConfirmChange = async () => {
  //   setKategoriDaspen(tempKategoriDaspen); // Terapkan kategori baru
    
  //   try {
  //     // Ambil id dari sessionStorage
  //     const anggotaId = sessionStorage.getItem('anggotaId');
  //     if (!anggotaId) {
  //       console.error("ID anggota tidak ditemukan di sessionStorage");
  //       return;
  //     }
  
  //     // Ambil data pengguna berdasarkan ID dari sessionStorage
  //     const response = await GlobalApi.getUserById(anggotaId);
  
  //     if (response) {
  //       // Tampilkan data yang diterima dari API
  //       console.log("Data yang diterima dari API:", response);
  
  //       // Fungsi untuk format tanggal menjadi yyyy-MM-dd
  //       const formatTanggal = (tanggal) => {
  //         const date = new Date(tanggal);
  //         const year = date.getFullYear();
  //         const month = String(date.getMonth() + 1).padStart(2, "0");  // Menambahkan leading zero
  //         const day = String(date.getDate()).padStart(2, "0");  // Menambahkan leading zero
  //         return `${year}-${month}-${day}`;  // Format yyyy-MM-dd
  //       };
  
  //       // Siapkan data yang ingin diperbarui, termasuk kategoriDaspen
  //       const updatedData = new FormData();
  //       updatedData.append("email", response.email);
  //       updatedData.append("password", response.password || "");
  //       updatedData.append("npaPgri", response.npaPgri);
  //       updatedData.append("nip", response.nip);
  //       updatedData.append("nik", response.nik);
  //       updatedData.append("namaLengkap", response.namaLengkap);
  //       updatedData.append("tempatLahir", response.tempatLahir);
  //       updatedData.append("tanggalLahir", formatTanggal(response.tanggalLahir));  // Format tanggalLahir
  //       updatedData.append("kategoriDaspen", tempKategoriDaspen); // Gunakan kategori baru
  //       updatedData.append("jenisKelamin", response.jenisKelamin);
  //       updatedData.append("agama", response.agama);
  //       updatedData.append("golonganDarah", response.golonganDarah);
  //       updatedData.append("alamat", response.alamat);
  //       updatedData.append("latitude", response.latitude || 0);
  //       updatedData.append("longitude", response.longitude || 0);
  //       updatedData.append("kodePos", response.kodePos || null);
  //       updatedData.append("nomorHp", response.nomorHp || "");
  //       updatedData.append("namaSuamiIstri", response.namaSuamiIstri || "");
  //       updatedData.append("namaAnak", response.namaAnak || "");
  //       updatedData.append("foto", response.foto || null);
  //       updatedData.append("cabang", response.cabang || "");
  //       updatedData.append("unitKerja", response.unitKerja || "");
  //       updatedData.append("jabatan", response.jabatan || "");
  //       updatedData.append("tingkatSekolah", response.tingkatSekolah || "");
  //       updatedData.append("statusSekolah", response.statusSekolah || "");
  //       updatedData.append("statusPegawai", response.statusPegawai || "");
  //       updatedData.append("sertifikatPendidik", response.sertifikatPendidik);
  //       updatedData.append("tahunDiangkat", formatTanggal(response.tahunDiangkat));  // Format tahunDiangkat
  //       updatedData.append("pangkatGolongan", response.pangkatGolongan || "");
  //       updatedData.append("pendidikanTerakhir", response.pendidikanTerakhir || "");
  //       updatedData.append("mulaiJadiAnggotaPgri", formatTanggal(response.mulaiJadiAnggotaPgri));  // Format mulaiJadiAnggotaPgri
  //       updatedData.append("golonganJabatan", response.golonganJabatan || "");
  //       updatedData.append("mengajar", response.mengajar || "");
  //       updatedData.append("pesertaDaspen", response.pesertaDaspen ? "Ya" : "");
  //       updatedData.append("pesertaKtaDigital", response.pesertaKtaDigital ? "Ya" : "");
  
  //       // Debug log untuk melihat data yang ada dalam FormData
  //       console.log("Data dalam FormData:");
  //       updatedData.forEach((value, key) => {
  //         console.log(`${key}: ${value}`);
  //       });
  
  //       // Kirim permintaan untuk memperbarui data
  //       const updateResponse = await GlobalApi.updateUserById(anggotaId, updatedData);
  
  //       if (updateResponse.status === 200) {
  //         console.log("Kategori Daspen berhasil diperbarui");
  //         setKategoriDaspen(tempKategoriDaspen); // Perbarui kategoriDaspen
  //       } else {
  //         console.error("Gagal memperbarui kategori Daspen");
  //       }
  //     } else {
  //       console.error("Gagal mendapatkan data pengguna");
  //     }
  //   } catch (error) {
  //     console.error("Terjadi kesalahan saat mengambil atau memperbarui data pengguna", error);
  //   }
  
  //   // Menutup popup konfirmasi
  //   setIsKategoriChanged(false);
  // };
  const handleConfirmChange = async () => {
    setKategoriDaspen(tempKategoriDaspen); // Terapkan kategori baru
    
    try {
      // Ambil id dari sessionStorage
      const anggotaId = sessionStorage.getItem('anggotaId');
      if (!anggotaId) {
        console.error("ID anggota tidak ditemukan di sessionStorage");
        return;
      }
  
      // Ambil data pengguna berdasarkan ID dari sessionStorage
      const response = await GlobalApi.getUserById(anggotaId);
  
      if (response) {
        // Tampilkan data yang diterima dari API
        console.log("Data yang diterima dari API:", response);
  
        // Fungsi untuk format tanggal menjadi yyyy-MM-dd
        const formatTanggal = (tanggal) => {
          const date = new Date(tanggal);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");  // Menambahkan leading zero
          const day = String(date.getDate()).padStart(2, "0");  // Menambahkan leading zero
          return `${year}-${month}-${day}`;  // Format yyyy-MM-dd
        };
  
        // Siapkan data yang ingin diperbarui, termasuk kategoriDaspen
        const updatedData = {
          email: response.email,
          password: response.password || "",
          npaPgri: response.npaPgri,
          nip: response.nip,
          nik: response.nik,
          namaLengkap: response.namaLengkap,
          tempatLahir: response.tempatLahir,
          tanggalLahir: formatTanggal(response.tanggalLahir),  // Format tanggalLahir
          kategoriDaspen: tempKategoriDaspen, // Gunakan kategori baru
          jenisKelamin: response.jenisKelamin,
          agama: response.agama,
          golonganDarah: response.golonganDarah,
          alamat: response.alamat,
          latitude: response.latitude || 0,
          longitude: response.longitude || 0,
          kodePos: response.kodePos || null,
          nomorHp: response.nomorHp || "",
          namaSuamiIstri: response.namaSuamiIstri || "",
          namaAnak: response.namaAnak || "",
          foto: response.foto || null,
          cabang: response.cabang || "",
          unitKerja: response.unitKerja || "",
          jabatan: response.jabatan || "",
          tingkatSekolah: response.tingkatSekolah || "",
          statusSekolah: response.statusSekolah || "",
          statusPegawai: response.statusPegawai || "",
          sertifikatPendidik: response.sertifikatPendidik || "",
          tahunDiangkat: formatTanggal(response.tahunDiangkat),  // Format tahunDiangkat
          pangkatGolongan: response.pangkatGolongan || "",
          pendidikanTerakhir: response.pendidikanTerakhir || "",
          mulaiJadiAnggotaPgri: formatTanggal(response.mulaiJadiAnggotaPgri),  // Format mulaiJadiAnggotaPgri
          golonganJabatan: response.golonganJabatan || "",
          mengajar: response.mengajar || "",
          pesertaDaspen: response.pesertaDaspen ? "Ya" : "",
          pesertaKtaDigital: response.pesertaKtaDigital ? "Ya" : "",
        };
  
        // Kirim permintaan untuk memperbarui data
        const updateResponse = await GlobalApi.updateUserById(anggotaId, updatedData);
  
        if (updateResponse.status === 200) {
          console.log("Kategori Daspen berhasil diperbarui");
          setKategoriDaspen(tempKategoriDaspen); // Perbarui kategoriDaspen
        } else {
          console.error("Gagal memperbarui kategori Daspen");
        }
      } else {
        console.error("Gagal mendapatkan data pengguna");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil atau memperbarui data pengguna", error);
    }
  
    // Menutup popup konfirmasi
    setIsKategoriChanged(false);
  };
  
  // updatedData.append("sertifikatPendidik", response.sertifikatPendidik);
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
    return `${age} tahun`;
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
              width: "48px",
              height: "48px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Anggota berhasil dikeluar!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          autoClose: 3000,
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
              width: "48px",
              height: "48px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal mengeluarkan anggota.
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 3000,
          duration: 2000,
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
                width: "48px",
                height: "48px",
                color: "red",
                marginBottom: "16px",
              }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
              <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
            </svg>
            <strong
              style={{
                fontSize: "1.75rem",
                display: "block",
                marginBottom: "8px",
              }}
            >
              ID Anggota tidak ditemukan.
            </strong>
          </div>,
          {
            icon: null,
            duration: 2000,
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
              width: "48px",
              height: "48px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Data Anggota Berhasil Dihapus!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 4000,
          duration: 4000,
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
        }
      );
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
              width: "48px",
              height: "48px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal pensiun anggota.
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 3000,
          duration: 3000,
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

  const cancelChange = () => {
    setShowConfirmationPopup(false);
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
              width: "48px",
              height: "48px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong
            style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
          >
            Anggota berhasil Pensiun!
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 3000,
          duration: 4000,
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
              width: "48px",
              height: "48px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal pensiun anggota.
          </strong>
        </div>,
        {
          icon: null,
          autoClose: 3000,
          duration: 3000,
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
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
                      disabled={role !== "SUPER ADMIN"}
                      onFocus={() => {
                        if (role === "SUPER ADMIN") {
                          setShowDropdownCabang(true);
                          setFilteredCabangOptions(cabangOptions);
                        }
                      }}
                      className="border rounded-lg p-2 w-full bg-white shadow-sm"
                    />

                    {showDropdownCabang && role === "SUPER ADMIN" && (
                      <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full ">
                        <ul className="max-h-44 overflow-y-auto">
                          <li className="py-2 px-2">
                            <Input
                              type="text"
                              value={searchCabang}
                              onChange={handleCabangChange}
                              className="w-full shadow border rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Cari Cabang..."
                              autoFocus
                            />
                          </li>
                          <li
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              handleCabangSelect({ kecamatan: "" });
                            }}
                          >
                            Pilih Cabang
                          </li>
                          {filteredCabangOptions.length > 0 ? (
                            filteredCabangOptions.map((cabang) => (
                              <li
                                key={cabang.idKecamatan}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCabangSelect(cabang)}
                              >
                                {cabang.kecamatan}
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

                  <div className="flex flex-col md:flex">
                    <div className="relative" ref={unitKerjaRef}>
                      <Input
                        type="text"
                        className="border rounded-lg p-2 w-full bg-white shadow-sm "
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
                        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-2 w-full">
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                value={searchUnit}
                                onChange={(e) => {
                                  setSearchUnit(e.target.value);
                                }}
                                placeholder="Cari Unit Kerja..."
                                autoFocus
                                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mt-0"
                              />
                            </li>
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

                            {filteredUnitKerja.length > 0 ? (
                              filteredUnitKerja
                                .filter((unit) =>
                                  unit.unitKerja
                                    .toLowerCase()
                                    .includes(searchUnit.toLowerCase())
                                )
                                .map((unit) => (
                                  <li
                                    key={unit.id}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        unit: unit.unitKerja,
                                      }));
                                      setShowDropdownUnit(false);
                                    }}
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
                          <div className="text-sm">{item.npaPgri}</div>
                          <div className="text-sm">{item.jabatan}</div>
                          <div
                            className={`text-sm p-1 inline-block ${
                              item.nip
                                ? "bg-green-500 text-white rounded-full px-3"
                                : "bg-red-500 text-white rounded-full px-3"
                            }`}
                          >
                            {item.nip ? item.nip : "NIP tidak ada"}
                          </div>
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
                            {item.tahunDiangkat
                              ? (() => {
                                  const date = new Date(item.tahunDiangkat);
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const year = date.getFullYear();
                                  return `${day}-${month}-${year}`;
                                })()
                              : "-"}
                          </div>

                          <div className="text-sm">{item.pangkatGolongan}</div>
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
                                      <h2 className="text-xl font-semibold text-center mb-4">
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
          <p className="font-semibold">Kategori Daspen:</p>
          <select
            className="w-full p-2 border rounded-md border-teal-500"
            value={tempKategoriDaspen}
            onChange={handleKategoriChange}
          >
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
          </select>
          
          {isKategoriChanged && (
            <div className="popup">
              <p>Apakah Anda yakin ingin mengganti kategori Daspen?</p>

              <button
                onClick={handleConfirmChange}
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-200 px-6"
              >
                Ya
              </button>

              <button
                onClick={() => {
                  setTempKategoriDaspen(daspenData.kategoriDaspen);
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

                                    <div className="flex justify-end mt-4 mr-10">
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
                                    title="Edit Data"
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
                                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 px-4">
                                      <div className="bg-white p-6 rounded-md w-full sm:w-5/12 lg:w-1/3 xl:w-1/4 max-h-[70vh] overflow-auto">
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
                                            <p>
                                              {daspenData.kategoriDaspen ||
                                                "Tidak tersedia"}
                                            </p>
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
                  className={`px-3 py-1 border rounded text-sm ${
                    page === currentPage
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

export default DataAnggota;
