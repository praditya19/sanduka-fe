"use client";
import { useState, useEffect } from "react";
import {
  faCalendarAlt,
  faUserTie,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const TemanUnitKerja = () => {
  const [cardsData, setCardsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unitKerja, setUnitKerja] = useState("");

  useEffect(() => {
    const storedUnitKerja = sessionStorage.getItem("unitKerja");
    setUnitKerja(storedUnitKerja);

    if (storedUnitKerja) {
      fetchTemanUnitKerja(storedUnitKerja);
    }
  }, [currentPage]);

  const fetchTemanUnitKerja = async (unitKerja) => {
    try {
      const result = await GlobalApi.getTemanUnitKerja(
        unitKerja,
        currentPage - 1,
        itemsPerPage
      );
      console.log("Fetched Data:", result.content);
      setCardsData(result.content);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  const profileImageUrl = "/profile.png";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="min-h-screen flex flex-col items-center justify-start bg-gray-300 pt-4 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
              {currentItems.map((data, index) => {
                const base64Image = data.foto
                  ? `data:image/jpeg;base64,${data.foto}`
                  : profileImageUrl;
                const imageAlt = data.foto
                  ? "Anggota Foto"
                  : `Fallback Image: ${profileImageUrl}`;

                const renderResponseIcon = (response) => {
                  if (response === "Ya") {
                    return <span className="text-green-500">✔</span>;
                  } else {
                    return <span className="text-red-500">✘</span>;
                  }
                };

                return (
                  <div
                    key={index}
                    className="bg-white items-center rounded-lg shadow-lg p-3 border border-gray-200 w-full hover:shadow-xl transition duration-300 ease-in-out"
                  >
                    <div className="bg-teal-500 text-white p-2 rounded-t-lg mb-4 w-full">
                      <h2 className="text-sm font-semibold w-full">
                        {data.namaLengkap}
                      </h2>
                      <p className="text-xs w-full">{data.npaPgri}</p>
                    </div>

                    <div className="flex w-full items-center">
                      <div className="flex-shrink-0 w-1/3 flex justify-center">
                        <Image
                          src={base64Image}
                          width={80}
                          height={80}
                          alt={imageAlt}
                          className="rounded-full border-2 border-gray-200 max-w-[80px] max-h-[80px]"
                        />
                      </div>

                      <div className="ml-2 w-2/3">
                        <div className="flex items-center text-gray-800 text-sm mb-1">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="text-gray-600"
                          />
                          <span className="ml-2">
                            {formatDate(data.tanggalLahir)}
                          </span>
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
                          <span className="ml-2">{data.alamat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 justify-items-center">
                      <div className="flex items-center text-gray-800 text-sm space-x-6">
                        <div className="flex items-center">
                          <span className="font-semibold">Daspen:</span>
                          <span className="ml-2">
                            {renderResponseIcon(data.pesertaDaspen)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold">KTA Digital:</span>
                          <span className="ml-2">
                            {renderResponseIcon(data.pesertaKtaDigital)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold">Sanduka:</span>
                          <span className="ml-2">
                            {renderResponseIcon(data.pesertaSanduka)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
