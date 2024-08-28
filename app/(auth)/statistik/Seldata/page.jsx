"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GlobalApi from "@/app/_utils/GlobalApi";

const DataTable = () => {
  const [detailFilter, setDetailFilter] = useState("");
  const [cabangFilter, setCabangFilter] = useState("");
  const [cabangOptions, setCabangOptions] = useState([]);
  const [anggotaData, setAnggotaData] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCabangData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabangOptions(response.data);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  const fetchAnggotaData = async () => {
    try {
      const response = await GlobalApi.getAllAnggota();
      if (Array.isArray(response.data)) {
        setAnggotaData(response.data); // Ensure the data is an array
      } else {
        console.error("Unexpected data format:", response.data);
        setAnggotaData([]); // Set to empty array if data format is unexpected
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching anggota data:", error);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCabangData();
    fetchAnggotaData();
  }, []);

  const filteredData = anggotaData.filter(
    (item) =>
      (detailFilter === "" || item.detail === detailFilter) &&
      (cabangFilter === "" || item.cabang === cabangFilter)
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full p-4 container shadow-lg rounded-lg">
      <div className="rounded-md flex flex-col py-4">
        <div className="container px-2">
          <h2 className="text-base md:text-base font-bold mb-4 text-center">
            DATA ANGGOTA
          </h2>
          <div className="w-full flex mb-4 space-x-4 text-base">
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
              a
              className="p-2 border rounded max-w-sm w-full"
            >
              <option>Pilih Cabang</option>
              {cabangOptions.map((cabang) => (
                <option key={cabang.idKecamatan} value={cabang.kecamatan}>
                  {cabang.kecamatan}
                </option>
              ))}
            </select>
          </div>
          <Table className="w-full table-auto mb-8 text-sm">
            <TableHeader className="p-2 md:p-3 border bg-teal-700 ">
              <TableRow>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  No
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Date
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Data
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Cabang
                </TableHead>
                <TableHead
                  rowSpan="2"
                  className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                >
                  Detail
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
                  <TableCell className="border">{item.date}</TableCell>
                  <TableCell className="border">{item.data}</TableCell>
                  <TableCell className="border text-center">
                    {item.cabang}
                  </TableCell>
                  <TableCell className="border text-center">
                    {item.detail}
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

export default DataTable;
