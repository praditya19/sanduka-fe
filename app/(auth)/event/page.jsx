"use client";
import Header from "@/app/_components/Header";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_utils/GlobalApi";
import {
  Share2,
  Facebook,
  Send,
  X,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Event = () => {
  const router = useRouter();

  // --- STATE ---
  const [eventGalleries, setEventGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [userData, setUserData] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);

  // State UI
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchEventGalleries();
    fetchUserData();
    fetchEventParticipants();
  }, []);

  useEffect(() => {
    if (userData && eventParticipants.length > 0 && eventGalleries.length > 0) {
      const userNpa = userData.npaPgri;
      const newRegistrationStatus = {};

      eventGalleries.forEach((event) => {
        const isRegistered = eventParticipants.some(
          (participant) =>
            participant.npa === userNpa &&
            participant.namaEvent === event.namaEvent
        );
        newRegistrationStatus[event.id] = isRegistered ? "Sudah Terdaftar" : null;
      });
      setRegistrationStatus(newRegistrationStatus);
    }
  }, [userData, eventParticipants, eventGalleries]);

  const fetchEventGalleries = async () => {
    try {
      setIsLoading(true);
      
      // MENGGUNAKAN API ASLI
      const data = await GlobalApi.getSidebarGalleryByCategory("EVENT");

      const processedGalleries = await Promise.all(
        data.map(async (item) => {
          const blob = await fetch(`data:image/jpeg;base64,${item.photo}`).then(
            (r) => r.blob()
          );
          const objectUrl = URL.createObjectURL(blob);
          return { ...item, imageUrl: objectUrl };
        })
      );

      const sortedGalleries = [...processedGalleries].sort((a, b) => {
        const aTerlewat = !!a.isTerlewat;
        const bTerlewat = !!b.isTerlewat;
        if (aTerlewat !== bTerlewat) return aTerlewat ? 1 : -1;
        return Number(b.id) - Number(a.id);
      });

      setEventGalleries(sortedGalleries);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventParticipants = async () => {
    try {
      // MENGGUNAKAN API ASLI
      const participants = await GlobalApi.getAllPeserta();
      setEventParticipants(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const role = sessionStorage.getItem("role");
      const npa = sessionStorage.getItem("npa");

      if (userId) {
        let response;
        if (role === "ADMIN" || role === "SUPERADMIN") {
          if (npa) response = await GlobalApi.getUserByNpa(npa);
        } else if (role === "USER") {
          response = await GlobalApi.getUserById(userId);
        }
        if (response) setUserData(response);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // --- 2. LOGIKA ACTION ---
  const extractUrl = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s<>"']+)/;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const handleEventAction = (event) => {
    if (event?.isTerlewat || registrationStatus[event.id]) return;

    if (event?.deskripsi) {
      const url = extractUrl(event.deskripsi);
      if (url) {
        window.open(url, "_blank");
        return;
      }
    }
    router.push("/sign-in");
  };

  // --- 3. HELPER UI ---
  const stripHtml = (html) => {
    if (!html) return "";
    let str = String(html)
      .replace(/&amp;nbsp;/gi, " ")
      .replace(/&amp;quot;/gi, '"')
      .replace(/&amp;lt;/gi, "<")
      .replace(/&amp;gt;/gi, ">")
      .replace(/&amp;amp;/gi, "&");
    const tmp = document.createElement("DIV");
    tmp.innerHTML = str;
    const text = tmp.textContent || tmp.innerText || "";
    return text.replace(/&nbsp;?/gi, " ").replace(/\u00A0/g, " ");
  };

  const processHTML = (htmlContent) => {
    if (!htmlContent) return "";
    let str = String(htmlContent)
      .replace(/&amp;nbsp;/gi, " ")
      .replace(/&amp;quot;/gi, '"')
      .replace(/&amp;lt;/gi, "<")
      .replace(/&amp;gt;/gi, ">")
      .replace(/&amp;amp;/gi, "&");

    const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;
    return str.replace(urlRegex, (url) => {
      const href = url.startsWith("www.") ? `http://${url}` : url;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
    });
  };

  const handleShare = (event) => {
    const plainDesc = stripHtml(event.deskripsi);
    const shareData = {
      title: event.namaEvent,
      text: plainDesc,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error(err));
    } else {
      navigator.clipboard.writeText(`${event.namaEvent}\n\n${plainDesc}\n\n${window.location.href}`);
      alert("Link event berhasil disalin!");
    }
  };

  const getShareLinks = (event) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(event.namaEvent);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <style jsx>{`
        /* Custom Scrollbar untuk Detail Popup */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-6 py-10 pt-28">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#17a2b8] to-[#117a8b]">PGRI Jepara</span>
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Temukan dan ikuti berbagai kegiatan menarik untuk mengembangkan kompetensi dan jaringan Anda.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#17a2b8] to-[#117a8b] rounded-full mx-auto mt-6"></div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#17a2b8]"></div>
             </div>
        ) : eventGalleries.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                Belum ada event yang tersedia saat ini.
            </div>
        ) : (
            /* SECTION KATALOG EVENT (GRID LAYOUT) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {eventGalleries.map((event) => {
                const isTerlewat = !!event.isTerlewat;

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 relative border ${
                      isTerlewat
                        ? "border-gray-200 opacity-90 hover:opacity-100"
                        : "border-gray-100"
                    } group`}
                  >
                    {/* Badge Pojok Kanan Atas */}
                    <div
                      className={`absolute top-4 -right-10 ${
                        isTerlewat ? "bg-red-600" : "bg-gray-800"
                      } text-white text-[10px] font-bold px-10 py-1 transform flex items-center justify-center rotate-45 z-20 shadow-md tracking-wider`}
                    >
                      {isTerlewat ? "TERLAKSANA" : "KEGIATAN PGRI"}
                    </div>

                    {/* Image Container */}
                    <div 
                      className="relative w-full aspect-square bg-gray-200 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Image
                        src={event.imageUrl}
                        alt={event.namaEvent}
                        fill
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                          isTerlewat ? "filter grayscale-[25%]" : ""
                        }`}
                      />

                      {/* Overlay jika sudah terlaksana */}
                      {isTerlewat && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                          <span className="bg-red-600/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg border border-white/20">
                            Sudah Terlaksana
                          </span>
                        </div>
                      )}
                      
                      {/* Badge Terdaftar */}
                      {registrationStatus[event.id] && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-md z-20 flex items-center gap-1">
                          <FaCheckCircle size={12} /> TERDAFTAR
                        </div>
                      )}
                    </div>

                    {/* Blok Judul / Deskripsi Singkat */}
                    <div 
                      className={`${
                        isTerlewat ? "bg-slate-700" : "bg-[#17a2b8]"
                      } text-white p-4 flex-grow flex items-center justify-center cursor-pointer`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <h3 className="text-sm font-semibold text-center line-clamp-2 leading-snug">
                        {event.namaEvent}
                      </h3>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className={`w-full py-3 ${
                        isTerlewat
                          ? "bg-slate-800 hover:bg-slate-900"
                          : "bg-[#117a8b] hover:bg-[#0f6674]"
                      } text-white font-bold text-sm transition-colors flex items-center justify-center gap-2`}
                    >
                      {isTerlewat ? "Lihat Detail (Selesai)" : "Selengkapnya"}{" "}
                      <span className="text-lg leading-none">➔</span>
                    </button>
                  </div>
                );
              })}
            </div>
        )}
      </div>

      {/* --- POPUP DETAIL EVENT --- */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl z-[1001] w-full max-w-5xl mx-auto flex flex-col h-[90vh] lg:h-[85vh] overflow-hidden">
            
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-red-600 transition-colors bg-white/90 rounded-full p-1 shadow-md"
                aria-label="Close"
              >
                <FaTimesCircle size={32} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-full w-full">
                
                <div className="w-full lg:w-1/2 relative bg-[#0f172a] h-[250px] lg:h-full flex-none">
                     <Image
                        src={selectedEvent.imageUrl}
                        alt={selectedEvent.namaEvent}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                     />
                </div>

                <div className="w-full lg:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                     
                     {/* 1. SCROLLABLE CONTENT */}
                     <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar min-h-0">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedEvent.isTerlewat ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                              Sudah Terlaksana
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                              Event Aktif
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 pr-8 leading-tight">
                            {selectedEvent.namaEvent}
                        </h2>

                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>

                        {selectedEvent.isTerlewat && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
                            <FaTimesCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-sm">Event Sudah Terlaksana</p>
                              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                                Kegiatan ini telah selesai terlaksana, sehingga pendaftaran peserta sudah ditutup.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="prose max-w-none text-gray-700 pb-4">
                             <div dangerouslySetInnerHTML={{ __html: processHTML(selectedEvent.deskripsi) }} />
                        </div>
                     </div>

                     {/* 2. FIXED FOOTER */}
                     <div className="flex-none p-6 lg:p-8 border-t border-gray-100 bg-white z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                        {/* Share Icons */}
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                           <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Bagikan Event:</span>
                           <div className="flex gap-2">
                                <a href={getShareLinks(selectedEvent).facebook} target="_blank" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition shadow-sm"><Facebook size={18} /></a>
                                <a href={getShareLinks(selectedEvent).twitter} target="_blank" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition shadow-sm">𝕏</a>
                                <a href={getShareLinks(selectedEvent).whatsapp} target="_blank" className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition shadow-sm"><FontAwesomeIcon icon={faWhatsapp} size="lg" /></a>
                                <a href={getShareLinks(selectedEvent).telegram} target="_blank" className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition shadow-sm"><Send size={18} /></a>
                                <button onClick={() => handleShare(selectedEvent)} className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:scale-110 transition shadow-sm"><Share2 size={18} /></button>
                           </div>
                        </div>

                        {registrationStatus[selectedEvent.id] ? (
                            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <div className="inline-flex items-center gap-2 text-yellow-800 font-bold text-lg">
                                    <FaCheckCircle className="text-xl" />
                                    Sudah Terdaftar
                                </div>
                            </div>
                        ) : selectedEvent.isTerlewat ? (
                            <button
                                disabled
                                className="w-full py-4 bg-gray-400 text-white rounded-xl font-bold text-base shadow cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <FaTimesCircle /> Event Sudah Terlaksana (Pendaftaran Ditutup)
                            </button>
                        ) : (
                            <button
                                onClick={() => handleEventAction(selectedEvent)}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-200"
                            >
                                Daftar Event Sekarang
                            </button>
                        )}
                        {!registrationStatus[selectedEvent.id] && !selectedEvent.isTerlewat && !userData && (
                            <p className="text-xs text-center text-gray-500 mt-3">
                                Anda akan diarahkan ke halaman pendaftaran / login.
                            </p>
                        )}
                     </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;