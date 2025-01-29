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
    },);

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
        <div className="min-h-screen flex flex-col bg-gray-100">
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
                                <Image
                                    src="/sanduka.png"
                                    width={70}
                                    height={70}
                                    alt="logo"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <div>
                <div>
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 mt-5">
                        <div className="w-full max-w-6xl p-8 bg-white rounded-lg shadow-md">
                            <div className="mb-8 text-center">
                                <h1 className="text-xl font-bold text-gray-800">
                                    Kontak Bantuan
                                </h1>
                                <p className="mt-4 text-gray-600 text-base">
                                    Jika Anda memiliki pertanyaan atau butuh bantuan, silakan
                                    hubungi kami melalui informasi di bawah ini.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Informasi Kontak
                                    </h2>
                                    <ul className="mt-4 space-y-4">
                                        {adminCabang.map((admin, index) => (
                                            <li key={index} className="flex items-center space-x-4">
                                                <div className="relative w-12 h-12">
                                                    <Image
                                                        src="/profile.png"

                                                        layout="fill"
                                                        className="rounded-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        ({admin.cabang})
                                                    </h3>
                                                    <a
                                                        href={`https://wa.me/${admin.nohp.replace(
                                                            /^0/,
                                                            "+62"
                                                        )}`}
                                                        className="block text-blue-500 hover:underline text-sm"
                                                    >
                                                        {admin.nohp}
                                                    </a>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Formulir Kontak
                                    </h2>
                                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                        <div>
                                            <Label htmlFor="name" className="block text-gray-800">
                                                Nama
                                            </Label>
                                            <Input
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
                                            <Label htmlFor="email" className="block text-gray-800">
                                                Email
                                            </Label>
                                            <Input
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
                                            <Label htmlFor="subject" className="block text-gray-800">
                                                Subjek
                                            </Label>
                                            <Input
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
                                            <Label htmlFor="message" className="block text-gray-800">
                                                Pesan
                                            </Label>
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
                                            <Button
                                                type="submit"
                                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                Kirim Pesan
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Lokasi Kami
                                </h2>
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

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Tim Pengembang / IT
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
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {contact.name}
                                                </h3>
                                                <a
                                                    href={`https://wa.me/${contact.phone}`}
                                                    className="block text-blue-500 hover:underline text-sm"
                                                >
                                                    {contact.phone}
                                                </a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
