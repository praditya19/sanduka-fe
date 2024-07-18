'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { membersData } from '../../data.js';

function DataAnggota() {
    const [maxItems, setMaxItems] = useState(10);
    const [selectedCabang, setSelectedCabang] = useState("-- Cabang --");
    const [selectedUnitKerja, setSelectedUnitKerja] = useState("-- Unit Kerja --");

    const filteredData = selectedCabang === "-- Cabang --"
        ? membersData
        : membersData.filter(item => item.cabang === selectedCabang);

    const filteredData2 = selectedUnitKerja === "-- Unit Kerja --"
        ? membersData
        : membersData.filter(item => item.kerja === selectedUnitKerja);

    const groupedData = [];
    let currentGroup = null;
    let totalAnggota = 0;

    filteredData.forEach((item, index) => {
        if (!currentGroup || currentGroup !== item.kerja) {
            if (currentGroup) {
                groupedData.push({ kerja: currentGroup, jumlah: totalAnggota });
                totalAnggota = 0;
            }
            currentGroup = item.kerja;
        }
        totalAnggota++;
        if (index === filteredData.length - 1) {
            groupedData.push({ kerja: currentGroup, jumlah: totalAnggota });
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-xl md:text-3xl font-extrabold">
                        KEANGGOTAAN
                    </h1>
                    <nav className="mt-4">
                        <ul className="flex flex-wrap space-x-4 md:space-x-6">
                            <li className="cursor-pointer">
                                <Link href="/anggota/data-anggota">Data Anggota</Link>
                            </li>
                            <li className="cursor-pointer">
                                <Link href="/anggota/data-anggota/by-name">Data By Name</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <div className="mb-4">
                <div className="flex items-start mt-2 justify-between">
                    <div className="flex items-center space-x-2">
                        <select className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={selectedCabang}
                            onChange={(e) => setSelectedCabang(e.target.value)}
                        >
                            <option>-- Cabang --</option>
                            <option>BANGSRI</option>
                            <option>JEPARA</option>
                        </select>
                        <select
                            className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={selectedUnitKerja}
                            onChange={(e) => setSelectedUnitKerja(e.target.value)}
                        >
                            <option>-- Unit Kerja --</option>
                            <option>SMAN 2 Jepara</option>
                            <option>SDN 3 Jepara</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option>Semua</option>
                        </select>
                    </div>
                    <p className="text-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Data Anggota By Name
                    </p>
                    <div className="flex items-end">
                        <div className="mb-4 space-x-2">
                            <label htmlFor="maxItems" className="mr-2">Tampilkan:</label>
                            <select
                                id="maxItems"
                                value={maxItems}
                                onChange={(e) => setMaxItems(parseInt(e.target.value))}
                                className="shadow appearance-none border rounded w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                            </select>
                            <Button className="px-8" variant="outline">Cetak</Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="container w-full table-auto mb-8">
                    <thead>
                        <tr>
                            <th className="p-2 md:p-3 border bg-green-200">No</th>
                            <th className="p-2 md:p-3 border bg-green-200">
                                {selectedCabang === "-- Cabang --" ? "Cabang" : `Unit Kerja ${selectedCabang}`}
                            </th>
                            <th className="p-2 md:p-3 border bg-green-200">Jumlah</th>
                            <th className="p-2 md:p-3 border bg-green-200">Nama</th>
                            <th className="p-2 md:p-3 border bg-green-200">PGRI</th>
                            <th className="p-2 md:p-3 border bg-green-200">Daspen</th>
                            <th className="p-2 md:p-3 border bg-green-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedData.slice(0, maxItems).map((group, groupIndex) => (
                            <tr key={groupIndex} className={groupIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                <td className="p-2 md:p-3 border text-center">{groupIndex + 1}</td>
                                <td className="p-2 md:p-3 border text-center">{group.kerja}</td>
                                <td className="p-2 md:p-3 border text-center">{group.jumlah}</td>
                                <td className="p-2 md:p-3 border">
                                    {filteredData
                                        .filter(item => item.kerja === group.kerja)
                                        .map((item, index) => (
                                            <div key={index} className="mb-1">
                                                {index + 1}. <span className="font-bold">{item.nama}</span> / {item.npa}
                                            </div>
                                        ))}
                                </td>
                                <td className="p-2 md:p-3 border text-center">
                                    {filteredData
                                        .filter(item => item.kerja === group.kerja)
                                        .map((item, index) => (
                                            <div key={index} className="mb-1">
                                                {item.anggota}
                                            </div>
                                        ))}
                                </td>
                                <td className="p-2 md:p-3 border text-center">
                                    {filteredData
                                        .filter(item => item.kerja === group.kerja)
                                        .map((item, index) => (
                                            <div key={index} className="mb-1">
                                                {item.pgri}
                                            </div>
                                        ))}
                                </td>
                                <td className="p-2 md:p-3 border text-center">
                                    <Link href="#" className="text-blue-500">
                                        <div className="flex flex-col space-y-2 items-center">
                                            <Button className="w-24 bg-blue-500">Edit</Button>
                                        </div>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataAnggota;
