"use client";
import React from "react";
import { Input } from "@/components/ui/input";

const FilterControls = ({
    cabangRef,
    selectedCabang,
    handleCabangClick,
    showCabangDropdown,
    searchCabang,
    handleCabangSearch,
    handleSelectCabang,
    filteredCabangList,
    unitKerjaRef,
    unitKerjaInput,
    handleUnitKerjaClick,
    showUnitKerjaDropdown,
    searchUnitKerja,
    handleUnitKerjaSearch,
    handleUnitKerjaSelect,
    filteredUnitKerja,
    namaAnggotaInput,
    setNamaAnggotaInput,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col relative w-64" ref={cabangRef}>
                <p>Cabang</p>
                <Input
                    type="text"
                    value={selectedCabang}
                    readOnly
                    onClick={handleCabangClick}
                    placeholder="Pilih Cabang"
                    className="cursor-pointer"
                />
                {showCabangDropdown && (
                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                                <Input
                                    type="text"
                                    value={searchCabang}
                                    onChange={(e) => handleCabangSearch(e.target.value)}
                                    placeholder="Cari Cabang..."
                                />
                            </li>
                            <li
                                onClick={() => handleSelectCabang({ kecamatan: "" })}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                Pilih Cabang
                            </li>
                            {filteredCabangList.map((cabang) => (
                                <li
                                    key={cabang.id}
                                    onClick={() => handleSelectCabang(cabang)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    {cabang.kecamatan}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
                <p>Unit Kerja</p>
                <Input
                    type="text"
                    value={unitKerjaInput}
                    onClick={handleUnitKerjaClick}
                    placeholder="Pilih Unit Kerja"
                    className="cursor-pointer"
                    disabled={!selectedCabang}
                />
                {showUnitKerjaDropdown && (
                    <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-16 w-full">
                        <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                                <Input
                                    type="text"
                                    value={searchUnitKerja}
                                    onChange={(e) => handleUnitKerjaSearch(e.target.value)}
                                    placeholder="Cari Unit Kerja..."
                                />
                            </li>
                            <li
                                onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                                Pilih Unit Kerja
                            </li>
                            {filteredUnitKerja.map((unitKerja) => (
                                <li
                                    key={unitKerja.id}
                                    onClick={() => handleUnitKerjaSelect(unitKerja)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    {unitKerja.unitKerja}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex flex-col relative w-64">
                <p>Nama Anggota</p>
                <div className="relative">
                    <Input
                        type="text"
                        value={namaAnggotaInput}
                        onChange={(e) => setNamaAnggotaInput(e.target.value)}
                        placeholder="Nama anggota..."
                        className="pr-10"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterControls;