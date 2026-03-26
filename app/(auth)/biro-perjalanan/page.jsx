"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/_components/Header";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Share2, Loader2, Phone, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

const TravelPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchTourPackages();
  }, []);

  const fetchTourPackages = async () => {
    try {
      setLoading(true);
      const response = await GlobalApi.getAllPaket("", 0, 50);

      const publishedData = (response.content || []).filter(
        (item) => item.statusPaket === "PUBLISHED" || item.statusPaket === "PUBLISH"
      );

      setPackages(publishedData);
    } catch (error) {
      console.error("Gagal mengambil data paket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const response = await GlobalApi.getPaketById(id);
      setSelectedPackage(response);
    } catch (error) {
      console.error("Gagal mengambil detail paket:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderImage = (byteData) => {
    if (!byteData) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800";
    if (typeof byteData === 'string' && byteData.startsWith('data:image')) return byteData;
    return `data:image/jpeg;base64,${byteData}`;
  };

  const getShareLinks = (pkg) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(pkg.namaPaket);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
    };
  };

  const handleShare = (pkg) => {
    const shareData = {
      title: pkg.namaPaket,
      text: pkg.destinasi,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error(err));
    } else {
      navigator.clipboard.writeText(`${pkg.namaPaket}\n\n${window.location.href}`);
      alert("Link paket berhasil disalin!");
    }
  };

  const handleWhatsAppOrder = (pkg) => {
    if (!pkg.nomorHp) {
      alert("Nomor WhatsApp belum tersedia untuk paket ini.");
      return;
    }
    let formattedPhone = pkg.nomorHp.startsWith("0") ? "62" + pkg.nomorHp.slice(1) : pkg.nomorHp;
    const message = encodeURIComponent(`Halo Sanduka, saya tertarik dengan paket wisata: *${pkg.namaPaket}*. Bisa minta info lebih lanjut?`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <Header />

      {/* Hero Section */}
      <div
        className="relative py-24 mt-20 px-6 bg-center bg-cover"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto text-center text-white ">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Biro Travel PGRI Jepara</h1>
          <p className="text-xl md:text-2xl font-light mb-6">
            Paket wisata terpercaya dengan harga spesial anggota PGRI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewDetail(item.id)}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group border border-gray-100 h-[350px] cursor-pointer"
              >
                <img
                  src={renderImage(item.gambarCover)}
                  alt={item.namaPaket}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {item.persentaseDiskon && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                    HEMAT {item.persentaseDiskon}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest mb-1">
                    {item.durasi} • {item.destinasi}
                  </p>
                  <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {item.namaPaket}
                  </h3>
                  <div className="flex flex-col">
                    <p className="text-[10px] text-gray-300 uppercase mb-1">Mulai dari</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-yellow-400 drop-shadow-md">
                        Rp. {item.hargaDiskon?.toLocaleString('id-ID') || item.hargaNormal?.toLocaleString('id-ID')}
                      </span>
                      {item.hargaDiskon && item.hargaNormal > item.hargaDiskon && (
                        <span className="text-[10px] text-gray-400 line-through opacity-70">
                          Rp. {item.hargaNormal?.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tidak Menemukan yang Anda Cari?</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
            ✨ Hubungi Pakar Perjalanan Kami
          </button>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 z-20 bg-white/80 rounded-full p-2 hover:bg-red-500 hover:text-white transition shadow-md"
            >
              ✕
            </button>

            {detailLoading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Memuat detail paket...</p>
              </div>
            ) : (
              <>
                <img
                  src={renderImage(selectedPackage.gambarCover)}
                  className="w-full h-64 object-cover"
                  alt={selectedPackage.namaPaket}
                />

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{selectedPackage.namaPaket}</h2>

                  <div className="flex gap-4 mb-6">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium">📍 {selectedPackage.destinasi}</span>
                    <span className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-medium">⏱️ {selectedPackage.durasi}</span>
                  </div>

                  {selectedPackage.gambarTambahan && selectedPackage.gambarTambahan.length > 0 && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">📸 Galeri Destinasi</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {selectedPackage.gambarTambahan.map((base64String, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(renderImage(base64String))}
                            className="w-32 h-24 flex-shrink-0 snap-start rounded-lg overflow-hidden shadow-sm border border-gray-200 group cursor-pointer relative"
                          >
                            <img
                              src={renderImage(base64String)}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              alt={`Gallery ${idx + 1}`}
                            />
                            {/* Overlay icon kaca pembesar saat di-hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md text-2xl">⤢</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prose max-w-none text-gray-600 mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Deskripsi Paket:</h3>
                    <p className="whitespace-pre-line leading-relaxed">{selectedPackage.deskripsiPaket}</p>
                  </div>

                  {selectedPackage.link && getYouTubeEmbedUrl(selectedPackage.link) && (
                    <div className="mb-6">
                      <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        📺 Video Dokumentasi
                      </h3>
                      <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-md border border-gray-100">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={getYouTubeEmbedUrl(selectedPackage.link)}
                          title="YouTube video player"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Share Component */}
                  <div className="border-t border-gray-100 pt-5 mt-2 flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-500 mr-2">Bagikan:</p>
                    <a href={getShareLinks(selectedPackage).whatsapp} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-green-500 hover:bg-green-600 transition text-white rounded-full shadow-sm">
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </a>
                    <button onClick={() => handleShare(selectedPackage)} className="p-2.5 bg-gray-100 hover:bg-gray-200 transition text-gray-700 rounded-full shadow-sm">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* STICKY BOTTOM BAR (TUTUP & PESAN) */}
                <div className="p-5 bg-white flex gap-4 border-t border-gray-100 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(selectedPackage)}
                    className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                  >
                    <Phone size={18} />
                    <span className="text-sm md:text-base">Pesan via WhatsApp</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
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
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default TravelPage;