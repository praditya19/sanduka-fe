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
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const data = [
  {
    dateLapor: "10:53:01am, Selasa, 09/07/2024",
    data: "NUNIK LUDFIANA HADI JEPARA, 19-02-1984 40 Tahun SDN MANTINGAN 3 JL JENDRAL SUDIRMAN RT 2 RW 1 DEMAAN JEPARA",
    cabang: "TAHUNAN",
    detail: "Meninggal hari senin, 2024-06-11, meninggal karena sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:12:16am, Selasa, 15/07/2024",
    data: "NUR KHALIM SENDANG, 12-03-1967 57 Tahun SMPN 2 KALINYAMATAN SENDANG RT.03 RW.03",
    cabang: "KALINYAMATAN",
    detail: "Meninggal hari senin, 2024-07-14, Meninggal Dunia",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:29:20am, Selasa, 15/07/2024",
    data: "KUSNIATI Pati, 10-07-1968 56 Tahun SMAN 1 DONOROJO Dk. Gedong RT 001 RW 007, Desa Karangsari Kec. Cluwak Kab. Pati",
    cabang: "DONOROJO",
    detail: "Meninggal hari senin, 2024-07-02, Sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "MARDJONO Jepara, 14-03-1968 -1944 Tahun SMPN 2 PECANGAAN PECANGAAN KULON RT.02/II PECANGAAN",
    cabang: "PECANGAAN",
    detail: "Meninggal hari senin, 0024-05-31,",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "SARWADI JEPARA, 10-02-1965 59 Tahun SDN KEPUK 2 PLAJAN,RT.04/RW.01",
    cabang: "BANGSRI",
    detail: "Meninggal hari senin, 2024-06-16, sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:53:01am, Selasa, 09/07/2024",
    data: "NUNIK LUDFIANA HADI JEPARA, 19-02-1984 40 Tahun SDN MANTINGAN 3 JL JENDRAL SUDIRMAN RT 2 RW 1 DEMAAN JEPARA",
    cabang: "TAHUNAN",
    detail: "Meninggal hari senin, 2024-06-11, meninggal karena sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:12:16am, Selasa, 15/07/2024",
    data: "NUR KHALIM SENDANG, 12-03-1967 57 Tahun SMPN 2 KALINYAMATAN SENDANG RT.03 RW.03",
    cabang: "KALINYAMATAN",
    detail: "Meninggal hari senin, 2024-07-14, Meninggal Dunia",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:29:20am, Selasa, 15/07/2024",
    data: "KUSNIATI Pati, 10-07-1968 56 Tahun SMAN 1 DONOROJO Dk. Gedong RT 001 RW 007, Desa Karangsari Kec. Cluwak Kab. Pati",
    cabang: "DONOROJO",
    detail: "Meninggal hari senin, 2024-07-02, Sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "MARDJONO Jepara, 14-03-1968 -1944 Tahun SMPN 2 PECANGAAN PECANGAAN KULON RT.02/II PECANGAAN",
    cabang: "PECANGAAN",
    detail: "Meninggal hari senin, 0024-05-31,",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "SARWADI JEPARA, 10-02-1965 59 Tahun SDN KEPUK 2 PLAJAN,RT.04/RW.01",
    cabang: "BANGSRI",
    detail: "Meninggal hari senin, 2024-06-16, sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:53:01am, Selasa, 09/07/2024",
    data: "NUNIK LUDFIANA HADI JEPARA, 19-02-1984 40 Tahun SDN MANTINGAN 3 JL JENDRAL SUDIRMAN RT 2 RW 1 DEMAAN JEPARA",
    cabang: "TAHUNAN",
    detail: "Meninggal hari senin, 2024-06-11, meninggal karena sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:12:16am, Selasa, 15/07/2024",
    data: "NUR KHALIM SENDANG, 12-03-1967 57 Tahun SMPN 2 KALINYAMATAN SENDANG RT.03 RW.03",
    cabang: "KALINYAMATAN",
    detail: "Meninggal hari senin, 2024-07-14, Meninggal Dunia",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "10:29:20am, Selasa, 15/07/2024",
    data: "KUSNIATI Pati, 10-07-1968 56 Tahun SMAN 1 DONOROJO Dk. Gedong RT 001 RW 007, Desa Karangsari Kec. Cluwak Kab. Pati",
    cabang: "DONOROJO",
    detail: "Meninggal hari senin, 2024-07-02, Sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "MARDJONO Jepara, 14-03-1968 -1944 Tahun SMPN 2 PECANGAAN PECANGAAN KULON RT.02/II PECANGAAN",
    cabang: "PECANGAAN",
    detail: "Meninggal hari senin, 0024-05-31,",
    diterimakan: "Sebesar Rp.2.500.000",
  },
  {
    dateLapor: "11:33:58am, Selasa, 16/07/2024",
    data: "SARWADI JEPARA, 10-02-1965 59 Tahun SDN KEPUK 2 PLAJAN,RT.04/RW.01",
    cabang: "BANGSRI",
    detail: "Meninggal hari senin, 2024-06-16, sakit",
    diterimakan: "Sebesar Rp.2.500.000",
  },
];

const Page = () => {
  const [filter, setFilter] = useState("");

  const filteredData = data.filter(
    (item) =>
      item.data.toLowerCase().includes(filter.toLowerCase()) ||
      item.cabang.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full p-4 container shadow-lg rounded-lg">
      <div className="rounded-md flex flex-col py-4">
        <div className="container px-2">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-center">
            REKAP MENINGGAL
          </h2>
          <div className="w-full flex mb-4 relative">
            <input
              type="text"
              placeholder="Search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 pl-10 border rounded max-w-sm w-full"
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
            />
          </div>
          <Table className="w-full table-auto mb-8">
            <TableHeader className="p-2 md:p-3 border bg-green-300">
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
                  Foto
                </TableHead>
                <TableHead
                  rowspan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Date Lapor
                </TableHead>
                <TableHead
                  rowspan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Data Meninggal
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
                  Keterangan
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
                  <TableCell className="border">{item.dateLapor}</TableCell>
                  <TableCell className="border">{item.data}</TableCell>
                  <TableCell className="border">{item.cabang}</TableCell>
                  <TableCell className="border">{item.detail}</TableCell>
                  <TableCell className="text-center border">
                    {item.diterimakan}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
