"use client";
import React, { useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const UpdateByBulanModal = ({
  selectedItem,
  setSelectedItem,
  loadingUpdate,
  setLoadingUpdate,
  closeModal,
  setNotification,
  fetchAllData,
}) => {
  const handleChange = (field, value) => {
    setSelectedItem((prev) => ({ ...prev, [field]: value }));
  };

  // Hitung otomatis total jika input utama atau cabang berubah
  useEffect(() => {
    const fields = ["pgri", "sanduka", "daspen", "derap", "kalender"];
    fields.forEach((field) => {
      const utama = Number(selectedItem[field] || 0);
      const cabang = Number(selectedItem[`${field}Cabang`] || 0);
      const total = utama + cabang;
      setSelectedItem((prev) => ({
        ...prev,
        [`${field}Total`]: total,
      }));
    });
  }, [
    selectedItem.pgri,
    selectedItem.pgriCabang,
    selectedItem.sanduka,
    selectedItem.sandukaCabang,
    selectedItem.daspen,
    selectedItem.daspenCabang,
    selectedItem.derap,
    selectedItem.derapCabang,
    selectedItem.kalender,
    selectedItem.kalenderCabang,
  ]);

  const handleUpdate = async () => {
    try {
      setLoadingUpdate(true);
      const nip = selectedItem?.nip || "";
      const bulan = selectedItem?.tagihanUntukBulan || "";
      const payload = {
        namaAnggota: selectedItem.namaAnggota,
        nip: selectedItem.nip,
        nomorRekening: selectedItem.nomorRekening,
        cabang: selectedItem.cabang,
        unitKerja: selectedItem.unitKerja,

        // Simpan semua nilai utama, cabang, dan total
        pgri: Number(selectedItem.pgri),
        pgriCabang: Number(selectedItem.pgriCabang || 0),
        pgriTotal: Number(selectedItem.pgriTotal || 0),

        sanduka: Number(selectedItem.sanduka),
        sandukaCabang: Number(selectedItem.sandukaCabang || 0),
        sandukaTotal: Number(selectedItem.sandukaTotal || 0),

        daspen: Number(selectedItem.daspen),
        daspenCabang: Number(selectedItem.daspenCabang || 0),
        daspenTotal: Number(selectedItem.daspenTotal || 0),

        derap: Number(selectedItem.derap),
        derapCabang: Number(selectedItem.derapCabang || 0),
        derapTotal: Number(selectedItem.derapTotal || 0),

        kalender: Number(selectedItem.kalender),
        kalenderCabang: Number(selectedItem.kalenderCabang || 0),
        kalenderTotal: Number(selectedItem.kalenderTotal || 0),

        lainLain: Number(selectedItem.lainLain),
      };

      await GlobalApi.updateByNominalByBulan(nip, bulan, payload);
      setNotification({ type: "success", message: "Data berhasil diperbarui." });
      closeModal();
      await fetchAllData();
    } catch (error) {
      console.error("Gagal update:", error);
      setNotification({ type: "error", message: "Gagal memperbarui data." });
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
  <div className="bg-white p-8 rounded-2xl w-[560px] shadow-xl max-h-[90vh] overflow-y-auto">
    {/* Header dengan ikon dan informasi yang lebih terstruktur */}
    <div className="flex items-start mb-6">
      <div className="bg-teal-100 p-3 rounded-full mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-teal-700 mb-2">Update Data</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{selectedItem.namaAnggota}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span>{selectedItem.nip}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>{selectedItem.nomorRekening || "-"}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Form dengan layout yang lebih baik */}
    <div className="space-y-6">
      {/* Input Bulan dengan styling lebih menarik */}
      <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
        <label className="block text-sm font-medium text-teal-700 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Tagihan Untuk Bulan
        </label>
        <input
          type="date"
          className="border border-teal-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
          value={selectedItem.tagihanUntukBulan || ""}
          onChange={(e) => handleChange("tagihanUntukBulan", e.target.value)}
        />
      </div>

      {/* Grid untuk input bidang dengan card styling */}
      <div className="grid grid-cols-1 gap-4">
        {["pgri", "sanduka", "daspen", "derap", "kalender", "lainLain"].map(
          (field) => (
            <div key={field} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-teal-200 transition-colors duration-200">
              <label className="block text-sm font-medium text-gray-700 capitalize mb-3">
                {field === "pgri" ? "PGRI" : 
                 field === "sanduka" ? "Sanduka" : 
                 field === "daspen" ? "Daspen" : 
                 field === "derap" ? "Derap" : 
                 field === "kalender" ? "Kalender" : "Lain-lain"}
              </label>

              {field !== "lainLain" ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Utama</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg p-2 text-sm w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      placeholder="0"
                      value={selectedItem[field] || 0}
                      onChange={(e) =>
                        handleChange(field, Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cabang</label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg p-2 text-sm w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      placeholder="0"
                      value={selectedItem[`${field}Cabang`] || 0}
                      onChange={(e) =>
                        handleChange(`${field}Cabang`, Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    <input
                      type="number"
                      disabled
                      className="border border-gray-300 rounded-lg p-2 text-sm w-full bg-gray-100 font-medium text-gray-700"
                      placeholder="0"
                      value={selectedItem[`${field}Total`] || 0}
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Masukkan nilai lain-lain"
                  value={selectedItem[field] || 0}
                  onChange={(e) =>
                    handleChange(field, Number(e.target.value))
                  }
                />
              )}
            </div>
          )
        )}
      </div>
    </div>

    {/* Tombol aksi dengan styling yang lebih menarik */}
    <div className="mt-8 flex justify-end gap-3">
      <button
        onClick={closeModal}
        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center"
      >
        Batal
                  </button>
                  <button
        type="button"
        className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium flex items-center shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
      <button
        onClick={handleUpdate}
        disabled={loadingUpdate}
        className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-medium flex items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loadingUpdate ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menyimpan...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Simpan Perubahan
          </>
        )}
      </button>
    </div>
  </div>
</div>
  );
};

export default UpdateByBulanModal;
