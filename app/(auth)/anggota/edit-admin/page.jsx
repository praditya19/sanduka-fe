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
import HeaderMobile from "@/app/_components/HeaderMobile";
import HeaderMenu from "@/app/_components/HeaderMenu";

const MapComponent = dynamic(
    () => import("../../../_components/MapComponent"),
    {
        ssr: false,
    }
);

const Page = () => {
    const router = useRouter();
    const { control, setValue } = useForm();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cabang, setCabang] = useState([]);
    const [jabatan, setJabatan] = useState([]);
    const [golonganJabatan, setGolonganJabatan] = useState([]);
    const [valueGolonganJabatan, setValueGolonganJabatan] = useState("");

    const [valueKategoriDaspen, setValueKategoriDaspen] = useState("");
    const [role, setRole] = useState(null);
    const [isValidRole, setIsValidRole] = useState(false);

    const [unitKerja, setUnitKerja] = useState([]);
    const [selectedCabang, setSelectedCabang] = useState(null);
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [base64String, setBase64String] = useState("");
    const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
    const [queryUnitKerja, setQueryUnitKerja] = useState("");
    const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
    const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
    const [today, setToday] = useState("");
    const [data, setData] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [npaPgri, setNpaPgri] = useState("");
    const [nip, setNip] = useState("");
    const [nik, setNik] = useState("");
    const [namaLengkap, setNamaLengkap] = useState("");
    const [tempatLahir, setTempatLahir] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [kodePos, setKodePos] = useState("");
    const [nomorHp, setNomorHp] = useState("");
    const [namaSuamiIstri, setNamaSuamiIstri] = useState("");
    const [namaAnak, setNamaAnak] = useState([]);
    const [agama, setAgama] = useState("");
    const [golonganDarah, setGolonganDarah] = useState("");
    const [alamat, setAlamat] = useState("");
    const [tingkatSekolah, setTingkatSekolah] = useState("");
    const [statusSekolah, setStatusSekolah] = useState("");
    const [statusPegawai, setStatusPegawai] = useState("");
    const [pangkatGolongan, setPangkatGolongan] = useState("");
    const [mulaiJadiAnggotaPgri, setMulaiJadiAnggotaPgri] = useState([]);
    const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");
    const [sertifikatPendidik, setSertifikatPendidik] = useState("");
    const [mengajar, setMengajar] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [valueJabatan, setValueJabatan] = useState("");
    const [fotoBase64, setFotoBase64] = useState("");
    const [preview, setPreview] = useState(null);

    const [error, setError] = useState("");
    const [pesertaSanduka, setPesertaSanduka] = useState(false);
    const [pesertaDaspen, setPesertaDaspen] = useState(false);
    const [pesertaKtaDigital, setPesertaKtaDigital] = useState(false);
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
        email: "",
        password: "",
        npaPgri: "",
        nip: "",
        nik: "",
        namaLengkap: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "",
        agama: "",
        golonganDarah: "",
        alamat: "",
        latitude: "",
        longitude: "",
        kodePos: "",
        nomorHp: "",
        namaSuamiIstri: "",
        namaAnak: [],
        foto: null,
        cabang: "",
        unitKerja: "",
        jabatan: "",
        tingkatSekolah: "",
        statusSekolah: "",
        statusPegawai: "",
        tahunDiangkat: "",
        pangkatGolongan: "",
        pendidikanTerakhir: "",
        sertifikatPendidik: "",
        mulaiJadiAnggotaPgri: "",
        golonganJabatan: "",
        mengajar: "",
    });
    const [allUnitKerja, setAllUnitKerja] = useState([]);
    const cabangRef = useRef(null);
    const unitKerjaRef = useRef(null);
    const [errorFields, setErrorFields] = useState({});

    const handleChange = (index, e) => {
        const { value } = e.target;
        setNamaAnak((prevNamaAnak) => {
            const updatedNamaAnak = [...prevNamaAnak];
            updatedNamaAnak[index] = value;
            return updatedNamaAnak;
        });
    };

    const getAnggotaById = async () => {
        const anggotaId = sessionStorage.getItem("anggotaId");
        const userId = sessionStorage.getItem("userId");

        const id = anggotaId || userId;

        if (!id) {
            console.error(
                "User ID atau Anggota ID tidak ditemukan atau tidak valid."
            );
            return;
        }

        try {
            const response = await GlobalApi.getUserById(id);
            // 35
            if (response) {
                setNamaLengkap(response.namaLengkap || "");
                setPassword(response.password || "");
                setEmail(response.email || "");
                setValue("email", response.email || "");
                setNpaPgri(response.npaPgri || "");
                setTempatLahir(response.tempatLahir || "");
                setTanggalLahir(response.tanggalLahir || "");
                setFormattedTanggalLahir(response.tanggalLahir || "");
                setNip(response.nip || "");
                setNik(response.nik || "");
                setJenisKelamin(response.jenisKelamin || "");
                setValue("jenisKelamin", response.jenisKelamin);
                setAgama(response.agama);
                setValue("agama", response.agama || "");
                setGolonganDarah(response.golonganDarah || "");
                setValue("golonganDarah", response.golonganDarah);
                setAlamat(response.alamat || "");
                setKodePos(response.kodePos || "");
                setNomorHp(response.nomorHp || "");
                setNamaSuamiIstri(response.namaSuamiIstri || "");
                setNamaAnak(response.namaAnak || "");
                setLatitude(response.latitude || null);
                setLongitude(response.longitude || "");
                setSelectedUnitKerja(response.unitKerja || "");
                setQueryUnitKerja(response.unitKerja || "");
                setSelectedCabang(response.cabang);
                setValue("cabang", response.cabang || "");
                setValue("unitKerja", response.unitKerja || "");

                setTingkatSekolah(response.tingkatSekolah || "");
                setValue("tingkatSekolah", response.tingkatSekolah);
                setStatusSekolah(response.statusSekolah || "");
                setValue("statusSekolah", response.statusSekolah);
                setStatusPegawai(response.statusPegawai || "");
                setValue("statusPegawai", response.statusPegawai);
                setPangkatGolongan(response.pangkatGolongan || "");
                setTahunDiangkat(response.tahunDiangkat || "");
                setMulaiJadiAnggotaPgri(response.mulaiJadiAnggotaPgri || "");
                setPendidikanTerakhir(response.pendidikanTerakhir || "");
                setValue("pendidikanTerakhir", response.pendidikanTerakhir);
                setSertifikatPendidik(response.sertifikatPendidik || "");
                setValueGolonganJabatan(response.golonganJabatan);
                setValueKategoriDaspen(response.kategoriDaspen || "");
                setValue("golonganJabatan", response.golonganJabatan);
                setJabatan(response.jabatan);

                setValue("jabatan", response.jabatan || "");

                setValueJabatan(response.jabatan);
                setMengajar(response.mengajar);
                setValue("mengajar", response.mengajar || "");

                setPesertaSanduka(response.pesertaSanduka === "Ya");
                setPesertaDaspen(response.pesertaDaspen === "Ya");
                setPesertaKtaDigital(response.pesertaKtaDigital === "Ya");
            }

            const fotoBase64Array = [];
            if (response.foto) {
                try {
                    const decodedString = atob(response.foto);
                    fotoBase64Array.push(decodedString);
                } catch (error) {
                    console.error("Error decoding Base64:", error);
                    fotoBase64Array.push(null);
                }
            } else {
                fotoBase64Array.push(null);
            }
            setFotoBase64(fotoBase64Array);
        } catch (error) {
            console.error("Error Saat Mendapatkan Data:", error);
        }
    };

    useEffect(() => {
        getAnggotaById();
    }, []);
    useEffect(() => {
        return () => {
            setValueJabatan("");
            setJabatan([]);
        };
    }, []);

    const handleCreateHistory = async () => {
        const now = new Date();

        // Format date components
        const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
        const tanggal = now.toISOString().split("T")[0];
        const jam = now.toTimeString().split(" ")[0];
        const bulan = now.toLocaleString("id-ID", { month: "long" });
        const tahun = now.getFullYear();

        // Get user details
        const userRole = sessionStorage.getItem("role");
        const namaLengkapUser =
            userRole === "USER"
                ? namaLengkap // Using namaLengkap state from the form
                : sessionStorage.getItem("nama");

        const historyData = {
            hari,
            tanggal,
            jam,
            npa: npaPgri,
            nama: namaLengkap,
            cabang: selectedCabang,
            uraian: "Edit Data",
            masuk: "-", // Not applicable for edit
            keluar: "-", // Not applicable for edit
            bulan,
            tahun,
            cabang_ke_2: "-", // Not applicable for edit
            user: namaLengkapUser,
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
        const anggotaId = sessionStorage.getItem("anggotaId");
        const userId = sessionStorage.getItem("userId");

        const id = anggotaId || userId;

        if (!id) {
            console.error(
                "User ID atau Anggota ID tidak ditemukan atau tidak valid."
            );
            return;
        }
        console.log("User ID:", id);

        const formatTanggal = (tanggal) => {
            const date = new Date(tanggal);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const formattedTahunDiangkat = formatTanggal(tahunDiangkat);

        // Validasi field yang wajib diisi
        const requiredFieldsStep2 = [
            { field: selectedCabang ?? "", name: "Cabang", id: "cabang" },
            { field: selectedUnitKerja ?? "", name: "Unit Kerja", id: "unitKerja" },
            { field: valueJabatan ?? "", name: "Jabatan", id: "jabatan" },
            {
                field: tingkatSekolah ?? "",
                name: "Tingkat Sekolah",
                id: "tingkatSekolah",
            },
            {
                field: statusSekolah ?? "",
                name: "Status Sekolah",
                id: "statusSekolah",
            },
            {
                field: statusPegawai ?? "",
                name: "Status Pegawai",
                id: "statusPegawai",
            },
            {
                field: formattedTahunDiangkat ?? "",
                name: "Tahun Diangkat",
                id: "tahunDiangkat",
            },
            {
                field: pangkatGolongan ?? "",
                name: "Pangkat Golongan",
                id: "pangkatGolongan",
            },
            {
                field: pendidikanTerakhir ?? "",
                name: "Pendidikan Terakhir",
                id: "pendidikanTerakhir",
            },
            {
                field: sertifikatPendidik ?? "",
                name: "Sertifikat Pendidik",
                id: "sertifikatPendidik",
            },
            {
                field: mulaiJadiAnggotaPgri ?? "",
                name: "Mulai Jadi Anggota PGRI",
                id: "mulaiJadiAnggotaPgri",
            },
            {
                field: valueKategoriDaspen ?? "",
                name: "Kategori Daspen",
                id: "kategoriDaspen",
            },
            {
                field: valueGolonganJabatan ?? "",
                name: "Golongan Jabatan",
                id: "golonganJabatan",
            },
            { field: mengajar ?? "", name: "Mengajar", id: "mengajar" },
        ];

        const emptyFields = requiredFieldsStep2.filter(({ field }) => !field);

        if (emptyFields.length > 0) {
            const firstEmptyField = emptyFields[0];

            toast.error(`Field ${firstEmptyField.name} wajib diisi!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            const element = document.getElementById(firstEmptyField.id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.focus();
            }

            return;
        }

        const formattedTanggalLahir = formatTanggal(tanggalLahir);
        const formattedMulaiJadiAnggota = formatTanggal(mulaiJadiAnggotaPgri);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("npaPgri", npaPgri);
        formData.append("nip", nip);
        formData.append("nik", nik);
        formData.append("namaLengkap", namaLengkap);
        formData.append("tempatLahir", tempatLahir);
        formData.append("tanggalLahir", formattedTanggalLahir);
        formData.append("jenisKelamin", jenisKelamin);
        formData.append("agama", agama);
        formData.append("golonganDarah", golonganDarah);
        formData.append("alamat", alamat);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("kodePos", kodePos);
        formData.append("nomorHp", nomorHp);
        formData.append("namaSuamiIstri", namaSuamiIstri);

        if (selectedFile) {
            formData.append("foto", selectedFile);
        }

        formData.append("cabang", selectedCabang);
        formData.append("unitKerja", selectedUnitKerja);
        formData.append("jabatan", valueJabatan);
        formData.append("tingkatSekolah", tingkatSekolah);
        formData.append("statusSekolah", statusSekolah);
        formData.append("statusPegawai", statusPegawai);
        formData.append("tahunDiangkat", formattedTahunDiangkat);
        formData.append("pangkatGolongan", pangkatGolongan);
        formData.append("pendidikanTerakhir", pendidikanTerakhir);
        formData.append("sertifikatPendidik", sertifikatPendidik);
        formData.append("mulaiJadiAnggotaPgri", formattedMulaiJadiAnggota);
        formData.append("golonganJabatan", valueGolonganJabatan);
        formData.append("kategoriDaspen", valueKategoriDaspen);
        formData.append("mengajar", mengajar);

        formData.append("pesertaSanduka", pesertaSanduka ? "Ya" : "");
        formData.append("pesertaDaspen", pesertaDaspen ? "Ya" : "");
        formData.append("pesertaKtaDigital", pesertaKtaDigital ? "Ya" : "");

        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        console.log("Nilai email sebelum submit:", email);

        if (!email) {
            console.error("Email tidak boleh kosong!");
            toast.error("Email wajib diisi sebelum melanjutkan.");
            return;
        }
        try {
            const response = await GlobalApi.updateUserById(id, formData);
            console.log("Response dari API:", response);
            await handleCreateHistory();
            toast.success(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "150px",
                            height: "150px",
                            color: "#06D001",
                            marginBottom: "16px",
                            marginTop: "14px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                    <h3
                        style={{
                            fontSize: "2rem",
                            display: "block",
                            marginBottom: "28px",
                        }}
                    >
                        Data berhasil diperbarui!
                    </h3>
                </div>,
                {
                    icon: null,
                    duration: 4000,
                    style: {
                        marginTop: "12%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "450px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
            sessionStorage.removeItem("anggotaId");
            setTimeout(() => {
                router.push("/home");
            }, 4000);
        } catch (error) {
            console.error("Gagal mengupdate data:", error);
            toast.error(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "150px",
                            height: "150px",
                            color: "red",
                            marginBottom: "16px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                        <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
                    </svg>
                    <h3
                        style={{
                            fontSize: "1.75rem",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        Terjadi kesalahan saat mengupdate data.
                    </h3>
                </div>,
                {
                    icon: null,
                    duration: 4000,
                    style: {
                        marginTop: "12%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "450px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
        }
    };

    const handleConfirmAndSendData = async () => {
        try {
            const userId = sessionStorage.getItem("anggotaId");
            if (!userId) {
                toast.error(
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                width: "150px",
                                height: "150px",
                                color: "red",
                                marginBottom: "16px",
                            }}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
                        </svg>
                        <strong
                            style={{
                                fontSize: "1.75rem",
                                display: "block",
                                marginBottom: "8px",
                            }}
                        >
                            User ID tidak ditemukan.
                        </strong>
                    </div>,
                    {
                        icon: null,
                        duration: 4000,
                        style: {
                            marginTop: "12%",
                            fontSize: "1.75rem",
                            padding: "10px",
                            width: "80%",
                            maxWidth: "450px",
                            height: "50%",
                            maxHeight: "400px",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                            zIndex: 9999,
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        },
                    }
                );
                return;
            }

            const response = await GlobalApi.updateRegisUser(userId, data);
            toast.success(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "48px",
                            height: "48px",
                            color: "#06D001",
                            marginBottom: "16px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                    <strong
                        style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
                    >
                        Data berhasil disinkronkan!
                    </strong>
                </div>,
                {
                    icon: null,
                    duration: 4000,
                    style: {
                        marginTop: "16%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "700px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
            handleClosePopup();
        } catch (error) {
            console.error("Error saat mengirim data:", error);
            toast.error(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "150px",
                            height: "150px",
                            color: "red",
                            marginBottom: "16px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                        <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
                    </svg>
                    <strong
                        style={{
                            fontSize: "1.75rem",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        Terjadi kesalahan saat mengirim data.
                    </strong>
                </div>,
                {
                    icon: null,
                    duration: 4000,
                    style: {
                        marginTop: "12%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "450px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
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
        router.push("/home");
        sessionStorage.removeItem("anggotaId");
    };

    const handleCloseLocationInfo = () => {
        setIsLocationInfoOpen(false);
    };

    const nextStep = () => {
        const requiredFieldsStep1 = [
            { field: email, fieldName: "Email", id: "email" },
            { field: password, fieldName: "Password Login", id: "password" },
            { field: npaPgri, fieldName: "NPA PGRI", id: "npaPgri" },
            { field: nip, fieldName: "NIP", id: "nip" },
            { field: nik, fieldName: "NIK", id: "nik" },
            { field: namaLengkap, fieldName: "Nama Lengkap", id: "namaLengkap" },
            { field: tanggalLahir, fieldName: "Tanggal Lahir", id: "tanggalLahir" },
            { field: jenisKelamin, fieldName: "Jenis Kelamin", id: "jenisKelamin" },
            { field: agama, fieldName: "Agama", id: "agama" },
            {
                field: golonganDarah,
                fieldName: "Golongan Darah",
                id: "golonganDarah",
            },
            { field: kodePos, fieldName: "Kode Pos", id: "kodePos" },
            { field: nomorHp, fieldName: "Nomor Handphone", id: "nomorHp" },
        ];

        const emptyFields = requiredFieldsStep1.filter(({ field }) => !field);

        if (emptyFields.length > 0) {
            const firstEmptyField = emptyFields[0];
            toast.error(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "150px",
                            height: "150px",
                            color: "red",
                            marginBottom: "16px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                        <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1-2.828-2.828z" />
                    </svg>
                    <h3
                        style={{
                            fontSize: "1.75rem",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        Harap isi form {firstEmptyField.fieldName}!
                    </h3>
                </div>,
                {
                    icon: null,
                    duration: 2000,
                    style: {
                        marginTop: "12%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "450px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
            const newErrorFields = {};
            emptyFields.forEach(({ fieldName }) => {
                newErrorFields[fieldName] = true;
            });

            setErrorFields(newErrorFields);
            const element = document.getElementById(firstEmptyField.id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.focus();
            }

            return;
        }

        if (!latitude || !longitude) {
            setIsLocationInfoOpen(true);
        } else {
            setErrorFields({});
            setStep(step + 1);
        }
    };

    const handleOpenPasswordInfo = () => {
        setIsPasswordInfoOpen(true);
        setIsLocationInfoOpen(false);
    };

    const handleClosePasswordInfo = () => {
        setIsPasswordInfoOpen(false);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const filteredOptions = cabang.filter((item) =>
        item.kecamatan.toLowerCase().includes(query.toLowerCase())
    );

    const handleUnitKerjaChange = (item) => {
        setSelectedUnitKerja(item.unitKerja);
        setShowDropdownUnitKerja(false);
    };

    const handleCekNip = async () => {
        try {
            const data = await GlobalApi.getByNIP(nip);
            setData(data);
            setIsPopupVisible(true);
            toast.success(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "48px",
                            height: "48px",
                            color: "#06D001",
                            marginBottom: "16px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                    <strong
                        style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}
                    >
                        Data ditemukan!
                    </strong>
                </div>,
                {
                    icon: null,
                    duration: 1000,
                    style: {
                        marginTop: "16%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "700px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
        } catch (error) {
            console.error("Gagal mengambil data NIP:", error);
            toast.error(
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            width: "150px",
                            height: "150px",
                            color: "red",
                            marginBottom: "16px",
                        }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
                        <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
                    </svg>
                    <strong
                        style={{
                            fontSize: "1.75rem",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        Data NIP tidak ada
                    </strong>
                </div>,
                {
                    icon: null,
                    duration: 4000,
                    style: {
                        marginTop: "12%",
                        fontSize: "1.75rem",
                        padding: "10px",
                        width: "80%",
                        maxWidth: "450px",
                        height: "50%",
                        maxHeight: "400px",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                }
            );
        }
    };

    const handleClosePopup = () => {
        setIsPopupVisible(false);
    };

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
            getAnggotaById(id);
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

        getAnggotaById();
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
            const anggotaId = sessionStorage.getItem("anggotaId");
            const userId = sessionStorage.getItem("userId");

            const id = anggotaId || userId;

            if (!id) {
                console.error(
                    "User ID atau Anggota ID tidak ditemukan atau tidak valid."
                );
                return;
            }

            try {
                const response = await GlobalApi.getUserById(id);
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

    const handleGetLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    setError("");
                    setLoading(false);
                },
                (error) => {
                    setError("Unable to retrieve your location. Please try again.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const handleRemoveInput = (index) => {
        setNamaAnak((prevNamaAnak) => {
            const updatedNamaAnak = prevNamaAnak.filter((_, i) => i !== index);

            setFormData((prevFormData) => ({
                ...prevFormData,
                namaAnak: updatedNamaAnak,
            }));

            return updatedNamaAnak;
        });
    };

    const handleAddInput = () => {
        setNamaAnak((prevNamaAnak) => [...prevNamaAnak, ""]);
    };

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

        if (userRole === "ADMIN" || userRole === "SUPER ADMIN") {
            setRole(userRole);
            setIsValidRole(true);
        } else {
            setIsValidRole(false);
        }
    }, []);

    return (
        <div className="w-full mx-auto px-4 py-6 bg-slate-200">
            <div className="container mx-auto max-w-screen-lg px-4">
                <Toaster />
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
                                value={namaLengkap}
                                onChange={(e) => setNamaLengkap(e.target.value)}
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
                                value={sessionStorage.getItem("role")} // Gets role from sessionStorage
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
