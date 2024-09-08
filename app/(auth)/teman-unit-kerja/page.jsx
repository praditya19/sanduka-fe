"use client";
import { useState, useEffect } from "react";
import {
  faCalendarAlt,
  faUserTie,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderHome from "@/app/_components/HeaderHome";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";

const TemanUnitKerja = () => {
  const cardsData = [
    {
      foto: "/sanduka.png",
      name: "HABIB NOR HAQIQI",
      npaNip: "0001146804614",
      tanggalLahir: "01-01-2000",
      jabatan: "Guru",
      alamatRumah: "Jl. Mawar No. 1",
    },
    {
      foto: "/sanduka.png",
      name: "MUHAMMAD ALFARIZA HAQIQI",
      npaNip: "0001190472939",
      tanggalLahir: "02-02-2001",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
    },
    {
      foto: "/sanduka.png",
      name: "SHAKILA NAHDA HAQIQI",
      npaNip: "0001908279055",
      tanggalLahir: "03-03-2002",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
    },
    {
      foto: "/sanduka.png",
      name: "HABIB NOR HAQIQI",
      npaNip: "0001146804614",
      tanggalLahir: "01-01-2000",
      jabatan: "Guru",
      alamatRumah: "Jl. Mawar No. 1",
    },
    {
      foto: "/sanduka.png",
      name: "MUHAMMAD ALFARIZA HAQIQI",
      npaNip: "0001190472939",
      tanggalLahir: "02-02-2001",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
    },
    {
      foto: "/sanduka.png",
      name: "SHAKILA NAHDA HAQIQI",
      npaNip: "0001908279055",
      tanggalLahir: "03-03-2002",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
    },
    {
      foto: "/sanduka.png",
      name: "HABIB NOR HAQIQI",
      npaNip: "0001146804614",
      tanggalLahir: "01-01-2000",
      jabatan: "Guru",
      alamatRumah: "Jl. Mawar No. 1",
    },
    {
      foto: "/sanduka.png",
      name: "MUHAMMAD ALFARIZA HAQIQI",
      npaNip: "0001190472939",
      tanggalLahir: "02-02-2001",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
    },
    {
      foto: "/sanduka.png",
      name: "SHAKILA NAHDA HAQIQI",
      npaNip: "0001908279055",
      tanggalLahir: "03-03-2002",
      jabatan: "Guru",
      alamatRumah: "Jl. Melati No. 2",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleClick = (event, pageNumber) => {
    event.preventDefault();
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(cardsData.length / itemsPerPage); i++) {
      pageNumbers.push(
        <li key={i}>
          <a
            href="#"
            onClick={(event) => handleClick(event, i)}
            className={`px-3 py-1 rounded-full shadow-md ${
              currentPage === i
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition duration-300"
            }`}
          >
            {i}
          </a>
        </li>
      );
    }
    return pageNumbers;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cardsData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-gray-100">
        {isMobile ? (
        <HeaderMobile />
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
          <div className="min-h-screen flex flex-col items-center justify-start bg-gray-300 pt-4 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
              {currentItems.map((data, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-4 flex items-start border border-gray-200"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center border-2 border-blue-500 overflow-hidden">
                      <Image
                        src={data.foto}
                        width={50}
                        height={50}
                        alt="Anggota Foto"
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <h2 className="text-xs font-semibold text-gray-800">
                      {data.name}
                    </h2>
                    <p className="text-gray-600 text-xs mb-2">{data.npaNip}</p>
                    <div className="flex items-center text-gray-800 text-sm mb-1">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-gray-600"
                      />
                      <span className="ml-2">{data.tanggalLahir}</span>
                    </div>
                    <div className="flex items-center text-gray-800 text-sm mb-1">
                      <FontAwesomeIcon
                        icon={faUserTie}
                        className="text-gray-600"
                      />
                      <span className="ml-2">{data.jabatan}</span>
                    </div>
                    <div className="flex items-center text-gray-800 text-sm">
                      <FontAwesomeIcon
                        icon={faHome}
                        className="text-gray-600"
                      />
                      <span className="ml-2">{data.alamatRumah}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ul className="flex mt-4 space-x-2">
              {currentPage > 1 && (
                <li>
                  <a
                    href="#"
                    onClick={(event) => handleClick(event, currentPage - 1)}
                    className="px-2 py-1 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition duration-300"
                  >
                    &lt;
                  </a>
                </li>
              )}
              {renderPageNumbers()}
              {currentPage < Math.ceil(cardsData.length / itemsPerPage) && (
                <li>
                  <a
                    href="#"
                    onClick={(event) => handleClick(event, currentPage + 1)}
                    className="px-2 py-1 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition duration-300"
                  >
                    &gt;
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemanUnitKerja;