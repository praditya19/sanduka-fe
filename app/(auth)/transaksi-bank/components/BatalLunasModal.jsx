import React, { useState } from "react";
import { FaUndo, FaTimes, FaCalendarAlt, FaUserTimes, FaExclamationTriangle } from "react-icons/fa";

const BatalLunasModal = ({
  isOpen,
  onClose,
  item,
  monthName,
  year,
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
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 px-6 pt-6 pb-5 text-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
              <FaUndo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Batalkan Status Lunas</h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-100 mt-0.5">
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
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                <FaUserTimes className="w-5 h-5" />
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
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Total Iuran
            </span>
            <div className="text-2xl font-extrabold text-amber-900 font-mono mt-1">
              {formatRupiah ? formatRupiah(item.totalIuran) : `Rp ${Number(item.totalIuran || 0).toLocaleString("id-ID")}`}
            </div>
          </div>

          {/* Warning Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs leading-relaxed">
            <FaExclamationTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Aksi ini akan <strong>membatalkan status LUNAS</strong> dan mengembalikan status iuran anggota menjadi <strong className="font-semibold text-amber-950">Tunai</strong> (belum lunas).
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
              className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-md shadow-amber-600/20 transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FaUndo className="w-3.5 h-3.5" />
                  <span>Ya, Kembalikan ke Tunai</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatalLunasModal;
