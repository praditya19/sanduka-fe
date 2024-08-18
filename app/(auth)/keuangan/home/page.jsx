"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";

const data = [
  { cabang: "BANGSRI", kurangSetor: 1000.0 },
  { cabang: "BATEALIT", kurangSetor: 1000.0 },
  { cabang: "CABSUS DINAS PENDIDIKAN", kurangSetor: 1000.0 },
  { cabang: "CABSUS IGTKI", kurangSetor: 1000.0 },
  { cabang: "DONOROJO", kurangSetor: 1000.0 },
  { cabang: "JEPARA", kurangSetor: 1000.0 },
  { cabang: "KALINYAMATAN", kurangSetor: 1000.0 },
  { cabang: "KARIMUNJAWA", kurangSetor: 1000.0 },
  { cabang: "KEDUNG", kurangSetor: 1000.0 },
  { cabang: "KELING", kurangSetor: 1000.0 },
  { cabang: "KEMBANG", kurangSetor: 1000.0 },
  { cabang: "MAYONG", kurangSetor: 1000.0 },
  { cabang: "MLONGGO", kurangSetor: 1000.0 },
  { cabang: "NALUMSARI", kurangSetor: 1000.0 },
  { cabang: "PAKIS AJI", kurangSetor: 1000.0 },
  { cabang: "PECANGAAN", kurangSetor: 1000.0 },
];

export default function Home() {
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Rekap Meninggal</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6 pt-20">
            <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-10">
              <div className="text-center md:mx-6 my-4 md:my-0">
                <h2 className="text-xl md:text-2xl font-extrabold">SALDO</h2>
                <p className="text-md md:text-lg text-gray-600">Juli 2024</p>
              </div>
              <div className="flex flex-col md:flex-row justify-center items-center mb-8">
                {/* Section 1 */}
                <div className="w-full md:w-1/2 mb-8 md:mb-0 flex flex-col items-center">
                  <Image
                    src="/sanduka.png"
                    width={150}
                    height={150}
                    alt="Sanduka"
                  />
                  <p className="text-xl font-semibold text-gray-800 mt-4">
                    Rp. 300.329.150,-
                  </p>
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg w-full max-w-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <h4 className="font-bold text-green-700">PEMASUKAN</h4>
                        <p className="text-xl font-semibold text-gray-800">
                          876.865.500,-
                        </p>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-red-700">PENGELUARAN</h4>
                        <p className="text-xl font-semibold text-gray-800">
                          576.536.350,-
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                  <Image
                    src="/logo.png"
                    width={80}
                    height={80}
                    alt="Organisasi"
                  />
                  <p className="text-xl font-semibold text-gray-800 mt-4 mb-4">
                    Rp. 0,-
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <h4 className="font-bold text-green-700">PEMASUKAN</h4>
                        <p className="text-xl font-semibold text-gray-800">
                          0,-
                        </p>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-red-700">PENGELUARAN</h4>
                        <p className="text-xl font-semibold text-gray-800">
                          0,-
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="container w-full table-auto mb-8">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="p-2 md:p-3 border">No</th>
                      <th className="p-2 md:p-3 border">Cabang</th>
                      <th className="p-2 md:p-3 border">Kurang Setor</th>
                      <th className="p-2 md:p-3 border">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="p-2 md:p-3 border text-center">
                          {index + 1}
                        </td>
                        <td className="p-2 md:p-3 border">{item.cabang}</td>
                        <td className="p-2 md:p-3 border text-center">
                          {item.kurangSetor.toFixed(2)}
                        </td>
                        <td className="p-2 md:p-3 border text-center">
                          <Link
                            href="/keuangan/home/detail"
                            className="text-blue-500"
                          >
                            <Button>Detail</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
