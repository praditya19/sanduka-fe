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
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync
} from "react-icons/fa";
import { 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  AlignLeft, 
  Upload, 
  Youtube,
  FileText,
  Paperclip,
  Download
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
      // Deteksi ekstensi berdasarkan header Base64
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
    link.download = `Dokumen_${id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors" aria-label="Close">
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
  const [packages, setPackages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activeField, setActiveField] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    type: "PAKET",
    title: "Paket"
  });

  const initialForm = {
    namaPaket: "", durasi: "", destinasi: "", deskripsiPaket: "",
    hargaNormal: "", hargaDiskon: "", persentaseDiskon: "",
    ratingPaket: "0", jumlahReview: "0", author: "", link: "", statusPaket: "DRAFT",
    nomorHp: [""] 
  };

  const [formData, setFormData] = useState(initialForm);
  const [gambarCover, setGambarCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [slides, setSlides] = useState([]);
  const [slideFile, setSlideFile] = useState(null);
  const [slidePreview, setSlidePreview] = useState("");
  const [slideKeterangan, setSlideKeterangan] = useState("");
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);
  const slideFileInputRef = useRef(null);

  const [videoLink, setVideoLink] = useState("");
  const [videoKeterangan, setVideoKeterangan] = useState("");
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  const [infoKeterangan, setInfoKeterangan] = useState("");
  const [infoText, setInfoText] = useState("");
  const [infoFoto, setInfoFoto] = useState(null);
  const [infoFotoPreview, setInfoFotoPreview] = useState("");
  const [infoFile, setInfoFile] = useState(null);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const infoFotoInputRef = useRef(null);
  const infoFileInputRef = useRef(null);

  useEffect(() => {
    fetchPackages();
    fetchSlides(); 
    const savedSidebar = localStorage.getItem("isSidebarOpen");
    if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === "true");
  }, []);

  useEffect(() => {
    const hargaNormal = parseFloat(formData.hargaNormal) || 0;
    const hargaDiskon = parseFloat(formData.hargaDiskon) || 0;
    const persentase = parseFloat(formData.persentaseDiskon) || 0;

    if (hargaNormal > 0) {
      if (activeField === "hargaDiskon") {
        const hitungPersen = Math.round(((hargaNormal - hargaDiskon) / hargaNormal) * 100);
        setFormData((prev) => ({
          ...prev,
          persentaseDiskon: hitungPersen > 0 ? `${hitungPersen}%` : "0%",
        }));
      }

      if (activeField === "persentaseDiskon") {
        const hitungHarga = hargaNormal - (hargaNormal * (persentase / 100));
        setFormData((prev) => ({
          ...prev,
          hargaDiskon: Math.round(hitungHarga).toString(),
        }));
      }
    }
  }, [formData.hargaNormal, formData.hargaDiskon, formData.persentaseDiskon, activeField]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const resp = await GlobalApi.getAllPaket("", 0, 50);
      setPackages(resp.content || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlides = async () => {
    try {
      const data = await GlobalApi.getAllSlidePaket("", 0, 50);
      const slideList = Array.isArray(data) ? data : (data?.content || []);
      setSlides(slideList);
    } catch (error) {
      console.error("Gagal mengambil dokumentasi:", error);
    }
  };

  const handlePublish = async (id) => {
    try {
      setLoading(true);
      await GlobalApi.publishPaket(id);
      setNotification({ type: "success", message: "Paket berhasil dipublikasikan!" });
      fetchPackages();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal mempublikasikan paket" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveField(name);
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (index, value) => {
    const newNomorHp = [...formData.nomorHp];
    newNomorHp[index] = value;
    setFormData({ ...formData, nomorHp: newNomorHp });
  };

  const addPhoneNumber = () => {
    setFormData({ ...formData, nomorHp: [...formData.nomorHp, ""] });
  };

  const removePhoneNumber = (index) => {
    const newNomorHp = formData.nomorHp.filter((_, i) => i !== index);
    setFormData({ ...formData, nomorHp: newNomorHp.length > 0 ? newNomorHp : [""] });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const safeFile = await compressImage(file);
      setGambarCover(safeFile);
      setPreview(URL.createObjectURL(safeFile));
    } catch (error) {
      setNotification({ type: "error", message: "Gagal membaca file gambar." });
    }
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const compressedFiles = await Promise.all(files.map(file => compressImage(file)));
      setGalleryFiles((prev) => [...prev, ...compressedFiles]);
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    } catch (error) {
      setNotification({ type: "error", message: "Gagal membaca gambar gallery." });
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setGambarCover(null); setPreview(null);
    setIsEditMode(false); setSelectedId(null);
    setGalleryFiles([]); setGalleryPreviews([]);
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
          const MAX_WIDTH = 1200;
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
            }, "image/jpeg", 0.8
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();

    const appendSafe = (key, value, fallback = "") => {
      if (value !== undefined && value !== null && String(value) !== "undefined" && String(value).trim() !== "") {
        data.append(key, value);
      } else if (fallback !== "") data.append(key, fallback);
    };

    appendSafe("namaPaket", formData.namaPaket); appendSafe("destinasi", formData.destinasi);
    appendSafe("durasi", formData.durasi); appendSafe("author", formData.author);
    appendSafe("deskripsiPaket", formData.deskripsiPaket); appendSafe("persentaseDiskon", formData.persentaseDiskon);
    appendSafe("link", formData.link);

    const validPhones = formData.nomorHp.filter((hp) => hp.trim() !== "");
    if (validPhones.length > 0) {
      validPhones.forEach((hp) => data.append("nomorHp", hp.trim()));
    }

    appendSafe("hargaNormal", formData.hargaNormal, "0"); appendSafe("hargaDiskon", formData.hargaDiskon, "0");
    appendSafe("ratingPaket", formData.ratingPaket, "0"); appendSafe("jumlahReview", formData.jumlahReview, "0");
    appendSafe("statusPaket", formData.statusPaket, "DRAFT");

    if (gambarCover) data.append("gambarCover", gambarCover);
    if (galleryFiles && galleryFiles.length > 0) {
      galleryFiles.forEach((file) => data.append("gambarTambahan", file));
    }

    try {
      if (isEditMode) {
        await GlobalApi.updatePaketTour(selectedId, data);
        setNotification({ type: "success", message: "Paket berhasil diperbarui!" });
      } else {
        await GlobalApi.createPaketTour(data);
        setNotification({ type: "success", message: "Paket berhasil disimpan!" });
      }
      resetForm(); fetchPackages();
    } catch (err) {
      console.error("❌ ERROR DARI SERVER:", err.response?.data || err.message);
      let errorMsg = "Gagal memproses data. Cek Console!";
      if (err.response?.status === 413 || (err.response?.data?.message && err.response.data.message.includes("SizeLimitExceeded"))) {
        errorMsg = "Ukuran gambar terlalu besar! Maksimal upload ditolak server.";
      } else if (err.response?.data?.message) errorMsg = err.response.data.message;
      setNotification({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (pkg) => {
    setIsEditMode(true);
    setSelectedId(pkg.id);
    setFormData({
      namaPaket: pkg.namaPaket, durasi: pkg.durasi, destinasi: pkg.destinasi,
      deskripsiPaket: pkg.deskripsiPaket, hargaNormal: pkg.hargaNormal,
      hargaDiskon: pkg.hargaDiskon, persentaseDiskon: pkg.persentaseDiskon,
      ratingPaket: pkg.ratingPaket, jumlahReview: pkg.jumlahReview,
      author: pkg.author, link: pkg.link, statusPaket: pkg.statusPaket,
      nomorHp: Array.isArray(pkg.nomorHp) && pkg.nomorHp.length > 0 ? pkg.nomorHp : [""]
    });
    setPreview(pkg.gambarCover ? `data:image/jpeg;base64,${pkg.gambarCover}` : null);
    setGambarCover(null); 

    if (pkg.gambarTambahan && pkg.gambarTambahan.length > 0) {
      setLoading(true);
      try {
        const existingPreviews = [];
        const existingFiles = [];
        for (let i = 0; i < pkg.gambarTambahan.length; i++) {
          const base64String = pkg.gambarTambahan[i];
          const imgSrc = `data:image/jpeg;base64,${base64String}`;
          existingPreviews.push(imgSrc);
          const res = await fetch(imgSrc);
          const blob = await res.blob();
          existingFiles.push(new File([blob], `gambar-lama-${pkg.id}-${i}.jpg`, { type: 'image/jpeg' }));
        }
        setGalleryPreviews(existingPreviews);
        setGalleryFiles(existingFiles);
      } catch (err) {
        console.error("Gagal memproses ulang gambar lama:", err);
      } finally { setLoading(false); }
    } else {
      setGalleryPreviews([]); setGalleryFiles([]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePaket = (id) => {
    setDeleteModal({ show: true, type: "PAKET", id: id, title: "Paket Wisata" });
  };

  const handleDeleteDokumentasi = (id) => {
    setDeleteModal({ show: true, type: "DOKUMENTASI", id: id, title: "Dokumentasi" });
  };

  const confirmDelete = async () => {
    const { id, type } = deleteModal;
    setDeleteModal({ show: false, type: "PAKET", id: null, title: "" });

    try {
      if (type === "PAKET") {
        await GlobalApi.deletePaket(id);
        setNotification({ type: "success", message: "Paket berhasil dihapus!" });
        fetchPackages();
      } else if (type === "DOKUMENTASI") {
        await GlobalApi.deleteSlidePaket(id);
        setNotification({ type: "success", message: "Dokumentasi berhasil dihapus!" });
        fetchSlides();
      }
    } catch (err) {
      setNotification({ type: "error", message: `Gagal menghapus ${type.toLowerCase()}` });
    }
  };

  const handleSlideFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const safeFile = await compressImage(file);
        setSlideFile(safeFile);
        setSlidePreview(URL.createObjectURL(safeFile));
      } catch (error) {
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
      setNotification({ type: "success", message: "Dokumentasi foto berhasil ditambahkan!" });
      
      setSlideFile(null); setSlidePreview(""); setSlideKeterangan("");
      if (slideFileInputRef.current) slideFileInputRef.current.value = "";
      fetchSlides();
    } catch (error) {
      setNotification({ type: "error", message: "Gagal menambahkan dokumentasi foto!" });
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
      
      setVideoLink(""); setVideoKeterangan("");
      fetchSlides();
    } catch (error) {
      setNotification({ type: "error", message: "Gagal menambahkan video dokumentasi!" });
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleInfoFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const safeFile = await compressImage(file);
      setInfoFoto(safeFile);
      setInfoFotoPreview(URL.createObjectURL(safeFile));
    } catch (error) {
      setNotification({ type: "error", message: "Gagal membaca file foto." });
    }
  };

  const handleInfoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setInfoFile(file);
  };

  const handleCreateInfo = async (e) => {
    e.preventDefault();
    
    // Validasi minimal ada salah satu isian (Teks, Foto, atau File)
    if (!infoText.trim() && !infoFoto && !infoFile) {
      setNotification({ type: "error", message: "Minimal isi salah satu: Teks, Foto, atau File!" });
      return;
    }

    try {
      setIsSubmittingInfo(true);
      const formData = new FormData();
      
      // Jika backend secara sistem wajib menerima keteranganFoto, kita beri default string kosong
      formData.append("keteranganFoto", "-"); 
      
      if (infoText) formData.append("text", infoText);
      if (infoFoto) formData.append("foto", infoFoto);
      if (infoFile) formData.append("file", infoFile); 

      await GlobalApi.createSlidePaket(formData);
      setNotification({ type: "success", message: "Informasi/Dokumen berhasil ditambahkan!" });
      
      // Reset Form
      setInfoText("");
      setInfoFoto(null);
      setInfoFotoPreview("");
      setInfoFile(null);
      if (infoFotoInputRef.current) infoFotoInputRef.current.value = "";
      if (infoFileInputRef.current) infoFileInputRef.current.value = "";
      
      // Refresh Data
      fetchSlides();
    } catch (error) {
      setNotification({ type: "error", message: "Gagal menambahkan Informasi/Dokumen!" });
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const renderImageBase64 = (base64String) => {
    if (!base64String) return "/placeholder.jpg";
    if (base64String.startsWith('data:image')) return base64String;
    return `data:image/jpeg;base64,${base64String}`;
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {notification && <NotificationPopup {...notification} onClose={() => setNotification(null)} />}

      {/* MODAL KONFIRMASI DELETE GENERAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteModal({ show: false, id: null, type: "", title: "" })}
          ></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl z-10 w-full max-w-sm text-center transform animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-red-100">
              <FaTrash className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Hapus {deleteModal.title}?</h3>
            <p className="text-gray-500 text-sm mb-8 px-2">
              Tindakan ini permanen dan tidak dapat dibatalkan. Apakah Anda yakin?
            </p>
            <div className="flex w-full gap-3 mt-4">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, type: "", title: "" })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition shadow-lg shadow-red-500/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <HeaderMenu />
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className={`transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="max-w-6xl mx-auto space-y-10 mt-20">

          <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {isEditMode ? <><FaEdit className="text-blue-600" /> Edit Paket Wisata</> : <><FaPlus className="text-green-600" /> Buat Paket Baru</>}
                </h1>
                <p className="text-sm text-gray-500">Kelola informasi paket perjalanan Anda di sini.</p>
              </div>
              {isEditMode && (
                <button onClick={resetForm} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium transition">
                  Batal Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 items-start">
                <Input label="Nama Paket" name="namaPaket" value={formData.namaPaket} onChange={handleChange} required />
                <Input label="Destinasi" name="destinasi" value={formData.destinasi} onChange={handleChange} />
                <Input label="Durasi" name="durasi" value={formData.durasi} onChange={handleChange} />
                <Input label="Author / Penyelenggara" name="author" value={formData.author} onChange={handleChange} />
                
                <div className="flex flex-col col-span-1">
                  <label className="text-xs font-bold text-gray-400 mb-1 uppercase">Nomor WA (Customer Service)</label>
                  {formData.nomorHp.map((hp, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        className="w-full border p-2.5 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
                        value={hp}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder="Contoh: 08123456789"
                      />
                      {formData.nomorHp.length > 1 && (
                        <button type="button" onClick={() => removePhoneNumber(index)} className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Hapus Nomor">
                          <FaTimesCircle />
                        </button>
                      )}
                      {index === formData.nomorHp.length - 1 && (
                        <button type="button" onClick={addPhoneNumber} className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Tambah Nomor">
                          <FaPlus />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Input label="Harga Normal (Rp)" name="hargaNormal" type="number" value={formData.hargaNormal} onChange={handleChange} placeholder="Contoh: 1000000" />
                <Input label="Harga Setelah Diskon (Rp)" name="hargaDiskon" type="number" value={formData.hargaDiskon} onChange={handleChange} placeholder="Otomatis jika persen diisi" />
                <Input label="Label Diskon (%)" name="persentaseDiskon" value={formData.persentaseDiskon} onChange={handleChange} placeholder="Otomatis jika harga diskon diisi" />
                <Input label="Rating" name="ratingPaket" type="number" step="0.1" value={formData.ratingPaket} onChange={handleChange} />
                <Input label="Jumlah Review" name="jumlahReview" type="number" value={formData.jumlahReview} onChange={handleChange} />
                <Input label="Link YouTube" name="link" value={formData.link} onChange={handleChange} placeholder="https://..." />

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-400 mb-1 uppercase">Status</label>
                  <select name="statusPaket" value={formData.statusPaket} onChange={handleChange} className="border p-2.5 rounded-lg bg-gray-50 outline-blue-500 font-medium">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 uppercase">Deskripsi Paket</label>
                <textarea name="deskripsiPaket" rows={4} value={formData.deskripsiPaket} onChange={handleChange} className="w-full border p-3 rounded-lg bg-gray-50 outline-blue-500" />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-48 h-32 bg-white rounded-lg border overflow-hidden flex items-center justify-center">
                    {preview ? <img src={preview} className="w-full h-full object-cover" /> : <span className="text-gray-300 text-xs">Preview Gambar</span>}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Pilih Gambar Cover</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 mt-6">
                <label className="text-xs font-bold text-gray-500 mb-4 block uppercase tracking-wider">Gambar Tambahan (Gallery)</label>
                <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="text-sm mb-4 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryPreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-white shadow-sm">
                      <img src={src} className="w-full h-full object-cover" alt="Gallery" />
                      <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md" title="Hapus Gambar">
                        <FaTimesCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {galleryPreviews.length === 0 && (
                  <p className="text-center text-gray-400 text-xs italic mt-2">Belum ada gambar tambahan yang dipilih</p>
                )}
              </div>

              <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading ? 'bg-gray-400' : isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {loading ? "Memproses..." : isEditMode ? "Update Paket Wisata" : "Simpan Paket Wisata"}
              </button>
            </form>
          </section>

          <section className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Daftar Paket Tersimpan</h2>
              <button onClick={fetchPackages} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><FaSync className={loading ? 'animate-spin' : ''} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Paket</th>
                    <th className="px-6 py-4">Harga</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4"> 
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden border flex-shrink-0">
                            {pkg.gambarCover && (
                              <img src={`data:image/jpeg;base64,${pkg.gambarCover}`} className="w-full h-full object-cover" alt="cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate">{pkg.namaPaket}</div>
                            <div className="text-xs text-gray-500 truncate">{pkg.destinasi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-700">Rp {pkg.hargaDiskon?.toLocaleString('id-ID')}</span>
                          {pkg.hargaNormal && pkg.hargaNormal > pkg.hargaDiskon && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 line-through">Rp {pkg.hargaNormal?.toLocaleString('id-ID')}</span>
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">{pkg.persentaseDiskon}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${pkg.statusPaket === 'PUBLISH' || pkg.statusPaket === 'PUBLISHED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                          {pkg.statusPaket}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          {(pkg.statusPaket === 'DRAFT' || pkg.statusPaket === 'PENDING') && (
                            <button onClick={() => handlePublish(pkg.id)} className="text-[10px] font-bold px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all shadow-sm active:scale-95" title="Klik untuk mempublikasikan paket">
                              PUBLISH
                            </button>
                          )}
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(pkg)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"><FaEdit size={16} /></button>
                            <button onClick={() => handleDeletePaket(pkg.id)} className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition"><FaTrash size={16} /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {packages.length === 0 && !loading && (
                <div className="p-10 text-center text-gray-400 text-sm italic">Belum ada paket wisata yang tersimpan.</div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
            {/* --- KIRI: CARD TAMBAH FOTO DOKUMENTASI --- */}
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
                    onClick={() => slideFileInputRef.current.click()}
                  >
                    {slidePreview ? (
                      <img src={slidePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center z-10">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Klik untuk upload foto</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={slideFileInputRef} onChange={handleSlideFileChange} />
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
                    placeholder="Cth: Dokumentasi Liburan Bali"
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

            {/* --- KANAN: CARD TAMBAH VIDEO DOKUMENTASI --- */}
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
                    <div className="mt-3 relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getYouTubeEmbedUrl(videoLink)}
                        title="Preview Video"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 font-semibold mb-2">Keterangan Video</label>
                  <input
                    type="text"
                    placeholder="Cth: Keseruan Tour Bromo"
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

          {(() => {
            const slideMedia = slides.filter(item => (!item.text && !item.file) && (item.foto || item.link));
            const slideInfo = slides.filter(item => item.text || item.file);

            return (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                  <div className="bg-slate-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" /> Daftar Dokumentasi Travel (Foto & Video)
                    </h2>
                    <span className="bg-white/20 text-white py-1 px-3 rounded-full text-xs font-medium">
                      {slideMedia.length} Item
                    </span>
                  </div>

                  <div className="p-6 md:p-8 bg-gray-50/50">
                    {slideMedia.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada foto atau video dokumentasi.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {slideMedia.map((item) => {
                          const embedUrl = getYouTubeEmbedUrl(item.link);
                          return (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group relative">
                              <button 
                                onClick={() => handleDeleteDokumentasi(item.id)}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-full shadow-md transition-colors z-20 opacity-0 group-hover:opacity-100"
                                title="Hapus Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <div className="relative h-48 bg-gray-100 overflow-hidden border-b border-gray-100 flex items-center justify-center">
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

                              <div className="p-4 flex-1 flex flex-col bg-white">
                                <h4 className="font-bold text-gray-800 line-clamp-2 mb-2 text-sm leading-snug">
                                  {item.keteranganFoto && item.keteranganFoto !== "-" ? item.keteranganFoto : "Dokumentasi"}
                                </h4>
                                <div className="mt-auto pt-3 flex justify-between items-end border-t border-gray-50">
                                  {item.foto ? (
                                    <span className="bg-teal-50 text-teal-600 border border-teal-100 py-1 px-2.5 rounded-lg text-[10px] font-bold tracking-wide">📸 FOTO</span>
                                  ) : (
                                    <span className="bg-red-50 text-red-600 border border-red-100 py-1 px-2.5 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1"><Youtube className="w-3 h-3" /> VIDEO</span>
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

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                  <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Daftar Informasi & Dokumen Terlampir
                    </h2>
                    <span className="bg-white/20 text-white py-1 px-3 rounded-full text-xs font-medium">
                      {slideInfo.length} Item
                    </span>
                  </div>

                  <div className="p-6 md:p-8 bg-gray-50/50">
                    {slideInfo.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada informasi atau file dokumen yang ditambahkan.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {slideInfo.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col relative group hover:shadow-lg transition-shadow">
                            
                            {/* Tombol Hapus Info/File */}
                            <button 
                              onClick={() => handleDeleteDokumentasi(item.id)}
                              className="absolute top-4 right-4 bg-white hover:bg-red-50 text-red-500 p-2 rounded-full shadow-md transition-colors z-20 opacity-0 group-hover:opacity-100 border border-gray-100"
                              title="Hapus Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <h4 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 pr-10">
                              {item.keteranganFoto && item.keteranganFoto !== "-" ? item.keteranganFoto : "Informasi Terkini"}
                            </h4>

                            {item.foto && (
                              <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 h-40 relative group/img cursor-pointer">
                                <img 
                                  src={renderImageBase64(item.foto)} 
                                  alt="Foto Informasi" 
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                                  {/* Jika kamu punya fungsi Zoom, bisa ditambahkan onClick pada icon ini. Karena di CreatePaket belum ada, kita jadikan statis dulu */}
                                  <span className="text-white opacity-0 group-hover/img:opacity-100 drop-shadow-md text-xl font-bold">⤢</span>
                                </div>
                              </div>
                            )}

                            {/* Teks Deskripsi */}
                            {item.text && (
                              <div className="mb-4 flex-grow">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Deskripsi / Teks</label>
                                <textarea
                                  readOnly
                                  value={item.text}
                                  rows={item.foto ? 3 : 5}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none resize-none custom-scrollbar"
                                />
                              </div>
                            )}

                            {/* Area Bawah: Tombol File & Info Tambahan */}
                            <div className="mt-auto flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
                              {item.file ? (
                                <button 
                                  onClick={() => handleDownloadFile(item.file, item.id)}
                                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-colors border border-indigo-200 shadow-sm"
                                >
                                  <Download size={16} /> Unduh File
                                </button>
                              ) : (
                                <div className="flex-1"></div>
                              )}

                              <div className="flex items-center gap-2 ml-auto">
                                <span className={`border py-1 px-2.5 rounded-lg text-[10px] font-bold tracking-wide flex items-center gap-1 ${item.file ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                  {item.file ? '📎 FILE' : item.foto ? '📸 INFO FOTO' : '📝 TEKS'}
                                </span>
                                {item.createdAt && (
                                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                    {`${item.createdAt[2]}/${item.createdAt[1]}/${item.createdAt[0]}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-8">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" /> Tambah Informasi / Dokumen Bebas
              </h2>
              <p className="text-indigo-100 text-xs mt-1">Form ini opsional. Anda bisa mengisi teks saja, foto saja, file saja, atau semuanya.</p>
            </div>
            
            <form onSubmit={handleCreateInfo} className="p-6 md:p-8 space-y-6">
              {/* Baris 1: Text Panjang */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 font-semibold mb-2">Isi Teks (Opsional)</label>
                  <textarea
                    rows={4}
                    placeholder="Tulis informasi detail di sini..."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={infoText}
                    onChange={(e) => setInfoText(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Baris 2: Upload Foto & File */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Input Foto */}
                <div>
                  <label className="text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" /> Upload Foto (Opsional)
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden"
                    onClick={() => infoFotoInputRef.current.click()}
                  >
                    {infoFotoPreview ? (
                      <img src={infoFotoPreview} alt="Preview Info" className="absolute inset-0 w-full h-full object-cover z-0" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center z-10">
                        <Upload className="w-6 h-6 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Klik untuk upload foto</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" ref={infoFotoInputRef} onChange={handleInfoFotoChange} />
                  </div>
                  {infoFotoPreview && (
                    <button type="button" onClick={() => {setInfoFotoPreview(""); setInfoFoto(null);}} className="text-xs text-red-500 hover:underline mt-2">
                      Hapus Foto
                    </button>
                  )}
                </div>

                {/* Input File (PDF/Doc) */}
                <div>
                  <label className="text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-indigo-500" /> Upload File/Dokumen (Opsional)
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
                    onClick={() => infoFileInputRef.current.click()}
                  >
                    {infoFile ? (
                      <div className="flex flex-col items-center text-indigo-600">
                        <FileText className="w-8 h-8 mb-2" />
                        <p className="text-xs font-semibold px-2 text-center line-clamp-2">{infoFile.name}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Klik untuk upload file PDF/Doc</p>
                      </div>
                    )}
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" ref={infoFileInputRef} onChange={handleInfoFileChange} />
                  </div>
                  {infoFile && (
                    <button type="button" onClick={() => setInfoFile(null)} className="text-xs text-red-500 hover:underline mt-2">
                      Hapus File
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingInfo || (!infoText && !infoFoto && !infoFile)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  {isSubmittingInfo ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-400 mb-1 uppercase">{label}</label>
    <input className="border p-2.5 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300" {...props} />
  </div>
);

export default CreatePaket;