'use client';
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { membersData } from "../data.js";

function formatRupiah(angka) {
    var reverse = angka.toString().split('').reverse().join(''),
        ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return 'Rp. ' + ribuan;
}

function StatusAnggota() {
    const [maxItems, setMaxItems] = useState(10);

    const jumlahAnggota = membersData.length;

    const aggregateData = () => {
        const aggregated = {
            JumlahPNS: 0,
            JumlahPPPK: 0,
            JumlahNonPNS: 0,
            JumlahSemua: membersData.length
        };

        const aggregatedByUnitKerja = {};
        membersData.forEach((item) => {
            if (!aggregatedByUnitKerja[item.kerja]) {
                aggregatedByUnitKerja[item.kerja] = { PNS: 0, PPPK: 0, NonPNS: 0, anggota: 0, Iuran: 0 };
            }
            switch (item.status) {
                case "PNS":
                    aggregated.JumlahPNS++;
                    aggregatedByUnitKerja[item.kerja].PNS++;
                    break;
                case "PPPK":
                    aggregated.JumlahPPPK++;
                    aggregatedByUnitKerja[item.kerja].PPPK++;
                    break;
                case "Non PNS":
                    aggregated.JumlahNonPNS++;
                    aggregatedByUnitKerja[item.kerja].NonPNS++;
                    break;
                default:
                    break;
            }
            aggregatedByUnitKerja[item.kerja].anggota++;
            aggregatedByUnitKerja[item.kerja].Iuran += item.iuran;
        });

        return {
            aggregated,
            aggregatedByUnitKerja: Object.entries(aggregatedByUnitKerja).map(([kerja, data], index) => ({
                kerja,
                ...data,
                index
            }))
        };
    };

    const { aggregated } = aggregateData();

    const { JumlahPNS, JumlahPPPK, JumlahNonPNS } = aggregated;

    const categories = [
        { title: "PNS", count: JumlahPNS, items: ["TK/RA/PAUD", "SMA/SMK/MA"] },
        { title: "NON PNS", count: JumlahNonPNS, items: ["SD/MI", "Perguruan"] },
        { title: "PPPK", count: JumlahPPPK, items: ["SMP/MTs", "SLB"] }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-xl md:text-3xl font-extrabold">
                        STATUS ANGGOTA
                    </h1>
                </div>
            </header>

            <div className="flex flex-wrap justify-between mt-4 mb-4 mx-4">
                {categories.map((category, index) => (
                    <div key={index} className="flex flex-col items-center w-full md:w-1/3 mb-4 md:mb-0">
                        <div className="bg-teal-500 text-white p-2 rounded-lg mb-2 w-40 text-center">
                            {category.title}
                        </div>
                        <div className="text-2xl font-bold mb-2">
                            {category.count}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap justify-between mt-4 mb-4 mx-4">
                {categories.map((category, index) => (
                    <div key={index} className="flex flex-col items-center w-full md:w-1/3 mb-4">
                        <div className="flex flex-wrap justify-center mx-2">
                            {category.items.map((item, idx) => (
                                <div key={idx} className="bg-white border rounded-lg shadow-md p-4 mb-2 w-full sm:w-60 mx-2 text-center">
                                    <img src={`/images/${item.toLowerCase().replace(/\//g, '-')}.png`} alt={item} className="mb-2 w-40 mx-auto" />
                                    <Link href="#">
                                        <Button className="bg-blue-500 w-full">Lihat Data</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mb-4 mx-4">
                <div className="flex flex-wrap items-start mt-2 justify-between">
                    <div className="flex flex-wrap items-center space-x-2">
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>-- Cabang --</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>-- Status --</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-44 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>-- Tingkat Sekolah --</option>
                        </select>
                        <p className="py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto">
                            Jumlah Anggota : {jumlahAnggota}
                        </p>
                    </div>
                    <div className="flex items-end mt-2 md:mt-0">
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
                            <th className="p-2 md:p-3 border bg-green-200">Tingkat Sekolah</th>
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
                                <td className="p-2 md:p-3 border text-center">SMK</td>
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

export default StatusAnggota;
