"use client";
import React, { useState, useEffect } from "react";
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
import { AiOutlineInfoCircle } from "react-icons/ai"; // Information icon from react-icons

const MapComponent = dynamic(
  () => import("../../../_components/MapComponent"),
  {
    ssr: false,
  }
);

const Page = () => {
  const { control, handleSubmit, setValue } = useForm();
  const searchParams = useSearchParams(); // Get search parameters
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
  const [unitKerja, setUnitKerja] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [query, setQuery] = useState(""); // Menyimpan teks input dari pengguna
  const [showDropdown, setShowDropdown] = useState(false); // Menyembunyikan/memperlihatkan dropdown
  // const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [isCabangValid, setIsCabangValid] = useState(false);
  const [base64String, setBase64String] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [queryUnitKerja, setQueryUnitKerja] = useState("");
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [today, setToday] = useState("");
  // const isCabangValid = Array.isArray(cabang) && cabang.length > 0;
  // Update DATA
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [npaPgri, setNpaPgri] = useState("");
  const [nip, setNip] = useState("");
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState(""); // Kosong untuk nama lengkap
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
  const [isVerified, setIsVerified] = useState("");
  const [valueUnitKerja, setValueUnitKerja] = useState(""); // State untuk unit kerja yang dipilih
  const [valueJabatan, setValueJabatan] = useState(""); // State untuk jabatan yang dipilih
  const [foto, setFoto] = useState("");
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState("");
  const [error, setError] = useState("");
  const [pesertaSanduka, setPesertaSanduka] = useState(false);
  const [pesertaDaspen, setPesertaDaspen] = useState(false);
  const [pesertaKtaDigital, setPesertaKtaDigital] = useState(false);
  // END
  const [isPasswordInfoOpen, setIsPasswordInfoOpen] = useState(false);
  const [isLocationInfoOpen, setIsLocationInfoOpen] = useState(false);
  const [formattedMulaiJadiAnggota, setFormattedMulaiJadiAnggota] =
    useState(""); // State untuk mulai jadi anggota PGRI
  const [tahunDiangkat, setTahunDiangkat] = useState([]); // State untuk tahun diangkat
  const [formattedTahunDiangkat, setFormattedTahunDiangkat] = useState(""); // Deklarasi state untuk tahun diangkat yang diformat
  const [tanggalLahir, setTanggalLahir] = useState(""); // State untuk tanggal lahir
  const [formattedTanggalLahir, setFormattedTanggalLahir] = useState(""); // Deklarasi state untuk tanggal lahir yang diformat
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
    namaAnak: [], // Jika ini adalah array
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const anggotaId = sessionStorage.getItem("anggotaId");

  // Fungsi handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fungsi onSubmit
  const onSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman

    // Validasi format tanggal menjadi yyyy-MM-dd
    const formatTanggal = (tanggal) => {
      const date = new Date(tanggal);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Pastikan tanggal dalam format yang benar
    const formattedTanggalLahir = formatTanggal(tanggalLahir);
    const formattedTahunDiangkat = formatTanggal(tahunDiangkat);
    const formattedMulaiJadiAnggota = formatTanggal(mulaiJadiAnggotaPgri);

    // Membuat FormData dan menambahkan data
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("npaPgri", npaPgri);
    formData.append("nip", nip);
    formData.append("nik", nik);
    formData.append("namaLengkap", namaLengkap);
    formData.append("tempatLahir", tempatLahir);
    formData.append("tanggalLahir", formattedTanggalLahir); // tanggal dalam format yyyy-MM-dd
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("agama", agama);
    formData.append("golonganDarah", golonganDarah);
    formData.append("alamat", alamat);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("kodePos", kodePos);
    formData.append("nomorHp", nomorHp);
    formData.append("namaSuamiIstri", namaSuamiIstri);

    // Tambahkan foto jika ada
    if (selectedFile) {
      formData.append("foto", selectedFile);
    }

    formData.append("cabang", selectedCabang);
    formData.append("unitKerja", selectedUnitKerja);
    formData.append("jabatan", valueJabatan);
    formData.append("tingkatSekolah", tingkatSekolah);
    formData.append("statusSekolah", statusSekolah);
    formData.append("statusPegawai", statusPegawai);
    formData.append("tahunDiangkat", formattedTahunDiangkat); // tanggal dalam format yyyy-MM-dd
    formData.append("pangkatGolongan", pangkatGolongan);
    formData.append("pendidikanTerakhir", pendidikanTerakhir);
    formData.append("sertifikatPendidik", sertifikatPendidik);
    formData.append("mulaiJadiAnggotaPgri", formattedMulaiJadiAnggota); // tanggal dalam format yyyy-MM-dd
    formData.append("golonganJabatan", valueGolonganJabatan);
    formData.append("mengajar", mengajar);
    // Tambahkan nilai kepesertaan ke formData
    formData.append("pesertaSanduka", pesertaSanduka ? "Ya" : "");
    formData.append("pesertaDaspen", pesertaDaspen ? "Ya" : "");
    formData.append("pesertaKtaDigital", pesertaKtaDigital ? "Ya" : "");

    try {
      // Mengirim request ke server menggunakan GlobalApi
      const response = await GlobalApi.updateUserById(anggotaId, formData);
      toast.success("Data Anda Berhasi Diupdate!");
    } catch (error) {
      console.error("Update gagal:", error);
    }
  };

  const handleCloseLocationInfo = () => {
    setIsLocationInfoOpen(false);
  };

  const nextStep = () => {
    if (!latitude || !longitude) {
      setIsLocationInfoOpen(true); // Tampilkan modal informasi
    } else {
      setStep(step + 1); // Lanjutkan ke langkah selanjutnya
    }
  };

  const handleOpenPasswordInfo = () => {
    setIsPasswordInfoOpen(true);
    setIsLocationInfoOpen(false); // Menutup modal lokasi jika terbuka
  };

  const handleClosePasswordInfo = () => {
    setIsPasswordInfoOpen(false);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Fungsi untuk memfilter data cabang berdasarkan input
  const filteredOptions = cabang
    .filter((item) =>
      item.kecamatan.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5); // Batasi hasil hingga 5 item

  // Filter unit kerja berdasarkan query
  const handleUnitKerjaChange = (value) => {
    const filtered = unitKerja.filter((item) =>
      item.unitKerja.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUnitKerja(filtered); // Set filtered unit kerja
  };

  const getAnggotaById = async () => {
    // Ambil userId dari sessionStorage
    const userId = sessionStorage.getItem("anggotaId");

    if (!userId) {
      console.error("User ID tidak ditemukan atau tidak valid.");
      return; // Hentikan eksekusi jika userId tidak valid
    }

    try {
      const response = await GlobalApi.getUserById(userId);

      if (response) {
        setNamaLengkap(response.namaLengkap || "");
        setPassword(response.password || "");
        setEmail(response.email || "");
        setValue("email", response.email || "");
        setNpaPgri(response.npaPgri || "");
        setTempatLahir(response.tempatLahir || "");
        setTanggalLahir(response.tanggalLahir || ""); // Simpan nilai mentah
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
        setLongitude(response.longitude || null);

        // Set data Cabang dan Unit Kerja
        setSelectedUnitKerja(response.unitKerja || "");
        setQueryUnitKerja(response.unitKerja || "");
        setSelectedCabang(response.cabang);
        setValue("cabang", response.cabang || "");
        setValue("unitKerja", response.unitKerja || ""); // Set nilai unit kerja pada form

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
        setValue("golonganJabatan", response.golonganJabatan);
        setJabatan(response.jabatan);
        setValue("jabatan", response.jabatan);
        setValueJabatan(response.jabatan);
        setMengajar(response.mengajar);
        setValue("mengajar", response.mengajar || "");
        // Atur status kepesertaan berdasarkan nilai yang diterima
        setPesertaSanduka(response.pesertaSanduka === "Ya");
        setPesertaDaspen(response.pesertaDaspen === "Ya");
        setPesertaKtaDigital(response.pesertaKtaDigital === "Ya");
      }
    } catch (error) {
      console.error("Error Saat Mendapatkan Data:", error);
    }
  };

  useEffect(() => {
    getAnggotaById();
  }, []);

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
    setFormattedTahunDiangkat(formattedDiangkat); // Pastikan ini sesuai
    setFormattedMulaiJadiAnggota(formattedMulai);
  }, [tanggalLahir, tahunDiangkat, mulaiJadiAnggotaPgri]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setToday(currentDate);
    // setToday(formattedDate);

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

        // Menampilkan base64String ke konsol
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

  const handleCabangChange = (value) => {
    setSelectedCabang(value); // Simpan cabang yang dipilih

    // Pastikan unitKerja adalah array sebelum memfilter
    if (Array.isArray(unitKerja)) {
      const filtered = unitKerja.filter((item) => item.cabang === value); // Pastikan ini sesuai dengan field yang ada di unit kerja
      setFilteredUnitKerja(filtered); // Update unit kerja yang terfilter
    } else {
      console.error("unitKerja is not an array:", unitKerja); // Debugging
      setFilteredUnitKerja([]); // Reset filteredUnitKerja jika unitKerja bukan array
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GlobalApi.getUserById(anggotaId); // Ganti dengan API untuk mengambil data anggota
        const data = response.data;

        // Mengatur nilai default untuk tahunDiangkat
        if (data.tahunDiangkat) {
          const formattedDate = new Date(data.tahunDiangkat)
            .toISOString()
            .split("T")[0]; // Format ke YYYY-MM-DD
          setTahunDiangkat(formattedDate); // Set ke state
          setValue("tahunDiangkat", formattedDate); // Set ke form
        }

        // Mengatur nilai default untuk mulaiJadiAnggotaPgri
        if (data.mulaiJadiAnggotaPgri) {
          const formattedDate = new Date(data.mulaiJadiAnggotaPgri)
            .toISOString()
            .split("T")[0]; // Format ke YYYY-MM-DD
          setFormattedMulaiJadiAnggota(formattedDate); // Set ke state
          setValue("mulaiJadiAnggotaPgri", formattedDate); // Set ke form
        }

        // Set nilai lainnya ke form jika perlu
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [setValue, anggotaId]); // Tambahkan anggotaId ke array dependensi

  useEffect(() => {
    // Fetch cabang data from an API or database
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
      const response = await GlobalApi.getJabatan(); // Ambil data jabatan dari API

      setJabatan(response.data || []); // Simpan data jabatan ke state
    } catch (error) {
      console.error("Error fetching jabatan:", error);
    }
  };

  // Panggil fetchJabatan saat komponen dimuat
  useEffect(() => {
    fetchJabatan();
  }, []);

  // Fungsi untuk mengambil data golongan jabatan
  const fetchGolonganJabatan = async () => {
    try {
      const response = await GlobalApi.getGolonganJabatan(); // Ambil data golongan jabatan dari API

      setGolonganJabatan(response.data || []); // Simpan data golongan jabatan ke state
    } catch (error) {
      console.error("Error fetching golongan jabatan:", error);
    }
  };

  // Panggil fetchGolonganJabatan saat komponen dimuat
  useEffect(() => {
    fetchGolonganJabatan();
  }, []);

  useEffect(() => {}, [golonganJabatan]);

  useEffect(() => {
    const fetchUnitKerja = async () => {
      try {
        const response = await GlobalApi.getUnitKerja(); // API untuk mendapatkan unit kerja
        setUnitKerja(response.data || []); // Pastikan response.data adalah array
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
    const updatedNames = namaAnak.filter((_, i) => i !== index);
    setNamaAnak(updatedNames);
  };

  const handleAddInput = () => {
    setNamaAnak([...namaAnak, ""]);
  };

  return (
    <div className="w-full mx-auto px-4 py-6 bg-slate-200">
      <div className="container mx-auto max-w-screen-lg sm:max-w-full md:max-w-screen-lg px-4">
        <Toaster />
        <div>
          <form
            onSubmit={(event) => onSubmit(event, formData)}
            className="bg-white p-4 sm:p-8 rounded-lg shadow-lg"
          >
            {step === 1 && (
              <div>
                <h2 className="font-semibold text-xl text-gray-600">
                  I. DATA PRIBADI
                </h2>
                <hr className="mb-6 border-t-2 border-gray-300 mt-4" />

                <div className="w-full flex flex-col items-center">
                  <Image
                    width={150}
                    height={150}
                    className="border border-gray-300"
                    src={preview || "https://via.placeholder.com/100"}
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
                    className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-center mt-2" // Jarak atas label
                  >
                    Choose Files
                  </label>
                  <p className="text-red-600 font-bold text-center mt-2">
                    {" "}
                    {/* Jarak atas untuk teks Wajib */}
                    *Wajib Menggunakan Batik PGRI
                  </p>
                  <p className="text-red-600 text-center">
                    {" "}
                    {/* Jarak atas untuk teks Maksimal ukuran */}
                    *Maksimal ukuran file unggah 250kb format file (jpg, jpeg,
                    png)
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
                    />

                    {/* Modal Informasi Password */}
                    {isPasswordInfoOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <h2 className="text-lg font-semibold">
                            Informasi Password
                          </h2>
                          <p className="mt-2">
                            Pastikan password Anda kuat dan mudah diingat!
                            password yang berhasil di buat maka secara otomatis
                            akan di hash supaya lebih aman
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
                    />
                  </div>
                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      NIP
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *Wajib Isi
                      </span>
                    </Label>
                    <Input
                      type="number"
                      id="nip"
                      placeholder="Nomor Induk Pendidik (NIP)"
                      value={nip} // Bind the nip value from state
                      onChange={(e) => setNip(e.target.value)}
                    />
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
                      value={nik} // Bind the nip value from state
                      onChange={(e) => setNik(e.target.value)}
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
                      value={tempatLahir} // Bind the nip value from state
                      onChange={(e) => setTempatLahir(e.target.value)}
                    />
                  </div>

                  <div className="w-full">
                    <Label className="block text-sm font-medium mb-3">
                      Tanggal Lahir
                    </Label>
                    <Controller
                      name="tanggalLahir"
                      control={control}
                      defaultValue={formattedTanggalLahir} // Nilai default
                      render={({ field: { onChange, value } }) => (
                        <Input
                          type="date"
                          id="tanggalLahir"
                          value={value || formattedTanggalLahir} // Sinkronkan dengan nilai state
                          onChange={(e) => {
                            const selectedDate = e.target.value; // Ambil nilai dari input
                            setTanggalLahir(selectedDate); // Update state tanggalLahir
                            onChange(selectedDate); // Update nilai form control
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
                {/* formattedTanggalLahir */}
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
                          value={value} // Gunakan value dari field
                          onValueChange={(e) => {
                            onChange(e); // Update field dengan nilai baru
                            setJenisKelamin(e); // Update state lokal jika perlu
                          }} // Ganti onChange dengan onValueChange jika menggunakan Select dari library tertentu
                        >
                          <SelectTrigger>
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
                      defaultValue={agama} // Pastikan ini diisi dengan nilai dari database
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value} // Gunakan value dari field
                          onValueChange={(e) => {
                            onChange(e); // Update field dengan nilai baru
                            setAgama(e); // Update state lokal jika perlu
                          }} // Ganti onChange dengan onValueChange jika menggunakan Select dari library tertentu
                        >
                          <SelectTrigger>
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
                      defaultValue={golonganDarah} // Pastikan ini diisi dengan nilai dari database
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value} // Gunakan value dari field
                          onValueChange={(e) => {
                            onChange(e); // Update field dengan nilai baru
                            setGolonganDarah(e); // Update state lokal jika perlu
                          }} // Ganti onChange dengan onValueChange jika menggunakan Select dari library tertentu
                        >
                          <SelectTrigger>
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
                          />
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      className="mt-2 p-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                    >
                      {loading ? "Mendapatkan Lokasi..." : "Get Location"}
                    </Button>
                    <AiOutlineInfoCircle
                      className="inline-block ml-2 text-red-500 cursor-pointer"
                      size={20}
                      onClick={handleOpenModal}
                    />
                    {/* Modal Popup */}
                    {isModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <h2 className="text-lg font-semibold">Informasi</h2>
                          <p className="mt-2">
                            Mohon Get Location Ketika Anda Berada Dirumah
                          </p>
                          <div className="flex justify-end mt-6">
                            <button
                              onClick={handleCloseModal}
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
                      Kode Pos
                    </Label>
                    <Input
                      type="number"
                      id="kodePos"
                      placeholder="Tuliskan Kode Pos"
                      value={kodePos}
                      onChange={(e) => setKodePos(e.target.value)}
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
                              className="block w-full text-sm p-2 mt-2 mb-2 border rounded"
                              type="text"
                              placeholder={`Tuliskan Nama Anak ${index + 1}`} // Perbaikan di sini
                              value={name}
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
                      <MapComponent latitude={latitude} longitude={longitude} />
                    </div>
                  )}
                </div>
                <div className="w-full flex justify-end mt-8">
                  <Button onClick={nextStep}>Next</Button>
                </div>
                {/* Modal Informasi Lokasi */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg">
                <h2 className="font-semibold text-xl text-gray-600">
                  II. DATA PEKERJAAN
                </h2>
                <hr className="mb-6 border-t-2 border-gray-300 mt-4" />

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Cabang
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Isi Sesuai Tempat Tugas
                    </span>
                  </Label>
                  <Controller
                    name="cabang"
                    control={control}
                    defaultValue={cabang}
                    render={({ field: { onChange, value } }) => (
                      <div className="relative">
                        <input
                          type="text"
                          className="border rounded-lg p-2 w-56 bg-white shadow-sm"
                          placeholder="Pilih Cabang"
                          value={query || value}
                          onChange={(e) => {
                            const value = e.target.value;
                            setQuery(value); // Update nilai input
                            onChange(value); // Update nilai form
                            setSelectedCabang(e);
                            setShowDropdown(true); // Tampilkan dropdown
                          }}
                          onFocus={() => setShowDropdown(true)}
                          onBlur={() =>
                            setTimeout(() => setShowDropdown(false), 200)
                          } // Delay untuk menutup dropdown
                        />
                        {showDropdown && (
                          <ul className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 max-h-48 overflow-y-auto w-full">
                            {filteredOptions.length > 0 ? (
                              filteredOptions.map((item) => (
                                <li
                                  key={item.idKecamatan}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    setQuery(item.kecamatan); // Set nilai input dengan cabang yang dipilih
                                    setSelectedCabang(item.kecamatan); // Set pilihan cabang ke state
                                    handleCabangChange(item.kecamatan); // Memanggil fungsi untuk memfilter unit kerja
                                    setShowDropdown(false); // Sembunyikan dropdown
                                  }}
                                >
                                  {item.kecamatan}
                                </li>
                              ))
                            ) : (
                              <li className="p-2 text-gray-500">
                                No results found
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Unit Kerja
                  </Label>
                  <Controller
                    name="unitKerja"
                    control={control}
                    defaultValue={selectedUnitKerja}
                    render={({ field: { onChange } }) => (
                      <div className="relative">
                        <input
                          type="text"
                          className="border rounded-lg p-2 w-56 bg-white shadow-sm"
                          placeholder="Pilih Unit Kerja"
                          value={queryUnitKerja} // Gunakan queryUnitKerja untuk menampilkan nilai yang dipilih
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            setQueryUnitKerja(inputValue); // Update query state
                            handleUnitKerjaChange(inputValue); // Panggil fungsi filter unit kerja
                            setShowDropdownUnitKerja(true); // Menampilkan dropdown saat mengetik
                          }}
                          onFocus={() => setShowDropdownUnitKerja(true)}
                          onBlur={() =>
                            setTimeout(
                              () => setShowDropdownUnitKerja(false),
                              200
                            )
                          } // Penundaan untuk menutup dropdown
                        />
                        {showDropdownUnitKerja && (
                          <ul className="absolute z-10 border rounded-lg bg-white shadow-sm mt-1 max-h-48 overflow-y-auto w-full">
                            {filteredUnitKerja.length > 0 ? (
                              filteredUnitKerja.map((item) => (
                                <li
                                  key={item.id}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    setQueryUnitKerja(item.unitKerja); // Update input dengan pilihan
                                    onChange(item.unitKerja); // Update nilai form
                                    setSelectedUnitKerja(item.unitKerja); // Update state selected unit kerja
                                    setShowDropdownUnitKerja(false); // Sembunyikan dropdown
                                  }}
                                >
                                  {item.unitKerja}
                                </li>
                              ))
                            ) : (
                              <li className="p-2 text-gray-500">
                                Unit kerja tidak tersedia.
                              </li>
                            )}
                          </ul>
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
                    defaultValue={jabatan}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value} // Pastikan value sudah terisi
                        onValueChange={(e) => {
                          onChange(e); // Update nilai form
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Array.isArray(jabatan) &&
                              jabatan.map((item) => (
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
                    defaultValue={tingkatSekolah} // Pastikan ini diisi dengan nilai dari database
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value} // Gunakan value dari field
                        onValueChange={(e) => {
                          onChange(e); // Update field dengan nilai baru
                          setTingkatSekolah(e); // Update state lokal jika perlu
                        }} // Ganti onChange dengan onValueChange jika menggunakan Select dari library tertentu
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jenjang Sekolah" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="PAUD">PAUD</SelectItem>
                            <SelectItem value="TK_RA">TK/RA</SelectItem>
                            <SelectItem value="SD_MI">SD/MI</SelectItem>
                            <SelectItem value="SMP_MTS">SMP/MTS</SelectItem>
                            <SelectItem value="SMA_SMK_MA">
                              SMA/SMK/MA
                            </SelectItem>
                            <SelectItem value="PERGURUAN_TINGGI">
                              PERGURUAN TINGGI
                            </SelectItem>
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
                    defaultValue={statusSekolah} // Pastikan ini diisi dengan nilai dari database
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value} // Gunakan value dari field
                        onValueChange={(e) => {
                          onChange(e); // Update field dengan nilai baru
                          setStatusSekolah(e); // Update state lokal jika perlu
                        }} // Ganti onChange dengan onValueChange jika menggunakan Select dari library tertentu
                      >
                        <SelectTrigger>
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
                    defaultValue={statusPegawai} // Pastikan ini diisi dengan nilai dari database
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value} // Gunakan value dari field
                        onValueChange={(e) => {
                          onChange(e); // Update field dengan nilai baru
                          setStatusPegawai(e); // Update state lokal jika perlu
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Status Pegawai" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="PNS">PNS</SelectItem>
                            <SelectItem value="NON_PNS">NON_PNS</SelectItem>
                            <SelectItem value="PPPK">PPPK</SelectItem>
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
                    defaultValue={formattedTahunDiangkat} // Nilai default
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="date"
                        id="tahunDiangkat"
                        value={value || tahunDiangkat} // Sinkronkan dengan nilai state
                        onChange={(e) => {
                          const selectedDate = e.target.value; // Ambil nilai dari input
                          setTahunDiangkat(selectedDate); // Update state
                          onChange(selectedDate); // Update nilai form
                        }}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Label className="flex flex-col sm:flex-row items-start sm:items-center">
                    Pangkat Golongan
                    <span className="ml-0 sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-1 sm:mt-0">
                      *Bila Tidak Ada, Isi Tanda (-)
                    </span>
                  </Label>
                  <Input
                    className="mt-2 sm:mt-2"
                    type="text"
                    id="pangkatGolongan"
                    placeholder="Tuliskan Golongan"
                    value={pangkatGolongan}
                    onChange={(e) => setPangkatGolongan(e.target.value)}
                  />
                </div>

                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Pendidikan Terakhir
                  </Label>
                  <Controller
                    name="pendidikanTerakhir"
                    control={control}
                    defaultValue={pendidikanTerakhir} // Pastikan ini diisi dengan nilai dari database
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value} // Gunakan value dari field
                        onValueChange={(e) => {
                          onChange(e); // Update field dengan nilai baru
                          setPendidikanTerakhir(e); // Update state lokal jika perlu
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
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
                    defaultValue={sertifikatPendidik} // Pastikan ini diisi dengan nilai dari database
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value} // Gunakan value dari field
                        onValueChange={(e) => {
                          onChange(e); // Update field dengan nilai baru
                          setSertifikatPendidik(e); // Update state lokal jika perlu
                        }}
                      >
                        <SelectTrigger>
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
                    Mulai Jadi Anggota PGRI
                  </Label>
                  <Controller
                    name="mulaiJadiAnggotaPgri"
                    control={control}
                    defaultValue={formattedMulaiJadiAnggota} // Nilai default
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="date"
                        id="mulaiJadiAnggotaPgri"
                        value={value || formattedMulaiJadiAnggota} // Sinkronkan dengan nilai state
                        onChange={(e) => {
                          const selectedDate = e.target.value; // Ambil nilai dari input
                          setFormattedMulaiJadiAnggota(selectedDate); // Update state
                          onChange(selectedDate); // Update nilai form
                        }}
                      />
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
                    defaultValue={valueGolonganJabatan} // Nilai default
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value || valueGolonganJabatan} // Gunakan value dari form atau dari state
                        onValueChange={(e) => {
                          onChange(e); // Update nilai form
                          setValueGolonganJabatan(e); // Simpan golongan jabatan yang dipilih
                        }}
                      >
                        <SelectTrigger>
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
                        className="mt-2 sm:mt-2"
                        type="text"
                        id="mengajar"
                        placeholder="Mengajar"
                        value={value} // sesuaikan value agar dapat diatur oleh react-hook-form
                        onChange={(e) => {
                          setMengajar(e.target.value);
                          onChange(e.target.value); // pastikan onChange react-hook-form dipanggil
                        }}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
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
                              disabled={option.status} // Disabled jika sudah "Ya"
                              onChange={(e) => {
                                // Update opsi dan status checkbox
                                const newValue = e.target.checked
                                  ? [...value, option.label]
                                  : value.filter((val) => val !== option.label);

                                // Set status sesuai dengan apakah checkbox dicentang
                                option.setStatus(e.target.checked);
                                onChange(newValue); // Panggil onChange untuk react-hook-form
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 flex justify-between mt-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                  >
                    Kembali
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
