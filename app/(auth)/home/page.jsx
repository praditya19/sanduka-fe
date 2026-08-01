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
  faExchangeAlt,
  faRightLeft,
  faLocation,
  faCancel,
  faCheck,
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
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
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

  const icons = [
    // Menu Lainnya
    { icon: faBullhorn, label: "Lapor", href: "/lapor", color: "text-red-500" },
    {
      icon: faCheckCircle,
      label: "Verifikasi",
      href: "/verifikasi-anggota-mutasi",
      color: "text-blue-500",
    },
    {
      icon: faUsers,
      label: "Data Anggota",
      href: "/anggota/data-anggota",
      color: "text-orange-500",
    },
    {
      icon: faSyncAlt,
      label: "Sinkronisasi",
      href: "/singkron-data",
      color: "text-yellow-500",
    },
    {
      icon: faFileInvoice,
      label: "Rekap Meninggal",
      href: "/rekap-meninggal",
      color: "text-pink-500",
    },
    {
      icon: faFileAlt,
      label: "Statistik",
      href: "/statistik",
      color: "text-blue-500",
    },
    {
      icon: faUserGraduate,
      label: "Status Anggota",
      href: "/anggota/status-anggota",
      color: "text-indigo-500",
    },
    {
      icon: faDatabase,
      label: "History data",
      href: "/history-data",
      color: "text-green-500",
    },
    {
      icon: faChair,
      label: "Pensiun",
      href: "/pensiun",
      color: "text-rose-500",
    },
    {
      icon: faSitemap,
      label: "Data Ranting",
      href: "/ranting/data",
      color: "text-blue-500",
    },
    // Menu Keuangan - Prioritas Utama
    {
      icon: faUbuntu,
      label: "Rekap By Nominal",
      href: "/anggota/rekap-anggota",
      color: "text-gray-500",
    },
    {
      icon: faMoneyBillTransfer,
      label: "Transaksi Bank",
      href: "/transaksi-bank",
      color: "text-green-600",
    },
    // {
    //   icon: faWallet,
    //   label: "Keuangan",
    //   href: "/keuangan/home",
    //   color: "text-lime-500",
    // },
    {
      icon: faMoneyBillTransfer,
      label: "Keuangan New",
      href: "/keuangan-new",
      color: "text-emerald-500",
    },
    {
      icon: faClipboardCheck,
      label: "Ketentuan",
      href: "/ketentuan",
      color: "text-teal-500",
    },
    {
      icon: faHandsHelping,
      label: "Bantuan",
      href: "/bantuan",
      color: "text-purple-500",
    },
    {
      icon: faCog,
      label: "Pengaturan",
      href: "/pengaturan/user",
      color: "text-gray-700",
    },
    {
      icon: faUsers,
      label: "Teman Unit",
      href: "/teman-unit-kerja",
      color: "text-green-600",
    },
    {
      icon: faImage,
      label: "Galeri",
      href: "/galeri",
      color: "text-green-600",
    },
    {
      icon: faExclamationCircle,
      label: "Pengaduan",
      href: "/pengaduan",
      color: "text-red-700",
      badge: newPengaduanCount > 0 ? newPengaduanCount : null,
    },
    {
      icon: faImages,
      label: "Eksport Foto",
      href: "/eksport-foto",
      color: "text-green-600",
    },
    {
      icon: faPenNib,
      label: "Kontributor",
      href: "/berita/create-berita",
      color: "text-orange-600",
    },
    {
      icon: faEarth,
      label: "Tour & Travel",
      href: "/biro-perjalanan/create-paket",
      color: "text-blue-600",
    },
    {
      icon: faBuildingColumns,
      label: "Lembaga",
      href: "/lembaga",
      color: "text-green-600",
    },
  ];

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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.625rem] sm:text-xs md:text-xs font-medium bg-green-500 text-white">
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
        <div className="inline-flex items-center space-x-2">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="w-6 h-6 text-blue-500 cursor-pointer hover:text-blue-600 mr-2"
              onClick={handleOpenPopup}
            />{" "}
            <button
              className="inline-flex items-center px-2 py-0.5 rounded text-[0.625rem] sm:text-xs md:text-xs font-medium bg-red-500 text-white sm:whitespace-normal whitespace-nowrap"
              onClick={() => handleSync()}
            >
              Belum Terdaftar
            </button>
          </div>

          <FontAwesomeIcon
            icon={faInfoCircle}
            className="w-6 h-6 text-white ml-2"
            onClick={handleOpenPopup}
          />
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

  const MobileDeceasedScroll = ({ sortedData, formatDate }) => {
    return (
      <div className="w-full overflow-x-auto pb-4 mb-16">
        <div className="flex space-x-4 px-4 min-w-min">
          {sortedData.map((currentData, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-72 bg-white rounded-lg shadow-md"
            >
              <div className="bg-gradient-to-r from-blue-400 to-blue-800 p-4 rounded-t-lg">
                <div className="flex justify-center mb-2">
                  <Image
                    src={
                      currentData.foto
                        ? `data:image/jpeg;base64,${currentData.foto}`
                        : profileImageUrl
                    }
                    width={80}
                    height={80}
                    alt={`Foto User ${currentData.namaLengkap}`}
                    className="object-cover rounded"
                    unoptimized={true}
                  />
                </div>
                <h2 className="text-base font-bold text-white text-center mb-1">
                  {currentData.namaLengkap}
                </h2>
                <p className="text-sm text-white text-center">
                  Meninggal {formatDate(currentData.waktuMeninggalTerlapor)}
                </p>
              </div>

              <div className="p-4">
                <div className="text-center space-y-1 mb-3">
                  <p className="text-sm">{currentData.npaPgri || "N/A"}</p>
                  <p className="text-sm">
                    {currentData.tempatLahir},{" "}
                    {formatDate(currentData.tanggalLahir)}
                  </p>
                  <p className="text-sm">{currentData.jabatan}</p>
                  <p className="text-sm">{currentData.unitKerja}</p>
                  <p className="text-sm">{currentData.cabang}</p>
                  <p className="text-sm">{currentData.alamat}</p>
                </div>

                <p className="text-center text-gray-600 mb-3 text-sm">
                  Catatan: {currentData.keteranganTerlapor}
                </p>

                <div className="flex justify-center mb-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-4 rounded-full transition duration-300">
                    <FontAwesomeIcon icon={faLocation} className="mr-1" />{" "}
                    Lokasi
                  </button>
                </div>

                <div className="bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-full text-center flex items-center justify-center mb-2">
                  <FontAwesomeIcon icon={faBullhorn} className="mr-2" /> PELAPOR
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm">
                    {formatDate(currentData.tanggalPelaporan)},{" "}
                    {currentData.jamLapor}
                  </p>
                  <p className="text-sm">{currentData.namaPelapor || "N/A"}</p>
                  <p className="text-sm">
                    📞 {currentData.nomorHpPelapor || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const filteredIcons =
    role === "USER"
      ? icons
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
            color: "text-blue-500",
            bgHover: "hover:bg-blue-100",
            iconColor: "text-blue-600",
          })
          .concat({
            icon: faUserPen,
            label: "Edit Anggota",
            href: "/anggota/edit-anggota",
            color: "text-orange-500",
            bgHover: "hover:bg-blue-100",
            iconColor: "text-blue-600",
          })
          .concat({
            icon: faRightLeft,
            label: "Mutasi",
            href: "/anggota/data-anggota/mutasiCabangUnit",
            color: "text-cyan-500",
          })
          .concat({
            icon: faFileAlt,
            label: "Daspen",
            href: "/daspen",
            color: "text-teal-700",
          })
          .concat({
            icon: faFileInvoiceDollar,
            label: "Tagihan",
            href: "/tagihan",
            color: "text-blue-700",
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
            ];
            return order.indexOf(a.label) - order.indexOf(b.label);
          })
      : role === "SUPERADMIN"
        ? icons
            .concat({
              icon: faNewspaper,
              label: "Berita",
              href: "/berita/view-berita",
              color: "text-purple-600",
              bgHover: "hover:bg-purple-100",
              iconColor: "text-purple-700",
            })
            .concat({
              icon: faYoutube,
              label: "LIVE",
              href: "/live-link",
              color: "text-red-600",
              bgHover: "hover:bg-red-100",
              iconColor: "text-red-700",
            })
            .concat({
              icon: faScroll,
              label: "Running Text",
              href: "/running-text",
              color: "text-indigo-600",
              bgHover: "hover:bg-indigo-100",
              iconColor: "text-indigo-700",
            })
            .concat({
              icon: faCog,
              label: "AI Knowledge",
              href: "/pengaturan/ai-knowledge",
              color: "text-emerald-600",
              bgHover: "hover:bg-emerald-100",
              iconColor: "text-emerald-700",
            })
        : role === "EDITOR"
          ? [
              ...icons.filter((item) => item.label === "Kontributor"),
              {
                icon: faNewspaper,
                label: "Berita",
                href: "/berita/view-berita",
                color: "text-purple-600",
                bgHover: "hover:bg-purple-100",
                iconColor: "text-purple-700",
              },
            ]
          : role === "ADMIN"
            ? icons.filter(
                (item) =>
                  item.label !== "Tour & Travel" &&
                  item.label !== "Pengaturan" &&
                  item.label !== "AI Knowledge" &&
                  item.label !== "Galeri" &&
                  item.label !== "Eksport Foto" &&
                  item.label !== "Keuangan",
              )
            : icons.filter((item) => item.label !== "Tour & Travel");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isMobile ? <HeaderMobile /> : <HeaderHome />}

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

          <div className="relative">
            <div className="h-48 md:h-64 overflow-hidden">
              <img
                src="/banner_fix.jpeg"
                alt="Banner background"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {(role === "USER" || role === "ADMIN") && (
              <div className="relative mx-auto -mt-32 mb-12 px-4 max-w-md">
                <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-xl">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center">
                      <Image
                        src={
                          fotoBase64
                            ? `data:image/jpeg;base64,${fotoBase64}`
                            : profileImageUrl
                        }
                        width={80}
                        height={80}
                        alt={`Foto User ${userData?.name}`}
                        className="object-contain w-full h-full"
                        unoptimized={true}
                      />
                    </div>

                    <div className="text-center mt-2">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                        {userData?.namaLengkap}
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        {userData?.npaPgri}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {userData?.nip}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center flex-1 gap-2 -mt-3">
                    <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                      {[
                        { label: "Daspen", value: userData?.pesertaDaspen },
                        {
                          label: "KTA Digital",
                          value: userData?.pesertaKtaDigital,
                        },
                        { label: "Sanduka", value: userData?.pesertaSanduka },
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <span className="text-xs font-medium text-gray-600">
                            {item.label}
                          </span>
                          <div className="mt-1 w-8 h-8 flex justify-center items-center bg-gray-100 rounded-full shadow-sm">
                            {renderCheckmark(item.value)}
                            {popupVisible && (
                              <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                                <div className="bg-white rounded-lg p-6 w-11/12 max-w-md text-center shadow-xl transform transition-all">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mx-auto text-yellow-500 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Informasi Sinkronisasi{" "}
                                  </h2>
                                  <p className="text-gray-600 mb-6">
                                    Data yang Anda akses melalui sistem kami
                                    tidak langsung tersinkronisasi dengan
                                    database DASPEN Jawa Tengah. Data yang
                                    ditampilkan merupakan hasil identifikasi
                                    berdasarkan Nomor Induk Pegawai (NIP) dan
                                    Tanggal Lahir yang Anda input.
                                  </p>
                                  <div className="flex justify-center gap-4">
                                    <button
                                      onClick={handleClosePopup}
                                      className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                                    >
                                      Tutup
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isMobile && (
              <div className="px-4 mx-auto max-w-6xl -mt-10 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Lapor Meninggal
                        </h3>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                          {jumlahMeninggal}{" "}
                          <span className="text-sm font-medium text-gray-500">
                            Orang
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date().toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-full">
                        <FontAwesomeIcon
                          icon={faBullhorn}
                          className="text-red-600 text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Sanduka Diberikan
                        </h3>
                        <p className="text-2xl font-bold text-orange-600 mt-2">
                          {jumlahSantunan}{" "}
                          <span className="text-sm font-medium text-gray-500">
                            Orang
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          2020 -{" "}
                          {new Date().toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-orange-600 text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Total Santunan
                        </h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          Rp {totalNominal.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          2020 -{" "}
                          {new Date().toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <FontAwesomeIcon
                          icon={faMoneyBill}
                          className="text-green-600 text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <VisitorCounter />
                </div>
              </div>
            )}
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                {filteredIcons.map((item, index) => (
                  <div key={index} className="relative">
                    <div
                      onClick={(e) => handleMainMenuClick(e, index, item.href)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1"
                    >
                      <div
                        className={`w-14 h-14 ${
                          item.color.includes("text-")
                            ? item.color.replace("text-", "bg-") + "/10"
                            : "bg-gray-100"
                        } rounded-full flex items-center justify-center mb-3 shadow-sm transition-all duration-300 group-hover:shadow-md`}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={`${item.color} text-2xl transition-transform duration-300 group-hover:scale-110`}
                        />
                        {item.badge && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                            {item.badge}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center transition-colors duration-300 group-hover:text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Anggota Meninggal Bulan Ini
                </h3>

                {!isMobile && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrev}
                      className="text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
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
                          className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 text-center">
                            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-white mb-3">
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
                            <h2 className="text-white font-bold truncate">
                              {currentData.namaLengkap}
                            </h2>
                            <p className="text-xs text-blue-100 mt-1">
                              Meninggal{" "}
                              {formatDate(currentData.waktuMeninggalTerlapor)}
                            </p>
                          </div>

                          <div className="p-4">
                            <div className="text-xs text-gray-600 space-y-1 mb-3">
                              <p>
                                <span className="font-medium">NPA:</span>{" "}
                                {currentData.npaPgri || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">TTL:</span>{" "}
                                {currentData.tempatLahir},{" "}
                                {formatDate(currentData.tanggalLahir)}
                              </p>
                              <p>
                                <span className="font-medium">Jabatan:</span>{" "}
                                {currentData.jabatan}
                              </p>
                              <p>
                                <span className="font-medium">Unit:</span>{" "}
                                {currentData.unitKerja}
                              </p>
                              <p>
                                <span className="font-medium">Cabang:</span>{" "}
                                {currentData.cabang}
                              </p>
                              <p>
                                <span className="font-medium">Alamat:</span>{" "}
                                {currentData.alamat}
                              </p>
                            </div>

                            <div className="text-xs text-gray-600 border-t border-dashed border-gray-200 pt-2 mt-2">
                              <p className="font-medium">Catatan:</p>
                              <p className="italic">
                                {currentData.keteranganTerlapor}
                              </p>
                            </div>

                            <div className="mt-4">
                              <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-3 rounded-full transition">
                                <FontAwesomeIcon
                                  icon={faLocation}
                                  className="mr-1.5"
                                />{" "}
                                Lihat Lokasi
                              </button>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3 mt-4">
                              <div className="flex items-center justify-center mb-2">
                                <span className="bg-blue-600 text-white text-xs py-1 px-3 rounded-full">
                                  <FontAwesomeIcon
                                    icon={faBullhorn}
                                    className="mr-1"
                                  />{" "}
                                  PELAPOR
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 text-center">
                                <p>
                                  {formatDate(currentData.tanggalPelaporan)},{" "}
                                  {currentData.jamLapor}
                                </p>
                                <p className="font-medium mt-1">
                                  {currentData.namaPelapor || "N/A"}
                                </p>
                                <p>📞 {currentData.nomorHpPelapor || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-md sm:max-w-full">
              <News />
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-md sm:max-w-full">
              <GaleriKegiatan />
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-md sm:max-w-full">
              <BiroTravel />
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-md sm:max-w-full">
              <LembagaDisplay />
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Maps Lokasi Rumah
              </h2>
              <p className="text-sm text-blue-600 mb-6">
                Anda dapat menyesuaikan lokasi dengan menggeser maps melalui
                Menu Edit Anggota
              </p>
              {latitude && longitude && (
                <div className="h-80 md:h-96 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                  <MapComponent latitude={latitude} longitude={longitude} />
                </div>
              )}
            </div>
          </div>

          <div className="px-4 mx-auto max-w-6xl mb-12 -mt-10">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-md sm:max-w-full">
              <Metsos />
            </div>
          </div>
        </main>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
