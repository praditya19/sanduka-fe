"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Input } from "@/components/ui/input";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  // baru
  const [pesertaList, setPesertaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [queryCabang, setQueryCabang] = useState("");
  const [eventOptions, setEventOptions] = useState([]);
  const [eventParticipantCounts, setEventParticipantCounts] = useState({});
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedTahunDaftar, setSelectedTahunDaftar] = useState("");
  // end
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const router = useRouter();
  const { token } = useAuth();

  const dataPeserta = async (namaEvent = "", cabang = "") => {
    setLoading(true);

    try {
      const fetchedData = await GlobalApi.getAllDaftarPesertaEvent(
        namaEvent,
        cabang,
      );

      setPesertaList(fetchedData || []);
    } catch (err) {
      console.error("Error mengambil data peserta:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tahunDaftarOptions = [
    ...new Set(
      pesertaList.map((item) => item?.tanggalDaftar?.[0]).filter(Boolean),
    ),
  ].sort((a, b) => b - a);

  const getImageSrc = (base64) => {
    if (!base64) return null;
    return `data:image/jpeg;base64,${base64}`;
  };

  const getEventImageSrc = (event) => {
    if (event?.imageUrl) return event.imageUrl;
    if (!event?.photo) return null;

    return event.photo.startsWith("data:")
      ? event.photo
      : `data:image/jpeg;base64,${event.photo}`;
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    setLoadingDelete(true);

    try {
      await GlobalApi.deletePeserta(selectedId);

      await dataPeserta();
      await fetchEvent();

      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (err) {
      console.error("Gagal hapus:", err);
    } finally {
      setLoadingDelete(false);
    }
  };

  const fetchCabang = async () => {
    try {
      const res = await GlobalApi.getCabang();

      setCabangOptions(res?.data || []);
    } catch (err) {
      console.error("Gagal ambil cabang:", err);
    }
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan || "");
    setShowDropdownCabang(false);

    dataPeserta("", cabang.kecamatan || "");
  };

  const fetchEvent = async () => {
    try {
      const [eventResponse, participantResponse] = await Promise.all([
        GlobalApi.getSidebarGalleryByCategory("event"),
        GlobalApi.getAllDaftarPesertaEvent(),
      ]);

      const participantCounts = (participantResponse || []).reduce(
        (counts, participant) => {
          const eventName = participant?.namaEvent;
          if (eventName) {
            counts[eventName] = (counts[eventName] || 0) + 1;
          }
          return counts;
        },
        {},
      );

      const sortedEvents = (eventResponse || []).sort((a, b) => {
        const aTerlewat = !!a.isTerlewat;
        const bTerlewat = !!b.isTerlewat;
        if (aTerlewat !== bTerlewat) return aTerlewat ? 1 : -1;
        return Number(b.id) - Number(a.id);
      });

      setEventOptions(sortedEvents);
      setEventParticipantCounts(participantCounts);
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
    }
  };

  const filteredPesertaList = pesertaList.filter((item) => {
    if (!searchText.trim()) return true;

    const keyword = searchText.toLowerCase().trim();

    return Object.values(item).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(keyword),
    );
  });

  const handleDownloadPeserta = async () => {
    try {
      setLoading(true);

      let dataToDownload = [];

      if (!selectedEvent && !selectedCabang) {
        const res = await GlobalApi.getAllDaftarPesertaEvent();
        dataToDownload = res || [];
      } else {
        dataToDownload = pesertaList;
      }

      if (!dataToDownload.length) {
        alert("Data kosong!");
        return;
      }

      const formattedData = dataToDownload.map((item, index) => ({
        No: index + 1,
        Event: item.namaEvent || "-",
        "Nama Lengkap": item.namaLengkap || "-",
        "NPA PGRI": item.npa || "-",
        "Jenis Kelamin": item.jenisKelamin || "-",
        Cabang: item.cabang || "-",
        "Unit Kerja": item.unitKerja || "-",
        "Nomor HP": item.nomorHp || "-",
        "Tanggal Daftar": formatTanggalDaftar(item.tanggalDaftar),
        "File KTA": item.foto ? "Tersedia" : "-",
        "File Materi": item.upload ? "Tersedia" : "-",
      }));

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta");

      XLSX.writeFile(workbook, "Data_Peserta Event.xlsx");
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal download data!");
    } finally {
      setLoading(false);
    }
  };

  const formatTanggalDaftar = (tanggal) => {
    if (!tanggal || !Array.isArray(tanggal) || tanggal.length < 3) {
      return "-";
    }

    const [tahun, bulan, hari] = tanggal;

    return `${String(hari).padStart(2, "0")}-${String(bulan).padStart(2, "0")}-${tahun}`;
  };

  const handleDownloadFile = (base64, fileName = "dokumen") => {
    if (!base64) return;

    try {
      let base64Data = base64;
      let mimeType = "application/octet-stream";
      let extension = "bin";

      if (base64.includes(",")) {
        const parts = base64.split(",");
        const metadata = parts[0];
        base64Data = parts[1];

        const mimeMatch = metadata.match(/data:(.*?);base64/);

        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }

      if (base64Data.startsWith("/9j/")) {
        mimeType = "image/jpeg";
        extension = "jpg";
      } else if (base64Data.startsWith("iVBORw0KGgo")) {
        mimeType = "image/png";
        extension = "png";
      } else if (base64Data.startsWith("JVBERi0")) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (base64Data.startsWith("R0lGOD")) {
        mimeType = "image/gif";
        extension = "gif";
      } else if (base64Data.startsWith("UklGR")) {
        mimeType = "image/webp";
        extension = "webp";
      } else if (base64Data.startsWith("AAAAIGZ0eXBtcDQ")) {
        mimeType = "video/mp4";
        extension = "mp4";
      } else if (
        base64Data.startsWith("AAAAHGZ0eXBtcDQ") ||
        base64Data.startsWith("AAAAIGZ0eXBpc29t")
      ) {
        mimeType = "video/mp4";
        extension = "mp4";
      } else if (base64Data.startsWith("SUQz")) {
        mimeType = "audio/mpeg";
        extension = "mp3";
      } else if (base64Data.startsWith("UEsDB")) {
        mimeType = "application/vnd.openxmlformats-officedocument";
        extension = "zip";
      }

      const byteCharacters = atob(base64Data);

      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);

        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
      }

      const blob = new Blob(byteArrays, {
        type: mimeType,
      });

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `${fileName}.${extension}`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Gagal mendownload file:", error);
    }
  };

  const isLink = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(text);
  };

  const truncateWords = (text, maxWords = 44) => {
    if (!text) return "-";

    const words = text.split(" ");
    if (words.length <= maxWords) return text;

    return words.slice(0, maxWords).join(" ") + "...";
  };

  useEffect(() => {
    dataPeserta();
    fetchCabang();
    dataPeserta("", selectedCabang);
    fetchEvent();
  }, [selectedCabang]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#cabangInput")) {
        setShowDropdownCabang(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

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

  if (error) return <div>Error: {error}</div>;

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-4 md:p-6 pt-20 bg-gray-50 min-h-screen mt-12">
            {/* Header Section */}

            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      Manajemen Event
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Kelola data peserta event dengan mudah
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-full border border-teal-200 shadow-sm">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-semibold text-teal-700">
                      {eventOptions.length} Event Tersedia
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Daftar Event */}
            {eventOptions.length > 0 && (
              <section className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {eventOptions.map((event, index) => {
                    const isSelected = selectedEvent === event.namaEvent;

                    return (
                      <button
                        key={event.id || index}
                        type="button"
                        onClick={() => {
                          setSelectedEvent(event.namaEvent);
                          dataPeserta(event.namaEvent, selectedCabang);
                        }}
                        className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                          isSelected
                            ? "border-teal-500 ring-2 ring-teal-200"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        {/* Image Container dengan overlay gradient */}
                        <div className="relative h-36 bg-gradient-to-br from-teal-50 to-cyan-100 overflow-hidden">
                          {eventImage ? (
                            <>
                              <img
                                src={eventImage}
                                alt={event.namaEvent || "Gambar event"}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-14 w-14 text-teal-400 group-hover:text-teal-500 transition-colors duration-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}

                          {/* Badge Status */}
                          {isSelected && (
                            <div className="absolute right-2 top-2 z-10 animate-bounce-in">
                              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                Dipilih
                              </span>
                            </div>
                          )}

                          {/* Nomor Urut & Status */}
                          <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-xs font-bold text-white shadow-lg">
                              {index + 1}
                            </span>
                            {event.isTerlewat && (
                              <span className="px-2 py-1 rounded-full bg-red-600/90 backdrop-blur-sm text-[10px] font-bold text-white shadow-lg">
                                Terlaksana
                              </span>
                            )}
                          </div>

                          {/* Ikon Hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              {isSelected ? (
                                <svg
                                  className="h-6 w-6 text-teal-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-6 w-6 text-teal-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 relative">
                          {/* Garis dekoratif */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${isSelected ? "scale-x-100" : ""}`}
                          ></div>

                          <div className="flex items-center gap-1.5 mb-1.5">
                            {event.isTerlewat ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                Sudah Terlaksana
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200">
                                Event Aktif
                              </span>
                            )}
                          </div>

                          <h3 className="line-clamp-2 min-h-[2.8rem] text-sm font-bold leading-5 text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
                            {event.namaEvent || "Event tanpa nama"}
                          </h3>

                          <div className="mt-3 flex items-center justify-between border-t pt-2 border-gray-100">
                            <span className="text-xs text-gray-500 font-medium">
                              Total Peserta
                            </span>

                            <span className="text-sm font-bold text-teal-600">
                              {eventParticipantCounts[event.namaEvent] || 0}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter Cabang */}
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Pilih Cabang
                  </label>
                  <div className="relative">
                    <Input
                      id="cabangInput"
                      type="text"
                      className="border border-gray-200 rounded-xl p-3 w-full bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      placeholder={selectedCabang || "Tampil Semua"}
                      value={
                        sessionStorage.getItem("role") === "SUPERADMIN"
                          ? selectedCabang
                          : sessionStorage.getItem("cabang") || "Tampil Semua"
                      }
                      disabled={sessionStorage.getItem("role") !== "SUPERADMIN"}
                      readOnly={sessionStorage.getItem("role") !== "SUPERADMIN"}
                      onClick={() => {
                        if (sessionStorage.getItem("role") === "SUPERADMIN") {
                          setShowDropdownCabang(true);
                        }
                      }}
                    />
                    {!sessionStorage.getItem("role") === "SUPERADMIN" && (
                      <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {showDropdownCabang &&
                    sessionStorage.getItem("role") === "SUPERADMIN" && (
                      <div className="absolute z-10 border border-gray-200 rounded-xl bg-white shadow-lg mt-1 w-full overflow-hidden">
                        <ul className="max-h-60 overflow-y-auto">
                          <li className="py-2 px-3 border-b border-gray-100">
                            <Input
                              type="text"
                              className="border border-gray-200 rounded-lg p-2 w-full bg-gray-50 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                              placeholder="🔍 Cari Cabang..."
                              value={queryCabang}
                              onChange={(e) => setQueryCabang(e.target.value)}
                              autoFocus
                            />
                          </li>
                          <li
                            className="p-3 cursor-pointer hover:bg-teal-50 transition-colors duration-150 flex items-center gap-2"
                            onClick={() =>
                              handleCabangSelect({
                                kecamatan: "",
                                idKecamatan: null,
                              })
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-teal-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                              />
                            </svg>
                            Tampil Semua
                          </li>
                          {cabangOptions
                            .filter((cabang) =>
                              cabang.kecamatan
                                .toLowerCase()
                                .includes(queryCabang.toLowerCase()),
                            )
                            .map((cabang) => (
                              <li
                                key={cabang.idKecamatan}
                                className="p-3 cursor-pointer hover:bg-teal-50 transition-colors duration-150 flex items-center gap-2 border-t border-gray-50"
                                onClick={() => handleCabangSelect(cabang)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {cabang.kecamatan}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Filter Event */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Event
                  </label>

                  <select
                    value={selectedEvent}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedEvent(value);
                      dataPeserta(value, selectedCabang);
                    }}
                    className="border border-gray-200 rounded-xl p-3 w-full bg-gray-50 hover:bg-white transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 appearance-none cursor-pointer"
                  >
                    <option value="">📅 Tampil Semua Event</option>

                    {eventOptions.map((event, index) => (
                      <option key={event.id || index} value={event.namaEvent}>
                        {event.namaEvent}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Tanggal Daftar */}
                {/* <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Tanggal Daftar
                  </label>

                  <select
                    value={selectedTahunDaftar}
                    onChange={(e) => setSelectedTahunDaftar(e.target.value)}
                    className="border border-gray-200 rounded-xl p-3 w-full bg-gray-50 hover:bg-white transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 appearance-none cursor-pointer"
                  >
                    <option value="">📆 Semua Tahun</option>

                    {tahunDaftarOptions.map((tahun) => (
                      <option key={tahun} value={tahun}>
                        {tahun}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* Filter Cari */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-teal-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Cari Anggota
                  </label>

                  <div className="relative">
                    <input
                      id="searchInput"
                      type="text"
                      placeholder="Cari nama, NPA, cabang, nomor HP, dll..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="border border-gray-200 rounded-xl p-3 pl-10 w-full bg-gray-50 hover:bg-white transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                    />

                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Download Excel - Baris baru */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {pesertaList.length} Peserta Ditemukan
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Tombol Refresh */}
                  <button
                    onClick={() => {
                      setSearchText("");
                      setSelectedEvent("");
                      setSelectedCabang("");
                      dataPeserta("", "");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reset Filter
                  </button>

                  {/* Tombol Download Excel */}
                  <button
                    onClick={handleDownloadPeserta}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Excel
                    <span className="hidden sm:inline text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      .xlsx
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 bg-teal-100 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <p className="text-gray-500 mt-4 font-medium">
                    Memuat data peserta...
                  </p>
                </div>
              ) : filteredPesertaList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <p className="text-gray-500 text-lg font-medium">
                    Tidak ada data peserta
                  </p>

                  <p className="text-gray-400 text-sm mt-1">
                    {searchText
                      ? `Tidak ditemukan data dengan kata kunci "${searchText}"`
                      : "Silakan coba filter yang berbeda"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                          <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tl-xl">
                            No
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                            Event
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                            Data
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                            Cabang
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider">
                            TGL Daftar
                          </th>
                          <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider">
                            File KTA
                          </th>
                          <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider">
                            Materi
                          </th>
                          <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider">
                            Keterangan
                          </th>
                          <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPesertaList.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-teal-50/30 transition-colors duration-150 group"
                          >
                            {/* No */}
                            <td className="py-4 px-4 text-center">
                              <span className="bg-gray-100 text-gray-700 font-semibold text-sm px-3 py-1 rounded-full group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                                {index + 1}
                              </span>
                            </td>

                            {/* Event */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="bg-teal-100 p-2 rounded-lg"></div>
                                <span className="font-medium text-gray-800">
                                  {item.namaEvent || "-"}
                                </span>
                              </div>
                            </td>

                            {/* Nama Lengkap */}
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  <span className="font-semibold text-gray-800">
                                    {item.namaLengkap || "-"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    NPA: {item.npa || "-"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    JK: {item.jenisKelamin || "-"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    HP: {item.nomorHp || "-"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Cabang */}
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  <span className="font-medium text-gray-800">
                                    {item.cabang || "-"}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 pl-6">
                                  {item.unitKerja || "-"}
                                </div>
                              </div>
                            </td>

                            {/* TGL Daftar */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {formatTanggalDaftar(item?.tanggalDaftar)}
                                </span>
                              </div>
                            </td>

                            {/* File KTA */}
                            <td className="py-4 px-4 text-center">
                              {item.foto ? (
                                <div className="flex flex-col items-center gap-2">
                                  {/* Preview Gambar */}
                                  <img
                                    src={getImageSrc(item.foto)}
                                    alt="Foto Peserta"
                                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition"
                                  />

                                  {/* Tombol Download */}
                                  <a
                                    href={getImageSrc(item.foto)}
                                    download={`foto-${item.nama || "peserta"}.jpg`}
                                    className="text-teal-600 hover:text-teal-800 text-sm underline"
                                  >
                                    Download
                                  </a>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* File Materi */}
                            <td className="py-4 px-4 text-center">
                              {item.upload ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadFile(
                                      item.upload,
                                      `dokumen-${item.namaLengkap || "peserta"}`,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium hover:underline transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  Download
                                </button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                {/* TEXT / LINK */}
                                {item.jabatan ? (
                                  isLink(item.jabatan) ? (
                                    <a
                                      href={item.jabatan}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline break-words"
                                    >
                                      {expandedIndex === index
                                        ? item.jabatan
                                        : truncateWords(item.jabatan)}
                                    </a>
                                  ) : (
                                    <span className="text-gray-800 break-words">
                                      {expandedIndex === index
                                        ? item.jabatan
                                        : truncateWords(item.jabatan)}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}

                                {/* BUTTON LIHAT LEBIH BANYAK */}
                                {item.jabatan &&
                                  item.jabatan.split(" ").length > 20 && (
                                    <button
                                      onClick={() =>
                                        setExpandedIndex(
                                          expandedIndex === index
                                            ? null
                                            : index,
                                        )
                                      }
                                      className="text-sm text-teal-600 hover:underline text-left"
                                    >
                                      {expandedIndex === index
                                        ? "Lihat lebih sedikit"
                                        : "Lihat lebih banyak"}
                                    </button>
                                  )}
                              </div>
                            </td>

                            {/* Aksi */}
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleDeleteClick(item.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group relative"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>

                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Hapus
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                          Konfirmasi Hapus
                        </h2>

                        <p className="text-gray-600 mb-6">
                          Apakah Anda ingin menghapus data ini?
                        </p>

                        <div className="flex justify-end gap-3">
                          {/* Tidak */}
                          <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                          >
                            Tidak
                          </button>

                          {/* Iya */}
                          <button
                            onClick={handleConfirmDelete}
                            disabled={loadingDelete}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {loadingDelete ? "Menghapus..." : "Iya"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
