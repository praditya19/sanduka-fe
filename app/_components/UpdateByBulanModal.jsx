"use client";
import React from "react";
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
                pgri: Number(selectedItem.pgri),
                sanduka: Number(selectedItem.sanduka),
                daspen: Number(selectedItem.daspen),
                derap: Number(selectedItem.derap),
                kalender: Number(selectedItem.kalender),
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
            <div className="bg-white p-6 rounded-xl w-[480px] shadow-lg">
                <h2 className="text-lg font-semibold text-teal-600 mb-4">
                    Update Data By Bulan
                </h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Tagihan Untuk Bulan
                        </label>
                        <input
                            type="date"
                            className="border rounded-lg p-2 w-full"
                            value={selectedItem.tagihanUntukBulan || ""}
                            onChange={(e) =>
                                handleChange("tagihanUntukBulan", e.target.value)
                            }
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {["pgri", "sanduka", "daspen", "derap", "kalender", "lainLain"].map(
                            (field) => (
                                <div key={field}>
                                    <label className="block text-sm text-gray-600 capitalize">
                                        {field}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={selectedItem[field] || 0}
                                        onChange={(e) =>
                                            handleChange(field, Number(e.target.value))
                                        }
                                    />
                                </div>
                            )
                        )}
                    </div>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loadingUpdate}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                        {loadingUpdate ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateByBulanModal;