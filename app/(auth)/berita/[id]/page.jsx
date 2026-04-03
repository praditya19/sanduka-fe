"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";

// Import Layout Components
import Header from "@/app/_components/Header"; // Header Publik
import HeaderMenu from "@/app/_components/HeaderMenu"; // Header Desktop Login
import HeaderMobile from "@/app/_components/HeaderMobile"; // Header Mobile Login
import Sidebar from "@/app/_components/Sidebar"; // Sidebar Menu

import {
  ArrowLeft,
  Share2,
  Calendar,
  User,
  Eye,
  Clock,
  Send,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Facebook } from "lucide-react";

export default function BeritaDetail() {
  const params = useParams();
  const id = params?.id;
  const { token, loading } = useAuth(); // Menggunakan token untuk cek status login
  
  const [relatedNews, setRelatedNews] = useState([]);
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Layout Dashboard (Setelah Login)
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Cek ukuran layar & state sidebar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Set initial value
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

  // 2. Fetch Data Berita
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
    if (id) fetchDetail();
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
    if (id) fetchRelated();
  }, [id]);

  // Helper Functions
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

  const cleanHtmlContent = (html) => {
    if (!html) return "";
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<div[^>]*class="[^"]*continue-reading[^"]*"[^>]*>.*?<\/div>/gi, "")
      .replace(/<div[^>]*id="[^"]*continuousReading[^"]*"[^>]*>.*?<\/div>/gi, "")
      .replace(/<fluent-button[^>]*>.*?<\/fluent-button>/gi, "")
      .replace(/<div[^>]*class="[^"]*article-cont-read[^"]*"[^>]*>.*?<\/div>/gi, "")
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
          return <div key={idx} className="article-heading" dangerouslySetInnerHTML={{ __html: trimmed }} />;
        }
        return <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: trimmed }} />;
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
      return <div key={idx} className="mb-6 text-gray-700 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: el.html }} />;
    });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(news?.judul || "");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link berhasil disalin ke clipboard!");
      }
    } catch (error) {
      console.error("Gagal share:", error);
    }
  };

  // --- RENDER COMPONENT ---
  
  // Fungsi untuk me-render Header yang dinamis (Publik vs Login)
  const renderHeader = () => {
    if (token) {
      return isMobile ? <HeaderMobile /> : <HeaderMenu />;
    }
    return <Header />;
  };

  // Mengatur Class margin untuk konten utama (agar tidak tertutup sidebar)
  const mainContentClass = token 
    ? `flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`
    : "w-full";


  // TAMPILAN LOADING
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {renderHeader()}
        <div className="flex flex-1">
          {token && <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          <main className={mainContentClass}>
            <div className="pt-28 pb-16 min-h-screen max-w-4xl mx-auto px-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-96 bg-gray-200"></div>
                  <div className="p-8 md:p-12 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // TAMPILAN TIDAK DITEMUKAN (404)
  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {renderHeader()}
        <div className="flex flex-1">
          {token && <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          <main className={mainContentClass}>
            <section className="pt-28 pb-16 min-h-screen max-w-3xl mx-auto px-4">
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Berita Tidak Ditemukan</h1>
                <p className="text-gray-600 mb-6">Maaf, berita yang Anda cari tidak tersedia.</p>
                <Link href={token ? "/home" : "/berita"} className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition">
                  <ArrowLeft size={20} /> Kembali
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // TAMPILAN BERITA UTAMA
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Dinamis */}
      {renderHeader()}
      
      <div className="flex flex-1">
        {/* Sidebar Dinamis (Hanya muncul kalau punya token login) */}
        {token && <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
        
        {/* Konten Utama */}
        <main className={mainContentClass}>
          <section className="pt-28 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Navigasi Back */}
              <Link
                href={token ? "/home" : "/berita"}
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-medium group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Kembali
              </Link>

              {/* Artikel Utama */}
              <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative h-[500px] overflow-hidden">
                  <img
                    src={news.galeri?.length > 0 ? `data:image/jpeg;base64,${news.galeri[0].gambar}` : "/placeholder.jpg"}
                    alt={news.judul}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      {news.judul}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                      <div className="flex items-center gap-2"><User size={16} /><span>{news.username}</span></div>
                      <span>•</span>
                      <div className="flex items-center gap-2"><Calendar size={16} /><span>{formatDate(news.updatedAt)}</span></div>
                      <span>•</span>
                      <div className="flex items-center gap-2"><Eye size={16} /><span>{news.views} views</span></div>
                      <span>•</span>
                      <div className="flex items-center gap-2"><Clock size={16} /><span>{formatReadingTime(news.isiBerita)}</span></div>
                    </div>
                  </div>
                </div>

                {news.galeri?.[0]?.deskripsi && (
                  <p className="text-xs italic text-gray-500 px-8 md:px-12 pt-3">{news.galeri[0].deskripsi}</p>
                )}

                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-600 font-semibold text-lg">{news.responEditor?.charAt(0) || "E"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Editor: {news.responEditor}</p>
                      <p className="text-sm text-gray-500">Tim Redaksi</p>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none mt-8">
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
                            <img src={`data:image/jpeg;base64,${g.gambar}`} alt="galeri" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                          </div>
                          {g.deskripsi && <p className="text-xs italic text-gray-500 mt-2">{g.deskripsi}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Share buttons */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <h3 className="text-lg font-semibold text-gray-900">Bagikan Artikel Ini:</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition"><Facebook size={18} /></a>
                        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:scale-110 transition">𝕏</a>
                        <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition"><FontAwesomeIcon icon={faWhatsapp} size="lg" /></a>
                        <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center shadow-md hover:scale-110 transition"><Send size={18} /></a>
                        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shadow-md hover:bg-teal-100 hover:text-teal-600 hover:scale-110 transition"><Share2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Berita Terkait */}
              {relatedNews.length > 0 && (
                <div className="mt-20">
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">Berita Lainnya Untuk Anda</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedNews.map((item) => (
                      <Link key={item.id} href={`/berita/${item.id}`} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                        <div className="relative h-56 overflow-hidden">
                          <img src={item.fotoUtama ? `data:image/jpeg;base64,${item.fotoUtama}` : "/placeholder.jpg"} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition mb-3 line-clamp-2">{item.judul}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.isiBerita1?.slice(0, 100)}...</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Style CSS (Tetap sama) */}
      <style jsx>{`
        .news-content { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; }
        .news-content h2, .news-content .article-sub-heading { font-size: 28px; font-weight: 600; margin-top: 32px; margin-bottom: 16px; line-height: 36px; color: #1a1a1a; }
        .news-content h3 { font-size: 24px; font-weight: 600; margin-top: 28px; margin-bottom: 14px; line-height: 32px; }
        .news-content p { margin-bottom: 20px; font-size: 18px; line-height: 1.7; color: #2d2d2d; }
        .news-content em { font-style: italic; }
        .news-content strong { font-weight: 600; }
        .news-content a { color: #0d9488; text-decoration: underline; text-underline-offset: 2px; }
        .news-content a:hover { color: #0f766e; }
        .news-content ul, .news-content ol { margin-bottom: 20px; padding-left: 24px; }
        .news-content li { margin-bottom: 8px; font-size: 18px; line-height: 1.7; }
        .news-content blockquote { border-left: 4px solid #0d9488; padding-left: 20px; margin: 24px 0; font-style: italic; color: #4a4a4a; }
      `}</style>
    </div>
  );
}