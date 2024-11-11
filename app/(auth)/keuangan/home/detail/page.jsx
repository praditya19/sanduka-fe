"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";

const data = [
  {
    month: "Maret 2021",
    items: [
      { jenis: "Sanduka", kabupaten: 1035000, cabang: 1035000 },
      { jenis: "Daspen", kabupaten: 0, cabang: 0 },
      { jenis: "PGRI", kabupaten: 0, cabang: 0 },
      { jenis: "Derap", kabupaten: 0, cabang: 0 },
      { jenis: "Kalender", kabupaten: 0, cabang: 0 },
      { jenis: "Lain - Lain", kabupaten: 0, cabang: 0 },
    ],
    totalKekurangan: 11350000,
  },
  {
    month: "April 2021",
    items: [
      { jenis: "Sanduka", kabupaten: 1014000, cabang: 1014000 },
      { jenis: "Daspen", kabupaten: 0, cabang: 0 },
      { jenis: "PGRI", kabupaten: 0, cabang: 0 },
      { jenis: "Derap", kabupaten: 0, cabang: 0 },
      { jenis: "Kalender", kabupaten: 0, cabang: 0 },
      { jenis: "Lain - Lain", kabupaten: 0, cabang: 0 },
    ],
    totalKekurangan: 11350000,
  },
  // Tambahkan bulan-bulan lainnya di sini
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState({});
  const [colSpan, setColSpan] = useState(2);

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

  useEffect(() => {
    // Function to check the screen width and update colSpan
    const updateColSpan = () => {
      setColSpan(window.innerWidth >= 768 ? 3 : 2); // 3 for desktop, 2 for mobile
    };

    // Initial check
    updateColSpan();

    // Add event listener to update colSpan on resize
    window.addEventListener("resize", updateColSpan);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", updateColSpan);
  }, []);

  const toggleRowExpansion = (idx) => {
    setExpandedRows((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };


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
                className="cursor-pointer mr-2"
              />
              <h1 className="text-base">Detail</h1>
            </div>
          </div>
        </header>
      ) : (
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
              <h1 className="text-base">Detail</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-center space-x-4 mb-4 mx-auto mt-12">
              <select className="border p-2 rounded w-1/3">
                <option>-- Bulan --</option>
                {/* Tambahkan pilihan bulan */}
              </select>
              <select className="border p-2 rounded w-1/3">
                <option>-- Tahun --</option>
                {/* Tambahkan pilihan tahun */}
              </select>
            </div>

            <h2 className="text-green-600 text-center mb-2">
              Kekurangan Setoran Cabang BANGSRI
            </h2>
            <h1 className="text-center text-2xl font-bold text-green-600 mb-6">
              Rp. 27.000.000,-
            </h1>

            {data.map((monthData, index) => (
              <div key={index} className="mb-8">
                <h3 className="font-bold text-lg mb-4">
                  Bulan {monthData.month}
                </h3>
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4">Setor Kabupaten</th>
                      <th className="py-3 px-4 hidden md:table-cell">
                        Peruntukan Cabang/Ranting
                      </th>
                      <th className="py-3 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.items.map((item, idx) => (
                      <>
                        <tr key={idx} className="border-t">
                          <td className="py-3 px-4">
                            {item.jenis}
                            <button className="lg:hidden" onClick={() => toggleRowExpansion(idx)}>
                              {expandedRows[idx] ? <FaMinusCircle /> : <FaPlusCircle />}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            {item.kabupaten.toLocaleString("id-ID")}
                          </td>
                          {/* Display Peruntukan Cabang/Ranting on desktop only */}
                          <td className="py-3 px-4 hidden md:table-cell">
                            {item.cabang.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {(item.kabupaten + item.cabang).toLocaleString("id-ID")}
                          </td>
                        </tr>
                        {/* Render additional details if expanded (mobile only) */}
                        {expandedRows[idx] && (
                          <tr key={`expanded-${idx}`} className="border-t md:hidden">
                            <td colSpan="3" className="py-3 px-4">
                              <div>
                                <strong>Peruntukan Cabang/Ranting:</strong> {item.cabang.toLocaleString("id-ID")}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                    {/* Total row */}
                    <tr className="border-t bg-gray-100">
                      <td className="py-3 px-4 font-bold">Total</td>
                      <td className="py-3 px-4 font-bold">
                        {monthData.items
                          .reduce((acc, item) => acc + item.kabupaten, 0)
                          .toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-bold hidden md:table-cell">
                        {monthData.items
                          .reduce((acc, item) => acc + item.cabang, 0)
                          .toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {monthData.items
                          .reduce(
                            (acc, item) => acc + item.kabupaten + item.cabang,
                            0
                          )
                          .toLocaleString("id-ID")}
                      </td>
                    </tr>
                    {/* Total Kekurangan */}
                    <tr className="border-t bg-gray-300">
                      <td className="py-3 px-4 font-bold" colSpan={colSpan}>
                        Total Kekurangan
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {monthData.totalKekurangan.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
