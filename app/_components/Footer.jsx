import Image from "next/image";
import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaApple,
  FaWhatsapp,
} from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-green-900 text-white py-10">
      <div className="container mx-auto px-4 lg:px-20">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
          {/* Sanduka Section */}
          <div className="w-full lg:w-1/3">
            <div className="flex mb-4">
              <Image
                src="/sanduka_bg_white.png"
                width={170}
                height={170}
                alt="logo"
                className="object-contain"
              />
            </div>
            <h2 className="text-lg font-bold text-yellow-400">SANDUKA</h2>
            <p className="mt-2">
              Persatuan Guru Republik Indonesia (PGRI) <br /> Kabupaten Jepara
            </p>
            <address className="not-italic mt-4 text-sm">
              Kantor Pusat PGRI Kabupaten Jepara
              <br />
              Jl. Bata Putih, Demaan VI, Demaan,
              <br />
              Kec. Jepara, Kabupaten Jepara, <br /> Jawa Tengah 59419 Gedung
              Lantai II
              <br />
              <br />
              Telp. 0291-592479
            </address>
            <div className="mt-4 text-sm">
              <p>Email: sanduka@gmail.com</p>
              <p>Email: pgrijepara@gmail.com</p>
            </div>
          </div>

          {/* Link Section */}
          <div className="w-full lg:w-1/3 mt-24">
            <h3 className="font-bold mb-4 text-yellow-400">LINK</h3>
            <div className="space-y-6">
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
            </div>

            {/* Media Section */}
            <div className="w-full lg:w-1/3 mt-10">
              <h3 className="font-bold mb-4 text-yellow-400">MEDIA</h3>
              <div className="flex gap-4">
                {[
                  { icon: FaFacebook, label: "Facebook" },
                  { icon: FaTwitter, label: "Twitter" },
                  { icon: FaYoutube, label: "Youtube" },
                  { icon: FaInstagram, label: "Instagram" },
                ].map((item) => (
                  <Link
                    href="#"
                    aria-label={item.label}
                    key={item.label}
                    legacyBehavior
                  >
                    <a className="p-3 border rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out bg-black flex items-center justify-center">
                      <item.icon size={18} className="text-white" />
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* App Links Section */}
          <div className="flex flex-col items-center gap-4 mt-20">
            <div className="bg-black p-2 rounded-full flex items-center">
              <Image
                src="/playstore.svg"
                alt="Logo Icon"
                width={20}
                height={20}
                className="mr-2"
              />
              <Link href="#" aria-label="Google Play" className="text-white">
                <span className="hidden md:inline">
                  Dapatkan di Google Play Store
                </span>
                <span className="md:hidden">Google Play Store</span>
              </Link>
            </div>

            <div className="bg-black p-2 rounded-full flex items-center">
              <FaWhatsapp size={20} className="text-white h-5 mr-2" />
              <Link href="https://wa.me/+6281325552982" legacyBehavior>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white"
                >
                  Konsultasi Melalui WhatsApp
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
