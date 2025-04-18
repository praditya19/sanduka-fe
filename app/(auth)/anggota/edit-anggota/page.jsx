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
import {
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const MapComponent = dynamic(
  () => import("../../../_components/MapComponent"),
  {
    ssr: false,
  }
);

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
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
  const [mulaiJadiAnggotaPgri, setMulaiJadiAnggotaPgri] = useState("");
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");
  const [sertifikatPendidik, setSertifikatPendidik] = useState("");
  const [mengajar, setMengajar] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [valueJabatan, setValueJabatan] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");
  const [preview, setPreview] = useState(null);
  const previousData = useRef(null);
  const [error, setError] = useState("");
  const [pesertaSanduka, setPesertaSanduka] = useState(false);
  // const [pesertaDaspen, setPesertaDaspen] = useState(false);
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
  const [notification, setNotification] = useState(null);

  // const handleChange = (index, e) => {
  //   const { value } = e.target;
  //   setNamaAnak((prevNamaAnak) => {
  //     const updatedNamaAnak = [...prevNamaAnak];
  //     updatedNamaAnak[index] = value;
  //     return updatedNamaAnak;
  //   });
  // };
  const handleChange = (index, e) => {
    const updatedNamaAnak = [...namaAnak];
    updatedNamaAnak[index] = e.target.value;
    setNamaAnak(updatedNamaAnak);
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
      previousData.current = response;
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
        setFormattedMulaiJadiAnggota(response.mulaiJadiAnggotaPgri || "");
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

        // setPesertaSanduka(response.pesertaSanduka === "Ya");
        // setPesertaDaspen(response.pesertaDaspen === "Ya");
        // setPesertaKtaDigital(response.pesertaKtaDigital === "Ya");
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
    const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = now.toISOString().split("T")[0];
    const jam = now.toTimeString().split(" ")[0];
    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();
    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : "";

    try {
      const userRole = sessionStorage.getItem("role");
      const namaLengkapUser =
        userRole === "USER" ? namaLengkap : sessionStorage.getItem("nama");

      const changedFields = [];

      if (previousData.current) {
        if (email !== previousData.current.email) changedFields.push("Email");
        if (password !== previousData.current.password)
          changedFields.push("Password");
        if (npaPgri !== previousData.current.npaPgri)
          changedFields.push("NPA PGRI");
        if (namaLengkap !== previousData.current.namaLengkap)
          changedFields.push("Nama Lengkap");
        if (nomorHp !== previousData.current.nomorHp)
          changedFields.push("Nomor HP");
        if (alamat !== previousData.current.alamat)
          changedFields.push("Alamat");
        if (nik !== previousData.current.nik) changedFields.push("NIK");
        if (nip !== previousData.current.nip) changedFields.push("NIP");

        if (tempatLahir !== previousData.current.tempatLahir)
          changedFields.push("Tempat Lahir");
        if (tanggalLahir !== previousData.current.tanggalLahir)
          changedFields.push("Tanggal Lahir");
        if (jenisKelamin !== previousData.current.jenisKelamin)
          changedFields.push("Jenis Kelamin");
        if (agama !== previousData.current.agama) changedFields.push("Agama");
        if (golonganDarah !== previousData.current.golonganDarah)
          changedFields.push("Golongan Darah");
        if (kodePos !== previousData.current.kodePos)
          changedFields.push("Kode Pos");

        if (selectedFile || (previousData.current.foto && !fotoBase64[0]))
          changedFields.push("Foto");

        if (latitude !== previousData.current.latitude)
          changedFields.push("Latitude");
        if (longitude !== previousData.current.longitude)
          changedFields.push("Longitude");

        if (namaSuamiIstri !== previousData.current.namaSuamiIstri)
          changedFields.push("Nama Suami/Istri");

        const prevNamaAnak = previousData.current.namaAnak || [];
        const currentNamaAnak = namaAnak || [];

        if (
          prevNamaAnak.length !== currentNamaAnak.length ||
          currentNamaAnak.some((name, index) => name !== prevNamaAnak[index])
        ) {
          if (currentNamaAnak.some((name) => name.trim() !== "")) {
            changedFields.push("Nama Anak");
          }
        }

        if (selectedCabang !== previousData.current.cabang)
          changedFields.push("Cabang");
        if (selectedUnitKerja !== previousData.current.unitKerja)
          changedFields.push("Unit Kerja");
        if (valueJabatan !== previousData.current.jabatan)
          changedFields.push("Jabatan");
        if (tingkatSekolah !== previousData.current.tingkatSekolah)
          changedFields.push("Tingkat Sekolah");
        if (statusSekolah !== previousData.current.statusSekolah)
          changedFields.push("Status Sekolah");
        if (statusPegawai !== previousData.current.statusPegawai)
          changedFields.push("Status Pegawai");
        if (pangkatGolongan !== previousData.current.pangkatGolongan)
          changedFields.push("Pangkat Golongan");
        if (pendidikanTerakhir !== previousData.current.pendidikanTerakhir)
          changedFields.push("Pendidikan");
        if (valueGolonganJabatan !== previousData.current.golonganJabatan)
          changedFields.push("Golongan Jabatan");
        if (mengajar !== previousData.current.mengajar)
          changedFields.push("Mengajar");

        if (sertifikatPendidik !== previousData.current.sertifikatPendidik)
          changedFields.push("Sertifikat Pendidik");
        if (
          formatDate(tahunDiangkat) !==
          formatDate(previousData.current.tahunDiangkat)
        )
          changedFields.push("Tahun Diangkat");
      }

      if (changedFields.length > 0) {
        let uraian = "Edit Data";

        if (changedFields.length === 1) {
          uraian = `Edit ${changedFields[0]}`;
        } else if (changedFields.length === 2) {
          uraian = `Edit ${changedFields[0]} dan ${changedFields[1]}`;
        } else if (changedFields.length > 2) {
          const lastField = changedFields.pop();
          uraian = `Edit ${changedFields.join(", ")}, dan ${lastField}`;
        }

        const historyData = {
          hari,
          tanggal,
          jam,
          npa: npaPgri,
          nama: namaLengkap,
          cabang: selectedCabang,
          uraian,
          masuk: "-",
          keluar: "-",
          bulan,
          tahun,
          cabang_ke_2: "-",
          user: namaLengkapUser,
        };

        await GlobalApi.createHistoryData(historyData);
      }
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

    const formatTanggal = (tanggal) => {
      const date = new Date(tanggal);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formattedTahunDiangkat = formatTanggal(tahunDiangkat);

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
        field: valueGolonganJabatan ?? "",
        name: "Golongan Jabatan",
        id: "golonganJabatan",
      },
      { field: mengajar ?? "", name: "Mengajar", id: "mengajar" },
    ];

    const emptyFields = requiredFieldsStep2.filter(({ field }) => !field);

    if (emptyFields.length > 0) {
      const firstEmptyField = emptyFields[0];

      setNotification({
        type: "error",
        message: `Field ${firstEmptyField.name} wajib diisi!`,
      });

      const element = document.getElementById(firstEmptyField.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }

      return;
    }

    // const cleanNamaAnak = Array.isArray(namaAnak)
    //   ? namaAnak.map((name) => (typeof name === "string" ? name.trim() : name))
    //   : [];
    const cleanNamaAnak = (namaAnakArray) => {
      if (typeof namaAnakArray === "string") {
        try {
          namaAnakArray = JSON.parse(namaAnakArray);
        } catch (error) {
          console.error("Gagal parse JSON:", error);
          return [];
        }
      }

      if (!Array.isArray(namaAnakArray)) {
        console.error("namaAnakArray bukan array:", namaAnakArray);
        return [];
      }

      return namaAnakArray.map((name) =>
        typeof name === "string" ? name.replace(/[[\]"\\]/g, "").trim() : name
      );
    };

    const cleanedNamaAnak = cleanNamaAnak(namaAnak);

    const formattedTanggalLahir = formatTanggal(tanggalLahir);

    const formatTanggalPgri = (tanggal) => {
      if (!tanggal) return new Date().toISOString().split("T")[0];
      const date = new Date(tanggal);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formattedMulaiJadiAnggota = formatTanggalPgri(mulaiJadiAnggotaPgri);

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
    formData.append("namaAnak", cleanedNamaAnak);
    formData.append("pesertaSanduka", pesertaSanduka ? "Ya" : "");
    // formData.append("pesertaDaspen", pesertaDaspen ? "Ya" : "");
    formData.append("pesertaKtaDigital", pesertaKtaDigital ? "Ya" : "");

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    if (!email) {
      console.error("Email tidak boleh kosong!");
      setNotification({
        type: "error",
        message: `Email wajib diisi sebelum melanjutkan!`,
      });
      return;
    }

    try {
      const response = await GlobalApi.updateUserById(id, formData);
      await handleCreateHistory();
      setNotification({
        type: "success",
        message: `Data berhasil diperbarui!`,
      });
      sessionStorage.removeItem("anggotaId");
      setTimeout(() => {
        const role = sessionStorage.getItem("role");

        if (role === "USER") {
          router.push("/home");
        } else {
          router.push("/anggota/data-anggota");
        }
      }, 3000);
    } catch (error) {
      console.error("Gagal mengupdate data:", error);
      setNotification({
        type: "error",
        message: `Terjadi kesalahan saat mengupdate data`,
      });
    }
  };

  const handleConfirmAndSendData = async () => {
    try {
      const role = sessionStorage.getItem("role");
      const anggotaId = sessionStorage.getItem("anggotaId");
      const userId = sessionStorage.getItem("userId");

      let idToUse = null;

      if (role === "SUPER ADMIN" || role === "ADMIN") {
        idToUse = anggotaId;
      } else if (role === "USER") {
        idToUse = userId;
      }

      if (!idToUse) {
        setNotification({
          type: "error",
          message: `ID tidak ditemukan!`,
        });
        return;
      }

      const nipData = await GlobalApi.getFileByNip(nip);
      if (nipData?.verifikasi === true) {
        setNotification({
          type: "success",
          message: `Data Anda sudah Tersinkronisasi!`,
        });
        handleClosePopup();
        return;
      }

      const response = await GlobalApi.updateRegisUser(idToUse, data);
      setNotification({
        type: "success",
        message: `Data Berhasil disinkronkan!`,
      });
      handleClosePopup();
    } catch (error) {
      console.error("Error saat mengirim data:", error);
      setNotification({
        type: "error",
        message: `Terjadi kesalahan saat mengirim data. Silahkan coba lagi.`,
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
    router.push("/anggota/data-anggota");
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
      setNotification({
        type: "error",
        message: <>Harap isi form {firstEmptyField.fieldName}!</>,
      });
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
      setNotification({
        type: "success",
        message: `Data ditemukan!`,
      });
    } catch (error) {
      console.error("Gagal mengambil data NIP:", error);
      setNotification({
        type: "error",
        message: `Data NIP tidak ada. Silahkan hubungi admin!`,
      });
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

  useEffect(() => {}, [golonganJabatan]);

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

  const cleanName = (name) => {
    if (typeof name !== "string") return name;
    return name.replace(/[[\]"\\]/g, "").trim();
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

  const handlePositionChange = (newLatitude, newLongitude) => {
    setLatitude(newLatitude);
    setLongitude(newLongitude);
  };

  return (
    <div className="w-full mx-auto px-4 py-6 bg-slate-200">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div className="container mx-auto max-w-screen-lg sm:max-w-full md:max-w-screen-lg px-4">
        {notification && (
          <NotificationPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="w-full mt-12">
          {/* Tabs Navigation */}
          <div className="flex flex-row space-x-4 mb-2 justify-center sm:justify-start">
            <div
              className={`py-2 px-4 rounded-full transition duration-300 text-xs sm:text-sm md:text-base ${
                step === 1
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
              onClick={() => setStep(1)}
            >
              I. DATA PRIBADI
            </div>
            <div
              className={`py-2 px-4 rounded-full transition duration-300 text-xs sm:text-sm md:text-base ${
                step === 2
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
              onClick={() => setStep(2)}
            >
              II. DATA PEKERJAAN
            </div>
          </div>
          <hr className="mb-4 border-t-2 border-gray-400 mt-1 w-full sm:w-96" />
        </div>
        <div>
          <form
            onSubmit={(event) => onSubmit(event, formData)}
            className="bg-white p-4 sm:p-8 rounded-lg shadow-lg"
          >
            {step === 1 && (
              <div>
                <div className="w-full flex flex-col items-center">
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
                  <p className="text-red-600 font-bold text-center mt-2">
                    {" "}
                    *Wajib Menggunakan Batik PGRI
                  </p>
                  {error && (
                    <p className="text-red-600 text-center mt-2">{error}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Email
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *Harap Diingat
                      </span>
                    </Label>
                    <Controller
                      name="email"
                      control={control}
                      defaultValue={email}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          className={`border-teal-500 ${
                            errorFields.email ? "border-red-500" : ""
                          }`}
                          type="email"
                          id="email"
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
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *Harap Diingat
                      </span>
                      <AiOutlineInfoCircle
                        className="inline-block ml-2 text-red-500 cursor-pointer"
                        size={20}
                        onClick={handleOpenPasswordInfo}
                      />
                    </Label>
                    <Input
                      type="text"
                      id="password"
                      placeholder="contoh: Kat45and!"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.email ? "border-red-500" : ""
                      }`}
                    />

                    {isPasswordInfoOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <h2 className="text-lg font-semibold">
                            Informasi Password
                          </h2>
                          <p className="mt-2">
                            Pastikan password Anda kuat dan mudah diingat!
                            password yang berhasil di buat maka secara otomatis
                            akan di hash supaya lebih aman
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
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      NPA PGRI
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *Wajib Isi
                      </span>
                    </Label>
                    <Input
                      type="text"
                      id="npaPgri"
                      placeholder="Tuliskan NPA"
                      value={npaPgri}
                      onChange={(e) => setNpaPgri(e.target.value)}
                      maxLength={11}
                      className={`border-teal-500 ${
                        errorFields.npaPgri ? "border-red-500" : ""
                      }`}
                    />
                  </div>

                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      NIP
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        Jika Tidak Memiliki NIP isi "0"
                      </span>
                    </Label>
                    <Input
                      type="number"
                      id="nip"
                      placeholder="Nomor Induk Pendidik (NIP)"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.nip ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      onClick={handleCekNip}
                      className="mt-2 p-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                    >
                      Cek NIP
                    </Button>
                    <span className="ml-4 text-sm text-teal-500">
                      Cek Kepesertaan Daspen Jateng
                    </span>

                    {isPopupVisible && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 w-1/2 relative">
                          <button
                            type="button"
                            onClick={handleClosePopup}
                            className="absolute top-2 right-5 text-red-500 hover:text-red-700 text-xl"
                            aria-label="Close"
                          >
                            &#10005;
                          </button>
                          <h2 className="text-lg font-semibold mb-4">
                            Apakah Data Anda Sudah Benar?
                          </h2>
                          {data ? (
                            <div>
                              <p>
                                <strong>Nama:</strong> {data.namaAnggota}
                              </p>
                              <p>
                                <strong>Tanggal Lahir:</strong>{" "}
                                {data.tanggalLahir}
                              </p>
                              <p>
                                <strong>Cabang:</strong> {data.cabang}
                              </p>
                              <p>
                                <strong>Unit Kerja:</strong> {data.unitKerja}
                              </p>
                              <p>
                                <strong>Kategori Daspen:</strong>{" "}
                                {data.kategoriDaspen}
                              </p>
                            </div>
                          ) : (
                            <p>Data tidak tersedia.</p>
                          )}
                          <div className="mt-2 justify-end flex">
                            <Button
                              type="button"
                              onClick={handleClosePopup}
                              className="p-2 mr-3 bg-red-500 w-16 text-white rounded hover:bg-red-700"
                            >
                              Belum
                            </Button>
                            <Button
                              type="button"
                              onClick={handleConfirmAndSendData}
                              className="p-2 w-16 bg-teal-500 text-white rounded hover:bg-teal-600"
                            >
                              Sudah
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      NIK
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *16 Digit
                      </span>
                    </Label>
                    <Input
                      type="number"
                      id="nik"
                      placeholder="16 Digit"
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.nik ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Nama Lengkap
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *Sesuai Dengan KTP
                      </span>
                    </Label>
                    <Input
                      type="text"
                      id="namaLengkap"
                      placeholder="Sesuai Dengan KTP"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.namaLengkap ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Tempat Lahir
                    </Label>
                    <Input
                      type="text"
                      id="tempatLahir"
                      placeholder="Tempat Kelahiran"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.tempatLahir ? "border-red-500" : ""
                      }`}
                    />
                  </div>

                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Tanggal Lahir
                    </Label>
                    <Controller
                      name="tanggalLahir"
                      control={control}
                      defaultValue={formattedTanggalLahir}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          className={`border-teal-500 ${
                            errorFields.formattedTanggalLahir
                              ? "border-red-500"
                              : ""
                          }`}
                          type="date"
                          id="tanggalLahir"
                          value={value || formattedTanggalLahir}
                          onChange={(e) => {
                            const selectedDate = e.target.value;
                            setTanggalLahir(selectedDate);
                            onChange(selectedDate);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Jenis Kelamin
                    </Label>
                    <Controller
                      name="jenisKelamin"
                      control={control}
                      defaultValue={jenisKelamin}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value}
                          onValueChange={(e) => {
                            onChange(e);
                            setJenisKelamin(e);
                          }}
                        >
                          <SelectTrigger
                            className={`border-teal-500 ${
                              errorFields.jenisKelamin ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="LAKI_LAKI">
                                Laki - Laki
                              </SelectItem>
                              <SelectItem value="PEREMPUAN">
                                Perempuan
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Agama
                    </Label>
                    <Controller
                      name="agama"
                      control={control}
                      defaultValue={agama}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value}
                          onValueChange={(e) => {
                            onChange(e);
                            setAgama(e);
                          }}
                        >
                          <SelectTrigger
                            className={`border-teal-500 ${
                              errorFields.agama ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Pilih Agama" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="ISLAM">Islam</SelectItem>
                              <SelectItem value="KRISTEN">Kristen</SelectItem>
                              <SelectItem value="KATOLIK">Katolik</SelectItem>
                              <SelectItem value="HINDU">Hindu</SelectItem>
                              <SelectItem value="BUDHA">Budha</SelectItem>
                              <SelectItem value="KONGHUCU">Konghucu</SelectItem>
                              <SelectItem value="LAINNYA">Lainya</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Golongan Darah
                    </Label>
                    <Controller
                      name="golonganDarah"
                      control={control}
                      defaultValue={golonganDarah}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value}
                          onValueChange={(e) => {
                            onChange(e);
                            setGolonganDarah(e);
                          }}
                        >
                          <SelectTrigger
                            className={`border-teal-500 ${
                              errorFields.golonganDarah ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Pilih Golongan Darah" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="AB">AB</SelectItem>
                              <SelectItem value="O">O</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <div className="w-full">
                      <Label className="block text-sm font-medium mb-3">
                        Alamat
                        <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                          *Sesuai Dengan KTP
                        </span>
                      </Label>
                      <Controller
                        name="alamat"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            placeholder="JL. RT.  RW.  Desa, Kecamatan, Kabupaten"
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            className={`border-teal-500 ${
                              errorFields.alamat ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        type="button"
                        onClick={handleGetLocation}
                        className="p-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                      >
                        {loading ? "Mendapatkan Lokasi..." : "Get Location"}
                      </Button>

                      <p className="text-red-500">
                        {!latitude &&
                          !longitude &&
                          "Mohon Get Location Ketika Anda Berada Dirumah"}
                      </p>

                      {latitude && longitude && (
                        <p className="text-teal-500 mt-1">
                          Lokasi berhasil ditemukan: {latitude.toFixed(4)},{" "}
                          {longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Kode Pos
                    </Label>
                    <Input
                      type="number"
                      id="kodePos"
                      placeholder="Tuliskan Kode Pos"
                      value={kodePos}
                      onChange={(e) => setKodePos(e.target.value)}
                      className="border-teal-500"
                    />
                  </div>
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3 sm:flex  sm:items-center">
                      Nomor Handphone
                      <span className="ml-0 sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-2 sm:mt-0 block">
                        *Tertaut Akun Whatsapp
                      </span>
                    </Label>
                    <Input
                      type="text"
                      id="nomorHp"
                      placeholder="Nomor Handphone Aktif"
                      value={nomorHp}
                      onChange={(e) => setNomorHp(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.nomorHp ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Nama Suami/Istri
                    </Label>
                    <Input
                      type="text"
                      id="namaSuamiIstri"
                      placeholder=" Nama Suami/Istri"
                      value={namaSuamiIstri}
                      onChange={(e) => setNamaSuamiIstri(e.target.value)}
                      className={`border-teal-500 ${
                        errorFields.namaSuamiIstri ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  <div className="w-full">
                    {Array.isArray(namaAnak) &&
                      namaAnak.map((name, index) => (
                        <div key={index} className="mb-3 flex items-center">
                          <div className="flex-1">
                            <Label className="block text-sm font-medium mb-1">
                              Nama Anak {index + 1}
                            </Label>
                            <Input
                              className={`block w-full text-sm p-2 mt-2 mb-2 border-teal-500 rounded`}
                              type="text"
                              name={`namaAnak-${index}`}
                              placeholder={`Tuliskan Nama Anak ${index + 1}`}
                              value={cleanName(name) || ""}
                              onChange={(e) => handleChange(index, e)}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleRemoveInput(index)}
                            className="ml-2 p-2 bg-red-500 text-white rounded mt-4 hover:bg-red-500"
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}

                    <Button
                      type="button"
                      onClick={handleAddInput}
                      className="mt-3 p-2 bg-teal-500 text-white rounded hover:bg-teal-500"
                    >
                      + Tambah Anak
                    </Button>
                  </div>
                </div>

                <div className="w-full col-span-2">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Maps Lokasi Rumah
                  </h2>
                  {latitude && longitude && (
                    <div className="mt-8">
                      <MapComponent
                        latitude={latitude}
                        longitude={longitude}
                        onPositionChange={handlePositionChange}
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-1 sm:col-span-2 flex justify-between mt-4">
                  <Button
                    type="button"
                    className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                    onClick={handleBackClick}
                  >
                    Kembali
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                </div>

                {isLocationInfoOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <h2 className="text-lg font-semibold">Informasi</h2>
                      <p className="mt-2">
                        Sebelum melanjutkan ke halaman selanjutnya, harap
                        melakukan Get Location terlebih dahulu dengan cara
                        mengklik button yang ada pada form alamat.
                      </p>
                      <button
                        onClick={handleCloseLocationInfo}
                        className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white rounded-lg shadow-lg">
                <div className="w-full" ref={cabangRef}>
                  <Label className="block text-sm font-medium mb-3">
                    Cabang
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Isi Sesuai Tempat Tugas
                    </span>
                  </Label>
                  <Controller
                    name="cabang"
                    control={control}
                    defaultValue={selectedCabang}
                    render={({ field: { onChange } }) => (
                      <div className="relative">
                        <Input
                          type="text"
                          className={`border-teal-500 ${
                            errorFields.cabang ? "border-red-500" : ""
                          } rounded-lg p-2 bg-white shadow-sm w-full`}
                          placeholder="Pilih Cabang"
                          value={selectedCabang || ""}
                          readOnly
                          onFocus={() => {
                            setQuery("");
                            setShowDropdown(true);
                          }}
                        />
                        {showDropdown && (
                          <div className="absolute z-10 border-teal-500 rounded-lg bg-white shadow-sm mt-1 w-full">
                            <div className="p-2">
                              <Input
                                type="text"
                                className="border rounded-lg p-2 w-full bg-gray-100 shadow-inner"
                                placeholder="Cari Cabang..."
                                value={query}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setQuery(value);
                                }}
                                autoFocus
                              />
                            </div>
                            {/* List hasil pencarian */}
                            <ul className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-full max-h-32 overflow-y-auto">
                              {filteredOptions.length > 0 ? (
                                filteredOptions.map((item) => (
                                  <li
                                    key={item.idKecamatan}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      handleCabangChange(item);
                                      onChange(item.kecamatan);
                                      setShowDropdown(false);
                                    }}
                                  >
                                    {item.kecamatan}
                                  </li>
                                ))
                              ) : (
                                <li className="p-2 text-gray-500">
                                  Cabang tidak ditemukan
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="w-full" ref={unitKerjaRef}>
                  <Label className="block text-sm font-medium mb-3">
                    Unit Kerja
                  </Label>
                  <Controller
                    name="unitKerja"
                    control={control}
                    defaultValue={selectedUnitKerja}
                    render={({ field: { onChange } }) => (
                      <div className="relative">
                        <Input
                          type="text"
                          className={`border-teal-500 rounded-lg p-2 bg-white shadow-sm w-full ${
                            errorFields.unitKerja ? "border-red-500" : ""
                          }`}
                          placeholder="Pilih Unit Kerja"
                          value={selectedUnitKerja || ""}
                          readOnly
                          onFocus={() => {
                            setQueryUnitKerja("");
                            setShowDropdownUnitKerja(true);
                          }}
                        />
                        {showDropdownUnitKerja && (
                          <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 w-full">
                            <div className="p-2">
                              <Input
                                type="text"
                                className="border rounded-lg p-2 w-full bg-gray-100 shadow-inner"
                                placeholder="Cari Unit Kerja..."
                                value={queryUnitKerja}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setQueryUnitKerja(value);
                                  setFilteredUnitKerja(
                                    allUnitKerja.filter(
                                      (uk) =>
                                        uk.cabang === selectedCabang &&
                                        uk.unitKerja
                                          .toLowerCase()
                                          .includes(value.toLowerCase())
                                    )
                                  );
                                }}
                                autoFocus
                              />
                            </div>
                            {/* List hasil pencarian */}
                            <ul className="max-h-48 overflow-y-auto">
                              {filteredUnitKerja &&
                              filteredUnitKerja.length > 0 ? (
                                filteredUnitKerja.map((item) => (
                                  <li
                                    key={item.id}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedUnitKerja(item.unitKerja);
                                      setShowDropdownUnitKerja(false);
                                    }}
                                  >
                                    {item.unitKerja}
                                  </li>
                                ))
                              ) : (
                                <li className="p-2 text-gray-500">
                                  Unit kerja tidak ditemukan
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  />
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
                        value={value || ""}
                        onValueChange={(e) => {
                          onChange(e);
                          setValueJabatan(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields?.jabatan ? "border-red-500" : ""
                          }`}
                        >
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
                    Tingkat Sekolah
                  </Label>
                  <Controller
                    name="tingkatSekolah"
                    control={control}
                    defaultValue={tingkatSekolah}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onValueChange={(e) => {
                          onChange(e);
                          setTingkatSekolah(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.tingkatSekolah ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Jenjang Sekolah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="PAUD">PAUD</SelectItem>
                            <SelectItem value="TK_RA">TK/RA</SelectItem>
                            <SelectItem value="SD_MI">SD/MI</SelectItem>
                            <SelectItem value="SMP_MTS">SMP/MTS</SelectItem>
                            <SelectItem value="SMA_MA">SMA/MA</SelectItem>
                            <SelectItem value="SMK">SMK</SelectItem>
                            <SelectItem value="SEKOLAH_LUAR_BIASA">
                              SEKOLAH LUAR BIASA
                            </SelectItem>
                            <SelectItem value="PERGURUAN_TINGGI">
                              PERGURUAN TINGGI
                            </SelectItem>
                            <SelectItem value="LAINNYA">Lainnya</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Status Sekolah
                  </Label>
                  <Controller
                    name="statusSekolah"
                    control={control}
                    defaultValue={statusSekolah}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onValueChange={(e) => {
                          onChange(e);
                          setStatusSekolah(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.statusSekolah ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Status Sekolah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="SWASTA">Swasta</SelectItem>
                            <SelectItem value="NEGERI">Negeri</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Status Pegawai
                  </Label>
                  <Controller
                    name="statusPegawai"
                    control={control}
                    defaultValue={statusPegawai}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onValueChange={(e) => {
                          onChange(e);
                          setStatusPegawai(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.statusPegawai ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Status Pegawai" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="PNS">PNS</SelectItem>
                            <SelectItem value="NON_PNS">NON_PNS</SelectItem>
                            <SelectItem value="PPPK">PPPK</SelectItem>
                            <SelectItem value="GTY">GTY</SelectItem>
                            <SelectItem value="GTTY">GTTY</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Tahun Diangkat
                  </Label>
                  <Controller
                    name="tahunDiangkat"
                    control={control}
                    defaultValue={formattedTahunDiangkat || ""}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        className={`border-teal-500 ${
                          errorFields.tahunDiangkat ? "border-red-500" : ""
                        }`}
                        type="date"
                        id="tahunDiangkat"
                        value={value || tahunDiangkat || ""}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          setTahunDiangkat(selectedDate);
                          onChange(selectedDate);
                        }}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Label className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                    Pangkat Golongan
                  </Label>
                  <Controller
                    name="pangkatGolongan"
                    control={control}
                    defaultValue={pangkatGolongan ?? ""}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value || pangkatGolongan}
                        onValueChange={(e) => {
                          onChange(e);
                          setPangkatGolongan(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.pangkatGolongan ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Golongan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Array.isArray(golonganJabatan) &&
                              golonganJabatan.map((item) => (
                                <SelectItem key={item.id} value={item.golongan}>
                                  {item.golongan}
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
                    Pendidikan Terakhir
                  </Label>
                  <Controller
                    name="pendidikanTerakhir"
                    control={control}
                    defaultValue={pendidikanTerakhir}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onValueChange={(e) => {
                          onChange(e);
                          setPendidikanTerakhir(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.pendidikanTerakhir
                              ? "border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="SMA">SMA</SelectItem>
                            <SelectItem value="SMK">SMK</SelectItem>
                            <SelectItem value="DIPLOMA">DIPLOMA</SelectItem>
                            <SelectItem value="SARJANA">SARJANA</SelectItem>
                            <SelectItem value="MAGISTER">MAGISTER</SelectItem>
                            <SelectItem value="DOKTOR">DOKTOR</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Sertifikat Pendidik
                  </Label>
                  <Controller
                    name="sertifikatPendidik"
                    control={control}
                    defaultValue={sertifikatPendidik}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onValueChange={(e) => {
                          onChange(e);
                          setSertifikatPendidik(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.sertifikatPendidik
                              ? "border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Sertifikat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="YA">Sudah</SelectItem>
                            <SelectItem value="TIDAK">Belum</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Kategori Daspen
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      Berdasarkan data-data Daspen Jateng
                    </span>
                  </Label>
                  <Controller
                    name="kategoriDaspen"
                    control={control}
                    value={valueKategoriDaspen}
                    onChange={(e) => setValueKategoriDaspen(e.target.value)}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value || valueKategoriDaspen}
                        onValueChange={(e) => {
                          onChange(e);
                          setValueKategoriDaspen(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.kategoriDaspen ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Kategori Daspen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="I">I</SelectItem>
                            <SelectItem value="II">II</SelectItem>
                            <SelectItem value="III">III</SelectItem>
                            <SelectItem value="non_kategori">
                              Non Kategori
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Golongan Jabatan
                  </Label>
                  <Controller
                    name="golonganJabatan"
                    control={control}
                    defaultValue={valueGolonganJabatan}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value || valueGolonganJabatan}
                        onValueChange={(e) => {
                          onChange(e);
                          setValueGolonganJabatan(e);
                        }}
                      >
                        <SelectTrigger
                          className={`border-teal-500 ${
                            errorFields.valueGolonganJabatan
                              ? "border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Pilih Golongan Jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Pendidik">Pendidik</SelectItem>
                            <SelectItem value="Tenaga Kependidikan">
                              Tenaga Pendidik
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div>
                    <span className="text-sm text-teal-500">
                      *Pendidik Usia 60 Tahun
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-teal-500">
                      *Tenaga Pendidik usia Pensiun 58 Tahun
                    </span>
                  </div>
                </div>

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Mengajar
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Mata Pelajaran
                    </span>
                  </Label>
                  <Controller
                    name="mengajar"
                    control={control}
                    defaultValue={mengajar}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        className={`border-teal-500 ${
                          errorFields.mengajar ? "border-red-500" : ""
                        }`}
                        type="text"
                        id="mengajar"
                        placeholder="Mengajar"
                        value={value}
                        onChange={(e) => {
                          setMengajar(e.target.value);
                          onChange(e.target.value);
                        }}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Controller
                    name="mulaiJadiAnggotaPgri"
                    control={control}
                    defaultValue={
                      formattedMulaiJadiAnggota ||
                      new Date().toISOString().split("T")[0]
                    }
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="hidden"
                        id="mulaiJadiAnggotaPgri"
                        value={
                          value ||
                          formattedMulaiJadiAnggota ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          setMulaiJadiAnggotaPgri(selectedDate);
                          onChange(selectedDate);
                        }}
                      />
                    )}
                  />
                </div>

                {/* <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Kepesertaan Anggota
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Terdaftar
                    </span>
                  </Label>
                  <Controller
                    name="Opsi"
                    control={control}
                    defaultValue={[]}
                    render={({ field: { onChange, value } }) => (
                      <div className="mt-2 sm:mt-2">
                        {[
                          {
                            label: "Peserta Sanduka",
                            status: pesertaSanduka,
                            setStatus: setPesertaSanduka,
                          },
                          {
                            label: "Peserta Daspen",
                            status: pesertaDaspen,
                            setStatus: setPesertaDaspen,
                          },
                          {
                            label: "Peserta KTA Digital",
                            status: pesertaKtaDigital,
                            setStatus: setPesertaKtaDigital,
                          },
                        ].map((option) => (
                          <label
                            key={option.label}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={option.label}
                              checked={option.status}
                              disabled={option.status}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...value, option.label]
                                  : value.filter((val) => val !== option.label);

                                option.setStatus(e.target.checked);
                                onChange(newValue);
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div> */}

                <div className="col-span-1 sm:col-span-2 flex justify-between mt-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                  >
                    Kembali
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const formatTanggal = (tanggal) => {
                        const date = new Date(tanggal);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        return `${year}-${month}-${day}`;
                      };
                      const formattedTahunDiangkat =
                        formatTanggal(tahunDiangkat);

                      const requiredFieldsStep2 = [
                        {
                          field: selectedCabang ?? "",
                          name: "Cabang",
                          id: "cabang",
                        },
                        {
                          field: selectedUnitKerja ?? "",
                          name: "Unit Kerja",
                          id: "unitKerja",
                        },
                        {
                          field: valueJabatan ?? "",
                          name: "Jabatan",
                          id: "jabatan",
                        },
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
                          field: tahunDiangkat
                            ? formatTanggal(tahunDiangkat)
                            : "",
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
                          field: valueGolonganJabatan ?? "",
                          name: "Golongan Jabatan",
                          id: "golonganJabatan",
                        },
                        {
                          field: mengajar ?? "",
                          name: "Mengajar",
                          id: "mengajar",
                        },
                      ];

                      const emptyFields = requiredFieldsStep2.filter(
                        ({ field }) => !field
                      );
                      if (emptyFields.length > 0) {
                        const firstEmptyField = emptyFields[0];
                        setNotification({
                          type: "error",
                          message: <>Harap isi form {firstEmptyField.name}!</>,
                        });
                        const element = document.getElementById(
                          firstEmptyField.id
                        );
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          element.focus();
                        }
                      } else {
                        setNotification({
                          type: "success",
                          message: `Semua field sudah terisi!`,
                        });
                      }
                    }}
                    className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                  >
                    Cek Form
                  </Button>
                  <Button
                    type="submit"
                    className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
