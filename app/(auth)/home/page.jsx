"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faFileAlt,
  faDatabase,
  faHandsHelping,
  faFileInvoice,
  faUsers,
  faClipboardCheck,
  faUserGraduate,
  faWallet,
  faUser,
  faSyncAlt,
  faMoneyBill,
  faCheckCircle,
  faCog,
  faChair,
  faScroll,
  faHome,
  faChevronLeft,
  faChevronRight,
  faCalendarDays,
  faRightLeft,
  faLocation,
  faCancel,
  faNoteSticky,
  faSitemap,
  faUserPen,
  faImage,
  faExclamationCircle,
  faInfoCircle,
  faFileInvoiceDollar,
  faMoneyBillTransfer,
  faImages,
  faNewspaper,
  faPenNib,
  faEarth,
  faBuildingColumns,
  faCopy,
  faSearch,
  faPhone,
  faArrowRight,
  faShieldHalved,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { faUbuntu, faYoutube } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import FooterMobile from "@/app/_components/FooterMobile";
import GaleriKegiatan from "@/app/_components/GaleriKegiatan";
import News from "@/app/_components/News";
import BiroTravel from "@/app/_components/BiroTravel";
import Live from "@/app/_components/Live";
import LembagaDisplay from "@/app/_components/Lembaga";
import Metsos from "@/app/_components/Metsos";
import DevTeamCard from "@/app/_components/DevTeamCard";
import VisitorCounter from "@/app/_components/VisitorCounter";
import Image from "next/image";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("../../_components/MapComponent.jsx"),
  {
    ssr: false,
  },
);

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border border-emerald-200 text-emerald-800";
      case "error":
        return "bg-rose-50 border border-rose-200 text-rose-800";
      default:
        return "bg-blue-50 border border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-emerald-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-rose-500 text-3xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-3xl p-6 sm:p-8 shadow-2xl z-10 w-full max-w-sm text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={20} />
        </button>

        <div className="flex flex-col items-center space-y-3">
          <div className="animate-bounce">{getIcon()}</div>
          <h3 className="text-lg font-bold">
            {type === "success" ? "Berhasil!" : "Pemberitahuan"}
          </h3>
          <div className="text-xs sm:text-sm text-center leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function IconGrid() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;
  const [anggotaMeninggal, setAnggotaMeninggal] = useState([]);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [jumlahMeninggal, setJumlahMeninggal] = useState(0);
  const [jumlahSantunan, setJumlahSantunan] = useState(0);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const profileImageUrl = "/profile.png";
  const [notification, setNotification] = useState(null);
  const [newPengaduanCount, setNewPengaduanCount] = useState(0);
  const [totalNominal, setTotalNominal] = useState(0);

  // Superapp search & category filter state
  const [searchMenuQuery, setSearchMenuQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");

  const icons = [
    // Menu Layanan Utama & Keuangan
    {
      icon: faBullhorn,
      label: "Lapor",
      href: "/lapor",
      color: "text-rose-600",
      category: "LAYANAN",
      tag: "Wajib",
    },
    {
      icon: faCheckCircle,
      label: "Verifikasi",
      href: "/verifikasi-anggota-mutasi",
      color: "text-teal-600",
      category: "ANGGOTA",
    },
    {
      icon: faUsers,
      label: "Data Anggota",
      href: "/anggota/data-anggota",
      color: "text-blue-600",
      category: "ANGGOTA",
    },
    {
      icon: faSyncAlt,
      label: "Sinkronisasi",
      href: "/singkron-data",
      color: "text-amber-600",
      category: "LAYANAN",
    },
    {
      icon: faFileInvoice,
      label: "Rekap Meninggal",
      href: "/rekap-meninggal",
      color: "text-purple-600",
      category: "LAYANAN",
    },
    {
      icon: faFileAlt,
      label: "Statistik",
      href: "/statistik",
      color: "text-teal-600",
      category: "LAYANAN",
    },
    {
      icon: faUserGraduate,
      label: "Status Anggota",
      href: "/anggota/status-anggota",
      color: "text-indigo-600",
      category: "ANGGOTA",
    },
    {
      icon: faDatabase,
      label: "History data",
      href: "/history-data",
      color: "text-emerald-600",
      category: "ANGGOTA",
    },
    {
      icon: faChair,
      label: "Pensiun",
      href: "/pensiun",
      color: "text-rose-500",
      category: "ANGGOTA",
    },
    {
      icon: faSitemap,
      label: "Data Ranting",
      href: "/ranting/data",
      color: "text-blue-600",
      category: "ANGGOTA",
    },
    // Menu Keuangan
    {
      icon: faUbuntu,
      label: "Rekap By Nominal",
      href: "/anggota/rekap-anggota",
      color: "text-slate-600",
      category: "KEUANGAN",
    },
    {
      icon: faMoneyBillTransfer,
      label: "Transaksi Bank",
      href: "/transaksi-bank",
      color: "text-emerald-600",
      category: "KEUANGAN",
    },
    {
      icon: faMoneyBillTransfer,
      label: "Keuangan New",
      href: "/keuangan-new",
      color: "text-emerald-600",
      category: "KEUANGAN",
    },
    {
      icon: faClipboardCheck,
      label: "Ketentuan",
      href: "/ketentuan",
      color: "text-teal-600",
      category: "INFORMASI",
    },
    {
      icon: faHandsHelping,
      label: "Bantuan",
      href: "/bantuan",
      color: "text-purple-600",
      category: "INFORMASI",
    },
    {
      icon: faCog,
      label: "Pengaturan",
      href: "/pengaturan/user",
      color: "text-slate-600",
      category: "PENGATURAN",
    },
    {
      icon: faUsers,
      label: "Teman Unit",
      href: "/teman-unit-kerja",
      color: "text-teal-600",
      category: "ANGGOTA",
    },
    {
      icon: faImage,
      label: "Galeri",
      href: "/galeri",
      color: "text-emerald-600",
      category: "INFORMASI",
    },
    {
      icon: faExclamationCircle,
      label: "Pengaduan",
      href: "/pengaduan",
      color: "text-rose-600",
      category: "LAYANAN",
      badge: newPengaduanCount > 0 ? newPengaduanCount : null,
    },
    {
      icon: faImages,
      label: "Eksport Foto",
      href: "/eksport-foto",
      color: "text-emerald-600",
      category: "INFORMASI",
    },
    {
      icon: faPenNib,
      label: "Kontributor",
      href: "/berita/create-berita",
      color: "text-amber-600",
      category: "INFORMASI",
    },
    {
      icon: faEarth,
      label: "Tour & Travel",
      href: "/biro-perjalanan/create-paket",
      color: "text-blue-600",
      category: "LAYANAN",
    },
    {
      icon: faBuildingColumns,
      label: "Lembaga",
      href: "/lembaga",
      color: "text-emerald-600",
      category: "INFORMASI",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`, {
      icon: "📋",
      style: {
        borderRadius: "14px",
        background: "#0f172a",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "600",
      },
    });
  };

  const sortByDate = (data) => {
    return [...data].sort((a, b) => {
      try {
        if (
          !Array.isArray(a.waktuMeninggalTerlapor) ||
          !Array.isArray(b.waktuMeninggalTerlapor)
        ) {
          return 0;
        }

        const dateA = new Date(
          a.waktuMeninggalTerlapor[0],
          a.waktuMeninggalTerlapor[1] - 1,
          a.waktuMeninggalTerlapor[2],
        );

        const dateB = new Date(
          b.waktuMeninggalTerlapor[0],
          b.waktuMeninggalTerlapor[1] - 1,
          b.waktuMeninggalTerlapor[2],
        );

        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }

        return dateB - dateA;
      } catch (error) {
        console.error("Error sorting dates:", error);
        return 0;
      }
    });
  };

  const fetchNewPengaduanCount = async () => {
    try {
      let cabang = null;
      if (role === "ADMIN") {
        cabang = sessionStorage.getItem("cabang");
      }

      const count = await GlobalApi.countNewPengaduan(1, cabang);
      setNewPengaduanCount(count);
    } catch (error) {
      console.error("Error fetching new pengaduan count:", error);
    }
  };

  useEffect(() => {
    fetchNewPengaduanCount();

    const interval = setInterval(fetchNewPengaduanCount, 60000);

    return () => clearInterval(interval);
  }, [role]);

  const sortedData = useMemo(() => {
    try {
      return sortByDate(anggotaMeninggal);
    } catch (error) {
      console.error("Error in sorting:", error);
      return anggotaMeninggal;
    }
  }, [anggotaMeninggal]);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const responseDiterima = await GlobalApi.getTotalSantunan();
        setTotalNominal(responseDiterima);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const fetchJumlahSantunan = async () => {
      try {
        const data = await GlobalApi.getSantunanDiberikan();
        setJumlahSantunan(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchJumlahSantunan();

    const fetchCombinedUserData = async () => {
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const deceasedData = await GlobalApi.getAnggotaMeninggal(year, month);
        setJumlahMeninggal(deceasedData.length);

        const detailedData = await Promise.all(
          deceasedData.map(async (deceased, index) => {
            try {
              const userResponse = await GlobalApi.searchUsersByName(
                deceased.namaLengkap,
              );

              let decodedFoto = null;

              if (
                userResponse?.data?.users &&
                userResponse.data.users.length > 0
              ) {
                const userData =
                  userResponse.data.users.find(
                    (user) =>
                      user.namaLengkap?.toLowerCase() ===
                      deceased.namaLengkap?.toLowerCase(),
                  ) || userResponse.data.users[0];

                if (userData.foto) {
                  try {
                    decodedFoto = atob(userData.foto);
                  } catch (error) {
                    console.error("Error decoding Base64 foto:", error);
                  }
                }

                return {
                  ...deceased,
                  waktuMeninggalTerlapor:
                    userData.waktuMeninggalTerlapor ||
                    deceased.waktuMeninggalTerlapor,
                  npaPgri: userData.npaPgri || deceased.npaPgri,
                  tempatLahir: userData.tempatLahir || deceased.tempatLahir,
                  tanggalLahir: userData.tanggalLahir || deceased.tanggalLahir,
                  jabatan: userData.jabatan || deceased.jabatan,
                  unitKerja: userData.unitKerja || deceased.unitKerja,
                  cabang: userData.cabang || deceased.cabang,
                  alamat: userData.alamat || deceased.alamat,
                  tanggalPelaporan:
                    userData.tanggalPelaporan || deceased.tanggalPelaporan,
                  keteranganTerlapor:
                    userData.keteranganTerlapor || deceased.keteranganTerlapor,
                  jamLapor: userData.jamLapor || deceased.jamLapor,
                  namaPelapor: userData.namaPelapor || deceased.namaPelapor,
                  nomorHpPelapor:
                    userData.nomorHpPelapor || deceased.nomorHpPelapor,
                  agama: userData.agama || deceased.agama || null,
                  foto: decodedFoto || null,
                  originalIndex: index,
                };
              }
              return {
                ...deceased,
                foto: null,
                originalIndex: index,
              };
            } catch (error) {
              console.error(
                `Error fetching details for ${deceased.namaLengkap}:`,
                error,
              );
              return {
                ...deceased,
                foto: null,
                originalIndex: index,
              };
            }
          }),
        );

        setAnggotaMeninggal(detailedData);
      } catch (error) {
        console.error("Error fetching combined user data:", error);
      }
    };

    const fetchUserData = async () => {
      const userId = sessionStorage.getItem("userId");
      const userRole = sessionStorage.getItem("role");
      const npa = sessionStorage.getItem("npa");

      if (!userId) {
        console.error("ID tidak ditemukan di sessionStorage");
        return;
      }

      try {
        // Admin/Panitia IDs belong to the admin table, not the member table. Fetching
        // those IDs through getUserById can return an unrelated member record.
        const isAdminOrPanitia =
          userRole === "ADMIN" ||
          userRole === "SUPERADMIN" ||
          userRole === "PANITIA" ||
          (userRole && userRole.toUpperCase().includes("PANITIA"));

        if (isAdminOrPanitia) {
          const response = await GlobalApi.getAdminById(userId);
          const formattedResponse = {
            ...response,
            namaLengkap:
              response?.namaLengkap ||
              response?.nama ||
              sessionStorage.getItem("nama"),
          };
          setUserData(formattedResponse);

          if (response?.foto) {
            try {
              setFotoBase64(atob(response.foto));
            } catch (error) {
              console.error("Error decoding Base64:", error);
              setFotoBase64(null);
            }
          } else {
            setFotoBase64(null);
          }

          setLatitude(response?.latitude);
          setLongitude(response?.longitude);
          setLoading(false);
          return;
        }

        let idToFetch = userId;

        if (userRole === "ADMIN" && npa) {
          const npaResponse = await GlobalApi.cekNpa(npa);
          if (npaResponse && npaResponse.id) {
            idToFetch = npaResponse.id;
          } else {
            console.error("NPA tidak valid atau tidak ditemukan");
            return;
          }
        }

        const response = await GlobalApi.getUserById(idToFetch);
        setUserData(response);

        if (response.foto) {
          try {
            const decodedString = atob(response.foto);
            setFotoBase64(decodedString);
          } catch (error) {
            console.error("Error decoding Base64:", error);
            setFotoBase64(null);
          }
        } else {
          setFotoBase64(null);
        }

        setLatitude(response.latitude);
        setLongitude(response.longitude);
        setLoading(false);
      } catch (error) {
        console.error("Error saat mendapatkan data user:", error);
        setLoading(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    const init = () => {
      const storedRole = sessionStorage.getItem("role");
      setRole(storedRole);

      const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
      setIsSidebarOpen(sidebarState);

      setLoading(false);
      handleResize();
      fetchCombinedUserData();
      fetchUserData();

      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", handleResize);
    };

    init();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [token, router]);

  const handleMainMenuClick = (e, index, href) => {
    e.preventDefault();
    if (index !== dropdownOpen) {
      setDropdownOpen(index);
    }
    if (href) {
      router.push(href);
    }
  };

  const formatDate = (dateArray) => {
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      return `${String(dateArray[2]).padStart(2, "0")}-${String(
        dateArray[1],
      ).padStart(2, "0")}-${dateArray[0]}`;
    }
    return "Tanggal tidak valid";
  };

  const handleNext = () => {
    if (currentIndex + itemsPerPage < anggotaMeninggal.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  const renderCheckmark = (value) => {
    if (value === "Ya") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FontAwesomeIcon icon={faCheckCircle} className="text-[10px] text-emerald-600" />
          Terdaftar
        </span>
      );
    } else if (
      value === "" ||
      value === null ||
      value === undefined ||
      value === "TIDAK"
    ) {
      return (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => handleSync()}
            disabled={loadingButton}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
          >
            <FontAwesomeIcon
              icon={faSyncAlt}
              className={`text-[9px] ${loadingButton ? "animate-spin" : ""}`}
            />
            {loadingButton ? "Proses..." : "Sinkronkan"}
          </button>
          <button
            onClick={handleOpenPopup}
            className="text-slate-400 hover:text-slate-600 transition"
            title="Info Sinkronisasi"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
          </button>
        </div>
      );
    }
    return null;
  };

  const handleOpenPopup = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleSync = async () => {
    try {
      setLoadingButton(true);

      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        setNotification({
          type: "error",
          message: `User ID tidak ditemukan!`,
        });
        setLoadingButton(false);
        return;
      }

      const userData = await GlobalApi.getUserById(userId);
      if (!userData || !userData.nip) {
        setNotification({
          type: "error",
          message: `NIP tidak ditemukan!`,
        });
        setLoadingButton(false);
        return;
      }

      const nip = userData.nip;

      const data = await GlobalApi.getByNIP(nip);
      if (!data) {
        setNotification({
          type: "error",
          message: `Data NIP ini tidak ditemukan!`,
        });
        setLoadingButton(false);
        return;
      }

      const nipData = await GlobalApi.getFileByNip(nip);
      if (nipData?.verifikasi === true) {
        setNotification({
          type: "success",
          message: `Data anda sudah tersinkronisasi!`,
        });
        setLoadingButton(false);
        return;
      }

      const response = await GlobalApi.updateRegisUser(userId, data);

      setNotification({
        type: "success",
        message: `Data berhasil disinkronkan!`,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error saat mengirim data:", error);
      setNotification({
        type: "error",
        message: `NIP tidak sesuai!`,
      });
    } finally {
      setLoadingButton(false);
    }
  };

  const getMemberAge = (data) => {
    if (data?.usia) {
      const u = String(data.usia).trim();
      if (u && u !== "-" && u !== "0") {
        return u.toLowerCase().includes("tahun") || u.toLowerCase().includes("th") ? u : `${u} Tahun`;
      }
    }
    if (data?.umur) {
      const u = String(data.umur).trim();
      if (u && u !== "-" && u !== "0") {
        return u.toLowerCase().includes("tahun") || u.toLowerCase().includes("th") ? u : `${u} Tahun`;
      }
    }
    if (!data?.tanggalLahir) return null;
    try {
      const birthDate = new Date(data.tanggalLahir);
      if (isNaN(birthDate.getTime())) return null;
      const endDate = data.waktuMeninggalTerlapor ? new Date(data.waktuMeninggalTerlapor) : new Date();
      if (isNaN(endDate.getTime())) return null;
      let age = endDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = endDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 && age < 130 ? `${age} Tahun` : null;
    } catch {
      return null;
    }
  };

  const MobileDeceasedScroll = ({ sortedData, formatDate }) => {
    return (
      <div className="w-full overflow-x-auto pb-4 mb-4">
        <div className="flex space-x-4 px-1 min-w-min">
          {sortedData.map((currentData, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-72 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4 text-center text-white relative">
                <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-md mb-2.5 bg-slate-800 flex items-center justify-center">
                  <Image
                    src={
                      currentData.foto
                        ? `data:image/jpeg;base64,${currentData.foto}`
                        : profileImageUrl
                    }
                    width={70}
                    height={70}
                    alt={`Foto ${currentData.namaLengkap}`}
                    className="object-cover w-full h-full"
                    unoptimized={true}
                  />
                </div>
                <h2 className="text-sm font-bold text-white truncate">
                  {currentData.namaLengkap}
                </h2>
                <p className="text-[11px] text-teal-200 mt-0.5">
                  Wafat: {formatDate(currentData.waktuMeninggalTerlapor)}
                </p>
                {getMemberAge(currentData) && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                    Usia: {getMemberAge(currentData)}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between text-xs text-slate-600 space-y-2">
                <div className="space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-400">NPA:</span>
                    <strong className="text-slate-800">{currentData.npaPgri || "N/A"}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Cabang:</span>
                    <span className="text-slate-700 font-medium">{currentData.cabang || "-"}</span>
                  </p>
                  {currentData.unitKerja && (
                    <p className="flex justify-between">
                      <span className="text-slate-400">Unit:</span>
                      <span className="text-slate-700 font-medium truncate max-w-[150px]">{currentData.unitKerja}</span>
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
                  <span className="inline-block bg-teal-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                    PELAPOR
                  </span>
                  <p className="font-semibold text-slate-800 text-[11px]">
                    {currentData.namaPelapor || "N/A"}
                  </p>
                  {currentData.nomorHpPelapor && (
                    <a
                      href={`tel:${currentData.nomorHpPelapor}`}
                      className="text-teal-700 font-bold text-[11px] hover:underline mt-0.5 inline-block"
                    >
                      📞 {currentData.nomorHpPelapor}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const filteredIcons = useMemo(() => {
    let result = [];
    if (role === "USER") {
      result = icons
        .filter((item) =>
          [
            "Lapor",
            "Teman Unit",
            "Ketentuan",
            "Bantuan",
            "Pengaduan",
            "Kontributor",
          ].includes(item.label),
        )
        .concat({
          icon: faUser,
          label: "Detail Anggota",
          href: "/anggota/detail-anggota",
          color: "text-blue-600",
          category: "ANGGOTA",
        })
        .concat({
          icon: faUserPen,
          label: "Edit Anggota",
          href: "/anggota/edit-anggota",
          color: "text-teal-600",
          category: "ANGGOTA",
        })
        .concat({
          icon: faRightLeft,
          label: "Mutasi",
          href: "/anggota/data-anggota/mutasiCabangUnit",
          color: "text-cyan-600",
          category: "ANGGOTA",
        })
        .concat({
          icon: faFileAlt,
          label: "Daspen",
          href: "/daspen",
          color: "text-emerald-700",
          category: "KEUANGAN",
        })
        .concat({
          icon: faFileInvoiceDollar,
          label: "Tagihan",
          href: "/tagihan",
          color: "text-blue-700",
          category: "KEUANGAN",
        })
        .concat({
          icon: faCalendarDays,
          label: "Rekap Event",
          href: "/event/data-event",
          color: "text-teal-600",
          category: "INFORMASI",
        })
        .sort((a, b) => {
          const order = [
            "Lapor",
            "Tagihan",
            "Detail Anggota",
            "Edit Anggota",
            "Mutasi",
            "Daspen",
            "Ketentuan",
            "Bantuan",
            "Teman Unit",
            "Pengaduan",
            "Rekap Event",
          ];
          return order.indexOf(a.label) - order.indexOf(b.label);
        });
    } else if (role === "SUPERADMIN") {
      result = icons
        .concat({
          icon: faNewspaper,
          label: "Berita",
          href: "/berita/view-berita",
          color: "text-purple-600",
          category: "INFORMASI",
        })
        .concat({
          icon: faYoutube,
          label: "LIVE",
          href: "/live-link",
          color: "text-rose-600",
          category: "INFORMASI",
        })
        .concat({
          icon: faScroll,
          label: "Running Text",
          href: "/running-text",
          color: "text-indigo-600",
          category: "INFORMASI",
        })
        .concat({
          icon: faCog,
          label: "AI Knowledge",
          href: "/pengaturan/ai-knowledge",
          color: "text-teal-600",
          category: "PENGATURAN",
        })
        .concat({
          icon: faCalendarDays,
          label: "Rekap Event",
          href: "/event/data-event",
          color: "text-teal-600",
          category: "INFORMASI",
        });
    } else if (role === "EDITOR") {
      result = [
        ...icons.filter((item) => item.label === "Kontributor"),
        {
          icon: faNewspaper,
          label: "Berita",
          href: "/berita/view-berita",
          color: "text-purple-600",
          category: "INFORMASI",
        },
      ];
    } else if (role === "PANITIA") {
      result = [
        ...icons.filter((item) => item.label === "Event"),
        {
          icon: faCalendarDays,
          label: "Rekap Event",
          href: "/event/data-event",
          color: "text-teal-600",
          category: "INFORMASI",
        },
      ];
    } else if (role === "ADMIN") {
      result = icons
        .filter(
          (item) =>
            item.label !== "Tour & Travel" &&
            item.label !== "Pengaturan" &&
            item.label !== "AI Knowledge" &&
            item.label !== "Event" &&
            item.label !== "Galeri" &&
            item.label !== "Eksport Foto" &&
            item.label !== "Keuangan",
        )
        .concat({
          icon: faCalendarDays,
          label: "Rekap Event",
          href: "/event/data-event",
          color: "text-teal-600",
          category: "INFORMASI",
        });
    } else {
      result = icons.filter((item) => item.label !== "Tour & Travel");
    }

    // Apply category filter if active
    if (selectedCategory !== "SEMUA") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Apply search query if active
    if (searchMenuQuery.trim()) {
      const q = searchMenuQuery.toLowerCase();
      result = result.filter((item) => item.label.toLowerCase().includes(q));
    }

    return result;
  }, [role, icons, selectedCategory, searchMenuQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            Memuat Layanan Sanduka...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 pt-14">
      <Toaster position="top-right" />
      {isMobile ? <HeaderMobile showBack={false} /> : <HeaderHome showBack={false} />}

      <div className="flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {notification && (
            <NotificationPopup
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          {/* ============================================================== */}
          {/* PROVIDER-STYLE HERO BANNER & GREETING BAR                      */}
          {/* ============================================================== */}
          <div className="relative bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 text-white overflow-hidden pb-10 sm:pb-12 pt-6 sm:pt-8">
            {/* Background Texture & Glow Elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-teal-200 border border-white/15">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      SANDUKA PGRI DIGITAL
                    </span>
                    {sessionStorage.getItem("cabang") && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-md text-white border border-white/15">
                        Cabang {sessionStorage.getItem("cabang")}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {getGreeting()},{" "}
                    <span className="text-teal-300">
                      {userData?.namaLengkap || userData?.nama || sessionStorage.getItem("nama") || "Sahabat Sanduka"}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
                    Portal Layanan Solidaritas, Santunan Duka, dan Administrasi Terpadu PGRI Kabupaten Jepara.
                  </p>
                </div>

                {/* Quick Action Badges */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <Link
                    href="/lapor"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition hover:scale-[1.02] active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBullhorn} className="text-xs" />
                    Lapor Duka Cita
                  </Link>
                  <Link
                    href="/bantuan"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition hover:scale-[1.02] active:scale-95"
                  >
                    <FontAwesomeIcon icon={faHandsHelping} className="text-xs" />
                    Bantuan
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TELECOM-STYLE USAGE / METRIC WIDGETS ROW                      */}
          {/* ============================================================== */}
          {!isMobile && (
            <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Lapor Meninggal Bulan Ini */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 group flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Laporan Duka Bulan Ini
                      </span>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                          {jumlahMeninggal}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Anggota</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <FontAwesomeIcon icon={faBullhorn} className="text-lg" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Status Realtime
                    </span>
                    <span className="font-semibold text-slate-700">
                      {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Sanduka Diberikan */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 group flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Penerima Manfaat
                      </span>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-amber-700 tracking-tight font-mono">
                          {jumlahSantunan}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Keluarga</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <FontAwesomeIcon icon={faUser} className="text-lg" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Periode Akumulasi</span>
                    <span className="font-semibold text-slate-700">2020 – Sekarang</span>
                  </div>
                </div>

                {/* Metric 3: Total Santunan Realisasi */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 group flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Dana Terdistribusi
                      </span>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-emerald-700 tracking-tight font-mono">
                          Rp {totalNominal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <FontAwesomeIcon icon={faMoneyBill} className="text-lg" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                      100% Tersalurkan
                    </span>
                    <span className="text-slate-500">Audited</span>
                  </div>
                </div>

                {/* Metric 4: VisitorCounter */}
                <VisitorCounter />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SUPERAPP APP LAUNCHER / LAYANAN & FITUR UTAMA                  */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
              {/* Header Bar Launcher with Search & Category Pills */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Layanan & Fitur Sanduka
                    </h2>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      {filteredIcons.length} Fitur
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pilih modul layanan untuk administrasi, keuangan, dan data keanggotaan
                  </p>
                </div>

                {/* Search Bar for Menu */}
                <div className="w-full md:w-72 relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  />
                  <input
                    type="text"
                    value={searchMenuQuery}
                    onChange={(e) => setSearchMenuQuery(e.target.value)}
                    placeholder="Cari layanan atau menu..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                  />
                  {searchMenuQuery && (
                    <button
                      onClick={() => setSearchMenuQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs (Telecom style) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
                {["SEMUA", "ANGGOTA", "KEUANGAN", "LAYANAN", "INFORMASI"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === category
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Launcher Grid - Telecom Superapp Squircle Tiles */}
              {filteredIcons.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">
                    Tidak ditemukan layanan dengan kata kunci "{searchMenuQuery}"
                  </p>
                  <button
                    onClick={() => {
                      setSearchMenuQuery("");
                      setSelectedCategory("SEMUA");
                    }}
                    className="mt-2 text-xs text-teal-700 font-bold hover:underline"
                  >
                    Reset Pencarian
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filteredIcons.map((item, index) => (
                    <div
                      key={index}
                      onClick={(e) => handleMainMenuClick(e, index, item.href)}
                      className="group relative bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 rounded-2xl p-4 flex flex-col items-center text-center justify-between cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95"
                    >
                      {/* Squircle Icon Container */}
                      <div className="w-13 h-13 rounded-2xl bg-slate-50 group-hover:bg-teal-50 border border-slate-200/60 group-hover:border-teal-200 flex items-center justify-center transition-all duration-200 shadow-2xs relative">
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={`${item.color} text-xl transition-transform duration-200 group-hover:scale-115`}
                        />
                        {item.badge && (
                          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px] ring-2 ring-white animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Label & Subtitle */}
                      <div className="w-full mt-3">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-1 block">
                          {item.label}
                        </span>
                        {item.tag && (
                          <span className="mt-1 inline-block text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: ANGGOTA MENINGGAL BULAN INI (Solidaritas Duka)        */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Anggota Meninggal Bulan Ini
                    </h3>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      {anggotaMeninggal.length} Terlapor
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi duka cita dan penghormatan terakhir bagi anggota PGRI Kabupaten Jepara
                  </p>
                </div>

                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 p-2.5 rounded-xl transition cursor-pointer"
                      aria-label="Sebelumnya"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="text-slate-600 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl transition cursor-pointer"
                      aria-label="Selanjutnya"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {isMobile ? (
                <MobileDeceasedScroll
                  sortedData={sortedData}
                  formatDate={formatDate}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {sortedData &&
                    sortedData
                      .slice(currentIndex, currentIndex + itemsPerPage)
                      .map((currentData, index) => (
                        <div
                          key={index}
                          className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md bg-white flex flex-col justify-between"
                        >
                          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4 text-center text-white relative">
                            <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md mb-3 bg-slate-800 flex items-center justify-center ring-2 ring-white/10">
                              <Image
                                src={
                                  currentData.foto
                                    ? `data:image/jpeg;base64,${currentData.foto}`
                                    : profileImageUrl
                                }
                                width={80}
                                height={80}
                                alt={`Foto ${currentData.namaLengkap}`}
                                className="object-cover w-full h-full"
                                unoptimized={true}
                              />
                            </div>
                            <h2 className="text-sm font-bold text-white truncate tracking-tight">
                              {currentData.namaLengkap}
                            </h2>
                            <p className="text-[11px] text-teal-200/90 mt-1 font-medium">
                              Wafat: {formatDate(currentData.waktuMeninggalTerlapor)}
                            </p>
                            {getMemberAge(currentData) && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                                Usia: {getMemberAge(currentData)}
                              </span>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="text-xs text-slate-600 space-y-1.5 mb-3">
                              <p>
                                <span className="font-semibold text-slate-400">NPA:</span>{" "}
                                <strong className="text-slate-800 font-mono">{currentData.npaPgri || "N/A"}</strong>
                              </p>
                              <p>
                                <span className="font-semibold text-slate-400">TTL:</span>{" "}
                                {currentData.tempatLahir},{" "}
                                {formatDate(currentData.tanggalLahir)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-400">Jabatan:</span>{" "}
                                {currentData.jabatan}
                              </p>
                              {currentData.unitKerja &&
                                currentData.unitKerja.toLowerCase() !== "tidak ada" &&
                                currentData.unitKerja.toLowerCase() !== "null" && (
                                  <p>
                                    <span className="font-semibold text-slate-400">Unit:</span>{" "}
                                    {currentData.unitKerja}
                                  </p>
                                )}
                              <p>
                                <span className="font-semibold text-slate-400">Cabang:</span>{" "}
                                {currentData.cabang}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-400">Alamat:</span>{" "}
                                {currentData.alamat}
                              </p>
                            </div>

                            {(() => {
                              const cleanCatatan = (currentData.keteranganTerlapor || "")
                                .replace(/(?:data\s+)?di\s*ubah\s+oleh\s+sistem(?:\s*[\r\n]+)?/gi, "")
                                .replace(/(?:data\s+)?di\s*ubah\s+oleh\s+system(?:\s*[\r\n]+)?/gi, "")
                                .trim();
                              return cleanCatatan ? (
                                <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 mb-3">
                                  <p className="font-semibold text-slate-700">Catatan:</p>
                                  <p className="italic">{cleanCatatan}</p>
                                </div>
                              ) : null;
                            })()}

                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mt-auto">
                              <div className="flex items-center justify-center mb-1.5">
                                <span className="bg-teal-700 text-white text-[10px] font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1">
                                  <FontAwesomeIcon icon={faBullhorn} className="text-[9px]" />
                                  PELAPOR
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 text-center">
                                <p>
                                  {formatDate(currentData.tanggalPelaporan)}, {currentData.jamLapor}
                                </p>
                                <p className="font-bold text-slate-800 mt-0.5">
                                  {currentData.namaPelapor || "N/A"}
                                </p>
                                {currentData.nomorHpPelapor && (
                                  <a
                                    href={`tel:${currentData.nomorHpPelapor}`}
                                    className="text-teal-700 font-bold mt-0.5 inline-block hover:underline"
                                  >
                                    📞 {currentData.nomorHpPelapor}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: BERITA TERKINI                                        */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full">
              <News />
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: GALERI KEGIATAN                                       */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full">
              <GaleriKegiatan />
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: BIRO TRAVEL                                           */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full">
              <BiroTravel />
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: LEMBAGA DISPLAY                                       */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full">
              <LembagaDisplay />
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: MAPS LOKASI RUMAH                                     */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
              <div className="mb-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Maps Lokasi Rumah
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lokasi tempat tinggal terdaftar anggota PGRI
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto">
                  Dapat disesuaikan via Edit Anggota
                </span>
              </div>
              {latitude && longitude && (
                <div className="h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-200/80 relative z-0 shadow-inner">
                  <MapComponent latitude={latitude} longitude={longitude} />
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: MEDIA SOSIAL                                          */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-10">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full">
              <Metsos />
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION: DEV TEAM CARD                                         */}
          {/* ============================================================== */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mb-14">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 w-full">
              <DevTeamCard />
            </div>
          </div>
        </main>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
