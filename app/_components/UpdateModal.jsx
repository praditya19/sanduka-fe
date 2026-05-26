"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { FaTimes } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const UpdateModal = ({
    updateModal,
    closeUpdateModal,
    handleUpdateSubmit,
    handleUpdateInputChange,
    updateCabangRef,
    showUpdateCabangDropdown,
    setShowUpdateCabangDropdown,
    searchUpdateCabang,
    setSearchUpdateCabang,
    filteredCabangList,
    setFilteredCabangList,
    originalCabangList,
    unitKerjaList,
    updateUnitRef,
    showUpdateUnitDropdown,
    setShowUpdateUnitDropdown,
    searchUpdateUnit,
    setSearchUpdateUnit,
    filteredUpdateUnit,
    setFilteredUpdateUnit,
}) => {
    const { data, loading } = updateModal;

    if (!data) return null;

    const total =
        (data.pgri || 0) +
        (data.sanduka || 0) +
        (data.daspen || 0) +
        (data.derap || 0) +
        (data.kalender || 0) +
        (data.lainLain || 0);

    const tagihanBulanValue = Array.isArray(data.tagihanUntukBulan)
        ? `${data.tagihanUntukBulan[0]}-${String(
            data.tagihanUntukBulan[1]
        ).padStart(2, "0")}`
        : data.tagihanUntukBulan
            ? String(data.tagihanUntukBulan).substring(0, 7)
            : "";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Update Data Anggota
                    </h3>
                    <button
                        onClick={closeUpdateModal}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 border-b pb-2">
                                Informasi Dasar
                            </h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Anggota *
                                </label>
                                <Input
                                    type="text"
                                    value={data.namaAnggota || ""}
                                    onChange={(e) =>
                                        handleUpdateInputChange("namaAnggota", e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIP
                                </label>
                                <Input
                                    type="text"
                                    value={data.nip || ""}
                                    onChange={(e) =>
                                        handleUpdateInputChange("nip", e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Rekening
                                </label>
                                <Input
                                    type="text"
                                    value={data.nomorRekening || ""}
                                    onChange={(e) =>
                                        handleUpdateInputChange("nomorRekening", e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div className="flex flex-col relative" ref={updateCabangRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cabang
                                </label>
                                <Input
                                    type="text"
                                    value={data.cabang || ""}
                                    readOnly
                                    onClick={() => setShowUpdateCabangDropdown(true)}
                                    placeholder="Pilih Cabang"
                                    className="cursor-pointer"
                                />
                                {showUpdateCabangDropdown && (
                                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                                        <ul className="max-h-44 overflow-y-auto">
                                            <li className="py-2 px-2">
                                                <Input
                                                    type="text"
                                                    value={searchUpdateCabang}
                                                    onChange={(e) => {
                                                        setSearchUpdateCabang(e.target.value);
                                                        setFilteredCabangList(
                                                            originalCabangList.filter((c) =>
                                                                c.kecamatan
                                                                    .toLowerCase()
                                                                    .includes(e.target.value.toLowerCase())
                                                            )
                                                        );
                                                    }}
                                                    placeholder="Cari Cabang..."
                                                />
                                            </li>
                                            <li
                                                onClick={() => {
                                                    handleUpdateInputChange("cabang", "");
                                                    handleUpdateInputChange("unitKerja", "");
                                                    setShowUpdateCabangDropdown(false);
                                                }}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            >
                                                Pilih Cabang
                                            </li>
                                            {filteredCabangList.map((cabang) => (
                                                <li
                                                    key={cabang.id}
                                                    onClick={() => {
                                                        handleUpdateInputChange("cabang", cabang.kecamatan);
                                                        handleUpdateInputChange("unitKerja", "");
                                                        setFilteredUpdateUnit(
                                                            unitKerjaList.filter(
                                                                (u) => u.cabang === cabang.kecamatan
                                                            )
                                                        );
                                                        setShowUpdateCabangDropdown(false);
                                                    }}
                                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                >
                                                    {cabang.kecamatan}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col relative" ref={updateUnitRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit Kerja
                                </label>
                                <Input
                                    type="text"
                                    value={data.unitKerja || ""}
                                    readOnly
                                    onClick={() => {
                                        if (!data.cabang) return;
                                        setFilteredUpdateUnit(
                                            unitKerjaList.filter((u) => u.cabang === data.cabang)
                                        );
                                        setShowUpdateUnitDropdown(true);
                                    }}
                                    placeholder="Pilih Unit Kerja"
                                    className="cursor-pointer"
                                    disabled={!data.cabang}
                                />
                                {showUpdateUnitDropdown && (
                                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-12 w-full">
                                        <ul className="max-h-44 overflow-y-auto">
                                            <li className="py-2 px-2">
                                                <Input
                                                    type="text"
                                                    value={searchUpdateUnit}
                                                    onChange={(e) => {
                                                        setSearchUpdateUnit(e.target.value);
                                                        setFilteredUpdateUnit(
                                                            unitKerjaList.filter(
                                                                (u) =>
                                                                    u.cabang === data.cabang &&
                                                                    u.unitKerja
                                                                        .toLowerCase()
                                                                        .includes(e.target.value.toLowerCase())
                                                            )
                                                        );
                                                    }}
                                                    placeholder="Cari Unit Kerja..."
                                                />
                                            </li>
                                            <li
                                                onClick={() => {
                                                    handleUpdateInputChange("unitKerja", "");
                                                    setShowUpdateUnitDropdown(false);
                                                }}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            >
                                                Pilih Unit Kerja
                                            </li>
                                            {filteredUpdateUnit.map((unit) => (
                                                <li
                                                    key={unit.id}
                                                    onClick={() => {
                                                        handleUpdateInputChange("unitKerja", unit.unitKerja);
                                                        setShowUpdateUnitDropdown(false);
                                                    }}
                                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                >
                                                    {unit.unitKerja}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 border-b pb-2">
                                Nominal Iuran
                            </h4>
                            {[
                                "pgri",
                                "sanduka",
                                "daspen",
                                "derap",
                                "kalender",
                                "lainLain",
                            ].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                        {field === "lainLain" ? "Lain-lain" : field}
                                    </label>
                                    <Input
                                        type="number"
                                        value={data[field] || 0}
                                        onChange={(e) =>
                                            handleUpdateInputChange(
                                                field,
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        className="w-full"
                                    />
                                </div>
                            ))}
                            <div className="bg-gray-50 p-3 rounded-md">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total
                                </label>
                                <div className="text-lg font-semibold text-teal-600">
                                    {total.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tagihan Untuk Bulan
                                </label>
                                <Input
                                    type="month"
                                    value={tagihanBulanValue}
                                    onChange={(e) =>
                                        handleUpdateInputChange(
                                            "tagihanUntukBulan",
                                            e.target.value ? e.target.value + "-01" : ""
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={closeUpdateModal}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <ClipLoader size={16} color="#ffffff" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Perubahan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateModal;