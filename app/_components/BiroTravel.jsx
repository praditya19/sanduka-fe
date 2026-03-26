"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/_components/Header";
import Link from "next/link";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Loader2, MapPin, Clock, Video, X, Phone } from "lucide-react";

const BiroTravel = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchLatestPackages();
  }, []);

  const fetchLatestPackages = async () => {
    try {
      setLoading(true);
      const response = await GlobalApi.getAllPaket("", 0, 4);

      const published = (response.content || []).filter(
        (pkg) => pkg.statusPaket === "PUBLISH" || pkg.statusPaket === "PUBLISHED"
      );

      setPackages(published);
    } catch (error) {
      console.error("Gagal mengambil paket terbaru:", error);
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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleWhatsAppOrder = (pkg) => {
    if (!pkg.nomorHp) {
      alert("Nomor WhatsApp kontak admin belum tersedia untuk paket ini.");
      return;
    }

    let formattedPhone = pkg.nomorHp.startsWith("0") ? "62" + pkg.nomorHp.slice(1) : pkg.nomorHp;
    const message = encodeURIComponent(`Halo Sanduka.id, saya tertarik dengan paket: *${pkg.namaPaket}*. Mohon informasi ketersediaan dan detailnya.`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <Header />

      <div
        className="relative h-[75vh] bg-center bg-cover bg-fixed flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-white shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tour and Travel</h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6">
              Temukan Destinasi Wisata Terbaik dengan Pengalaman Tak Terlupakan
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/biro-perjalanan">
                <button className="bg-orange-500 hover:bg-orange-600 transition px-6 py-3 rounded-xl font-semibold shadow-lg">
                  Lihat Semua Paket
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Paket Terbaru</h2>
          <span className="text-sm text-blue-600 font-medium px-4 py-1 bg-blue-50 rounded-full">
            ✨ Rekomendasi Terkini
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((item) => (
              <div
                key={item.id}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group border border-gray-100 h-[350px] cursor-pointer"
                onClick={() => handleViewDetail(item.id)}
              >
                <img
                  src={renderImage(item.gambarCover)}
                  alt={item.namaPaket}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <span className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  New Trip
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest mb-1">
                    {item.durasi} • {item.destinasi}
                  </p>
                  <h3 className="font-bold text-lg mb-3 line-clamp-2 leading-tight">
                    {item.namaPaket}
                  </h3>
                  <div className="flex flex-col mt-2 leading-none">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-xs text-gray-300 font-light">Mulai dari</p>
                      {item.hargaNormal > item.hargaDiskon && item.persentaseDiskon && (
                        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm animate-pulse">
                          {item.persentaseDiskon} OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-yellow-400 drop-shadow-md">
                        Rp. {item.hargaDiskon?.toLocaleString('id-ID')}
                      </span>
                      {item.hargaNormal > item.hargaDiskon && (
                        <span className="text-xs text-gray-400 line-through opacity-80 decoration-red-500">
                          {item.hargaNormal?.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4 text-gray-300">📭</div>
            <h3 className="text-xl font-bold text-gray-800">Tidak ada Paket Wisata Terbaru</h3>
            <p className="text-gray-500 mt-2">Silakan hubungi admin untuk info paket lainnya.</p>
          </div>
        )}
      </section>

      {selectedPackage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full hover:bg-red-500 hover:text-white transition shadow-md"
            >
              <X size={20} />
            </button>

            <img
              src={renderImage(selectedPackage.gambarCover)}
              className="w-full h-64 object-cover"
              alt={selectedPackage.namaPaket}
            />

            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight leading-tight">{selectedPackage.namaPaket}</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-3">
                  <MapPin className="text-blue-600" size={20} />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Destinasi</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedPackage.destinasi}</p>
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl flex items-center gap-3">
                  <Clock className="text-orange-600" size={20} />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Durasi</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedPackage.durasi}</p>
                  </div>
                </div>
              </div>

              {selectedPackage.gambarTambahan && selectedPackage.gambarTambahan.length > 0 && (
                <div className="mb-8 bg-gray-50 p-5 rounded-2xl border">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">📸 Galeri Foto Destinasi</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
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
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md text-2xl">⤢</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 prose prose-sm max-w-none prose-blue">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">📝 Deskripsi Paket</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedPackage.deskripsiPaket}
                </p>
              </div>

              {selectedPackage.link && getYouTubeEmbedUrl(selectedPackage.link) && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Video size={18} className="text-red-600" /> Video Dokumentasi
                  </h3>
                  <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-md">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getYouTubeEmbedUrl(selectedPackage.link)}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-6 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Harga Spesial</p>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-blue-700">
                        Rp. {selectedPackage.hargaDiskon?.toLocaleString('id-ID')}
                      </p>

                      {selectedPackage.hargaNormal > selectedPackage.hargaDiskon && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          SAVE {selectedPackage.persentaseDiskon}
                        </span>
                      )}
                    </div>

                    {selectedPackage.hargaNormal > selectedPackage.hargaDiskon && (
                      <p className="text-sm text-gray-400">
                        <span className="line-through">Rp. {selectedPackage.hargaNormal?.toLocaleString('id-ID')}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleWhatsAppOrder(selectedPackage)}
                  className="bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition active:scale-95 flex items-center gap-2.5"
                >
                  <Phone size={18} />
                  Pesan via WhatsApp
                </button>
              </div>
            </div>
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
            onClick={(e) => e.stopPropagation()} // Mencegah popup tertutup jika gambarnya yang diklik
          />
        </div>
      )}
    </div>
  );
};

export default BiroTravel;