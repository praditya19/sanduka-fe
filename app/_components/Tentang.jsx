"use client";
import React, { useState } from "react";
import Link from "next/link";
import { faFilePdf, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Tentang = () => {
  // State untuk melacak accordion mana yang terbuka
  const [activeAccordion, setActiveAccordion] = useState(null); 
  const [openSubAccordion, setOpenSubAccordion] = useState(null);
  const [openDaspenSubAccordion, setOpenDaspenSubAccordion] = useState(null);
  const [openKTASubAccordion, setOpenKTASubAccordion] = useState(null);

  // Fungsi toggle untuk Main Accordions
  const toggleMainAccordion = () => {
    setActiveAccordion(activeAccordion === 'main' ? null : 'main');
    if (activeAccordion !== 'main') setOpenSubAccordion(null);
  };

  const toggleDaspenAccordion = () => {
    setActiveAccordion(activeAccordion === 'daspen' ? null : 'daspen');
    if (activeAccordion !== 'daspen') setOpenDaspenSubAccordion(null);
  };

  const toggleKTAAccordion = () => {
    setActiveAccordion(activeAccordion === 'kta' ? null : 'kta');
    if (activeAccordion !== 'kta') setOpenKTASubAccordion(null);
  };

  // Fungsi toggle untuk Sub Accordions
  const toggleSubAccordion = (index) => {
    setOpenSubAccordion(openSubAccordion === index ? null : index);
  };

  const toggleDaspenSubAccordion = (index) => {
    setOpenDaspenSubAccordion(openDaspenSubAccordion === index ? null : index);
  };

  const toggleKTASubAccordion = (index) => {
    setOpenKTASubAccordion(openKTASubAccordion === index ? null : index);
  };

  // Data Konten
  const accordionData = [
    {
      question: "Apa itu Sanduka?",
      answer: "Sanduka adalah santunan duka cita bagi anggota PGRI Aktif yang terdaftar di dalam database keanggotaan PGRI Kabupaten Jepara sebagai wujud solidaritas."
    },
    {
      question: "Berapa Sumbangan Anggota?",
      answer: "Berdasarkan surat keputusan Pengurus PGRI Kabupaten Jepara nomor :034/SK/PGRI JPR/XXII/2020 tentang Teknis Pelaksanaan Dana Setia Kawan Duka PGRI Kabupaten Jepara, sumbangan Sanduka ditetapkan sebesar Rp. 3000 tiap anggota, dibayarkan tiap bulan, bersamaan dengan iuran anggota PGRI."
    },
    {
      question: "Berapa Santunan yang Diterima?",
      answer: "Sesuai keputusan bersama Pengurus PGRI Kabupaten Jepara dan Pengurus Cabang se-Kabupaten Jepara, maka disepakati sebesar Rp.2.500.000,- dengan kuota 5 orang tiap bulan dan apabila anggota meninggal lebih daripada kuota akan diperhitungkan pada bulan berikutnya."
    },
    {
      question: "Bagaimana Cara Pengajuannya?",
      answer: "Pengurus Cabang melaporkan kematian anggotanya secara online melalui aplikasi sanduka."
    }
  ];

  const daspenAccordionData = [
    {
      question: "Tentang Daspen PGRI Jawa Tengah?",
      answer: "Daspen (Dana Setiakawan Pensiun) adalah program solidaritas antaranggota PGRI yang dikelola oleh Yayasan Dana Setiakawan Guru Jawa Tengah. Daspen bertujuan untuk memberikan santunan kepada anggota yang pensiun atau meninggal dunia, serta memperkuat ikatan solidaritas dan kebersamaan di lingkungan PGRI."
    },
    {
      question: "Tujuan Daspen",
      answer: "• Menumbuhkan rasa solidaritas sesama anggota PGRI.\n• Menyediakan santunan bagi anggota yang pensiun atau meninggal dunia.\n• Mendukung kegiatan organisasi PGRI secara menyeluruh."
    },
    {
      question: "Manfaat Menjadi Anggota",
      answer: "✅ Mendapat santunan pensiun\n✅ Ahli waris mendapat santunan meninggal dunia\n✅ Ikut memperkuat solidaritas sesama guru dan anggota PGRI\n✅ Terlibat dalam program kemanusiaan dan sosial PGRI"
    },
    {
      question: "Syarat Menjadi Anggota Daspen",
      answer: (
        <div>
          • Merupakan anggota aktif PGRI.<br/>
          • Mengisi formulir permohonan secara online di{' '}
          <a 
            href="https://www.dansetjateng.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 mx-1"
          >
            www.dansetjateng.org
            <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
          </a>
          {' '}dan mencetak hasil download pernyataan menjadi anggota serta surat kuasa, selanjutnya menyerahkan ke Pengurus Ranting/Cabang/Kabupaten.<br/>
          • Melampirkan Fotokopi Kartu Tanda Anggota (KTA) PGRI.<br/><br/>
          <strong>Permohonan keanggotaan dapat ditolak jika:</strong><br/>
          • Tidak lengkap secara administratif<br/>
          • Diajukan mendadak hanya untuk mendapatkan santunan
        </div>
      )
    },
    {
      question: "Kategori dan Sumbangan Anggota",
      answer: "Berdasarkan usia saat mendaftar:\n• Kategori I: Usia ≤ 30 tahun → Sumbangan Rp15 x jumlah penerima santunan bulan berjalan\n• Kategori II: Usia 31–40 tahun → Sumbangan Rp20 x jumlah penerima santunan\n• Kategori III: Usia > 40 tahun → Sumbangan Rp25 x jumlah penerima santunan\n\nCatatan:\n• Sumbangan dibayarkan setiap bulan melalui pengurus PGRI Kabupaten/Kota.\n• Kategori usia akan diperbarui setiap awal tahun."
    },
    {
      question: "💰 Ketentuan Sumbangan Daspen Tahun 2025",
      answer: "Berdasarkan jumlah kuota penerima santunan sebanyak 850 orang:\n\n• Kategori I (≤ 30 tahun): Rp 15 × 850 = Rp 12.750,00\n• Kategori II (31-40 tahun): Rp 20 × 850 = Rp 17.000,00\n• Kategori III (> 40 tahun): Rp 25 × 850 = Rp 21.250,00"
    }
  ];

  const ktaAccordionData = [
    {
      question: "Guru Wajib Menjadi Anggota Organisasi Profesi",
      answer: "Sesuai dengan Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen, setiap guru wajib menjadi anggota organisasi profesi sebagai bagian dari upaya menjaga profesionalisme dan integritas dalam menjalankan tugas. Organisasi profesi guru diakui secara nasional, salah satunya adalah PGRI (Persatuan Guru Republik Indonesia), yang menyediakan wadah pembinaan, perlindungan, serta pengembangan keprofesian berkelanjutan."
    },
    {
      question: "Syarat Menjadi Anggota PGRI",
      answer: "• Berprofesi sebagai guru, dosen, pendidik, atau tenaga kependidikan.\n• Mengisi data diri lengkap melalui sistem digital.\n• Mendapat verifikasi keanggotaan melalui pengurus cabang/kabupaten/kota.\n• Berkomitmen pada kode etik guru dan AD/ART PGRI."
    },
    {
      question: "Cek Keanggotaan Anda",
      answer: (
        <div>
          Pastikan Anda telah terdaftar sebagai anggota organisasi profesi. Cek dan login melalui situs resmi:{' '}
          <a 
            href="https://www.ktadigitalpgri.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 mx-1"
          >
            www.ktadigitalpgri.org
            <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
          </a>
          <br/><br/>
          Login menggunakan email dan password yang telah dibuat saat pendaftaran untuk:<br/>
          • Melihat status keanggotaan<br/>
          • Mengakses fitur layanan<br/>
          • Mendaftar program tambahan seperti Sanduka dan Daspen<br/><br/>
          Jika Anda belum terdaftar, segera lakukan registrasi dan pastikan identitas Anda diverifikasi oleh pengurus PGRI setempat.
        </div>
      )
    },
    {
      question: "Fitur Layanan KTADIGITAL PGRI",
      answer: "• Aspirasi Guru: Fitur untuk penyampaian aspirasi, baik harapan, masukan, maupun kritik dari anggota terhadap organisasi.\n• Karya Guru: Fitur untuk publikasi dan portofolio anggota terkait praktik baik, publikasi ilmiah, dan media pembelajaran.\n• Lindungi Guru: Fitur untuk pengaduan dan permintaan pendampingan perlindungan hukum profesi guru.\n• Informasi Kegiatan: Menyajikan informasi kegiatan yang dilaksanakan dan dapat langsung diikuti oleh anggota.\n• Mutasi Anggota: Fasilitas untuk memindahkan keanggotaan antar cabang atau kabupaten/kota.\n• Update Data: Memperbarui data pribadi anggota secara mandiri dan aman."
    }
  ];

  return (
    <div className="py-8 md:py-12 w-full">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-teal-500">
          Informasi Keanggotaan PGRI Jepara
        </h2>

        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Main Accordion - Sanduka */}
          <div className="rounded-xl p-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className="bg-teal-500 text-white p-4 cursor-pointer flex items-center justify-between hover:bg-teal-600 transition-colors"
                onClick={toggleMainAccordion}
              >
                <div className="flex items-center gap-3">
                  {/* LOGO SANDUKA dengan background putih */}
                  <img src="/SANDUKA LOGO.png" alt="Logo Sanduka" className="h-10 w-auto object-contain bg-white p-1 rounded-full border border-gray-200" />
                  <span className="text-xl md:text-2xl font-bold">Sanduka (Santunan Duka)</span>
                </div>
                <svg className={`h-6 w-6 transform transition-transform ${activeAccordion === 'main' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {activeAccordion === 'main' && (
                <div className="bg-white p-6">
                  <div className="space-y-6">
                    <p className="text-teal-600 text-lg">
                      Prosedur dan persyaratan untuk pengajuan santunan duka.
                    </p>
                    
                    {/* Sub Accordions Sanduka */}
                    <div className="space-y-4">
                      {accordionData.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div 
                            className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                            onClick={() => toggleSubAccordion(index)}
                          >
                            <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                            <svg className={`h-5 w-5 transform transition-transform ${openSubAccordion === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openSubAccordion === index && (
                            <div className="px-4 pb-4">
                              <p className="text-teal-600 pt-2 leading-relaxed whitespace-pre-line">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daspen Accordion */}
          <div className="rounded-xl p-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className="bg-blue-500 text-white p-4 cursor-pointer flex items-center justify-between hover:bg-blue-600 transition-colors"
                onClick={toggleDaspenAccordion}
              >
                <div className="flex items-center gap-3">
                  {/* LOGO DASPEN dengan background putih */}
                  <img src="/daspen.png" alt="Logo Daspen" className="h-10 w-auto object-contain bg-white p-1 rounded-full border border-gray-200" />
                  <span className="text-xl md:text-2xl font-bold">Dana Pensiun (Daspen) PGRI Jawa Tengah</span>
                </div>
                <svg className={`h-6 w-6 transform transition-transform ${activeAccordion === 'daspen' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {activeAccordion === 'daspen' && (
                <div className="bg-white p-6">
                  <div className="space-y-6">
                    <p className="text-blue-600 text-lg">
                      DASPEN bukan tabungan, bukan asuransi, bukan koperasi tetapi sebagai bentuk kesetiakawanan guru Jawa tengah bagi anggota yang pensiun.
                    </p>
                    
                    {/* Daspen Sub Accordions */}
                    <div className="space-y-4">
                      {daspenAccordionData.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div 
                            className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                            onClick={() => toggleDaspenSubAccordion(index)}
                          >
                            <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                            <svg className={`h-5 w-5 transform transition-transform ${openDaspenSubAccordion === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openDaspenSubAccordion === index && (
                            <div className="px-4 pb-4">
                              <div className="text-blue-600 pt-2 leading-relaxed whitespace-pre-line">{item.answer}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* KTADIGITAL PGRI Accordion */}
          <div className="rounded-xl p-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className="bg-orange-500 text-white p-4 cursor-pointer flex items-center justify-between hover:bg-orange-600 transition-colors"
                onClick={toggleKTAAccordion}
              >
                <div className="flex items-center gap-3">
                  {/* LOGO PGRI dengan background putih */}
                  <img src="/PGRI.png" alt="Logo PGRI" className="h-10 w-auto object-contain bg-white p-1 rounded-full border border-gray-200" />
                  <span className="text-xl md:text-2xl font-bold">KTADIGITAL PGRI ( PB PGRI )</span>
                </div>
                <svg className={`h-6 w-6 transform transition-transform ${activeAccordion === 'kta' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {activeAccordion === 'kta' && (
                <div className="bg-white p-6">
                  <div className="space-y-6">
                    <p className="text-orange-600 text-lg">
                      KTADIGITAL PGRI adalah platform digital resmi dari Persatuan Guru Republik Indonesia (PGRI) yang dirancang untuk mendukung pelayanan kepada anggota, memperkuat profesionalisme guru, dan meningkatkan partisipasi aktif dalam organisasi profesi.
                    </p>
                    
                    {/* KTA Sub Accordions */}
                    <div className="space-y-4">
                      {ktaAccordionData.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div 
                            className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                            onClick={() => toggleKTASubAccordion(index)}
                          >
                            <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                            <svg className={`h-5 w-5 transform transition-transform ${openKTASubAccordion === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {openKTASubAccordion === index && (
                            <div className="px-4 pb-4">
                              <div className="text-orange-600 pt-2 leading-relaxed whitespace-pre-line">{item.answer}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Document links section */}
        <div className="mt-12 mb-6 px-4">
          <h3 className="text-xl font-bold text-center text-indigo-900 mb-8">
            Dokumen Terkait
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Link href="https://drive.google.com/file/d/1nvGIjmPZHRs8G1dsMAl8Q9ljaGYiIMrq/view?usp=drive_link" legacyBehavior>
              <a target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 w-full md:w-64">
                <div className="text-indigo-600 mb-4">
                  <FontAwesomeIcon icon={faFilePdf} size="3x" />
                </div>
                <span className="text-center font-semibold text-gray-800">
                  Surat Keputusan Sanduka
                </span>
                <span className="text-xs text-indigo-500 mt-2 font-medium">
                  Lihat Dokumen
                </span>
              </a>
            </Link>

            <Link href="https://drive.google.com/file/d/1JUVCRGX7hyc_MyicfSowfcfdLt2JMFDI/view?usp=drive_link" legacyBehavior>
              <a target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 w-full md:w-64">
                <div className="text-indigo-600 mb-4">
                  <FontAwesomeIcon icon={faFilePdf} size="3x" />
                </div>
                <span className="text-center font-semibold text-gray-800">
                  Surat Edaran Sanduka
                </span>
                <span className="text-xs text-indigo-500 mt-2 font-medium">
                  Lihat Dokumen
                </span>
              </a>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tentang;