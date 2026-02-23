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
    });
  };
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
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
        // fallback: copy link
        await navigator.clipboard.writeText(window.location.href);
        alert("Link berhasil disalin ke clipboard!");
      }
    } catch (error) {
      console.error("Gagal share:", error);
    }
  };
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareText = encodeURIComponent(news?.title || "");

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
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Kembali ke Berita
          </Link>

          <div className="flex gap-8">
            <div className="hidden lg:flex lg:w-20 flex-shrink-0"></div>

            <article className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 overflow-hidden">
                <img
                  src={
                    news.galeri?.length > 0
                      ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                      : "/placeholder.jpg"
                  }
                  alt={news.judul}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      {news.username}
                    </span>
                    <span>|</span>
                    <span className="font-medium">{news.editor}</span>
                  </div>
                  <span>•</span>
                  <div>{formatDate(news.updatedAt)}</div>

                  <span>•</span>
                  <div>👁️ {news.views} views</div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {news.title}
                </h1>

                <div className="prose prose-lg max-w-none mb-4">
                  {stripHtml(news.isiBerita)
                    .split("\n")
                    .map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-gray-700 text-base leading-relaxed mb-6"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-start items-center flex-wrap gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Bagikan Berita Ini:
                    </h3>

                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition duration-200 shadow-md"
                    >
                      <Facebook size={20} />
                    </a>

                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition duration-200 shadow-md"
                    >
                      𝕏
                    </a>

                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition duration-200 shadow-md"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                    </a>

                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      className="w-12 h-12 rounded-full bg-blue-400 text-white flex items-center justify-center hover:scale-110 transition duration-200 shadow-md"
                    >
                      <Send size={20} />
                    </a>

                    <button
                      onClick={handleShare}
                      className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 hover:scale-110 transition duration-200 shadow-md"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

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
                    news.galeri?.length > 0
                      ? `data:image/jpeg;base64,${news.galeri[0].gambar}`
                      : "/placeholder.jpg"
                  }
                  alt={news.judul}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition mb-3 line-clamp-2">
                      {item.judul}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.isiBerita?.slice(0, 100)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
