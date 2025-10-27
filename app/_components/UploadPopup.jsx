"use client";
import React, { useState } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaUpload } from "react-icons/fa";

const UploadPopup = ({ onClose, setNotification, fetchAllData }) => {
    const now = new Date();
    const [bulan, setBulan] = useState(now.getMonth() + 1);
    const [tahun, setTahun] = useState(now.getFullYear());
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const months = [
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
    ];

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Silakan pilih file Excel terlebih dahulu.");
            return;
        }

        const tagihanUntukBulan = `${tahun}-${String(bulan).padStart(2, "0")}-01`;

        try {
            setIsLoading(true);
            const res = await GlobalApi.importByNominal(file, tagihanUntukBulan);
            setNotification({ type: "success", message: res });
            onClose();
            await fetchAllData();
        } catch (error) {
            console.error("Upload failed:", error.response?.data || error);
            setNotification({
                type: "error",
                message:
                    "Gagal mengunggah file. Coba periksa format Excel atau hubungi admin.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black opacity-40"
                onClick={onClose}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md z-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                    <FaUpload /> Upload Data Excel
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bulan
                        </label>
                        <select
                            value={bulan}
                            onChange={(e) => setBulan(Number(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 focus:ring-teal-400 focus:outline-none"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tahun
                        </label>
                        <select
                            value={tahun}
                            onChange={(e) => setTahun(Number(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 focus:ring-teal-400 focus:outline-none"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            File Excel (.xlsx)
                        </label>
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full border rounded-md px-3 py-2 focus:ring-teal-400 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md disabled:opacity-60"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-60"
                        >
                            {isLoading ? "Mengupload..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadPopup;