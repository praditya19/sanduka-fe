"use client";
import React, { useState, useEffect, useRef } from "react";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import GlobalApi from "@/app/_utils/GlobalApi";
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
    Building,
    Users,
    Upload,
    X,
    Briefcase
} from "lucide-react";

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

const LembagaPage = () => {
    const profileImageUrl = "/profile.png";

    const [lembagaList, setLembagaList] = useState([]);
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: "" });

    const [viewLembaga, setViewLembaga] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    const initialForm = { namaLembaga: "", jenisLembaga: "", keteranganLembaga: "" };
    const [formData, setFormData] = useState(initialForm);
    const [fotoLembaga, setFotoLembaga] = useState(null);
    const [previewLembaga, setPreviewLembaga] = useState(null);

    const [pengurusList, setPengurusList] = useState([
        { namaPengurus: "", posisiPengurus: "", fotoPengurusFile: null, previewUrl: null }
    ]);

    useEffect(() => {
        const role = sessionStorage.getItem("role");
        setUserRole(role);

        if (role === "ADMIN") {
            setFormData((prev) => ({ ...prev, jenisLembaga: "PENGURUS CABANG" }));
        }

        fetchLembaga();
        const savedSidebar = localStorage.getItem("isSidebarOpen");
        if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === "true");
    }, []);

    const fetchLembaga = async () => {
        setLoading(true);
        try {
            const resp = await GlobalApi.getAllLembaga(0, 50, "id", "desc");
            setLembagaList(resp.content || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
                    const MAX_WIDTH = 800;
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

    const handleFotoLembagaChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const safeFile = await compressImage(file);
            setFotoLembaga(safeFile);
            setPreviewLembaga(URL.createObjectURL(safeFile));
        } catch (error) {
            setNotification({ type: "error", message: "Gagal memproses foto lembaga." });
        }
    };

    const addPengurus = () => {
        setPengurusList([...pengurusList, { namaPengurus: "", posisiPengurus: "", fotoPengurusFile: null, previewUrl: null }]);
    };

    const removePengurus = (index) => {
        const newList = pengurusList.filter((_, i) => i !== index);
        setPengurusList(newList);
    };

    const handlePengurusChange = (index, e) => {
        const { name, value } = e.target;
        const newList = [...pengurusList];
        newList[index][name] = value;
        setPengurusList(newList);
    };

    const handleFotoPengurusChange = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const safeFile = await compressImage(file);
            const newList = [...pengurusList];
            newList[index].fotoPengurusFile = safeFile;
            newList[index].previewUrl = URL.createObjectURL(safeFile);
            setPengurusList(newList);
        } catch (error) {
            setNotification({ type: "error", message: "Gagal memproses foto pengurus." });
        }
    };

    const resetForm = () => {
        setFormData({
            namaLembaga: "",
            jenisLembaga: userRole === "ADMIN" ? "PENGURUS CABANG" : "",
            keteranganLembaga: ""
        });
        setFotoLembaga(null);
        setPreviewLembaga(null);
        setPengurusList([{ namaPengurus: "", posisiPengurus: "", fotoPengurusFile: null, previewUrl: null }]);
        setIsEditMode(false);
        setSelectedId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();

        data.append("namaLembaga", formData.namaLembaga);
        if (formData.jenisLembaga) data.append("jenisLembaga", formData.jenisLembaga);
        if (formData.keteranganLembaga) data.append("keteranganLembaga", formData.keteranganLembaga);
        if (fotoLembaga) data.append("fotoLembaga", fotoLembaga);

        pengurusList.forEach((p) => {
            if (p.namaPengurus && p.namaPengurus.trim() !== "") {
                data.append("namaPengurus", p.namaPengurus);
                data.append("posisiPengurus", p.posisiPengurus || "-");

                if (p.fotoPengurusFile) {
                    data.append("fotoPengurus", p.fotoPengurusFile);
                } else {
                    data.append("fotoPengurus", new Blob([], { type: "application/octet-stream" }), "empty.txt");
                }
            }
        });

        try {
            if (isEditMode) {
                await GlobalApi.updateLembaga(selectedId, data);
                setNotification({ type: "success", message: "Data Lembaga berhasil diperbarui!" });
            } else {
                await GlobalApi.createLembaga(data);
                setNotification({ type: "success", message: "Lembaga baru berhasil disimpan!" });
            }
            resetForm();
            fetchLembaga();
        } catch (err) {
            console.error("Error submit:", err);
            setNotification({ type: "error", message: "Gagal menyimpan data. Server tidak merespon." });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item) => {
        setIsEditMode(true);
        setSelectedId(item.id);
        setFormData({
            namaLembaga: item.namaLembaga || "",
            jenisLembaga: item.jenisLembaga || (userRole === "ADMIN" ? "PENGURUS CABANG" : ""),
            keteranganLembaga: item.keteranganLembaga || "",
        });

        if (item.fotoLembaga) {
            const preview = `data:image/jpeg;base64,${item.fotoLembaga}`;
            setPreviewLembaga(preview);
            try {
                const res = await fetch(preview);
                const blob = await res.blob();
                setFotoLembaga(new File([blob], "lembaga_lama.jpg", { type: "image/jpeg" }));
            } catch (e) { console.error("Gagal covert foto lembaga", e); }
        } else {
            setFotoLembaga(null);
            setPreviewLembaga(null);
        }

        if (item.pengurus && item.pengurus.length > 0) {
            setLoading(true);
            try {
                const mappedPengurus = await Promise.all(item.pengurus.map(async (p, idx) => {
                    let existingFile = null;
                    let preview = null;

                    if (p.fotoPengurus) {
                        preview = `data:image/jpeg;base64,${p.fotoPengurus}`;
                        try {
                            const res = await fetch(preview);
                            const blob = await res.blob();
                            existingFile = new File([blob], `pengurus_lama_${idx}.jpg`, { type: "image/jpeg" });
                        } catch (e) { console.error("Gagal convert foto pengurus", e); }
                    }

                    return {
                        namaPengurus: p.namaPengurus || "",
                        posisiPengurus: p.posisiPengurus || "",
                        fotoPengurusFile: existingFile,
                        previewUrl: preview
                    };
                }));
                setPengurusList(mappedPengurus);
            } finally {
                setLoading(false);
            }
        } else {
            setPengurusList([{ namaPengurus: "", posisiPengurus: "", fotoPengurusFile: null, previewUrl: null }]);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const confirmDelete = async () => {
        try {
            await GlobalApi.deleteLembaga(deleteModal.id);
            setNotification({ type: "success", message: "Lembaga berhasil dihapus!" });
            fetchLembaga();
        } catch (err) {
            setNotification({ type: "error", message: "Gagal menghapus lembaga." });
        } finally {
            setDeleteModal({ show: false, id: null, title: "" });
        }
    };

    const renderImageBase64 = (byteData) => {
        if (!byteData) return null;
        if (typeof byteData === 'string' && byteData.startsWith('data:image')) return byteData;
        return `data:image/jpeg;base64,${byteData}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {notification && <NotificationPopup {...notification} onClose={() => setNotification(null)} />}

            {deleteModal.show && (
                <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, id: null, title: "" })}></div>
                    <div className="relative bg-white rounded-3xl p-8 shadow-2xl z-10 w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-red-100">
                            <FaTrash className="text-red-500 text-3xl" />
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Hapus {deleteModal.title}?</h3>
                        <p className="text-gray-500 text-sm mb-8 px-2">Data yang dihapus tidak dapat dikembalikan. Lanjutkan?</p>
                        <div className="flex w-full gap-3 mt-4">
                            <button onClick={() => setDeleteModal({ show: false, id: null, title: "" })} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition shadow-lg shadow-red-500/30">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            <HeaderMenu />
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className={`transition-all duration-300 p-6 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <div className="max-w-6xl mx-auto space-y-10 mt-20">

                    <section className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    {isEditMode ? <><FaEdit /> Edit Lembaga</> : <><Building /> Tambah Lembaga Baru</>}
                                </h1>
                                <p className="text-indigo-100 text-sm mt-1">Kelola data lembaga beserta susunan kepengurusannya.</p>
                            </div>
                            {isEditMode && (
                                <button type="button" onClick={resetForm} className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition">
                                    Batal Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><Building size={20} className="text-indigo-500" /> Profil Lembaga</h3>
                                <div className="grid md:grid-cols-2 gap-6 items-start">
                                    <div className="space-y-4">
                                        <Input label="Nama Lembaga" name="namaLembaga" value={formData.namaLembaga} onChange={handleChange} required />

                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                                Jenis Lembaga <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="jenisLembaga"
                                                value={formData.jenisLembaga}
                                                onChange={handleChange}
                                                required
                                                disabled={userRole === "ADMIN"}
                                                className={`border-2 border-gray-200 p-3 rounded-xl focus:ring-4 outline-none transition-all font-medium appearance-none ${userRole === "ADMIN"
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed opacity-80"
                                                        : "bg-gray-50 text-gray-700 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/10 cursor-pointer"
                                                    }`}
                                            >
                                                <option value="" disabled>-- Pilih Jenis --</option>
                                                <option value="PENGURUS KABUPATEN">PENGURUS KABUPATEN</option>
                                                <option value="PENGURUS CABANG">PENGURUS CABANG</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Keterangan / Deskripsi</label>
                                            <textarea name="keteranganLembaga" rows={4} value={formData.keteranganLembaga} onChange={handleChange} className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider text-center">Foto / Logo Lembaga</label>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-40 h-40 bg-white rounded-2xl border shadow-sm overflow-hidden flex items-center justify-center relative group">
                                                {previewLembaga ? (
                                                    <img src={previewLembaga} className="w-full h-full object-cover" alt="Preview Logo" />
                                                ) : (
                                                    <Building className="w-12 h-12 text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-gray-100 transition">
                                                        Ganti Foto
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleFotoLembagaChange} />
                                                    </label>
                                                </div>
                                            </div>
                                            {!previewLembaga && (
                                                <label className="cursor-pointer bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-100 transition flex items-center gap-2">
                                                    <Upload size={16} /> Pilih Foto
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleFotoLembagaChange} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Users size={20} className="text-indigo-500" /> Susunan Pengurus</h3>
                                    <button type="button" onClick={addPengurus} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                                        <FaPlus /> Tambah Pengurus
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {pengurusList.map((p, index) => (
                                        <div key={index} className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-center relative group">
                                            {pengurusList.length > 1 && (
                                                <button type="button" onClick={() => removePengurus(index)} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100 z-10" title="Hapus Pengurus">
                                                    <X size={14} />
                                                </button>
                                            )}

                                            <div className="flex-shrink-0 relative">
                                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center">
                                                    <img
                                                        src={p.previewUrl ? p.previewUrl : profileImageUrl}
                                                        className="w-full h-full object-cover"
                                                        alt="Pengurus"
                                                    />
                                                </div>
                                                <label className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-600 shadow-md transition border-2 border-white">
                                                    <Upload size={12} />
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFotoPengurusChange(index, e)} />
                                                </label>
                                            </div>

                                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nama Pengurus</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Users size={16} /></span>
                                                        <input type="text" name="namaPengurus" value={p.namaPengurus} onChange={(e) => handlePengurusChange(index, e)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Nama Lengkap" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Posisi / Jabatan</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Briefcase size={16} /></span>
                                                        <input type="text" name="posisiPengurus" value={p.posisiPengurus} onChange={(e) => handlePengurusChange(index, e)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Cth: Ketua, Sekretaris..." />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg text-lg flex justify-center items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                    {loading ? "Menyimpan Data..." : isEditMode ? "Perbarui Data Lembaga" : "Simpan Data Lembaga"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* DAFTAR LEMBAGA (READ) */}
                    <section className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Building size={20} /> Daftar Lembaga Terdaftar</h2>
                            <button onClick={fetchLembaga} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition"><FaSync className={loading ? 'animate-spin' : ''} /></button>
                        </div>

                        <div className="p-6">
                            {lembagaList.length === 0 && !loading ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">Belum ada data lembaga yang terdaftar.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {lembagaList
                                        .filter(item => userRole === "ADMIN" ? item.jenisLembaga === "PENGURUS CABANG" : true)
                                        .map((item) => (
                                            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                                                <div className="flex p-5 gap-5 border-b border-gray-100">
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border flex-shrink-0 flex items-center justify-center">
                                                        {item.fotoLembaga ? (
                                                            <img src={renderImageBase64(item.fotoLembaga)} alt={item.namaLembaga} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building className="w-10 h-10 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">{item.jenisLembaga || "Lembaga"}</span>
                                                        <h3 className="font-bold text-lg text-gray-800 mt-1 mb-1">{item.namaLembaga}</h3>
                                                        <p className="text-xs text-gray-500 line-clamp-2">{item.keteranganLembaga}</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50 flex-1">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pengurus Terdaftar ({item.pengurus ? item.pengurus.length : 0})</p>
                                                    {item.pengurus && item.pengurus.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.pengurus.slice(0, 3).map((p, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 bg-white border px-2 py-1.5 rounded-lg shadow-sm">
                                                                    {/* FOTO PENGURUS BISA DIZOOM */}
                                                                    <img
                                                                        src={p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl}
                                                                        className="w-6 h-6 rounded-full object-cover border cursor-pointer hover:scale-110 transition-transform"
                                                                        alt=""
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setLightboxImage(p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl);
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <p className="text-[10px] font-bold text-gray-800 leading-none">{p.namaPengurus}</p>
                                                                        <p className="text-[9px] text-gray-500 leading-none mt-0.5">{p.posisiPengurus}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {item.pengurus.length > 3 && (
                                                                <button
                                                                    onClick={() => setViewLembaga(item)}
                                                                    className="flex items-center justify-center px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors rounded-lg text-[10px] font-bold cursor-pointer"
                                                                >
                                                                    Lihat Semua ({item.pengurus.length})
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">Tidak ada pengurus terdaftar.</p>
                                                    )}

                                                    {item.pengurus && item.pengurus.length > 0 && item.pengurus.length <= 3 && (
                                                        <button
                                                            onClick={() => setViewLembaga(item)}
                                                            className="mt-3 w-full py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors rounded-lg text-[10px] font-bold cursor-pointer"
                                                        >
                                                            Buka Detail Pengurus
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex border-t border-gray-100">
                                                    <button onClick={() => handleEdit(item)} className="flex-1 py-3 bg-white hover:bg-gray-50 text-blue-600 text-sm font-bold flex items-center justify-center gap-2 transition">
                                                        <FaEdit /> Edit Data
                                                    </button>
                                                    <div className="w-[1px] bg-gray-100"></div>
                                                    <button onClick={() => setDeleteModal({ show: true, id: item.id, title: item.namaLembaga })} className="flex-1 py-3 bg-white hover:bg-red-50 text-red-500 text-sm font-bold flex items-center justify-center gap-2 transition">
                                                        <FaTrash /> Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>

            {viewLembaga && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] flex items-center justify-center p-4 transition-opacity duration-300"
                    onClick={() => setViewLembaga(null)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                                    {viewLembaga.fotoLembaga ? (
                                        <img src={renderImageBase64(viewLembaga.fotoLembaga)} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="text-gray-400 w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">Susunan Pengurus</h3>
                                    <p className="text-sm font-medium text-indigo-600">{viewLembaga.namaLembaga}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewLembaga(null)}
                                className="p-2.5 bg-white border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white rounded-b-3xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {viewLembaga.pengurus.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0 flex items-center justify-center border border-gray-200 cursor-pointer">
                                            <img
                                                src={p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl}
                                                alt={p.namaPengurus}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLightboxImage(p.fotoPengurus ? renderImageBase64(p.fotoPengurus) : profileImageUrl);
                                                }}
                                            />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-gray-800 truncate" title={p.namaPengurus}>
                                                {p.namaPengurus}
                                            </p>
                                            <p className="text-xs text-indigo-600 font-medium truncate flex items-center gap-1 mt-1" title={p.posisiPengurus}>
                                                <Briefcase className="w-3 h-3" /> {p.posisiPengurus}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
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
                        alt="Zoomed view"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

        </div>
    );
};

const Input = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        <input className="border-2 border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-400" {...props} />
    </div>
);

export default LembagaPage;