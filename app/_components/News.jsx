import { useEffect, useState } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";
import Link from "next/link";

const truncateWords = (text, maxWords = 20) => {
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

        const sorted = data.sort((a, b) => {
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

          return dateB - dateA; // terbaru di atas
        });

        setNewsData(sorted.slice(0, 4)); // ambil 4 terbaru
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {newsData.slice(0, 4).map((news, index) => (
          <article
            key={news.id}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out"
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

            <Link href={`/berita/${news.id}`} className="block">
              <div className="relative h-64 lg:h-72 overflow-hidden cursor-pointer">
                {" "}
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
                <h3 className="absolute bottom-4 left-4 right-4 z-20 text-white text-xl lg:text-2xl font-bold leading-tight drop-shadow-lg">
                  {news.judul.length > 70
                    ? news.judul.substring(0, 70) + "..."
                    : news.judul}
                </h3>
              </div>
            </Link>

            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="text-xs text-gray-500 flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-700">
                        Contributor: {news.username} | Editor: {news.username}
                      </span>

                      <div className="mt-1 text-gray-400">
                        {formatDate(news.updatedAt)}
                      </div>
                    </div>
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
                  <span className="text-sm">{news.views}</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-5 line-clamp-3">
                {truncateWords(stripHtml(news.isiBerita, 25))}
              </p>

              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
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
            </div>

            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 group-hover:ring-teal-500/20 transition-all duration-500 pointer-events-none" />
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;
