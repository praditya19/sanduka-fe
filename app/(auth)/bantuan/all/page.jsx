"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import GlobalApi from "@/app/_utils/GlobalApi";

const HelpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [adminCabang, setAdminCabang] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const contacts = [
    {
      name: "Praditya Rendi Ferdian",
      phone: "+628999937400",
      image: "/profile.png",
    },
    {
      name: "Nanda Dwi Kurniawan",
      phone: "+62895704340678",
      image: "/profile.png",
    },
    {
      name: "Fausta Rizky Abriansah",
      phone: "+6287839465101",
      image: "/profile.png",
    },
  ];

  const fetchData = async () => {
    try {
      const response = await GlobalApi.getAdminBantuan();

      setAdminCabang(response.data);
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };

  useEffect(() => {
    setLoading(false);
    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-gray-100">
      <nav className="bg-teal-500 shadow-md fixed top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer"
              />
              <Link href="/">
                <Image src="/sanduka.png" width={70} height={70} alt="logo" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 transition-all duration-300 ease-in-out">
        {/* Sidebar wrapper */}
        <div className="flex">
          {/* Main content area with conditional margin */}
          <div className="w-full min-h-screen py-8 px-4 md:px-8">
            {/* Hero Section */}
            <div className="w-full max-w-6xl mx-auto mb-8 bg-white rounded-xl shadow-lg overflow-hidden mt-5">
              <div className="md:flex">
                <div className="md:w-2/3 p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Kontak Bantuan
                  </h1>
                  <div className="w-24 h-1 bg-blue-500 mb-4 rounded-full"></div>
                  <p className="text-gray-600 leading-relaxed">
                    Jika Anda memiliki pertanyaan atau butuh bantuan, silakan
                    hubungi kami melalui informasi di bawah ini.
                  </p>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto mb-4 drop-shadow-lg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-white drop-shadow">
                      Hubungi Kami
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center border-b pb-3 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Informasi Kontak
                  </h2>
                  <div className="mt-6">
                    <ul className="space-y-6">
                      {adminCabang.map((admin, index) => (
                        <li
                          key={index}
                          className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-blue-50 transition-all group"
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden">
                            <Image
                              src="/profile.png"
                              layout="fill"
                              className="rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-300 transition-colors"
                              alt={`Admin ${admin.cabang}`}
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mb-1 group-hover:bg-blue-200 transition-colors">
                                {admin.cabang}
                              </span>
                            </h3>
                            <a
                              href={`https://wa.me/${admin.nohp.replace(
                                /^0/,
                                "+62"
                              )}`}
                              className="flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {admin.nohp}
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center border-b pb-3 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Formulir Kontak
                  </h2>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Nama
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan nama Anda"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Email
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh@email.com"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="subject"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Subjek
                      </Label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Topik pesan Anda"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="message"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Pesan
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tulis pesan Anda di sini..."
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-md hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 inline mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Kirim Pesan
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Location Section */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center border-b pb-3 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Lokasi Kami
                </h2>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.8447546193194!2d110.66220847221372!3d-6.5997301999999936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e711effed10630d%3A0x33031084684218b0!2sGedung%20PGRI%20Kabupaten%20Jepara!5e0!3m2!1sen!2sid!4v1721217712802!5m2!1sen!2sid"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Gedung PGRI Kabupaten Jepara
                  </p>
                </div>
              </div>

              {/* Development Team Section */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center border-b pb-3 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Tim Pengembang / IT
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-6 border border-gray-100 rounded-xl hover:shadow-md transition-all text-center bg-white hover:bg-blue-50 group"
                    >
                      <div className="relative w-20 h-20 mb-3 transform transition-transform group-hover:scale-105">
                        <Image
                          src={contact.image}
                          alt={contact.name}
                          layout="fill"
                          className="rounded-full object-cover border-4 border-blue-100 group-hover:border-blue-300 transition-colors"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {contact.name}
                      </h3>
                      <a
                        href={`https://wa.me/${contact.phone}`}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 font-medium transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-8 text-center text-gray-600 py-4">
                <p>
                  © {new Date().getFullYear()} Kontak Bantuan. Hak Cipta
                  Dilindungi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
