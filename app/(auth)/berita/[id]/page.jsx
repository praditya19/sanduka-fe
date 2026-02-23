"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  ThumbsUp,
  Facebook,
  Send,
  Calendar,
  User,
  Eye,
  Clock,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import GlobalApi from "@/app/_utils/GlobalApi";
import { useAuth } from "@/app/AuthContext";

export default function BeritaDetail({ params }) {
  const { id } = params;
  const { token, loading } = useAuth();
  const [relatedNews, setRelatedNews] = useState([]);
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await GlobalApi.getBeritaById(id);
        setNews(data);
      } catch (error) {
        console.error("Gagal ambil detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await GlobalApi.getAllBerita("PUBLISH");
        const filtered = data
          .filter((item) => item.id !== parseInt(id))
          .slice(0, 6);
        setRelatedNews(filtered);
      } catch (error) {
        console.error("Gagal ambil related news:", error);
      }
    };

    if (id) {
      fetchRelated();
    }
  }, [id]);

  const formatDate = (arr) => {
    if (!arr) return "";
    const date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatReadingTime = (content) => {
    if (!content) return "1 menit";
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} menit`;
  };

  // Fungsi untuk membersihkan HTML dari elemen-elemen yang tidak diinginkan
  const cleanHtmlContent = (html) => {
    if (!html) return "";

    // Hapus semua script, style, dan elemen yang tidak diinginkan
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(
        /<div[^>]*class="[^"]*continue-reading[^"]*"[^>]*>.*?<\/div>/gi,
        "",
      )
      .replace(
        /<div[^>]*id="[^"]*continuousReading[^"]*"[^>]*>.*?<\/div>/gi,
        "",
      )
      .replace(/<fluent-button[^>]*>.*?<\/fluent-button>/gi, "")
      .replace(
        /<div[^>]*class="[^"]*article-cont-read[^"]*"[^>]*>.*?<\/div>/gi,
        "",
      )
      .replace(/<slot[^>]*>.*?<\/slot>/gi, "")
      .replace(/data-t="[^"]*"/gi, "")
      .replace(/data-test-id="[^"]*"/gi, "")
      .replace(/current-value="[^"]*"/gi, "")
      .replace(/part="[^"]*"/gi, "")
      .replace(/slot="[^"]*"/gi, "");

    return clean;
  };

  // Fungsi untuk memformat konten berita dengan struktur yang rapi
  const renderNewsContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Bersihkan HTML dari elemen yang tidak diinginkan
    const cleanHtml = cleanHtmlContent(htmlContent);

    // Pisahkan berdasarkan tag dan buat struktur yang rapi
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanHtml;

    // Ambil semua elemen yang relevan
    const elements = [];
    const children = tempDiv.children;

    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const tagName = el.tagName.toLowerCase();

      // Skip elemen yang tidak diinginkan
      if (
        el.className.includes("continue-reading") ||
        el.id.includes("continuousReading") ||
        el.className.includes("article-cont-read")
      ) {
        continue;
      }

      if (tagName === "h2" || tagName === "h3" || tagName === "h4") {
        // Heading
        elements.push({
          type: "heading",
          level: tagName,
          content: el.textContent || el.innerHTML,
          html: el.outerHTML,
        });
      } else if (tagName === "p") {
        // Paragraf
        elements.push({
          type: "paragraph",
          content: el.innerHTML,
          html: el.outerHTML,
        });
      } else if (tagName === "img") {
        // Gambar
        elements.push({
          type: "image",
          src: el.src,
          alt: el.alt,
          html: el.outerHTML,
        });
      } else if (tagName === "ul" || tagName === "ol") {
        // List
        elements.push({
          type: "list",
          html: el.outerHTML,
        });
      } else if (el.innerHTML.trim()) {
        // Elemen lain yang mungkin berisi konten
        elements.push({
          type: "other",
          html: el.outerHTML,
        });
      }
    }

    // Jika tidak ada elemen yang terstruktur, gunakan pendekatan sederhana
    if (elements.length === 0) {
      return cleanHtml.split("\n").map((paragraph, idx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Deteksi heading
        if (trimmed.startsWith("<h2>") || trimmed.startsWith("<h3>")) {
          return (
            <div
              key={idx}
              className="article-heading"
              dangerouslySetInnerHTML={{ __html: trimmed }}
            />
          );
        }

        return (
          <p
            key={idx}
            className="text-gray-700 text-lg leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: trimmed }}
          />
        );
      });
    }

    // Render elemen yang sudah diproses
    return elements.map((el, idx) => {
      if (el.type === "heading") {
        return (
          <div
            key={idx}
            className={`article-sub-heading ${
              el.level === "h2"
                ? "text-2xl md:text-3xl"
                : el.level === "h3"
                  ? "text-xl md:text-2xl"
                  : "text-lg md:text-xl"
            } font-bold text-gray-900 mt-10 mb-4`}
            dangerouslySetInnerHTML={{ __html: el.html }}
          />
        );
      } else if (el.type === "paragraph") {
        return (
          <p
            key={idx}
            className="text-gray-700 text-lg leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: el.html }}
          />
        );
      } else if (el.type === "list") {
        return (
          <div
            key={idx}
            className="mb-6 text-gray-700 text-lg"
            dangerouslySetInnerHTML={{ __html: el.html }}
          />
        );
      } else {
        return (
          <div
            key={idx}
            className="mb-6 text-gray-700 text-lg"
            dangerouslySetInnerHTML={{ __html: el.html }}
          />
        );
      }
    });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(news?.judul || "");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodeURIComponent(
      shareUrl,
    )}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl,
    )}&text=${shareText}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
      shareUrl,
    )}`,
  };

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Cek halaman ini, informasinya menarik!",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link berhasil disalin ke clipboard!");
      }
    } catch (error) {
      console.error("Gagal share:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <>
        <Header />
        <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-96 bg-gray-200"></div>
                <div className="p-8 md:p-12">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!news) {
    return (
      <>
        <Header />
        <section className="pt-28 pb-16 bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Berita Tidak Ditemukan
              </h1>
              <p className="text-gray-600 mb-6">
                Maaf, berita yang Anda cari tidak tersedia.
              </p>
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition shadow-lg hover:shadow-xl"
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
      <section className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigasi */}
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-medium group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali ke Berita
          </Link>

          {/* Artikel Utama */}
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Gambar Utama */}
            <div className="relative h-[500px] overflow-hidden">
              <img
                src={
                  news.galeri?.length > 0
                    ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                    : "/placeholder.jpg"
                }
                alt={news.judul}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Judul di atas gambar */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {news.judul}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{news.username}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(news.updatedAt)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{news.views} views</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatReadingTime(news.isiBerita)} membaca</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Konten Artikel */}
            <div className="p-8 md:p-12">
              {/* Editor info */}
              <div className="flex items-center gap-3  pb-6 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-600 font-semibold text-lg">
                    {news.responEditor?.charAt(0) || "E"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Editor: {news.responEditor}
                  </p>
                  <p className="text-sm text-gray-500">Tim Redaksi</p>
                </div>
              </div>

              {/* Deskripsi gambar utama */}
              {news.galeri?.[0]?.deskripsi && (
                <div className="mb-8 text-start">
                  <p className="text-gray-700 text-base max-w-3xl mx-auto">
                    {news.galeri[0].deskripsi}
                  </p>
                </div>
              )}

              {/* Isi Berita - Versi yang sudah dibersihkan */}
              <div className="prose prose-lg max-w-none">
                <div className="news-content">
                  {renderNewsContent(news.isiBerita)}
                </div>
              </div>

              {/* Galeri Tambahan */}
              {news.galeri && news.galeri.length > 1 && (
                <div className="mt-12 space-y-8">
                  {news.galeri.slice(1).map((g, index) => (
                    <div key={g.id || index} className="space-y-3">
                      <div className="rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={`data:image/jpeg;base64,${g.gambar}`}
                          alt={g.deskripsi || "galeri"}
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      {g.deskripsi && (
                        <p className="text-start text-gray-700  text-base">
                          {g.deskripsi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Share buttons */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bagikan Artikel Ini:
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-200 shadow-md"
                      aria-label="Bagikan ke Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 hover:scale-110 transition-all duration-200 shadow-md"
                      aria-label="Bagikan ke Twitter"
                    >
                      𝕏
                    </a>
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all duration-200 shadow-md"
                      aria-label="Bagikan ke WhatsApp"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                    </a>
                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 hover:scale-110 transition-all duration-200 shadow-md"
                      aria-label="Bagikan ke Telegram"
                    >
                      <Send size={18} />
                    </a>
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 hover:scale-110 transition-all duration-200 shadow-md"
                      aria-label="Bagikan lainnya"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Berita Terkait */}
          {relatedNews.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-gray-900">
                  Berita Lainnya
                </h2>
                <Link
                  href="/berita"
                  className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
                >
                  Lihat Semua
                  <ArrowLeft size={18} className="rotate-180" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          item.galeri?.length > 0
                            ? `data:image/jpeg;base64,${item.galeri[0].gambar}`
                            : "/placeholder.jpg"
                        }
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition mb-2 line-clamp-2 text-lg">
                        {item.judul}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.isiBerita?.replace(/<[^>]*>/g, "").slice(0, 100)}
                        ...
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(item.updatedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              Berita Lainnya Untuk Anda
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.id}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        item.fotoUtama
                          ? `data:image/jpeg;base64,${item.fotoUtama}`
                          : "/placeholder.jpg"
                      }
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition mb-3 line-clamp-2">
                      {item.judul}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.isiBerita1?.slice(0, 100)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .news-content {
          font-family:
            "Segoe UI",
            system-ui,
            -apple-system,
            sans-serif;
        }
        .news-content h2,
        .news-content .article-sub-heading {
          font-size: 28px;
          font-weight: 600;
          margin-top: 32px;
          margin-bottom: 16px;
          line-height: 36px;
          color: #1a1a1a;
        }
        .news-content h3 {
          font-size: 24px;
          font-weight: 600;
          margin-top: 28px;
          margin-bottom: 14px;
          line-height: 32px;
        }
        .news-content p {
          margin-bottom: 20px;
          font-size: 18px;
          line-height: 1.7;
          color: #2d2d2d;
        }
        .news-content em {
          font-style: italic;
        }
        .news-content strong {
          font-weight: 600;
        }
        .news-content a {
          color: #0d9488;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .news-content a:hover {
          color: #0f766e;
        }
        .news-content ul,
        .news-content ol {
          margin-bottom: 20px;
          padding-left: 24px;
        }
        .news-content li {
          margin-bottom: 8px;
          font-size: 18px;
          line-height: 1.7;
        }
        .news-content blockquote {
          border-left: 4px solid #0d9488;
          padding-left: 20px;
          margin: 24px 0;
          font-style: italic;
          color: #4a4a4a;
        }
      `}</style>
    </>
  );
}
