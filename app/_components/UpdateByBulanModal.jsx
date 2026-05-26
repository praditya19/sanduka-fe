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
    const fields = ["Pgri", "Sanduka", "Daspen", "Derap", "Kalender"];
    setSelectedItem((prev) => {
      const updated = { ...prev };
      fields.forEach((field) => {
        const def = Number(prev[`default${field}`] || 0);
        const manual = Number(prev[`manual${field}`] || 0);
        updated[`total${field}`] = def + manual;
      });
      return updated;
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

      // Struktur payload baru sesuai permintaan
      const payload = {
        namaAnggota: selectedItem.namaAnggota,
        nip: selectedItem.nip,
        cabang: selectedItem.cabang,
        unitKerja: selectedItem.unitKerja,

        defaultPgri: Number(selectedItem.defaultPgri || 0),
        manualPgri: Number(selectedItem.manualPgri || 0),

        defaultSanduka: Number(selectedItem.defaultSanduka || 0),
        manualSanduka: Number(selectedItem.manualSanduka || 0),

        defaultDaspen: Number(selectedItem.defaultDaspen || 0),
        manualDaspen: Number(selectedItem.manualDaspen || 0),

        defaultDerap: Number(selectedItem.defaultDerap || 0),
        manualDerap: Number(selectedItem.manualDerap || 0),

        defaultKalender: Number(selectedItem.defaultKalender || 0),
        manualKalender: Number(selectedItem.manualKalender || 0),

        manualLainLain: Number(selectedItem.manualLainLain || 0),
      };

      await GlobalApi.updateByNominalByBulan(nip, bulan, payload);
      setNotification({
        type: "success",
        message: "Data berhasil diperbarui.",
      });
      closeModal();
      await fetchAllData();
    } catch (error) {
      console.error("Gagal update:", error);
      setNotification({
        type: "error",
        message: "Gagal memperbarui data.",
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[560px] shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start mb-6">
          <div className="bg-teal-100 p-3 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-700 mb-2">
              Update Data
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="flex flex-col">
                  <span>{selectedItem.namaAnggota}</span>
                  <span>{selectedItem.cabang}</span>
                  <span>{selectedItem.unitKerja}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span>{selectedItem.nip}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input bulan */}
        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mb-6">
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Tagihan Untuk Bulan
          </label>
          <input
            type="date"
            className="border border-teal-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            value={selectedItem.tagihanUntukBulan || ""}
            onChange={(e) => handleChange("tagihanUntukBulan", e.target.value)}
          />
        </div>

        {/* Input default/manual */}
        <div className="grid grid-cols-1 gap-4">
          {["Pgri", "Sanduka", "Daspen", "Derap", "Kalender", "LainLain"].map(
            (field) => (
              <div
                key={field}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-teal-200 transition-colors duration-200"
              >
                <label className="block text-sm font-medium text-gray-700 capitalize mb-3">
                  {field === "LainLain" ? "Lain-lain" : field}
                </label>

                {field !== "LainLain" ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Default
                      </label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg p-2 text-sm w-full"
                        value={selectedItem[`default${field}`] || 0}
                        onChange={(e) =>
                          handleChange(
                            `default${field}`,
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Manual
                      </label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg p-2 text-sm w-full"
                        value={selectedItem[`manual${field}`] || 0}
                        onChange={(e) =>
                          handleChange(`manual${field}`, Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Total
                      </label>
                      <input
                        type="number"
                        disabled
                        className="border border-gray-300 rounded-lg p-2 text-sm w-full bg-gray-100 font-medium text-gray-700"
                        value={
                          Number(selectedItem[`default${field}`] || 0) +
                          Number(selectedItem[`manual${field}`] || 0)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg p-3 w-full"
                    value={selectedItem.manualLainLain || 0}
                    onChange={(e) =>
                      handleChange("manualLainLain", Number(e.target.value))
                    }
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* Tombol aksi */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Batal
          </button>
          <button
            type="button"
            className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium flex items-center shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
          <button
            onClick={handleUpdate}
            disabled={loadingUpdate}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-medium flex items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingUpdate ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateByBulanModal;
