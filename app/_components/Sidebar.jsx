import React from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";

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

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-white p-4 flex flex-col space-y-2 shadow-lg mt-12">
    {icons.map((item, index) => (
      <a
        key={index}
        href={item.href}
        className="flex items-center p-3 space-x-3 transition duration-300 ease-in-out transform hover:bg-blue-500 rounded-lg hover:shadow-md"
      >
        <FontAwesomeIcon
          icon={item.icon}
          size="lg"
          className={`${item.color} w-6`}
        />
        <span className="text-sm md:text-base font-medium text-gray-700 hover:text-white">
          {item.label}
        </span>
      </a>
    ))}
  </div>
  );
}
