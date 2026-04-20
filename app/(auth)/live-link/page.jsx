"use client";
import GlobalApi from "@/app/_utils/GlobalApi";
import React, { useState, useEffect } from "react";
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
  PlayCircle,
  AlertTriangle,
  MonitorPlay,
  Youtube
} from "lucide-react";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}`;
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
  
  const [videoDashboardList, setVideoDashboardList] = useState([]);
  const [videoDashboardLink, setVideoDashboardLink] = useState("");
  const [isSubmittingVideoDashboard, setIsSubmittingVideoDashboard] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    fetchVideoDashboards();

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

  const fetchVideoDashboards = async () => {
    try {
      const data = await GlobalApi.getAllVideoDashboard();
      const list = Array.isArray(data) ? data : (data?.content || []);
      setVideoDashboardList(list);
    } catch (error) {
      console.error("Gagal mengambil video dashboard:", error);
    }
  };

  const handleCreateVideoDashboard = async (e) => {
    e.preventDefault();
    if (!videoDashboardLink.trim()) {
      setNotification({ type: "error", message: "Link Video Dashboard wajib diisi!" });
      return;
    }
    
    try {
      setIsSubmittingVideoDashboard(true);
      
      const payload = {
        link: videoDashboardLink
      };

      await GlobalApi.createVideoDashboard(payload);
      setNotification({ type: "success", message: "Video Dashboard berhasil ditambahkan!" });
      
      setVideoDashboardLink("");
      fetchVideoDashboards();
    } catch (error) {
      console.error("Error upload video dashboard:", error);
      setNotification({ type: "error", message: "Gagal menambahkan video dashboard!" });
    } finally {
      setIsSubmittingVideoDashboard(false);
    }
  };

  const confirmDeleteAction = async () => {
    try {
      if (deleteConfig.type === "LIVE_LINK") {
        await GlobalApi.deleteLinkLive();
        setNotification({ type: "success", message: "Live link berhasil dihapus!" });
        setUrl("");
      } else if (deleteConfig.type === "VIDEO_DASHBOARD") {
        await GlobalApi.deleteVideoDashboard(deleteConfig.id);
        setNotification({ type: "success", message: "Video Dashboard berhasil dihapus!" });
        fetchVideoDashboards();
      }
    } catch (error) {
      setNotification({ type: "error", message: "Gagal menghapus data tersebut." });
    } finally {
      setDeleteConfig({ isOpen: false, type: "", id: null, title: "" });
    }
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

      {/* POPUP KONFIRMASI HAPUS */}
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
                  Kelola Live Link dan Video Dashboard Utama Anda di sini.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" />
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

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MonitorPlay className="w-5 h-5" />
                    Video Dashboard Utama
                  </h2>
                </div>

                <div className="p-6 md:p-8">
                  <form onSubmit={handleCreateVideoDashboard} className="mb-8">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Link Video Dashboard (YouTube)
                    </label>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="w-full md:w-2/3 flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                          value={videoDashboardLink}
                          onChange={(e) => setVideoDashboardLink(e.target.value)}
                          required
                        />
                        {/* Preview Iframe Langsung di bawah input */}
                        {videoDashboardLink && getYouTubeEmbedUrl(videoDashboardLink) && (
                          <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={getYouTubeEmbedUrl(videoDashboardLink)}
                              title="Preview Video"
                              frameBorder="0"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full md:w-1/3">
                        <button
                          type="submit"
                          disabled={isSubmittingVideoDashboard || !videoDashboardLink}
                          className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingVideoDashboard ? "Menyimpan..." : "Simpan Video"}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* List Aktif Video Dashboard */}
                  {videoDashboardList.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                        Daftar Video Dashboard Aktif ({videoDashboardList.length})
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {videoDashboardList.map((vd) => (
                          <div key={vd.id} className="border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row gap-4 items-center bg-gray-50/80 group hover:shadow-md transition-shadow">
                            {/* Thumbnail Preview */}
                            <div className="w-full sm:w-40 h-24 rounded-lg overflow-hidden bg-black shrink-0 relative">
                              {getYouTubeEmbedUrl(vd.link) ? (
                                <iframe
                                  className="w-full h-full pointer-events-none"
                                  src={getYouTubeEmbedUrl(vd.link)}
                                  title="Video"
                                  frameBorder="0"
                                ></iframe>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200"><Youtube className="text-gray-400 w-8 h-8" /></div>
                              )}
                            </div>
                            
                            {/* Detail info */}
                            <div className="flex-1 min-w-0 w-full text-left">
                              <a href={vd.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:underline truncate block">
                                {vd.link}
                              </a>
                              {vd.createdAt && (
                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                  Diunggah: {`${vd.createdAt[2]}/${vd.createdAt[1]}/${vd.createdAt[0]}`}
                                </p>
                              )}
                            </div>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => setDeleteConfig({ isOpen: true, type: "VIDEO_DASHBOARD", id: vd.id, title: "Video Dashboard" })}
                              className="p-2.5 text-red-500 bg-white border border-red-100 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm shrink-0 sm:opacity-0 group-hover:opacity-100"
                              title="Hapus Video"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
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