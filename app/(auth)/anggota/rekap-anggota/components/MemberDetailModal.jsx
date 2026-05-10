import React from "react";
import Image from "next/image";

const MemberDetailModal = ({
  isModalOpen,
  closeModal,
  selectedMember,
  dataIuran,
  fotoBase64,
  profileImageUrl
}) => {
  if (!isModalOpen || !selectedMember || !dataIuran) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">

        {/* Refined Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-lg font-bold text-white tracking-tight">Rincian Keuangan</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all active:scale-90"
            onClick={closeModal}
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/20">
          <div className="p-4 md:p-6 space-y-5">
            {/* Compact identity section */}
            <div className="bg-white rounded-xl p-5 border border-teal-50 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                <div className="relative w-24 h-32 md:w-28 md:h-36 rounded-xl overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={fotoBase64 ? `data:image/jpeg;base64,${fotoBase64}` : profileImageUrl}
                    fill
                    alt="Foto Member"
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                      {dataIuran.namaAnggota}
                    </h2>
                    <p className="text-teal-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                      {dataIuran.cabang}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NPA PGRI</p>
                      <p className="text-slate-700 font-bold text-sm tracking-wider">{dataIuran.npa || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UNIT KERJA</p>
                      <p className="text-slate-700 font-bold text-sm leading-tight">{dataIuran.unitKerja || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Grid */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Rincian Pembayaran</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Iuran Anggota", value: dataIuran.totalIuranAnggota },
                  { label: "Iuran Sanduka", value: dataIuran.totalIuranSanduka },
                  { label: "Iuran Daspen", value: dataIuran.totalIuranDaspen },
                  { label: "Tabungan Derap", value: dataIuran.totalIuranDerap },
                  { label: "Kalender", value: dataIuran.totalIuranKalender },
                  { label: "Lain-Lain", value: dataIuran.totalLainLain }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between group">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-teal-600 transition-colors">{item.label}</span>
                    <span className="text-base md:text-lg font-black text-slate-700">
                      <span className="text-teal-400 text-[10px] mr-1">Rp</span>
                      {(item.value || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grand Total */}
              <div className="mt-6 bg-gradient-to-br from-teal-600 to-emerald-500 p-6 rounded-2xl shadow-xl shadow-teal-50 flex flex-col items-center">
                <p className="text-teal-100 text-[9px] font-bold uppercase tracking-widest mb-1">Total Keseluruhan</p>
                <div className="flex items-center space-x-2 text-white">
                  <span className="text-lg font-bold opacity-80">Rp</span>
                  <span className="text-3xl font-black tracking-tighter">
                    {(dataIuran.totalIuran || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 mt-4">
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  No. Rekening: <span className="text-slate-600 font-mono ml-1">{dataIuran.nomorRekening || "-"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-50 flex justify-center">
          <button
            className="w-full max-w-xs bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
            onClick={closeModal}
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
