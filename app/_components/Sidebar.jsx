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
  faCheckCircle,
  faCog,
  faBars,
  faTimes,
  faSitemap,
  faImage,
  faExclamationCircle,
  faFileInvoiceDollar,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlobalApi from "@/app/_utils/GlobalApi";

const icons = [
  // Menu lainnya
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
    icon: faSyncAlt,
    label: "Pensiun",
    href: "/pensiun",
    color: "text-rose-500",
  },
  {
    icon: faSitemap,
    label: "Data Ranting",
    href: "/ranting",
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
    icon: faFileInvoiceDollar,
    label: "Transaksi Bank",
    href: "/transaksi-bank",
    color: "text-blue-600",
  },
  {
    icon: faWallet,
    label: "Keuangan",
    href: "/keuangan/home",
    color: "text-lime-500",
  },
  {
    icon: faFileInvoiceDollar,
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
    icon: faCalendarDays,
    label: "Rekap Event",
    href: "/event/data-event",
    color: "text-emerald-600",
  },
  {
    icon: faExclamationCircle,
    label: "Pengaduan",
    href: "/pengaduan",
    color: "text-red-700",
  },
  {
    icon: faCog,
    label: "AI Knowledge",
    href: "/pengaturan/ai-knowledge",
    color: "text-emerald-600",
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
    if (role === "ADMIN" || role === "SUPERADMIN") {
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
        "Tagihan",
      ].includes(item.label);
    } else if (role === "PANITIA") {
      return item.label === "Rekap Event";
    } else if (role === "SUPERADMIN") {
      return true;
    } else {
      return item.label !== "Galeri" && item.label !== "AI Knowledge";
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
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/15 transition-colors focus:outline-none fixed top-2 left-3 sm:left-4 z-50 cursor-pointer"
            aria-label={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            <FontAwesomeIcon
              icon={isSidebarOpen ? faTimes : faBars}
              size="lg"
              className="text-white drop-shadow-sm"
            />
          </button>
        </div>
      )}

      <div
        className={`fixed top-0 left-0 w-64 min-h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/80 p-4 flex flex-col space-y-2 shadow-2xl mt-14 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden z-40`}
      >
        <div className="px-2 py-1 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigasi Menu
          </span>
          {role && (
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {role}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          {filteredIcons.map((item, index) => {
            const isActive = currentPath === item.href;

            return (
              <Link
                href={item.href}
                key={index}
                className={`flex items-center px-3 py-2.5 space-x-3 transition-colors duration-150 rounded-xl group ${
                  isActive
                    ? "bg-teal-50 text-teal-800 font-bold border-l-4 border-teal-600 shadow-2xs"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
                onClick={() => handleIconClick(item.label)}
              >
                <div className="w-6 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`${
                      isActive ? "text-teal-700" : item.color
                    } text-base transition-transform group-hover:scale-110`}
                  />
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    isActive ? "text-teal-900" : "text-slate-700 group-hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </span>
                {item.label === "Pengaduan" &&
                  (role === "ADMIN" || role === "SUPERADMIN") &&
                  newPengaduanCount > 0 &&
                  badgeVisible && (
                    <div className="ml-auto bg-rose-600 text-white font-bold rounded-full px-2 py-0.5 text-[10px] shadow-2xs">
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
