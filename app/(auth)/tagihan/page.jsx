"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderMobile from "@/app/_components/HeaderMobile";
import HeaderMenu from "@/app/_components/HeaderMenu";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

export default function Tagihan() {
  const router = useRouter();
  const { token } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataIuran, setDataIuran] = useState(null);
  const [dataAnggota, setDataAnggota] = useState(null);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }

    getIuranAnggotaById();
    cekNpa();
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const getIuranAnggotaById = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        return;
      }

      const iuranResponse = await GlobalApi.getTagihanAnggotaById(userId);
      setDataIuran(iuranResponse);
    } catch (error) {
      if (error.response && error.response.data) {
      }
    }
  }

  const cekNpa = async () => {
    try {
      const npa = sessionStorage.getItem("npa");
      const member = await GlobalApi.cekNpa(npa);
      if (member) {
        const detailedMember = await GlobalApi.getUserById(member.id);
        setDataAnggota(detailedMember);
      }
    } catch (error) {
      console.error("Error fetching npa:", error);
      setDataAnggota(null);
    }
  };

  const formatTanggalLengkap = () => {
    const hariIndo = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const bulanIndo = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const now = new Date();
    const hari = hariIndo[now.getDay()];
    const tanggal = now.getDate();
    const bulan = bulanIndo[now.getMonth()];
    const tahun = now.getFullYear();
    const jam = now.getHours().toString().padStart(2, "0");
    const menit = now.getMinutes().toString().padStart(2, "0");

    return `${hari}, ${tanggal} ${bulan} ${tahun} pukul ${jam}:${menit}`;
  };

  const generatePowerOfAttorneyPDF = async () => {
    const tanggalSekarang = formatTanggalLengkap();
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <p style="margin-top: 20px; font-size: 12px; font-style: italic; text-align: right;">
          Dicetak pada: ${tanggalSekarang}
        </p>
        <h2 style="text-align: center; text-decoration: underline; font-weight: bold;">
          SURAT PERINTAH DAN KUASA
        </h2>
  
        <div style="margin-top: 30px;">
          <table style="width: 100%;">
            <tr><td style="width: 150px;">Nama</td><td style="width: 20px;">:</td><td>${dataAnggota?.namaLengkap || "............................."
      }</td></tr>
            <tr><td>NIP</td><td>:</td><td>${dataAnggota?.nip || "............................."
      }</td></tr>
            <tr><td>NPA PGRI</td><td>:</td><td>${dataAnggota?.npaPgri || "............................."
      }</td></tr>
            <tr><td>Pangkat/Gol</td><td>:</td><td>${dataAnggota?.pangkatGolongan || "............................."
      }</td></tr>
            <tr><td>Jabatan</td><td>:</td><td>${dataAnggota?.jabatan || "............................."
      }</td></tr>
            <tr><td>Kantor/sekolah</td><td>:</td><td>${dataAnggota?.unitKerja || "............................."
      }</td></tr>
            <tr><td>KTP Nomor</td><td>:</td><td>${dataAnggota?.nik || "............................."
      }</td></tr>
            <tr><td>HP Nomor</td><td>:</td><td>${dataAnggota?.nomorHp || "............................."
      }</td></tr>
            <tr><td>Alamat Rumah</td><td>:</td><td>${dataAnggota?.alamat || "............................."
      }</td></tr>
          </table>
        </div>
  
        <p>Dengan ini memberi Perintah dan Kuasa kepada :</p>
        <div style="text-align: center; margin: 15px 0;">
          <strong>PT BANK PEMBANGUNAN DAERAH JAWA TENGAH</strong>
        </div>
  
        <p>
          Untuk memotong rekening gaji saya dengan mendebet/memindahkan rekening saya di 
          PT Bank Pembangunan Daerah Jawa Tengah dengan :
        </p>
  
        <div style="margin-left: 20px;">
          <table style="width: 100%;">
            <tr><td style="width: 150px;">Nomor Rekening</td><td style="width: 20px;">:</td><td>.............................</td></tr>
            <tr><td>Atas nama</td><td>:</td><td>${dataAnggota?.namaLengkap || "............................."
      }</td></tr>
          </table>
        </div>
  
        <p>Untuk pembayaran :</p>
        <div style="margin-left: 20px;">
          <table style="width: 100%;">
            <tr><td style="width: 30px;">1.</td><td style="width: 120px;">Iuran PGRI</td><td style="width: 20px;">:</td><td>Rp. ${dataIuran?.pgri || "............................."
      }</td></tr>
            <tr><td>2.</td><td>Sanduka</td><td>:</td><td>Rp. ${dataIuran?.sanduka || "............................."
      }</td></tr>
            <tr><td>3.</td><td>Daspen</td><td>:</td><td>Rp. ${dataIuran?.daspen || "............................."
      }</td></tr>
            <tr><td>4.</td><td>Derap</td><td>:</td><td>Rp. ${dataIuran?.derap || "............................."
      }</td></tr>
            <tr><td>5.</td><td>Kalender</td><td>:</td><td>Rp. ${dataIuran?.kalender || "............................."
      }</td></tr>
            <tr><td>6.</td><td>Lain - Lain</td><td>:</td><td>Rp. ${dataIuran?.sumbangan || "............................."
      }</td></tr>
            <tr><td>7.</td><td>Total</td><td>:</td><td>Rp. ${[
        dataIuran?.pgri,
        dataIuran?.sanduka,
        dataIuran?.daspen,
        dataIuran?.derap,
        dataIuran?.kalender,
        dataIuran?.sumbangan,
      ]
        .map((val) => Number(val) || 0)
        .reduce((acc, curr) => acc + curr, 0)
        .toLocaleString(
          "id-ID"
        )}</td></tr>
          </table>
        </div>
  
        <p>Setiap bulan pada rekening Bank Jateng nomor rekening :</p>
        <div style="margin-left: 30px;">
          <p>1. 2.015.15169.5 (PGRI Kabupaten Jepara)</p>
        </div>
  
        <p>Demikian untuk menjadi periksa dan dilaksanakan.</p>
  
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <!-- Kolom Kiri -->
          <div style="width: 45%; text-align: center;">
            <p>
              Yang menerima Perintah dan Kuasa<br>
              <strong>PT BANK PEMBANGUNAN<br>DAERAH JAWA TENGAH</strong><br>
              Cabang Jepara
            </p>
            <p style="margin-top: 55px;">..................................................</p>
          </div>
  
          <!-- Kolom Kanan -->
          <div style="width: 45%; text-align: center; position: relative;">
            <p style="text-align: left;">
              Jepara, .................................<br>
              Yang memberi Perintah dan Kuasa
            </p>
  
            <!-- Kotak Materai -->
            <div style="border: 1px solid #000; width: 80px; height: 40px; font-size: 10px; line-height: 1.2; padding: 4px; position: absolute; left: 32%; transform: translateX(-50%); top: 80px;">
              Materai<br>10.000
            </div>
  
            <p style="margin-top: 100px;">..................................................</p>
            <p>NIP. ${dataAnggota?.nip || "............................."}</p>
          </div>
        </div>
      </div>
    `;

    if (typeof window !== "undefined") {
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.createElement("div");
      element.innerHTML = content;

      const opt = {
        margin: 0.5,
        filename: "surat-perintah-kuasa.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      html2pdf().from(element).set(opt).save();
    }
  };

  const handleDownloadInformasiAnggota = async (dataIuran) => {
    const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const content = `
      <div style="font-family: 'Roboto', 'Arial', sans-serif; padding: 30px; font-size: 14px; color: #444; max-width: 800px; margin: 0 auto; background-color: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
          <h1 style="color: #2c3e50; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
            Tagihan Anggota
          </h1>
          <p style="color: #7f8c8d; margin-top: 8px; font-size: 13px;">
            Dicetak pada: ${tanggalSekarang}
          </p>
        </div>
  
        <section style="margin-top: 25px; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h3 style="color: #2c3e50; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0;">
            <i style="margin-right: 8px;">&#128100;</i> Informasi Anggota
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 180px; padding: 8px 0; color: #7f8c8d;">Nama</td>
              <td style="width: 20px; padding: 8px 0; color: #7f8c8d;">:</td>
              <td style="padding: 8px 0; font-weight: 500;">${dataIuran.namaLengkap}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;">Tempat, Tanggal Lahir</td>
              <td style="padding: 8px 0; color: #7f8c8d;">:</td>
              <td style="padding: 8px 0;">${dataIuran.tempatTanggalLahir}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;">Unit Kerja</td>
              <td style="padding: 8px 0; color: #7f8c8d;">:</td>
              <td style="padding: 8px 0;">${dataIuran.unitKerja}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;">Cabang</td>
              <td style="padding: 8px 0; color: #7f8c8d;">:</td>
              <td style="padding: 8px 0;">${dataIuran.cabang}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;">Jabatan</td>
              <td style="padding: 8px 0; color: #7f8c8d;">:</td>
              <td style="padding: 8px 0;">${dataIuran.jabatan}</td>
            </tr>
          </table>
        </section>
  
        <section style="margin-top: 25px; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h3 style="color: #2c3e50; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0;">
            <i style="margin-right: 8px;">&#128181;</i> Rincian Tagihan
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 40px; padding: 10px 5px; color: #7f8c8d;">1.</td>
              <td style="padding: 10px 5px; color: #7f8c8d;">Iuran Anggota</td>
              <td style="width: 20px; padding: 10px 5px; color: #7f8c8d;">:</td>
              <td style="text-align: right; padding: 10px 5px;">Rp. ${dataIuran.pgri?.toLocaleString('id-ID') || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 5px; color: #7f8c8d;">2.</td>
              <td style="padding: 10px 5px; color: #7f8c8d;">Sanduka</td>
              <td style="padding: 10px 5px; color: #7f8c8d;">:</td>
              <td style="text-align: right; padding: 10px 5px;">Rp. ${dataIuran.sanduka?.toLocaleString('id-ID') || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 5px; color: #7f8c8d;">3.</td>
              <td style="padding: 10px 5px; color: #7f8c8d;">Daspen</td>
              <td style="padding: 10px 5px; color: #7f8c8d;">:</td>
              <td style="text-align: right; padding: 10px 5px;">Rp. ${dataIuran.daspen?.toLocaleString('id-ID') || '0'}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; background-color: #2c3e50; color: white; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between;">
            <span style="font-weight: bold; font-size: 15px;">Total Tagihan</span>
            <span style="font-weight: bold; font-size: 15px;">Rp. ${(
        (dataIuran.pgri || 0) +
        (dataIuran.sanduka || 0) +
        (dataIuran.daspen || 0)
      ).toLocaleString('id-ID')}</span>
          </div>
        </section>
        
        <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #95a5a6; padding-top: 20px; border-top: 1px solid #f0f0f0;">
          Dokumen ini diterbitkan secara elektronik dan sah tanpa tanda tangan
        </footer>
      </div>
    `;

    if (typeof window !== "undefined") {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.createElement("div");
      element.innerHTML = content;
      const opt = {
        margin: 0.5,
        filename: `Tagihan-${dataIuran.namaLengkap}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      html2pdf().from(element).set(opt).save();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <main className="container mx-auto py-6 md:py-10 px-4 flex-grow bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 rounded-t-2xl shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                  <div className="absolute w-56 h-56 rounded-full bg-white -top-20 -left-20"></div>
                  <div className="absolute w-72 h-72 rounded-full bg-blue-400 -bottom-36 -right-36"></div>
                </div>

                <div className="relative px-6 py-8 text-white text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-1">
                    TAGIHAN ANGGOTA
                  </h1>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-b-2xl overflow-hidden">
                <div className="p-4 md:p-8">
                  {dataIuran &&
                    (dataIuran.pgri > 0 ||
                      dataIuran.daspen > 0 ||
                      dataIuran.derap > 0 ||
                      dataIuran.kalender > 0 ||
                      dataIuran.sanduka > 0 ||
                      dataIuran.sumbangan > 0) ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-blue-100 overflow-hidden">
                        <div className="p-4 border-b border-blue-100 flex items-center">
                          <div className="bg-blue-600 rounded-full p-2 mr-3 shadow-md">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              ></path>
                            </svg>
                          </div>
                          <h2 className="text-lg md:text-xl font-bold text-blue-800">
                            Informasi Anggota
                          </h2>
                        </div>

                        <div className="p-4 md:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-start">
                                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    ></path>
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Nama
                                  </span>
                                  <p className="font-semibold text-gray-800 text-lg">
                                    {dataIuran.namaLengkap}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    ></path>
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Tempat, Tanggal Lahir
                                  </span>
                                  <p className="font-medium text-gray-800">
                                    {dataIuran.tempatTanggalLahir}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    ></path>
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Unit Kerja
                                  </span>
                                  <p className="font-medium text-gray-800">
                                    {dataIuran.unitKerja}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-start">
                                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Cabang
                                  </span>
                                  <p className="font-medium text-gray-800">
                                    {dataIuran.cabang}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    ></path>
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Jabatan
                                  </span>
                                  <p className="font-medium text-gray-800">
                                    {dataIuran.jabatan}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center">
                          <div className="bg-white/20 rounded-full p-2 mr-3 backdrop-blur-sm">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              ></path>
                            </svg>
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-white">
                            Rincian Tagihan
                          </h3>
                        </div>

                        <div className="bg-white p-4 md:p-6">
                          <div className="space-y-3">
                            {dataIuran.pgri > 0 && (
                              <div className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                  <span className="text-gray-700 font-medium">
                                    Iuran Anggota
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Rp.{" "}
                                  {dataIuran.pgri?.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            )}

                            {dataIuran.sanduka > 0 && (
                              <div className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                  <span className="text-gray-700 font-medium">
                                    Sanduka
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Rp.{" "}
                                  {dataIuran.sanduka?.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            )}

                            {dataIuran.daspen > 0 && (
                              <div className="flex justify-between items-center p-2 hover:bg-purple-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                  <span className="text-gray-700 font-medium">
                                    Daspen
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Rp.{" "}
                                  {dataIuran.daspen?.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            )}

                            {dataIuran.derap > 0 && (
                              <div className="flex justify-between items-center p-2 hover:bg-yellow-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                  <span className="text-gray-700 font-medium">
                                    Derap
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Rp.{" "}
                                  {dataIuran.derap?.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            )}

                            {dataIuran.kalender > 0 && (
                              <div className="flex justify-between items-center p-2 hover:bg-red-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                  <span className="text-gray-700 font-medium">
                                    Kalender
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Rp.{" "}
                                  {dataIuran.kalender?.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            )}

                            {dataIuran.sumbangan > 0 && (
                              <div className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                                  <span className="text-gray-700 font-medium">
                                    Sumbangan
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Rp.{" "}
                                  {dataIuran.sumbangan?.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                              <span className="text-lg font-bold text-blue-800 mb-2 sm:mb-0">
                                Total Tagihan
                              </span>
                              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-3 rounded-lg font-bold shadow-md">
                                Rp.{" "}
                                {(
                                  dataIuran.pgri +
                                  dataIuran.sanduka +
                                  dataIuran.daspen +
                                  dataIuran.derap +
                                  dataIuran.kalender +
                                  dataIuran.sumbangan
                                ).toLocaleString("id-ID")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={generatePowerOfAttorneyPDF}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out flex items-center justify-center"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            ></path>
                          </svg>
                          Download Surat Kuasa
                        </button>

                        <button
                          onClick={() => handleDownloadInformasiAnggota(dataIuran)}
                          className="flex items-center justify-center px-6 py-3 font-bold text-white transition duration-300 ease-in-out rounded-xl shadow-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 16v-4m0 4l-2-2m2 2l2-2M8 6h8a2 2 0 012 2v8h-2v4H8v-4H6V8a2 2 0 012-2z"
                            />
                          </svg>
                          Cetak Tagihan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 md:p-10 rounded-xl shadow-md border border-blue-100 text-center bg-gradient-to-br from-white to-blue-50">
                      <div className="mb-8 flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-blue-200 opacity-40 animate-ping"></div>
                          <div className="relative bg-gradient-to-r from-blue-100 to-blue-200 rounded-full p-5 shadow-inner">
                            <svg
                              className="w-16 h-16 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-blue-800 mb-4">
                        Detail Tagihan Sedang Dalam Proses
                      </h2>

                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Terima kasih atas kesabaran Anda. Detail tagihan Anda
                        sedang diproses dan akan tersedia dalam beberapa saat lagi.
                      </p>

                      <div className="w-full max-w-md mx-auto bg-white rounded-full h-3 shadow-inner overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full animate-pulse"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="mt-10">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Surat kuasa ini disertai dengan dokumen-dokumen berikut:
                    </h3>
                    <ul className="list-inside list-disc pl-5 space-y-2">
                      <li className="text-gray-700">Fotokopi KTP</li>
                      <li className="text-gray-700">
                        Fotokopi Buku Rekening yang digunakan untuk surat kuasa
                      </li>
                      <li className="text-gray-700">Materai 10.000</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
