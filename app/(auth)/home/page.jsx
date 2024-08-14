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
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import FooterMobile from "@/app/_components/FooterMobile";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/app/_components/Sidebar";
import SemuaAnggotaCabang from "@/app/_components/SemuaAnggotaCabang";

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

export default function IconGrid() {
  const [isMobile, setIsMobile] = useState(false);

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

      <div className="flex flex-1">
        {!isMobile && (
          <div>
            <Sidebar />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg mb-8 w-full">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Lapor Meninggal */}
                  <div className="bg-white p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faBullhorn}
                        size="lg"
                        className="text-blue-500 mb-2"
                      />
                      <p className="text-xs md:text-sm font-bold text-gray-800 tracking-wide uppercase mb-1">
                        Lapor Meninggal
                      </p>
                      <p className="text-2xl text-gray-700 font-normal">
                        1 Orang
                      </p>
                    </div>
                  </div>

                  {/* Sanduka Diberikan */}
                  <div className="bg-white p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        size="lg"
                        className="text-red-500 mb-2"
                      />
                      <p className="text-xs md:text-sm font-bold text-gray-700 tracking-wide uppercase mb-1">
                        Sanduka Diberikan
                      </p>
                      <p className="text-2xl text-gray-800 font-normal">
                        173 Orang
                      </p>
                    </div>
                  </div>

                  {/* Total Santunan */}
                  <div className="bg-white p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                    <div className="text-center">
                      <FontAwesomeIcon
                        icon={faMoneyBill}
                        size="lg"
                        className="text-green-500 mb-2"
                      />
                      <p className="text-xs md:text-sm font-bold text-gray-700 tracking-wide uppercase mb-1">
                        Total Santunan
                      </p>
                      <p className="text-2xl text-gray-800 font-normal">
                        Rp.432.500.000,-
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {isMobile ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-16">
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
          ) : (
            <div className="bg-white">
              <SemuaAnggotaCabang />
            </div>
          )}
        </div>
      </div>

      {isMobile && <FooterMobile />}
    </div>
  );
}
