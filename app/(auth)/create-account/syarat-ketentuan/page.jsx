"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { useState } from "react";

function App() {
  const [isAgreed, setIsAgreed] = useState(false);

  const handleCheckboxChange = () => {
    setIsAgreed(!isAgreed);
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-blue-500 to-green-500 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full relative">
     
          <div className=" top-0 bg-white pb-4 z-10">
            <div className="flex items-center justify-center ">
              <Image src="/sanduka.png" width={250} height={200} alt="logo" />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Syarat dan Ketentuan
            </h2>
          </div>

        
          <div className="overflow-y-auto max-h-96 text-justify text-gray-600">
            <p className="mb-6 text-gray-600 text-center">
              Syarat dan Ketentuan ini merupakan bagian dari Syarat dan
              Ketentuan Aplikasi Sanduka. Penggunaan layanan Sanduka tunduk pada
              Syarat dan Ketentuan yang tertulis di bawah ini. Pengguna
              disarankan membaca dengan seksama karena dapat berdampak pada hak
              dan kewajiban pengguna secara hukum. Dengan mendaftar dan/atau
              menggunakan aplikasi Sanduka, pengguna dianggap telah membaca,
              mengerti, memahami, dan menyetujui semua isi dalam Syarat dan
              Ketentuan ini. Jika pengguna tidak menyetujui salah satu,
              sebagian, atau seluruh isi Syarat dan Ketentuan, maka pengguna
              tidak diperkenankan menggunakan layanan Sanduka. Sanduka dapat
              mengubah Syarat dan Ketentuan ini sewaktu-waktu, dan perubahan
              akan berlaku saat diimplementasikan di Aplikasi. Pengguna setuju
              untuk mempelajari Syarat dan Ketentuan secara berkala. Penggunaan
              berkelanjutan atas layanan menunjukkan penerimaan terhadap
              perubahan tersebut.{" "}
            </p>
            <ol className="list-decimal list-inside mb-6 text-gray-600 ">
              <li className="mb-2">
                Perubahan Perjanjian Penggunaan Sanduka berhak mengganti,
                menambah, atau mengurangi Perjanjian Penggunaan ini
                sewaktu-waktu. Pengguna terikat oleh setiap perubahan dan
                disarankan untuk memeriksa Perjanjian Penggunaan secara berkala.
              </li>
              <li className="mb-2">
                Hak Kekayaan Intelektual Logo, merek, konten, produk, dan fitur
                dalam Aplikasi Sanduka dilindungi oleh hukum yang berlaku di
                Indonesia. Penggunaan tanpa izin tertulis dari Sanduka dilarang.
                Seluruh materi dalam Aplikasi ini adalah hak cipta Sanduka. Jika
                ada klaim kepemilikan atas materi, Sanduka akan menghapusnya
                dari aplikasi.
              </li>
              <li className="mb-2">
                Identitas dan Tanggung Jawab Pengguna Dengan mendaftar sebagai
                pengguna Aplikasi, Anda bertanggung jawab atas penggunaan
                Aplikasi dengan identitas yang didaftarkan. Anda bertanggung
                jawab atas pengalihan hak akses yang dilakukan melalui Aplikasi
                kepada pengguna lain.
              </li>
              <li className="mb-2">
                Kewajiban Pengguna Aplikasi Penggunaan Aplikasi harus sesuai
                dengan hukum dan peraturan perundangan Indonesia. Pengguna
                setuju untuk membebaskan Sanduka dari tuntutan pihak ketiga
                terkait penggunaan Aplikasi dan pelanggaran Syarat dan
                Ketentuan.
              </li>
              <li className="mb-2">
                Penggunaan Data Dengan menggunakan aplikasi Sanduka, Anda
                memberi wewenang kepada Sanduka untuk menyimpan informasi dan
                data terkait penggunaan aplikasi. Sanduka berhak menolak atau
                menghapus data yang melanggar ketentuan aplikasi dan hukum yang
                berlaku.
              </li>
              <li className="mb-2">
                Penyalahgunaan Aplikasi Anda bertanggung jawab atas kerugian
                atau biaya akibat penyalahgunaan Aplikasi, termasuk penipuan
                atau penggunaan yang tidak sah.
              </li>
              <li className="mb-2">
                Penangguhan dan Pemutusan Layanan Sanduka berhak menangguhkan
                atau menghentikan layanan tanpa pemberitahuan terlebih dahulu
                jika terjadi perbaikan, pelanggaran syarat, potensi kerugian,
                kebocoran data, atau penyalahgunaan layanan. Pengguna
                bertanggung jawab atas biaya yang timbul selama penangguhan atau
                penghentian layanan.
              </li>
              <li className="mb-2">
                Kebijakan Privasi Informasi pribadi yang diberikan oleh anggota
                akan dijaga kerahasiaannya dan digunakan untuk keperluan
                administrasi dan komunikasi internal organisasi. Data tidak akan
                dibagikan kepada pihak ketiga tanpa persetujuan kecuali
                diwajibkan oleh hukum.
              </li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
              Syarat dan Ketentuan Keanggotaan
            </h2>
            <ol className="list-decimal list-inside mb-6 text-gray-600">
              <li className="mb-2">
                Pendaftaran dan Keanggotaan
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Calon anggota harus mengisi formulir pendaftaran dengan
                    informasi yang benar dan lengkap.
                  </li>
                  <li>Dokumen pendukung diperlukan untuk verifikasi data.</li>
                  <li>
                    Keanggotaan bersifat pribadi dan tidak dapat dialihkan tanpa
                    persetujuan tertulis dari organisasi.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Persetujuan Keanggotaan
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Keanggotaan disetujui setelah verifikasi data oleh pihak
                    manajemen.
                  </li>
                  <li>
                    Manajemen berhak menolak pendaftaran tanpa alasan spesifik.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Iuran Keanggotaan
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Anggota wajib membayar iuran bulanan dan tahunan sesuai
                    ketentuan. Iuran yang sudah dibayarkan tidak dapat
                    dikembalikan.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Hak dan Kewajiban Anggota
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Anggota berhak atas manfaat, fasilitas, dan layanan sesuai
                    jenis keanggotaan.
                  </li>
                  <li>
                    Anggota wajib mematuhi aturan dan menjaga nama baik
                    organisasi.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Perubahan Data Anggota
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Anggota wajib memberitahukan perubahan data pribadi secara
                    tertulis atau melalui sistem online yang disediakan
                    organisasi.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Penghentian Keanggotaan
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Anggota dapat menghentikan keanggotaan dengan pemberitahuan
                    tertulis 30 hari sebelumnya.
                  </li>
                  <li>
                    Organisasi berhak menghentikan keanggotaan jika terjadi
                    pelanggaran.
                  </li>
                  <li>
                    Penghentian keanggotaan tidak menghapus kewajiban pembayaran
                    yang masih terhutang.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Kebijakan Privasi
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Informasi pribadi digunakan untuk administrasi dan
                    komunikasi internal dan dilindungi sesuai undang-undang.
                  </li>
                </ul>
              </li>
              <li className="mb-2">
                Pembaruan Syarat dan Ketentuan
                <ul className="list-disc list-inside mb-6 text-gray-600">
                  <li>
                    Organisasi berhak mengubah syarat dan ketentuan kapan saja.{" "}
                  </li>
                </ul>
              </li>
            </ol>

            <p className="mb-6 text-gray-600 text-justify">
              Perubahan akan diberitahukan melalui media komunikasi resmi.
              Anggota dianggap menyetujui perubahan jika tidak ada keberatan
              dalam waktu 30 hari.{" "}
            </p>
          </div>
          
            <div className="flex items-center mb-6 mt-4">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                id="agreement"
              />
              <Label className="ml-2 text-sm text-justify text-gray-600">
                Dengan mengisi formulir pendaftaran ini, Saya telah
                membaca, memahami, dan menyetujui syarat dan ketentuan ini.
              </Label>
            </div>

            <Link href={isAgreed ? "/create-account" : "#"}>
              <Button
                disabled={!isAgreed}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
              >
                Lanjutkan
              </Button>
            </Link>
          </div>
        </div>
      </div>
  );
}

export default App;
