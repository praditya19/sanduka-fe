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
import dynamic from "next/dynamic";

const SummernoteEditor = dynamic(
  () => {
    return Promise.all([
      import("jquery").then((mod) => mod.default),
      import("summernote/dist/summernote-lite.min.css"),
      import("summernote/dist/summernote-lite.min.js"),
    ]).then(([jQuery]) => {
      window.jQuery = jQuery;
      window.$ = jQuery;

      return ({ value, onChange, height }) => {
        const editorRef = useRef(null);

        useEffect(() => {
          const $ = window.jQuery;

          if ($ && editorRef.current) {
            $(editorRef.current).summernote({
              height: height || 300,
              callbacks: {
                onChange: function (contents) {
                  onChange(contents);
                },
              },
            });

            if (value) {
              $(editorRef.current).summernote("code", value);
            }

            return () => {
              $(editorRef.current).summernote("destroy");
            };
          } else {
            console.error("jQuery or editorRef is not available");
          }
        }, []);

        return <textarea ref={editorRef} />;
      };
    });
  },
  { ssr: false },
);
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
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
const CreateBerita = () => {
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    username: sessionStorage.getItem("nama") || "",
    email: sessionStorage.getItem("email") || "",
    role: sessionStorage.getItem("role") || "",
    responContributor: sessionStorage.getItem("nama") || "",
    isiBerita: "",
    status: "",
    kategori: "",
    galeri: [
      {
        file: null,
        deskripsi: "",
        preview: null,
      },
    ],
  });
  const role = sessionStorage.getItem("role");
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    const nama = sessionStorage.getItem("nama");
    const email = sessionStorage.getItem("email");
    const role = sessionStorage.getItem("role");

    setFormData((prev) => ({
      ...prev,
      username: nama || "",
      email: email || "",
      role: role || "",
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, fotoUtama: file });
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleAddGaleri = () => {
    setFormData((prev) => ({
      ...prev,
      galeri: [...prev.galeri, { file: null, deskripsi: "", preview: null }],
    }));
  };

  const handleRemoveGaleri = (index) => {
    const newGaleri = [...formData.galeri];
    newGaleri.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      galeri: newGaleri,
    }));
  };
  const handleGaleriChange = (index, file) => {
    const newGaleri = [...formData.galeri];
    newGaleri[index].file = file;
    newGaleri[index].preview = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      galeri: newGaleri,
    }));
  };

  const handleDeskripsiChange = (index, value) => {
    const newGaleri = [...formData.galeri];
    newGaleri[index].deskripsi = value;

    setFormData((prev) => ({
      ...prev,
      galeri: newGaleri,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      galeriImages: formData.galeri.map((g) => g.file),
      galeriDeskripsi: formData.galeri.map((g) => g.deskripsi),
    };
    try {
      await GlobalApi.createBerita(dataToSubmit);

      setNotification({
        type: "success",
        message: "Berita berhasil disimpan!",
      });
      window.location.reload();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat menyimpan berita.",
      });
    }
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-16 px-6">
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-4 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
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
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Buat Berita Baru
                      </h1>
                      <p className="text-blue-100 text-sm mt-1">
                        Lengkapi form berikut untuk menambahkan berita baru
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8">
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                          Kategori Berita
                        </label>
                        <select
                          name="kategori"
                          value={formData.kategori}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none bg-white cursor-pointer"
                          required
                        >
                          <option value="">-- Pilih Kategori --</option>
                          <option value="BERITA">📰 Berita</option>
                          <option value="ARTIKEL">📝 Artikel</option>
                          <option value="CERPEN">✍️ Cerpen</option>
                          <option value="ANEKDOT">😂 Anekdot</option>
                        </select>

                        {formData.kategori && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {formData.kategori === "BERITA"}
                                {formData.kategori === "ARTIKEL"}
                                {formData.kategori === "CERPEN"}
                                {formData.kategori === "ANEKDOT"}
                              </span>
                              <p className="text-sm font-medium text-purple-800">
                                Kategori:{" "}
                                {formData.kategori.charAt(0) +
                                  formData.kategori.slice(1).toLowerCase()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                          Galeri Berita
                        </h3>

                        {formData.galeri.map((item, index) => (
                          <div
                            key={index}
                            className="mb-6 border rounded-lg p-4 bg-white"
                          >
                            {item.preview ? (
                              <img
                                src={item.preview}
                                className="w-full h-48 object-cover rounded-lg mb-3"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-3">
                                Belum ada foto
                              </div>
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleGaleriChange(index, e.target.files[0])
                              }
                              className="mb-3"
                              required
                            />

                            <input
                              type="text"
                              value={item.deskripsi}
                              onChange={(e) =>
                                handleDeskripsiChange(index, e.target.value)
                              }
                              placeholder="Masukkan deskripsi foto..."
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />

                            {formData.galeri.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGaleri(index)}
                                className="text-red-500 text-sm mt-2"
                              >
                                Hapus Foto
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={handleAddGaleri}
                            className="w-full border-2 border-dashed border-green-400 hover:bg-green-50 text-green-600 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                          >
                            ➕ Tambah Foto
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7 space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
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

                      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                          Isi Berita
                        </label>

                        {typeof window !== "undefined" && (
                          <SummernoteEditor
                            value={formData.isiBerita}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                isiBerita: value,
                              }))
                            }
                            height={300}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <div className="space-y-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <p className="text-xs text-blue-200">Username</p>
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

                        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                            <option value="">-- Pilih Status --</option>
                            <option value="DRAFT">
                              📝 Draft - Dalam Proses
                            </option>
                            {role !== "USER" && (
                              <option value="PUBLISH">
                                🚀 Publish - Siap Tayang
                              </option>
                            )}
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
                                    Berita akan disimpan sebagai draft
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

                  <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium flex items-center gap-2"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
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
                      Simpan Berita
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateBerita;
