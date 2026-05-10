"use client";
import { useState, useEffect, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const TemanUnitKerja = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [cardsData, setCardsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropdownUnit, setShowDropdownUnit] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [queryUnit, setQueryUnit] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");
  
  // STATE BARU UNTUK ZOOM FOTO
  const [zoomedImage, setZoomedImage] = useState(null); 

  const [role, setRole] = useState(null);

  const fetchTemanUnitKerja = async () => {
    try {
      setLoading(true);

      const unitKerja = sessionStorage.getItem("unitKerja");

      if (!unitKerja) {
        console.error("unitKerja is not available in sessionStorage.");
        return;
      }

      console.log("Fetched unitKerja from sessionStorage:", unitKerja);

      const result = await GlobalApi.getTemanUnitKerja(
        unitKerja,
        currentPage - 1,
        itemsPerPage
      );

      setCardsData(result.content || []);
      setTotalPages(result.totalPages || 0);
      const fotoBase64Array = result.content.map((item) => {
        if (item.foto) {
          try {
            return atob(item.foto);
          } catch (error) {
            console.error("Error decoding Base64 for item:", item, error);
            return null;
          }
        }
        return null;
      });

      setFotoBase64(fotoBase64Array);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemanUnitKerja();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem("role");
    setRole(userRole);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      const fetchData = async () => {
        try {
          const unitKerjaResponse = await GlobalApi.getUnitKerja();
          setUnitKerjaOptions(unitKerjaResponse.data);

          const cabangFromStorage = sessionStorage.getItem("cabang");

          if (cabangFromStorage === "KABUPATEN") {
            setFilteredUnitKerja(unitKerjaResponse.data);
          } else if (cabangFromStorage) {
            const filteredUnits = unitKerjaResponse.data.filter(
              (unit) => unit.cabang === cabangFromStorage
            );
            setFilteredUnitKerja(filteredUnits);
          } else {
            setFilteredUnitKerja(unitKerjaResponse.data);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [token, router, unitKerjaOptions]);

  const handleUnitKerjaChange = async (selectedUnitKerja) => {
    console.log("Unit Kerja yang dipilih:", selectedUnitKerja);

    sessionStorage.setItem("unitKerja", selectedUnitKerja);
    await fetchTemanUnitKerja(selectedUnitKerja);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(cardsData)
    ? cardsData.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

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
          <div className="min-h-screen flex flex-col justify-start bg-gray-300 pt-4 px-4">
            <div
              className={`w-1/6 flex flex-col items-start mt-12 ${
                role === "USER" ? "hidden" : ""
              }`}
            >
              <Label className="block text-sm font-medium mb-1">
                Unit Kerja
              </Label>
              <Input
                type="text"
                className="border rounded-lg p-2 w-full bg-white shadow-sm"
                placeholder="Pilih Unit Kerja"
                value={queryUnit}
                readOnly
                onChange={(e) => setQueryUnit(e.target.value)}
                onClick={() => {
                  setQueryUnit("");
                  setShowDropdownUnit(true);
                }}
              />

              {showDropdownUnit && filteredUnitKerja.length > 0 && (
                <div
                  className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[4.5%] w-1/6"
                  id="dropdownUnit"
                >
                  <ul className="max-h-44 overflow-y-auto">
                    <li className="py-2 px-2">
                      <Input
                        id="searchInput"
                        type="text"
                        className="border-b p-2 w-full bg-white mb-1"
                        placeholder="Cari Unit Kerja..."
                        value={queryUnit}
                        onChange={(e) => setQueryUnit(e.target.value)}
                        autoFocus
                      />
                    </li>
                    <li
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setShowDropdownUnit(false);
                      }}
                    >
                      Pilih Unit Kerja
                    </li>
                    {filteredUnitKerja
                      .filter((unit) =>
                        unit.unitKerja
                          .toLowerCase()
                          .includes(queryUnit.toLowerCase())
                      )
                      .map((unit) => (
                        <li
                          key={unit.id}
                          value={unit.unitKerja}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={async () => {
                            setQueryUnit(unit.unitKerja);
                            await handleUnitKerjaChange(unit.unitKerja);
                            setShowDropdownUnit(false);
                          }}
                        >
                          {unit.unitKerja}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${
                role === "USER" ? "mt-12" : "mt-4"
              } `}
            >
              {loading ? (
                <div className="flex justify-center items-center w-full col-span-4">
                  <ClipLoader color="#3498db" size={50} />
                </div>
              ) : (
                cardsData.map((data, index) => {
                  const fotoFromState = fotoBase64[index];
                  const base64Image = fotoFromState
                    ? `data:image/jpeg;base64,${fotoFromState}`
                    : profileImageUrl;

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
                        <div className="flex-shrink-0 w-1/3 flex justify-center self-start">
                          {/* PERBAIKAN: Menambahkan div wrapper untuk trigger zoom */}
                          <div 
                            className="cursor-pointer hover:opacity-80 transition-opacity rounded-md overflow-hidden shadow-sm border-2 border-gray-200 w-[80px] h-[80px] flex items-center justify-center"
                            onClick={() => setZoomedImage(base64Image)}
                          >
                            <Image
                              src={base64Image}
                              width={80}
                              height={80}
                              alt={
                                fotoFromState
                                  ? "Anggota Foto"
                                  : `Fallback Image: ${profileImageUrl}`
                              }
                              className="object-cover w-full h-full"
                            />
                          </div>
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
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 text-gray-800 text-sm">
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">Daspen:</span>
                            <span className="mt-1">
                              {data.pesertaDaspen ? (
                                <span className="bg-green-500 text-white px-2 py-1 rounded">
                                  Terdaftar
                                </span>
                              ) : (
                                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                                  Belum Terdaftar
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">KTA Digital:</span>
                            <span className="mt-1">
                              {data.pesertaKtaDigital ? (
                                <span className="bg-green-500 text-white px-2 py-1 rounded ml-1">
                                  Terdaftar
                                </span>
                              ) : (
                                <span className="bg-red-500 text-white px-2 py-1 rounded">
                                  Belum Terdaftar
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">Sanduka:</span>
                            <span className="mt-1">
                              {data.pesertaSanduka ? (
                                <span className="bg-green-500 text-white px-2 py-1 rounded">
                                  Terdaftar
                                </span>
                              ) : (
                                <span className="bg-red-500 text-white px-2 py-1 rounded">
                                  Belum Terdaftar
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <ul className="flex mt-4 space-x-2 justify-center pb-8">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg shadow-md ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition duration-300"
                  }`}
                >
                  Previous
                </button>
              </li>
              {(() => {
                const maxVisible = 3;
                const startPage = Math.max(
                  1,
                  currentPage - Math.floor(maxVisible / 2)
                );
                const endPage = Math.min(
                  totalPages,
                  startPage + maxVisible - 1
                );

                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                return pages.map((page) => (
                  <li key={page}>
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-full shadow-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition duration-300"
                      }`}
                    >
                      {page}
                    </button>
                  </li>
                ));
              })()}
              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg shadow-md ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition duration-300"
                  }`}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* POPUP ZOOM GAMBAR */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative flex flex-col items-center animate-in zoom-in duration-200">
            <button
              className="absolute -top-3 -right-3 bg-white text-gray-600 hover:text-red-500 hover:bg-gray-100 shadow-md rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold z-50 border border-gray-200 transition-colors"
              onClick={() => setZoomedImage(null)}
            >
              &times;
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed Profil"
              className="max-w-[250px] md:max-w-[400px] max-h-[85vh] object-contain rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default TemanUnitKerja;