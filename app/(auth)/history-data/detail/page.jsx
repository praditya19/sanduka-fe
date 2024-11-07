"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; 
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <button 
          className="ml-6 text-white" 
          onClick={() => router.back()} 
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" /> 
        </button>
        <h1 className="text-2xl font-semibold text-white text-center flex-grow">Detail</h1>
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
                ].map((header) => (
                  <TableHead
                    key={header}
                    className="border border-gray-300 p-2 text-xs text-center font-bold uppercase bg-teal-700 text-white"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
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
                  <TableCell className="border border-gray-300 p-2">
                    {item.uraian}
                  </TableCell>
                  <TableCell className="border text-center border-gray-300 p-2">
                    {item.bulan}
                  </TableCell>
                  <TableCell className="border text-center border-gray-300 p-2">
                    {item.tahun}
                  </TableCell>
                  <TableCell className="border text-center border-gray-300 p-2">
                    {item.cabang_ke_2}
                  </TableCell>
                  <TableCell className="border text-center border-gray-300 p-2">
                    {item.user}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Page;
