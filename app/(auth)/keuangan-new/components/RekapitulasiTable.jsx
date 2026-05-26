"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  FaPrint, 
  FaFileExcel, 
  FaInfoCircle, 
  FaArrowRight 
} from "react-icons/fa";

const RekapitulasiTable = ({ data, loading, onPrint, onExport }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const headers = [
    "No",
    "Cabang/Khusus",
    "Total Anggota",
    "Pusat (PB)",
    "Peruntukan Provinsi",
    "Peruntukan Kabupaten",
    "Peruntukan Cabang",
    "Tambahan Cabang",
    "Total Cabang",
    "Sanduka",
    "Total Tagihan",
    "Potongan Bank",
    "Setoran Tunai",
    "Selisih",
    "Action"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-[22px] bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
            <FaTable className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Rekapitulasi Iuran <span className="text-emerald-500">PGRI & Sanduka</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Laporan Rincian Alokasi Peruntukan Iuran Per Cabang</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onPrint}
            className="flex items-center gap-2.5 px-6 py-4 bg-white border border-slate-200 hover:border-slate-800 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
          >
            <FaPrint className="text-sm" />
            <span>Cetak PDF</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2.5 px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            <FaFileExcel className="text-sm" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className={`px-4 py-6 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50 whitespace-nowrap ${i === 0 || i > 1 ? 'text-center' : 'text-left'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {headers.map((_, j) => (
                    <td key={j} className="px-4 py-5">
                      <div className="h-2.5 bg-slate-50 rounded-full w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((item, index) => {
                const cabang = item[0] || item.cabang || "-";
                const totalAnggota = item[1] || item.totalAnggota || 0;
                const pb = item[2] || 0;
                const prov = item[3] || 0;
                const kab = item[4] || 0;
                const cab = item[5] || 0;
                const tambahan = item[6] || 0;
                const totalCabang = item[7] || (cab + tambahan);
                const sanduka = item[8] || 0;
                const totalTagihan = item[9] || (pb + prov + kab + totalCabang + sanduka);
                const potBank = item[10] || 0;
                const setorTunai = item[11] || 0;
                const selisih = item[12] || (totalTagihan - (potBank + setorTunai));

                return (
                  <tr key={index} className="hover:bg-slate-50/80 transition-all duration-300 group">
                    <td className="px-4 py-5 text-center text-[10px] font-black text-slate-300">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-5 text-[11px] font-black text-slate-800 whitespace-nowrap">
                      {cabang}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-[10px] text-[10px] font-black ring-1 ring-indigo-100">
                        {totalAnggota}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 italic">
                      {formatCurrency(pb)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 italic">
                      {formatCurrency(prov)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 italic">
                      {formatCurrency(kab)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 italic">
                      {formatCurrency(cab)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 italic">
                      {formatCurrency(tambahan)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-black text-emerald-600 bg-emerald-50/20">
                      {formatCurrency(totalCabang)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 italic">
                      {formatCurrency(sanduka)}
                    </td>
                    <td className="px-4 py-5 text-center text-[11px] font-black text-slate-900 bg-slate-100/30">
                      {formatCurrency(totalTagihan)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-black text-rose-500">
                      {formatCurrency(potBank)}
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-black text-blue-600">
                      {formatCurrency(setorTunai)}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-[10px] text-[10px] font-black shadow-sm ${
                        selisih > 0 ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-emerald-500 text-white shadow-emerald-100'
                      }`}>
                        {formatCurrency(selisih)}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <button className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-300">
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-32 text-center bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-[32px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                      <FaInfoCircle className="text-slate-200 text-3xl" />
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Data Tidak Ditemukan</p>
                    <p className="text-slate-300 text-[10px] mt-2 font-medium">Silakan pilih periode atau cabang lain.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.length > 0 && (
        <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Live Data Overview
            </p>
          </div>
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            Total Entri: <span className="text-emerald-500 ml-1">{data.length} Cabang</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RekapitulasiTable;
