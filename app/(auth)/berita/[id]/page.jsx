"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

import Header from "@/app/_components/Header";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";

import {
  ArrowLeft,
  Share2,
  Calendar,
  User,
  Eye,
  Clock,
  Send,
  ChevronRight,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Facebook } from "lucide-react";

const createSlug = (title) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function BeritaDetail() {
  const params = useParams();
  const id = params?.id;
  const { token, loading } = useAuth();

  const [mainNews, setMainNews] = useState([]); // 2 berita utama
  const [currentNews, setCurrentNews] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    const savedSidebar = localStorage.getItem("isSidebarOpen");
    if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === "true");

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    let activeNewsId = null;

    const fetchData = async () => {
      try {
        // Fetch semua berita yang dipublish
        const allNews = await GlobalApi.getAllBerita("PUBLISH");
        const other = Array.isArray(allNews) ? [...allNews] : [];
        const cleanParam = decodeURIComponent(String(id || "")).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

        const currentIndex = other.findIndex((item) => {
          const itemSlug = createSlug(item.judul);
          const itemIdStr = String(item.id);
          const cleanItemSlug = itemSlug.replace(/[^a-z0-9]/g, "");
          const cleanTarget = cleanParam.replace(/[^a-z0-9]/g, "");
          return (
            itemIdStr === cleanParam ||
            itemSlug === cleanParam ||
            (cleanItemSlug && cleanTarget && cleanItemSlug === cleanTarget) ||
            cleanParam.includes(itemSlug) ||
            itemSlug.includes(cleanParam) ||
            cleanParam.endsWith(`-${item.id}`)
          );
        });

        let current = null;
        if (currentIndex !== -1) {
          current = other[currentIndex];
          setCurrentNews(current);
          activeNewsId = current.id;
          other.splice(currentIndex, 1);
        } else {
          // Direct fetch from backend by slug or ID!
          try {
            const fetched = /^\d+$/.test(cleanParam)
              ? await GlobalApi.getBeritaById(cleanParam)
              : await GlobalApi.getBeritaBySlug(cleanParam);
            if (fetched) {
              current = fetched;
              setCurrentNews(fetched);
              activeNewsId = fetched.id;
            }
          } catch (e) {
            console.error("Gagal getBeritaBySlug / getById:", e);
          }
        }

        // Ambil 2 berita pertama sebagai headline utama
        const headlines = other.slice(0, 2);
        setMainNews(headlines);

        // Sisanya sebagai berita lainnya
        setOtherNews(other.slice(2, 8));

        // Increment views bila berita ditemukan
        if (activeNewsId) {
          try {
            const updatedBerita = await GlobalApi.getBeritaById(activeNewsId);
            if (updatedBerita) {
              setCurrentNews((prev) =>
                prev ? { ...prev, views: updatedBerita.views } : prev,
              );
            }
          } catch (e) {
            console.error("Gagal increment views:", e);
          }
        }
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatDate = (arr) => {
    if (!arr) return "";
    const date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (arr) => {
    if (!arr) return "";
    const date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatReadingTime = (content) => {
    const minutes = calculateReadTime(content);
    return `${minutes} menit`;
  };

  const cleanHtmlContent = (html) => {
    if (!html) return "";
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

  const renderNewsContent = (htmlContent) => {
    if (!htmlContent) return null;
    const cleanHtml = cleanHtmlContent(htmlContent);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanHtml;
    const elements = [];
    const children = tempDiv.children;

    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const tagName = el.tagName.toLowerCase();

      if (
        el.className.includes("continue-reading") ||
        el.id.includes("continuousReading") ||
        el.className.includes("article-cont-read")
      ) {
        continue;
      }

      if (tagName === "h2" || tagName === "h3" || tagName === "h4") {
        elements.push({ type: "heading", level: tagName, html: el.outerHTML });
      } else if (tagName === "p") {
        elements.push({ type: "paragraph", html: el.outerHTML });
      } else if (tagName === "img") {
        elements.push({ type: "image", html: el.outerHTML });
      } else if (tagName === "ul" || tagName === "ol") {
        elements.push({ type: "list", html: el.outerHTML });
      } else if (el.innerHTML.trim()) {
        elements.push({ type: "other", html: el.outerHTML });
      }
    }

    if (elements.length === 0) {
      return cleanHtml.split("\n").map((paragraph, idx) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;
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

    return elements.map((el, idx) => {
      if (el.type === "heading") {
        return (
          <div
            key={idx}
            className={`article-sub-heading ${el.level === "h2" ? "text-2xl md:text-3xl" : el.level === "h3" ? "text-xl md:text-2xl" : "text-lg md:text-xl"} font-bold text-gray-900 mt-10 mb-4`}
            dangerouslySetInnerHTML={{ __html: el.html }}
          />
        );
      }
      return (
        <div
          key={idx}
          className="mb-6 text-gray-700 text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: el.html }}
        />
      );
    });
  };

  const newsSlug = createSlug(currentNews?.judul);
  const shareUrl = newsSlug
    ? `https://www.pgrikabupatenjepara.com/berita/${newsSlug}`
    : `https://www.pgrikabupatenjepara.com/berita/${currentNews?.id || id || ""}`;
  const shareText = encodeURIComponent(currentNews?.judul || "Berita PGRI Kabupaten Jepara");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link berhasil disalin ke clipboard!");
      }
    } catch (error) {
      console.error("Gagal share:", error);
    }
  };

  const renderHeader = () => {
    if (token) {
      return isMobile ? <HeaderMobile /> : <HeaderMenu />;
    }
    return <Header />;
  };

  const mainContentClass = token
    ? `flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`
    : "w-full";

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {renderHeader()}
        <div className="flex flex-1">
          {token && (
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          )}
          <main className={mainContentClass}>
            <div className="pt-28 pb-16 min-h-screen max-w-6xl mx-auto px-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="h-96 bg-gray-200"></div>
                      <div className="p-8 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!currentNews) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {renderHeader()}
        <div className="flex flex-1">
          {token && (
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          )}
          <main className={mainContentClass}>
            <section className="pt-28 pb-16 min-h-screen max-w-3xl mx-auto px-4">
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Berita Tidak Ditemukan
                </h1>
                <p className="text-gray-600 mb-6">
                  Maaf, berita yang Anda cari tidak tersedia.
                </p>
                <Link
                  href={token ? "/home" : "/berita"}
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
                >
                  <ArrowLeft size={20} /> Kembali
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderHeader()}

      <div className="flex flex-1">
        {token && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}

        <main className={mainContentClass}>
          <section className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Navigasi Back */}
              <Link
                href={token ? "/home" : "/berita"}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-medium group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Kembali
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kolom Kiri: Berita Utama */}
                <div className="lg:col-span-9">
                  <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Hero Image */}
                    <div className="relative h-[600px] lg:h-[700px] overflow-hidden">
                      <img
                        src={
                          currentNews.galeri?.length > 0
                            ? `data:image/jpeg;base64,${currentNews.galeri[0].gambar}`
                            : "/placeholder.jpg"
                        }
                        alt={currentNews.judul}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10">
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{currentNews.username}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDateTime(currentNews.updatedAt)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <Eye size={16} />
                          <span>{currentNews.views} views</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>
                            {formatReadingTime(currentNews.isiBerita)}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {currentNews.judul}
                      </h1>

                      {/* Editor Info */}
                      <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-semibold text-lg">
                            {currentNews.responEditor?.charAt(0) || "E"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Editor: {currentNews.responEditor}
                          </p>
                          <p className="text-sm text-gray-500">Tim Redaksi</p>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="prose prose-lg max-w-none">
                        <div className="news-content">
                          {renderNewsContent(currentNews.isiBerita)}
                        </div>
                      </div>

                      {/* Galeri Tambahan */}
                      {currentNews.galeri && currentNews.galeri.length > 1 && (
                        <div className="mt-12 space-y-8">
                          {currentNews.galeri.slice(1).map((g, index) => (
                            <div key={g.id || index} className="space-y-3">
                              <div className="rounded-xl overflow-hidden shadow-lg">
                                <img
                                  src={`data:image/jpeg;base64,${g.gambar}`}
                                  alt="galeri"
                                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                              {g.deskripsi && (
                                <p className="text-xs italic text-gray-500 mt-2">
                                  {g.deskripsi}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Share Buttons */}
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
                              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition"
                            >
                              <Facebook size={18} />
                            </a>
                            <a
                              href={shareLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:scale-110 transition"
                            >
                              𝕏
                            </a>
                            <a
                              href={shareLinks.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition"
                            >
                              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                            </a>
                            <a
                              href={shareLinks.telegram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center shadow-md hover:scale-110 transition"
                            >
                              <Send size={18} />
                            </a>
                            <button
                              onClick={handleShare}
                              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shadow-md hover:bg-teal-100 hover:text-teal-600 hover:scale-110 transition"
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>

                {/* Kolom Kanan: 2 Headline Berita Utama */}
                <div className="lg:col-span-3">
                  <div className="sticky top-28">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-teal-600 inline-block">
                      Berita Utama
                    </h2>

                    <div className="space-y-4">
                      {mainNews.map((news, index) => (
                        <Link
                          key={news.id}
                          href={`/berita/${news.id}`}
                          className="group block"
                        >
                          {/* Perkecil card untuk sidebar yang lebih sempit */}
                          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                            <div className="relative h-36 overflow-hidden">
                              <img
                                src={
                                  news.galeri?.length > 0
                                    ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                                    : "/placeholder.jpg"
                                }
                                alt={news.judul}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                Utama
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                {formatDate(news.updatedAt)}
                              </div>
                              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition mb-1 line-clamp-2 text-sm">
                                {news.judul}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {news.isiBerita1?.slice(0, 80)}...
                              </p>
                              <div className="mt-2 flex items-center text-teal-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
                                Baca <ChevronRight size={12} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Berita Lainnya - Lebih ringkas */}
                    {otherNews.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-base font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">
                          Berita Lainnya
                        </h3>
                        <div className="space-y-3">
                          {otherNews.map((news) => (
                            <Link
                              key={news.id}
                              href={`/berita/${news.id}`}
                              className="group block"
                            >
                              <div className="flex gap-2 hover:bg-gray-50 p-1 rounded-lg transition">
                                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                                  <img
                                    src={
                                      news.galeri?.length > 0
                                        ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                                        : "/placeholder.jpg"
                                    }
                                    alt={news.judul}
                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 mb-0.5">
                                    {formatDate(news.updatedAt)}
                                  </div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition line-clamp-2 text-xs">
                                    {news.judul}
                                  </h4>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

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
    </div>
  );
}
