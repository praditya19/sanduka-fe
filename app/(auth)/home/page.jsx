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
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import FooterMobile from "@/app/_components/FooterMobile";
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
  const [loader, setLoader] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;
  const [anggotaMeninggal, setAnggotaMeninggal] = useState([]);
  const [detailedUserData, setDetailedUserData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
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
      href: "/anggota/by-name",
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
  ];
  const sortByDate = (data) => {
    return [...data].sort((a, b) => {
      try {
        // Check if waktuMeninggalTerlapor exists and is an array
        if (
          !Array.isArray(a.waktuMeninggalTerlapor) ||
          !Array.isArray(b.waktuMeninggalTerlapor)
        ) {
          return 0; // Keep original order if data is invalid
        }

        // Convert array date format to Date object for comparison
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

        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // Keep original order if dates are invalid
        }

        return dateB - dateA; // Sort descending (newest first)
      } catch (error) {
        console.error("Error sorting dates:", error);
        return 0; // Keep original order if there's an error
      }
    });
  };

  // Dalam komponen, sebelum melakukan mapping:
  const sortedData = useMemo(() => {
    try {
      return sortByDate(anggotaMeninggal);
    } catch (error) {
      console.error("Error in sorting:", error);
      return anggotaMeninggal; // Return unsorted data if sorting fails
    }
  }, [anggotaMeninggal]);

  // if (role === "SUPER ADMIN") {
  //   icons.push({
  //     icon: faUserGraduate,
  //     label: "Upload Galeri",
  //     href: "/galeri",
  //     color: "text-teal-500",
  //   });
  // }

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchCombinedUserData = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        // Dapatkan data meninggal
        const deceasedData = await GlobalApi.getAnggotaMeninggal(year, month);

        // Fetch detail untuk setiap anggota meninggal
        const detailedData = await Promise.all(
          deceasedData.map(async (deceased) => {
            try {
              const userResponse = await GlobalApi.searchUsersByName(
                deceased.namaLengkap
              );

              if (
                userResponse?.data?.users &&
                userResponse.data.users.length > 0
              ) {
                const userData = userResponse.data.users[0];
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
      } catch (error) {
        console.error("Error fetching combined user data:", error);
      }
    };

    const fetchUserData = async () => {
      const userId = sessionStorage.getItem("userId");

      if (!userId) {
        console.error("ID tidak ditemukan di sessionStorage");
        return;
      }

      try {
        const idToFetch = userId;
        const response = await GlobalApi.getUserById(idToFetch);
        setUserData(response);
        setLatitude(response.latitude);
        setLongitude(response.longitude);
      } catch (error) {
        console.error("Error saat mendapatkan data user:", error);
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.625rem] sm:text-xs md:text-xs font-medium bg-red-500 text-white sm:whitespace-normal whitespace-nowrap">
          Belum Terdaftar
        </span>
      );
    }
    return null;
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
                    src="/profile.png"
                    width={80}
                    height={80}
                    alt="Profile"
                    className="rounded-full border-2 border-white shadow-md"
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
          ].includes(item.label)
        )
        .concat({
          icon: faUser,
          label: "Detail Anggota",
          href: "/anggota/detail-anggota",
          color: "text-blue-600 hover:text-blue-800",
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
          ];
          return order.indexOf(a.label) - order.indexOf(b.label);
        })
    : icons;


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? <HeaderMobile /> : <HeaderHome />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex-1 mt-[3.1%]">
            <img
              src="https://img.pikbest.com/backgrounds/20190905/gray-and-white-color-geometric-abstract-background-v_1547232jpg!sw800"
              alt="Deskripsi gambar"
              className="w-full h-52  object-cover"
            />
          </div>
          <div className="flex-1 ">
            {isMobile ? (
              <>
                {(role === "USER" || role === "ADMIN") && (
                  <div className="flex justify-center mb-[10%] -mt-20 items-center text-center overflow-x-hidden max-w-full gap-8">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs">Daspen:</span>
                      <div className="w-14 h-14 flex justify-center items-center text-xs -mt-4">
                        {renderCheckmark(userData?.pesertaDaspen)}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs">KTA Digital:</span>
                      <div className="w-14 h-14 flex justify-center items-center text-xs -mt-4">
                        {renderCheckmark(userData?.pesertaKtaDigital)}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs">Sanduka:</span>
                      <div className="w-14 h-14 flex justify-center items-center text-xs -mt-4">
                        {renderCheckmark(userData?.pesertaSanduka)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="w-full border overflow-x-auto -mt-11">
                  <div className="flex space-x-2 px-1">
                    <div className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 flex-shrink-0 w-40">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Lapor Meninggal
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          1 Orang
                        </p>
                        <p className="text-sm text-red-500 font-medium mt-1">
                          <span className="mr-1">
                            {new Date().toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 flex-shrink-0 w-40">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Sanduka Diberikan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          173 Orang
                        </p>
                        <p className="text-sm text-green-500 font-medium mt-1">
                          <span className="mr-1">
                            2020 -{" "}
                            {new Date().toLocaleDateString("id-ID", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 flex-shrink-0 w-40">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Total Santunan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Rp.432.500.000,-
                        </p>
                        <p className="text-sm text-green-500 font-medium mt-1">
                          <span className="mr-1">
                            2020 -{" "}
                            {new Date().toLocaleDateString("id-ID", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full -mt-12">
                {(role === "USER" || role === "ADMIN") && (
                  <div className="flex justify-center space-x-8 mb-10 -mt-36 items-center text-center">
                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">Daspen:</span>
                      <div className="w-14 h-14 flex ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaDaspen)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">KTA Digital:</span>
                      <div className="w-14 h-14 flex ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaKtaDigital)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">Sanduka:</span>
                      <div className="w-14 h-14 flex ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaSanduka)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-12">
                  <div className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-gray-800 -mt-1">
                          Lapor Meninggal
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                          1 Orang
                        </p>
                        <p className="text-sm text-red-500 font-medium mt-1">
                          <span className="mr-1">
                            {new Date().toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-red-500 rounded-full p-2 mt-0">
                        <FontAwesomeIcon
                          icon={faBullhorn}
                          className="text-white text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-gray-800 -mt-1">
                          Sanduka Diberikan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                          173 Orang
                        </p>
                        <p className="text-sm text-green-500 font-medium mt-1">
                          <span className="mr-1">
                            2020 -{" "}
                            {new Date().toLocaleDateString("id-ID", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-orange-500 rounded-full p-2 mt-0">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-white text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 h-24">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-gray-800 -mt-1">
                          Total Santunan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                          Rp.432.500.000,-
                        </p>
                        <p className="text-sm text-green-500 font-medium mt-1">
                          <span className="mr-1">
                            2020 -{" "}
                            {new Date().toLocaleDateString("id-ID", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-yellow-500 rounded-full p-2 mt-0">
                        <FontAwesomeIcon
                          icon={faMoneyBill}
                          className="text-white text-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 mt-5 sm:px-12 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-2">
            {filteredIcons.map((item, index) => (
              <div key={index} className="relative">
                <div
                  onClick={(e) => handleMainMenuClick(e, index, item.href)}
                  className="flex flex-col items-center cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-xl p-7 sm:p-4 sm:bg-white sm:rounded-lg sm:shadow-lg lg:p-4 lg:bg-transparent lg:shadow-none"
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    size="2x"
                    className={`mb-2 ${item.color}`}
                  />
                  <span className="text-xs font-normal text-gray-700 text-center whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={` flex flex-col items-center my-4 ${
            isSidebarOpen ? "ml-32" : "ml-0"
          }`}
        >
          <hr className="mt-2 border-gray-300 w-full" />
          <h5 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4 text-center">
            Anggota Meninggal Bulan Ini
          </h5>
        </div>

        <div
          className={`w-full flex justify-center items-center relative mb-16 sm:mb-4 ${
            isSidebarOpen ? "ml-32" : "ml-0"
          }`}
        >
          {isMobile ? (
            <MobileDeceasedScroll
              sortedData={sortedData}
              formatDate={formatDate}
            />
          ) : (
            <>
              <button
                onClick={handlePrev}
                className="hidden text-red-500 lg:block absolute left-32 top-1/2 transform -translate-y-1/2 z-10 bg-gray-100 p-2 rounded-full shadow-md hover:bg-gray-300"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <div className="flex mx-auto sm:mx-44 space-x-4 overflow-x-auto w-full px-4 lg:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-hidden">
                {sortedData &&
                  sortedData
                    .slice(currentIndex, currentIndex + itemsPerPage)
                    .map((currentData, index) => (
                      <div key={index} className="mb-3 max-w-xs">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-blue-400 to-blue-800 p-2 text-center rounded-lg mb-2 relative">
                          <div className="flex justify-center mb-1">
                            <Image
                              src="/profile.png"
                              width={80}
                              height={80}
                              alt="Profile"
                              className="rounded-full border-2 border-white shadow-md"
                            />
                          </div>
                          <h2 className="text-sm font-bold text-white mb-0.5">
                            {currentData.namaLengkap}
                          </h2>
                          <p className="text-xs font-medium text-white">
                            Meninggal{" "}
                            {formatDate(currentData.waktuMeninggalTerlapor)}
                          </p>
                        </div>

                        {/* Detailed Information */}
                        <div className="text-center text-gray-700 mb-2 -mt-2">
                          <p className="text-xs">
                            {currentData.npaPgri || "N/A"}
                          </p>
                          <p className="text-xs">
                            {currentData.tempatLahir},{" "}
                            {formatDate(currentData.tanggalLahir)}
                          </p>
                          <p className="text-xs">{currentData.jabatan}</p>
                          <p className="text-xs">{currentData.unitKerja}</p>
                          <p className="text-xs">{currentData.cabang}</p>
                          <p className="text-xs">{currentData.alamat}</p>
                        </div>

                        {/* Notes */}
                        <p className="text-center text-gray-600 mb-1 text-xs font-medium">
                          Catatan: {currentData.keteranganTerlapor}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex justify-around mb-2 gap-1">
                          <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-0.5 px-2 rounded-full transition duration-300">
                            <FontAwesomeIcon
                              icon={faLocation}
                              className="mr-1"
                            />{" "}
                            Lokasi
                          </button>
                        </div>

                        {/* Reporter Section */}
                        <div className="bg-blue-700 text-white text-xs font-medium py-1 px-3 rounded-full text-center flex items-center justify-center mb-2">
                          <FontAwesomeIcon icon={faBullhorn} className="mr-1" />{" "}
                          PELAPOR
                        </div>
                        <p className="text-center text-gray-600 mt-1 text-xs">
                          {formatDate(currentData.tanggalPelaporan)},{" "}
                          {currentData.jamLapor}
                        </p>
                        <p className="text-center text-gray-600 text-xs">
                          {currentData.namaPelapor || "N/A"}
                        </p>
                        <p className="text-center text-gray-600 text-xs">
                          📞 {currentData.nomorHpPelapor || "N/A"}
                        </p>
                      </div>
                    ))}
              </div>

              <button
                onClick={handleNext}
                className="hidden text-red-500 lg:block absolute right-32 top-1/2 transform -translate-y-1/2 z-10 bg-gray-100 p-2 rounded-full shadow-md hover:bg-gray-300"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}
        </div>

        <div className="w-full col-span-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Maps Lokasi Rumah
          </h2>
          {latitude && longitude && (
            <div className="mt-8">
              <MapComponent latitude={latitude} longitude={longitude} />
            </div>
          )}
        </div>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
