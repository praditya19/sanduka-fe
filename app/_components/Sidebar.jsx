import React, { useState, useEffect } from "react";
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
  faUsersGear,
  faCheckCircle,
  faCog,
  faBars,
  faTimes,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";

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
    href: "#",
    color: "text-lime-500",
    isDropdown: true,
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
    href: "#",
    color: "text-gray-700",
    isDropdown: true,
  },
  {
    icon: faUsers,
    label: "Teman dalam Unit",
    href: "/teman-unit-kerja",
    color: "text-green-700",
  },
];

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    pengaturan: false,
    keuangan: false,
    dataUtama: false,
    sanduka: false,
    organisasi: false,
  });

  const [currentPath, setCurrentPath] = useState(null);

  useEffect(() => {
    const { pathname } = window.location;
    setCurrentPath(pathname);
  }, []);

  const toggleDropdown = (menu) => {
    setIsDropdownOpen((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

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
    <div className="relative">
      {!isMobile && (
        <div>
          <Button
            onClick={toggleSidebar}
            className={`p-2 rounded-md text-black ${
              isSidebarOpen ? "bg-black" : "bg-transparent"
            } transition-colors duration-300 hover:bg-gray-500 focus:outline-none fixed top-5 sm:top-1 left-2 sm:left-4 z-50`}
          >
            <FontAwesomeIcon
              icon={isSidebarOpen ? faTimes : faBars}
              size="lg"
              className={`text-black ${
                isSidebarOpen ? "text-white" : "text-black"
              }`}
            />
          </Button>
        </div>
      )}

      <div
        className={`fixed top-0 left-0 w-64 min-h-screen bg-white p-4 flex flex-col space-y-2 shadow-lg mt-12 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden`}
      >
        <div className="flex flex-col space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {icons.map((item, index) => {
            const isActive = currentPath === item.href;

            if (item.isDropdown) {
              return (
                <div className="relative" key={index}>
                  <button
                    onClick={() => toggleDropdown(item.label.toLowerCase())}
                    className={`flex items-center justify-between p-3 w-full space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md ${
                      isActive ? "bg-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon
                        icon={item.icon}
                        size="lg"
                        className={`${item.color} w-6`}
                      />
                      <span
                        className={`text-sm md:text-base font-medium ${
                          isActive ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={
                        isDropdownOpen[item.label.toLowerCase()]
                          ? faChevronUp
                          : faChevronDown
                      }
                      className="text-gray-700"
                    />
                  </button>

                  {isDropdownOpen[item.label.toLowerCase()] && (
                    <div className="pl-10 mt-2">
                      {/* dropdown pengaturan */}
                      {item.label === "Pengaturan" && (
                        <>
                          <Link
                            href="/pengaturan/user"
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              User
                            </span>
                          </Link>
                          <Link
                            href="/pengaturan/tambah"
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              Tambah Cabang
                            </span>
                          </Link>
                          <Link
                            href="/pengaturan/unit-kerja"
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              Unit Kerja
                            </span>
                          </Link>
                        </>
                      )}
                      {/* dropdown keuangan */}
                      {item.label === "Keuangan" && (
                        <>
                          <Link
                            href="/keuangan/home"
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              Home
                            </span>
                          </Link>
                          <button
                            onClick={() => toggleDropdown("dataUtama")}
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md w-full justify-between"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              Data Utama
                            </span>
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`ml-auto text-gray-700 transform ${
                                isDropdownOpen["dataUtama"] ? "rotate-180" : ""
                              } transition-transform duration-300`}
                            />
                          </button>

                          {isDropdownOpen["dataUtama"] && (
                            <div className="pl-4">
                              <Link
                                href="/keuangan/data-utama/iuran-pgri"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Iuran PGRI
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/data-utama/daspen"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Daspen
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/data-utama/derap"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Derap
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/data-utama/kalender"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Kalender
                                </span>
                              </Link>
                            </div>
                          )}
                          <button
                            onClick={() => toggleDropdown("sanduka")}
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md w-full justify-between"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              Sanduka
                            </span>
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`ml-auto text-gray-700 transform ${
                                isDropdownOpen["sanduka"] ? "rotate-180" : ""
                              } transition-transform duration-300`}
                            />
                          </button>

                          {isDropdownOpen["sanduka"] && (
                            <div className="pl-4">
                              <Link
                                href="/keuangan/sanduka/pemasukan"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Pemasukan
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/sanduka/pengeluaran"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Pengeluaran
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/sanduka/lapor"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Lapor
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/sanduka/laporan"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Laporan
                                </span>
                              </Link>
                            </div>
                          )}
                          <button
                            onClick={() => toggleDropdown("organisasi")}
                            className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md w-full justify-between"
                          >
                            <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                              Organisasi
                            </span>
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`text-gray-700 transform ${
                                isDropdownOpen["organisasi"] ? "rotate-180" : ""
                              } transition-transform duration-300`}
                            />
                          </button>

                          {isDropdownOpen["organisasi"] && (
                            <div className="pl-4">
                              <Link
                                href="/keuangan/organisasi/pemasukan"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Pemasukan
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/organisasi/pengeluaran"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Pengeluaran
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/organisasi/laporan"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Laporan
                                </span>
                              </Link>
                              <Link
                                href="/keuangan/organisasi/kwitansi"
                                className="flex items-center p-2 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
                              >
                                <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
                                  Kwitansi
                                </span>
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                href={item.href}
                key={index}
                className={`flex items-center p-3 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md ${
                  isActive ? "bg-blue-400" : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  size="lg"
                  className={`${item.color} w-6`}
                />
                <span
                  className={`text-sm md:text-base font-medium ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
