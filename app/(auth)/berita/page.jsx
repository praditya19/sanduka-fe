"use client";
import React from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";

const newsData = [
  {
    id: 1,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    content:
      "Program digitalisasi yang dicanangkan oleh PGRI ini merupakan langkah strategis dalam menghadapi era transformasi digital. Dengan teknologi terkini, kami berkomitmen meningkatkan efisiensi operasional dan transparansi dalam setiap aspek administrasi organisasi.\n\nProgram ini mencakup digitalisasi database anggota, sistem pelaporan keuangan, dan manajemen dokumentasi elektronik. Diharapkan implementasi penuh dapat tercapai dalam kuartal pertama tahun 2026.\n\nSemua anggota PGRI akan mendapatkan pelatihan gratis untuk menggunakan platform digital ini. Tim teknis kami siap memberikan dukungan 24/7 untuk memastikan transisi yang mulus.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    link: "/berita/1",
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
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    link: "/berita/2",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
  },
  {
    id: 3,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    link: "/berita/3",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
  },
  {
    id: 4,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    link: "/berita/4",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
  },
  {
    id: 5,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    link: "/berita/5",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
  },
  {
    id: 6,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    link: "/berita/6",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
  },
  {
    id: 7,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    link: "/berita/7",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
  },
  {
    id: 8,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    link: "/berita/8",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
  },
  {
    id: 9,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    link: "/berita/9",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
  },
  {
    id: 10,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    link: "/berita/10",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
  },
  {
    id: 11,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    link: "#",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
  },
  {
    id: 12,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    link: "#",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
  },
  {
    id: 13,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    link: "#",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
  },
  {
    id: 14,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    link: "#",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
  },
  {
    id: 15,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    link: "#",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
  },
  {
    id: 16,
    title: "PGRI Resmi Meluncurkan Program Digitalisasi Administrasi",
    excerpt:
      "Program digitalisasi ini bertujuan untuk meningkatkan efisiensi layanan dan transparansi administrasi di lingkungan PGRI.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    link: "#",
    contributor: "Admin PGRI",
    editor: "Tim Editorial",
    views: 1240,
  },
  {
    id: 17,
    title: "Workshop Pengembangan Kompetensi Guru Digelar di Jepara",
    excerpt:
      "Workshop ini diikuti ratusan guru dengan fokus pada peningkatan kualitas pembelajaran berbasis teknologi.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    link: "#",
    contributor: "Humas PGRI",
    editor: "Redaksi",
    views: 980,
  },
  {
    id: 18,
    title: "Kerja Sama PGRI dengan Mitra Biro Perjalanan Resmi Dimulai",
    excerpt:
      "Kerja sama ini diharapkan dapat memberikan kemudahan dan manfaat khusus bagi seluruh anggota PGRI.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    link: "#",
    contributor: "Sekretariat",
    editor: "Editor Lapangan",
    views: 760,
  },
];

const truncateWords = (text, maxWords) => {
  const words = text.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
};

const Berita = () => {
  return (
    <>
      <Header />

      <section className="pt-28 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Berita
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tetap update dengan informasi terbaru dari kami
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData.map((news) => (
              <div
                key={news.id}
                className="rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-56">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <h3 className="absolute bottom-4 left-4 right-4 text-white text-lg font-semibold leading-snug">
                    {news.title}
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-sm text-gray-600">
                    {truncateWords(news.excerpt, 20)}
                  </p>

                  <a
                    href={`/berita/${news.id}`}
                    className="inline-block text-sm font-medium text-teal-600 hover:underline"
                  >
                    Baca Selengkapnya →
                  </a>

                  <div className="pt-3 border-t text-xs text-gray-500 flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-700">
                        Contributor: {news.contributor}
                      </span>{" "}
                      · Editor: {news.editor}
                    </div>
                    <div>👁️ {news.views} views</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Berita;
