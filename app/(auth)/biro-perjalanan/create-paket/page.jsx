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

const CreatePaket = () => {
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    namaPaket: "",
    durasi: "",
    destinasi: "",
    deskripsiPaket: "",
    hargaNormal: "",
    hargaDiskon: "",
    persentaseDiskon: "",
    ratingPaket: "",
    jumlahReview: "",
    author: "",
    statusPaket: "DRAFT",
  });

  const [gambarCover, setGambarCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setGambarCover(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gabungkan formData + gambarCover
      const dataToSend = {
        ...formData,
        gambarCover: gambarCover, // penting supaya ikut terkirim
      };

      console.log("DATA YANG DIKIRIM:", dataToSend);

      // 🔥 PANGGIL API
      const response = await GlobalApi.createPaketTour(dataToSend);

      console.log("RESPONSE:", response);

      // Reset form
      setFormData({
        namaPaket: "",
        durasi: "",
        destinasi: "",
        deskripsiPaket: "",
        hargaNormal: "",
        hargaDiskon: "",
        persentaseDiskon: "",
        ratingPaket: "",
        jumlahReview: "",
        author: "",
        statusPaket: "DRAFT",
      });

      setGambarCover(null);
      setPreview(null);

      setNotification({
        type: "success",
        message: "Paket berhasil disimpan!",
      });
    } catch (error) {
      console.error("ERROR:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Gagal membuat paket tour",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Create Paket Tour
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid 2 Column */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Nama Paket"
                name="namaPaket"
                value={formData.namaPaket}
                onChange={handleChange}
              />
              <Input
                label="Durasi"
                name="durasi"
                value={formData.durasi}
                onChange={handleChange}
              />
              <Input
                label="Destinasi"
                name="destinasi"
                value={formData.destinasi}
                onChange={handleChange}
              />
              <Input
                label="Author"
                name="author"
                value={formData.author}
                onChange={handleChange}
              />
              <Input
                label="Harga Normal"
                name="hargaNormal"
                value={formData.hargaNormal}
                onChange={handleChange}
              />
              <Input
                label="Harga Diskon"
                name="hargaDiskon"
                value={formData.hargaDiskon}
                onChange={handleChange}
              />
              <Input
                label="Persentase Diskon"
                name="persentaseDiskon"
                value={formData.persentaseDiskon}
                onChange={handleChange}
              />
              <Input
                label="Rating Paket"
                name="ratingPaket"
                value={formData.ratingPaket}
                onChange={handleChange}
              />
              <Input
                label="Jumlah Review"
                name="jumlahReview"
                value={formData.jumlahReview}
                onChange={handleChange}
              />

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Status Paket
                </label>
                <select
                  name="statusPaket"
                  value={formData.statusPaket}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISH">PUBLISH</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Deskripsi Paket
              </label>
              <textarea
                name="deskripsiPaket"
                rows={4}
                value={formData.deskripsiPaket}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Masukkan deskripsi paket..."
              />
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Gambar Cover
              </label>

              <div className="flex items-center gap-6">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-xl border"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border p-2 rounded-lg"
                />
              </div>
            </div>

            {/* Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Menyimpan..." : "Simpan Paket"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

/* Reusable Input Component */
const Input = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold text-gray-600 mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

export default CreatePaket;
