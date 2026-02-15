"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import GlobalApi from "@/app/_utils/GlobalApi";
import Sidebar from "@/app/_components/Sidebar";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
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
const ViewBerita = () => {
  const [newsData, setNewsData] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    judul: "",
    username: "",
    email: "",
    role: "",
    ketFoto1: "",
    isiBerita1: "",
    status: "DRAFT",
    fotoUtama: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [oldPhoto, setOldPhoto] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [preview, setPreview] = useState(null);
  const [publishId, setPublishId] = useState(null);

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    try {
      const response = await GlobalApi.getAllBerita();
      setNewsData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Gagal mengambil berita:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 5) return "-";
    const [year, month, day, hour, minute] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute);

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateWords = (text, limit) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + "...";
  };

  const handleEdit = (news) => {
    setFormData({
      id: news.id,
      judul: news.judul || "",
      username: news.username || "",
      email: news.email || "",
      role: news.role || "",
      ketFoto1: news.ketFoto1 || "",
      isiBerita1: news.isiBerita1 || "",
      status: news.status || "DRAFT",
      fotoUtama: news.fotoUtama || "",
    });
    setOldPhoto(news.fotoUtama);

    setPreview(
      news.fotoUtama ? `data:image/jpeg;base64,${news.fotoUtama}` : null,
    );

    setEditMode(true);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      fotoUtama: imageFile,
    };

    try {
      await GlobalApi.updateBerita(formData.id, payload);
      setNotification({
        type: "success",
        message: `Berita berhasil diupdate!`,
      });
    } catch (error) {
      const errorMessage = error?.response?.data || "Terjadi kesalahan";

      console.error(errorMessage);

      setNotification({
        type: "error",
        message: errorMessage,
      });
    }
  };
  const confirmDelete = async () => {
    try {
      const username = sessionStorage.getItem("nama");
      const role = sessionStorage.getItem("role");

      await GlobalApi.deleteBerita(deleteId, username, role);

      setNotification({
        type: "success",
        message: "Berita berhasil dihapus",
      });

      setDeleteId(null);
      fetchBerita();
    } catch (error) {
      setDeleteId(null);
      setNotification({
        type: "error",
        message: error,
      });
    }
  };

  const handlePublish = async (id) => {
    try {
      const username = sessionStorage.getItem("nama");
      const role = sessionStorage.getItem("role");

      if (!username || !role) {
        setNotification({
          type: "error",
          message: "Session user tidak ditemukan",
        });
        return;
      }

      await GlobalApi.publishBerita(id, username, role);

      await GlobalApi.updateStatusBerita(id, "PUBLISH", username, role);

      setNotification({
        type: "success",
        message: "Berita berhasil dipublish",
      });

      fetchBerita();
    } catch (error) {
      setNotification({
        type: "error",
        message: error,
      });
    }
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8 py-16">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-600 font-medium">
                  Memuat berita...
                </p>
              </div>
            </div>
          ) : (
            <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
              <div className="hidden md:block sticky top-20 z-30 float-right mr-8 mt-4">
                <button
                  onClick={() =>
                    (window.location.href = "/berita/create-berita")
                  }
                  className="group relative px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <div className="relative flex items-center justify-center w-6 h-6">
                    <svg
                      className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>

                  <span className="relative">Buat Berita Baru</span>

                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-xs flex items-center justify-center animate-pulse">
                    +
                  </span>
                </button>
              </div>

              <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                  onClick={() =>
                    (window.location.href = "/berita/create-berita")
                  }
                  className="group w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 relative overflow-hidden"
                  title="Buat Berita Baru"
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-500"></div>

                  <svg
                    className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>

                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-xs flex items-center justify-center animate-pulse">
                    1
                  </span>
                </button>

                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap">
                    Buat Berita Baru
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 animate-fade-in-down">
                  <h2 className="text-4xl md:ml-32 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Draft Berita
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-4"></div>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Periksa, sunting, dan pastikan berita siap tayang
                  </p>
                </div>

                {newsData.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📰</div>
                    <p className="text-gray-500 text-lg">
                      Belum ada berita tersedia.
                    </p>
                    <p className="text-gray-400">
                      Nantikan update terbaru dari kami
                    </p>

                    <button
                      onClick={() => (window.location.href = "/create-berita")}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Buat Berita Pertama
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {newsData.map((news, index) => (
                        <div
                          key={news.id}
                          className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => setSelectedNews(news)}
                        >
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={
                                news.fotoUtama
                                  ? `data:image/jpeg;base64,${news.fotoUtama}`
                                  : "/placeholder.jpg"
                              }
                              alt={news.judul}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80"></div>

                            <span className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/30">
                              Berita
                            </span>

                            <h3 className="absolute bottom-4 left-4 right-4 text-white text-xl font-bold leading-tight group-hover:translate-y-[-4px] transition-transform duration-300">
                              {news.judul}
                            </h3>
                          </div>

                          <div className="p-5">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span>{news.contributor || "Anonymous"}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>{formatDate(news.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span className="font-medium">Editor:</span>
                              <span className="ml-1">
                                {news.username || "-"}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                              {truncateWords(news.isiBerita1, 20)}
                            </p>

                            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors mb-4">
                              <span>Baca selengkapnya</span>
                              <svg
                                className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>

                            <div
                              className="flex gap-2 pt-4 border-t border-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleEdit(news)}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>

                              <button
                                onClick={() => setDeleteId(news.id)}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Hapus
                              </button>
                            </div>
                          </div>

                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-2 border-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
                        </div>
                      ))}
                    </div>

                    {newsData.length >= 6 && (
                      <div className="text-center mt-12 animate-fade-in">
                        <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                          Muat Lebih Banyak
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Add these styles to your global CSS or component style */}
          <style jsx>{`
            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-in-down {
              animation: fadeInDown 0.6s ease-out;
            }

            .animate-fade-in-up {
              opacity: 0;
              animation: fadeInUp 0.6s ease-out forwards;
            }

            .line-clamp-3 {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}</style>

          {/* Add these styles to your global CSS or component style */}
          <style jsx>{`
            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-in-down {
              animation: fadeInDown 0.6s ease-out;
            }

            .animate-fade-in-up {
              opacity: 0;
              animation: fadeInUp 0.6s ease-out forwards;
            }

            .line-clamp-3 {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}</style>

          {/* ================= MODAL DETAIL ================= */}
          {selectedNews && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setSelectedNews(null)}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 flex items-center justify-center group"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="relative h-80 overflow-hidden group">
                  <img
                    src={
                      selectedNews.fotoUtama
                        ? `data:image/jpeg;base64,${selectedNews.fotoUtama}`
                        : "/placeholder.jpg"
                    }
                    alt={selectedNews.judul}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/30 shadow-lg">
                      📰 Berita Terkini
                    </span>
                  </div>

                  <h2 className="absolute bottom-6 left-6 right-6 text-white text-3xl font-bold leading-tight">
                    {selectedNews.judul}
                  </h2>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(90vh-20rem)]">
                  <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tanggal</p>
                        <p className="font-medium">
                          {formatDate(selectedNews.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Kontributor</p>
                        <p className="font-medium">
                          {selectedNews.contributor || "Anonymous"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Editor</p>
                        <p className="font-medium">
                          {selectedNews.username || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <div className="relative pl-6 mb-8">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                      <p className="text-gray-700 leading-relaxed text-lg italic">
                        {selectedNews.isiBerita1}
                      </p>
                    </div>

                    {selectedNews.isiBerita2 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                          Detail Informasi
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {selectedNews.isiBerita2}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          handleEdit(selectedNews);
                          setSelectedNews(null);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Berita
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(selectedNews.id);
                          setSelectedNews(null);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Hapus Berita
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        onClick={() => handlePublish(selectedNews.id)}
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">Mode Preview:</span> Anda
                      sedang melihat pratinjau berita sebelum dipublikasikan.
                      Gunakan tombol Edit untuk mengubah konten atau Hapus untuk
                      menghapus berita.
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"></div>
                </div>
              </div>
            </div>
          )}
          {/* Style popup */}
          <style jsx>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes progress {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }

  .animate-progress {
    animation: progress 3s ease-in-out infinite;
    width: 100%;
  }

  /* Custom scrollbar untuk modal */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 10px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
    `}</style>
          {editMode && (
            <div
              className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-50 overflow-y-auto"
              onClick={() => setEditMode(false)}
            >
              <div
                className="min-h-screen w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 sticky top-0 z-20 shadow-lg">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Edit Berita
                        </h2>
                        <p className="text-blue-100 text-sm">
                          Perbarui konten berita Anda
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditMode(false)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
                      >
                        <svg
                          className="w-5 h-5 text-white group-hover:rotate-90 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-5 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                            Foto Utama Berita
                          </h3>

                          <div className="mb-4">
                            {preview ? (
                              <div className="relative rounded-xl overflow-hidden group">
                                <img
                                  src={preview}
                                  alt="Preview"
                                  className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                                    Preview Foto Utama
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center">
                                <svg
                                  className="w-16 h-16 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="text-gray-500 font-medium">
                                  Belum ada foto
                                </p>
                                <p className="text-xs text-gray-400">
                                  Upload foto untuk preview
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload-full"
                            />
                            <label
                              htmlFor="image-upload-full"
                              className="cursor-pointer block"
                            >
                              <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                  <svg
                                    className="w-6 h-6 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">
                                  Klik untuk upload foto
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG, JPEG (Max. 5MB)
                                </p>
                              </div>
                            </label>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Keterangan Foto
                            </label>
                            <input
                              type="text"
                              name="ketFoto1"
                              value={formData.ketFoto1}
                              onChange={handleChange}
                              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none"
                              placeholder="Tambahkan keterangan untuk foto ini..."
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-7 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            Judul Berita
                          </label>
                          <input
                            type="text"
                            name="judul"
                            value={formData.judul}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none"
                            placeholder="Masukkan judul berita yang menarik..."
                            required
                          />
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                            Isi Berita
                          </label>
                          <textarea
                            name="isiBerita1"
                            value={formData.isiBerita1}
                            onChange={handleChange}
                            rows="12"
                            className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 outline-none resize-none"
                            placeholder="Tulis isi berita Anda di sini..."
                            required
                          ></textarea>
                          <div className="flex justify-end items-center mt-2">
                            <span className="text-xs text-gray-400 font-medium">
                              {formData.isiBerita1?.length || 0} karakter
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <h4 className="text-sm font-semibold text-blue-200 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              Informasi Penulis
                            </h4>
                            <div className="space-y-2">
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-xs text-blue-200">
                                  Username
                                </p>
                                <p className="font-medium">
                                  {formData.username || "-"}
                                </p>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-xs text-blue-200">Email</p>
                                <p className="font-medium truncate">
                                  {formData.email || "-"}
                                </p>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-xs text-blue-200">Role</p>
                                <p className="font-medium">
                                  {formData.role || "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Status Publikasi
                            </h4>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 appearance-none bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none cursor-pointer mb-3"
                            >
                              <option value="DRAFT">
                                📝 Draft - Dalam Proses
                              </option>
                              <option value="PUBLISH">
                                🚀 Publish - Siap Tayang
                              </option>
                            </select>

                            {formData.status === "DRAFT" ? (
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mt-1"></span>
                                  <div>
                                    <p className="text-xs font-semibold text-yellow-800">
                                      Mode Draft
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                      Berita hanya terlihat di halaman editing
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1"></span>
                                  <div>
                                    <p className="text-xs font-semibold text-green-800">
                                      Mode Publish
                                    </p>
                                    <p className="text-xs text-green-700">
                                      Berita akan langsung tampil di publik
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-8 -mb-8 mt-8 z-10">
                      <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">
                            Terakhir diupdate:
                          </span>{" "}
                          {new Date().toLocaleString("id-ID")}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Update Berita
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Style update */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e0;
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-in {
              animation: fadeIn 0.3s ease-out;
            }

            .animate-slide-up {
              animation: slideUp 0.4s ease-out;
            }
          `}</style>
          {deleteId && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
              <div className="absolute inset-0 bg-black opacity-40"></div>

              <div className="relative bg-white rounded-2xl shadow-xl p-6 w-96 animate-scaleIn">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                  Konfirmasi Hapus
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus berita ini?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Batal
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ViewBerita;
