"use client"

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const anggota = [
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Menjadi Anggota Baru",
  },
  {
    date: "Senin, 01/07/2024 7:36:17",
    data: "REDZA ABIDURAHMAN 33200310649 JEPARA, 1997-02-10 SDN KALIPUCANGWETAN 1 27 Tahun",
    cabang: "WELAHAN",
    detail: "Menjadi Anggota Baru",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Meninggal",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Pensiun",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Keluar",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Meninggal",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Pensiun",
  },
  {
    date: "Senin, 01/07/2024 8:00:28",
    data: "MARIA ULFA 33200410494 Jepara, 1992-09-10 SDN MAYONGLOR 5 32 Tahun",
    cabang: "MAYONG",
    detail: "Menjadi Anggota Baru",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Meninggal",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Keluar",
  },
  {
    date: "Senin, 01/07/2024 9:07:12",
    data: " NINA ERVIANA 33200307436 KUDUS, 1997-12-07 SDN BUGO 3 27 Tahun",
    cabang: "WELAHAN",
    detail: "Menjadi Anggota Baru",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Meninggal",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Pensiun",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Keluar",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "KEDUNG",
    detail: "Meninggal",
  },
  {
    date: "Senin, 01/07/2024 8:00:28",
    data: "MARIA ULFA 33200410494 Jepara, 1992-09-10 SDN MAYONGLOR 5 32 Tahun",
    cabang: "KEMBANG",
    detail: "Menjadi Anggota Baru",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Pensiun",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "BATEALIT",
    detail: "Meninggal",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Menjadi Anggota Baru",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "BATEALIT",
    detail: "Keluar",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "NALUMSARI",
    detail: "Pensiun",
  },
  {
    date: "Senin, 01/07/2024 0:09:08",
    data: "Nurul Huda 33201222192 Jepara, 1998-12-22 SDN BLIMBINGREJO 2 26 Tahun",
    cabang: "BANGSRI",
    detail: "Meninggal",
  },
];

const DataTable = () => {
  const [detailFilter, setDetailFilter] = useState("");
  const [cabangFilter, setCabangFilter] = useState("");

  const filteredData = anggota.filter(item => 
    (detailFilter === "" || item.detail === detailFilter) &&
    (cabangFilter === "" || item.cabang === cabangFilter)
  );

  return (  
    <div className="w-full p-4 container shadow-lg rounded-lg">
      <div className="rounded-md flex flex-col py-4">
        <div className="container px-2">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-center">DATA ANGGOTA</h2>
          <div className="w-full flex mb-4 space-x-4">
            <select
              value={detailFilter}
              onChange={(e) => setDetailFilter(e.target.value)}
              className="p-2 border rounded max-w-sm w-full"
            >
              <option value="">Select Detail Filter</option>
              <option value="Menjadi Anggota Baru">Menjadi Anggota Baru</option>
              <option value="Keluar">Anggota Keluar</option>
              <option value="Pensiun">Anggota Pensiun</option>
              <option value="Meninggal">Anggota Meninggal</option>
            </select>
            <select
              value={cabangFilter}
              onChange={(e) => setCabangFilter(e.target.value)}
              className="p-2 border rounded max-w-sm w-full"
            >
              <option value="">Select Cabang Filter</option>
              <option value="BANGSRI">BANGSRI</option>
              <option value="BATEALIT">BATEALIT</option>
              <option value="CABSUS DINAS PENDIDIKAN">CABSUS DINAS PENDIDIKAN</option>
              <option value="CABSUS IGTKI">CABSUS IGTKI</option>
              <option value="DONOROJO">DONOROJO</option>
              <option value="JEPARA">JEPARA</option>
              <option value="BATEALIT">KALINYAMATAN</option>
              <option value="KARIMUNJAWA">KARIMUNJAWA</option>
              <option value="KEDUNG">KEDUNG</option>
              <option value="KELING">KELING</option>
              <option value="KEMBANG">KEMBANG</option>
              <option value="MAYONG">MAYONG</option>
              <option value="MLONGGO">MLONGGO</option>
              <option value="NALUMSARI">NALUMSARI</option>
              <option value="PAKIS AJI">PAKIS AJI</option>
              <option value="PECANGAAN">PECANGAAN</option>
              <option value="TAHUNAN">TAHUNAN</option>
              <option value="WELAHAN">WELAHAN</option>
            </select>
          </div>
          <Table className="w-full table-auto mb-8">
            <TableHeader className="p-2 md:p-3 border bg-green-300">
              <TableRow>
                <TableHead className="text-center font-bold text-gray-800 border text-lg">No</TableHead>
                <TableHead className="text-center font-bold text-gray-800 border text-lg">Date</TableHead>
                <TableHead className="text-center font-bold text-gray-800 border text-lg">Data</TableHead>
                <TableHead className="text-center font-bold text-gray-800 border text-lg">Cabang</TableHead>
                <TableHead className="text-center font-bold text-gray-800 border text-lg">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
                  <TableCell className="text-center border">{index + 1}</TableCell>
                  <TableCell className="border">{item.date}</TableCell>
                  <TableCell className="border">{item.data}</TableCell>
                  <TableCell className="border text-center">{item.cabang}</TableCell>
                  <TableCell className="border text-center">{item.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
