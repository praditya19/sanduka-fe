import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faYoutube,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-green-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full lg:w-1/3 mb-6">
            <Image
              src="/logo.png"
              width={64}
              height={64}
              alt="logo"
              className="mb-4"
            />
            <h2 className="text-lg font-bold text-yellow-400">SANDUKA</h2>
            <p>
              Persatuan Guru Repubik Indonesia ( PGRI ) <br /> Kabupaten Jepara
            </p>
            <address className="not-italic mt-4">
              Kantor Pusat PGRI Kabupaten Jepara
              <br />
              Jl. Bata Putih, Demaan VI, Demaan,
              <br />
              Kec. Jepara, Kabupaten Jepara, <br /> Jawa Tengah 59419 Gedung
              Lantai II
              <br />
              <br />
              Telp. 0291592479
            </address>
            <div className="mt-4">
              <p>Email: sanduka@gmail.com</p>
              <p>Email: pgrijepara@gmail.com</p>
            </div>
            <p className="mt-4">Kunjungi Media Sosial Kami:</p>
            <div className="flex space-x-2 mt-2">
              <Link href="#" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} className="h-6" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} className="h-6" />
              </Link>
              <Link href="#" aria-label="Youtube">
                <FontAwesomeIcon icon={faYoutube} className="h-6" />
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-2/3 flex flex-wrap justify-between md:mt-20">
            <div className="w-1/2 lg:w-1/4 mb-6">
              <h3 className="font-bold mb-2 text-yellow-400">
                Jaminan Kesehatan
              </h3>
              <ul>
                <li className="mb-1">Peserta</li>
                <li className="mb-1">Manfaat</li>
                <li className="mb-1">Iuran</li>
                <li className="mb-1">Prosedur Pendaftaran</li>
              </ul>
            </div>
            <div className="w-1/2 lg:w-1/4 mb-6">
              <h3 className="font-bold mb-2 text-yellow-400">Layanan</h3>
              <ul>
                <li className="mb-1">Alamat BPJS Kesehatan</li>
                <li className="mb-1">Autodebit</li>
                <li className="mb-1">Program Rehab</li>
                <li className="mb-1">Program Pesiar</li>
              </ul>
            </div>
            <div className="w-1/2 lg:w-1/4 mb-6">
              <h3 className="font-bold mb-2 text-yellow-400">Informasi</h3>
              <ul>
                <li className="mb-1">Kalender Kegiatan</li>
                <li className="mb-1">Laporan Keuangan</li>
                <li className="mb-1">Laporan PPID</li>
                <li className="mb-1">Rencana Kerja dan Anggaran Tahunan</li>
                <li className="mb-1">Good Governance</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <div className="bg-black p-2 rounded-full flex items-center">
            <FontAwesomeIcon icon={faApple} className="text-white h-8 mr-2" />
            <Link href="#" aria-label="App Store">
              <span className="text-white">Download di App Store</span>
            </Link>
          </div>
          <div className="bg-black p-2 rounded-full flex items-center">
            <Image
              src="/playstore.svg"
              alt="Logo Icon"
              width={30}
              height={30}
              className="mr-0"
            />
            <Link href="#" aria-label="Google Play" className="text-white">
              <span className="ml-2">Dapatkan di Google Play</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
