"use client";
import React, { useState } from "react";
import Image from "next/image";

const HelpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const contacts = [
    {
      name: "Hartono, M.Pd.",
      phone: "+621325754589",
      image: "/profile.png",
    },
    {
      name: "Habib Nor Haqiqi, S.I.Pust.",
      phone: "+621325552982",
      image: "/profile.png",
    },
    {
      name: "Sudiharto, S.Pd.",
      phone: "+621325386311",
      image: "/profile.png",
    },
    {
      name: "Harmanto, M.Pd.",
      phone: "+625227227011",
      image: "/profile.png",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-6xl p-8 bg-white rounded-lg shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Kontak Bantuan</h1>
          <p className="mt-4 text-gray-600">
            Jika Anda memiliki pertanyaan atau butuh bantuan, silakan hubungi
            kami melalui informasi di bawah ini.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Informasi Kontak
            </h2>
            <ul className="mt-4 space-y-4">
              {contacts.map((contact, index) => (
                <li key={index} className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={contact.image}
                      alt={contact.name}
                      layout="fill"
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {contact.name}
                    </h3>
                    <a
                      href={`https://wa.me/${contact.phone}`}
                      className="block text-blue-500 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Formulir Kontak
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-800">
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-800">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-800">
                  Subjek
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-800">
                  Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800">Lokasi Kami</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.8447546193194!2d110.66220847221372!3d-6.5997301999999936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e711effed10630d%3A0x33031084684218b0!2sGedung%20PGRI%20Kabupaten%20Jepara!5e0!3m2!1sen!2sid!4v1721217712802!5m2!1sen!2sid"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-md shadow-md mt-4"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
