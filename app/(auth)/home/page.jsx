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
  faBuilding, // Icon for "Unit Kerja"
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faUbuntu } from "@fortawesome/free-brands-svg-icons";

const icons = [
  { icon: faBullhorn, label: "Lapor", href: "/lapor", color: "text-red-500" },
  {
    icon: faFileAlt,
    label: "Statistik",
    href: "/statistik",
    color: "text-blue-500",
  },
  {
    icon: faDatabase,
    label: "History data",
    href: "/history-data",
    color: "text-green-500",
  },
  {
    icon: faHandsHelping,
    label: "Bantuan",
    href: "/bantuan",
    color: "text-purple-500",
  },
  {
    icon: faFileInvoice,
    label: "Rekap Meninggal",
    href: "/rekap-meninggal",
    color: "text-pink-500",
  },
  {
    icon: faUsers,
    label: "Data Anggota",
    href: "/anggota/data-anggota",
    color: "text-orange-500",
  },
  {
    icon: faClipboardCheck,
    label: "Ketentuan",
    href: "/ketentuan",
    color: "text-teal-500",
  },
  {
    icon: faUserGraduate,
    label: "Status Anggota",
    href: "/anggota/status-anggota",
    color: "text-indigo-500",
  },
  {
    icon: faUbuntu,
    label: "Rekap Anggota",
    href: "/anggota/rekap-anggota",
    color: "text-gray-500",
  },
  {
    icon: faWallet,
    label: "Keuangan",
    href: "/keuangan/home",
    color: "text-lime-500",
  },
  {
    icon: faSyncAlt,
    label: "Pensiun",
    href: "/pensiun",
    color: "text-rose-500",
  },
  {
    icon: faCheckCircle,
    label: "Verifikasi Anggota Baru",
    href: "/verifikasi-anggota-mutasi",
    color: "text-blue-500",
  },
  {
    icon: faUsersGear,
    label: "Anggota by Name",
    href: "/anggota/by-name",
    color: "text-yellow-500",
  },
  {
    icon: faCog,
    label: "Pengaturan",
    href: "/pengaturan",
    color: "text-gray-700",
  },
  {
    icon: faSyncAlt,
    label: "Singkron Data",
    href: "/singkron-data",
    color: "text-teal-700",
  },
  {
    icon: faUsers,
    label: "Teman dalam Unit Kerja",
    href: "/teman-unit-kerja",
    color: "text-green-700",
  },
];

export default function IconGrid() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faBullhorn}
              size="2x"
              className="text-red-500"
            />
            <p className="text-2xl font-bold text-gray-700">
              Laporan Meninggal Bulan Ini
            </p>
            <p className="text-gray-600 font-bold">0 Orang</p>
          </div>
          <div className="text-center">
            <FontAwesomeIcon
              icon={faUser}
              size="2x"
              className="text-orange-500"
            />
            <p className="text-2xl font-bold text-gray-700">
              Sanduka Telah Diberikan
            </p>
            <p className="text-gray-600 font-bold">173 Orang</p>
          </div>
          <div className="text-center">
            <FontAwesomeIcon
              icon={faMoneyBill}
              size="2x"
              className="text-green-500"
            />
            <p className="text-2xl font-bold text-gray-700">
              Total Santunan Diberikan
            </p>
            <p className="text-gray-600 font-bold">Rp.432.500.000</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8 max-w-screen-lg mx-auto">
        {icons.map((item, index) => (
          <Link key={index} href={item.href}>
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl cursor-pointer h-40">
              <FontAwesomeIcon
                icon={item.icon}
                size="3x"
                className={`mb-4 ${item.color}`}
              />
              <span className="text-lg font-semibold text-gray-700">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
