"use client";
import Link from "next/link";

export default function Lapor() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="bg-blue-500 text-2xl text-white font-bold py-2 px-4 rounded mb-6 text-center">
          LAPORAN ORGANISASI
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <NavItem href="/keuangan/organisasi/lapor/target-realisasi">Target dan Realisasi</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/lapor-pengeluaran">Laporan Pengeluaran</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/lapor-pemasukan">Laporan Pemasukan</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/laporan-pengeluaran-tahunan">Laporan Pengeluaran Tahunan</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/laporan-pemasukan-tahunan">Laporan Pemasukan Tahunan</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/laporan-akhir">Laporan Akhir (Saldo)</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/kurang-setor-cabang">Kurang Setor Cabang</NavItem>
          <NavItem href="/keuangan/organisasi/lapor/rekap-peruntukan">Rekap Peruntukan</NavItem>
        </div>
      </div>
    </div>
  );
}

function NavItem({ children, href }) {
  return (
    <Link href={href} className="bg-teal-600 text-white font-bold py-4 rounded flex items-center justify-center px-4 transform transition-transform duration-300 hover:scale-105">
      {children}
    </Link>
  );
}
