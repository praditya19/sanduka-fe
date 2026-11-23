"use client";
import React, { useEffect, useState } from "react";
import { Eye, Users, TrendingUp } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";

const VisitorCounter = () => {
    const [stats, setStats] = useState({
        uniqueVisitors: 0,
        totalPageViews: 0,
        date: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Record kunjungan saat komponen dimount
        GlobalApi.recordSiteVisit(window.location.pathname);

        // Ambil statistik kunjungan hari ini
        const fetchStats = async () => {
            try {
                const data = await GlobalApi.getSiteVisitStats();
                setStats(data);
            } catch (error) {
                console.error("Gagal mengambil statistik pengunjung:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Refresh statistik setiap 60 detik
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 animate-pulse flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div className="space-y-2 w-1/2">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-7 bg-slate-200 rounded w-3/4"></div>
                    </div>
                    <div className="w-11 h-11 bg-slate-100 rounded-xl"></div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 h-3 bg-slate-100 rounded w-1/3"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 group flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Pengunjung Hari Ini
                    </p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-teal-700 tracking-tight">
                            {stats.uniqueVisitors?.toLocaleString("id-ID") || 0}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Unik</span>
                    </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Users size={20} />
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-500">
                    <Eye size={13} className="text-slate-400" />
                    <span>{stats.totalPageViews?.toLocaleString("id-ID") || 0} tayangan</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                </span>
            </div>
        </div>
    );
};

export default VisitorCounter;