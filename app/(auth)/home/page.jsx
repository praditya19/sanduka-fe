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
  faUserTie,
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
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import FooterMobile from "@/app/_components/FooterMobile";
import GaleriKegiatan from "@/app/_components/GaleriKegiatan";
import Image from "next/image";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_utils/GlobalApi";
import dynamic from "next/dynamic";
const MapComponent = dynamic(
  () => import("../../_components/MapComponent.jsx"),
  {
    ssr: false,
  }
);
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
  const [formattedAmount, setFormattedAmount] = useState("");
  const [fotoBase64, setFotoBase64] = useState(null);
  const [fotoMeninggal, setFotoMeninggal] = useState([]);
  const profileImageUrl = "/profile.png";
  const [data, setData] = useState(null);
  const icons = [
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
      icon: faUbuntu,
      label: "Rekap By Nominal",
      href: "/anggota/rekap-anggota",
      color: "text-gray-500",
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
      icon: faWallet,
      label: "Keuangan",
      href: "/keuangan/home",
      color: "text-lime-500",
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
      icon: faSitemap,
      label: "Data Ranting",
      href: "/ranting",
      color: "text-blue-500",
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
    // {
    //   icon: faExclamationCircle,
    //   label: "Pengaduan",
    //   href: "/pengaduan",
    //   color: "text-red-700",
    // },
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
          a.waktuMeninggalTerlapor[2]
        );

        const dateB = new Date(
          b.waktuMeninggalTerlapor[0],
          b.waktuMeninggalTerlapor[1] - 1,
          b.waktuMeninggalTerlapor[2]
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

    const fetchJumlahSantunan = async () => {
      try {
        const data = await GlobalApi.getJumlahSantunan();
        setJumlahSantunan(data[0].jumlah);
        setFormattedAmount(data[0].totalUangSantunan);

        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(data[0].totalUangSantunan);

        setFormattedAmount(formatted);
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
          deceasedData.map(async (deceased) => {
            try {
              const userResponse = await GlobalApi.searchUsersByName(
                deceased.namaLengkap
              );

              let decodedFoto = null;

              if (
                userResponse?.data?.users &&
                userResponse.data.users.length > 0
              ) {
                const userData = userResponse.data.users[0];

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
                };
              }
              return deceased;
            } catch (error) {
              console.error(
                `Error fetching details for ${deceased.namaLengkap}:`,
                error
              );
              return deceased;
            }
          })
        );

        setAnggotaMeninggal(detailedData);

        setFotoMeninggal(detailedData.map((data) => data.foto));
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
        dateArray[1]
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
        <button
          className="inline-flex items-center px-2 py-0.5 rounded text-[0.625rem] sm:text-xs md:text-xs font-medium bg-red-500 text-white sm:whitespace-normal whitespace-nowrap"
          onClick={() => handleDaspenRegistration()} // Menangani klik button
        >
          Belum Terdaftar
        </button>
      );
    }
    return null;
  };

  const handleDaspenRegistration = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      console.error("ID tidak ditemukan di sessionStorage");
      return;
    }
  
    try {
      // Mengambil data pengguna berdasarkan userId
      const response = await GlobalApi.getUserById(userId);
      const nip = response?.nip;
  
      if (!nip) {
        console.error("NIP tidak ditemukan.");
        return;
      }
  
      // Verifikasi NIP dengan getFileByNip
      const nipData = await GlobalApi.getFileByNip(nip);
      console.log("NIP yang dibandingkan: ", nipData?.nip);
      console.log("Hasil verifikasi NIP: ", nipData?.verifikasi);
  
      if (nipData?.verifikasi === true) {
        console.log("NIP valid, data sudah terverifikasi.");
  
        // Ambil data berdasarkan NIP menggunakan GlobalApi.getByNIP
        const dataDaspen = await GlobalApi.getByNIP(nip);
        console.log("Data yang diambil berdasarkan NIP: ", dataDaspen);
  
        // Menyimpan data yang diambil ke dalam state
        setData(dataDaspen);
  
        // Pastikan data telah diterima sebelum lanjutkan update
        if (dataDaspen) {
          console.log("Data yang akan diupdate: ", dataDaspen);
  
          // Menampilkan ID yang digunakan untuk update
          console.log("ID yang digunakan untuk mengupdate data: ", userId);
  
          // Panggil fungsi updateRegisUser untuk memperbarui data
          await GlobalApi.updateRegisUser(userId, dataDaspen);
  
          console.log("Data berhasil diperbarui.");
        } else {
          console.error("Data tidak ditemukan untuk diperbarui.");
        }
      } else {
        console.error("NIP tidak terverifikasi.");
      }
    } catch (error) {
      console.error(
        "Error saat mendapatkan data user atau memverifikasi NIP:",
        error
      );
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
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-400 to-blue-800 p-4 rounded-t-lg">
                <div className="flex justify-center mb-2">
                  <Image
                    src={
                      fotoMeninggal[index]
                        ? `data:image/jpeg;base64,${fotoMeninggal[index]}`
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

              {/* Content */}
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
              "History data",
              // "Pengaduan",
            ].includes(item.label)
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
          .sort((a, b) => {
            const order = [
              "Lapor",
              "Detail Anggota",
              "Edit Anggota",
              "Mutasi",
              "History data",
              "Daspen",
              "Ketentuan",
              "Bantuan",
              "Teman Unit",
              // "Pengaduan",
            ];
            return order.indexOf(a.label) - order.indexOf(b.label);
          })
      : role === "SUPER ADMIN"
      ? icons
      : icons.filter((item) => item.label !== "Galeri");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      {isMobile ? <HeaderMobile /> : <HeaderHome />}

      <div className="flex-1">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Hero Banner */}
          <div className="relative">
            <div className="h-48 md:h-64 overflow-hidden">
              <img
                src="/banner_fix.jpeg"
                alt="Banner background"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Profile Section */}
            {(role === "USER" || role === "ADMIN") && (
              <div className="relative mx-auto -mt-32 mb-12 px-4 max-w-md">
                <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-xl">
                  {/* User Photo */}
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 md:h-20 md:w-20 overflow-hidden border-2 border-gray-300 shadow-sm ml-5">
                      <Image
                        src={
                          fotoBase64
                            ? `data:image/jpeg;base64,${fotoBase64}`
                            : profileImageUrl
                        }
                        width={80}
                        height={80}
                        alt={`Foto User ${userData?.name}`}
                        className="object-cover w-full h-full"
                        unoptimized={true}
                      />
                    </div>
                    {/* User Details */}
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                        {userData?.namaLengkap}
                      </h2>
                      <p className="text-xs text-gray-500 font-medium text-center">
                        {userData?.npaPgri}
                      </p>
                      <p className="text-xs text-gray-500 font-medium text-center">
                        {userData?.nip}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col items-center text-center flex-1 gap-2 -mt-3">
                    {/* Membership Status */}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            {!isMobile && (
              <div className="px-4 mx-auto max-w-6xl -mt-10 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1 */}
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

                  {/* Card 2 */}
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

                  {/* Card 3 */}
                  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Total Santunan
                        </h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {formattedAmount}
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
                </div>
              </div>
            )}
          </div>

          {/* Menu Icons */}
          <div className="px-4 mx-auto max-w-6xl mb-12">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Menu Utama
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                {filteredIcons.map((item, index) => (
                  <div key={index} className="relative">
                    <div
                      onClick={(e) => handleMainMenuClick(e, index, item.href)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                    >
                      <div
                        className={`w-14 h-14 ${
                          item.color.includes("text-")
                            ? item.color.replace("text-", "bg-") + "/10"
                            : "bg-gray-100"
                        } rounded-full flex items-center justify-center mb-3 shadow-sm`}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={`${item.color} text-2xl`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deceased Members Section */}
          <div className="px-4 mx-auto max-w-6xl mb-12">
            <div className="bg-white rounded-xl shadow-md p-6">
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
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 text-center">
                            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-white mb-3">
                              <Image
                                src={
                                  fotoMeninggal[index]
                                    ? `data:image/jpeg;base64,${fotoMeninggal[index]}`
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

                          {/* Info */}
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

          {/* Gallery Section */}
          <div className="px-4 mx-auto max-w-6xl mb-12">
            <div className="bg-white rounded-xl shadow-md p-6">
              <GaleriKegiatan />
            </div>
          </div>

          {/* Map Section */}
          <div className="px-4 mx-auto max-w-6xl mb-12">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Maps Lokasi Rumah
              </h2>
              <p className="text-sm text-blue-600 mb-6">
                Anda bisa menyesuaikan lokasi dengan menggeser posisi maps
                sesuai dengan lokasi yang tepat melalui Menu Edit Anggota
              </p>
              {latitude && longitude && (
                <div className="h-80 md:h-96 rounded-lg overflow-hidden border border-gray-200">
                  <MapComponent latitude={latitude} longitude={longitude} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
