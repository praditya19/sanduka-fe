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
  faChartPie,
  faSitemap,
  faImage,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlobalApi from "@/app/_utils/GlobalApi";

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
    isDropdown: true,
  },
  {
    icon: faUsers,
    label: "Teman Unit",
    href: "/teman-unit-kerja",
    color: "text-green-700",
  },
  {
    icon: faImage,
    label: "Galeri",
    href: "/galeri",
    color: "text-green-700",
  },
  {
    icon: faExclamationCircle,
    label: "Pengaduan",
    href: "/pengaduan",
    color: "text-red-700",
  },
];

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [currentPath, setCurrentPath] = useState(null);
  const [role, setRole] = useState(null);
  const [newPengaduanCount, setNewPengaduanCount] = useState(0);
  const [userCabang, setUserCabang] = useState("");
  const [badgeVisible, setBadgeVisible] = useState(true);

  useEffect(() => {
    const { pathname } = window.location;
    setCurrentPath(pathname);

    const userRole = sessionStorage.getItem("role");
    const cabang = sessionStorage.getItem("cabang");
    setRole(userRole);
    setUserCabang(cabang);

    if (pathname !== "/pengaduan") {
      setBadgeVisible(true);
    } else {
      setBadgeVisible(false);
    }
  }, []);

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

  const fetchNewPengaduanCount = async () => {
    try {
      let cabang = null;
      if (role === "ADMIN") {
        cabang = userCabang; 
      }

      const count = await GlobalApi.countNewPengaduan(1, cabang); 
      setNewPengaduanCount(count);
    } catch (error) {
      console.error("Error fetching new pengaduan count:", error);
    }
  };

  useEffect(() => {
    if (role === "ADMIN" || role === "SUPER ADMIN") {
      fetchNewPengaduanCount();

      const interval = setInterval(fetchNewPengaduanCount, 60000); 

      return () => clearInterval(interval);
    }
  }, [role, userCabang]);

  const filteredIcons = icons.filter((item) => {
    if (role === "USER") {
      return [
        "Lapor",
        "Teman Unit",
        "Ketentuan",
        "Bantuan",
        "Data Anggota",
        "History data",
        "Pengaduan",
      ].includes(item.label);
    } else if (role === "SUPER ADMIN") {
      return true;
    } else {
      return item.label !== "Galeri";
    }
  });

  const handleIconClick = (label) => {
    if (label === "Pengaduan") {
      setBadgeVisible(false);
    }
  };

  return (
    <div className="relative">
      {!isMobile && (
        <div>
          <Button
            onClick={toggleSidebar}
            className={`p-2 rounded-md text-black ${
              isSidebarOpen ? "bg-black" : "bg-transparent"
            } transition-colors duration-300 hover:bg-gray-500 focus:outline-none fixed top-1 left-2 sm:left-2 z-50`}
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
          {filteredIcons.map((item, index) => {
            const isActive = currentPath === item.href;

            return (
              <Link
                href={item.href}
                key={index}
                className={`flex items-center p-3 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md ${
                  isActive ? "bg-blue-400" : ""
                }`}
                onClick={() => handleIconClick(item.label)}
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
                {item.label === "Pengaduan" && 
                  (role === "ADMIN" || role === "SUPER ADMIN") && 
                  newPengaduanCount > 0 && 
                  badgeVisible && (
                    <div className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {newPengaduanCount}
                    </div>
                  )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}