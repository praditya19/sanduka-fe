"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/_components/Header";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Share2, Loader2, Phone, X, PlayCircle, Download, FileText } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

const TravelPage = () => {
  const [packages, setPackages] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [showWaOptions, setShowWaOptions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paketResponse, promoResponse] = await Promise.all([
        GlobalApi.getAllPaket("", 0, 50),
        GlobalApi.getAllSlidePaket("", 0, 50)
      ]);

      const publishedData = (paketResponse.content || []).filter(
        (item) => item.statusPaket === "PUBLISHED" || item.statusPaket === "PUBLISH"
      );
      setPackages(publishedData);

      const promoData = Array.isArray(promoResponse) ? promoResponse : (promoResponse?.content || []);
      setPromos(promoData);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      setShowWaOptions(false);
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

  const proceedToWhatsApp = (phoneStr, pkgName, authorName) => {
    let formattedPhone = phoneStr.startsWith("0") ? "62" + phoneStr.slice(1) : phoneStr;

    const sapaan = authorName ? authorName : "Admin";

    const message = encodeURIComponent(`Halo ${sapaan}, saya tertarik dengan paket wisata: *${pkgName}*. Bisa minta info lebih lanjut?`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
    setShowWaOptions(false);
  };

  const handleWhatsAppClick = (pkg) => {
    if (!pkg.nomorHp || (Array.isArray(pkg.nomorHp) && pkg.nomorHp.length === 0)) {
      alert("Nomor WhatsApp belum tersedia untuk paket ini.");
      return;
    }

    if (Array.isArray(pkg.nomorHp) && pkg.nomorHp.length > 1) {
      setShowWaOptions(!showWaOptions);
    }
    else if (Array.isArray(pkg.nomorHp) && pkg.nomorHp.length === 1) {
      proceedToWhatsApp(pkg.nomorHp[0], pkg.namaPaket, pkg.author);
    }
    else if (typeof pkg.nomorHp === 'string') {
      proceedToWhatsApp(pkg.nomorHp, pkg.namaPaket, pkg.author);
    }
  };

  const handleDownloadFile = (base64Data, id) => {
    if (!base64Data) {
      alert("File tidak ditemukan!");
      return;
    }

    let mimeType = "application/octet-stream";
    let extension = "file"; 
    let cleanBase64 = base64Data;

    if (base64Data.startsWith("data:")) {
      const arr = base64Data.split(",");
      mimeType = arr[0].match(/:(.*?);/)[1];
      cleanBase64 = arr[1];
      
      if (mimeType.includes("pdf")) extension = "pdf";
      else if (mimeType.includes("word") || mimeType.includes("document")) extension = "docx";
    } else {
      if (base64Data.startsWith("JVBERi0")) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (base64Data.startsWith("UEsDBBQ")) {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
      } else if (base64Data.startsWith("0M8R4KGx")) {
        mimeType = "application/msword";
        extension = "doc";
      }
    }

    const fileUrl = `data:${mimeType};base64,${cleanBase64}`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `Dokumen_Travel_${id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const promoInfos = promos.filter(p => p.text || p.file);
  const promoVideos = promos.filter(p => (!p.text && !p.file) && !p.foto && p.link && getYouTubeEmbedUrl(p.link));
  const promoPhotos = promos.filter(p => (!p.text && !p.file) && p.foto);

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

      {/* SECTION TENTANG BIRO TOUR & TRAVEL */}
      {!loading && promoInfos.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <FileText className="text-blue-600" /> Tentang Biro Tour & Travel
            </h2>
            <div className="w-24 h-1.5 bg-blue-500 rounded-full mx-auto opacity-80"></div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {promoInfos.map((info) => (
              <div key={info.id} className="flex flex-col">
                {info.foto && (
                  <div
                    className="mb-6 rounded-xl overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightboxImage(renderImage(info.foto))}
                  >
                    <img
                      src={renderImage(info.foto)}
                      alt="Foto Informasi"
                      className="w-full h-auto block object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 bg-black/50 p-3 rounded-full backdrop-blur-sm shadow-lg">⤢</span>
                    </div>
                  </div>
                )}

                {info.text && (
                  <div
                    className="w-full text-sm text-gray-700 summernote-content"
                    dangerouslySetInnerHTML={{ __html: info.text }}
                  />
                )}

                {info.file && (
                  <div className="mt-6">
                    <button
                      onClick={() => handleDownloadFile(info.file, info.id)}
                      className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white py-3 px-4 rounded-xl font-bold transition-colors border border-blue-200 shadow-sm"
                    >
                      <Download size={18} /> Unduh File Lampiran
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">
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
        <div className="mt-16 text-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl p-10 shadow-sm border border-blue-50">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tidak Menemukan yang Anda Cari?</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
            ✨ Hubungi Pakar Perjalanan Kami
          </button>
        </div>

        {!loading && promos.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Dokumentasi Wisata</h2>
              <div className="w-24 h-1.5 bg-teal-500 rounded-full mx-auto opacity-80"></div>
            </div>

            {/* --- 1. GRID FOTO BANNER MURNI --- */}
            {promoPhotos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {promoPhotos.map((promo) => (
                  <div
                    key={promo.id}
                    className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer h-[280px] border border-gray-100"
                    onClick={() => setLightboxImage(renderImage(promo.foto))}
                  >
                    <img
                      src={renderImage(promo.foto)}
                      alt={promo.keteranganFoto}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-black/50 text-white p-3 rounded-full backdrop-blur-sm">⤢</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md leading-snug line-clamp-2">
                        {promo.keteranganFoto}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- 2. LIST VIDEO YOUTUBE BESAR --- */}
            {promoVideos.length > 0 && (
              <div className="space-y-16 mb-16">
                {promoVideos.map((promo) => {
                  const embedUrl = getYouTubeEmbedUrl(promo.link);
                  return (
                    <div key={promo.id} className="w-full max-w-5xl mx-auto flex flex-col group">
                      <div className="border-[6px] border-[#0d9488] rounded-xl overflow-hidden shadow-lg bg-white relative pt-[56.25%] transform group-hover:-translate-y-1 transition-transform duration-300">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={embedUrl}
                          title={promo.keteranganFoto || "YouTube Video"}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- 3. DAFTAR INFORMASI & DOKUMEN BEBAS (TEKS & FILE) --- */}
            {/* Dipindah ke bawah hero section */}

          </div>
        )}
      </div>

      {/* Modal Detail Paket */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 transition-opacity duration-300"
          onClick={() => setSelectedPackage(null)} 
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-fade-in-up flex flex-col"
            onClick={(e) => e.stopPropagation()} 
          >
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 z-20 bg-white/80 rounded-full p-2 hover:bg-red-500 hover:text-white transition shadow-md"
            >
              ✕
            </button>

            {detailLoading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 flex-grow">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Memuat detail paket...</p>
              </div>
            ) : (
              <div className="flex flex-col flex-grow relative">
                <img
                  src={renderImage(selectedPackage.gambarCover)}
                  className="w-full h-64 object-cover"
                  alt={selectedPackage.namaPaket}
                />

                <div className="p-6 flex-grow">
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
                <div className="p-5 bg-white flex flex-col gap-2 border-t border-gray-100 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-2xl">

                  {/* --- OPSI WHATSAPP JIKA ADA LEBIH DARI 1 NOMOR --- */}
                  {showWaOptions && Array.isArray(selectedPackage.nomorHp) && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200 animate-fade-in-up">
                      <p className="text-sm font-bold text-gray-700 mb-2 text-center">Pilih Admin:</p>
                      <div className="flex flex-col gap-2">
                        {selectedPackage.nomorHp.map((hp, idx) => (
                          <button
                            key={idx}
                            onClick={() => proceedToWhatsApp(hp, selectedPackage.namaPaket, selectedPackage.author)}
                            className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faWhatsapp} /> Admin {idx + 1} ({hp})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => handleWhatsAppClick(selectedPackage)}
                      className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                    >
                      <Phone size={18} />
                      <span className="text-sm md:text-base">Pesan via WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Popup Galeri */}
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