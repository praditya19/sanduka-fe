"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/_components/Header";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Share2, Facebook, Send, Loader2 } from "lucide-react";
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

  useEffect(() => {
    fetchTourPackages();
  }, []);

  const fetchTourPackages = async () => {
    try {
      setLoading(true);
      const response = await GlobalApi.getAllPaket("", 0, 50);

      const publishedData = (response.content || []).filter(
        (item) => item.statusPaket === "PUBLISHED"
      );

      setPackages(publishedData);
    } catch (error) {
      console.error("Gagal mengambil data paket:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (byteData) => {
    if (!byteData) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800";
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
                onClick={() => setSelectedPackage(item)}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group border border-gray-100 h-[350px] w-[300px] cursor-pointer"
              >
                {/* 1. Gambar Background (Sesuai BiroTravel h-full) */}
                <img
                  src={renderImage(item.gambarCover)}
                  alt={item.namaPaket}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* 2. Overlay Gradasi Gelap */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* 3. Label Diskon/Hemat */}
                {item.persentaseDiskon && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                    HEMAT {item.persentaseDiskon}
                  </div>
                )}

                {/* 4. Konten Teks (Persis ukuran BiroTravel) */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  {/* Durasi & Destinasi */}
                  <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest mb-1">
                    {item.durasi} • {item.destinasi}
                  </p>

                  {/* Judul Paket (Ukuran font lg agar tidak kebesaran) */}
                  <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {item.namaPaket}
                  </h3>

                  {/* Harga Section */}
                  <div className="flex flex-col">
                    <p className="text-[10px] text-gray-300 uppercase mb-1">Mulai dari</p>
                    <div className="flex items-baseline gap-2">
                      {/* Harga Diskon Utama */}
                      <span className="text-2xl font-extrabold text-yellow-400 drop-shadow-md">
                        Rp. {item.hargaDiskon?.toLocaleString('id-ID') || item.hargaNormal?.toLocaleString('id-ID')}
                      </span>

                      {/* Harga Normal Dicoret */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 hover:bg-white"
            >
              ✕
            </button>

            <img
              src={renderImage(selectedPackage.gambarCover)}
              className="w-full h-64 object-cover"
              alt={selectedPackage.namaPaket}
            />

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedPackage.namaPaket}</h2>
              <div className="flex gap-4 mb-6">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm">📍 {selectedPackage.destinasi}</span>
                <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm">⏱️ {selectedPackage.durasi}</span>
              </div>

              <div className="prose max-w-none text-gray-600 mb-6">
                <h3 className="font-bold text-gray-800">Deskripsi Paket:</h3>
                <p>{selectedPackage.deskripsiPaket}</p>
              </div>

              {selectedPackage.link && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                    📺 Video Dokumentasi
                  </h3>

                  {getYouTubeEmbedUrl(selectedPackage.link) ? (
                    <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getYouTubeEmbedUrl(selectedPackage.link)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                      <p className="text-xs text-gray-500 mb-1">Link Informasi:</p>
                      <a
                        href={selectedPackage.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm break-all font-medium"
                      >
                        {selectedPackage.link}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Share */}
              <div className="border-t pt-4 flex gap-3">
                <a href={getShareLinks(selectedPackage).whatsapp} target="_blank" className="p-2 bg-green-500 text-white rounded-full"><FontAwesomeIcon icon={faWhatsapp} /></a>
                <button onClick={() => handleShare(selectedPackage)} className="p-2 bg-gray-200 rounded-full"><Share2 size={18} /></button>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-4 border-t sticky bottom-0">
              <button onClick={() => setSelectedPackage(null)} className="flex-1 py-3 bg-gray-300 rounded-lg">Tutup</button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">Pesan Sekarang</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelPage;