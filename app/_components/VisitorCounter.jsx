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
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
                <Users size={20} />
                <h3 className="text-sm font-semibold opacity-90">
                    Pengunjung Hari Ini
                </h3>
            </div>
            <div className="text-4xl font-bold mb-2">
                {stats.uniqueVisitors?.toLocaleString("id-ID") || 0}
            </div>
            <div className="flex items-center gap-4 text-sm opacity-80">
                <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{stats.totalPageViews || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>orang unik</span>
                </div>
            </div>
            <div className="mt-3 text-xs opacity-60">
                {stats.date
                    ? new Date(stats.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })
                    : ""}
            </div>
        </div>
    );
};

export default VisitorCounter;