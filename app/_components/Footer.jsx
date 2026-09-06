import Image from "next/image";
import React from "react";
import {
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaApple,
  FaWhatsapp,
} from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-green-900 text-white">
      <div className="container mx-auto px-4 lg:px-20 pb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
          
          <div className="w-full lg:w-1/3">
            <div className="flex ">
              <Image
                src="/sanduka_bg_white.png"
                width={170}
                height={170}
                alt="logo"
                className="object-contain"
              />
            </div>
            <h2 className="text-lg font-bold text-yellow-400">SANDUKA</h2>
            <p className="">
              Persatuan Guru Republik Indonesia (PGRI) <br /> Kabupaten Jepara
            </p>
            <address className="not-italic mt-4 text-sm">
              Kantor Pusat PGRI Kabupaten Jepara
              <br />
              Jl. Bata Putih, Demaan VI, Demaan,
              <br />
              Kec. Jepara, Kabupaten Jepara, <br /> Jawa Tengah 59419 Gedung Lantai II
              <br />
              <br />
              Telp. 0291 592479
            </address>
            <div className="mt-4 text-sm">
              <p>Email: pgrijepara@gmail.com</p>
              <p>kab_jepara@pgri.or.od</p>
              <p>official web PGRI Kabupaten Jepara</p>
            </div>
          </div>

          {/* Link Section */}
          <div className="w-full lg:w-1/3 mt-24">
            <h3 className="font-bold mb-2 text-yellow-400">LINK</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <Image
                  src="/kta_digital.png"
                  width={40}
                  height={40}
                  alt="kta_digital"
                  className="object-contain"
                />
                <Link href="https://www.ktadigitalpgri.org/" legacyBehavior>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white"
                  >
                    <h4 className="text-lg">Kta Digital PGRI</h4>
                  </a>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Image
                  src="/daspen.png"
                  width={40}
                  height={40}
                  alt="daspen"
                  className="object-contain"
                />
                <Link href="https://www.dansetjateng.org/" legacyBehavior>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white"
                  >
                    <h4 className="text-lg">Dana Pensiun PGRI Jawa Tengah</h4>
                  </a>
                </Link>
              </div>

              {/* Google Play Store Link */}
              <div className="pt-2">
                <a
                  href="https://play.google.com/store/apps/details?id=com.pgrijepara.mypgri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/50 hover:bg-black/70 px-3.5 py-1.5 rounded-full inline-flex items-center border border-white/15 transition-colors"
                  aria-label="Google Play Store"
                >
                  <Image
                    src="/playstore.svg"
                    alt="Logo Icon"
                    width={18}
                    height={18}
                    className="mr-2"
                  />
                  <span className="text-sm text-white hover:text-yellow-400 transition-colors font-medium">
                    Google Play Store
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* App & Tim Pengembang Section */}
          <div className="w-full lg:w-1/3 mt-12 lg:mt-24">
            <h3 className="font-bold mb-3 text-yellow-400">TIM PENGEMBANG</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Image
                  src="/logo-bts.png"
                  width={38}
                  height={38}
                  alt="BTS Logo"
                  className="object-contain rounded-lg bg-white/10 p-1"
                />
                <div>
                  <a
                    href="https://bts-app-xi.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 font-medium text-base block transition-colors"
                  >
                    Brilliant Techology Solutions (BTS)
                  </a>
                  <p className="text-xs text-gray-300">Pengembang Sistem Sanduka</p>
                </div>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed">
                Ingin membuat website atau sistem sejenis? Hubungi tim pengembang kami untuk konsultasi.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://wa.me/628999937400?text=Halo%20tim%20Brilliant%20Techology%20Solutions%20(BTS)%2C%20saya%20tertarik%20untuk%20buat%20aplikasi%2Fsistem%20seperti%20Sanduka."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-md border border-white/20 transition-colors"
                >
                  <FaWhatsapp className="text-green-400" />
                  <span>WhatsApp: +62 899-9937-400</span>
                </a>

                <a
                  href="https://bts-app-xi.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-400 hover:underline"
                >
                  Kunjungi Website ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-4 border-t border-green-800 text-center text-xs text-gray-300">
          <p>
            © {new Date().getFullYear()} SANDUKA PGRI Kabupaten Jepara. Dikembangkan oleh{" "}
            <a
              href="https://bts-app-xi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 font-medium underline"
            >
              Brilliant Techology Solutions (BTS)
            </a>
            . Ingin buat sistem sejenis?{" "}
            <a
              href="https://wa.me/628999937400?text=Halo%20tim%20Brilliant%20Techology%20Solutions%20(BTS)%2C%20saya%20tertarik%20untuk%20buat%20aplikasi%2Fsistem%20seperti%20Sanduka."
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline font-medium"
            >
              Hubungi kami di sini
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
