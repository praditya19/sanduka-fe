"use client";
import { useState, useEffect } from "react";
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
  const npa = sessionStorage.getItem("npa");

  useEffect(() => {
    const fetchData = async () => {
      if (npa) {
        try {
          setLoading(true);
          const result = await GlobalApi.getHistoryByNpa(npa);
          setData(result);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [npa]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center bg-teal-600 py-4 rounded-lg shadow-md">
        <button className="ml-6 text-white" onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <h1 className="text-2xl font-semibold text-white text-center flex-grow">
          Detail
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
                {[
                  "Hari",
                  "Data",
                  "Cabang",
                  "Uraian",
                  "Bulan",
                  "Tahun",
                  "Cabang ke 2",
                  "User",
                ].map((header, idx) => (
                  <TableHead
                    key={header}
                    className={`border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white ${
                      idx > 2 ? "hidden lg:table-cell" : ""
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
                <>
                  <TableRow
                    key={index}
                    className={`hover:bg-gray-100 transition duration-200 ${
                      index % 2 === 0 ? "bg-gray-200" : "bg-white"
                    }`}
                  >
                    <TableCell className="text-center border border-gray-300 p-2">
                      {item.hari}, {item.tanggal}, {item.jam}
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2">
                      <div className="font-semibold">{item.nama}</div>
                      <div className="text-gray-600">{item.npa}</div>
                    </TableCell>
                    <TableCell className="text-center border border-gray-300 p-2">
                      {item.cabang}
                    </TableCell>
                    <TableCell className="border border-gray-300 p-2 hidden lg:table-cell">
                      {item.uraian}
                    </TableCell>
                    <TableCell className="border text-center border-gray-300 p-2 hidden lg:table-cell">
                      {item.bulan}
                    </TableCell>
                    <TableCell className="border text-center border-gray-300 p-2 hidden lg:table-cell">
                      {item.tahun}
                    </TableCell>
                    <TableCell className="border text-center border-gray-300 p-2 hidden lg:table-cell">
                      {item.cabang_ke_2}
                    </TableCell>
                    <TableCell className="border text-center border-gray-300 p-2 hidden lg:table-cell">
                      {item.user}
                    </TableCell>

                    <TableCell className="text-center border border-gray-300 p-2 lg:hidden">
                      <Button
                        className="text-blue-500"
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

                  {expandedIndex === index && (
                    <TableRow className="bg-gray-100 lg:hidden">
                      <TableCell
                        colSpan="4"
                        className="border border-gray-300 p-4 text-sm"
                      >
                        <div>
                          <strong>Uraian:</strong> {item.uraian ?? "-"}
                        </div>
                        <div>
                          <strong>Bulan:</strong> {item.bulan ?? "-"}
                        </div>
                        <div>
                          <strong>Tahun:</strong> {item.tahun ?? "-"}
                        </div>
                        <div>
                          <strong>Cabang ke 2:</strong>{" "}
                          {item.cabang_ke_2 ?? "-"}
                        </div>
                        <div>
                          <strong>User:</strong> {item.user ?? "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Page;