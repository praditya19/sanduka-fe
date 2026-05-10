"use client";
import React, { useState, useEffect, useRef } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Building, Users, Loader2, X } from "lucide-react";

// Komponen marquee yang menghitung duplikasi secara dinamis
const InfiniteMarquee = ({ items, renderItem, speed = 40 }) => {
  const containerRef = useRef(null);
  const [copies, setCopies] = useState(4);

  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      // Lebar 1 item = w-32 (128px) + mx-4 (32px) = 160px
      const itemWidth = 160;
      const singleSetWidth = items.length * itemWidth;
      if (singleSetWidth === 0) return;
      // Pastikan total track minimal 3x lebar container
      const needed = Math.ceil((containerWidth * 3) / singleSetWidth) + 1;
      setCopies(Math.max(needed, 2));
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [items]);

  const totalItems = copies * items.length;
  // Durasi proporsional: makin banyak item makin lama agar kecepatan konsisten
  const duration = (totalItems * 160) / speed;

  return (
    <div ref={containerRef} className="overflow-hidden w-full">
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-${items.length} * 160px)); }
        }
        .marquee-inner {
          display: flex;
          width: max-content;
          animation: marquee-scroll ${duration}s linear infinite;
          will-change: transform;
        }
        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-inner">
        {Array.from({ length: copies }).flatMap((_, gi) =>
          items.map((item, idx) => renderItem(item, `${gi}-${idx}`))
        )}
      </div>
    </div>
  );
};

const LembagaDisplay = () => {
  const profileImageUrl = "/profile.png";

  const [lembagaData, setLembagaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENGURUS KABUPATEN");
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchLembaga();
  }, []);

  const fetchLembaga = async () => {
    setLoading(true);
    try {
      const response = await GlobalApi.getAllLembaga(0, 100, "id", "desc");
      setLembagaData(response.content || []);
    } catch (error) {
      console.error("Gagal mengambil data lembaga:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderImageBase64 = (byteData) => {
    if (!byteData) return null;
    if (typeof byteData === "string" && byteData.startsWith("data:image")) return byteData;
    return `data:image/jpeg;base64,${byteData}`;
  };

  const filteredLembaga = lembagaData.filter(
    (item) => item.jenisLembaga === activeTab
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex flex-col md:flex-row items-center justify-center gap-4 leading-snug max-w-4xl mx-auto">
            <div className="bg-indigo-50 p-3 rounded-2xl flex-shrink-0">
              <Building className="text-indigo-600 w-8 h-8 md:w-10 md:h-10" />
            </div>
            <span>
              Susunan Pengurus PGRI Kabupaten Jepara, <br className="hidden md:block" /> Lembaga serta Badan Khusus
            </span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto mt-2">
            Kenali lebih dekat berbagai lembaga yang berada di bawah naungan PGRI beserta susunan kepengurusannya.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 inline-flex gap-2 p-2">
            <button
              onClick={() => setActiveTab("PENGURUS KABUPATEN")}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "PENGURUS KABUPATEN"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              PENGURUS KABUPATEN
            </button>
            <button
              onClick={() => setActiveTab("PENGURUS CABANG")}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "PENGURUS CABANG"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              PENGURUS CABANG / CABANG KHUSUS
            </button>
          </div>
        </div>

        {/* Konten Data */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Memuat data lembaga...</p>
          </div>
        ) : filteredLembaga.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm max-w-3xl mx-auto">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak Ada Data</h3>
            <p className="text-gray-500">
              Belum ada data <span className="font-bold">{activeTab}</span> yang didaftarkan.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {filteredLembaga.map((lembaga) => (
              <div
                key={lembaga.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100"
              >
                {/* Header Lembaga */}
                <div className="p-6 md:p-8 border-b border-gray-100 flex gap-6 items-start bg-gradient-to-br from-white to-gray-50">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex-shrink-0 flex items-center justify-center">
                    {lembaga.fotoLembaga ? (
                      <img
                        src={renderImageBase64(lembaga.fotoLembaga)}
                        alt={lembaga.namaLembaga}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-indigo-200" />
                    )}
                  </div>
                  <div>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest inline-block mb-2">
                      {lembaga.jenisLembaga}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-1">
                      {lembaga.namaLembaga}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {lembaga.keteranganLembaga || "Tidak ada deskripsi lembaga."}
                    </p>
                  </div>
                </div>

                {/* Marquee Pengurus */}
                {lembaga.pengurus && lembaga.pengurus.length > 0 ? (
                  <div className="p-6 md:p-8 bg-white">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
                      <Users className="text-indigo-500 w-5 h-5" />
                      Susunan Pengurus
                    </h4>

                    <InfiniteMarquee
                      items={lembaga.pengurus}
                      speed={180}
                      renderItem={(p, key) => (
                        <div
                          key={key}
                          className="flex flex-col items-center text-center gap-3 mx-4 flex-shrink-0 w-32"
                        >
                          <div
                            className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-md border-2 border-indigo-100 cursor-pointer hover:border-indigo-400 transition-colors select-none"
                            onClick={() =>
                              setLightboxImage(
                                p.fotoPengurus
                                  ? renderImageBase64(p.fotoPengurus)
                                  : profileImageUrl
                              )
                            }
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            <img
                              src={
                                p.fotoPengurus
                                  ? renderImageBase64(p.fotoPengurus)
                                  : profileImageUrl
                              }
                              alt={p.namaPengurus}
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 pointer-events-none select-none"
                            />
                          </div>
                          <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 w-full">
                            {p.namaPengurus}
                          </p>
                          <p className="text-xs text-indigo-600 font-medium leading-tight line-clamp-2 w-full">
                            {p.posisiPengurus}
                          </p>
                        </div>
                      )}
                    />
                  </div>
                ) : (
                  <div className="p-6 md:p-8">
                    <p className="text-sm text-gray-400 italic bg-gray-50 py-4 px-4 rounded-xl text-center border border-dashed border-gray-200">
                      Belum ada data pengurus yang ditambahkan.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded-full"
            onClick={() => setLightboxImage(null)}
          >
            <X size={28} />
          </button>
          <img
            src={lightboxImage}
            alt="Zoomed view"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl pointer-events-none select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default LembagaDisplay;
