"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Send, X, MessageSquare, Sparkles, User, RefreshCw, ChevronDown } from "lucide-react";
import { BASE_URL } from "../_utils/GlobalApi";
import { useAuth } from "../AuthContext";
import { usePathname } from "next/navigation";

export default function AiChatWidget() {
  const auth = useAuth();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Halo! Saya **Sanduka AI Assistant**. Ada yang bisa saya bantu?",
      toolsExecuted: [],
    },
  ]);

  const [quickTopics, setQuickTopics] = useState([
    { label: "💡 Rekap Iuran", query: "Berapa rekap iuran saya?" },
    { label: "👤 Data Profil", query: "Tampilkan profil data diri saya" },
    { label: "📄 SOP Klaim Duka", query: "Syarat dan prosedur klaim santunan duka" },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchLatestKnowledge = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? "http://localhost:8080"
            : BASE_URL);

        const res = await axios.get(`${apiBaseUrl}/api/v1/ai/knowledge`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeList = res.data.filter((k) => k.isActive);
          if (activeList.length > 0) {
            const top3 = activeList.slice(0, 3);
            const chipIcons = ["💡", "📌", "📄"];
            const newChips = top3.map((k, idx) => ({
              label: `${chipIcons[idx % chipIcons.length]} ${k.topik}`,
              query: `Bagaimana informasi mengenai ${k.topik}?`,
            }));
            setQuickTopics(newChips);
          }
        }
      } catch (err) {
        console.error("Gagal memuat quick topics dari AI Knowledge:", err);
      }
    };

    fetchLatestKnowledge();
  }, []);

  useEffect(() => {
    const token = auth?.token || (typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null);
    setIsAuthenticated(!!token);
  }, [auth?.token, pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const publicRoutes = ["/sign-in", "/login", "/register", "/create-account"];
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route));

  if (!isAuthenticated || isPublicRoute) {
    return null;
  }

  const handleSendMessage = async (customMessage = null) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    if (!customMessage) setInputMessage("");
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Convert history for API request (excluding error messages)
      const historyPayload = messages
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            !m.text.includes("Terjadi kesalahan teknis") &&
            !m.text.includes("Gagal terhubung") &&
            !m.text.includes("Maaf, terjadi masalah")
        )
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        }));

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? "http://localhost:8080"
          : BASE_URL);

      const targetUrl = `${apiBaseUrl}/api/v1/ai/chat`;

      const response = await axios.post(
        targetUrl,
        {
          message: textToSend,
          history: historyPayload,
        },
        { headers }
      );

      if (response.data && response.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: response.data.reply,
            toolsExecuted: response.data.toolsExecuted || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Maaf, terjadi masalah dalam mendapatkan respons dari server.",
          },
        ]);
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Gagal terhubung ke layanan AI Sanduka. Pastikan backend Spring Boot telah aktif.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Halo! Saya **Sanduka AI Assistant**. Percakapan telah dibersihkan. Ada yang bisa saya bantu lagi?",
        toolsExecuted: [],
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-emerald-400/30"
          title="Tanya AI Sanduka"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-emerald-600"></span>
          </div>
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">Tanya AI Sanduka</span>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[560px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm leading-none">AI Sanduka Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                </div>
                <p className="text-[11px] text-emerald-100 mt-1">PGRI Kabupaten Jepara</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 transition-colors"
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-bl-none"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Executed Tools Badge */}
                  {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1">
                      {msg.toolsExecuted.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading typing indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips (Dinamis 3 Topik Terbaru AI Knowledge) */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickTopics.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(chip.query)}
                className="text-[11px] bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 px-2.5 py-1.5 rounded-full whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 font-medium"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaan tentang Sanduka..."
              disabled={loading}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
