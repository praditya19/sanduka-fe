"use client";
import React from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { ExternalLink } from "lucide-react";

export default function DevTeamCard() {
  const waUrl =
    "https://wa.me/628999937400?text=Halo%20tim%20Brilliant%20Techology%20Solutions%2C%20saya%20melihat%20sistem%20Sanduka%20dan%20tertarik%20konsultasi%20pembuatan%20website%2Fsistem%20sejenis.";
  const webUrl = "https://bts-app-xi.vercel.app/";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-gray-200 p-2 flex-shrink-0 shadow-sm">
          <Image
            src="/logo-bts.png"
            alt="Brilliant Techology Solutions Logo"
            width={64}
            height={64}
            className="object-contain w-full h-full"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Tim Pengembang
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Brilliant Techology Solutions (BTS)
          </h3>

          <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
            Sistem Sanduka dikembangkan oleh tim <strong>Brilliant Techology Solutions</strong>.
            Tertarik membuat website profil, sistem informasi organisasi, aplikasi kasir (POS), atau aplikasi mobile sejenis?
            Silakan langsung berkonsultasi bersama tim kami.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <FaWhatsapp className="text-base" />
          <span>Hubungi via WhatsApp</span>
        </a>

        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
        >
          <span>Kunjungi Website BTS</span>
          <ExternalLink className="w-4 h-4 text-gray-500" />
        </a>
      </div>
    </div>
  );
}
