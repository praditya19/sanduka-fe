"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  FaWallet, 
  FaArrowUp, 
  FaArrowDown, 
  FaMoneyBillWave 
} from "react-icons/fa";

const SummaryCards = ({ saldo, pemasukan, pengeluaran, loading, type }) => {
  const formatCurrency = (amount) => {
    const numericValue = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const isSanduka = type === "sanduka";

  const cards = [
    {
      title: `Total Saldo ${isSanduka ? 'Sanduka' : 'Organisasi'}`,
      value: saldo,
      icon: isSanduka ? <FaWallet className="text-white text-2xl" /> : <FaMoneyBillWave className="text-white text-2xl" />,
      gradient: isSanduka ? "from-emerald-500 to-teal-600" : "from-blue-600 to-indigo-700",
    },
    {
      title: "Total Pemasukan",
      value: pemasukan,
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      gradient: isSanduka ? "from-blue-500 to-indigo-600" : "from-cyan-500 to-blue-600",
    },
    {
      title: "Total Pengeluaran",
      value: pengeluaran,
      icon: <FaArrowDown className="text-white text-2xl" />,
      gradient: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={`${type}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`relative overflow-hidden rounded-3xl p-6 shadow-xl bg-gradient-to-br ${card.gradient}`}
        >
          {/* Decorative background circle */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
          
          <div className="flex justify-between items-start h-full min-h-[80px]">
            <div>
              <p className="text-white/80 text-[10px] font-bold mb-1 uppercase tracking-widest">
                {card.title}
              </p>
              <h3 className="text-white text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-32 bg-white/20 animate-pulse rounded-lg" />
                ) : (
                  formatCurrency(card.value)
                )}
              </h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              {card.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
