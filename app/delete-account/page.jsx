import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Permintaan Penghapusan Akun - MyPGRI",
  description: "Panduan dan Tata Cara Permohonan Penghapusan Akun & Data Pribadi Aplikasi MyPGRI",
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-[#001A72] text-white py-8 px-4 sm:px-8 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full p-1 flex items-center justify-center shadow">
              <span className="font-extrabold text-[#001A72] text-xl">PGRI</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">MyPGRI</h1>
              <p className="text-xs text-blue-200">PGRI KABUPATEN JEPARA</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Permohonan Penghapusan Akun & Data Pengguna
          </h2>
          <p className="text-xs text-slate-500 mb-8 pb-4 border-b border-slate-200">
            Aplikasi Resmi MyPGRI - Pengurus PGRI Kabupaten Jepara
          </p>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
            <section>
              <h3 className="text-lg font-bold text-[#001A72] mb-2">
                1. Hak Penghapusan Akun
              </h3>
              <p>
                Sesuai dengan kebijakan privasi dan perlindungan data anggota, setiap pengguna aplikasi <strong>MyPGRI</strong> memiliki hak untuk mengajukan penghapusan akun serta data pribadi yang tersimpan dalam sistem kami.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#001A72] mb-2">
                2. Langkah-Langkah Mengajukan Penghapusan Akun
              </h3>
              <p className="mb-3">
                Untuk mengajukan permohonan penghapusan akun dan data pribadi, silakan ikuti langkah-langkah berikut:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>
                  Kirimkan email permohonan ke alamat resmi kami:{" "}
                  <a
                    href="mailto:pgrijepara@gmail.com?subject=Permohonan%20Penghapusan%20Akun%20MyPGRI"
                    className="text-blue-600 underline font-semibold"
                  >
                    pgrijepara@gmail.com
                  </a>
                </li>
                <li>
                  Gunakan subjek email: <strong>"Permohonan Penghapusan Akun MyPGRI"</strong>.
                </li>
                <li>
                  Sertakan informasi identitas anggota:
                  <ul className="list-disc list-inside pl-6 pt-1 space-y-1 text-slate-600 text-sm">
                    <li>Nomor Pokok Anggota (NPA) PGRI</li>
                    <li>Nama Lengkap</li>
                    <li>Unit Kerja / Cabang PGRI</li>
                    <li>Alasan singkat permohonan penghapusan</li>
                  </ul>
                </li>
                <li>
                  Tim Administrator PGRI Kabupaten Jepara akan memverifikasi identitas Anda dan memproses penghapusan akun dalam waktu maksimal <strong>3 (tiga) hari kerja</strong>.
                </li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#001A72] mb-2">
                3. Data yang Akan Dihapus
              </h3>
              <p className="mb-2">Setelah permohonan penghapusan disetujui dan diproses:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                <li>Akses login akun aplikasi MyPGRI akan dinonaktifkan secara permanen.</li>
                <li>Data profil digital, foto profil, dan dokumen KTA digital akan dihapus dari server aplikasi.</li>
                <li>Sesi login aktif pada perangkat seluler akan dihentikan secara otomatis.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#001A72] mb-2">
                4. Data yang Mungkin Disimpan Sementara
              </h3>
              <p className="text-slate-600">
                Catatan riwayat transaksi iuran resmi, santunan duka (Sanduka), atau pembukuan keuangan organisasi yang telah terjadi sebelum penghapusan akun dapat tetap diarsipkan secara terenkripsi untuk keperluan audit hukum, laporan pertanggungjawaban organisasi, dan kepatuhan perpajakan/keuangan sesuai peraturan yang berlaku selama periode retensi yang diwajibkan oleh hukum.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-[#001A72] mb-2">
                5. Bantuan & Layanan Pengaduan
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <p className="font-semibold text-slate-900">PENGURUS KABUPATEN PGRI JEPARA</p>
                <p>Gedung Guru PGRI Kabupaten Jepara, Jawa Tengah</p>
                <p>Telepon: (0291) 592479</p>
                <p>Email: <a href="mailto:pgrijepara@gmail.com" className="text-blue-600 underline">pgrijepara@gmail.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Pengurus Kabupaten PGRI Jepara. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
