"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlus, FaSearch, FaFilePdf, FaFileImage } from "react-icons/fa";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const bulanList = [
  { id: "01", namaBulan: "Januari" },
  { id: "02", namaBulan: "Februari" },
  { id: "03", namaBulan: "Maret" },
  { id: "04", namaBulan: "April" },
  { id: "05", namaBulan: "Mei" },
  { id: "06", namaBulan: "Juni" },
  { id: "07", namaBulan: "Juli" },
  { id: "08", namaBulan: "Agustus" },
  { id: "09", namaBulan: "September" },
  { id: "10", namaBulan: "Oktober" },
  { id: "11", namaBulan: "November" },
  { id: "12", namaBulan: "Desember" },
];

const startYear = 2020;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

const terbilang = (num) => {
  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
  const belasan = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
  const convert = (n) => {
    if (n < 10) return satuan[n];
    if (n < 20) return belasan[n - 10];
    if (n < 100) return `${satuan[Math.floor(n / 10)]} puluh ${satuan[n % 10]}`.trim();
    if (n < 1000) return `${satuan[Math.floor(n / 100)]} ratus ${convert(n % 100)}`.trim();
    if (n < 1000000) return `${convert(Math.floor(n / 1000))} ribu ${convert(n % 1000)}`.trim();
    if (n < 1000000000) return `${convert(Math.floor(n / 1000000))} juta ${convert(n % 1000000)}`.trim();
    if (n < 1000000000000) return `${convert(Math.floor(n / 1000000000))} miliar ${convert(n % 1000000000)}`.trim();
    return "Jumlah terlalu besar";
  };
  if (!num || num <= 0) return "";
  const t = convert(num);
  return t.charAt(0).toUpperCase() + t.slice(1) + " Rupiah";
};

const formatDate = (dateArray, separator = "-") => {
  if (!Array.isArray(dateArray) || dateArray.length !== 3) return "Tanggal tidak valid";
  const [year, month, day] = dateArray;
  return `${year}${separator}${String(month).padStart(2, "0")}${separator}${String(day).padStart(2, "0")}`;
};

