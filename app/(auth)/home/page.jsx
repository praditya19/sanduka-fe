"use client";
import { useState, useEffect, useRef } from "react";
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
  faSyncAlt,
  faUser,
  faUsersGear,
  faMoneyBill,
  faCheckCircle,
  faCog,
  faCalendarAlt,
  faUserTie,
  faHome,
  faChevronLeft,
  faChevronRight,
  faExchangeAlt,
  faRightLeft,
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

export default function IconGrid() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [statusSegeraCount, setStatusSegeraCount] = useState(0);
  const [loader, setLoader] = useState(false);
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
  const icons = [
    { icon: faBullhorn, label: "Lapor", href: "/lapor", color: "text-red-500" },
    {
      icon: faCheckCircle,
      label: "Verifikasi",
      href: "#",
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
      icon: faUsersGear,
      label: "by Name",
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
      icon: faSyncAlt,
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
  if (role === "SUPER ADMIN") {
    icons.push({
      icon: faUserGraduate,
      label: "Upload Galeri",
      href: "/galeri",
      color: "text-teal-500",
    });
  }
  
  const getPensiunDataAndCountSegera = async () => {
    setLoader(true);
  
    try {
      // Ambil data pensiun dari API
      const pensiunResponse = await GlobalApi.getAllPensiun();
  
      if (pensiunResponse && pensiunResponse.data.content) {
        const allPensiunList = pensiunResponse.data.content;
  
        // Filter data: Hitung jumlah "Segera" jika keterangan null
        const segeraItems = allPensiunList.filter(
          (item) => item.keterangan === null && item.status === "Segera"
        );
  
        const countSegera = segeraItems.length;
  
        // Simpan jumlah "Segera" ke sessionStorage
        sessionStorage.setItem("statusSegera", countSegera.toString());
  
        // Set jumlah "Segera" ke state
        setStatusSegeraCount(countSegera);
  
        // Simpan data utama ke state (tetap utuh)
        setPensiunList(allPensiunList);
  
        // Filter final (keterangan dan status)
        const finalFilteredPensiunList = allPensiunList.filter((item) => {
          // Jika keterangan null, tampilkan data dengan status "Segera"
          if (item.keterangan === null) {
            return item.status === "Segera";
          }
  
          // Jika keterangan bukan null, tampilkan semua kecuali "Pensiun"
          return item.keterangan !== "Pensiun";
        });
  
        // Set hasil filter ke state
        setFilteredPensiunList(finalFilteredPensiunList);
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data pensiun:", error);
    } finally {
      setLoader(false);
    }
  };
  
  useEffect(() => {
    // Cek status login saat komponen pertama kali dimuat
    checkLoginStatus();
  }, []);
  
  useEffect(() => {
    // Jika sudah login, jalankan fungsi untuk mengambil data pensiun
    if (isLoggedIn) {
      // Mengecek jika statusSegera sudah ada di sessionStorage
      const statusSegera = sessionStorage.getItem('statusSegera');
      if (statusSegera) {
        // Jika sudah ada, tidak perlu refresh
        setStatusSegeraCount(parseInt(statusSegera)); // Set statusSegeraCount langsung dari sessionStorage
      } else {
        // Jika tidak ada, jalankan fungsi untuk mendapatkan data pensiun tanpa refresh
        getPensiunDataAndCountSegera();
      }
    }
  }, [isLoggedIn]);
  
  const checkLoginStatus = () => {
    const userToken = sessionStorage.getItem('authToken');
  
    if (userToken) {
      setIsLoggedIn(true); // Set isLoggedIn true jika token ada
  
      // Jika statusSegera ada, ambil data pensiun langsung tanpa perlu refresh halaman
      const statusSegera = sessionStorage.getItem('statusSegera');
      if (!statusSegera) {
        // Jika statusSegera belum ada, jalankan fungsi untuk mendapatkan data pensiun tanpa refresh
        getPensiunDataAndCountSegera();
      }
    } else {
      router.push('/login');  // Jika belum login, arahkan ke halaman login
    }
  };

  const handleMainMenuClick = (e, index, href) => {
    e.preventDefault();
    if (index !== dropdownOpen) {
      setDropdownOpen(index);
    }
    if (href) {
      router.push(href);
    }
  };

  const handleDropdownClick = (href) => {
    router.push(href);
    setDropdownOpen(null);
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const handleNext = () => {
    if (currentIndex + itemsPerPage < dataArray.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

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
    const fetchAnggotaMeninggal = async () => {
      try {
        const data = await GlobalApi.getAnggotaMeninggal();
        setAnggotaMeninggal(data);
      } catch (error) {
        console.error("Error fetching anggota meninggal:", error);
      }
    };

    const userRole = sessionStorage.getItem("role");
    setRole(userRole);

    fetchAnggotaMeninggal();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        console.error("User ID tidak ditemukan di sessionStorage");
        return;
      }

      try {
        const response = await GlobalApi.getUserById(userId);
        console.log("Data user diterima:", response);
        setUserData(response);
      } catch (error) {
        console.error("Error saat mendapatkan data user:", error);
      }
    };

    fetchUserData();
  }, []);
  const renderCheckmark = (value) => {
    if (value === "Ya") {
      return <span className="text-green-500">✔</span>;
    } else if (value === "" || value === null || value === undefined || value === "TIDAK") {
      return <span className="text-red-500">✘</span>;
    }
    return null;
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem("role");
    setRole(userRole);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              "Data Anggota",
              "History data",
            ].includes(item.label)
          )
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
                {role === "USER" && (
                  <div className="flex justify-center mb-[18%] ml-3 -mt-32 items-center text-center overflow-x-hidden max-w-full">
                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">Daspen:</span>
                      <div className="w-14 h-14 flex -ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaDaspen)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">KTA Digital:</span>
                      <div className="w-14 h-14 flex -ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaKtaDigital)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">Sanduka:</span>
                      <div className="w-14 h-14 flex -ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaSanduka)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="w-full border overflow-x-auto -mt-11">
                  <div className="flex space-x-4 px-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 flex-shrink-0 w-48">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Lapor Meninggal
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          1 Orang
                        </p>
                        <p className="text-xs text-green-500 font-medium mt-1">
                          <span className="mr-1">↑</span>3.48% Since last month
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 flex-shrink-0 w-48">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Sanduka Diberikan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          173 Orang
                        </p>
                        <p className="text-xs text-red-500 font-medium mt-1">
                          <span className="mr-1">↓</span>1.10% Since yesterday
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105 flex-shrink-0 w-48">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Total Santunan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Rp.432.500.000,-
                        </p>
                        <p className="text-xs text-red-500 font-medium mt-1">
                          <span className="mr-1">↓</span>3.48% Since last week
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full -mt-12">
                {role === "USER" && (
                  <div className="flex justify-center space-x-8 mb-10 -mt-36 items-center text-center">
                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">Daspen:</span>
                      <div className="w-14 h-14 flex -ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaDaspen)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">KTA Digital:</span>
                      <div className="w-14 h-14 flex -ml-2 justify-center items-center text-2xl">
                        {renderCheckmark(userData?.pesertaKtaDigital)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className=" text-lg ">Sanduka:</span>
                      <div className="w-14 h-14 flex -ml-2 justify-center items-center text-2xl">
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

                {dropdownOpen === index && item.label === "Verifikasi" && (
                  <div
                    ref={dropdownRef}
                    className="absolute -left-14 sm:left-3 flex space-x-1 p-2 bg-transparent border-gray-300 rounded shadow-lg z-10 "
                  >
                    <button
                      onClick={() =>
                        handleDropdownClick("/verifikasi-anggota-mutasi")
                      }
                      className={`text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800`}
                    >
                      Verifikasi Anggota
                    </button>

                    <button
                      onClick={() =>
                        handleDropdownClick("/verifikasi-anggota-pindah-cabang")
                      }
                      className={`text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800`}
                    >
                      Verifikasi Pindah Cabang
                    </button>
                  </div>
                )}
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
          <button
            onClick={handlePrev}
            className="hidden text-red-500 lg:block absolute left-32 top-1/2 transform -translate-y-1/2 z-10 bg-gray-100 p-2 rounded-full shadow-md hover:bg-gray-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div className="flex mx-auto sm:mx-44 space-x-4 overflow-x-auto w-full px-4 lg:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-hidden">
            {anggotaMeninggal
              .slice(currentIndex, currentIndex + itemsPerPage)
              .map((currentData, index) => (
                <button
                  key={index}
                  className="min-w-[45%] sm:min-w-[30%]  bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <Image
                    className="ml-10 sm:ml-16 h-20 w-20 object-cover"
                    src="/profile.png"
                    alt="Profile Image"
                    width={100}
                    height={100}
                  />
                  <div className="p-4">
                    <h2 className="text-base font-semibold text-gray-800">
                      {currentData.namaLengkap}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {currentData.npaPgri}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="text-gray-600"
                        />
                        <span className="ml-2">
                          {Array.isArray(currentData.waktuMeninggalTerlapor) &&
                          currentData.waktuMeninggalTerlapor.length === 3
                            ? `${String(
                                currentData.waktuMeninggalTerlapor[2]
                              ).padStart(2, "0")}-${String(
                                currentData.waktuMeninggalTerlapor[1]
                              ).padStart(2, "0")}-${
                                currentData.waktuMeninggalTerlapor[0]
                              }`
                            : "Tanggal tidak valid"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faUserTie}
                          className="text-gray-600"
                        />
                        <span className="ml-2">{currentData.jabatan}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faHome}
                          className="text-gray-600"
                        />
                        <span className="ml-2">{currentData.unitKerja}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <button
            onClick={handleNext}
            className="hidden text-red-500 lg:block absolute right-32 top-1/2 transform -translate-y-1/2 z-10 bg-gray-100 p-2 rounded-full shadow-md hover:bg-gray-300"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
