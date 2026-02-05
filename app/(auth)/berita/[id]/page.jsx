"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  ThumbsUp,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "@/app/AuthContext";

// Data yang sama seperti di halaman berita
const newsDataDetail = [
  {
    id: 1,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    content:
      "Program digitalisasi yang dicanangkan oleh PGRI ini merupakan langkah strategis dalam menghadapi era transformasi digital. Dengan teknologi terkini, kami berkomitmen meningkatkan efisiensi operasional dan transparansi dalam setiap aspek administrasi organisasi.\n\nProgram ini mencakup digitalisasi database anggota, sistem pelaporan keuangan, dan manajemen dokumentasi elektronik. Diharapkan implementasi penuh dapat tercapai dalam kuartal pertama tahun 2026.\n\nSemua anggota PGRI akan mendapatkan pelatihan gratis untuk menggunakan platform digital ini. Tim teknis kami siap memberikan dukungan 24/7 untuk memastikan transisi yang mulus.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
    date: "5 Februari 2026",
  },
  {
    id: 2,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    content:
      "Workshop pengembangan kompetensi guru yang diadakan di Jepara menghadirkan pembicara-pembicara terkemuka dari bidang pendidikan dan teknologi. Acara ini berlangsung selama tiga hari dengan menghadirkan lebih dari 500 peserta guru dari berbagai cabang PGRI.\n\nMateri workshop mencakup strategi pembelajaran modern, integrasi teknologi dalam kelas, dan pengembangan bahan ajar digital. Para peserta juga mendapatkan sertifikat resmi yang dapat meningkatkan kredibilitas profesional mereka.\n\nFeedback dari peserta sangat positif, dengan 95% menyatakan workshop ini sangat bermanfaat dan ingin mengikuti kegiatan serupa di masa mendatang.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
    date: "3 Februari 2026",
  },
  {
    id: 3,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    content:
      "Kemitraan strategis antara PGRI dan Biro Perjalanan terkemuka resmi diluncurkan untuk memberikan benefit eksklusif kepada semua anggota. Melalui kerjasama ini, anggota PGRI akan mendapatkan harga khusus untuk paket wisata, umroh, dan perjalanan bisnis.\n\nBenefitnya termasuk diskon hingga 20% untuk paket tour, kemudahan pembayaran cicilan tanpa bunga, dan layanan konsultasi perjalanan gratis. Program ini juga menawarkan asuransi perjalanan komprehensif dengan harga terjangkau.\n\nPendaftaran sudah dibuka dan anggota dapat langsung menghubungi kantor cabang masing-masing untuk mendapatkan informasi lebih lengkap dan menikmati berbagai keuntungan eksklusif ini.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
    date: "1 Februari 2026",
  },
  {
    id: 4,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    content:
      "Program digitalisasi yang dicanangkan oleh PGRI ini merupakan langkah strategis dalam menghadapi era transformasi digital. Dengan teknologi terkini, kami berkomitmen meningkatkan efisiensi operasional dan transparansi dalam setiap aspek administrasi organisasi.\n\nProgram ini mencakup digitalisasi database anggota, sistem pelaporan keuangan, dan manajemen dokumentasi elektronik. Diharapkan implementasi penuh dapat tercapai dalam kuartal pertama tahun 2026.\n\nSemua anggota PGRI akan mendapatkan pelatihan gratis untuk menggunakan platform digital ini. Tim teknis kami siap memberikan dukungan 24/7 untuk memastikan transisi yang mulus.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
    date: "5 Februari 2026",
  },
  {
    id: 5,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    content:
      "Workshop pengembangan kompetensi guru yang diadakan di Jepara menghadirkan pembicara-pembicara terkemuka dari bidang pendidikan dan teknologi. Acara ini berlangsung selama tiga hari dengan menghadirkan lebih dari 500 peserta guru dari berbagai cabang PGRI.\n\nMateri workshop mencakup strategi pembelajaran modern, integrasi teknologi dalam kelas, dan pengembangan bahan ajar digital. Para peserta juga mendapatkan sertifikat resmi yang dapat meningkatkan kredibilitas profesional mereka.\n\nFeedback dari peserta sangat positif, dengan 95% menyatakan workshop ini sangat bermanfaat dan ingin mengikuti kegiatan serupa di masa mendatang.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
    date: "3 Februari 2026",
  },
  {
    id: 6,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    content:
      "Kemitraan strategis antara PGRI dan Biro Perjalanan terkemuka resmi diluncurkan untuk memberikan benefit eksklusif kepada semua anggota. Melalui kerjasama ini, anggota PGRI akan mendapatkan harga khusus untuk paket wisata, umroh, dan perjalanan bisnis.\n\nBenefitnya termasuk diskon hingga 20% untuk paket tour, kemudahan pembayaran cicilan tanpa bunga, dan layanan konsultasi perjalanan gratis. Program ini juga menawarkan asuransi perjalanan komprehensif dengan harga terjangkau.\n\nPendaftaran sudah dibuka dan anggota dapat langsung menghubungi kantor cabang masing-masing untuk mendapatkan informasi lebih lengkap dan menikmati berbagai keuntungan eksklusif ini.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
    date: "1 Februari 2026",
  },
];

