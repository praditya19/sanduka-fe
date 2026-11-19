"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi, { BASE_URL } from "@/app/_utils/GlobalApi";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaWhatsapp,
} from "react-icons/fa";
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  Calendar,
  MapPin,
  User,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building2,
  Layers,
  Users,
  ChevronDown,
  ZoomIn,
  Sparkles,
  Printer,
  FileCheck,
  Camera,
  Clock,
  BarChart3,
} from "lucide-react";
import EventStatistikBatang from "@/app/_components/EventStatistikBatang";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";

// --- Helper Resolusi Modul jsPDF & autoTable ---
const getJsPDF = (mod) => {
  if (!mod) return null;
  if (typeof mod.jsPDF === "function") return mod.jsPDF;
  if (typeof mod.default === "function") return mod.default;
  if (mod.default && typeof mod.default.jsPDF === "function") return mod.default.jsPDF;
  if (typeof mod === "function") return mod;
  return null;
};

const getAutoTable = (mod) => {
  if (!mod) return null;
  if (typeof mod === "function") return mod;
  if (typeof mod.default === "function") return mod.default;
  if (typeof mod.autoTable === "function") return mod.autoTable;
  return null;
};

// Fallback drawer jika plugin autoTable terkendala di browser
const drawFallbackTable = (doc, headers, rows) => {
  const startX = 14;
  let startY = 32;
  const colWidths = [10, 45, 25, 12, 42, 30, 40, 26, 20, 10];
  const rowHeight = 7;

  doc.setFillColor(13, 148, 136);
  doc.rect(startX, startY - 5, 270, rowHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let currentX = startX;
  headers.forEach((h, i) => {
    doc.text(String(h), currentX + 1, startY);
    currentX += colWidths[i] || 25;
  });

  startY += rowHeight;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  rows.forEach((row, rIdx) => {
    if (startY > 190) {
      doc.addPage();
      startY = 20;
    }
    if (rIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, startY - 5, 270, rowHeight, "F");
    }
    currentX = startX;
    row.forEach((cell, cIdx) => {
      const cellText = String(cell);
      const truncated = cellText.length > 22 ? cellText.slice(0, 22) + "..." : cellText;
      doc.text(truncated, currentX + 1, startY);
      currentX += colWidths[cIdx] || 25;
    });
    startY += rowHeight;
  });
};

// --- Notification Popup Component ---
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
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-800";
      default:
        return "bg-sky-50 border-sky-200 text-sky-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="text-emerald-500 w-8 h-8" />;
      case "error":
        return <AlertCircle className="text-rose-500 w-8 h-8" />;
      default:
        return <Sparkles className="text-sky-500 w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative ${getBgColor()} border rounded-2xl p-6 shadow-2xl z-10 w-full max-w-sm text-center transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm">{getIcon()}</div>
          <h3 className="text-lg font-bold">
            {type === "success" ? "Berhasil!" : "Pemberitahuan"}
          </h3>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Helper ambil source foto kehadiran (URL, Base64, atau endpoint)
const getFotoKehadiranSrc = (item, getImageSrc) => {
  if (!item) return null;
  const raw =
    item.fotoKehadiran ||
    item.foto_kehadiran ||
    item.fotoPresensi ||
    item.fotoAbsensi ||
    item.fotoKehadiranUrl ||
    item.fileKehadiranUrl;
  if (!raw) return null;
  if (typeof raw === "string") {
    if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    if (raw.startsWith("/")) {
      return `${BASE_URL}${raw}`;
    }
    return getImageSrc ? getImageSrc(raw) : `data:image/jpeg;base64,${raw}`;
  }
  return null;
};

// Helper badge tampilan role peserta
const formatRoleBadge = (roleStr) => {
  const r = String(roleStr || "Peserta").toUpperCase();
  if (r.includes("PANITIA")) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200 shadow-xs">
        Panitia
      </span>
    );
  }
  if (r.includes("SUPERADMIN") || r.includes("ADMIN")) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200 shadow-xs">
        {r.includes("SUPER") ? "Superadmin" : "Admin"}
      </span>
    );
  }
  if (r.includes("NARASUMBER") || r.includes("PEMATERI")) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200 shadow-xs">
        Narasumber
      </span>
    );
  }
  if (r.includes("MODERATOR")) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-xs">
        Moderator
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
      {roleStr || "Peserta"}
    </span>
  );
};

// --- Avatar Peserta dengan Foto Profil Asli & Fallback Inisial ---
const PesertaAvatar = ({ item, getImageSrc, onPreview }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const npa = item?.npa || item?.npaPgri;

  // Bangun daftar candidate sources foto berdasarkan prioritas:
  // 1. Swafoto Kehadiran jika peserta sudah absen
  // 2. Foto Profil Anggota via API (/api/foto-anggota/{npa})
  // 3. Foto KTA (file/base64 yang diunggah saat daftar event) jika bukan PDF
  const candidateSources = useMemo(() => {
    const list = [];

    // 1. Foto Kehadiran
    const fotoKehadiran = getFotoKehadiranSrc(item, getImageSrc);
    if (fotoKehadiran) {
      list.push({ src: fotoKehadiran, type: "kehadiran" });
    } else if (item?.fileKehadiranUrl) {
      const url = item.fileKehadiranUrl.startsWith("http")
        ? item.fileKehadiranUrl
        : `${BASE_URL}${item.fileKehadiranUrl}`;
      list.push({ src: url, type: "kehadiran" });
    }

    // 2. Foto Profil Anggota berdasarkan NPA
    if (npa) {
      list.push({
        src: `${BASE_URL}/api/foto-anggota/${encodeURIComponent(npa)}`,
        type: "anggota",
      });
    }

    // 3. Foto KTA yang diunggah saat pendaftaran event (selama bukan file PDF)
    const isPdfKta =
      (item?.fileKtaName && item.fileKtaName.toLowerCase().endsWith(".pdf")) ||
      (item?.fileKtaUrl && item.fileKtaUrl.toLowerCase().includes(".pdf"));

    if (!isPdfKta) {
      if (item?.foto) {
        const src = getImageSrc(item.foto);
        if (src) list.push({ src, type: "kta" });
      }
      if (item?.fileKtaUrl) {
        const url = item.fileKtaUrl.startsWith("http")
          ? item.fileKtaUrl
          : `${BASE_URL}${item.fileKtaUrl}`;
        list.push({ src: url, type: "kta" });
      }
    }

    return list;
  }, [item, npa, getImageSrc]);

  // Reset state jika data item / npa berubah
  useEffect(() => {
    setSourceIndex(0);
    setLoaded(false);
  }, [item?.id, npa]);

  const currentCandidate = candidateSources[sourceIndex];

  const handleImgError = () => {
    setLoaded(false);
    setSourceIndex((prev) => prev + 1);
  };

  const handleImgLoad = (e) => {
    if (e.currentTarget.naturalWidth === 0 || e.currentTarget.naturalHeight === 0) {
      handleImgError();
    } else {
      setLoaded(true);
    }
  };

  // Jika semua candidate sudah dicoba dan tidak ada yang berhasil, tampilkan avatar inisial
  if (!currentCandidate || sourceIndex >= candidateSources.length) {
    return (
      <div
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs select-none"
        title={item.namaLengkap || "Peserta"}
      >
        {item.namaLengkap?.charAt(0)?.toUpperCase() || "P"}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onPreview &&
        onPreview({
          src: currentCandidate.src,
          imageSrc: currentCandidate.src,
          title: `Foto ${item.namaLengkap || "Peserta"}`,
          peserta: item,
        })
      }
      className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/90 shadow-xs shrink-0 hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer relative bg-slate-100 flex items-center justify-center group/avatar"
      title="Klik untuk melihat foto peserta"
    >
      {/* Background inisial sementara foto dimuat, cegah kotak putih kosong */}
      <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-teal-600 select-none bg-teal-50">
        {item.namaLengkap?.charAt(0)?.toUpperCase() || "P"}
      </span>

      <img
        key={currentCandidate.src}
        src={currentCandidate.src}
        alt={item.namaLengkap || "Peserta"}
        onError={handleImgError}
        onLoad={handleImgLoad}
        className={`w-full h-full object-cover object-center relative z-10 transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        } group-hover/avatar:scale-105 transition-transform`}
        loading="lazy"
      />
    </button>
  );
};

