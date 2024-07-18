'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { membersData } from "../data.js";

function DataAnggota() {
    const [maxItems, setMaxItems] = useState(10);

    const jumlahAnggota = membersData.length;

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
                        <select className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option>-- Cabang --</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option>-- Unit Kerja --</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option>Semua</option>
                        </select>
                        <p className="text-center py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Jumlah Anggota : {jumlahAnggota}
                        </p>
                    </div>
                    <p className="text-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Data Anggota
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
                            <th className="p-2 md:p-3 border bg-green-200">Foto</th>
                            <th className="p-2 md:p-3 border bg-green-200">Data Anggota</th>
                            <th className="p-2 md:p-3 border bg-green-200">Keangggotaan</th>
                            <th className="p-2 md:p-3 border bg-green-200">Cabang</th>
                            <th className="p-2 md:p-3 border bg-green-200">Status</th>
                            <th className="p-2 md:p-3 border bg-green-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {membersData.slice(0, maxItems).map((item, index) => (
                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                            >
                                <td className="p-2 md:p-3 border text-center">{index + 1}</td>
                                <td className="p-2 md:p-3 border"></td>
                                <td className="p-2 md:p-3 border">
                                    <div className="font-bold">{item.nama}</div>
                                    <div>{item.npa}</div>
                                    <div>{item.lahir}, {item.tanggal}</div>
                                    <div>Usia {item.usia} Tahun</div>
                                    <div>{item.kerja}</div>
                                    <div>{item.tugas}</div>
                                    <div>{item.hp}</div>
                                </td>
                                <td className="p-2 md:p-3 border text-center">{item.anggota}</td>
                                <td className="p-2 md:p-3 border text-center">{item.cabang}</td>
                                <td className="p-2 md:p-3 border text-center">
                                    {item.status}
                                </td>
                                <td className="p-2 md:p-3 border text-center">
                                    <Link href="#" className="text-blue-500">
                                        <div className="flex flex-col space-y-2 items-center">
                                            <Button className="w-24 bg-blue-500">Edit Data</Button>
                                            <Button className="w-24 bg-red-600">Lapor</Button>
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