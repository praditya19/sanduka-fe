"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import React, { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  AlignLeft, 
  Upload, 
  Youtube, 
  PlayCircle,
  AlertTriangle
} from "lucide-react";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success": return "bg-green-100";
      case "error": return "bg-red-100";
      default: return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success": return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error": return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default: return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success": return "text-green-800";
      case "error": return "text-red-800";
      default: return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors">
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

const LiveLink = () => {
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    type: "",
    id: null,
    title: "",
  });

  const [url, setUrl] = useState("");
  const [slides, setSlides] = useState([]);
  const [slideFile, setSlideFile] = useState(null);
  const [slidePreview, setSlidePreview] = useState("");
  const [slideKeterangan, setSlideKeterangan] = useState("");
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);
  const fileInputRef = useRef(null);
  const [videoLink, setVideoLink] = useState("");
  const [videoKeterangan, setVideoKeterangan] = useState("");
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    fetchSlides();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const handleCreateLiveLink = async () => {
    if (!url) {
      setNotification({ type: "error", message: "URL tidak boleh kosong" });
      return;
    }
    try {
      await GlobalApi.createLinkLive({ url: url });
      setNotification({ type: "success", message: "Live link berhasil dibuat!" });
      setUrl("");
    } catch (error) {
      setNotification({ type: "error", message: "Gagal membuat live link" });
    }
  };

  const fetchSlides = async () => {
    try {
      const data = await GlobalApi.getAllSlidePaket("", 0, 50);
      const slideList = Array.isArray(data) ? data : (data?.content || []);
      setSlides(slideList);
    } catch (error) {
      console.error("Gagal mengambil slide paket:", error);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1920;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                const processedFile = new File([blob], safeName, { type: "image/jpeg" });
                resolve(processedFile);
              } else reject(new Error("Gagal memproses canvas"));
            },
            "image/jpeg",
            0.85
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const safeFile = await compressImage(file);
        setSlideFile(safeFile);
        setSlidePreview(URL.createObjectURL(safeFile));
      } catch (error) {
        console.error("Gagal memproses gambar banner:", error);
        setNotification({ type: "error", message: "Gagal membaca file gambar." });
      }
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!slideFile || !slideKeterangan.trim()) {
      setNotification({ type: "error", message: "Foto dan keterangan wajib diisi!" });
      return;
    }

    try {
      setIsSubmittingBanner(true);
      const formData = new FormData();
      formData.append("foto", slideFile);
      formData.append("keteranganFoto", slideKeterangan);

      await GlobalApi.createSlidePaket(formData);
      setNotification({ type: "success", message: "Banner foto berhasil ditambahkan!" });
      
      setSlideFile(null);
      setSlidePreview("");
      setSlideKeterangan("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSlides();
    } catch (error) {
      console.error("Error upload banner:", error);
      setNotification({ type: "error", message: "Gagal menambahkan banner foto!" });
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  const handleCreateVideo = async (e) => {
    e.preventDefault();
    if (!videoLink.trim() || !videoKeterangan.trim()) {
      setNotification({ type: "error", message: "Link YouTube dan keterangan wajib diisi!" });
      return;
    }

    try {
      setIsSubmittingVideo(true);
      const formData = new FormData();
      formData.append("link", videoLink);
      formData.append("keteranganFoto", videoKeterangan);

      await GlobalApi.createSlidePaket(formData);
      setNotification({ type: "success", message: "Video Dokumentasi berhasil ditambahkan!" });
      
      setVideoLink("");
      setVideoKeterangan("");
      fetchSlides();
    } catch (error) {
      console.error("Error upload video:", error);
      setNotification({ type: "error", message: "Gagal menambahkan video dokumentasi!" });
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const confirmDeleteAction = async () => {
    try {
      if (deleteConfig.type === "LIVE_LINK") {
        await GlobalApi.deleteLinkLive();
        setNotification({ type: "success", message: "Live link berhasil dihapus!" });
        setUrl("");
      } else if (deleteConfig.type === "SLIDE") {
        await GlobalApi.deleteSlidePaket(deleteConfig.id);
        setNotification({ type: "success", message: "Dokumentasi berhasil dihapus!" });
        fetchSlides();
      }
    } catch (error) {
      setNotification({ type: "error", message: "Gagal menghapus data tersebut." });
    } finally {
      setDeleteConfig({ isOpen: false, type: "", id: null, title: "" });
    }
  };

  const renderImageBase64 = (base64String) => {
    if (!base64String) return "/placeholder.jpg";
    if (base64String.startsWith('data:image')) return base64String;
    return `data:image/jpeg;base64,${base64String}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* POPUP KONFIRMASI HAPUS (CUSTOM CONFIRM) */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setDeleteConfig({ isOpen: false, type: "", id: null, title: "" })}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-red-100">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              Hapus {deleteConfig.title}?
            </h3>
            <p className="text-gray-500 text-sm mb-8 px-2">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfig({ isOpen: false, type: "", id: null, title: "" })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="py-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Header Title */}
              <div className="text-center md:text-left mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Content Manager
                </h1>
                <p className="text-gray-500 text-sm md:text-base">
                  Kelola Link Live, Dokumentasi Foto, dan Video YouTube untuk dokumentasi Anda
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.59 13.41a1.5 1.5 0 000 2.12l1.88 1.88a4 4 0 005.66-5.66l-1.17-1.17m-3.54-3.53L11.54 6.3a4 4 0 00-5.66 5.66l1.18 1.18" />
                    </svg>
                    Create Live Link
                  </h2>
                </div>

                <div className="p-6 md:p-8">
                  <div className="mb-8">
                    <label className=" text-gray-700 font-semibold mb-3 flex items-center gap-2">
                      URL Live Streaming
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://example.com/live-stream"
                        className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCreateLiveLink}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      Simpan Link
                    </button>
                    <button
                      onClick={() => setDeleteConfig({ isOpen: true, type: "LIVE_LINK", id: null, title: "Live Link" })}
                      className="flex-1 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      Hapus Link
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- KIRI: CARD TAMBAH FOTO BANNER --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="bg-teal-500 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" /> Tambah Dokumentasi Foto
                    </h2>
                  </div>
                  <form onSubmit={handleCreateBanner} className="p-6 flex flex-col flex-1 space-y-5">
                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-2">Upload Foto</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden"
                        onClick={() => fileInputRef.current.click()}
                      >
                        {slidePreview ? (
                          <img src={slidePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center z-10">
                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-xs font-medium">Klik untuk upload foto</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                      </div>
                      {slidePreview && (
                        <button type="button" onClick={() => {setSlidePreview(""); setSlideFile(null);}} className="text-xs text-red-500 hover:underline mt-2">
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-2">Keterangan Foto</label>
                      <input
                        type="text"
                        placeholder="Cth: Promo Liburan Bali 2026"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
                        value={slideKeterangan}
                        onChange={(e) => setSlideKeterangan(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        type="submit"
                        disabled={isSubmittingBanner || !slideFile}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white px-4 py-3 rounded-xl font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isSubmittingBanner ? "Menyimpan..." : "Simpan Dokumentasi Foto"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* --- KANAN: CARD TAMBAH VIDEO YOUTUBE --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="bg-red-500 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Youtube className="w-5 h-5" /> Tambah Video Dokumentasi
                    </h2>
                  </div>
                  <form onSubmit={handleCreateVideo} className="p-6 flex flex-col flex-1 space-y-5">
                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-2">Link Video YouTube</label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        required
                      />
                      {videoLink && getYouTubeEmbedUrl(videoLink) && (
                        <div className="mt-3 relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-sm">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={getYouTubeEmbedUrl(videoLink)}
                            title="Preview Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-2">Keterangan Video</label>
                      <input
                        type="text"
                        placeholder="Cth: Dokumentasi Tour Bromo"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                        value={videoKeterangan}
                        onChange={(e) => setVideoKeterangan(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        type="submit"
                        disabled={isSubmittingVideo || !videoLink}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isSubmittingVideo ? "Menyimpan..." : "Simpan Video"}
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-slate-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlignLeft className="w-5 h-5" /> Daftar Dokumentasi Travel
                  </h2>
                  <span className="bg-white/20 text-white py-1 px-3 rounded-full text-xs font-medium">
                    {slides.length} Item
                  </span>
                </div>

                <div className="p-6 md:p-8 bg-gray-50/50">
                  {slides.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada dokumentasi yang ditambahkan.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {slides.map((item) => {
                        const embedUrl = getYouTubeEmbedUrl(item.link);
                        
                        return (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group relative">
                            {/* Tombol Hapus (Triggers Custom Popup) */}
                            <button 
                                onClick={() => setDeleteConfig({ isOpen: true, type: "SLIDE", id: item.id, title: "Dokumentasi" })}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-full shadow-md transition-colors z-20 opacity-0 group-hover:opacity-100"
                                title="Hapus Item"
                              >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Area Visual (Foto/Video) */}
                            <div className="relative h-48 bg-gray-100 overflow-hidden border-b border-gray-100">
                              {item.foto ? (
                                <img 
                                  src={renderImageBase64(item.foto)} 
                                  alt={item.keteranganFoto} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              ) : embedUrl ? (
                                <iframe
                                  className="w-full h-full z-10"
                                  src={embedUrl}
                                  title="YouTube Video"
                                  frameBorder="0"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                                  <LinkIcon className="w-8 h-8 mb-2 opacity-50" />
                                  <span className="text-xs">Link Tidak Valid</span>
                                </div>
                              )}
                            </div>

                            {/* Area Teks */}
                            <div className="p-4 flex-1 flex flex-col">
                              <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 text-sm leading-snug">
                                {item.keteranganFoto}
                              </h4>
                              
                              <div className="mt-auto pt-3 flex justify-between items-end border-t border-gray-50">
                                {item.foto ? (
                                    <span className="bg-teal-50 text-teal-600 border border-teal-100 py-1 px-2.5 rounded-lg text-[10px] font-bold tracking-wide">
                                      📸 FOTO DOKUMENTASI
                                    </span>
                                ) : (
                                    <span className="bg-red-50 text-red-600 border border-red-100 py-1 px-2.5 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1">
                                      <Youtube className="w-3 h-3" /> VIDEO YOUTUBE
                                    </span>
                                )}

                                {item.createdAt && (
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {`${item.createdAt[2]}/${item.createdAt[1]}/${item.createdAt[0]}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveLink;