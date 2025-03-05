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
import { useRouter } from "next/navigation";
import {
  AiOutlineInfoCircle,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineWarning,
} from "react-icons/ai";
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const MapComponent = dynamic(() => import("../../_components/MapComponent"), {
  ssr: false,
});

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
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [namaAnak, setNamaAnak] = useState([]);
  const [step, setStep] = useState(2);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cabang, setCabang] = useState([]);
  const [jabatan, setJabatan] = useState([]);
  const [golonganJabatan, setGolonganJabatan] = useState([]);
  const [unitKerja, setUnitKerja] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [base64String, setBase64String] = useState("");
  const [today, setToday] = useState("");
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [searchTermUnitKerja, setSearchTermUnitKerja] = useState("");
  const [filteredUnitKerjaByCabang, setFilteredUnitKerjaByCabang] = useState(
    []
  );
  const [showDropdownUnitKerja, setShowDropdownUnitKerja] = useState(false);
  const [allUnitKerja, setAllUnitKerja] = useState([]);
  const dropdownRef = useRef(null);
  const dropdownRefUnitKerja = useRef(null);
  const [npaMessage, setNpaMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const jenisKelaminRef = useRef(null);
  const agamaRef = useRef(null);
  const golonganDarahRef = useRef(null);
  const tahunDiangkatRef = useRef(null);
  const pangkatGolonganRef = useRef(null);
  const jabatanRef = useRef();
  const tingkatSekolahRef = useRef();
  const statusSekolahRef = useRef();
  const statusPegawaiRef = useRef();
  const pendidikanTerakhirRef = useRef();
  const sertifikatPendidikRef = useRef();
  const golonganJabatanRef = useRef();
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const updateUnitKerja = (kecamatan) => {
    const filteredUnitKerja = unitKerja.filter((item) => {
      return item.cabang === kecamatan;
    });
    setFilteredUnitKerja(filteredUnitKerja);
  };

  useEffect(() => {
    if (!allUnitKerja.length) return;

    if (selectedCabang) {
      const filtered = allUnitKerja.filter(
        (unit) =>
          unit.cabang === selectedCabang &&
          unit.unitKerja
            .toLowerCase()
            .includes(searchTermUnitKerja.toLowerCase())
      );
      setFilteredUnitKerjaByCabang(filtered);
    } else {
      const filteredData = allUnitKerja.filter((item) =>
        item.unitKerja.toLowerCase().includes(searchTermUnitKerja.toLowerCase())
      );
      setFilteredUnitKerjaByCabang(filteredData);
    }
  }, [selectedCabang, searchTermUnitKerja, allUnitKerja]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setToday(currentDate);

    updateUnitKerja();
    setIsClient(true);
    fetchData();
    fetchJabatan();
    fetchGolonganJabatan();
  }, []);

  const fetchData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabang(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fetchJabatan = async () => {
    try {
      const response = await GlobalApi.getJabatan();
      setJabatan(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fetchGolonganJabatan = async () => {
    try {
      const response = await GlobalApi.getGolonganJabatan();
      setGolonganJabatan(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    const fetchUnitKerja = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setAllUnitKerja(response.data);
      } catch (error) {
        console.error("Gagal memuat data Unit Kerja", error);
      }
    };
    fetchUnitKerja();
  }, []);

  const filteredCabang = cabang.filter((item) =>
    item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGetLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLoading(false);
          // setNotification({
          //   type: 'success',
          //   message: `Lokasi berhasil didapatkan: (${position.coords.latitude}, ${position.coords.longitude})`
          // });
        },
        // () => {
        //   setNotification({
        //     type: 'error',
        //     message: `Gagal mendapatkan lokasi`
        //   });
        //   setLoading(false);
        // }
      );
    } else {
      setNotification({
        type: 'error',
        message: `Geolocation tidak tersedia di perangkat Anda`
      });
      setLoading(false);
    }
  };


  const handleNpaChange = async (e) => {
    const npaValue = e.target.value;

    setNpaMessage("");

    if (npaValue.length === 11) {
      try {
        const response = await GlobalApi.cekNpa(npaValue);

        if (response?.id) {
          setNpaMessage(
            <span style={{ color: "green" }}>
              Data Sudah Terdaftar Silakan{" "}
              <a
                href="/sign-in"
                style={{ textDecoration: "underline", color: "blue" }}
              >
                Login
              </a>
            </span>
          );
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setNpaMessage(<span style={{ color: "green" }}>Silakan Lanjutkan Pendaftaran Sanduka.</span>);
        } else {
          console.error("Error saat mengecek NPA:", error.message);
          setNpaMessage(<span style={{ color: "green" }}>Silakan Lanjutkan Pendaftaran Sanduka.</span>);
        }
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }

      if (
        dropdownRefUnitKerja.current &&
        !dropdownRefUnitKerja.current.contains(e.target)
      ) {
        setShowDropdownUnitKerja(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      setBase64String("");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    const compressedBase64 = await compressImage(file);
    setBase64String(compressedBase64);
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const image = new window.Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxWidth = 1024;
          const maxHeight = 1024;
          let width = image.width;
          let height = image.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(image, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

          resolve(compressedDataUrl);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (index, event) => {
    const newNamesAnak = [...namaAnak];
    newNamesAnak[index] = event.target.value;
    setNamaAnak(newNamesAnak);
    setValue("namaAnak", newNamesAnak); 
  };

  const handleAddInput = () => {
    const newNamesAnak = [...namaAnak, ""];
    setNamaAnak(newNamesAnak);
    setValue("namaAnak", newNamesAnak); 
  };

  const handleRemoveInput = (index) => {
    const newNamesAnak = namaAnak.filter((_, i) => i !== index);
    setNamaAnak(newNamesAnak);
    setValue("namaAnak", newNamesAnak); 
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {},
  });

  const handleNamaLengkapChange = (e) => {
    let input = e.target.value;

    const parts = input.split(/([.,])/);

    parts[0] = parts[0].toUpperCase();

    const formattedInput = parts.join('');

    setValue("namaLengkap", formattedInput);
  };

  const validateForm = (errors, formRefs) => {
    let isValid = true;

    for (const field in errors) {
      if (errors[field]) {
  
        const formattedField = field
          .replace(/([A-Z])/g, " $1") 
          .replace(/^./, (str) => str.toUpperCase()); 

        setNotification({
          type: 'error',
          message: `${formattedField} wajib diisi.`
        });

        if (formRefs[field]?.current) {
          formRefs[field].current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "Cabang" && dropdownRef.current) {
          dropdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "UnitKerja" && dropdownRefUnitKerja.current) {
          dropdownRefUnitKerja.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "Jabatan" && jabatanRef.current) {
          jabatanRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "TingkatSekolah" && tingkatSekolahRef.current) {
          tingkatSekolahRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "StatusSekolah" && statusSekolahRef.current) {
          statusSekolahRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "StatusPegawai" && statusPegawaiRef.current) {
          statusPegawaiRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "PangkatGolongan" && pangkatGolonganRef.current) {
          pangkatGolonganRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "PendidikanTerakhir" && pendidikanTerakhirRef.current) {
          pendidikanTerakhirRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "SertifikatPendidik" && sertifikatPendidikRef.current) {
          sertifikatPendidikRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        if (field === "GolonganJabatan" && golonganJabatanRef.current) {
          golonganJabatanRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        isValid = false;
        break;
      }
    }

    return isValid;
  };
  const formatDateToTanggalBulanTahun = (dateInput) => {
    if (!dateInput) return null;

    const bulanList = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    let dateObj;
    if (Array.isArray(dateInput)) {
      
      const [year, month, day] = dateInput;
      dateObj = new Date(year, month - 1, day); 
    } else if (typeof dateInput === "string") {
      
      dateObj = new Date(dateInput);
    } else {
      return null; 
    }

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = bulanList[dateObj.getMonth()]; 
    const year = dateObj.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const onSubmit = async (response) => {
    const isFormValid = validateForm();
    if (!isFormValid) return;
    setIsSubmitClicked(true);

    const cleanBase64 = base64String.split(",")[1] || base64String;

    const formattedTanggalLahir = response.tanggalLahir
      ? new Date(response.tanggalLahir).toISOString().split("T")[0] 
      : null;
    const formattedTahunDiangkat = response.tahunDiangkat
      ? new Date(response.tahunDiangkat).toISOString().split("T")[0]
      : null;
    const formattedMulaiJadiAnggotaPgri = response.mulaiJadiAnggotaPgri
      ? new Date(response.mulaiJadiAnggotaPgri).toISOString().split("T")[0]
      : null;

    const finalData = {
      id: response.id || null,
      email: response.email || "",
      password: response.password || "",
      npaPgri: response.npaPgri || "",
      nip: response.nip || "",
      nik: response.nik || "",
      namaLengkap: response.namaLengkap || "",
      tempatLahir: response.tempatLahir || "",
      tanggalLahir: formattedTanggalLahir,
      namaAnak: response.namaAnak || [],
      latitude: response.latitude || 0,
      longitude: response.longitude || 0,
      foto: cleanBase64,
      agama: response.agama || "",
      alamat: response.alamat || "",
      cabang: response.cabang || "",
      golonganDarah: response.golonganDarah || "",
      golonganJabatan: response.golonganJabatan || "",
      isVerified: response.isVerified || false,
      jabatan: response.jabatan || "",
      jenisKelamin: response.jenisKelamin || "",
      kodePos: response.kodePos || "",
      pangkatGolongan: response.pangkatGolongan || "",
      pendidikanTerakhir: response.pendidikanTerakhir || "",
      pesertaKtaDigital: response.pesertaKtaDigital || "",
      pesertaSanduka: response.pesertaSanduka || "",
      statusPegawai: response.statusPegawai || "",
      statusSekolah: response.statusSekolah || "",
      tingkatSekolah: response.tingkatSekolah || "",
      unitKerja: response.unitKerja || "",
      nomorHp: response.nomorHp || "",
      namaSuamiIstri: response.namaSuamiIstri || "",
      sertifikatPendidik: response.sertifikatPendidik || "",
      mengajar: response.mengajar || "",
      tahunDiangkat: formattedTahunDiangkat,
      mulaiJadiAnggotaPgri: formattedMulaiJadiAnggotaPgri,
    };
    console.log(finalData);
    handleCreateHistory();

    try {
      const apiResponse = await GlobalApi.registerUser(finalData);
      setNotification({
        type: 'success',
        message: (
          <>
            <strong
            >
              Selamat Anda Berhasil Mendaftar Di New Sanduka
            </strong> <br/>
            <span style={{ fontSize: "1.75rem" }}>
              Anda Berhasil Mendaftar Menjadi Anggota Sanduka
            </span>
          </>
        )
      });

      setTimeout(() => {
        router.push("/tunggu-admin");
      }, 2000);
    } catch (error) {
      if (error.response?.status === 500) {
        return;
      }

      const errorMessage =
        error.response?.data || "Terjadi kesalahan saat registrasi.";
      setNotification({
        type: 'error',
        message: `Anda Belum Berhasil Mendaftar`
      });
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleBackClick = () => {
    router.push("/anggota/data-anggota");
  };

  useEffect(() => {
    if (!router.isReady) return;
    const queryStep = parseInt(router.query?.step) || 2;
    setStep(queryStep);
  }, [router.isReady, router.query]);

  const nextStep = () => {
    if (!selectedFile) {
      setNotification({
        type: 'error',
        message: `Harap unggah foto sebelum melanjutkan`
      });
      return;
    }

    const validFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!validFormats.includes(selectedFile.type)) {
      setNotification({
        type: 'error',
        message: `Format file tidak didukung. Harap unggah file jpg, jpeg, atau png.`
      });
      return;
    }

    const email = watch("email");
    if (!email) {
      setNotification({
        type: 'error',
        message: `Email harus diisi.`
      });
      return;
    }

    const password = watch("password");
    if (!password) {
      setNotification({
        type: 'error',
        message: `Password harus diisi.`
      });
      return;
    }

    const npaPgri = watch("npaPgri");
    if (!npaPgri) {
      setNotification({
        type: 'error',
        message: `NPA PGRI harus diisi.`
      });
      return;
    }

    const nip = watch("nip");
    if (!nip) {
      setNotification({
        type: 'error',
        message: `NIP harus diisi.`
      });
      return;
    }

    const nik = watch("nik");
    if (!nik) {
      setNotification({
        type: 'error',
        message: `NIK harus diisi.`
      });
      return;
    }

    const namaLengkap = watch("namaLengkap");
    if (!namaLengkap) {
      setNotification({
        type: 'error',
        message: `Nama Lengkap harus diisi.`
      });
      return;
    }

    const tempatLahir = watch("tempatLahir");
    if (!tempatLahir) {
      setNotification({
        type: 'error',
        message: `Tempat Lahir harus diisi.`
      });
      return;
    }

    const tanggalLahir = watch("tanggalLahir");
    if (!tanggalLahir) {
      setNotification({
        type: 'error',
        message: `Tanggal Lahir harus diisi`
      });
      return;
    }

    if (!latitude || !longitude) {
      setNotification({
        type: 'error',
        message: `Harap Get Location terlebih dahulu.`
      });
      return;
    }

    if (errors.jenisKelamin) {
      jenisKelaminRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setNotification({
        type: 'error',
        message: `Jenis Kelamin harus diisi`
      });
      return;
    }

    if (errors.agama) {
      agamaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setNotification({
        type: 'error',
        message: `Agama harus diisi.`
      });
      return;
    }

    if (errors.golonganDarah) {
      golonganDarahRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setNotification({
        type: 'error',
        message: `Golongan darah harus diisi.`
      });
      return;
    }

    const kodePos = watch("kodePos");
    if (!kodePos) {
      setNotification({
        type: 'error',
        message: `Kode Pos harus diisi.`
      });
      return;
    }

    const nomorHp = watch("nomorHp");
    if (!nomorHp) {
      setNotification({
        type: 'error',
        message: `Nomor HP harus diisi.`
      });
      return;
    }

    const nextStepValue = step + 1;
    router.push(`/create-account?step=${nextStepValue}`);
    setStep(nextStepValue);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleNavigation = (stepNumber) => {
    setStep(stepNumber);
  };

  const handleCreateHistory = async () => {
    const now = new Date();

    const options = { weekday: "long" };
    const hari = now.toLocaleDateString("id-ID", options);
    const tanggal = now.toISOString().split("T")[0];
    const jam = now.toTimeString().split(" ")[0];

    const bulan = now.toLocaleString("id-ID", { month: "long" });
    const tahun = now.getFullYear();

    const npaPgri = watch("npaPgri");
    const namaLengkap = watch("namaLengkap");

    const historyData = {
      hari: hari,
      tanggal: tanggal,
      jam: jam,
      npa: npaPgri,
      nama: namaLengkap,
      cabang: selectedCabang,
      uraian: "Menjadi Anggota Sanduka",
      masuk: "Baru",
      keluar: "",
      bulan: bulan,
      tahun: tahun,
      cabang_ke_2: "",
      user: "",
    };

    try {
      const response = await GlobalApi.createHistoryData(historyData);
    } catch (error) {
      console.error("Failed to create history data:", error);
    }
  };

  return (
    <div className="w-full mx-auto py-6 bg-slate-200">
      <div className="w-full mx-auto overflow-x-auto">
        <div className="flex flex-row items-center justify-start space-x-2 sm:space-x-4 mb-2 whitespace-nowrap">
          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${step === 1
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
          // onClick={() => handleNavigation(1)}
          >
            1. SYARAT & KETENTUAN
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${step === 2
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
            onClick={() => handleNavigation(2)}
          >
            2. DATA PRIBADI
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${step === 3
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
            onClick={() => handleNavigation(3)}
          >
            3. DATA PEKERJAAN
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${step === 4
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
          // onClick={() => handleNavigation(4)}
          >
            4. MENUNGGU VERIFIKASI ADMIN
          </div>

          <hr className="border-t-2 border-gray-600 w-6 mx-2 sm:w-24 md:w-32 flex-shrink-0" />

          <div
            className={`py-2 px-4 rounded-full transition duration-300 text-sm flex-shrink-0 ${step === 5
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg transform scale-105"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer"
              }`}
          // onClick={() => handleNavigation(5)}
          >
            5. SELESAI
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-screen-lg sm:max-w-full md:max-w-screen-lg px-4">
        {notification && (
          <NotificationPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {step === 2 && (
          <div>
            <form
              onSubmit={handleSubmit(nextStep)}
              className="bg-white p-4 sm:p-8 rounded-lg shadow-lg"
            >
              <div className="w-full flex flex-col items-center">
                <img
                  width={150}
                  height={150}
                  className="border border-gray-300"
                  src={preview || "https://via.placeholder.com/100"}
                  alt="Photo Preview"
                />

                <input
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
                  *Wajib Menggunakan Batik PGRI
                </p>

                {error && (
                  <p className="text-red-600 text-center mt-2">{error}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    {/* <span className="text-red-500 text-xl">* </span> */}
                    Email
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Harap Diingat
                    </span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Email"
                    {...register("email", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm">
                      Email is required
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Password Login
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Harap Diingat
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="contoh:Kat45and!"
                      {...register("password", { required: true })}
                      className="border-teal-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible className="w-5 h-5 text-gray-500" />
                      ) : (
                        <AiOutlineEye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-sm">
                      Password is required
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    NPA PGRI
                    <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                      *Wajib Isi, NPA diawali dengan 332
                    </span>
                  </Label>
                  <Input
                    type="number"
                    id="npaPgri"
                    placeholder="Tuliskan NPA"
                    defaultValue="332"
                    {...register("npaPgri", { required: true })}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 11) {
                        handleNpaChange(e);
                        setNpaMessage("");
                      } else {
                        setNpaMessage("NPA maksimal hanya 11 angka.");
                      }
                    }}
                    className="border-teal-500"
                  />
                  {npaMessage && (
                    <p className="mt-2 text-sm text-red-500">{npaMessage}</p>
                  )}
                  {errors.npaPgri && (
                    <span className="text-red-500 text-sm">
                      NPA is required
                    </span>
                  )}
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
                    placeholder="Nomor Induk Pendidik ( NIP )"
                    {...register("nip", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.nip && (
                    <span className="text-red-500 text-sm">
                      NIP is required
                    </span>
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
                    {...register("nik", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.nik && (
                    <span className="text-red-500 text-sm">
                      NIK is required
                    </span>
                  )}
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
                    {...register("namaLengkap", { required: true })}
                    onChange={handleNamaLengkapChange}
                    className="border-teal-500"
                  />
                  {errors.namaLengkap && (
                    <span className="text-red-500 text-sm">
                      Nama Lengkap is required
                    </span>
                  )}
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
                    {...register("tempatLahir", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.tempatLahir && (
                    <span className="text-red-500 text-sm">
                      Tempat Lahir is required
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
                    Tanggal Lahir
                  </Label>
                  <Input
                    type="date"
                    id="tanggalLahir"
                    placeholder="dd/mm/yyyy"
                    max={today}
                    {...register("tanggalLahir", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.tanggalLahir && (
                    <span className="text-red-500 text-sm">
                      Tanggal Lahir is required
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="w-full" ref={jenisKelaminRef}>
                  <Label className="block text-sm font-medium mb-3">
                    Jenis Kelamin
                  </Label>
                  <Controller
                    name="jenisKelamin"
                    control={control}
                    rules={{ required: "Jenis Kelamin is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={`border ${errors.jenisKelamin
                            ? "border-red-500"
                            : "border-teal-500"
                            } focus:ring-teal-500`}
                        >
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="LAKI_LAKI">
                              Laki - Laki
                            </SelectItem>
                            <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.jenisKelamin && (
                    <span className="text-red-500 text-sm">
                      Jenis Kelamin is required
                    </span>
                  )}
                </div>
                <div className="w-full" ref={agamaRef}>
                  <Label className="block text-sm font-medium mb-3">
                    Agama
                  </Label>
                  <Controller
                    name="agama"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={`border ${errors.agama ? "border-red-500" : "border-teal-500"
                            } focus:ring-teal-500`}
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
                  {errors.agama && (
                    <span className="text-red-500 text-sm">
                      Agama is required
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="w-full" ref={golonganDarahRef}>
                  <Label className="block text-sm font-medium mb-3">
                    Golongan Darah
                  </Label>
                  <Controller
                    name="golonganDarah"
                    control={control}
                    rules={{ required: "Golongan Darah is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={`border ${errors.golonganDarah
                            ? "border-red-500"
                            : "border-teal-500"
                            } focus:ring-teal-500`}
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
                  {errors.golonganDarah && (
                    <span className="text-red-500 text-sm">
                      Golongan Darah is required
                    </span>
                  )}
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
                          className="border-teal-500"
                          placeholder="JL. RT.  RW.  Desa, Kecamatan, Kabupaten"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="p-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                    >
                      {loading ? "Mendapatkan Lokasi..." : "Get Location"}
                    </button>

                    <p className="text-red-500">{!latitude && !longitude}</p>

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
                    {...register("kodePos", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.kodePos && (
                    <span className="text-red-500 text-sm">
                      Kode Pos is required
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3 sm:flex  sm:items-center">
                    Nomor Handphone
                    <span className="ml-0 sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-2 sm:mt-0 block">
                      *Tertaut Akun Whatsapp
                    </span>
                  </Label>
                  <Input
                    type="number"
                    id="nomorHp"
                    placeholder="Nomor Handphone Aktif"
                    {...register("nomorHp", { required: true })}
                    className="border-teal-500"
                  />
                  {errors.nomorHp && (
                    <span className="text-red-500 text-sm">
                      Nomor Handphone is required
                    </span>
                  )}
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
                    {...register("namaSuamiIstri")}
                    className="border-teal-500"
                  />
                  {errors.namaSuamiIstri && (
                    <span className="text-red-500 text-sm">
                      Nama Suami is required
                    </span>
                  )}
                </div>
                <div className="w-full">
                  {namaAnak.map((name, index) => (
                    <div key={index} className="mb-3 flex items-center">
                      <div className="flex-1">
                        <Label className="block text-sm font-medium mb-1">
                          Nama Anak {index + 1}
                        </Label>
                        <Input
                          className="block w-full text-sm p-2 mt-2 mb-2 border-teal-500 rounded"
                          type="text"
                          placeholder={`Tuliskan Nama Anak ${index + 1}`}
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
              <div className="col-span-1 sm:col-span-2 flex justify-between mt-4">
                <Button
                  type="button"
                  className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                  onClick={handleBackClick}
                >
                  Kembali
                </Button>
                <Button onClick={nextStep}>Next</Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg"
            >
              <div className="w-full" ref={dropdownRef}>
                <Label className="block text-sm font-medium mb-3">
                  Cabang
                  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                    *Isi Sesuai Tempat Tugas
                  </span>
                </Label>
                <Controller
                  name="cabang"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="relative" ref={dropdownRef}>
                      <Input
                        type="text"
                        value={selectedCabang || field.value}
                        onClick={() => setShowDropdown((prev) => !prev)}
                        readOnly
                        className="w-full p-2 border-teal-500 rounded focus:outline-none"
                        placeholder="Pilih Cabang"
                      />

                      {showDropdown && (
                        <div className="mt-1 max-h-40 overflow-y-auto border p-2 rounded absolute z-10 bg-slate-200 w-full">
                          <div className="px-1">
                            <Input
                              type="text"
                              placeholder="Cari Cabang..."
                              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                            />
                          </div>

                          {filteredCabang.length > 0 ? (
                            filteredCabang
                              .filter((item) =>
                                item.kecamatan
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                              )
                              .map((item) => (
                                <div
                                  key={item.idKecamatan}
                                  className="cursor-pointer p-2 hover:bg-slate-100 mt-2"
                                  onClick={() => {
                                    setSelectedCabang(item.kecamatan);
                                    field.onChange(item.kecamatan);
                                    setShowDropdown(false);
                                    setSearchTerm("");
                                  }}
                                >
                                  {item.kecamatan}
                                </div>
                              ))
                          ) : (
                            <div className="p-2">Cabang tidak ditemukan</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />

                {errors.cabang && (
                  <span className="text-red-500 text-sm">
                    Kecamatan/Cabang harus dipilih
                  </span>
                )}
              </div>

              <div className="w-full" ref={dropdownRefUnitKerja}>
                <label className="block text-sm font-medium mb-3">
                  Unit Kerja
                </label>
                <Controller
                  name="unitKerja"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        type="text"
                        value={selectedUnitKerja || field.value}
                        onClick={() => setShowDropdownUnitKerja(true)}
                        readOnly
                        className="w-full p-2 border-teal-500 rounded focus:outline-none"
                        placeholder="Pilih Unit Kerja"
                      />

                      {showDropdownUnitKerja && (
                        <div
                          ref={dropdownRef}
                          className="mt-1 max-h-40 overflow-y-auto border p-2 rounded absolute z-10 bg-slate-200 w-full"
                        >
                          <Input
                            type="text"
                            placeholder="Cari Unit Kerja..."
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={searchTermUnitKerja}
                            onChange={(e) =>
                              setSearchTermUnitKerja(e.target.value)
                            }
                            autoFocus
                          />

                          {filteredUnitKerjaByCabang.map((item) => (
                            <div
                              key={item.id}
                              className="cursor-pointer p-2 hover:bg-slate-100 mt-2"
                              onClick={() => {
                                setSelectedUnitKerja(item.unitKerja);
                                setShowDropdownUnitKerja(false);
                                field.onChange(item.unitKerja);
                                setSearchTermUnitKerja("");
                              }}
                            >
                              {item.unitKerja}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                />

                {errors.unitKerja && (
                  <span className="text-red-500 text-sm">
                    Unit Kerja harus dipilih
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Jabatan
                </Label>
                <Controller
                  name="jabatan"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={jabatanRef}
                      >
                        <SelectValue placeholder="Pilih Jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {jabatan.map((item) => (
                            <SelectItem key={item.id} value={item.jabatan}>
                              {item.jabatan}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.jabatan && (
                  <span className="text-red-500 text-sm">
                    Jabatan is required
                  </span>
                )}
              </div>
              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Tingkat Sekolah
                </Label>
                <Controller
                  name="tingkatSekolah"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={tingkatSekolahRef}
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
                {errors.tingkatSekolah && (
                  <span className="text-red-500 text-sm">
                    Tingkat Sekolah is required
                  </span>
                )}
              </div>
              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Status Sekolah
                </Label>
                <Controller
                  name="statusSekolah"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={statusSekolahRef}
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
                {errors.statusSekolah && (
                  <span className="text-red-500 text-sm">
                    Status Sekolah is required
                  </span>
                )}
              </div>
              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Status Pegawai
                </Label>
                <Controller
                  name="statusPegawai"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={statusPegawaiRef}
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
                {errors.statusPegawai && (
                  <span className="text-red-500 text-sm">
                    Status Pegawai is required
                  </span>
                )}
              </div>

              <div className="w-full" ref={tahunDiangkatRef}>
                <Label className="block text-sm font-medium mb-3">
                  Tahun Diangkat PNS/P3K/GTT/GTY
                </Label>
                <Input
                  type="date"
                  id="tahunDiangkat"
                  placeholder="dd/mm/yyyy"
                  {...register("tahunDiangkat", { required: true })}
                  className="border-teal-500"
                />
                {errors.tahunDiangkat && (
                  <span className="text-red-500 text-sm">Wajib Diisi</span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Pangkat Golongan
                </Label>
                <Controller
                  name="pangkatGolongan"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={pangkatGolonganRef}
                      >
                        <SelectValue placeholder="Pilih Golongan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {golonganJabatan.map((item) => (
                            <SelectItem key={item.id} value={item.golongan}>
                              {item.golongan}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.pangkatGolongan && (
                  <span className="text-red-500 text-sm">
                    Pangkat Golongan is required
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Pendidikan Terakhir
                </Label>
                <Controller
                  name="pendidikanTerakhir"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={pendidikanTerakhirRef}
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
                {errors.pendidikanTerakhir && (
                  <span className="text-red-500 text-sm">
                    Pendidikan Terakhir is required
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Sertifikat Pendidik
                </Label>
                <Controller
                  name="sertifikatPendidik"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={sertifikatPendidikRef}
                      >
                        <SelectValue placeholder="Pilih Sertifikat" />
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
                {errors.sertifikatPendidik && (
                  <span className="text-red-500 text-sm">
                    Sertifikat Pendidik is required
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Golongan Jabatan
                </Label>
                <Controller
                  name="golonganJabatan"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="border border-teal-500"
                        ref={golonganJabatanRef}
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
                {errors.golonganJabatan && (
                  <span className="text-red-500 text-sm">
                    Pangkat/Golongan is required
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Mengajar
                  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                    *Mata Pelajaran
                  </span>
                </Label>
                <Input
                  className="mt-2 sm:mt-2 border-teal-500"
                  type="text"
                  id="mengajar"
                  placeholder="Mengajar"
                  {...register("mengajar", { required: true })}
                />
                {errors.mengajar && (
                  <span className="text-red-500 text-sm">
                    Mengajar is required
                  </span>
                )}
              </div>
              <div className="w-full">
                <Input
                  type="hidden"
                  id="mulaiJadiAnggotaPgri"
                  value={today}
                  {...register("mulaiJadiAnggotaPgri")}
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
                  type="button"
                  onClick={() => {
                    if (isSubmitClicked) {
                      const isValid = validateForm(errors, {
                        jabatan: jabatanRef,
                        pangkatGolongan: pangkatGolonganRef,
                        tingkatSekolah: tingkatSekolahRef,
                        statusSekolah: statusSekolahRef,
                        statusPegawai: statusPegawaiRef,
                        pangkatGolongan: pangkatGolonganRef,
                        tahunDiangkat: tahunDiangkatRef,
                        pendidikanTerakhir: pendidikanTerakhirRef,
                        sertifikatPendidik: sertifikatPendidikRef,
                        golonganJabatan: golonganJabatanRef,
                        cabang: dropdownRef,
                        unitKerja: dropdownRefUnitKerja,
                      });

                      if (isValid) {
                        setNotification({
                          type: "success",
                          message: "Form sudah lengkap!",
                        });
                      } else {
                        setNotification({
                          type: "error",
                          message: "Form masih ada yang belum valid!",
                        });
                      }
                    } else {
                      setNotification({
                        type: "error",
                        message: "Klik Submit terlebih dahulu!",
                      });
                    }
                  }}
                  className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                  disabled={!isSubmitClicked}
                >
                  <AiOutlineWarning className="h-5 w-5 mr-2 text-yellow-400" />
                  Belum Terisi
                </Button>

                <Button
                  type="submit"
                  onClick={onSubmit}
                  className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
                >
                 Submit
                </Button>
              </div>
            </form>
          </div>
        )
        }
      </div >
    </div >
  );
};

export default Page;