// --- Modal Detail Peserta ---
const PesertaDetailModal = ({
  peserta,
  onClose,
  getImageSrc,
  formatTanggalDaftar,
  getWhatsAppNumber,
  handleDownloadFile,
  cetakPdfKta,
}) => {
  const [modalImgIndex, setModalImgIndex] = useState(0);
  if (!peserta) return null;

  const npaVal = peserta.npa || peserta.npaPgri;

  const ktaSrc = peserta.foto
    ? getImageSrc(peserta.foto)
    : peserta.fileKtaUrl
      ? `${BASE_URL}${peserta.fileKtaUrl}`
      : null;

  const candidateModalPhotos = [
    getFotoKehadiranSrc(peserta, getImageSrc),
    peserta.fileKehadiranUrl ? `${BASE_URL}${peserta.fileKehadiranUrl}` : null,
    npaVal ? `${BASE_URL}/api/foto-anggota/${encodeURIComponent(npaVal)}` : null,
    ktaSrc,
  ].filter(Boolean);

  const activePhotoSrc = candidateModalPhotos[modalImgIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Detail Profil Peserta</h2>
              <p className="text-xs text-teal-100">{peserta.namaEvent || "Event"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top User Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
            {/* Avatar / Foto */}
            <div className="relative group shrink-0">
              {activePhotoSrc ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-300 shadow-md bg-white flex items-center justify-center">
                  <img
                    src={activePhotoSrc}
                    alt={peserta.namaLengkap || "Foto"}
                    onError={() => setModalImgIndex((prev) => prev + 1)}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold text-3xl shadow-md">
                  {peserta.namaLengkap?.charAt(0)?.toUpperCase() || "P"}
                </div>
              )}
            </div>

            {/* Nama & Badges */}
            <div className="text-center sm:text-left space-y-2 flex-1">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{peserta.namaLengkap || "-"}</h3>
                <p className="text-sm text-gray-500">Event: {peserta.namaEvent || "-"}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                  NPA: {peserta.npa || "-"}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  JK: {peserta.jenisKelamin || "-"}
                </span>
                {formatRoleBadge(peserta.role || peserta.peran)}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                  Daftar: {formatTanggalDaftar(peserta.tanggalDaftar)}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Informasi Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-400 block mb-1">Cabang / Wilayah</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{peserta.cabang || "-"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-400 block mb-1">Unit Kerja / Instansi</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{peserta.unitKerja || "-"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-400 block mb-1">Nomor Handphone</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{peserta.nomorHp || "-"}</span>
                </div>
                {getWhatsAppNumber(peserta.nomorHp) && (
                  <a
                    href={`https://wa.me/${getWhatsAppNumber(peserta.nomorHp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition shadow-sm"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5" />
                    Chat WA
                  </a>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-400 block mb-1">Dokumen Materi</span>
              {peserta.upload || peserta.fileMateriUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    if (peserta.fileMateriUrl) {
                      window.open(`${BASE_URL}${peserta.fileMateriUrl}`, "_blank");
                    } else {
                      handleDownloadFile(peserta.upload, `dokumen-${peserta.namaLengkap || "peserta"}`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Berkas Materi
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">Tidak ada berkas materi</span>
              )}
            </div>

            {/* Kehadiran & Tag Location Card */}
            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-400 block mb-1">Kehadiran & Tag Location</span>
              <div className="space-y-1.5 mt-1">
                <div>
                  {(() => {
                    const isHadir =
                      peserta.kehadiran === true ||
                      peserta.isHadir === true ||
                      String(peserta.kehadiran || peserta.statusKehadiran || "").toUpperCase() === "HADIR" ||
                      Boolean(peserta.waktuKehadiran || peserta.jamKehadiran);

                    if (isHadir) {
                      const waktu = peserta.waktuKehadiran || peserta.jamKehadiran;
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hadir {waktu ? `(${waktu})` : ""}</span>
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Belum Hadir</span>
                      </span>
                    );
                  })()}
                </div>

                <div>
                  {(() => {
                    const tagLoc =
                      peserta.tagLocation ||
                      peserta.tag_location ||
                      peserta.lokasi ||
                      peserta.lokasiKehadiran ||
                      peserta.alamatLokasi;
                    const lat = peserta.latitude;
                    const lng = peserta.longitude;

                    if (lat && lng) {
                      return (
                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200 transition"
                          title="Buka lokasi di Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{tagLoc || `${lat}, ${lng}`}</span>
                          <ExternalLink className="w-3 h-3 text-teal-500 shrink-0" />
                        </a>
                      );
                    }
                    if (tagLoc) {
                      return (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tagLoc}</span>
                        </div>
                      );
                    }
                    return <span className="text-xs text-gray-400 italic">Lokasi belum terdeteksi</span>;
                  })()}
                </div>
              </div>
            </div>

            {/* Foto Kehadiran Card */}
            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-xs font-medium text-gray-400 block mb-1">Foto Kehadiran</span>
              {(() => {
                const fotoSrc = getFotoKehadiranSrc(peserta, getImageSrc);
                if (fotoSrc) {
                  return (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 shadow-sm shrink-0">
                        <img
                          src={fotoSrc}
                          alt="Foto Kehadiran"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={fotoSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Buka Foto
                      </a>
                    </div>
                  );
                }
                return (
                  <span className="text-xs text-gray-400 italic flex items-center gap-1.5 mt-2">
                    <Camera className="w-3.5 h-3.5 text-gray-300" />
                    Belum ada foto kehadiran
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Keterangan / Link */}
          {peserta.jabatan && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Keterangan / Informasi Tambahan
              </span>
              {peserta.jabatan.startsWith("http://") || peserta.jabatan.startsWith("https://") ? (
                <a
                  href={peserta.jabatan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline break-all"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  {peserta.jabatan}
                </a>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {peserta.jabatan}
                </p>
              )}
            </div>
          )}

          {/* Download & Cetak Bukti Pendaftaran Event */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl bg-teal-50 border border-teal-200 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-600 text-white rounded-xl">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-900 block">
                  Bukti Pendaftaran Event
                </span>
                <span className="text-[11px] text-teal-700">
                  Tanda bukti pendaftaran resmi dan identitas peserta event
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ktaSrc && (
                <a
                  href={ktaSrc}
                  download={peserta.fileKtaName || `Berkas-${peserta.namaLengkap || "peserta"}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 bg-white text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Berkas Pendaftaran
                </a>
              )}
              <button
                type="button"
                onClick={() => cetakPdfKta(peserta)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-sm hover:shadow transition"
              >
                <Printer className="w-4 h-4" />
                Cetak Bukti Pendaftaran (PDF)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => cetakPdfKta(peserta)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200 transition"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            Cetak Bukti Pendaftaran (PDF)
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Lightbox Preview Foto KTA ---
const ImageLightboxModal = ({ imageSrc, title, peserta, onClose, cetakPdfKta }) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-sm font-semibold text-gray-800 truncate">
            {title || "Foto Dokumen KTA"}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-gray-900/5 max-h-[70vh] overflow-auto">
          <img
            src={imageSrc}
            alt={title || "Preview"}
            className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
          />
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-gray-500">Klik kanan untuk simpan gambar</span>
          <div className="flex items-center gap-2">
            <a
              href={imageSrc}
              download={`foto-${title || "kta"}.jpg`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Foto
            </a>
            {peserta && (
              <button
                type="button"
                onClick={() => cetakPdfKta(peserta)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Bukti Pendaftaran
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Halaman Utama ---
const Page = () => {
  const [pesertaList, setPesertaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filter States
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [queryCabang, setQueryCabang] = useState("");
  const [eventOptions, setEventOptions] = useState([]);
  const [eventParticipantCounts, setEventParticipantCounts] = useState({});
  const [selectedEvent, setSelectedEvent] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedTahunDaftar, setSelectedTahunDaftar] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all"); // "all" | "active" | "completed"

  // Pagination & Display
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modals & Display Sections
  const [selectedPesertaDetail, setSelectedPesertaDetail] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);
  const [showPdfDropdown, setShowPdfDropdown] = useState(false);
  const [showStatistikBatang, setShowStatistikBatang] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const { token } = useAuth();

  const dataPeserta = async (namaEvent = "", cabang = "") => {
    setLoading(true);
    try {
      const fetchedData = await GlobalApi.getAllDaftarPesertaEvent(namaEvent, cabang);
      setPesertaList(fetchedData || []);
    } catch (err) {
      console.error("Error mengambil data peserta:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const normalizeEventName = (name) => {
    if (!name) return "";
    return String(name).trim().toLowerCase().replace(/\s+/g, " ");
  };

  const tahunDaftarOptions = useMemo(() => {
    return [
      ...new Set(
        pesertaList.map((item) => item?.tanggalDaftar?.[0]).filter(Boolean)
      ),
    ].sort((a, b) => b - a);
  }, [pesertaList]);

  const getImageSrc = (base64) => {
    if (!base64) return null;
    return `data:image/jpeg;base64,${base64}`;
  };

  const handleDeleteClick = (id) => {
    if (!role || role === "USER") return;
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId || !role || role === "USER") return;
    setLoadingDelete(true);
    try {
      await GlobalApi.deletePeserta(selectedId);
      await dataPeserta(selectedEvent, selectedCabang);
      await fetchEvent();
      setShowDeleteModal(false);
      setSelectedId(null);
      setNotification({
        type: "success",
        message: "Data peserta berhasil dihapus",
      });
    } catch (err) {
      console.error("Gagal hapus:", err);
      setNotification({
        type: "error",
        message: "Gagal menghapus data peserta",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const fetchCabang = async () => {
    try {
      const res = await GlobalApi.getCabang();
      setCabangOptions(res?.data || []);
    } catch (err) {
      console.error("Gagal ambil cabang:", err);
    }
  };

  const handleCabangSelect = (cabang) => {
    setSelectedCabang(cabang.kecamatan || "");
    setShowDropdownCabang(false);
  };

  const fetchEvent = async () => {
    try {
      const [eventResponse, participantResponse] = await Promise.all([
        GlobalApi.getSidebarGalleryByCategory("event", true),
        GlobalApi.getAllDaftarPesertaEvent(),
      ]);

      const participantCounts = (participantResponse || []).reduce(
        (counts, participant) => {
          const eventName = participant?.namaEvent;
          if (eventName) {
            const key = normalizeEventName(eventName);
            counts[key] = (counts[key] || 0) + 1;
          }
          return counts;
        },
        {}
      );

      const sortedEvents = (eventResponse || []).sort((a, b) => {
        const aTerlewat = !!a.isTerlewat;
        const bTerlewat = !!b.isTerlewat;
        if (aTerlewat !== bTerlewat) return aTerlewat ? 1 : -1;
        return Number(b.id) - Number(a.id);
      });

      setEventOptions(sortedEvents);
      setEventParticipantCounts(participantCounts);
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
    }
  };

  // Map status event (isTerlewat) untuk memfilter peserta
  const eventStatusMap = useMemo(() => {
    const map = {};
    eventOptions.forEach((e) => {
      map[normalizeEventName(e.namaEvent)] = Boolean(e.isTerlewat);
    });
    return map;
  }, [eventOptions]);

  // Handler toggle filter status event (all | active | completed)
  const handleStatusFilterChange = (status) => {
    setEventStatusFilter(status);
    // Jika event yang sedang dipilih bertolak belakang dengan filter status baru, reset selectedEvent
    if (selectedEvent && status !== "all") {
      const isCompleted = eventStatusMap[normalizeEventName(selectedEvent)];
      if ((status === "active" && isCompleted) || (status === "completed" && !isCompleted)) {
        setSelectedEvent("");
      }
    }
  };

  // Filtered List
  const filteredPesertaList = useMemo(() => {
    return pesertaList.filter((item) => {
      // 1. Filter status event: masih aktif vs sudah terlaksana
      if (eventStatusFilter !== "all") {
        const isCompleted = eventStatusMap[normalizeEventName(item?.namaEvent)];
        if (eventStatusFilter === "active" && isCompleted) return false;
        if (eventStatusFilter === "completed" && !isCompleted) return false;
      }

      // 2. Filter tahun jika dipilih
      if (selectedTahunDaftar) {
        const tahun = item?.tanggalDaftar?.[0];
        if (String(tahun) !== String(selectedTahunDaftar)) {
          return false;
        }
      }

      // 3. Pencarian
      if (!searchText.trim()) return true;
      const keyword = searchText.toLowerCase().trim();

      if (role === "USER") {
        return String(item?.namaLengkap ?? "").toLowerCase().includes(keyword);
      }

      return (
        String(item?.namaLengkap ?? "").toLowerCase().includes(keyword) ||
        String(item?.npa ?? "").toLowerCase().includes(keyword) ||
        String(item?.cabang ?? "").toLowerCase().includes(keyword) ||
        String(item?.unitKerja ?? "").toLowerCase().includes(keyword) ||
        String(item?.nomorHp ?? "").toLowerCase().includes(keyword) ||
        String(item?.namaEvent ?? "").toLowerCase().includes(keyword) ||
        String(item?.jabatan ?? "").toLowerCase().includes(keyword) ||
        String(item?.role ?? item?.peran ?? "").toLowerCase().includes(keyword) ||
        String(item?.tagLocation ?? item?.tag_location ?? item?.lokasi ?? "").toLowerCase().includes(keyword) ||
        String(item?.kehadiran ?? item?.statusKehadiran ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [pesertaList, searchText, selectedTahunDaftar, eventStatusFilter, eventStatusMap, role]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedEvent, selectedCabang, selectedTahunDaftar, eventStatusFilter, itemsPerPage]);

  const paginatedList = useMemo(() => {
    if (itemsPerPage === -1) return filteredPesertaList;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPesertaList.slice(start, start + itemsPerPage);
  }, [filteredPesertaList, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredPesertaList.length / itemsPerPage);

  const formatTanggalDaftar = (tanggal) => {
    if (!tanggal || !Array.isArray(tanggal) || tanggal.length < 3) {
      return "-";
    }
    const [tahun, bulan, hari] = tanggal;
    return `${String(hari).padStart(2, "0")}-${String(bulan).padStart(2, "0")}-${tahun}`;
  };

  const getWhatsAppNumber = (nomorHp) => {
    const digits = String(nomorHp || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("62")) return digits;
    return `62${digits.startsWith("0") ? digits.slice(1) : digits}`;
  };

  // --- Fungsi Cetak Bukti Pendaftaran Event (PDF) ---
  const cetakBuktiPendaftaranEvent = async (item) => {
    if (!item) return;
    try {
      setLoading(true);
      const jspdfModule = await import("jspdf");
      const jsPDF = getJsPDF(jspdfModule);

      if (!jsPDF) {
        throw new Error("Modul jsPDF tidak dapat dimuat.");
      }

      if (typeof window !== "undefined") {
        window.jsPDF = jsPDF;
        window.jspdf = jspdfModule;
      }

      const doc = new jsPDF("p", "mm", "a4");

      const primaryColor = [13, 148, 136]; // Teal 600
      const darkColor = [15, 23, 42]; // Slate 900
      const grayColor = [100, 116, 139]; // Slate 500

      // 1. Header decorative bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 7, "F");

      // 2. Kop Surat / Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...darkColor);
      doc.text("PERSATUAN GURU REPUBLIK INDONESIA", 105, 17, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text("BUKTI PENDAFTARAN RESMI PESERTA EVENT", 105, 23, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...grayColor);
      doc.text(
        "Sistem Informasi Manajemen Event Sanduka - PGRI Kabupaten Jepara",
        105,
        28,
        { align: "center" }
      );

      // Divider line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(15, 32, 195, 32);

      // 3. Info Event Badge
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(204, 251, 241);
      doc.roundedRect(15, 36, 180, 20, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text("EVENT / KEGIATAN:", 20, 42);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...darkColor);
      const eventName = String(item.namaEvent || "-").toUpperCase();
      doc.text(eventName.length > 40 ? eventName.slice(0, 40) + "..." : eventName, 20, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(`Tgl Pendaftaran: ${formatTanggalDaftar(item.tanggalDaftar)}`, 20, 53);

      // Kolom kanan Info Event: No Registrasi & Status Presensi
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...grayColor);
      doc.text("No. Registrasi", 120, 42);
      doc.text(":", 145, 42);
      doc.setTextColor(...darkColor);
      doc.text(`REG-EVT-${item.id || "001"}`, 148, 42);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayColor);
      doc.text("Status", 120, 48);
      doc.text(":", 145, 48);
      const isHadir = String(item.kehadiran || "").toUpperCase() === "HADIR";
      doc.setFont("helvetica", "bold");
      if (isHadir) {
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text("HADIR (TERVERIFIKASI)", 148, 48);
      } else {
        doc.setTextColor(...primaryColor);
        doc.text("TERDAFTAR RESMI", 148, 48);
      }

      // 4. Data Biodata Peserta (Box Form)
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, 60, 180, 50, 2, 2, "FD");

      // Header Biodata
      doc.setFillColor(...primaryColor);
      doc.roundedRect(15, 60, 180, 7.5, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("BIODATA PESERTA", 20, 65);

      // Fields Grid
      doc.setFontSize(8.5);
      const leftLabels = [
        ["Nama Lengkap", item.namaLengkap || "-"],
        ["NPA PGRI", item.npa || "-"],
        ["Jenis Kelamin", item.jenisKelamin || "-"],
      ];
      const rightLabels = [
        ["Cabang / Wilayah", item.cabang || "-"],
        ["Unit Kerja / Instansi", item.unitKerja || "-"],
        ["Nomor Handphone", item.nomorHp || "-"],
      ];

      let rowY = 74;
      leftLabels.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grayColor);
        doc.text(label, 20, rowY);
        doc.text(":", 48, rowY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkColor);
        doc.text(String(val), 52, rowY);
        rowY += 8.5;
      });

      rowY = 74;
      rightLabels.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grayColor);
        doc.text(label, 108, rowY);
        doc.text(":", 142, rowY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkColor);
        const truncatedVal =
          String(val).length > 25 ? String(val).slice(0, 25) + "..." : String(val);
        doc.text(truncatedVal, 146, rowY);
        rowY += 8.5;
      });

      if (item.jabatan) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grayColor);
        doc.text("Keterangan / Karya", 20, 101);
        doc.text(":", 48, 101);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...darkColor);
        const ketText =
          String(item.jabatan).length > 70
            ? String(item.jabatan).slice(0, 70) + "..."
            : String(item.jabatan);
        doc.text(ketText, 52, 101);
      }

      // 5. Box Lampiran Dokumen / Identitas Pendaftar
      const ktaBoxY = 114;
      const ktaBoxHeight = 120;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, ktaBoxY, 180, ktaBoxHeight, 2, 2, "FD");

      doc.setFillColor(241, 245, 249);
      doc.rect(15, ktaBoxY, 180, 7.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      doc.text("LAMPIRAN DOKUMEN / IDENTITAS PENDAFTARAN", 20, ktaBoxY + 5.2);

      const rawSrc = item.foto
        ? getImageSrc(item.foto)
        : item.fileKtaUrl
          ? `${BASE_URL}${item.fileKtaUrl}`
          : item.fileKehadiranUrl
            ? `${BASE_URL}${item.fileKehadiranUrl}`
            : item.npa
              ? `${BASE_URL}/api/foto-anggota/${encodeURIComponent(item.npa)}`
              : null;

      let imageLoaded = false;
      if (rawSrc) {
        try {
          let base64Data = rawSrc;
          if (!base64Data.startsWith("data:")) {
            const fetched = await fetch(base64Data);
            const blob = await fetched.blob();
            base64Data = await new Promise((res) => {
              const reader = new FileReader();
              reader.onloadend = () => res(reader.result);
              reader.readAsDataURL(blob);
            });
          }

          if (base64Data && base64Data.startsWith("data:")) {
            const dims = await new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () =>
                resolve({
                  w: img.naturalWidth || img.width,
                  h: img.naturalHeight || img.height,
                });
              img.onerror = () => resolve({ w: 400, h: 250 });
              img.src = base64Data;
            });

            const maxW = 150;
            const maxH = 100;
            const ratio = Math.min(maxW / dims.w, maxH / dims.h);
            const renderW = dims.w * ratio;
            const renderH = dims.h * ratio;
            const renderX = 15 + (180 - renderW) / 2;
            const renderY = ktaBoxY + 11 + (maxH - renderH) / 2;

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(203, 213, 225);
            doc.roundedRect(renderX - 1, renderY - 1, renderW + 2, renderH + 2, 1, 1, "FD");

            doc.addImage(base64Data, "JPEG", renderX, renderY, renderW, renderH);
            imageLoaded = true;
          }
        } catch (err) {
          console.error("Gagal menempelkan foto ke Bukti Pendaftaran:", err);
        }
      }

      if (!imageLoaded) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.text(
          "Dokumen identitas pendaftar terverifikasi secara digital dalam sistem.",
          105,
          ktaBoxY + 58,
          { align: "center" }
        );
      }

      // 6. Footer & Catatan Validasi
      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(...grayColor);
      doc.text(
        `* Lembar ini merupakan Tanda Bukti Pendaftaran Resmi kegiatan PGRI Sanduka yang sah dan diterbitkan pada ${dateStr} pukul ${timeStr} WIB.`,
        15,
        242
      );
      doc.text(
        "* Harap membawa atau menunjukkan bukti pendaftaran ini saat registrasi ulang / presensi di lokasi kegiatan.",
        15,
        246
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      doc.text(`Dicetak pada: ${dateStr}`, 145, 255);
      doc.text("Panitia Pelaksana Event,", 145, 260);

      doc.setFont("helvetica", "bold");
      doc.text("Seksi Kepesertaan Sanduka", 145, 280);

      const safeEvent = String(item.namaEvent || "EVENT").replace(/[^a-zA-Z0-9]/g, "_");
      const safeName = String(item.namaLengkap || "Peserta").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`BUKTI_PENDAFTARAN_${safeEvent}_${safeName}.pdf`);

      setNotification({
        type: "success",
        message: `Bukti pendaftaran event untuk ${item.namaLengkap || "peserta"} berhasil diunduh.`,
      });
    } catch (err) {
      console.error("Error generating Bukti Pendaftaran PDF:", err);
      setNotification({
        type: "error",
        message: "Gagal membuat Bukti Pendaftaran: " + (err?.message || "Kesalahan"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Alias untuk kompatibilitas
  const cetakPdfKta = cetakBuktiPendaftaranEvent;

  // --- Fungsi Cetak PDF Rekapitulasi Peserta ---
  const handleDownloadPdfRekap = async () => {
    try {
      setLoading(true);

      let dataToPrint = [];
      if (!selectedEvent && !selectedCabang && !selectedTahunDaftar && !searchText.trim() && eventStatusFilter === "all") {
        dataToPrint = pesertaList.length > 0 ? pesertaList : (await GlobalApi.getAllDaftarPesertaEvent()) || [];
      } else {
        dataToPrint = filteredPesertaList;
      }

      if (!dataToPrint || dataToPrint.length === 0) {
        setNotification({
          type: "error",
          message: "Data peserta kosong, tidak ada yang dapat dicetak!",
        });
        return;
      }

      const jspdfModule = await import("jspdf");
      const jsPDF = getJsPDF(jspdfModule);

      if (!jsPDF) {
        throw new Error("Modul jsPDF tidak dapat dimuat.");
      }

      if (typeof window !== "undefined") {
        window.jsPDF = jsPDF;
        window.jspdf = jspdfModule;
      }

      let autoTable = null;
      try {
        const autoTableModule = await import("jspdf-autotable");
        autoTable = getAutoTable(autoTableModule);
      } catch (e) {
        console.warn("Dynamic import autoTable gagal, akan menggunakan fallback table", e);
      }

      const doc = new jsPDF("l", "mm", "a4");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("DAFTAR REKAPITULASI PESERTA EVENT", 148, 13, { align: "center" });

      const infoStatus =
        eventStatusFilter === "active"
          ? " • Status: Masih Aktif"
          : eventStatusFilter === "completed"
            ? " • Status: Sudah Terlaksana"
            : "";

      doc.setFontSize(10);
      doc.setTextColor(13, 148, 136);
      doc.text(
        (selectedEvent ? `Event: ${selectedEvent}` : "Semua Event Terdaftar") + infoStatus,
        148,
        19,
        { align: "center" }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const infoCabang = selectedCabang ? `Cabang: ${selectedCabang} | ` : "";
      doc.text(
        `${infoCabang}Total Peserta: ${dataToPrint.length} | Dicetak: ${new Date().toLocaleDateString("id-ID")}`,
        148,
        24,
        { align: "center" }
      );

      const tableData = dataToPrint.map((item, idx) => {
        const hasKta = Boolean(item.foto || item.fileKtaUrl || item.hasFileKta);
        const statusHadir =
          item.kehadiran === true ||
            item.isHadir === true ||
            String(item.kehadiran || item.statusKehadiran || "").toUpperCase() === "HADIR" ||
            Boolean(item.waktuKehadiran || item.jamKehadiran)
            ? "Hadir"
            : "Belum";

        return [
          idx + 1,
          String(item.namaLengkap || "-"),
          String(item.namaEvent || "-"),
          String(item.cabang || "-"),
          String(item.unitKerja || "-"),
          String(item.nomorHp || "-"),
          formatTanggalDaftar(item.tanggalDaftar),
          item.upload || item.hasFileMateri ? "Ada" : "-",
          hasKta ? (item.fileKtaUrl ? "Lihat File ↗" : "Terlampir") : "-",
          statusHadir,
          String(item.role || item.peran || "Peserta"),
        ];
      });

      const tableConfig = {
        startY: 28,
        margin: { left: 10, right: 10 },
        head: [
          [
            "No",
            "Nama Lengkap",
            "Event",
            "Cabang",
            "Unit Kerja",
            "No. HP",
            "Tgl Daftar",
            "Materi",
            "File KTA",
            "Kehadiran",
            "Role",
          ],
        ],
        body: tableData,
        theme: "striped",
        styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
        headStyles: {
          fillColor: [13, 148, 136],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          5: { cellWidth: 26 },
          6: { cellWidth: 18, halign: "center" },
          7: { cellWidth: 14, halign: "center" },
          8: { cellWidth: 18, halign: "center", textColor: [13, 148, 136] },
          9: { cellWidth: 18, halign: "center" },
          10: { cellWidth: 18, halign: "center" },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 8) {
            const item = dataToPrint[data.row.index];
            if (item?.fileKtaUrl) {
              doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
                url: `${BASE_URL}${item.fileKtaUrl}`,
              });
            }
          }
        },
      };

      let tableRendered = false;
      try {
        if (typeof autoTable === "function") {
          autoTable(doc, tableConfig);
          tableRendered = true;
        } else if (typeof doc.autoTable === "function") {
          doc.autoTable(tableConfig);
          tableRendered = true;
        }
      } catch (autoErr) {
        console.warn("Panggilan autoTable error, menggunakan fallback drawer:", autoErr);
      }

      if (!tableRendered) {
        drawFallbackTable(doc, tableConfig.head[0], tableConfig.body);
      }

      const safeEvent = (selectedEvent || "Semua_Event").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`Rekap_Peserta_${safeEvent}.pdf`);

      setNotification({
        type: "success",
        message: "Rekap data peserta PDF berhasil diunduh.",
      });
    } catch (error) {
      console.error("Gagal cetak rekap PDF:", error);
      setNotification({
        type: "error",
        message: "Gagal cetak rekap PDF: " + (error?.message || "Kesalahan sistem"),
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Fungsi Cetak Berkas KTA (Lengkap dengan Foto KTA Asli Peserta) ---
  const handleDownloadBatchKtaPdf = async () => {
    try {
      setLoading(true);

      const targetList =
        itemsPerPage !== -1 && paginatedList.length > 0
          ? paginatedList
          : filteredPesertaList.slice(0, 50);

      if (!targetList || targetList.length === 0) {
        setNotification({
          type: "error",
          message: "Tidak ada data peserta untuk dicetak!",
        });
        return;
      }

      setNotification({
        type: "success",
        message: `Menyiapkan berkas KTA (${targetList.length} peserta)...`,
      });

      const jspdfModule = await import("jspdf");
      const jsPDF = getJsPDF(jspdfModule);
      if (!jsPDF) throw new Error("Gagal memuat modul jsPDF.");

      if (typeof window !== "undefined") {
        window.jsPDF = jsPDF;
        window.jspdf = jspdfModule;
      }

      const doc = new jsPDF("p", "mm", "a4");
      const primaryColor = [13, 148, 136];
      const darkColor = [15, 23, 42];
      const grayColor = [100, 116, 139];

      for (let i = 0; i < targetList.length; i++) {
        if (i > 0) doc.addPage();
        const item = targetList[i];

        // 1. Header decorative bar
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 7, "F");

        // 2. Kop Surat / Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...darkColor);
        doc.text("PERSATUAN GURU REPUBLIK INDONESIA", 105, 17, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text("DOKUMEN KARTU TANDA ANGGOTA (KTA) & BUKTI PESERTA", 105, 23, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...grayColor);
        doc.text("Sistem Informasi Manajemen Event Sanduka - PGRI", 105, 28, { align: "center" });

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(15, 32, 195, 32);

        // 3. Info Event Badge
        doc.setFillColor(240, 253, 250);
        doc.setDrawColor(204, 251, 241);
        doc.roundedRect(15, 36, 180, 14, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text("EVENT TERDAFTAR:", 20, 42);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...darkColor);
        doc.text(String(item.namaEvent || "-").toUpperCase(), 58, 42);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(`Tgl Pendaftaran: ${formatTanggalDaftar(item.tanggalDaftar)}`, 20, 47);

        // 4. Data Biodata Peserta (Box Form)
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, 54, 180, 52, 2, 2, "FD");

        doc.setFillColor(...primaryColor);
        doc.roundedRect(15, 54, 180, 8, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`BIODATA PESERTA (${i + 1} dari ${targetList.length})`, 20, 59.5);

        doc.setFontSize(8.5);
        const leftLabels = [
          ["Nama Lengkap", item.namaLengkap || "-"],
          ["NPA PGRI", item.npa || "-"],
          ["Jenis Kelamin", item.jenisKelamin || "-"],
        ];
        const rightLabels = [
          ["Cabang / Wilayah", item.cabang || "-"],
          ["Unit Kerja / Instansi", item.unitKerja || "-"],
          ["Nomor Handphone", item.nomorHp || "-"],
        ];

        let rowY = 69;
        leftLabels.forEach(([label, val]) => {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...grayColor);
          doc.text(label, 20, rowY);
          doc.text(":", 48, rowY);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...darkColor);
          doc.text(String(val), 52, rowY);
          rowY += 9;
        });

        rowY = 69;
        rightLabels.forEach(([label, val]) => {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...grayColor);
          doc.text(label, 108, rowY);
          doc.text(":", 142, rowY);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...darkColor);
          const truncatedVal =
            String(val).length > 25 ? String(val).slice(0, 25) + "..." : String(val);
          doc.text(truncatedVal, 146, rowY);
          rowY += 9;
        });

        if (item.jabatan) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...grayColor);
          doc.text("Keterangan", 20, 96);
          doc.text(":", 48, 96);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkColor);
          const ketText =
            String(item.jabatan).length > 70
              ? String(item.jabatan).slice(0, 70) + "..."
              : String(item.jabatan);
          doc.text(ketText, 52, 96);
        }

        // 5. Box Lampiran Foto KTA Asli
        const ktaBoxY = 110;
        const ktaBoxHeight = 125;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, ktaBoxY, 180, ktaBoxHeight, 2, 2, "FD");

        doc.setFillColor(241, 245, 249);
        doc.rect(15, ktaBoxY, 180, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...darkColor);
        doc.text("LAMPIRAN FOTO / SCAN KARTU TANDA ANGGOTA (KTA) ASLI", 20, ktaBoxY + 5.5);

        const rawSrc = item.foto
          ? getImageSrc(item.foto)
          : item.fileKtaUrl
            ? `${BASE_URL}${item.fileKtaUrl}`
            : null;

        let imageLoaded = false;
        if (rawSrc) {
          try {
            let base64Data = rawSrc;
            if (!base64Data.startsWith("data:")) {
              const fetched = await fetch(base64Data);
              const blob = await fetched.blob();
              base64Data = await new Promise((res) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result);
                reader.readAsDataURL(blob);
              });
            }

            if (base64Data && base64Data.startsWith("data:")) {
              const dims = await new Promise((resolve) => {
                const img = new window.Image();
                img.onload = () =>
                  resolve({
                    w: img.naturalWidth || img.width,
                    h: img.naturalHeight || img.height,
                  });
                img.onerror = () => resolve({ w: 400, h: 250 });
                img.src = base64Data;
              });

              const maxW = 150;
              const maxH = 105;
              const ratio = Math.min(maxW / dims.w, maxH / dims.h);
              const renderW = dims.w * ratio;
              const renderH = dims.h * ratio;
              const renderX = 15 + (180 - renderW) / 2;
              const renderY = ktaBoxY + 11 + (maxH - renderH) / 2;

              doc.setFillColor(248, 250, 252);
              doc.setDrawColor(203, 213, 225);
              doc.roundedRect(renderX - 1, renderY - 1, renderW + 2, renderH + 2, 1, 1, "FD");

              doc.addImage(base64Data, "JPEG", renderX, renderY, renderW, renderH);
              imageLoaded = true;
            }
          } catch (err) {
            console.error("Gagal tempel foto KTA:", err);
          }
        }

        if (!imageLoaded) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(...grayColor);
          doc.text(
            "Foto / Scan Kartu Tanda Anggota (KTA) tidak terlampir.",
            105,
            ktaBoxY + 60,
            { align: "center" }
          );
        }

        // 6. Footer
        const now = new Date();
        const dateStr = now.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const timeStr = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(...grayColor);
        doc.text(
          `* Dokumen ini sah dan diterbitkan otomatis oleh Sistem Sanduka PGRI pada ${dateStr} pukul ${timeStr} WIB. (Hal. ${i + 1}/${targetList.length})`,
          15,
          244
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...darkColor);
        doc.text(`Dicetak pada: ${dateStr}`, 145, 253);
        doc.text("Panitia Pelaksana Event,", 145, 258);

        doc.setFont("helvetica", "bold");
        doc.text("Seksi Kepesertaan Sanduka", 145, 278);
      }

      const safeEvent = (selectedEvent || "Event").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`Berkas_KTA_${safeEvent}_${targetList.length}_Peserta.pdf`);

      setNotification({
        type: "success",
        message: `Berkas KTA (${targetList.length} peserta) berhasil diunduh!`,
      });
    } catch (err) {
      console.error("Gagal cetak berkas KTA:", err);
      setNotification({
        type: "error",
        message: "Gagal cetak berkas KTA: " + (err?.message || "Kesalahan sistem"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPeserta = async () => {
    try {
      setLoading(true);
      let dataToDownload = [];
      if (!selectedEvent && !selectedCabang && !selectedTahunDaftar && !searchText) {
        const res = await GlobalApi.getAllDaftarPesertaEvent();
        dataToDownload = res || [];
      } else {
        dataToDownload = filteredPesertaList;
      }

      if (!dataToDownload.length) {
        alert("Data kosong!");
        return;
      }

      const formattedData = dataToDownload.map((item, index) => {
        const fotoKehadiranSrc = getFotoKehadiranSrc(item, getImageSrc);
        const tagLoc =
          item.tagLocation ||
          item.tag_location ||
          item.lokasi ||
          item.lokasiKehadiran ||
          item.alamatLokasi ||
          (item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-");

        const statusHadir =
          item.kehadiran === true ||
            item.isHadir === true ||
            String(item.kehadiran || item.statusKehadiran || "").toUpperCase() === "HADIR" ||
            Boolean(item.waktuKehadiran || item.jamKehadiran)
            ? `Hadir${item.waktuKehadiran ? ` (${item.waktuKehadiran})` : ""}`
            : "Belum Hadir";

        return {
          No: index + 1,
          "Nama Lengkap": item.namaLengkap || "-",
          Event: item.namaEvent || "-",
          Cabang: item.cabang || "-",
          "Unit Kerja": item.unitKerja || "-",
          "Nomor HP": item.nomorHp || "-",
          "NPA PGRI": item.npa || "-",
          "Jenis Kelamin": item.jenisKelamin || "-",
          "Tanggal Daftar": formatTanggalDaftar(item.tanggalDaftar),
          "File Materi": item.upload || item.hasFileMateri ? "Tersedia" : "-",
          "File KTA": item.foto || item.hasFileKta ? "Tersedia" : "-",
          "Foto Kehadiran": fotoKehadiranSrc ? "Tersedia" : "-",
          Kehadiran: statusHadir,
          "Tag Location": tagLoc || "-",
          Role: item.role || item.peran || "Peserta",
          Keterangan: item.jabatan || "-",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta");
      XLSX.writeFile(
        workbook,
        `Data_Peserta_${selectedEvent ? selectedEvent.slice(0, 20) : "Event"}.xlsx`
      );
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal download data!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (base64, fileName = "dokumen") => {
    if (!base64) return;
    try {
      let base64Data = base64;
      let mimeType = "application/octet-stream";
      let extension = "bin";

      if (base64.includes(",")) {
        const parts = base64.split(",");
        const metadata = parts[0];
        base64Data = parts[1];
        const mimeMatch = metadata.match(/data:(.*?);base64/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }

      if (base64Data.startsWith("/9j/")) {
        mimeType = "image/jpeg";
        extension = "jpg";
      } else if (base64Data.startsWith("iVBORw0KGgo")) {
        mimeType = "image/png";
        extension = "png";
      } else if (base64Data.startsWith("JVBERi0")) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (base64Data.startsWith("R0lGOD")) {
        mimeType = "image/gif";
        extension = "gif";
      } else if (base64Data.startsWith("UklGR")) {
        mimeType = "image/webp";
        extension = "webp";
      } else if (base64Data.startsWith("UEsDB")) {
        mimeType = "application/vnd.openxmlformats-officedocument";
        extension = "zip";
      }

      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }

      const blob = new Blob(byteArrays, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${fileName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Gagal mendownload file:", error);
    }
  };

  useEffect(() => {
    dataPeserta(selectedEvent, selectedCabang);
  }, [selectedEvent, selectedCabang]);

  useEffect(() => {
    fetchCabang();
    fetchEvent();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#cabangInputContainer")) {
        setShowDropdownCabang(false);
      }
      if (!e.target.closest("#pdfDropdownContainer")) {
        setShowPdfDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const userRole = sessionStorage.getItem("role") || "";
    setRole(userRole);
    if (userRole === "USER") {
      const nama = sessionStorage.getItem("nama") || "";
      setSearchText(nama.split(",")[0].trim());
    }
  }, []);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const isSuperAdmin = role === "SUPERADMIN";

  const filteredEventOptions = useMemo(() => {
    return eventOptions.filter((e) => {
      if (eventStatusFilter === "active" && e.isTerlewat) return false;
      if (eventStatusFilter === "completed" && !e.isTerlewat) return false;
      if (eventSearchQuery.trim()) {
        const q = eventSearchQuery.toLowerCase();
        if (!String(e.namaEvent || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [eventOptions, eventStatusFilter, eventSearchQuery]);

  const activeEventsCount = useMemo(() => {
    return eventOptions.filter((e) => !e.isTerlewat).length;
  }, [eventOptions]);

  const completedEventsCount = useMemo(() => {
    return eventOptions.filter((e) => e.isTerlewat).length;
  }, [eventOptions]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      {notification && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Modal Detail Peserta */}
      {selectedPesertaDetail && (
        <PesertaDetailModal
          peserta={selectedPesertaDetail}
          onClose={() => setSelectedPesertaDetail(null)}
          getImageSrc={getImageSrc}
          formatTanggalDaftar={formatTanggalDaftar}
          getWhatsAppNumber={getWhatsAppNumber}
          handleDownloadFile={handleDownloadFile}
          cetakPdfKta={cetakPdfKta}
        />
      )}

      {/* Lightbox Foto KTA */}
      {lightboxData && (
        <ImageLightboxModal
          imageSrc={lightboxData.src}
          title={lightboxData.title}
          peserta={lightboxData.peserta}
          onClose={() => setLightboxData(null)}
          cetakPdfKta={cetakPdfKta}
        />
      )}

      {isMobile ? <HeaderMobile /> : <HeaderMenu />}

      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`min-w-0 w-full flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "ml-0"
            }`}
        >
          <div className="min-w-0 p-4 sm:p-6 lg:p-8 pt-20 bg-slate-50/70 min-h-screen mt-10">
            {/* Header Banner */}
            <div className="mb-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/70 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 shrink-0">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                          Data Peserta Event
                        </h1>
                        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                          {role === "USER" ? "Anggota" : "Administrator"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {role === "USER"
                          ? "Riwayat pendaftaran, dokumen, dan kartu tanda anggota (KTA) kegiatan Anda"
                          : "Kelola, pantau, dan verifikasi seluruh peserta kegiatan secara terorganisir"}
                      </p>
                    </div>
                  </div>

                  {/* Ringkasan Metric & Tombol Filter Cepat (Admin) */}
                  {role !== "USER" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange("all")}
                        className={`text-left rounded-2xl px-4 py-3 transition-all duration-200 border cursor-pointer ${eventStatusFilter === "all"
                            ? "bg-teal-50 border-teal-500 shadow-sm ring-2 ring-teal-500/20"
                            : "bg-slate-50 border-slate-200/80 hover:bg-white hover:border-slate-300"
                          }`}
                        title="Klik untuk tampilkan semua event"
                      >
                        <span className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-teal-600" />
                            Total Peserta
                          </span>
                          {eventStatusFilter === "all" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                          )}
                        </span>
                        <p className="text-xl font-bold text-slate-800 mt-0.5">
                          {pesertaList.length}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusFilterChange(eventStatusFilter === "active" ? "all" : "active")
                        }
                        className={`text-left rounded-2xl px-4 py-3 transition-all duration-200 border cursor-pointer ${eventStatusFilter === "active"
                            ? "bg-emerald-100/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/30"
                            : "bg-emerald-50/60 border-emerald-200/60 hover:bg-emerald-50 hover:border-emerald-300"
                          }`}
                        title="Klik untuk memfilter event yang masih aktif"
                      >
                        <span className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Masih Aktif
                          </span>
                          {eventStatusFilter === "active" && (
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                              Filter ON
                            </span>
                          )}
                        </span>
                        <p className="text-xl font-bold text-emerald-800 mt-0.5">
                          {activeEventsCount}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusFilterChange(
                            eventStatusFilter === "completed" ? "all" : "completed"
                          )
                        }
                        className={`hidden sm:block text-left rounded-2xl px-4 py-3 transition-all duration-200 border cursor-pointer ${eventStatusFilter === "completed"
                            ? "bg-amber-100/90 border-amber-500 shadow-sm ring-2 ring-amber-500/30"
                            : "bg-amber-50/60 border-amber-200/60 hover:bg-amber-50 hover:border-amber-300"
                          }`}
                        title="Klik untuk memfilter event yang sudah terlaksana"
                      >
                        <span className="text-xs font-semibold text-amber-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            Terlaksana
                          </span>
                          {eventStatusFilter === "completed" && (
                            <span className="text-[10px] font-bold bg-amber-600 text-white px-1.5 py-0.2 rounded-full">
                              Filter ON
                            </span>
                          )}
                        </span>
                        <p className="text-xl font-bold text-amber-800 mt-0.5">
                          {completedEventsCount}
                        </p>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Aksi Cepat: Statistik Batang */}
            {role !== null && role !== "USER" && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatistikBatang((prev) => {
                      const nextState = !prev;
                      if (nextState) {
                        setTimeout(() => {
                          document
                            .getElementById("statistikBatangSection")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 120);
                      }
                      return nextState;
                    });
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    showStatistikBatang
                      ? "bg-teal-600 text-white shadow-teal-500/25 ring-2 ring-teal-500/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>
                    {showStatistikBatang ? "Tutup Statistik Batang" : "Lihat Statistik Model Batang"}
                  </span>
                </button>
              </div>
            )}

            {/* SELEKTOR EVENT (Admin / Staff) */}
            {role !== null && role !== "USER" && eventOptions.length > 0 && (
              <div className="mb-6 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-600" />
                    <h2 className="text-base font-bold text-slate-800">
                      Pilih & Filter Berdasarkan Event
                    </h2>
                    {selectedEvent && (
                      <span className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                        Event: {selectedEvent}
                        <button
                          onClick={() => setSelectedEvent("")}
                          className="hover:bg-teal-200 rounded-full p-0.5"
                          title="Hapus filter event"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Segmented Button Filter Status Event */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventStatusFilter === "all"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                          }`}
                      >
                        Semua ({eventOptions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange("active")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${eventStatusFilter === "active"
                            ? "bg-white text-emerald-700 shadow-sm"
                            : "text-emerald-700 hover:text-emerald-800"
                          }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif ({activeEventsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange("completed")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${eventStatusFilter === "completed"
                            ? "bg-white text-amber-700 shadow-sm"
                            : "text-amber-700 hover:text-amber-800"
                          }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        Terlaksana ({completedEventsCount})
                      </button>
                    </div>

                    {/* Search box nama event */}
                    {eventOptions.length > 4 && (
                      <div className="relative w-full sm:w-56">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Cari nama event..."
                          value={eventSearchQuery}
                          onChange={(e) => setEventSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent("")}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${!selectedEvent
                        ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-500 shadow-sm ring-2 ring-teal-500/20"
                        : "bg-slate-50/50 border-slate-200 hover:bg-white hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${!selectedEvent
                            ? "bg-teal-600 text-white shadow-sm"
                            : "bg-slate-200 text-slate-700"
                          }`}
                      >
                        ALL
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-800">Semua Event</h4>
                        <p className="text-xs text-slate-500">Tampilkan seluruh data</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                      {pesertaList.length}
                    </span>
                  </button>

                  {filteredEventOptions.map((event, idx) => {
                    const isSelected =
                      Boolean(selectedEvent) &&
                      normalizeEventName(selectedEvent) === normalizeEventName(event.namaEvent);
                    const count =
                      eventParticipantCounts[normalizeEventName(event.namaEvent)] || 0;

                    return (
                      <button
                        key={event.id || idx}
                        type="button"
                        onClick={() => {
                          const target = (event.namaEvent || "").trim();
                          setSelectedEvent(isSelected ? "" : target);
                        }}
                        className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${isSelected
                            ? "bg-gradient-to-br from-teal-50/80 to-emerald-50/80 border-teal-500 shadow-sm ring-2 ring-teal-500/20"
                            : "bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${event.isTerlewat
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                              }`}
                          >
                            {event.isTerlewat ? "Terlaksana" : "Aktif"}
                          </span>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                            {count} peserta
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-teal-700 transition-colors">
                          {event.namaEvent || "Event"}
                        </h4>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BARIS FILTER & PENCARIAN UTAMA */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Pencarian Teks */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    Cari Peserta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama, NPA, no HP, unit..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    {searchText && (
                      <button
                        onClick={() => setSearchText("")}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                        title="Bersihkan pencarian"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Filter Status Event: Masih Aktif / Sudah Terlaksana */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      Status Event
                    </span>
                    {eventStatusFilter !== "all" && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
                        Aktif
                      </span>
                    )}
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleStatusFilterChange("all")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${eventStatusFilter === "all"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterChange("active")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${eventStatusFilter === "active"
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-emerald-700 hover:text-emerald-800"
                        }`}
                      title="Hanya event yang masih aktif"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterChange("completed")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${eventStatusFilter === "completed"
                          ? "bg-white text-amber-700 shadow-sm"
                          : "text-amber-700 hover:text-amber-800"
                        }`}
                      title="Hanya event yang sudah terlaksana"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      Selesai
                    </button>
                  </div>
                </div>

                {/* 3. Filter Cabang (Superadmin) */}
                <div id="cabangInputContainer" className="relative">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    Wilayah Cabang
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly={!isSuperAdmin}
                      disabled={!isSuperAdmin}
                      placeholder={selectedCabang || "Semua Cabang"}
                      value={
                        isSuperAdmin
                          ? selectedCabang || ""
                          : sessionStorage.getItem("cabang") || "Semua Cabang"
                      }
                      onClick={() => isSuperAdmin && setShowDropdownCabang(!showDropdownCabang)}
                      className={`w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition ${isSuperAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-80"
                        }`}
                    />
                    {isSuperAdmin && (
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    )}
                  </div>

                  {showDropdownCabang && isSuperAdmin && (
                    <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95">
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <input
                          type="text"
                          placeholder="Cari cabang..."
                          value={queryCabang}
                          onChange={(e) => setQueryCabang(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
                        <button
                          type="button"
                          onClick={() => handleCabangSelect({ kecamatan: "" })}
                          className={`w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-teal-50 transition flex items-center justify-between ${!selectedCabang ? "text-teal-700 bg-teal-50/60 font-bold" : "text-slate-700"
                            }`}
                        >
                          <span>Tampilkan Semua Cabang</span>
                          {!selectedCabang && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                        {cabangOptions
                          .filter((c) =>
                            c.kecamatan?.toLowerCase().includes(queryCabang.toLowerCase())
                          )
                          .map((cabang) => (
                            <button
                              key={cabang.idKecamatan || cabang.kecamatan}
                              type="button"
                              onClick={() => handleCabangSelect(cabang)}
                              className={`w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-teal-50 transition flex items-center justify-between ${selectedCabang === cabang.kecamatan
                                  ? "text-teal-700 bg-teal-50/60 font-bold"
                                  : "text-slate-700"
                                }`}
                            >
                              <span>{cabang.kecamatan}</span>
                              {selectedCabang === cabang.kecamatan && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Filter Tahun Daftar */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    Tahun Daftar
                  </label>
                  <select
                    value={selectedTahunDaftar}
                    onChange={(e) => setSelectedTahunDaftar(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
                  >
                    <option value="">Semua Tahun</option>
                    {tahunDaftarOptions.map((th) => (
                      <option key={th} value={th}>
                        Tahun {th}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Baris Action Button: Reset, Cetak PDF Rekap & Unduh Excel */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {filteredPesertaList.length} Peserta Sesuai Filter
                  </span>

                  {eventStatusFilter !== "all" && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${eventStatusFilter === "active"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${eventStatusFilter === "active" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                      />
                      Status: {eventStatusFilter === "active" ? "Masih Aktif" : "Sudah Terlaksana"}
                      <button
                        onClick={() => handleStatusFilterChange("all")}
                        className="hover:opacity-75 p-0.5 rounded-full cursor-pointer"
                        title="Hapus filter status"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {(selectedEvent ||
                    selectedCabang ||
                    selectedTahunDaftar ||
                    searchText ||
                    eventStatusFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSelectedEvent("");
                          setSelectedCabang("");
                          setSelectedTahunDaftar("");
                          setSearchText("");
                          handleStatusFilterChange("all");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full transition cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Semua
                      </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>Tampilkan:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={-1}>Semua</option>
                    </select>
                  </div>

                  {/* 1 Button Cetak PDF dengan Dropdown Pilihan */}
                  <div id="pdfDropdownContainer" className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPdfDropdown((prev) => !prev)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition shadow-sm"
                      title="Pilih format cetak PDF"
                    >
                      <Printer className="w-4 h-4 text-rose-600" />
                      <span>Cetak PDF</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showPdfDropdown ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {showPdfDropdown && (
                      <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPdfDropdown(false);
                            handleDownloadPdfRekap();
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 transition flex items-start gap-2.5 group"
                        >
                          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Rekapitulasi Data (Tabel)
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Daftar tabel peserta lengkap dengan link KTA
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowPdfDropdown(false);
                            handleDownloadBatchKtaPdf();
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50 transition flex items-start gap-2.5 group border-t border-slate-100 mt-1"
                        >
                          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Berkas Lampiran KTA
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Lembar resmi KTA berisi foto/scan asli peserta
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tombol Unduh Excel */}
                  <button
                    onClick={handleDownloadPeserta}
                    disabled={filteredPesertaList.length === 0}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor Excel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TABEL DATA PESERTA */}
            <div
              id="data-peserta-table"
              className="bg-white rounded-3xl shadow-sm border border-slate-200/70 overflow-hidden"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mb-4" />
                  <h3 className="text-base font-bold text-slate-800">Memuat Data Peserta...</h3>
                  <p className="text-xs text-slate-500 mt-1">Harap tunggu sebentar</p>
                </div>
              ) : filteredPesertaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Peserta</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {searchText
                      ? `Tidak ditemukan peserta dengan kata kunci "${searchText}"`
                      : "Belum ada peserta yang terdaftar untuk filter yang dipilih."}
                  </p>
                  {(searchText || selectedEvent || selectedCabang || selectedTahunDaftar) && (
                    <button
                      onClick={() => {
                        setSearchText("");
                        setSelectedEvent("");
                        setSelectedCabang("");
                        setSelectedTahunDaftar("");
                      }}
                      className="mt-4 px-4 py-2 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition"
                    >
                      Bersihkan Filter
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                          <th className="py-3.5 px-4 text-center w-12">No</th>
                          <th className="py-3.5 px-4">Peserta</th>
                          <th className="py-3.5 px-4">Event</th>
                          <th className="py-3.5 px-4">Cabang & Unit Kerja</th>
                          <th className="py-3.5 px-4">Kontak</th>
                          <th className="py-3.5 px-4 text-center">Tgl Daftar</th>
                          <th className="py-3.5 px-4 text-center">Materi</th>
                          <th className="py-3.5 px-4 text-center">File KTA</th>
                          <th className="py-3.5 px-4 text-center">Foto Kehadiran</th>
                          <th className="py-3.5 px-4">Kehadiran & Tag Location</th>
                          <th className="py-3.5 px-4 text-center">Role</th>
                          <th className="py-3.5 px-4">Keterangan</th>
                          <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {paginatedList.map((item, index) => {
                          const overallIndex =
                            itemsPerPage === -1
                              ? index + 1
                              : (currentPage - 1) * itemsPerPage + index + 1;

                          const ktaSrc = item.foto
                            ? getImageSrc(item.foto)
                            : item.fileKtaUrl
                              ? `${BASE_URL}${item.fileKtaUrl}`
                              : null;

                          const waNum = getWhatsAppNumber(item.nomorHp);

                          return (
                            <tr
                              key={item.id || index}
                              className="hover:bg-teal-50/40 transition-colors group"
                            >
                              {/* 1. Nomor */}
                              <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400">
                                {overallIndex}
                              </td>

                              {/* 2. Peserta (Nama, NPA, JK, Foto) */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <PesertaAvatar
                                    item={item}
                                    getImageSrc={getImageSrc}
                                    onPreview={setLightboxData}
                                  />
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-800 block truncate group-hover:text-teal-700 transition-colors">
                                      {item.namaLengkap || "-"}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                                      <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                        NPA: {item.npa || "-"}
                                      </span>
                                      {item.jenisKelamin && (
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                          {item.jenisKelamin}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Event */}
                              <td className="py-3.5 px-4">
                                <div className="max-w-[180px]">
                                  <span className="inline-block text-xs font-semibold text-slate-700 truncate bg-slate-100/80 px-2 py-1 rounded-lg">
                                    {item.namaEvent || "-"}
                                  </span>
                                </div>
                              </td>

                              {/* 4. Cabang & Unit Kerja */}
                              <td className="py-3.5 px-4">
                                <div className="min-w-[140px]">
                                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                    <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                    <span className="truncate">{item.cabang || "-"}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 block truncate pl-4">
                                    {item.unitKerja || "-"}
                                  </span>
                                </div>
                              </td>

                              {/* 5. Kontak (No HP & WhatsApp) */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-slate-700 font-mono">
                                    {item.nomorHp || "-"}
                                  </span>
                                  {waNum && (
                                    <a
                                      href={`https://wa.me/${waNum}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Kirim pesan WhatsApp"
                                      className="p-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition shadow-sm"
                                    >
                                      <FaWhatsapp className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>

                              {/* 6. Tgl Daftar */}
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {formatTanggalDaftar(item.tanggalDaftar)}
                                </span>
                              </td>

                              {/* 7. File Materi */}
                              <td className="py-3.5 px-4 text-center">
                                {item.upload || item.fileMateriUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.fileMateriUrl) {
                                        window.open(`${BASE_URL}${item.fileMateriUrl}`, "_blank");
                                      } else {
                                        handleDownloadFile(
                                          item.upload,
                                          `dokumen-${item.namaLengkap || "peserta"}`
                                        );
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Unduh</span>
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">-</span>
                                )}
                              </td>

                              {/* 8. File KTA */}
                              <td className="py-3.5 px-4 text-center">
                                {ktaSrc ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLightboxData({
                                        src: ktaSrc,
                                        title: `KTA - ${item.namaLengkap || "Peserta"}`,
                                        peserta: item,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition shadow-sm"
                                    title="Lihat foto KTA"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Lihat KTA</span>
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">-</span>
                                )}
                              </td>

                              {/* 9. Foto Kehadiran */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {(() => {
                                  const fotoSrc = getFotoKehadiranSrc(item, getImageSrc);
                                  if (fotoSrc) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setLightboxData({
                                            src: fotoSrc,
                                            title: `Foto Kehadiran - ${item.namaLengkap || "Peserta"}`,
                                            peserta: item,
                                          })
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm cursor-pointer"
                                        title="Lihat foto kehadiran peserta"
                                      >
                                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Lihat Foto</span>
                                      </button>
                                    );
                                  }
                                  return (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
                                      <Camera className="w-3 h-3 text-slate-300" />
                                      -
                                    </span>
                                  );
                                })()}
                              </td>

                              {/* 11. Kehadiran & Tag Location */}
                              <td className="py-3.5 px-4">
                                <div className="min-w-[130px] space-y-1">
                                  {/* Status Kehadiran */}
                                  <div>
                                    {(() => {
                                      const isHadir =
                                        item.kehadiran === true ||
                                        item.isHadir === true ||
                                        String(item.kehadiran || item.statusKehadiran || "").toUpperCase() === "HADIR" ||
                                        Boolean(item.waktuKehadiran || item.jamKehadiran);

                                      if (isHadir) {
                                        const waktu = item.waktuKehadiran || item.jamKehadiran;
                                        return (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>Hadir {waktu ? `(${waktu})` : ""}</span>
                                          </span>
                                        );
                                      }
                                      return (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          <span>Belum Hadir</span>
                                        </span>
                                      );
                                    })()}
                                  </div>

                                  {/* Tag Location */}
                                  <div>
                                    {(() => {
                                      const tagLoc =
                                        item.tagLocation ||
                                        item.tag_location ||
                                        item.lokasi ||
                                        item.lokasiKehadiran ||
                                        item.alamatLokasi;
                                      const lat = item.latitude;
                                      const lng = item.longitude;

                                      if (lat && lng) {
                                        return (
                                          <a
                                            href={`https://www.google.com/maps?q=${lat},${lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 truncate max-w-[150px] transition"
                                            title={`Buka koordinat di Google Maps: ${lat}, ${lng}`}
                                          >
                                            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                            <span className="truncate">{tagLoc || `${lat}, ${lng}`}</span>
                                            <ExternalLink className="w-2.5 h-2.5 text-teal-500 shrink-0" />
                                          </a>
                                        );
                                      }

                                      if (tagLoc) {
                                        const isUrl = tagLoc.startsWith("http://") || tagLoc.startsWith("https://");
                                        if (isUrl) {
                                          return (
                                            <a
                                              href={tagLoc}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 truncate max-w-[150px] transition"
                                              title="Buka link lokasi"
                                            >
                                              <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                              <span className="truncate">Lokasi Maps</span>
                                              <ExternalLink className="w-2.5 h-2.5 text-teal-500 shrink-0" />
                                            </a>
                                          );
                                        }
                                        return (
                                          <div
                                            className="flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[150px]"
                                            title={tagLoc}
                                          >
                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="truncate">{tagLoc}</span>
                                          </div>
                                        );
                                      }

                                      return <span className="text-[11px] text-slate-400 italic">-</span>;
                                    })()}
                                  </div>
                                </div>
                              </td>

                              {/* 11. Role */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {formatRoleBadge(item.role || item.peran || item.kategoriPeserta)}
                              </td>

                              {/* 12. Keterangan / Link */}
                              <td className="py-3.5 px-4">
                                {item.jabatan ? (
                                  item.jabatan.startsWith("http://") ||
                                    item.jabatan.startsWith("https://") ? (
                                    <a
                                      href={item.jabatan}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline max-w-[130px] truncate"
                                    >
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                      Tautan
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs text-slate-600 block max-w-[150px] truncate cursor-pointer hover:text-slate-900"
                                      onClick={() => setSelectedPesertaDetail(item)}
                                      title={item.jabatan}
                                    >
                                      {item.jabatan}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs text-slate-400 italic">-</span>
                                )}
                              </td>

                              {/* 13. Aksi */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Tombol Quick Detail */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPesertaDetail(item)}
                                    title="Lihat Detail & Cetak Bukti Pendaftaran"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  {/* Tombol Hapus (Admin Only) */}
                                  {role && role !== "USER" && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClick(item.id)}
                                      title="Hapus Peserta"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* KONTROL PAGINASI */}
                  {itemsPerPage !== -1 && totalPages > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                      <div>
                        Menampilkan{" "}
                        <span className="font-bold text-slate-800">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-bold text-slate-800">
                          {Math.min(currentPage * itemsPerPage, filteredPesertaList.length)}
                        </span>{" "}
                        dari{" "}
                        <span className="font-bold text-slate-800">
                          {filteredPesertaList.length}
                        </span>{" "}
                        peserta
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            return (
                              p === 1 ||
                              p === totalPages ||
                              (p >= currentPage - 1 && p <= currentPage + 1)
                            );
                          })
                          .map((p, idx, arr) => {
                            const prev = arr[idx - 1];
                            return (
                              <React.Fragment key={p}>
                                {prev && p - prev > 1 && (
                                  <span className="px-1 text-slate-400">...</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCurrentPage(p)}
                                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${currentPage === p
                                      ? "bg-teal-600 text-white shadow-sm"
                                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            );
                          })}

                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* SECTION: STATISTIK KEHADIRAN MODEL BATANG (POSISI PALING BAWAH) */}
            {role !== null && role !== "USER" && showStatistikBatang && (
              <div id="statistikBatangSection" className="mt-8 mb-6 animate-in fade-in duration-300">
                <EventStatistikBatang
                  participants={pesertaList}
                  cabangList={cabangOptions}
                  selectedEventName={selectedEvent}
                  title={`Statistik Kehadiran Model Batang ${
                    selectedEvent ? `— ${selectedEvent}` : ""
                  }`}
                />
              </div>
            )}

            {/* MODAL KONFIRMASI HAPUS */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowDeleteModal(false)}
                />
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 z-10 text-center animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                    <Trash2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Hapus Data Peserta?</h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Tindakan ini tidak dapat dibatalkan. Data peserta yang dipilih akan dihapus secara permanen dari basis data.
                  </p>
                  <div className="flex gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition w-full"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={loadingDelete}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition disabled:opacity-50 w-full"
                    >
                      {loadingDelete ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
