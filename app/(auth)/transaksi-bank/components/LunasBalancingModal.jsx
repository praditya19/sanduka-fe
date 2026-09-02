import React, { useState } from "react";
import { FaCheckCircle, FaTimes, FaCalendarAlt, FaUserCheck, FaInfoCircle } from "react-icons/fa";

const LunasBalancingModal = ({
  isOpen,
  onClose,
  item,
  monthName,
  year,
  posLainLainName,
  onConfirm,
  formatRupiah,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(item);
      onClose();
    } catch (error) {
      // Handled by caller
    } finally {
      setLoading(false);
    }
  };

  const periode = monthName && year ? `${monthName} ${year}` : item.tagihanUntukBulan || "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden transform transition-all duration-200 scale-100">
        {/* Header with Icon */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 px-6 pt-6 pb-5 text-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
              <FaCheckCircle className="w-7 h-7 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Konfirmasi Pelunasan</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-100 mt-0.5">
                <FaCalendarAlt className="w-3.5 h-3.5" />
                <span>Periode: {periode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Member Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                <FaUserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-base truncate">{item.nama}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.cabang} • {item.unitKerja}
                </p>
                {item.rekening && item.rekening !== "-" && (
                  <p className="text-xs font-mono text-slate-600 mt-1">
                    No. Rek: <span className="font-semibold">{item.rekening}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Total Tagihan Iuran
            </span>
            <div className="text-2xl font-extrabold text-emerald-900 font-mono mt-1">
              {formatRupiah ? formatRupiah(item.totalIuran) : `Rp ${Number(item.totalIuran || 0).toLocaleString("id-ID")}`}
            </div>
            
            {/* Pos Iuran Mini Pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t border-emerald-200/60">
              {Number(item.totalIuranAnggota || 0) > 0 && (
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  PGRI: {formatRupiah ? formatRupiah(item.totalIuranAnggota) : item.totalIuranAnggota}
                </span>
              )}
              {Number(item.totalIuranSanduka || 0) > 0 && (
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  Sanduka: {formatRupiah ? formatRupiah(item.totalIuranSanduka) : item.totalIuranSanduka}
                </span>
              )}
              {Number(item.totalIuranDaspen || 0) > 0 && (
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  Daspen: {formatRupiah ? formatRupiah(item.totalIuranDaspen) : item.totalIuranDaspen}
                </span>
              )}
              {Number(item.totalIuranDerap || 0) > 0 && (
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  Derap: {formatRupiah ? formatRupiah(item.totalIuranDerap) : item.totalIuranDerap}
                </span>
              )}
              {Number(item.totalIuranKalender || 0) > 0 && (
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  Kalender: {formatRupiah ? formatRupiah(item.totalIuranKalender) : item.totalIuranKalender}
                </span>
              )}
              {Number(item.totalIuranSumbangan || 0) > 0 && (
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  Lain-Lain{posLainLainName ? ` (${posLainLainName})` : ""}: {formatRupiah ? formatRupiah(item.totalIuranSumbangan) : item.totalIuranSumbangan}
                </span>
              )}
            </div>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
            <FaInfoCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Aksi ini akan mencatat status iuran anggota sebagai <strong className="font-semibold text-blue-950">LUNAS</strong> untuk periode ini.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  <span>Tandai LUNAS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunasBalancingModal;
