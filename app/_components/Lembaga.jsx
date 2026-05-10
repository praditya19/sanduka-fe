"use client";
import React, { useState, useEffect } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Building, Users, Loader2, Briefcase, X } from "lucide-react";

const LembagaDisplay = () => {
  const profileImageUrl = "/profile.png";

  const [lembagaData, setLembagaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PUSAT");
  const [selectedLembaga, setSelectedLembaga] = useState(null); 
  
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

        {/* Tab / Toggle PUSAT vs CABANG */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-full shadow-md border border-gray-200 inline-flex relative">
            <button
              onClick={() => setActiveTab("PUSAT")}
              className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 z-10 ${
                activeTab === "PUSAT" ? "text-white" : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              LEMBAGA PUSAT
            </button>
            <button
              onClick={() => setActiveTab("CABANG")}
              className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 z-10 ${
                activeTab === "CABANG" ? "text-white" : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              LEMBAGA CABANG
            </button>
            
            <div
              className={`absolute top-1.5 bottom-1.5 w-1/2 bg-indigo-600 rounded-full transition-transform duration-300 ease-in-out shadow-md`}
              style={{
                transform: activeTab === "PUSAT" ? "translateX(0%)" : "translateX(100%)",
                left: "6px"
              }}
            ></div>
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
              Belum ada data Lembaga <span className="font-bold">{activeTab}</span> yang didaftarkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredLembaga.map((lembaga) => (
              <div 
                key={lembaga.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group hover:shadow-xl transition-shadow"
              >
                {/* Header Card Lembaga */}
                <div className="p-6 md:p-8 border-b border-gray-100 flex gap-6 items-start bg-gradient-to-br from-white to-gray-50">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex-shrink-0 flex items-center justify-center">
                    {lembaga.fotoLembaga ? (
                      <img 
                        src={renderImageBase64(lembaga.fotoLembaga)} 
                        alt={lembaga.namaLembaga} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <Building className="w-10 h-10 text-indigo-200" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest">
                        {lembaga.jenisLembaga}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-2">
                      {lembaga.namaLembaga}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {lembaga.keteranganLembaga || "Tidak ada deskripsi lembaga."}
                    </p>
                  </div>
                </div>

                {/* List Pengurus Section (Maksimal 4) */}
                <div className="p-6 md:p-8 flex-1 bg-white flex flex-col">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Users className="text-indigo-500 w-5 h-5" /> 
                    Susunan Pengurus
                  </h4>
                  
                  {lembaga.pengurus && lembaga.pengurus.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {lembaga.pengurus.slice(0, 4).map((p, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0 flex items-center justify-center border border-gray-200 cursor-pointer">
                              <img 
                                src={p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl} 
                                alt={p.namaPengurus} 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxImage(p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl);
                                }}
                              />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-gray-800 truncate" title={p.namaPengurus}>
                                {p.namaPengurus}
                              </p>
                              <p className="text-xs text-indigo-600 font-medium truncate flex items-center gap-1 mt-0.5" title={p.posisiPengurus}>
                                <Briefcase className="w-3 h-3" /> {p.posisiPengurus}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tombol Lihat Semua jika lebih dari 4 pengurus */}
                      {lembaga.pengurus.length > 4 && (
                        <button
                          onClick={() => setSelectedLembaga(lembaga)}
                          className="mt-6 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition-colors border border-indigo-100"
                        >
                          Lihat Semua Pengurus ({lembaga.pengurus.length})
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic bg-gray-50 py-4 px-4 rounded-xl text-center border border-dashed border-gray-200">
                      Belum ada data pengurus yang ditambahkan.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLembaga && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setSelectedLembaga(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  {selectedLembaga.fotoLembaga ? (
                    <img src={renderImageBase64(selectedLembaga.fotoLembaga)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="text-gray-400 w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">Susunan Pengurus</h3>
                  <p className="text-sm font-medium text-indigo-600">{selectedLembaga.namaLembaga}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLembaga(null)}
                className="p-2.5 bg-white border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white rounded-b-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {selectedLembaga.pengurus.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0 flex items-center justify-center border border-gray-200 cursor-pointer">
                      <img 
                        src={p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl} 
                        alt={p.namaPengurus} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl);
                        }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate" title={p.namaPengurus}>
                        {p.namaPengurus}
                      </p>
                      <p className="text-xs text-indigo-600 font-medium truncate flex items-center gap-1 mt-1" title={p.posisiPengurus}>
                        <Briefcase className="w-3 h-3" /> {p.posisiPengurus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
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
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
};

export default LembagaDisplay;