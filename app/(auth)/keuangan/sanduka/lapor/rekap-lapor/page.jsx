"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";

const data = [
  {
    id: 1,
    dateLapor: "10:57:25am, Jumat, 28/10/2022",
    pelapor: "ZAKARIA",
    nik: "12320800057",
    dataMeninggal: "Suryawan Adi Wibowo",
    detail:
      "Jepara, 17-06-1984\n 45 Tahun\n SMAN 1 TAHUNAN\n Demaan RT 01/RW 01 Jepara",
    cabang: "JEPARA",
    keterangan: "Meninggal hari, Selasa, 20-09-2022, Meninggal sakit Jantung",
    diterimakan: "Rabu, 19/10/2022 Istri Almarhu\nSebesar Rp.2.500.000",
  },
  {
    id: 2,
    dateLapor: "10:57:25am, Jumat, 28/10/2022",
    pelapor: "ZAKARIA",
    nik: "12320800057",
    dataMeninggal: "Suarto",
    detail:
      "Jepara, 17-06-1984\n 45 Tahun\n SMAN 1 TAHUNAN\n Demaan RT 01/RW 01 Jepara",
    cabang: "JEPARA",
    keterangan: "Meninggal hari, Selasa, 20-09-2022, Meninggal sakit Jantung",
    diterimakan: "Rabu, 19/10/2022 Istri Almarhu\nSebesar Rp.2.500.000",
  },
  {
    id: 3,
    dateLapor: "10:57:25am, Jumat, 28/10/2022",
    pelapor: "ZAKARIA",
    nik: "12320800057",
    dataMeninggal: "Santoso",
    detail:
      "Jepara, 17-06-1984\n 45 Tahun\n SMAN 1 TAHUNAN\n Demaan RT 01/RW 01 Jepara",
    cabang: "JEPARA",
    keterangan: "Meninggal hari, Selasa, 20-09-2022, Meninggal sakit Jantung",
    diterimakan: "",
  },
];

const Page = () => {
  const [filter, setFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filteredData = data.filter((item) => {
    if (filter === "Belum") {
      return !item.diterimakan;
    } else if (filter === "Sudah") {
      return item.diterimakan;
    } else {
      return true;
    }
  });

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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
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
              <h1 className="text-base">Rekap Lapor Sanduka</h1>
            </div>
          </div>
        </header>
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="bg-teal-700 p-4 flex flex-col sm:flex-row items-center justify-between mt-5">
              <h1 className="text-white font-bold mb-4 sm:mb-0">
                REKAP LAPOR SANDUKA
              </h1>
              <div className="flex items-end ml-auto sm:hidden">
                <button onClick={toggleFilters} className="text-white">
                  <FontAwesomeIcon icon={faFilter} size="lg" />
                </button>
              </div>
              <div
                className={` top-0 right-0 w-64 bg-teal-700 p-4 space-y-2 sm:space-y-0 sm:space-x-2 items-center sm:flex ${
                  showFilters ? "block" : "hidden"
                } sm:relative sm:w-auto sm:p-0 sm:bg-transparent`}
              >
                <select className="bg-white p-2 rounded border w-full sm:w-auto">
                  <option>-- Cabang --</option>
                </select>
                <select className="bg-white p-2 rounded border w-full sm:w-auto">
                  <option>-- Bulan --</option>
                </select>
                <select className="bg-white p-2 rounded border w-full sm:w-auto">
                  <option>-- Tahun --</option>
                </select>
                <select
                  className="bg-white p-2 rounded border w-full sm:w-auto"
                  value={filter}
                  onChange={handleFilterChange}
                >
                  <option value="">-- Status --</option>
                  <option value="Belum">Belum</option>
                  <option value="Sudah">Terima</option>
                </select>
                <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full sm:w-auto">
                  Cetak
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="py-2 px-3 text-center">No</th>
                    <th className="py-2 px-3 text-center">Date lapor</th>
                    <th className="py-2 px-3 text-center">
                      Data Meninggal Belum
                    </th>
                    <th className="py-2 px-3 text-center">Cabang</th>
                    <th className="py-2 px-3 text-center">Keterangan</th>
                    <th className="py-2 px-3 text-center">Diterimakan</th>
                    <th className="py-2 px-3 text-center">Action</th>
                    <th className="py-2 px-3 text-center">Bukti</th>
                    <th className="py-2 px-3 text-center">Kwitansi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-2 px-3 text-center">{index + 1}</td>
                      <td className="py-2 px-3 ">
                        {item.dateLapor}
                        <br />
                        {item.pelapor}
                        <br />
                        {item.nik}
                      </td>
                      <td className="py-2 px-3 ">
                        {item.dataMeninggal}
                        <br />
                        {item.detail}
                      </td>
                      <td className="py-2 px-3 text-center">{item.cabang}</td>
                      <td className="py-2 px-3 text-center">
                        {item.keterangan}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.diterimakan}
                      </td>
                      <td className="py-2 px-3 ">
                        <button className="bg-blue-500 text-white p-2 rounded mb-2">
                          Kwitansi
                        </button>
                        <button className="bg-blue-500 text-white p-2 rounded">
                          Edit
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button className="bg-gray-200 p-2 rounded border">
                          View
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="file"
                          className="hidden"
                          id={`file-upload-${item.id}`}
                        />
                        <label
                          htmlFor={`file-upload-${item.id}`}
                          className="bg-green-500 text-white p-2 rounded cursor-pointer"
                        >
                          Browse...
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
