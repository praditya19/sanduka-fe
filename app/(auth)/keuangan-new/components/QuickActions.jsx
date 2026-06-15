"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaFileInvoiceDollar,
  FaPrint,
  FaChartLine,
  FaBook,
  FaUniversity,
  FaTags
} from "react-icons/fa";
import Link from "next/link";

const QuickActions = () => {
  const actions = [
    {
      title: "Input Iuran",
      subtitle: "Update besaran & target",
      icon: <FaPlus />,
      color: "bg-emerald-500",
      href: "/keuangan-new/input",
    },
    {
      title: "Kas Sanduka",
      subtitle: "Buku Kas Sanduka",
      icon: <FaBook />,
      color: "bg-emerald-500",
      href: "/keuangan-new/sanduka",
    },
    {
      title: "Kas Organisasi",
      subtitle: "Buku Kas Umum",
      icon: <FaUniversity />,
      color: "bg-blue-500",
      href: "/keuangan-new/organisasi",
    },
    {
      title: "Tagihan",
      subtitle: "Input Keuangan Cabang",
      icon: <FaTags />,
      color: "bg-violet-500",
      href: "/keuangan-new/tagihan",
    },
    {
      title: "Laporan Keuangan Sanduka",
      subtitle: "Cetak & Export PDF",
      icon: <FaPrint />,
      color: "bg-purple-500",
      href: "/keuangan-new/laporan",
    },
    {
      title: "Laporan Keuangan Organisasi",
      subtitle: "Laporan keuangan organisasi",
      icon: <FaFileInvoiceDollar />,
      color: "bg-indigo-500",
      href: "/keuangan-new/laporan-organisasi",
    },
    {
      title: "Analisis Tren",
      subtitle: "Statistik mendalam",
      icon: <FaChartLine />,
      color: "bg-orange-500",
      href: "/statistik",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight uppercase text-xs">Akses Cepat</h2>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {actions.map((action, index) => (
          <Link href={action.href} key={index}>
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group transition-all hover:shadow-xl hover:border-slate-200 h-full"
            >
              <div className={`p-4 ${action.color} text-white rounded-2xl mb-3 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-xs">{action.title}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{action.subtitle}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
