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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative space-y-6 overflow-y-auto max-h-screen">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          onClick={closePopup}
        >
          ✕
        </button>
        <h2 className="text-center text-2xl font-bold text-white bg-[#B91C1C] py-3 rounded-lg shadow-sm uppercase tracking-wide">
          Form Keuangan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-white p-2 rounded-lg">
          {/* Left: Photo */}
          <div className="md:col-span-2 flex justify-center">
            <div className="relative w-28 h-36 rounded-xl overflow-hidden shadow-md border-2 border-gray-100">
              <Image
                src={
                  fotoBase64
                    ? fotoBase64.startsWith("blob:")
                      ? fotoBase64
                      : `data:image/jpeg;base64,${fotoBase64}`
                    : profileImageUrl
                }
                fill
                alt="Foto User"
                className="object-cover"
                unoptimized={true}
              />
            </div>
          </div>

          {/* Middle: Core Info */}
          <div className="md:col-span-6 space-y-2">
            {dataNpa ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
                  {dataNpa.namaLengkap || dataNpa.nama_lengkap || "-"}
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="w-48 inline-block">
                      Tempat, Tanggal Lahir
                    </span>
                    :
                    <span className="font-medium text-gray-900 uppercase">
                      {dataNpa.tempatLahir ||
                        dataNpa.tempat_lahir ||
                        dataNpa.user?.tempatLahir ||
                        dataNpa.pendaftaran?.tempatLahir ||
                        "-"}
                      ,{" "}
                      {(() => {
                        const tgl =
                          dataNpa.tanggalLahir ||
                          dataNpa.tanggal_lahir ||
                          dataNpa.user?.tanggalLahir ||
                          dataNpa.pendaftaran?.tanggalLahir;
                        if (Array.isArray(tgl)) {
                          return `${tgl[2] || tgl[0] || "-"}-${tgl[1] || "-"}-${tgl[0] || tgl[2] || "-"}`;
                        }
                        if (typeof tgl === "string") {
                          const d = new Date(tgl);
                          if (!isNaN(d.getTime())) {
                            return d
                              .toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                              .replace(/\//g, "-");
                          }
                          return tgl;
                        }
                        return "-";
                      })()}
                    </span>
                  </p>
                  <p>
                    <span className="w-48 inline-block">
                      Nomor Anggota PGRI
                    </span>
                    :{" "}
                    <span className="font-medium text-gray-900">
                      {dataNpa.npaPgri ||
                        dataNpa.npa_pgri ||
                        dataNpa.npa ||
                        dataNpa.user?.npaPgri ||
                        "-"}
                    </span>
                  </p>
                  <p>
                    <span className="w-48 inline-block">
                      Nomor Induk Pegawai
                    </span>
                    :{" "}
                    <span className="font-medium text-gray-900">
                      {dataNpa.nip ||
                        dataNpa.user?.nip ||
                        dataNpa.pendaftaran?.nip ||
                        "-"}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                <span>Memuat data anggota...</span>
              </div>
            )}
          </div>

          {/* Right: Work Info */}
          <div className="md:col-span-4 space-y-1 text-sm text-gray-700 md:border-l md:pl-6 border-gray-100">
            {dataNpa && (
              <>
                <p className="font-bold text-gray-900 uppercase">
                  {dataNpa.cabang || dataNpa.user?.cabang || "-"},{" "}
                </p>
                <p className="font-medium">
                  {dataNpa.jabatan || dataNpa.user?.jabatan || "Lain-Lain"}
                </p>
                <p className="text-gray-600">
                  {dataNpa.unitKerja ||
                    dataNpa.user?.unitKerja ||
                    dataNpa.unit_kerja ||
                    "-"}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="gap-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Rekening
            </label>
            <input
              type="text"
              placeholder="Masukkan Nomor Rekening"
              value={nomorRekening}
              onChange={(e) => setNomorRekening(e.target.value)}
              className="w-full border border-black px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tagihan Untuk Bulan
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Bulan
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {[
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ].map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Tahun
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i - 5;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Dipilih
                </label>
                <div className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-sm font-medium">
                  {selectedMonth.toString().padStart(2, "0")}-{selectedYear}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {groupedIuran
              .filter((item) => {
                if (item.isSumbanganDetail) return false;
                const isReset = resetKeys.includes(item.key);
                // Jika sedang klik 'Hapus' di sesi ini, sembunyikan sementara
                if (isReset) return false;

                // Selalu tampilkan kategori inti (PGRI & SANDUKA) meskipun nilainya 0
                const alwaysShow = ["pgri", "sanduka"];
                if (alwaysShow.includes(item.key)) return true;

                // Tampilkan DASPEN, DERAP, KALENDER jika nilainya > 0
                // ATAU jika user baru saja menambahkannya (ada di addedCategories)
                const coreKeys = ["daspen", "derap", "kalender"];
                const isAdded = addedCategories.some((c) => c.key === item.key);

                const totalVal =
                  parseInt(item.iuran || 0) + (nominalBaruList[item.key] || 0);
                return totalVal > 0 || isAdded;
              })
              .map((item, idx) => {
                const isReset = resetKeys.includes(item.key);
                // PRIORITAS: Gunakan newValues (hasil fetch/session) jika ada, jika tidak gunakan data DB
                const oldValue = isReset
                  ? 0
                  : (newValues[item.key] ?? parseInt(item.iuran || 0));
                const inputValue = isReset ? 0 : nominalBaruList[item.key] || 0;
                const totalValue = oldValue + inputValue;

                return (
                  <div
                    key={idx}
                    className="space-y-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                        {item.key}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        onClick={() => {
                          setResetKeys((prev) => [...prev, item.key]);
                          setNominalBaruList((prev) => ({
                            ...prev,
                            [item.key]: 0,
                          }));
                        }}
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Default
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`Rp. ${oldValue.toLocaleString("id-ID")}`}
                          className="w-full border border-gray-300 px-3 py-2 rounded text-center bg-gray-50 text-gray-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Tambahan Cabang
                        </label>
                        <input
                          type="text"
                          placeholder="Rp. 0"
                          value={
                            inputValue === 0
                              ? ""
                              : `Rp. ${inputValue.toLocaleString("id-ID")}`
                          }
                          onChange={(e) => {
                            const angka =
                              parseInt(e.target.value.replace(/[^\d]/g, "")) ||
                              0;
                            setNominalBaruList((prev) => ({
                              ...prev,
                              [item.key]: angka,
                            }));
                          }}
                          className="w-full border border-blue-300 px-3 py-2 rounded text-center bg-white text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Total
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`Rp. ${totalValue.toLocaleString("id-ID")}`}
                          className="w-full border border-green-300 px-3 py-2 rounded text-center bg-green-50 text-green-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

            {sumbanganList.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-purple-700 mb-2">
                  Keuangan:
                </h4>
                {sumbanganList
                  .filter((s) => parseInt(s.jumlah || 0) > 0)
                  .map((sumbangan, index) => {
                  const jumlahValue = parseInt(sumbangan.jumlah || 0);
                  const isDeleted = jumlahValue === 0;
                  return (
                    <div
                      key={index}
                      className="space-y-1 px-3 py-2 rounded-md border-l-4 mb-2 bg-purple-50 border-purple-400"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-medium text-purple-800"
                        >
                          {sumbangan.namaSumbangan || sumbangan.keterangan || sumbangan.jenis}{" "}
                          {isDeleted && (
                            <span className="text-red-500 ml-2 text-sm">
                              (Dihapus)
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          className={`p-1 rounded-full transition-colors ${isDeleted ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700 hover:bg-red-50"}`}
                          onClick={() =>
                            !isDeleted && handleDeleteSumbangan(sumbangan.jenis)
                          }
                          disabled={isDeleted}
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Nilai Sumbangan
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={`Rp. ${jumlahValue.toLocaleString("id-ID")}`}
                            className={`w-full border px-2 py-1 rounded text-center font-medium ${isDeleted ? "bg-gray-200 text-gray-500" : "bg-purple-100 text-purple-700"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Tambahan Cabang
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={isDeleted ? "Dihapus" : "Tidak bisa diubah"}
                            className="w-full border px-2 py-1 rounded text-center bg-gray-200 text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Total
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={`Rp. ${jumlahValue.toLocaleString("id-ID")}`}
                            className={`w-full border px-2 py-1 rounded text-center font-medium ${isDeleted ? "bg-gray-200 text-gray-500" : "bg-purple-100 text-purple-700"}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Menampilkan kategori tambahan selain kategori inti */}
            {addedCategories
              .filter(
                (cat) =>
                  !["pgri", "sanduka", "daspen", "derap", "kalender"].includes(
                    cat.key,
                  ),
              )
              .map((item, idx) => {
                const oldValue = newValues[item.key] ?? 0;
                const inputValue = manualInputs[item.key] ?? 0;
                const totalValue = oldValue + inputValue;
                // Pastikan label tampil dengan benar
                const displayName = item.keterangan || item.label || item.key;
                return (
                  <div
                    key={`added-${idx}`}
                    className="space-y-2 p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 hover:border-yellow-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-yellow-800">
                        {displayName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedCategories = addedCategories.filter(
                            (_, i) => i !== idx,
                          );
                          setAddedCategories(updatedCategories);
                          setManualInputs((prev) => {
                            const n = { ...prev };
                            delete n[item.key];
                            return n;
                          });
                          setNewValues((prev) => {
                            const n = { ...prev };
                            delete n[item.key];
                            return n;
                          });
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-yellow-600 mb-1">
                          Default
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`Rp. ${oldValue.toLocaleString("id-ID")}`}
                          className="w-full border border-yellow-300 px-3 py-2 rounded text-center bg-yellow-100 text-yellow-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-yellow-600 mb-1">
                          Tambahan
                        </label>
                        <input
                          type="text"
                          placeholder="Rp. 0"
                          value={
                            inputValue === 0
                              ? ""
                              : `Rp. ${inputValue.toLocaleString("id-ID")}`
                          }
                          onChange={(e) => {
                            const angka =
                              parseInt(e.target.value.replace(/[^\d]/g, "")) ||
                              0;
                            setManualInputs((prev) => ({
                              ...prev,
                              [item.key]: angka,
                            }));
                          }}
                          className="w-full border border-yellow-300 px-3 py-2 rounded text-center bg-white text-yellow-700 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-yellow-600 mb-1">
                          Total
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`Rp. ${totalValue.toLocaleString("id-ID")}`}
                          className="w-full border border-yellow-300 px-3 py-2 rounded text-center bg-yellow-100 text-yellow-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

            <div className="flex items-center justify-between bg-purple-200 px-3 py-2 rounded-md font-bold mt-4">
              <span>Total</span>
              <span>Rp. {grandTotal.toLocaleString("id-ID")}</span>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-300 p-4 mt-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <span className="bg-purple-600 text-white p-2 rounded-full mr-3">
                  <FiPlus size={18} />
                </span>
                Tambah Keuangan
              </h3>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors w-full"
              >
                <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                  <FiPlus size={16} />
                </span>
                <span className="font-medium">Tambah Kategori Baru</span>
              </button>

              {showDropdown && (
                <div className="space-y-4 bg-white p-4 rounded-lg border border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Kategori Tambahan
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedKategori}
                      onChange={(e) => setSelectedKategori(e.target.value)}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      <option value="pgri">PGRI</option>
                      <option value="sanduka">Sanduka</option>
                      <option value="daspen">
                        Daspen{" "}
                        {notifDaspen === true
                          ? " (✓ Sinkron)"
                          : " (× Tidak Sinkron)"}
                      </option>
                      <option value="kalender">Kalender</option>
                      <option value="derap">Derap</option>
                      <option value="lainlain">Lain-Lain</option>
                    </select>
                  </div>

                  {selectedKategori === "lainlain" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Keterangan
                      </label>
                      <select
                        id="keterangan-select"
                        className="w-full border p-2 rounded"
                        value={selectedKeterangan}
                        onChange={(e) => setSelectedKeterangan(e.target.value)}
                      >
                        <option value="">-- Pilih Keterangan --</option>
                        {Array.isArray(keteranganLainLain) &&
                          keteranganLainLain.map((item, index) => (
                            <option key={index} value={JSON.stringify(item)}>
                              {item.keterangan || item.nama_iuran || item}
                            </option>
                          ))}
                        <option value="manual">Lain-Lain (Manual)</option>
                      </select>
                    </div>
                  )}

                  {selectedKategori && (
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <FiSave className="mr-2" size={16} /> Simpan Kategori
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={closePopup}
          >
            Batal
          </button>
          <button
            type="button"
            className={`flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded ${loadButton ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}
            onClick={async () => {
              if (!loadButton) await handleUpdateClick();
            }}
            disabled={loadButton}
          >
            {loadButton ? "Loading..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFinanceModal;
