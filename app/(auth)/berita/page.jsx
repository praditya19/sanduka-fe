"use client";
import React, { useEffect, useState } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

import Link from "next/link";
import Header from "@/app/_components/Header";

const truncateWords = (text = "", maxWords = 20) => {
  const words = text.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
};

const Berita = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const data = await GlobalApi.getAllBerita("PUBLISH");
        setNewsData(data);
      } catch (error) {
        console.error("Gagal mengambil berita:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []);
  const formatDate = (arr) => {
    if (!arr) return "";

    const date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };
  return (
    <>
      <Header />

      <section className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-0 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-full border border-teal-100 shadow-sm">
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                ✦ UPDATE TERKINI ✦
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Jelajahi{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  Berita Terbaru
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-teal-200"
                  viewBox="0 0 120 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C28.5 10 55 4 82 4C109 4 116.5 7.5 118 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="8 8"
                  />
                </svg>
              </span>
            </h2>

            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Tetap terhubung dengan perkembangan terbaru, inspirasi, dan cerita
              menarik
              <span className="text-teal-600 font-semibold">
                {" "}
                dari komunitas kami
              </span>
            </p>

            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {newsData.length}
                </div>
                <div className="text-sm text-gray-500">Total Berita</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {newsData.reduce((acc, news) => acc + (news.views || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Total Views</div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                Memuat berita terbaru...
              </p>
            </div>
          )}

          {!loading && newsData.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Belum Ada Berita
              </h3>
              <p className="text-gray-500">
                Saat ini belum ada berita yang tersedia. Silakan kunjungi lagi
                nanti.
              </p>
            </div>
          )}

          {!loading && newsData.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {newsData.map((news, index) => (
                  <article
                    key={news.id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      {news.views > 100 && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          POPULER
                        </span>
                      )}
                      {index < 3 && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          TERBARU
                        </span>
                      )}
                    </div>

                    <Link href={`/berita/${news.id}`} className="block">
                      <div className="relative h-56 lg:h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        <img
                          src={
                            news.galeri?.length > 0
                              ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                              : "/placeholder.jpg"
                          }
                          alt={news.judul}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />

                        <h3 className="absolute bottom-4 left-4 right-4 z-20 text-white text-lg font-bold leading-tight drop-shadow-lg line-clamp-2">
                          {news.judul}
                        </h3>
                      </div>
                    </Link>

                    <div className="p-6">
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {news.username?.charAt(0).toUpperCase() || "A"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {news.username}
                            </p>
                            <p className="text-xs text-gray-500">Editor</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            {news.views || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(news.updatedAt)}</span>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {stripHtml(news.isiBerita || "")
                          .split(" ")
                          .slice(0, 25)
                          .join(" ")}
                        ...
                      </p>

                      <Link
                        href={`/berita/${news.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 group/link"
                      >
                        <span>Baca Selengkapnya</span>
                        <svg
                          className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>
                    </div>

                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 transform translate-x-8 -translate-y-8 rotate-45 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  </article>
                ))}
              </div>

              {newsData.length > 6 && (
                <div className="text-center mt-16">
                  <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 hover:border-teal-500 rounded-full text-gray-700 font-semibold hover:text-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span>Muat Lebih Banyak</span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-y-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </section>
    </>
  );
};

export default Berita;
