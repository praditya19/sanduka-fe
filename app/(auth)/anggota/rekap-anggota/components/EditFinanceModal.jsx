import React from "react";
import Image from "next/image";
import { FiTrash, FiPlus, FiSave } from "react-icons/fi";

const EditFinanceModal = ({
  isPopupVisible,
  closePopup,
  dataNpa,
  fotoBase64,
  profileImageUrl,
  nomorRekening,
  setNomorRekening,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  groupedIuran,
  resetKeys,
  setResetKeys,
  nominalBaruList,
  setNominalBaruList,
  sumbanganList,
  handleDeleteSumbangan,
  addedCategories,
  setAddedCategories,
  manualInputs,
  setManualInputs,
  newValues,
  setNewValues,
  grandTotal,
  showDropdown,
  setShowDropdown,
  selectedKategori,
  setSelectedKategori,
  selectedKeterangan,
  setSelectedKeterangan,
  keteranganLainLain,
  notifDaspen,
  handleSave,
  handleUpdateClick,
  loadButton,
}) => {
  if (!isPopupVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-4 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 animate-in zoom-in-95 duration-300">

        {/* Refined Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <FiSave className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Update Iuran Anggota
              </h2>
              <p className="text-teal-50 text-[10px] font-medium opacity-80">
                Lengkapi rincian pembayaran di bawah ini
              </p>
            </div>
          </div>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
            onClick={closePopup}
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/20">

          {/* Balanced Member Section */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-teal-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              {/* Profile Photo */}
              <div className="relative w-24 h-32 md:w-28 md:h-36 rounded-xl overflow-hidden border-2 border-white shadow-md">
                <Image
                  src={
                    fotoBase64
                      ? fotoBase64.startsWith("blob:")
                        ? fotoBase64
                        : `data:image/jpeg;base64,${fotoBase64}`
                      : profileImageUrl
                  }
                  fill
                  alt="Foto Anggota"
                  className="object-cover"
                  unoptimized={true}
                />
              </div>

              {/* Identity Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                    {dataNpa?.namaLengkap || dataNpa?.nama_lengkap || "Nama Anggota"}
                  </h3>
                  <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mt-1">
                    {dataNpa?.cabang || "Cabang"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NPA PGRI</p>
                    <p className="text-slate-700 font-bold text-sm">{dataNpa?.npaPgri || dataNpa?.npa || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Kerja</p>
                    <p className="text-slate-700 font-bold text-sm">{dataNpa?.unitKerja || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                placeholder="Masukkan No. Rekening"
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
                className="w-full bg-slate-50 border border-transparent px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white text-base font-bold text-slate-700 transition-all"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-teal-50 shadow-sm flex flex-col justify-center">
              <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1.5 ml-1">
                Periode Tagihan
              </label>
              <div className="flex items-center space-x-2 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-base font-black text-slate-700 tracking-tight">
                  Tagihan untuk bulan <span className="text-teal-600">
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][selectedMonth - 1]} {selectedYear}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rincian Iuran</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            {groupedIuran
              .filter((item) => {
                // Jangan tampilkan jika sudah di-klik hapus (trash icon) di sesi ini
                if (resetKeys.includes(item.key)) return false;
                
                // Selalu tampilkan PGRI & Sanduka (Mandatory)
                if (["pgri", "sanduka"].includes(item.key)) return true;
                
                // Hitung total nilai (Awal + Penyesuaian)
                const awalnya = parseInt(item.defaultJumlah ?? item.iuran ?? 0);
                const totalVal = awalnya + (nominalBaruList[item.key] || 0);

                // Selalu tampilkan jika baru saja ditambahkan lewat tombol "Tambah Kategori" 
                // agar user bisa mengisi nominalnya (meskipun masih 0)
                const isAdded = addedCategories.some((c) => c.key === item.key);
                if (isAdded) return true;

                // Untuk kategori lain (Data lama dari DB), hanya tampilkan jika nilainya > 0
                return totalVal > 0;
              })
              .map((item, idx) => {
                const isReset = resetKeys.includes(item.key);
                const oldValue = isReset ? 0 : (newValues[item.key] ?? parseInt(item.defaultJumlah ?? item.iuran ?? 0));
                const inputValue = isReset ? 0 : nominalBaruList[item.key] || 0;
                const totalValue = oldValue + inputValue;

                return (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-black text-xs">
                          {idx + 1}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">
                          {item.label || item.key.toUpperCase()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResetKeys((prev) => [...prev, item.key]);
                          setNominalBaruList((prev) => ({ ...prev, [item.key]: 0 }));
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Awal</p>
                        <div className="bg-slate-50 px-4 py-2.5 rounded-xl text-slate-500 font-bold text-sm">
                          Rp {oldValue.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest ml-1">Penyesuaian</p>
                        <input
                          type="text"
                          placeholder="Rp 0"
                          value={inputValue === 0 ? "" : `Rp ${inputValue.toLocaleString("id-ID")}`}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/[^\d]/g, "")) || 0;
                            setNominalBaruList((prev) => ({ ...prev, [item.key]: val }));
                          }}
                          className="w-full bg-white border border-teal-100 px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 font-bold text-teal-700 text-sm transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-1">Total</p>
                        <div className="bg-teal-600 px-4 py-2.5 rounded-xl text-white font-black text-sm">
                          Rp {totalValue.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            <div className="pt-6 text-center">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-all group"
              >
                <FiPlus size={18} />
                <span className="font-bold text-xs uppercase tracking-widest">Tambah Kategori</span>
              </button>

              {showDropdown && (
                <div className="mt-4 p-6 bg-white rounded-2xl border border-teal-50 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-w-lg mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                      <select
                        className="w-full bg-slate-50 border border-transparent px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-bold text-slate-700 text-sm"
                        value={selectedKategori}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                      >
                        <option value="">-- Pilih --</option>
                        <option value="pgri">PGRI</option>
                        <option value="sanduka">Sanduka</option>
                        <option value="daspen">
                          Daspen {notifDaspen ? "(Sinkronisasi ✓)" : "(Belum Sinkronisasi ✕)"}
                        </option>
                        <option value="kalender">Kalender</option>
                        <option value="derap">Derap</option>
                        <option value="lainlain">Lain-Lain</option>
                      </select>
                    </div>

                    {selectedKategori === "lainlain" && (
                      <div className="space-y-1 animate-in slide-in-from-top-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
                        <select
                          className="w-full bg-slate-50 border border-transparent px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-bold text-slate-700 text-sm"
                          value={selectedKeterangan}
                          onChange={(e) => setSelectedKeterangan(e.target.value)}
                        >
                          <option value="">-- Pilih --</option>
                          {Array.isArray(keteranganLainLain) && keteranganLainLain.map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                          ))}
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {selectedKategori && (
                    <div className="flex justify-center space-x-3 mt-6 pt-4 border-t border-slate-50">
                      <button onClick={() => setShowDropdown(false)} className="px-6 py-2 text-slate-400 font-bold uppercase text-[10px]">Batal</button>
                      <button
                        onClick={handleSave}
                        className="bg-slate-800 text-white px-8 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all active:scale-95"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Balanced Action Footer */}
        <div className="p-5 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">TOTAL TAGIHAN</p>
              <div className="flex items-baseline space-x-2 justify-center md:justify-start">
                <span className="text-teal-500 text-sm font-bold">Rp</span>
                <span className="text-slate-800 text-3xl font-black tracking-tighter">
                  {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              className="flex-1 md:flex-none bg-white text-slate-400 font-bold py-3 px-8 rounded-xl uppercase text-[10px] tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
              onClick={closePopup}
            >
              Kembali
            </button>
            <button
              type="button"
              className={`flex-1 md:flex-none flex items-center justify-center bg-teal-600 text-white font-black py-3 px-10 rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-teal-100 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${loadButton ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={async () => { if (!loadButton) await handleUpdateClick(); }}
              disabled={loadButton}
            >
              {loadButton ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <span className="flex items-center">
                  <FiSave className="mr-2" size={16} /> Simpan Data
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFinanceModal;
