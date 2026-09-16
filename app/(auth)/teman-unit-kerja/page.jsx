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
      const cabang = sessionStorage.getItem("cabang");

      if (!unitKerja) {
        console.error("unitKerja is not available in sessionStorage.");
        return;
      }

      const result = await GlobalApi.getTemanUnitKerja(
        unitKerja,
        cabang,
        currentPage - 1,
        itemsPerPage,
      );
      const activeMembers = (result.content || []).filter(
        (item) => item.statusKeanggotaan === "Aktif",
      );
      setCardsData(activeMembers);
      setTotalPages(result.totalPages || 0);
      const fotoBase64Array = activeMembers.map((item) => {
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
              (unit) => unit.cabang === cabangFromStorage,
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
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
            {/* Container utama */}
            <div className="flex-1 w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* ====== SEARCH UNIT KERJA ====== */}
              {role !== "USER" && (
                <div className="relative w-full sm:w-80 mb-6">
                  <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Unit Kerja
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 bg-white shadow-sm 
                       focus:ring-2 focus:ring-teal-500 focus:border-teal-500 
                       transition-all duration-200 cursor-pointer"
                      placeholder="Pilih Unit Kerja"
                      value={queryUnit}
                      readOnly
                      onChange={(e) => setQueryUnit(e.target.value)}
                      onClick={() => {
                        setQueryUnit("");
                        setShowDropdownUnit(true);
                      }}
                    />
                    {/* Ikon search */}
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                      />
                    </svg>
                  </div>

                  {showDropdownUnit && filteredUnitKerja.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <Input
                          id="searchInput"
                          type="text"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm 
                           focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Cari Unit Kerja..."
                          value={queryUnit}
                          onChange={(e) => setQueryUnit(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <ul className="max-h-60 overflow-y-auto">
                        <li
                          className="px-4 py-2 text-sm text-gray-500 italic cursor-pointer hover:bg-gray-50"
                          onClick={() => setShowDropdownUnit(false)}
                        >
                          Pilih Unit Kerja
                        </li>
                        {filteredUnitKerja
                          .filter((unit) =>
                            unit.unitKerja
                              .toLowerCase()
                              .includes(queryUnit.toLowerCase()),
                          )
                          .sort((a, b) =>
                            a.unitKerja.localeCompare(b.unitKerja, "id"),
                          )
                          .map((unit) => (
                            <li
                              key={unit.id}
                              className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer 
                               hover:bg-teal-50 hover:text-teal-700 transition-colors"
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
              )}

              {/* ====== GRID CARD ====== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {loading
                  ? // Skeleton loading
                    Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl shadow-sm p-4 animate-pulse"
                      >
                        <div className="h-16 bg-gray-200 rounded-xl mb-4" />
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="h-8 bg-gray-200 rounded" />
                          <div className="h-8 bg-gray-200 rounded" />
                          <div className="h-8 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))
                  : cardsData.map((data, index) => {
                      const fotoFromState = fotoBase64[index];
                      const base64Image = fotoFromState
                        ? `data:image/jpeg;base64,${fotoFromState}`
                        : profileImageUrl;

                      return (
                        <div
                          key={index}
                          className="group bg-white rounded-2xl shadow-md hover:shadow-2xl 
                         border border-gray-100 overflow-hidden 
                         transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Header gradient */}
                          <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3">
                            <h2 className="text-sm font-bold text-white truncate">
                              {data.namaLengkap}
                            </h2>
                            <p className="text-xs text-teal-50 mt-0.5">
                              {data.npaPgri}
                            </p>
                            {/* Dekorasi bulat */}
                            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                            <div className="absolute -right-1 top-6 w-8 h-8 rounded-full bg-white/10" />
                          </div>

                          {/* Body */}
                          <div className="p-4">
                            <div className="flex gap-3">
                              {/* Foto */}
                              <div className="flex-shrink-0">
                                <div
                                  className="cursor-pointer rounded-xl overflow-hidden 
                                 ring-2 ring-teal-100 group-hover:ring-teal-300 
                                 transition-all duration-300 shadow-sm
                                 w-[80px] h-[80px]"
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
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-start gap-2 text-gray-700 text-xs">
                                  <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="text-teal-500 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="truncate">
                                    {formatDate(data.tanggalLahir)}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2 text-gray-700 text-xs">
                                  <FontAwesomeIcon
                                    icon={faUserTie}
                                    className="text-teal-500 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="truncate">
                                    {data.jabatan}
                                  </span>
                                </div>
                                <div className="flex items-start gap-2 text-gray-700 text-xs">
                                  <FontAwesomeIcon
                                    icon={faHome}
                                    className="text-teal-500 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="line-clamp-2">
                                    {data.alamat}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <StatusBadge
                                  label="Daspen"
                                  active={data.pesertaDaspen}
                                />
                                <StatusBadge
                                  label="KTA Digital"
                                  active={data.pesertaKtaDigital}
                                />
                                <StatusBadge
                                  label="Sanduka"
                                  active={data.pesertaSanduka}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>

              {/* ====== PAGINATION ====== */}
              <ul className="flex flex-wrap items-center justify-center gap-2 mt-8 pb-4">
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-medium shadow-sm 
            transition-all duration-200
            ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-teal-600 hover:bg-teal-600 hover:text-white hover:shadow-md"
            }`}
                  >
                    ← Prev
                  </button>
                </li>

                {(() => {
                  const maxVisible = 3;
                  const startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2),
                  );
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisible - 1,
                  );

                  const pages = [];
                  for (let i = startPage; i <= endPage; i++) pages.push(i);

                  return pages.map((page) => (
                    <li key={page}>
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold shadow-sm 
                transition-all duration-200
                ${
                  currentPage === page
                    ? "bg-teal-600 text-white shadow-md scale-105"
                    : "bg-white text-teal-600 hover:bg-teal-50"
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium shadow-sm 
            transition-all duration-200
            ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-teal-600 hover:bg-teal-600 hover:text-white hover:shadow-md"
            }`}
                  >
                    Next →
                  </button>
                </li>
              </ul>
            </div>
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

function StatusBadge({ label, active }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full 
          text-[10px] font-semibold
          ${
            active
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            active ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
        {active ? "Terdaftar" : "Belum"}
      </span>
    </div>
  );
}
export default TemanUnitKerja;
