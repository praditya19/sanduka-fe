import Image from "next/image";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faYoutube,
  faInstagram,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-green-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full lg:w-1/3 mb-6">
            <div className="flex">
              <Image
                src="/sanduka.png"
                width={170}
                height={170}
                alt="logo"
                className="mb-4"
              />
              <Image
                src="/logo.png"
                width={64}
                height={64}
                alt="logo"
                className="mb-4 ml-3"
              />
            </div>
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
          </div>
          <div className="w-full lg:w-2/3 flex flex-wrap justify-between md:mt-20">
            <div className="w-1/2 lg:w-1/4 mb-6">
              <h3 className="font-bold mb-2 text-yellow-400">
                KTADIGITAL PGRI
              </h3>
              <Link href="https://www.ktadigitalpgri.org/" legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <h4>www.ktadigitalpgri.org</h4>
                </a>
              </Link>
            </div>
            <div className="w-1/2 lg:w-1/4 mb-6">
              <h3 className="font-bold mb-2 text-yellow-400">
                Dana Pensiun PGRI Jawa Tengah
              </h3>
              <Link href="https://www.dansetjateng.org/" legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <h4>www.dansetjateng.org</h4>
                </a>
              </Link>
            </div>
            <div className="w-1/2 lg:w-1/4 mb-6">
              <h3 className="font-bold mb-2 text-yellow-400">Media</h3>
              <div className="flex space-x-2 mt-2">
                <Link href="#" aria-label="Facebook" legacyBehavior>
                  <a className="p-2 border rounded-full shadow hover:shadow-lg transition duration-300 ease-in-out bg-black">
                    <FontAwesomeIcon icon={faFacebook} className="h-6" />
                  </a>
                </Link>
                <Link href="#" aria-label="Twitter" legacyBehavior>
                  <a className="p-2 border rounded-full shadow hover:shadow-lg transition duration-300 ease-in-out bg-black">
                    <FontAwesomeIcon icon={faTwitter} className="h-6" />
                  </a>
                </Link>
                <Link href="#" aria-label="Youtube" legacyBehavior>
                  <a className="p-2 border rounded-full shadow hover:shadow-lg transition duration-300 ease-in-out bg-black">
                    <FontAwesomeIcon icon={faYoutube} className="h-6" />
                  </a>
                </Link>
                <Link href="#" aria-label="Instagram" legacyBehavior>
                  <a className="p-2 border rounded-full shadow hover:shadow-lg transition duration-300 ease-in-out bg-black">
                    <FontAwesomeIcon icon={faInstagram} className="h-6" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 justify-center">
          <div className="bg-black p-2 rounded-full flex items-center">
            <FontAwesomeIcon
              icon={faWhatsapp}
              className="text-white h-8 mr-2"
            />
            <Link href="https://wa.me/+6281325552982" legacyBehavior>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                Konsultasi via WhatsApp
              </a>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-3">
            <div className="bg-black p-2 rounded-full flex items-center">
              <FontAwesomeIcon icon={faApple} className="text-white h-8 mr-2" />
              <Link href="#" aria-label="App Store" className="text-white">
                <span className="hidden md:inline">Download di App Store</span>
                <span className="md:hidden">App Store</span>
              </Link>
            </div>
            <div className="bg-black p-2 rounded-full flex items-center">
              <Image
                src="/playstore.svg"
                alt="Logo Icon"
                width={30}
                height={30}
                className="mr-2"
              />
              <Link href="#" aria-label="Google Play" className="text-white">
                <span className="hidden md:inline">
                  Dapatkan di Google Play
                </span>
                <span className="md:hidden">Google Play</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
