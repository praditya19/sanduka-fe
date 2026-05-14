"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import GlobalApi from "@/app/_utils/GlobalApi";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const npa = sessionStorage.getItem("npaDetailHistory");
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (npa) {
        try {
          setLoading(true);
          const result = await GlobalApi.getHistoryByNpa(npa);

          const sortedData = result.sort((a, b) => {
            const [dayA, monthA, yearA] = a.tanggal.split('/');
            const [dayB, monthB, yearB] = b.tanggal.split('/');
            const dateA = new Date(`${yearA}-${monthA}-${dayA} ${a.jam}`);
            const dateB = new Date(`${yearB}-${monthB}-${dayB} ${b.jam}`);
            return dateB - dateA;
          });

          setData(sortedData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [npa]);

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center bg-teal-600 py-4 rounded-lg shadow-md">
        <button className="ml-6 text-white" onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <h1 className="text-2xl font-semibold text-white text-center flex-grow">
          Detail History
        </h1>
      </div>
      {loading ? (
        <div className="text-center my-4">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 my-4">{error}</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <Table className="min-w-full table-auto mb-8 border border-black rounded-lg overflow-hidden">
            <TableHeader className="p-2 md:p-3 bg-green-300">
              <TableRow>
                {["Waktu", "Data Anggota", "Uraian", "Info Tambahan"].map((header) => (
                  <TableHead
                    key={header}
                    className={`border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white ${header === "Uraian" || header === "Info Tambahan"
                      ? "hidden lg:table-cell"
                      : ""
                      }`}
                  >
                    {header}
                  </TableHead>
                ))}
                <TableHead className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white lg:hidden">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  <TableRow
                    className={`hover:bg-gray-100 transition duration-200 ${index % 2 === 0 ? "bg-gray-200" : "bg-white"
                      }`}
                  >
                    <TableCell className="text-center border border-gray-300 p-2">
                      <div>{item.hari}</div>
                      <div>{item.tanggal}</div>
                      <div>{item.jam}</div>
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2">
                      <div className="font-semibold">{item.nama}</div>
                      <div className="text-gray-600">NPA: {item.npa}</div>
                      <div className="text-gray-600">Cabang: {item.cabang}</div>
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2 hidden lg:table-cell">
                      {item.uraian}
                      <br />
                      {item.keterangan}
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2 hidden lg:table-cell">
                      <div>Periode: {item.bulan} {item.tahun}</div>
                      {item.cabang_ke_2 && <div>Cabang Baru : {item.cabang_ke_2}</div>}
                      <div>Petugas: {item.user}</div>
                    </TableCell>
                    <TableCell className="text-center border border-gray-300 p-2 lg:hidden">
                      <Button
                        className="text-blue-500 bg-transparent hover:bg-transparent text-xl p-4"
                        onClick={() => handleExpand(index)}
                      >
                        {expandedIndex === index ? (
                          <FaMinusCircle />
                        ) : (
                          <FaPlusCircle />
                        )}
                      </Button>
                    </TableCell>

                  </TableRow>

                  {/* Expanded Row: Muncul di mobile */}
                  {expandedIndex === index && (
                    <TableRow className="bg-gray-100 lg:hidden">
                      <TableCell
                        colSpan="5"
                        className="border border-gray-300 p-4 text-sm"
                      >
                        <div>
                          <strong>Uraian:</strong> {item.uraian}
                        </div>
                        <div>
                          <strong>Info Tambahan:</strong>
                          <div>Periode: {item.bulan} {item.tahun}</div>
                          {item.cabang_ke_2 && (
                            <div>Cabang Baru : {item.cabang_ke_2}</div>
                          )}
                          <div>Petugas: {item.user}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Page;