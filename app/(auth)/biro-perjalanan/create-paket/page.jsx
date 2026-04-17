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
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync
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
  const [packages, setPackages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null
  });

  const [activeField, setActiveField] = useState(null);

  // 1. UBAH STATE AWAL: nomorHp menjadi array
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

  useEffect(() => {
    fetchPackages();
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

  const handlePublish = async (id) => {
    try {
      setLoading(true);
      await GlobalApi.publishPaket(id);
      setNotification({
        type: "success",
        message: "Paket berhasil dipublikasikan!"
      });
      fetchPackages();
    } catch (err) {
      setNotification({
        type: "error",
        message: "Gagal mempublikasikan paket"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveField(name);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 2. HANDLER UNTUK DYNAMIC INPUT NOMOR HP
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
    setFormData({ 
      ...formData, 
      nomorHp: newNomorHp.length > 0 ? newNomorHp : [""] 
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const safeFile = await compressImage(file);
      setGambarCover(safeFile);
      setPreview(URL.createObjectURL(safeFile));
    } catch (error) {
      console.error("Gagal memproses gambar cover:", error);
      setNotification({ type: "error", message: "Gagal membaca file gambar." });
    }
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      setGalleryFiles((prev) => [...prev, ...compressedFiles]);
      
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    } catch (error) {
      console.error("Gagal memproses gambar gallery:", error);
      setNotification({ type: "error", message: "Gagal membaca gambar gallery." });
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setGambarCover(null);
    setPreview(null);
    setIsEditMode(false);
    setSelectedId(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
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
              } else {
                reject(new Error("Gagal memproses canvas"));
              }
            },
            "image/jpeg",
            0.8
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
      } else if (fallback !== "") {
        data.append(key, fallback);
      }
    };

    appendSafe("namaPaket", formData.namaPaket);
    appendSafe("destinasi", formData.destinasi);
    appendSafe("durasi", formData.durasi);
    appendSafe("author", formData.author);
    appendSafe("deskripsiPaket", formData.deskripsiPaket);
    appendSafe("persentaseDiskon", formData.persentaseDiskon);
    appendSafe("link", formData.link);

    // 3. PROSES DATA ARRAY NOMOR HP
    const validPhones = formData.nomorHp.filter((hp) => hp.trim() !== "");
    if (validPhones.length > 0) {
      validPhones.forEach((hp) => {
        data.append("nomorHp", hp.trim());
      });
    }

    appendSafe("hargaNormal", formData.hargaNormal, "0");
    appendSafe("hargaDiskon", formData.hargaDiskon, "0");
    appendSafe("ratingPaket", formData.ratingPaket, "0");
    appendSafe("jumlahReview", formData.jumlahReview, "0");
    appendSafe("statusPaket", formData.statusPaket, "DRAFT");

    if (gambarCover) {
      data.append("gambarCover", gambarCover);
    }

    if (galleryFiles && galleryFiles.length > 0) {
      galleryFiles.forEach((file) => {
        data.append("gambarTambahan", file);
      });
    }

    try {
      if (isEditMode) {
        await GlobalApi.updatePaketTour(selectedId, data);
        setNotification({ type: "success", message: "Paket berhasil diperbarui!" });
      } else {
        await GlobalApi.createPaketTour(data);
        setNotification({ type: "success", message: "Paket berhasil disimpan!" });
      }
      resetForm();
      fetchPackages();
    } catch (err) {
      console.error("❌ ERROR DARI SERVER:", err.response?.data || err.message);
      
      let errorMsg = "Gagal memproses data. Cek Console!";
      if (err.response?.status === 413 || (err.response?.data?.message && err.response.data.message.includes("SizeLimitExceeded"))) {
        errorMsg = "Ukuran gambar terlalu besar! Maksimal upload ditolak server.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setNotification({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (pkg) => {
    setIsEditMode(true);
    setSelectedId(pkg.id);
    
    // 4. MEMASUKKAN ARRAY NOMOR HP DARI BE KE FORM
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
          const file = new File([blob], `gambar-lama-${pkg.id}-${i}.jpg`, { type: 'image/jpeg' });
          
          existingFiles.push(file);
        }

        setGalleryPreviews(existingPreviews);
        setGalleryFiles(existingFiles);

      } catch (err) {
        console.error("Gagal memproses ulang gambar lama:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setGalleryPreviews([]);
      setGalleryFiles([]);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    setDeleteModal({ show: true, id: id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ show: false, id: null });

    try {
      await GlobalApi.deletePaket(id);
      setNotification({ type: "success", message: "Paket berhasil dihapus!" });
      fetchPackages();
    } catch (err) {
      setNotification({ type: "error", message: "Gagal menghapus paket" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && <NotificationPopup {...notification} onClose={() => setNotification(null)} />}

      {deleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setDeleteModal({ show: false, id: null })}
          ></div>

          {/* Content */}
          <div className="relative bg-white rounded-xl p-8 shadow-2xl z-10 w-96 text-center transform transition-all duration-300">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-red-100 p-4 rounded-full">
                <FaTrash className="text-red-500 text-3xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-800">Hapus Paket?</h3>
              <p className="text-gray-500 text-center">
                Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus paket ini?
              </p>

              <div className="flex w-full gap-3 mt-4">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-md"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <HeaderMenu />
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className={`transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="max-w-6xl mx-auto space-y-10 mt-20">

          {/* SECTION 1: FORM CREATE/EDIT */}
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
                
                {/* 5. UI DINAMIS MULTIPLE NOMOR WA */}
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
                        <button
                          type="button"
                          onClick={() => removePhoneNumber(index)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                          title="Hapus Nomor"
                        >
                          <FaTimesCircle />
                        </button>
                      )}
                      {index === formData.nomorHp.length - 1 && (
                        <button
                          type="button"
                          onClick={addPhoneNumber}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="Tambah Nomor"
                        >
                          <FaPlus />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Input
                  label="Harga Normal (Rp)"
                  name="hargaNormal"
                  type="number"
                  value={formData.hargaNormal}
                  onChange={handleChange}
                  placeholder="Contoh: 1000000"
                />

                {/* Harga Setelah Diskon */}
                <Input
                  label="Harga Setelah Diskon (Rp)"
                  name="hargaDiskon"
                  type="number"
                  value={formData.hargaDiskon}
                  onChange={handleChange}
                  placeholder="Otomatis jika persen diisi"
                />

                {/* Persentase Diskon */}
                <Input
                  label="Label Diskon (%)"
                  name="persentaseDiskon"
                  value={formData.persentaseDiskon}
                  onChange={handleChange}
                  placeholder="Otomatis jika harga diskon diisi"
                />
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

              {/* UPLOAD GALLERY (MULTIPLE) */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 mt-6">
                <label className="text-xs font-bold text-gray-500 mb-4 block uppercase tracking-wider">Gambar Tambahan (Gallery)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryChange}
                  className="text-sm mb-4 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryPreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-white shadow-sm">
                      <img src={src} className="w-full h-full object-cover" alt="Gallery" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Hapus Gambar"
                      >
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

          {/* SECTION 2: LIST DATA */}
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
                      {/* Kolom Paket */}
                      <td className="px-6 py-4"> {/* Menggunakan px-6 agar sejajar dengan header */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden border flex-shrink-0">
                            {pkg.gambarCover && (
                              <img
                                src={`data:image/jpeg;base64,${pkg.gambarCover}`}
                                className="w-full h-full object-cover"
                                alt="cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate">{pkg.namaPaket}</div>
                            <div className="text-xs text-gray-500 truncate">{pkg.destinasi}</div>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Harga */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {/* Harga Setelah Diskon */}
                          <span className="text-sm font-bold text-blue-700">
                            Rp {pkg.hargaDiskon?.toLocaleString('id-ID')}
                          </span>

                          {/* Harga Normal (Asli) dengan coretan jika ada diskon */}
                          {pkg.hargaNormal && pkg.hargaNormal > pkg.hargaDiskon && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 line-through">
                                Rp {pkg.hargaNormal?.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">
                                {pkg.persentaseDiskon}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Kolom Status - SEKARANG SUDAH DI TENGAH */}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${pkg.statusPaket === 'PUBLISH' || pkg.statusPaket === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                          {pkg.statusPaket}
                        </span>
                      </td>

                      {/* Kolom Aksi */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          {/* Tombol Publish */}
                          {(pkg.statusPaket === 'DRAFT' || pkg.statusPaket === 'PENDING') && (
                            <button
                              onClick={() => handlePublish(pkg.id)}
                              className="text-[10px] font-bold px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all shadow-sm active:scale-95"
                              title="Klik untuk mempublikasikan paket"
                            >
                              PUBLISH
                            </button>
                          )}

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(pkg)}
                              className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <FaTrash size={16} />
                            </button>
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