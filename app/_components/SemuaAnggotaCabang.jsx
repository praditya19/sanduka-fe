"use client";
import { useState } from "react";

function Table() {
  const [data] = useState([
    { no: 1, cabang: "BANGSRI", pgri: 463, daspen: 464 },
    { no: 2, cabang: "BATEALIT", pgri: 466, daspen: 209 },
    { no: 3, cabang: "CABSUS DINAS PENDIDIKAN", pgri: 178, daspen: 178 },
    { no: 4, cabang: "CABSUS IGTKI", pgri: 670, daspen: 2 },
    { no: 5, cabang: "DONOROJO", pgri: 369, daspen: 369 },
    { no: 6, cabang: "JEPARA", pgri: 877, daspen: 875 },
    { no: 7, cabang: "KALINYAMATAN", pgri: 395, daspen: 395 },
    { no: 8, cabang: "KARIMUNJAWA", pgri: 127, daspen: 126 },
    { no: 9, cabang: "KEDUNG", pgri: 330, daspen: 332 },
    { no: 10, cabang: "KELING", pgri: 269, daspen: 151 },
    { no: 11, cabang: "KEMBANG", pgri: 444, daspen: 431 },
    { no: 12, cabang: "MAYONG", pgri: 324, daspen: 99 },
    { no: 13, cabang: "MLONGGO", pgri: 272, daspen: 38 },
    { no: 14, cabang: "NALUMSARI", pgri: 404, daspen: 400 },
    { no: 15, cabang: "PAKIS AJI", pgri: 285, daspen: 285 },
    { no: 16, cabang: "PECANGAAN", pgri: 404, daspen: 404 },
    { no: 17, cabang: "TAHUNAN", pgri: 378, daspen: 376 },
    { no: 18, cabang: "WELAHAN", pgri: 488, daspen: 485 },
    // { no: "", cabang: "Jumlah", pgri: 7143, daspen: 5619 },
  ]);

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-base font-extrabold mb-6 text-gray-800 text-center">
        Data Anggota <br />
        Agustus 2024
      </h1>
      <div className="overflow-x-auto text-sm">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 border-b border-gray-300 text-left">
                No
              </th>
              <th className="px-4 py-3 border-b border-gray-300 text-left">
                Cabang
              </th>
              <th className="px-4 py-3 border-b border-gray-300 text-left">
                PGRI / Sanduka
              </th>
              <th className="px-4 py-3 border-b border-gray-300 text-left">
                Daspen
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.no}
                className={`hover:bg-gray-100 transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-gray-50" : ""
                }`}
              >
                <td className="px-4 py-4 border-b border-gray-300">
                  {item.no}
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                  {item.cabang}
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                  {item.pgri}
                </td>
                <td className="px-4 py-4 border-b border-gray-300">
                  {item.daspen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