export default function BeritaDetail({ params }) {
  const { id } = params;
  const { token, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const news = newsDataDetail.find((item) => item.id === parseInt(id));

  useEffect(() => {
    // Tunggu hingga auth loading selesai
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  // Jangan render apapun saat loading
  if (isLoading || loading) {
    return null;
  }

  if (!news) {
    return (
      <>
        <Header />
        <section className="pt-28 pb-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Berita Tidak Ditemukan
              </h1>
              <p className="text-gray-600 mb-6">
                Maaf, berita yang Anda cari tidak tersedia.
              </p>
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
              >
                <ArrowLeft size={20} />
                Kembali ke Berita
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Header />
      <section className="pt-28 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Kembali ke Berita
          </Link>

          {/* Main Layout with Sidebar */}
          <div className="flex gap-8">
            {/* Sidebar Social Actions - Sticky */}
            <div className="hidden lg:flex lg:w-20 flex-shrink-0">
              <div className="sticky top-32 flex flex-col items-center gap-2 bg-white rounded-full p-3 shadow-md w-20 h-fit">
                <button
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gray-100 hover:bg-teal-100 hover:text-teal-600 transition text-gray-600 font-semibold text-xs"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
        
              </div>
            </div>

            {/* Article Container */}
            <article className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      {news.contributor}
                    </span>
                  </div>
                  <span>•</span>
                  <div>{news.date}</div>
                  <span>•</span>
                  <div>👁️ {news.views} views</div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {news.title}
                </h1>

                {/* Editor Information */}
                <div className="bg-teal-50 border-l-4 border-teal-600 p-4 mb-8 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Editor:</span> {news.editor}
                  </p>
                </div>

                {/* Main Content */}
                <div className="prose prose-lg max-w-none mb-12">
                  {news.content.split("\n\n").map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-gray-700 text-base leading-relaxed mb-6"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

              </div>
            </article>
          </div>

          {/* Related Articles Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              Berita Lainnya Untuk Anda
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsDataDetail
                .filter((item) => item.id !== news.id)
                .slice(0, 6)
                .map((relatedNews) => (
                  <Link
                    key={relatedNews.id}
                    href={`/berita/${relatedNews.id}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={relatedNews.image}
                        alt={relatedNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition mb-3 line-clamp-2">
                        {relatedNews.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {relatedNews.excerpt}
                      </p>
                      <p className="text-xs text-gray-500">
                        {relatedNews.date}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
        <div className="flex justify-around items-center gap-2">
          <button className="flex flex-col items-center justify-center flex-1 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600 text-xs font-medium">
            <ThumbsUp size={20} />
            <span className="text-xs mt-1">Suka</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600 text-xs font-medium">
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Komentar</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600 text-xs font-medium">
            <Share2 size={20} />
            <span className="text-xs mt-1">Bagikan</span>
          </button>
        </div>
      </div>
    </>
  );
}
