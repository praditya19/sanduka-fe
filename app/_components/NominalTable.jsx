"use client";
import React from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

const formatDateTime = (input) => {
    if (!input) return "-";
    if (Array.isArray(input)) {
        if (input.length < 3) return "-";
        const [year, month, day, hour = 0, min = 0, sec = 0] = input;
        const d = String(day).padStart(2, "0");
        const m = String(month).padStart(2, "0");
        const y = String(year);
        const hh = String(hour).padStart(2, "0");
        const mm = String(min).padStart(2, "0");
        const ss = String(sec).padStart(2, "0");
        return `${d}-${m}-${y} ${hh}:${mm}:${ss}`;
    }
    if (typeof input === "string" || typeof input === "number") {
        const str = String(input).trim();
        if (!str || str === "-") return "-";
        const ymdMatch = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(str);
        if (ymdMatch) {
            const [, y, m, d, hh, mm, ss = "00"] = ymdMatch;
            return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y} ${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`;
        }
        const dmyMatch = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(str);
        if (dmyMatch) {
            const [, d, m, y, hh, mm, ss = "00"] = dmyMatch;
            return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y} ${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}`;
        }
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
            const d = String(parsed.getDate()).padStart(2, "0");
            const m = String(parsed.getMonth() + 1).padStart(2, "0");
            const y = parsed.getFullYear();
            const hh = String(parsed.getHours()).padStart(2, "0");
            const mm = String(parsed.getMinutes()).padStart(2, "0");
            const ss = String(parsed.getSeconds()).padStart(2, "0");
            return `${d}-${m}-${y} ${hh}:${mm}:${ss}`;
        }
        return str;
    }
    return "-";
};

const NominalTable = ({ data, onEdit, onDelete }) => {
    return (
        <div className="flex gap-4 w-full">
            <div className="bg-white rounded-xl shadow-md border w-full overflow-x-auto">
                <table className="min-w-full text-sm text-gray-700 border-collapse">
                    <thead className="bg-teal-600 text-white text-[15px]">
                        <tr>
                            <th className="px-4 py-3 border">No</th>
                            <th className="px-4 py-3 border">Cabang</th>
                            <th className="px-4 py-3 border">Unit Kerja</th>
                            <th className="px-4 py-3 border">Nama Anggota</th>
                            <th className="px-4 py-3 border">PGRI</th>
                            <th className="px-4 py-3 border">Sanduka</th>
                            <th className="px-4 py-3 border">Daspen</th>
                            <th className="px-4 py-3 border">Derap</th>
                            <th className="px-4 py-3 border">Kalender</th>
                            <th className="px-4 py-3 border">Lain-lain</th>
                            <th className="px-4 py-3 border">Total</th>
                            <th className="px-4 py-3 border">Tanggal Update</th>
                            <th className="px-4 py-3 border">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    }`}
                            >
                                <td className="px-4 py-3 border text-center font-medium">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 border">{item.cabang}</td>
                                <td className="px-4 py-3 border">{item.unitKerja}</td>
                                <td className="px-4 py-3 border min-w-[200px]">
                                    <p className="font-semibold">{item.namaAnggota}</p>
                                    <p className="text-gray-500">{item.nip}</p>
                                    <p className="text-gray-500">{item.nomorRekening}</p>
                                </td>
                                <td className="px-4 py-3 border text-right">
                                    {item.pgri.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-right">
                                    {item.sanduka.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-right">
                                    {item.daspen.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-right">
                                    {item.derap.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-right">
                                    {item.kalender.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-right">
                                    {item.lainLain.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-right font-semibold">
                                    {item.total.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 border text-center text-xs text-gray-600 whitespace-nowrap">
                                    {formatDateTime(
                                        item.lastUpdatedAtIuran ||
                                        item.lastUpdateIuran ||
                                        item.lastUpdatedAtIuranAnggota ||
                                        item.updatedAt ||
                                        item.updated_at ||
                                        item.createdAt ||
                                        item.created_at
                                    )}
                                </td>
                                <td className="border text-center">
                                    <div className="flex items-center justify-center space-x-3 py-2">
                                        <button
                                            className="text-blue-500 hover:text-blue-700 text-xl"
                                            onClick={() => onEdit(item)}
                                            title="Perbarui Data by Bulan"
                                        >
                                            <FaEdit />
                                        </button>
                                        {/* <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => onDelete(item.id, item.namaAnggota)}
                                            title="Hapus Data"
                                        >
                                            <FaTrashAlt />
                                        </button> */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default React.memo(NominalTable);