import { useEffect, useState } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import Link from "next/link";

const truncateWords = (text, maxWords = 205) => {
  if (!text) return "";

  const words = text.split(" ");
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "..."
    : text;
};

const News = () => {
  const [newsData, setNewsData] = useState([]);
  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const data = await GlobalApi.getAllBerita("PUBLISH");

        const sortedByViews = [...data].sort((a, b) => {
          const viewsA = a.views || 0;
          const viewsB = b.views || 0;
          return viewsB - viewsA;
        });

        const sortedByDate = [...data].sort((a, b) => {
          const dateA = new Date(
            a.updatedAt[0],
            a.updatedAt[1] - 1,
            a.updatedAt[2],
            a.updatedAt[3],
            a.updatedAt[4],
            a.updatedAt[5],
          );
          const dateB = new Date(
            b.updatedAt[0],
            b.updatedAt[1] - 1,
            b.updatedAt[2],
            b.updatedAt[3],
            b.updatedAt[4],
            b.updatedAt[5],
          );
          return dateB - dateA;
        });

        setNewsData(sortedByViews);
      } catch (error) {
        console.error("Gagal mengambil berita:", error);
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
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border border-teal-100">
          <span className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
            • UPDATE TERKINI •
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
          Berita{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500 relative">
            Terbaru
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="8"
              viewBox="0 0 120 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6C28.5 6 55 2 82 2C109 2 116.5 4.5 118 5.5"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="2"
                  y1="6"
                  x2="118"
                  y2="5.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#14B8A6" />
                  <stop offset="1" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Tetap update dengan informasi terbaru, berita terkini,
          <span className="text-gray-700 font-medium">
            {" "}
            dan perkembangan terbaru{" "}
          </span>
          dari kami
        </p>
      </div>

      {/* Grid Layout: 1 Berita Utama (kiri) + 2 Berita (kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Kolom Kiri: 1 Berita Populer (views > 100) */}
        <div className="lg:col-span-9">
          {(() => {
            const popularNews = getPopularNews();
            const topPopular = popularNews.length > 0 ? popularNews[0] : null;

            // Jika tidak ada berita populer, coba ambil berita dengan views tertinggi
            const fallbackNews =
              !topPopular && newsData.length > 0
                ? [...newsData].sort((a, b) => b.views - a.views)[0]
                : null;

            const displayNews = topPopular || fallbackNews;

            if (!displayNews) {
              return (
                <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
                  <p className="text-gray-500">Belum ada data berita</p>
                </div>
              );
            }

            return (
              <article
                key={displayNews.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out h-full flex flex-col"
              >
                {/* Badge dengan informasi views */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`px-3 py-1.5 ${displayNews.views > 100 ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-teal-500"} text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {displayNews.views > 100
                      ? `POPULER - ${displayNews.views} Views`
                      : `${displayNews.views} Views`}
                  </span>
                </div>

                <Link
                  href={`/berita/${displayNews.id}`}
                  className="block flex-1"
                >
                  <div className="relative h-[400px] lg:h-[450px] overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    <img
                      src={
                        displayNews.galeri?.length > 0
                          ? `data:image/jpeg;base64,${displayNews.galeri[0].gambar}`
                          : "/placeholder.jpg"
                      }
                      alt={displayNews.judul}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
                        {displayNews.kategori || "Berita"}
                      </span>
                    </div>
                    <h3 className="absolute bottom-6 left-6 right-6 z-20 text-white text-2xl lg:text-3xl font-bold leading-tight drop-shadow-lg line-clamp-3">
                      {displayNews.judul}
                    </h3>
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-4 text-gray-500">
                        <div className="text-xs text-gray-500">
                          <div>
                            <span className="font-medium text-gray-700">
                              {displayNews.username}
                            </span>
                            <div className="mt-1 text-gray-400">
                              {formatDate(displayNews.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-amber-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 4.5C7.5 4.5 4 7.5 3 12c1 4.5 4.5 7.5 9 7.5s8-3 9-7.5c-1-4.5-4.5-7.5-9-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
                        </svg>
                        <span className="text-sm font-semibold">
                          {displayNews.views} Views
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-5">
                      {truncateWords(stripHtml(displayNews.isiBerita))}
                    </p>

                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:text-teal-700 group/link">
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
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 group-hover:ring-teal-500/20 transition-all duration-500 pointer-events-none" />
              </article>
            );
          })()}
        </div>

        {/* Kolom Kanan: 2 Berita (5 kolom) - Tinggi mengikuti konten */}
        <div className="lg:col-span-3">
          <div className="h-full flex flex-col gap-6">
            {newsData.slice(1, 3).map((news, index) => (
              <article
                key={news.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out flex-1 flex flex-col"
              >
                {news.views > 100 && (
                  <div className="absolute top-4 left-4 z-10">
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
                  </div>
                )}

                <Link href={`/berita/${news.id}`} className="block flex-1">
                  <div className="relative h-56 lg:h-64 overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    <img
                      src={
                        news.galeri?.length > 0
                          ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                          : "/placeholder.jpg"
                      }
                      alt={news.judul}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
                        {news.kategori}
                      </span>
                    </div>
                    <h3 className="absolute bottom-4 left-4 right-4 z-20 text-white text-xl font-bold leading-tight drop-shadow-lg line-clamp-2">
                      {news.judul}
                    </h3>
                  </div>

                  <div className="p-5 lg:p-6">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-4 text-gray-500">
                        <div className="text-xs text-gray-500">
                          <div>
                            <span className="font-medium text-gray-700 text-xs">
                              {news.username}
                            </span>
                            <div className="mt-1 text-gray-400 text-xs">
                              {formatDate(news.updatedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-xs">{news.views}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2 text-sm">
                      {truncateWords(stripHtml(news.isiBerita, 20))}
                    </p>

                    <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 group-hover:text-teal-700 group/link">
                        <span>Baca Selengkapnya</span>
                        <svg
                          className="w-3 h-3 transform group-hover/link:translate-x-1 transition-transform duration-300"
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
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 group-hover:ring-teal-500/20 transition-all duration-500 pointer-events-none" />
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Tombol Lihat Semua Berita (opsional) */}
      <div className="mt-12 text-center">
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          <span>Lihat Semua Berita</span>
          <svg
            className="w-5 h-5"
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
    </div>
  );
};

export default News;
