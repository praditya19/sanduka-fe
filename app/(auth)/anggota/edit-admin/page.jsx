"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from "next/dynamic";
import GlobalApi from "@/app/_utils/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const NotificationPopup = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100';
            case 'error':
                return 'bg-red-100';
            default:
                return 'bg-blue-100';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500 text-3xl" />;
            case 'error':
                return <FaExclamationCircle className="text-red-500 text-3xl" />;
            default:
                return null;
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            default:
                return 'text-blue-800';
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
                    aria-label="Close"
                >
                    <FaTimesCircle size={24} />
                </button>

                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-bounce">
                        {getIcon()}
                    </div>

                    <h3 className={`text-xl font-bold ${getTextColor()}`}>
                        {type === 'success' ? 'Berhasil!' : 'Gagal!'}
                    </h3>

                    <div className={`${getTextColor()} text-center`}>
                        {message}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Page = () => {
    const router = useRouter();
    const { control, setValue } = useForm();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cabang, setCabang] = useState([]);
    const [jabatan, setJabatan] = useState([]);
    const [golonganJabatan, setGolonganJabatan] = useState([]);
    const [role, setRole] = useState(null);
    const [isValidRole, setIsValidRole] = useState(false);

    const [unitKerja, setUnitKerja] = useState([]);
    const [selectedCabang, setSelectedCabang] = useState(null);
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [base64String, setBase64String] = useState("");
    const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
    const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
    const [today, setToday] = useState("");
    const [data, setData] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [daerah, setDaerah] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordNew, setPasswordNew] = useState("");
    const [npaPgri, setNpaPgri] = useState("");
    const [nip, setNip] = useState("");
    const [nik, setNik] = useState("");
    const [nama, setNama] = useState("");
    const [nomorHp, setNomorHp] = useState("");
    const [mulaiJadiAnggotaPgri, setMulaiJadiAnggotaPgri] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [valueJabatan, setValueJabatan] = useState("");
    const [fotoBase64, setFotoBase64] = useState("");
    const [preview, setPreview] = useState(null);

    const [error, setError] = useState("");
    const jabatanList = [
        { id: 1, jabatan: "Guru" },
        { id: 2, jabatan: "Kepala Sekolah" },
        { id: 3, jabatan: "Wakil Kepala Sekolah" },
        { id: 4, jabatan: "Kepala TU" },
        { id: 5, jabatan: "Tata Usaha" },
        { id: 6, jabatan: "Pustakawan" },
        { id: 7, jabatan: "Pengawas" },
        { id: 8, jabatan: "Penjaga" },
        { id: 9, jabatan: "Pamong" },
        { id: 10, jabatan: "Penilik" },
        { id: 11, jabatan: "Dosen" },
        { id: 12, jabatan: "Sarkodik" },
        { id: 13, jabatan: "Lain-Lain" },
    ];
    const [isPasswordInfoOpen, setIsPasswordInfoOpen] = useState(false);
    const [isLocationInfoOpen, setIsLocationInfoOpen] = useState(false);
    const [formattedMulaiJadiAnggota, setFormattedMulaiJadiAnggota] =
        useState("");
    const [tahunDiangkat, setTahunDiangkat] = useState([]);
    const [formattedTahunDiangkat, setFormattedTahunDiangkat] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [formattedTanggalLahir, setFormattedTanggalLahir] = useState("");
    const [formData, setFormData] = useState({
        daerah: "",
        email: "",
        password: "",
        passwordNew: "",
        npapgri: "",
        nama: "",
        nohp: "",
        foto: null,
        cabang: "",
        jabatan: "",
    });
    const [allUnitKerja, setAllUnitKerja] = useState([]);
    const cabangRef = useRef(null);
    const unitKerjaRef = useRef(null);
    const [errorFields, setErrorFields] = useState({});
    const [notification, setNotification] = useState(null);

    const getAdminById = async () => {
        const userId = sessionStorage.getItem("userId");

        if (!userId) {
            console.error("User ID tidak ditemukan atau tidak valid.");
            return;
        }

        try {
            const response = await GlobalApi.getAdminById(userId);

            if (response) {
                setDaerah(response.daerah || "");
                setNama(response.nama || "");
                setPassword(response.passwordNew || "");
                setEmail(response.email || "");
                setNpaPgri(response.npapgri || "");
                setNomorHp(response.nohp || "");
                setSelectedCabang(response.cabang || "");
                setValueJabatan(response.jabatan || "");

                if (response.foto) {
                    try {
                        const decodedString = atob(response.foto);
                        setFotoBase64(decodedString);
                        if (!selectedFile) {
                            setPreview(`data:image/jpeg;base64,${response.foto}`);
                        }
                    } catch (error) {
                        console.error("Error decoding Base64:", error);
                    }
                }

                setValue("email", response.email || "");
                setValue("cabang", response.cabang || "");
                setValue("jabatan", response.jabatan || "");
            }
        } catch (error) {
            console.error("Error Saat Mendapatkan Data:", error);
            setNotification({
                type: 'error',
                message: `Gagal Mengambil Data Pengguna`
            });
        }
    };


    useEffect(() => {
        getAdminById();
    }, []);
    useEffect(() => {
        return () => {
            setValueJabatan("");
            setJabatan([]);
        };
    }, []);

    const handleCreateHistory = async () => {
        const now = new Date();

        const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
        const tanggal = now.toISOString().split("T")[0];
        const jam = now.toTimeString().split(" ")[0];
        const bulan = now.toLocaleString("id-ID", { month: "long" });
        const tahun = now.getFullYear();

        const userRole = sessionStorage.getItem("role");
        const namaFromSession = userRole === "ADMIN" ? nama : sessionStorage.getItem("nama");

        if (!npaPgri || !selectedCabang || !namaFromSession) {
            console.error("Data tidak lengkap untuk membuat history");
            setNotification({
                type: 'error',
                message: `Data tidak lengkap untuk membuat history`
            });
            return;
        }

        const historyData = {
            hari,
            tanggal,
            jam,
            npa: npaPgri,
            nama: namaFromSession,
            cabang: selectedCabang,
            uraian: "Edit Data",
            masuk: "-",
            keluar: "-",
            bulan,
            tahun,
            cabang_ke_2: "-",
            user: namaFromSession,
        };

        try {
            await GlobalApi.createHistoryData(historyData);
        } catch (error) {
            console.error("Failed to create history data:", error);
            throw new Error("Gagal menyimpan riwayat edit data");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const userId = sessionStorage.getItem("userId");

        if (!userId) {
            console.error("User ID tidak ditemukan atau tidak valid.");
            return;
        }

        const originalData = await GlobalApi.getAdminById(userId);

        const formData = new FormData();

        const passwordToUse = password && password !== originalData.password
            ? password
            : originalData.password;

        formData.append("password", passwordToUse);
        formData.append("passwordNew", password);

        formData.append("daerah", daerah);
        formData.append("email", email);
        formData.append("npapgri", npaPgri);
        formData.append("nama", nama);
        formData.append("nohp", nomorHp);
        formData.append("cabang", selectedCabang);
        formData.append("jabatan", valueJabatan);
        formData.append("role", sessionStorage.getItem("role"));

        if (selectedFile) {
            formData.append('foto', selectedFile);
        } else if (originalData.foto) {
            const base64Response = await fetch(`data:image/jpeg;base64,${originalData.foto}`);
            const blob = await base64Response.blob();
            const file = new File([blob], 'existing-photo.jpg', { type: 'image/jpeg' });
            formData.append('foto', file);
        }

        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            const response = await GlobalApi.updateAdminById(userId, formData);
            await handleCreateHistory();

            setNotification({
                type: 'success',
                message: `Data Berhasil Diperbarui!`
            });

            sessionStorage.setItem('nama', nama || originalData.nama);
            sessionStorage.setItem('email', email || originalData.email);
            sessionStorage.setItem('cabang', selectedCabang || originalData.cabang);

            setTimeout(() => {
                router.push("/home");
            }, 2000);

        } catch (error) {
            console.error("Gagal mengupdate data:", error);

            setNotification({
                type: 'error',
                message: `Gagal Memperbarui Data!`
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cabangRef.current && !cabangRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            if (unitKerjaRef.current && !unitKerjaRef.current.contains(e.target)) {
                setShowDropdownUnitKerja(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleBackClick = () => {
        setTimeout(() => {
            router.push("/home");
        }, 1000);
    };

    const handleOpenPasswordInfo = () => {
        setIsPasswordInfoOpen(true);
        setIsLocationInfoOpen(false);
    };

    const handleClosePasswordInfo = () => {
        setIsPasswordInfoOpen(false);
    };

    const filteredOptions = cabang.filter((item) =>
        item.kecamatan.toLowerCase().includes(query.toLowerCase())
    );

    const convertToDateString = (arr) => {
        const [year, month, day] = arr;

        if (year && month && day) {
            const validMonth = month >= 1 && month <= 12 ? month - 1 : null;
            const isValidDay = day >= 1 && day <= new Date(year, month, 0).getDate();

            if (validMonth !== null && isValidDay) {
                const dateObj = new Date(year, validMonth, day);

                const yearStr = dateObj.getFullYear();
                const monthStr = String(dateObj.getMonth() + 1).padStart(2, "0");
                const dayStr = String(dateObj.getDate()).padStart(2, "0");

                return `${yearStr}-${monthStr}-${dayStr}`;
            }
        }

        return "";
    };

    useEffect(() => {
        if (id) {
            getAdminById(id);
        }
    }, [id]);

    useEffect(() => {
        const formattedLahir = convertToDateString(tanggalLahir);
        const formattedDiangkat = convertToDateString(tahunDiangkat);
        const formattedMulai = convertToDateString(mulaiJadiAnggotaPgri);

        setFormattedTanggalLahir(formattedLahir);
        setFormattedTahunDiangkat(formattedDiangkat);
        setFormattedMulaiJadiAnggota(formattedMulai);
    }, [tanggalLahir, tahunDiangkat, mulaiJadiAnggotaPgri]);

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        setToday(currentDate);

        getAdminById();
        updateUnitKerja();
        setIsClient(true);
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                setBase64String(base64String);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreview(null);
            setBase64String("");
        }
    };

    const updateUnitKerja = (kecamatan) => {
        const filteredUnitKerja = unitKerja.filter((item) => {
            return item.cabang === kecamatan;
        });
        setFilteredUnitKerja(filteredUnitKerja);
    };

    const handleCabangChange = (item) => {
        setSelectedCabang(item.kecamatan);
        setQuery("");
        setShowDropdown(false);

        if (Array.isArray(allUnitKerja)) {
            setFilteredUnitKerja(
                allUnitKerja.filter((uk) => uk.cabang === item.kecamatan)
            );
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const userId = sessionStorage.getItem("userId");

            if (!userId) {
                console.error("User  ID tidak ditemukan atau tidak valid.");
                return;
            }

            try {
                const response = await GlobalApi.getAdminById(userId);
                const data = response;

                if (data.tahunDiangkat) {
                    const formattedDate = new Date(data.tahunDiangkat)
                        .toISOString()
                        .split("T")[0];
                    setTahunDiangkat(formattedDate);
                    setValue("tahunDiangkat", formattedDate);
                }

                if (data.mulaiJadiAnggotaPgri) {
                    const formattedDate = new Date(data.mulaiJadiAnggotaPgri)
                        .toISOString()
                        .split("T")[0];
                    setFormattedMulaiJadiAnggota(formattedDate);
                    setValue("mulaiJadiAnggotaPgri", formattedDate);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, [setValue]);

    useEffect(() => {
        const fetchCabang = async () => {
            try {
                const response = await GlobalApi.getCabang();

                if (Array.isArray(response.data)) {
                    setCabang(response.data);
                } else {
                    console.error("Data fetched is not an array:", response.data);
                }
            } catch (error) {
                console.error("Error fetching cabang:", error);
            }
        };
        fetchCabang();
    }, []);

    useEffect(() => {
        fetchJabatan();
    }, []);

    const fetchJabatan = async () => {
        try {
            const response = await GlobalApi.getJabatan();

            setJabatan(response.data || []);
        } catch (error) {
            console.error("Error fetching jabatan:", error);
        }
    };

    useEffect(() => {
        fetchJabatan();
    }, []);

    const fetchGolonganJabatan = async () => {
        try {
            const response = await GlobalApi.getGolonganJabatan();
            setGolonganJabatan(response.data || []);
        } catch (error) {
            console.error("Error fetching golongan jabatan:", error);
        }
    };

    useEffect(() => {
        fetchGolonganJabatan();
    }, []);

    useEffect(() => { }, [golonganJabatan]);

    useEffect(() => {
        const fetchUnitKerja = async () => {
            try {
                const response = await GlobalApi.getUnitKerja();
                setAllUnitKerja(response.data);
                setFilteredUnitKerja(data);
            } catch (error) {
                console.error("Error fetching unit kerja:", error);
            }
        };

        fetchUnitKerja();
    }, []);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const userRole = sessionStorage.getItem("role");

        if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
            setRole(userRole);
            setIsValidRole(true);
        } else {
            setIsValidRole(false);
        }
    }, []);

    return (
        <div className="w-full mx-auto px-4 py-6 bg-slate-200">
            <div className="container mx-auto max-w-screen-lg px-4">
                {notification && (
                    <NotificationPopup
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}
                <form onSubmit={onSubmit} className="bg-white p-4 sm:p-8 rounded-lg shadow-lg">
                    <div className="w-full flex flex-col items-center mb-6">
                        <Image
                            width={150}
                            height={150}
                            className="border border-gray-300"
                            src={preview || `data:image/jpeg;base64,${fotoBase64}`}
                            alt="Photo Preview"
                        />
                        <Input
                            type="file"
                            id="foto"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="foto"
                            className="px-4 py-2 cursor-pointer border border-teal-500 rounded-md bg-white text-center mt-2"
                        >
                            Choose Files
                        </label>
                        <p className="text-red-600 font-bold text-center mt-2">*Wajib Menggunakan Batik PGRI</p>
                        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Email
                                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">*Harap Diingat</span>
                            </Label>
                            <Controller
                                name="email"
                                control={control}
                                defaultValue={email}
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        className="border-teal-500"
                                        type="email"
                                        placeholder="Email"
                                        value={value}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Password Login
                                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">*Harap Diingat</span>
                                <AiOutlineInfoCircle
                                    className="inline-block ml-2 text-red-500 cursor-pointer"
                                    size={20}
                                    onClick={handleOpenPasswordInfo}
                                />
                            </Label>
                            <Input
                                type="text"
                                placeholder="contoh: Kat45and!"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-teal-500"
                            />
                        </div>

                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                NPA PGRI
                                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">*Wajib Isi</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Tuliskan NPA"
                                value={npaPgri}
                                onChange={(e) => setNpaPgri(e.target.value)}
                                maxLength={11}
                                className="border-teal-500"
                            />
                        </div>

                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Nama Lengkap
                                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">*Sesuai Dengan KTP</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Sesuai Dengan KTP"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="border-teal-500"
                            />
                        </div>

                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Cabang
                                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">*Isi Sesuai Tempat Tugas</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    className="border-teal-500 rounded-lg p-2 bg-white shadow-sm w-full"
                                    placeholder="Pilih Cabang"
                                    value={selectedCabang}
                                    readOnly
                                    onFocus={() => {
                                        setQuery("");
                                        setShowDropdown(true);
                                    }}
                                />
                                {showDropdown && (
                                    <div className="absolute z-10 w-full mt-1">
                                        <Input
                                            type="text"
                                            className="border rounded-lg p-2 w-full"
                                            placeholder="Cari Cabang..."
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            autoFocus
                                        />
                                        <ul className="mt-1 max-h-48 overflow-y-auto bg-white border rounded-lg shadow-sm">
                                            {filteredOptions.map((item) => (
                                                <li
                                                    key={item.idKecamatan}
                                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleCabangChange(item);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {item.kecamatan}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Jabatan
                            </Label>
                            <Controller
                                name="jabatan"
                                control={control}
                                defaultValue={valueJabatan}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        value={value}
                                        onValueChange={(e) => {
                                            onChange(e);
                                            setValueJabatan(e);
                                        }}
                                    >
                                        <SelectTrigger className="border-teal-500">
                                            <SelectValue placeholder="Pilih Jabatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {jabatanList.map((item) => (
                                                    <SelectItem key={item.id} value={item.jabatan}>
                                                        {item.jabatan}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Nomor Handphone
                                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">*Tertaut Akun Whatsapp</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Nomor Handphone Aktif"
                                value={nomorHp}
                                onChange={(e) => setNomorHp(e.target.value)}
                                className="border-teal-500"
                            />
                        </div>

                        {/* Disabled Role Field */}
                        <div className="w-full">
                            <Label className="block text-sm font-medium mb-3">
                                Role
                            </Label>
                            <Input
                                type="text"
                                value={sessionStorage.getItem("role")}
                                disabled
                                className="border-gray-300 bg-gray-100"
                            />
                        </div>
                    </div>

                    {isPasswordInfoOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <h2 className="text-lg font-semibold">Informasi Password</h2>
                                <p className="mt-2">
                                    Pastikan password Anda kuat dan mudah diingat! Password yang berhasil di buat maka secara otomatis akan di hash supaya lebih aman
                                </p>
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleClosePasswordInfo}
                                        className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="col-span-1 sm:col-span-2 flex justify-between mt-4">
                        <Button
                            type="button"
                            className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                            onClick={handleBackClick}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="submit"
                            className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5"
                        >
                            Update
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Page;