const calculateAge = (tanggalLahir) => {
  if (!tanggalLahir || !Array.isArray(tanggalLahir)) return 0;
  const today = new Date();
  const birthDate = new Date(tanggalLahir[0], tanggalLahir[1] - 1, tanggalLahir[2]);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const generateKwitansiHTML = (generateDataList) => {
  const kwitansiHTML = generateDataList.map((data) => `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Kwitansi</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #fff; padding: 60px; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .title { font-size: 20px; font-weight: bold; text-align: center; }
    .info, .footer { width: 100%; margin-top: 10px; }
    .info td { padding: 10px; vertical-align: top; border: 1px solid #ccc; }
    .nominal { font-weight: bold; background: #000; color: #fff; text-align: center; }
    .terbilang { font-weight: bold; color: #000; text-align: center; }
    .signature { margin-top: 40px; width: 100%; display: flex; justify-content: space-between; }
    .signature div { text-align: center; width: 30%; }
    .footer { font-size: 12px; text-align: center; }
    .data-meninggal { display: flex; justify-content: space-between; }
    .data-item { width: 22%; }
    .kwitansi { width: 210mm; height: 297mm; margin: 0 auto; padding: 20px; background: #fff; margin-bottom: 100px; }
    .data-item p { margin: 4px 0; line-height: 1.4; }
    @media (max-width: 600px) { .data-meninggal { flex-direction: column; } .data-item { width: 100%; } }
  </style>
</head>
<body>
<div class="header">
  <div class="left-header">
    <p>Nomor Transaksi: ${data.noBukti}</p>
    <p>Tanggal Transaksi: ${data.tanggal}</p>
    <p>Pos Pengeluaran: ${data.posPengeluaran}</p>
  </div>
  <div class="title">TANDA TERIMA</div>
  <div class="right-header">
    <img src="https://sanduka-fe.vercel.app/_next/image?url=%2Fsanduka.png&w=256&q=75" alt="Logo" style="height: 50px;" />
  </div>
</div>
<div class="data-meninggal">
  <div class="data-item">
    <p>Data Meninggal</p>
    <p><strong>${data.nama}</strong></p>
    <p>${data.umur} Tahun</p>
    <p>${data.alamat}</p>
    <p>${data.nomorHp}</p>
  </div>
  <div class="data-item">
    <p>Data Dukung</p>
    <p><strong>${data.dataDukung}</strong></p>
    <p>${data.jabatan}</p>
    <p>Sejak Menjadi Anggota</p>
    <p>${data.sejakMenjadiAnggota}</p>
  </div>
  <div class="data-item">
    <p>Data Pelaporan</p>
    <p><strong>${data.tanggal}</strong></p>
    <p><strong>Tanggal Meninggal:</strong> ${data.tanggalMeninggal}</p>
  </div>
</div>
<table class="info">
  <tr>
    <td class="nominal">Terbilang</td>
    <td class="nominal">Nominal</td>
  </tr>
  <tr>
    <td class="terbilang"><strong>${data.terbilang}</strong></td>
    <td class="terbilang"><strong>Rp ${data.nominal}</strong></td>
  </tr>
</table>
${data.keterangan ? `<p style="margin-top:10px;"><strong>Keterangan:</strong> ${data.keterangan}</p>` : ""}
<div class="signature">
  <div>................., ..................<p>Yang Menyerahkan,</p></div>
  <div>................., ..................<p>Penerima,</p></div>
</div>
<footer>
  <table class="footer">
    <tr>
      <td>Sekretariat PGRI: <br /> Jalan Bata Putih VI, Kelurahan Demaan, Kecamatan Jepara, Kabupaten Jepara, Jawa Tengah, Telp/Fax : 0291 592479, email : pgrijepara@gmail.com</td>
    </tr>
  </table>
</footer>
</body>
</html>`).join(`<div style="page-break-after: always; border-top: 2px dashed #999; margin: 50px 0;"></div>`);

  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
  .container { display: flex; flex-direction: column; }
</style></head>
<body><div class="container">${kwitansiHTML}</div></body></html>`;
};

export default function KwitansiForm() {
  const [posPengeluaranList, setPosPengeluaranList] = useState([]);
  const [form, setForm] = useState({
    noBukti: "",
    tanggal: new Date().toISOString().split("T")[0],
    posPengeluaran: "",
    tahun: "",
    bulan: "",
    yangMeninggal: "",
    namaPenerima: "",
    nominal: "",
    terbilang: "",
    keterangan: "",
  });
  const [namaList, setNamaList] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [kwitansiUrl, setKwitansiUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const dropdownRef = useRef(null);

  const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    GlobalApi.getPosPengeluaranSanduka().then((data) => {
      setPosPengeluaranList((data || []).sort((a, b) => a.namaPosPengeluaran.localeCompare(b.namaPosPengeluaran)));
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "nominal") {
        const numeric = Number(value.replace(/\D/g, ""));
        if (!isNaN(numeric)) {
          updated.nominal = numeric;
          updated.terbilang = terbilang(numeric);
        } else {
          updated.nominal = "";
          updated.terbilang = "";
        }
      }
      return updated;
    });

    if ((name === "tahun" || name === "bulan") && form.tahun && form.bulan) {
      const year = name === "tahun" ? value : form.tahun;
      const month = name === "bulan" ? value : form.bulan;
      if (year && month) {
        GlobalApi.getNamaKwitansi(year, month).then((data) => {
          setNamaList(data || []);
          setFilteredNames(data || []);
        }).catch(() => {});
      }
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setForm((prev) => ({ ...prev, yangMeninggal: e.target.value }));
    setFilteredNames(namaList.filter((n) => n.namaLengkap?.toLowerCase().includes(searchTerm)));
    setIsDropdownVisible(true);
  };

  const handleSelectName = (nameObj) => {
    setForm((prev) => ({ ...prev, yangMeninggal: nameObj.namaLengkap }));
    setIsDropdownVisible(false);
  };

  const addName = () => {
    if (form.yangMeninggal && !selectedNames.includes(form.yangMeninggal)) {
      setSelectedNames((prev) => [...prev, form.yangMeninggal]);
      setForm((prev) => ({ ...prev, yangMeninggal: "" }));
    }
  };

  const removeName = (name) => {
    setSelectedNames((prev) => prev.filter((n) => n !== name));
  };

  const handleKwitansi = async () => {
    if (selectedNames.length < 1) {
      toast.error("Harap pilih setidaknya satu nama");
      return;
    }
    setGenerating(true);
    try {
      const results = [];
      for (const name of selectedNames) {
        const res = await GlobalApi.searchUsersByName(name);
        const user = res?.data?.users?.[0];
        if (user) {
          results.push({
            noBukti: form.noBukti,
            tanggal: form.tanggal || todayStr,
            posPengeluaran: form.posPengeluaran || "-",
            nama: user.namaLengkap || name,
            tanggalMeninggal: formatDate(user.waktuMeninggalTerlapor) || "Tidak diketahui",
            umur: calculateAge(user.tanggalLahir) || "Tidak diketahui",
            dataDukung: user.unitKerja || "Tidak diketahui",
            alamat: user.alamat || "Tidak diketahui",
            nomorHp: user.nomorHp || "Tidak diketahui",
            sejakMenjadiAnggota: formatDate(user.mulaiJadiAnggotaPgri) || "Tidak diketahui",
            jabatan: user.jabatan || "Tidak diketahui",
            terbilang: form.terbilang,
            nominal: form.nominal ? Number(form.nominal).toLocaleString("id-ID") : "0",
            menyerahkan: sessionStorage.getItem("nama") || "Tidak diketahui",
            penerima: form.namaPenerima || "Tidak diketahui",
            keterangan: form.keterangan || "",
          });
        }
      }

      if (results.length === 0) {
        toast.error("Tidak ada data kwitansi yang valid");
        setGenerating(false);
        return;
      }

      const htmlContent = generateKwitansiHTML(results);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setKwitansiUrl(url);
      setShowPreview(true);
      toast.success(`${results.length} kwitansi berhasil dibuat`);
    } catch (error) {
      toast.error("Gagal membuat kwitansi");
      console.error(error);
    }
    setGenerating(false);
  };

  const downloadPDF = async () => {
    const iframe = document.querySelector("iframe");
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const canvas = await html2canvas(doc.body, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("kwitansi.pdf");
      toast.success("PDF berhasil diunduh");
    } catch (error) {
      toast.error("Gagal mengunduh PDF");
      console.error(error);
    }
  };

  const downloadPNG = async () => {
    const iframe = document.querySelector("iframe");
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const canvas = await html2canvas(doc.body, { scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "kwitansi.png";
      link.click();
      toast.success("Gambar berhasil diunduh");
    } catch (error) {
      toast.error("Gagal mengunduh gambar");
      console.error(error);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (kwitansiUrl) URL.revokeObjectURL(kwitansiUrl);
    setKwitansiUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Kwitansi</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Tanggal Transaksi</label>
              <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-medium text-sm text-slate-700" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Pos Pengeluaran</label>
              <select name="posPengeluaran" value={form.posPengeluaran} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-bold text-sm text-slate-700">
                <option value="">Pilih</option>
                {posPengeluaranList.map((p) => <option key={p.id} value={p.namaPosPengeluaran}>{p.namaPosPengeluaran}</option>)}
              </select>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Data Sanduka</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Tahun Lapor</label>
                  <select name="tahun" value={form.tahun} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-bold text-sm text-slate-700">
                    <option value="">Pilih</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Bulan Lapor</label>
                  <select name="bulan" value={form.bulan} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-bold text-sm text-slate-700">
                    <option value="">Pilih</option>
                    {bulanList.map((b) => <option key={b.id} value={b.id}>{b.namaBulan}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Cari nama yang meninggal</label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><FaSearch size={12} /></span>
                    <input type="text" value={form.yangMeninggal} onChange={handleSearch} onFocus={() => { if (filteredNames.length > 0) setIsDropdownVisible(true); }} placeholder="Cari nama..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-medium text-sm text-slate-700" />
                  </div>
                  {filteredNames.length > 0 && isDropdownVisible && (
                    <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredNames.map((n) => (
                        <li key={n.id} className="px-3 py-2 hover:bg-violet-50 cursor-pointer text-sm text-slate-700 font-medium" onClick={() => handleSelectName(n)}>
                          {n.namaLengkap}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button type="button" onClick={addName} disabled={!form.yangMeninggal} className="mt-2 flex items-center space-x-1.5 px-4 py-2.5 bg-violet-100 text-violet-600 rounded-xl text-[10px] font-black hover:bg-violet-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <FaPlus size={10} /> <span>Tambah Nama</span>
              </button>
              {selectedNames.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {selectedNames.map((name) => (
                    <div key={name} className="flex items-center justify-between bg-violet-50 px-3 py-2 rounded-xl">
                      <span className="text-sm font-medium text-slate-700">{name}</span>
                      <button type="button" onClick={() => removeName(name)} className="text-rose-400 hover:text-rose-600 p-1"><FaTimes size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Nama Penerima</label>
              <input type="text" name="namaPenerima" value={form.namaPenerima} onChange={handleChange} placeholder="Nama penerima" className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-medium text-sm text-slate-700" />
            </div>
            <div className="pt-2">
              <button type="button" onClick={handleKwitansi} disabled={generating || selectedNames.length === 0 || !form.posPengeluaran} className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <span>{generating ? "Memproses..." : "Kwitansi"}</span>
              </button>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Nominal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rp</span>
                <input type="text" name="nominal" value={form.nominal ? Number(form.nominal).toLocaleString("id-ID") : ""} onChange={handleChange} placeholder="0" className="w-full pl-9 pr-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-black text-sm text-violet-600" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Terbilang</label>
              <textarea name="terbilang" value={form.terbilang} onChange={handleChange} placeholder="Terbilang" className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-medium text-sm text-slate-700" style={{ height: "5.6em" }} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Keterangan</label>
              <textarea name="keterangan" value={form.keterangan} onChange={handleChange} placeholder="Keterangan..." className="w-full px-3 py-2.5 bg-white border border-violet-100 rounded-xl outline-none font-medium text-sm text-slate-700" rows={3} />
            </div>
          </div>
        </div>
      </div>

      {showPreview && kwitansiUrl && (
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pratinjau Kwitansi</h3>
            <div className="flex items-center gap-2">
              <button onClick={downloadPDF} className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-200 transition-all">
                <FaFilePdf size={10} /> <span>PDF</span>
              </button>
              <button onClick={downloadPNG} className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-200 transition-all">
                <FaFileImage size={10} /> <span>PNG</span>
              </button>
              <button onClick={closePreview} className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black hover:bg-rose-200 transition-all">
                <FaTimes size={10} /> <span>Tutup</span>
              </button>
            </div>
          </div>
          <iframe src={kwitansiUrl} className="w-full h-[600px] rounded-xl border border-slate-200" />
        </div>
      )}
    </div>
  );
}
