'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { membersData } from "../data.js";

function formatRupiah(angka) {
    var reverse = angka.toString().split('').reverse().join(''),
        ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return 'Rp. ' + ribuan;
}

function RekapAnggota() {
    const [maxItems, setMaxItems] = useState(10);

    const jumlahAnggota = membersData.length;

    const totalIuran = formatRupiah(membersData.reduce((total, member) => total + member.iuran, 0));

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

    const { aggregated, aggregatedByUnitKerja } = aggregateData();

    const { JumlahPNS, JumlahPPPK, JumlahNonPNS, JumlahSemua } = aggregated;

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-xl md:text-3xl font-extrabold">
                        REKAP ANGGOTA
                    </h1>
                </div>
            </header>
            <div className="mb-4">
                <div className="flex flex-wrap items-start mt-2 justify-between">
                    <div className="flex flex-wrap items-center space-x-2">
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>-- Cabang --</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>-- Unit Kerja --</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>Semua</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 md:mb-0">
                            <option>Bulan</option>
                        </select>
                        <select className="shadow appearance-none border rounded w-full md:w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option>Tahun</option>
                        </select>
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
                            <th className="p-2 md:p-3 border bg-green-200" rowSpan="2">No</th>
                            <th className="p-2 md:p-3 border bg-green-200" rowSpan="2">Unit Kerja</th>
                            <th className="p-2 md:p-3 border bg-green-200" colSpan="3">Status Anggota</th>
                            <th className="p-2 md:p-3 border bg-green-200" rowSpan="2">Jumlah</th>
                            <th className="p-2 md:p-3 border bg-green-200" rowSpan="2">Iuran</th>
                        </tr>
                        <tr>
                            <th className="p-2 md:p-3 border bg-green-200">PNS</th>
                            <th className="p-2 md:p-3 border bg-green-200">PPPK</th>
                            <th className="p-2 md:p-3 border bg-green-200">Non PNS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedByUnitKerja.slice(0, maxItems).map((item, index) => (
                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                            >
                                <td className="p-2 md:p-3 border text-center">{index + 1}</td>
                                <td className="p-2 md:p-3 border">{item.kerja}</td>
                                <td className="p-2 md:p-3 border text-center">{item.PNS}</td>
                                <td className="p-2 md:p-3 border text-center">{item.PPPK}</td>
                                <td className="p-2 md:p-3 border text-center">{item.NonPNS}</td>
                                <td className="p-2 md:p-3 border text-center">{item.anggota}</td>
                                <td className="p-2 md:p-3 border text-center">{formatRupiah(item.Iuran)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="2" className="p-2 md:p-3 border bg-green-200 text-left">Jumlah :</td>
                            <td className="p-2 md:p-3 border bg-green-200 text-center">{JumlahPNS}</td>
                            <td className="p-2 md:p-3 border bg-green-200 text-center">{JumlahPPPK}</td>
                            <td className="p-2 md:p-3 border bg-green-200 text-center">{JumlahNonPNS}</td>
                            <td className="p-2 md:p-3 border bg-green-200 text-center">{JumlahSemua}</td>
                            <td className="p-2 md:p-3 border bg-green-200 text-center">{totalIuran}</td>
                        </tr>
                        <tr>
                            <td colSpan="2" className="p-2 md:p-3 border bg-green-200 text-left">Total Sumbangan : </td>
                            <td colSpan="5" className="p-2 md:p-3 border bg-green-200 text-left">{totalIuran}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default RekapAnggota;