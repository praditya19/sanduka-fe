"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";

const Page = () => {
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const { token } = useAuth();
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

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
          <div className="min-h-screen bg-gray-100 p-4">
            <div className="bg-teal-700 p-4 rounded-lg mb-4 mt-16 flex flex-wrap justify-between items-center space-y-4 md:space-y-0 md:flex-nowrap">
              <select className="bg-white p-2 rounded border w-full md:w-auto">
                <option>Tampil Semua</option>
              </select>
              <select className="bg-white p-2 rounded border w-full md:w-auto">
                <option>-- Bulan --</option>
              </select>
              <select className="bg-white p-2 rounded border w-full md:w-auto">
                <option>-- Tahun --</option>
              </select>
              <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full md:w-auto">
                Cetak
              </Button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between mb-4">
                <span>Cabang: Tampil Semua</span>
                <span>Jumlah Anggota: 0 Orang</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-teal-700 text-white">
                    <tr>
                      <th className="py-2 px-3 text-center">No.</th>
                      <th className="py-2 px-3 text-center">Foto</th>
                      <th className="py-2 px-3 text-center">
                        Prediksi Pensiun
                      </th>
                      <th className="py-2 px-3 text-center">Data Anggota</th>
                      <th className="py-2 px-3 text-center">Keanggotaan</th>
                      <th className="py-2 px-3 text-center">Cabang</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="py-2 px-3 text-center">1</td>
                      <td className="py-2 px-3 text-center">Foto</td>
                      <td className="py-2 px-3 text-center">
                        Prediksi Pensiun
                      </td>
                      <td className="py-2 px-3 text-center">Data Anggota</td>
                      <td className="py-2 px-3 text-center">Keanggotaan</td>
                      <td className="py-2 px-3 text-center">Cabang</td>
                      <td className="py-2 px-3 text-center">Status</td>
                      <td className="py-2 px-3 text-center">Action</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
