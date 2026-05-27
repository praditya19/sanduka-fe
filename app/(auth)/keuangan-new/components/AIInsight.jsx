"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaRobot, FaLightbulb, FaInfoCircle } from "react-icons/fa";

const AIInsight = ({ insights, loading }) => {
  const defaultInsights = [
    "Pemasukan dari Iuran Sanduka bulan ini stabil di angka 95%.",
    "Ada 12 anggota baru yang bergabung di cabang Jepara Kota.",
    "Rekomendasi: Lakukan rekonsiliasi untuk dana Organisasi sebelum tanggal 20.",
  ];

  const currentInsights = insights || defaultInsights;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 mb-8"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
          <FaRobot className="text-white text-3xl animate-bounce" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sanduka AI Analyst</h2>
          <p className="text-emerald-600 text-sm font-medium">Asisten keuangan cerdas Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? 
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
          ))
         : 
          currentInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-start space-x-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-default"
            >
              <FaLightbulb className="text-emerald-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">
                {insight}
              </p>
            </motion.div>
          ))
        }
      </div>

      <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <FaInfoCircle />
          <span>Insight dihasilkan secara otomatis berdasarkan data terbaru.</span>
        </div>
        <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          Tanya Lebih Lanjut →
        </button>
      </div>
    </motion.div>
  );
};

export default AIInsight;
