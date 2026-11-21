"use client";
import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  Maximize2,
} from "lucide-react";

/**
 * Helper untuk cek apakah peserta berstatus Hadir
 */
export const checkIsHadir = (p) => {
  if (!p) return false;
  return (
    p.kehadiran === true ||
    p.isHadir === true ||
    String(p.kehadiran || "").toUpperCase() === "HADIR" ||
    String(p.kehadiran || "").toLowerCase() === "true" ||
    Boolean(p.fotoKehadiran || p.foto_kehadiran || p.fotoPresensi || p.tagLocation || p.tag_location)
  );
};

export default function EventStatistikBatang({
  participants = [],
  cabangList = [],
  selectedEventName = "",
  title = "Statistik Kehadiran Peserta Per Cabang",
}) {
  const [viewMode, setViewMode] = useState("vertical"); // "vertical" | "horizontal"
  const [filterMode, setFilterMode] = useState("all"); // "all" | "onlyHadir"
  const [selectedEventFilter, setSelectedEventFilter] = useState("all");

  const eventOptions = useMemo(() => {
    const names = participants
      .map((p) => String(p?.namaEvent || p?.event || "").trim())
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "id"));
  }, [participants]);

  // Filter peserta sesuai event jika ada selectedEventName
  const eventParticipants = useMemo(() => {
    const targetEvent = selectedEventFilter === "all" ? selectedEventName : selectedEventFilter;
    if (!targetEvent || targetEvent === "all" || targetEvent === "Semua Event") return participants;
    const target = targetEvent.trim().toLowerCase();
    return participants.filter((p) => (p.namaEvent || p.event || "").trim().toLowerCase() === target);
  }, [participants, selectedEventName, selectedEventFilter]);

  const activeEventName = selectedEventFilter === "all" ? selectedEventName : selectedEventFilter;

  // Agregasi data statistik per cabang
  const { stats, totalTerdaftar, totalHadir, topCabang, maxHadir } = useMemo(() => {
    const map = {};

    // Daftarkan semua cabang dari cabangList agar cabang yang belum ada peserta tetap terdata
    cabangList.forEach((c) => {
      const name = (c.kecamatan || c.cabang || c.namaCabang || String(c)).trim().toUpperCase();
      if (name) {
        map[name] = { cabang: name, terdaftar: 0, hadir: 0 };
      }
    });

    eventParticipants.forEach((p) => {
      const c = (p.cabang || "Lainnya").trim().toUpperCase();
      if (!map[c]) {
        map[c] = { cabang: c, terdaftar: 0, hadir: 0 };
      }
      map[c].terdaftar += 1;
      if (checkIsHadir(p)) {
        map[c].hadir += 1;
      }
    });

    let list = Object.values(map);

    if (filterMode === "onlyHadir") {
      list = list.filter((item) => item.hadir > 0);
    } else {
      list = list.filter((item) => item.terdaftar > 0 || item.hadir > 0);
    }

    // Urutkan berdasarkan jumlah Hadir terbanyak
    list.sort((a, b) => b.hadir - a.hadir || b.terdaftar - a.terdaftar || a.cabang.localeCompare(b.cabang));

    const totalT = eventParticipants.length;
    const totalH = eventParticipants.filter(checkIsHadir).length;
    const top = list.length > 0 && list[0].hadir > 0 ? list[0] : null;
    const maxH = Math.max(...list.map((i) => i.hadir), 1);

    return {
      stats: list,
      totalTerdaftar: totalT,
      totalHadir: totalH,
      topCabang: top,
      maxHadir: maxH,
    };
  }, [eventParticipants, cabangList, filterMode]);

  const persentaseHadir = totalTerdaftar > 0 ? Math.round((totalHadir / totalTerdaftar) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-md">
      {/* Header Statistik */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                {activeEventName && activeEventName !== "all"
                  ? `Event: ${activeEventName}`
                  : "Akumulasi seluruh kegiatan event"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Mode Batang Vertikal / Horizontal */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("vertical")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "vertical"
                  ? "bg-white text-teal-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Batang Vertikal
            </button>
            <button
              type="button"
              onClick={() => setViewMode("horizontal")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "horizontal"
                  ? "bg-white text-teal-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Batang Horizontal
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode((prev) => (prev === "all" ? "onlyHadir" : "all"))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterMode === "onlyHadir"
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filterMode === "onlyHadir" ? "✓ Hanya Cabang Hadir" : "Semua Cabang"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
        <label htmlFor="statistik-event-filter" className="text-xs font-semibold text-slate-600">Filter statistik per event</label>
        <select
          id="statistik-event-filter"
          value={selectedEventFilter}
          onChange={(event) => setSelectedEventFilter(event.target.value)}
          className="w-full sm:w-auto min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        >
          <option value="all">Semua Event</option>
          {eventOptions.map((eventName) => <option key={eventName} value={eventName}>{eventName}</option>)}
        </select>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-100 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
            Peserta Hadir
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-teal-700 tabular-nums">{totalHadir}</span>
            <span className="text-xs text-teal-600 font-semibold">Orang</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Terdaftar
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 tabular-nums">{totalTerdaftar}</span>
            <span className="text-xs text-slate-500 font-semibold">Orang</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Tingkat Kehadiran
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 tabular-nums">{persentaseHadir}%</span>
            <span className="text-xs text-blue-600 font-semibold">Presensi</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Hadir Terbanyak
          </span>
          <div className="mt-1">
            <span className="text-sm font-black text-amber-900 block truncate">
              {topCabang ? topCabang.cabang : "-"}
            </span>
            <span className="text-xs text-amber-700 font-semibold">
              {topCabang ? `${topCabang.hadir} Hadir` : "Belum ada presensi"}
            </span>
          </div>
        </div>
      </div>

      {/* Model Batang Chart */}
      {stats.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">Belum ada data peserta untuk event ini</p>
        </div>
      ) : viewMode === "vertical" ? (
        /* ================= MODEL BATANG VERTIKAL (COLUMN CHART) ================= */
        <div className="mt-6 pt-4 overflow-x-auto">
          <div className="min-w-[650px] pb-4">
            <div className="h-56 flex items-end gap-3 sm:gap-4 px-2 border-b border-slate-200">
              {stats.map((item, idx) => {
                const heightPercent = Math.max(Math.round((item.hadir / maxHadir) * 100), 6);
                const isTop = topCabang && topCabang.cabang === item.cabang;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip Hover */}
                    <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                      <span>{item.cabang}</span>
                      <span className="text-teal-300">
                        {item.hadir} Hadir / {item.terdaftar} Terdaftar (
                        {item.terdaftar > 0 ? Math.round((item.hadir / item.terdaftar) * 100) : 0}%)
                      </span>
                    </div>

                    {/* Angka di atas batang */}
                    <span
                      className={`text-xs font-bold mb-1.5 tabular-nums transition-transform group-hover:scale-110 ${
                        item.hadir > 0 ? "text-teal-700 font-black" : "text-slate-400"
                      }`}
                    >
                      {item.hadir}
                    </span>

                    {/* Batang / Bar */}
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex flex-col justify-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-700 ease-out shadow-sm ${
                          isTop
                            ? "bg-gradient-to-t from-emerald-600 via-teal-500 to-amber-400 ring-2 ring-amber-300"
                            : item.hadir > 0
                            ? "bg-gradient-to-t from-teal-600 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-300"
                            : "bg-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Label Cabang di bawah batang */}
            <div className="flex gap-3 sm:gap-4 px-2 mt-3">
              {stats.map((item, idx) => (
                <div key={idx} className="flex-1 text-center min-w-0">
                  <span
                    className="block text-[11px] font-bold text-slate-700 truncate uppercase hover:text-teal-600 transition-colors"
                    title={item.cabang}
                  >
                    {item.cabang}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                    {item.terdaftar} dftr
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= MODEL BATANG HORIZONTAL (LIST BAR CHART) ================= */
        <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-2">
          {stats.map((item, idx) => {
            const widthPercent = Math.max(Math.round((item.hadir / maxHadir) * 100), 2);
            const persen = item.terdaftar > 0 ? Math.round((item.hadir / item.terdaftar) * 100) : 0;
            const isTop = topCabang && topCabang.cabang === item.cabang;

            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 transition-colors border border-slate-100 group"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <span className="font-bold text-slate-800 uppercase truncate">{item.cabang}</span>
                    {isTop && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full border border-amber-200">
                        Top 1
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-teal-700 text-sm tabular-nums">
                      {item.hadir} Hadir
                    </span>
                    <span className="text-[11px] text-slate-400">/ {item.terdaftar} Terdaftar</span>
                    <span className="font-bold text-slate-600 text-xs bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {persen}%
                    </span>
                  </div>
                </div>

                {/* Bar Horizontal */}
                <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isTop
                        ? "bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400"
                        : item.hadir > 0
                        ? "bg-gradient-to-r from-teal-500 to-emerald-400"
                        : "bg-slate-300"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
