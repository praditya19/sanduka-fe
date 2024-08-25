"use client";
import { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import FooterMobile from "@/app/_components/FooterMobile";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";

const icons = [
  { icon: faBullhorn, label: "Lapor", href: "/lapor", color: "text-red-500" },
  {
    icon: faCheckCircle,
    label: "Verifikasi Anggota",
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
    label: "Rekap Anggota",
    href: "/anggota/rekap-anggota",
    color: "text-gray-500",
  },
  {
    icon: faUsersGear,
    label: "Anggota by Name",
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
    icon: faSyncAlt,
    label: "Singkron Data",
    href: "/singkron-data",
    color: "text-teal-700",
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
    label: "Teman dalam Unit",
    href: "/teman-unit-kerja",
    color: "text-green-700",
  },
];

const dummyData = [
  {
    name: "MUHAMMAD ALFARIZA HAQIQI",
    id: "0001146804614",
    dateOfDeath: "01-01-2000",
    position: "Guru",
    address: "Jl. Mawar No. 1",
    img: "/profile.png",
  },
  {
    name: "Venushyntha Phauna Pharamytha Tribuana",
    id: "0001146804614",
    dateOfDeath: "01-01-2000",
    position: "Guru",
    address: "Jl. Mawar No. 1",
    img: "/profile.png",
  },
  {
    name: "ALEXANDER JOSEPH",
    id: "0001146804615",
    dateOfDeath: "02-02-2001",
    position: "Guru",
    address: "Jl. Melati No. 2",
    img: "/profile.png",
  },
  {
    name: "LARAS MAHARANI",
    id: "0001146804616",
    dateOfDeath: "03-03-2002",
    position: "Guru",
    address: "Jl. Anggrek No. 3",
    img: "/profile.png",
  },
];

export default function IconGrid() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % dummyData.length);
      }, 10000); // Change slide every 10 seconds

      return () => clearInterval(intervalId);
    }
  }, [token, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % dummyData.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? dummyData.length - 1 : prevIndex - 1
    );
  };

  const currentData = dummyData[currentIndex];

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full mb-5 px-4">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Image
                src="/sanduka.png"
                width={100}
                height={50}
                alt="logo"
                className="object-contain"
              />
            </div>
            <div className="flex items-center w-full max-w-lg ml-4">
              <a href="/anggota/pencarian-anggota" className="flex w-full">
                <Input
                  type="text"
                  placeholder="Cari Anggota"
                  className="w-full p-2 border rounded-l-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out"
                />
                <Button className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition duration-300 ease-in-out shadow-md">
                  Cari
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex-1 p-6 ">
            {isMobile ? (
              <div className="flex flex-col items-center">
                <div className="flex justify-around w-full gap-2">
                  <div className="bg-red-100 rounded-lg shadow-md transform transition duration-300 hover:scale-105 p-1.5">
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faBullhorn}
                        size="lg"
                        className="text-red-500 mb-2"
                      />
                      <p className="text-xs font-normal text-gray-700 whitespace-nowrap mb-1">
                        Lapor Meninggal
                      </p>
                      <p className="text-gray-600 font-bold text-sm">1 Orang</p>
                    </div>
                  </div>
                  <div className="bg-orange-100 rounded-lg shadow-md transform transition duration-300 hover:scale-105 p-1.5">
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        size="lg"
                        className="text-orange-500 mb-2"
                      />
                      <p className="text-xs font-normal text-gray-700 whitespace-nowrap mb-1">
                        Sanduka diberikan
                      </p>
                      <p className="text-gray-600 font-bold text-sm">
                        173 Orang
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-lg shadow-md transform transition duration-300 hover:scale-105 p-1.5">
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faMoneyBill}
                        size="lg"
                        className="text-green-500 mb-2"
                      />
                      <p className="text-xs font-normal text-gray-700 whitespace-nowrap mb-1">
                        Total Santunan
                      </p>
                      <p className="text-gray-600 font-bold text-sm">
                        Rp.432.500.000,-
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full mt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-12">
                  {/* Lapor Meninggal */}
                  <div className="bg-white p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-gray-800">
                          Lapor Meninggal
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          1 Orang
                        </p>
                        <p className="text-xs text-green-500 font-medium mt-1">
                          <span className="mr-1">↑</span>3.48% Since last month
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-red-500 rounded-full p-2">
                        <FontAwesomeIcon
                          icon={faBullhorn}
                          className="text-white text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sanduka Diberikan */}
                  <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-gray-800">
                          Sanduka Diberikan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          173 Orang
                        </p>
                        <p className="text-xs text-red-500 font-medium mt-1">
                          <span className="mr-1">↓</span>1.10% Since yesterday
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-orange-500 rounded-full p-2">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-white text-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Santunan */}
                  <div className="bg-white p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xl font-bold text-gray-800">
                          Total Santunan
                        </p>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Rp.432.500.000,-
                        </p>
                        <p className="text-xs text-red-500 font-medium mt-1">
                          <span className="mr-1">↓</span>3.48% Since last week
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-yellow-500 rounded-full p-2">
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

          <div className="px-16 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-2">
            {icons.map((item, index) => (
              <Link key={index} href={item.href}>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                  <FontAwesomeIcon
                    icon={item.icon}
                    size="2x"
                    className={`mb-2 ${item.color}`}
                  />
                  <span className="text-xs font-normal text-gray-700 text-center whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Separator with Title */}
      <div className="w-full text-center my-4">
        <hr className="mt-2 border-gray-300" />
        <h3 className="text-xl font-semibold text-gray-800">
          Anggota Meninggal Bulan Ini
        </h3>
      </div>

      {/* Card anggota meninggal */}
      <div className="w-full flex justify-center items-center relative mb-4">
        <button
          onClick={handlePrev}
          className="absolute left-1/4 bg-white rounded-full p-2 shadow-md"
        >
          <FontAwesomeIcon icon={faChevronLeft} size="lg" />
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center justify-center p-4 w-1/3">
          <Image
            className="rounded-full"
            src={currentData.img}
            alt="Profile Image"
            width={100}
            height={100}
          />
          <div className="ml-8">
            <h2 className="text-xs font-semibold text-gray-800">
              {currentData.name}
            </h2>
            <p className="text-sm text-gray-600">{currentData.id}</p>
            <div className="mt-2">
              <div className="flex items-center text-gray-800 text-sm mb-1">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-gray-600"
                />
                <span className="ml-2">{currentData.dateOfDeath}</span>
              </div>
              <div className="flex items-center text-gray-800 text-sm mb-1">
                <FontAwesomeIcon icon={faUserTie} className="text-gray-600" />
                <span className="ml-2">{currentData.position}</span>
              </div>
              <div className="flex items-center text-gray-800 text-sm mb-1">
                <FontAwesomeIcon icon={faHome} className="text-gray-600" />
                <span className="ml-2">{currentData.address}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-1/4 bg-white rounded-full p-2 shadow-md"
        >
          <FontAwesomeIcon icon={faChevronRight} size="lg" />
        </button>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
