"use client";
import React, { useState, useEffect } from "react";
import Header from "@/app/_components/Header";
import Link from "next/link";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Share2, Loader2, MapPin, Clock, Video, X, Phone, Download, FileText } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const BiroTravel = () => {
  const [packages, setPackages] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [showWaOptions, setShowWaOptions] = useState(false);

  useEffect(() => {
    fetchLatestPackages();
  }, []);

  const fetchLatestPackages = async () => {
    try {
      setLoading(true);
      const [paketResponse, promoResponse] = await Promise.all([
        GlobalApi.getAllPaket("", 0, 4),
        GlobalApi.getAllSlidePaket("", 0, 50)
      ]);

      const published = (paketResponse.content || []).filter(
        (pkg) => pkg.statusPaket === "PUBLISH" || pkg.statusPaket === "PUBLISHED"
      );
      setPackages(published);

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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    if (match && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
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
      alert("Nomor WhatsApp kontak admin belum tersedia untuk paket ini.");
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

  const promoInfos = promos.filter(p => p.text || p.file);
  const promoVideos = promos.filter(p => !p.text && !p.file && p.link && getYouTubeEmbedUrl(p.link));
  const promoPhotos = promos.filter(p => p.foto && !p.text && !p.file && !p.link);

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
    link.download = `Dokumen_Tour_Travel_${id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* <Header /> */}

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

      {/* SECTION PAKET TERBARU */}
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

      {!loading && promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20 mt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Dokumentasi & Informasi</h2>
            <div className="w-24 h-1.5 bg-teal-500 rounded-full mx-auto opacity-80"></div>
          </div>

          {/* --- 1. GRID FOTO BANNER --- */}
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

          {/* --- 3. LIST INFORMASI & DOKUMEN --- */}
          {promoInfos.length > 0 && (
            <div className="space-y-8 max-w-4xl mx-auto"> {/* max-w-4xl agar lebarnya proporsional dan elegan di layar besar */}
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center gap-2">
                <FileText className="text-blue-600" /> Informasi Tour & Travel
              </h3>
              
              {/* Diubah jadi 1 kolom saja */}
              <div className="grid grid-cols-1 gap-8">
                {promoInfos.map((info) => (
                  <div key={info.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 flex flex-col">
                    <h4 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                      {info.keteranganFoto && info.keteranganFoto !== "-" ? info.keteranganFoto : "Informasi Terkini"}
                    </h4>
                    
                    {/* Tampilkan Foto jika ada (Otomatis menyesuaikan ukuran Landscape/Kotak) */}
                    {info.foto && (
                      <div 
                        className="mb-6 rounded-xl overflow-hidden cursor-pointer border border-gray-100 group relative bg-gray-50" 
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

                    {/* Tampilkan Text Area jika ada teks */}
                    {info.text && (
                      <div className="mb-6 flex-grow">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Deskripsi / Teks</label>
                        <div
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 summernote-content"
                          dangerouslySetInnerHTML={{ __html: info.text }}
                        />
                      </div>
                    )}

                    {/* Tombol Download File jika ada file */}
                    {info.file && (
                      <div className="mt-auto pt-2">
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

        </section>
      )}

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
              className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full hover:bg-red-500 hover:text-white transition shadow-md"
            >
              <X size={20} />
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

                  {/* Share Component */}
                  <div className="border-t border-gray-100 pt-5 mt-2 mb-4 flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-500 mr-2">Bagikan:</p>
                    <a href={getShareLinks(selectedPackage).whatsapp} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-green-500 hover:bg-green-600 transition text-white rounded-full shadow-sm">
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </a>
                    <button onClick={() => handleShare(selectedPackage)} className="p-2.5 bg-gray-100 hover:bg-gray-200 transition text-gray-700 rounded-full shadow-sm">
                      <Share2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-6 gap-4 relative">
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

                    <div className="w-full sm:w-auto relative">
                      {/* Opsi Popup WA */}
                      {showWaOptions && Array.isArray(selectedPackage.nomorHp) && (
                        <div className="absolute bottom-full right-0 mb-2 p-3 bg-white rounded-xl shadow-xl border border-gray-200 animate-fade-in-up w-full sm:w-64 z-30">
                          <p className="text-sm font-bold text-gray-700 mb-2 text-center border-b pb-2">Pilih Admin:</p>
                          <div className="flex flex-col gap-2">
                            {selectedPackage.nomorHp.map((hp, idx) => (
                              <button
                                key={idx}
                                onClick={() => proceedToWhatsApp(hp, selectedPackage.namaPaket, selectedPackage.author)}
                                className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 transition-colors flex items-center justify-center gap-2"
                              >
                                <FontAwesomeIcon icon={faWhatsapp} /> Admin {idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleWhatsAppClick(selectedPackage)}
                        className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-3 rounded-xl font-bold shadow-lg transition active:scale-95 flex justify-center items-center gap-2.5"
                      >
                        <Phone size={18} />
                        Pesan via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Lightbox untuk Zoom Gambar */}
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

export default BiroTravel;