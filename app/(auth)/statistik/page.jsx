"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserPlus,
  faUserMinus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Seldata from "../statistik/Seldata/page";

const Page = () => {
  const [filter, setFilter] = useState("");

  const data = [
    {
      no: 1,
      cabang: "BANGSRI",
      dataLalu: 431,
      baru: 10,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 441,
    },
    {
      no: 2,
      cabang: "BATEALIT",
      dataLalu: 466,
      baru: 2,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 468,
    },
    {
      no: 3,
      cabang: "CABSUS DINAS PENDIDIKAN",
      dataLalu: 182,
      baru: 5,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 187,
    },
    {
      no: 4,
      cabang: "CABSUS IGTKI",
      dataLalu: 672,
      baru: 3,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 675,
    },
    {
      no: 5,
      cabang: "DONOROJO",
      dataLalu: 336,
      baru: 4,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 340,
    },
    {
      no: 6,
      cabang: "JEPARA",
      dataLalu: 829,
      baru: 15,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 1,
      keluar: 0,
      dataSekarang: 845,
    },
    {
      no: 7,
      cabang: "KALINYAMATAN",
      dataLalu: 377,
      baru: 1,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 1,
      keluar: 0,
      dataSekarang: 379,
    },
    {
      no: 8,
      cabang: "KARIMUNJAWA",
      dataLalu: 126,
      baru: 2,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 128,
    },
    {
      no: 9,
      cabang: "KEDUNG",
      dataLalu: 312,
      baru: 10,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 2,
      dataSekarang: 320,
    },
    {
      no: 10,
      cabang: "KELING",
      dataLalu: 269,
      baru: 7,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 276,
    },
    {
      no: 11,
      cabang: "KEMBANG",
      dataLalu: 436,
      baru: 3,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 439,
    },
    {
      no: 12,
      cabang: "MAYONG",
      dataLalu: 318,
      baru: 9,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 327,
    },
    {
      no: 13,
      cabang: "MLONGGO",
      dataLalu: 273,
      baru: 5,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 278,
    },
    {
      no: 14,
      cabang: "NALUMSARI",
      dataLalu: 367,
      baru: 30,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 397,
    },
    {
      no: 15,
      cabang: "PAKIS AJI",
      dataLalu: 253,
      baru: 12,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 265,
    },
    {
      no: 16,
      cabang: "PECANGAAN",
      dataLalu: 328,
      baru: 5,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 333,
    },
    {
      no: 17,
      cabang: "TAHUNAN",
      dataLalu: 378,
      baru: 1,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 1,
      keluar: 0,
      dataSekarang: 380,
    },
    {
      no: 18,
      cabang: "WELAHAN",
      dataLalu: 444,
      baru: 38,
      aktif: 0,
      pensiun: 0,
      meninggal: 0,
      keluarAnggota: 0,
      masuk: 0,
      keluar: 0,
      dataSekarang: 482,
    },
  ];

  const filteredData = data.filter((item) =>
    item.cabang.toLowerCase().includes(filter.toLowerCase())
  );

  const calculateTotal = (key) => {
    return data.reduce((sum, item) => sum + item[key], 0);
  };

  const totals = {
    dataLalu: calculateTotal("dataLalu"),
    baru: calculateTotal("baru"),
    aktif: calculateTotal("aktif"),
    pensiun: calculateTotal("pensiun"),
    meninggal: calculateTotal("meninggal"),
    keluarAnggota: calculateTotal("keluarAnggota"),
    masuk: calculateTotal("masuk"),
    keluar: calculateTotal("keluar"),
    dataSekarang: calculateTotal("dataSekarang"),
  };

  return (
    <div className="w-full p-4 container shadow-lg rounded-lg">
      <div className="rounded-md flex flex-col py-4">
        <div className="container px-2">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-center">
            STATISTIK ANGGOTA
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center bg-white shadow-md rounded-lg p-2 sm:p-4">
              <div className="flex items-center justify-center bg-blue-100 rounded-full w-8 h-8 sm:w-12 sm:h-12">
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="text-blue-600 w-4 h-4 sm:w-6 sm:h-6"
                />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-xl sm:text-2xl font-semibold text-gray-800">
                  153
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Anggota Masuk
                </div>
              </div>
            </div>
            <div className="flex items-center bg-white shadow-md rounded-lg p-2 sm:p-4">
              <div className="flex items-center justify-center bg-red-100 rounded-full w-8 h-8 sm:w-12 sm:h-12">
                <FontAwesomeIcon
                  icon={faUserMinus}
                  className="text-red-600 w-4 h-4 sm:w-6 sm:h-6"
                />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-xl sm:text-2xl font-semibold text-gray-800">
                  2
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Anggota Keluar
                </div>
              </div>
            </div>
            <div className="flex items-center bg-white shadow-md rounded-lg p-2 sm:p-4">
              <div className="flex items-center justify-center bg-green-100 rounded-full w-8 h-8 sm:w-12 sm:h-12">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-green-600 w-4 h-4 sm:w-6 sm:h-6"
                />
              </div>
              <div className="ml-2 sm:ml-4">
                <div className="text-xl sm:text-2xl font-semibold text-gray-800">
                  6950
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Total Anggota
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start mb-4">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
              <input
                type="text"
                placeholder="Search Data..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-gray-400"
                />
              </div>
            </div>
          </div>
          <Table className="table-auto w-full border-collapse border border-gray-300">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead
                  rowspan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  No
                </TableHead>
                <TableHead
                  rowspan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Cabang
                </TableHead>
                <TableHead
                  rowspan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Data Lalu
                </TableHead>
                <TableHead
                  colSpan="5"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white "
                >
                  Mutasi
                </TableHead>
                <TableHead
                  colSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white "
                >
                  Pindah Cabang
                </TableHead>
                <TableHead
                  rowspan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Data Sekarang
                </TableHead>
              </TableRow>
              <TableRow>
                {/* Empty cells for the non-Mutasi headers to align properly */}
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  Baru
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  Aktif
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  Pensiun
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  Meninggal
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  Keluar Anggota
                </TableHead>
                {/* Individual headers for Mutasi columns */}
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  masuk
                </TableHead>
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white">
                  keluar
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  <TableCell className="text-center border">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs">
                    {item.cabang}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center ">
                    {item.dataLalu}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.baru}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.aktif}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.pensiun}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.meninggal}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.keluarAnggota}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.masuk}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.keluar}
                  </TableCell>
                  <TableCell className="border border-gray-300 p-2 text-xs text-center">
                    {item.dataSekarang}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-200">
                <TableCell
                  colSpan="2"
                  className="border border-gray-300 p-2 text-xs font-bold text-center"
                >
                  Total
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.dataLalu}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.baru}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.aktif}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.pensiun}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.meninggal}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.keluarAnggota}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.masuk}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.keluar}
                </TableCell>
                <TableCell className="border border-gray-300 p-2 text-xs font-bold text-center">
                  {totals.dataSekarang}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
      <Seldata />
    </div>
  );
};

export default Page;
