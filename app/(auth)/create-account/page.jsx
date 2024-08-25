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
import { useRouter } from "next/navigation";

const MapComponent = dynamic(() => import("../../_components/MapComponent"), {
  ssr: false,
});

const Page = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [namaAnak, setNamesanak] = useState([""]);
  const [step, setStep] = useState(1);
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

  const updateUnitKerja = (kecamatan) => {
    const filteredUnitKerja = unitKerja.filter((item) => {
      return item.cabang === kecamatan;
    });
    setFilteredUnitKerja(filteredUnitKerja);
  };

  const handleCabangChange = (value) => {
    setSelectedCabang(value);
    updateUnitKerja(value);
  };

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setToday(currentDate);

    updateUnitKerja();
    setIsClient(true);
    fetchData();
    fetchJabatan();
    fetchGolonganJabatan();
    fetchUnitKerja();
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

  const fetchUnitKerja = async () => {
    try {
      const response = await GlobalApi.getUnitKerja();
      setUnitKerja(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

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

  const handleChange = (index, event) => {
    const newNamesanak = [...namaAnak];
    newNamesanak[index] = event.target.value;
    setNamesanak(newNamesanak);
  };

  const handleAddInput = () => {
    setNamesanak([...namaAnak, ""]);
  };

  const handleRemoveInput = (index) => {
    const newNamesanak = namaAnak.filter((_, i) => i !== index);
    setNamesanak(newNamesanak);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      jenisKelamin: "",
    },
  });

  const onSubmit = async (data) => {
    const formattedTanggalLahir = new Date(data.tanggalLahir)
      .toISOString()
      .split("T")[0];
    const formattedTahunDiangkat = new Date(data.tahunDiangkat)
      .toISOString()
      .split("T")[0];
    const formattedMulaiJadiAnggota = new Date(data.mulaiJadiAnggotaPgri)
      .toISOString()
      .split("T")[0];
    const finalData = {
      ...data,
      tanggalLahir: formattedTanggalLahir,
      tahunDiangkat: formattedTahunDiangkat,
      mulaiJadiAnggotaPgri: formattedMulaiJadiAnggota,
      namaAnak: namaAnak.filter((name) => name.trim() !== ""),
      latitude,
      longitude,
      foto: base64String,
    };

    try {
      const response = await GlobalApi.registerUser(finalData);
      toast.success("Anda Berhasil Mendaftar Menjadi Anggota Sanduka");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error) {
      toast.error("Anda Tidak Berhasil Mendaftar Menjadi Anggota Sanduka");
    }
  };

  const nextStep = () => {
    if (!selectedFile) {
      setError("Harap unggah gambar sebelum melanjutkan.");
      return;
    }

    setStep(step + 1);
    setError("");
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="container mx-auto max-w-screen-lg sm:max-w-full md:max-w-screen-lg px-4">
        <Toaster />
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-xl text-gray-600">
              I. DATA PRIBADI
            </h2>
            <hr className="mb-6 border-t-2 border-gray-300 mt-4" />
            <form
              onSubmit={handleSubmit(nextStep)}
              className="bg-white p-4 sm:p-8 rounded-lg shadow-lg"
            >
              <div className="w-full flex flex-col items-center space-y-4 mt-4">
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
                  className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-center"
                >
                  Choose Files
                </label>
                <p className="text-red-600 font-bold text-center">
                  *Wajib Menggunakan Batik PGRI
                </p>
                <p className="text-red-600 text-center">
                  *Maksimal ukuran file unggah 250kb format file (jpg, jpeg,
                  png)
                </p>
                {error && (
                  <p className="text-red-600 text-center mt-2">{error}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="w-full">
                  <Label className="block text-sm font-medium mb-3">
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
                  <Input
                    type="password"
                    id="password"
                    placeholder="contoh:Kat45and!"
                    {...register("password", { required: true })}
                  />
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
                      *Wajib Isi
                    </span>
                  </Label>
                  <Input
                    type="text"
                    id="npaPgri"
                    placeholder="Tuliskan NPA"
                    {...register("npaPgri")}
                  />
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
                      *Wajib Isi
                    </span>
                  </Label>
                  <Input
                    type="number"
                    id="nip"
                    placeholder="Nomor Induk Pendidik ( NIP )"
                    {...register("nip", { required: true })}
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
                  />
                  {errors.tanggalLahir && (
                    <span className="text-red-500 text-sm">
                      Tanggal Lahir is required
                    </span>
                  )}
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
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
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
                <div className="w-full">
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
                  {errors.agama && (
                    <span className="text-red-500 text-sm">
                      Agama is required
                    </span>
                  )}
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
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                          placeholder="JL. RT.  RW.  Desa, Kecamatan, Kabupaten"
                          value={field.value}
                          onChange={field.onChange}
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
                          className="block w-full text-sm p-2 mt-2 mb-2 border rounded"
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
              <div className="w-full flex justify-end mt-8">
                <Button type="submit">Next</Button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-screen-lg mx-auto px-4 py-6">
            <h2 className="font-semibold text-xl text-gray-600 mb-4">
              II. DATA PEKERJAAN
            </h2>
            <hr className="mb-6 border-t-2 border-gray-300" />
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg"
            >
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
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCabangChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {cabang.map((item) => (
                            <SelectItem
                              key={item.idKecamatan}
                              value={item.kecamatan}
                            >
                              {item.kecamatan}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cabang && (
                  <span className="text-red-500 text-sm">
                    Kecamatan/Cabang harus dipilih
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Unit Kerja
                </Label>
                <Controller
                  name="unitKerja"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedCabang}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Unit Kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {filteredUnitKerja.map((item) => (
                            <SelectItem key={item.id} value={item.unitKerja}>
                              {item.unitKerja}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenjang Sekolah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="PAUD">PAUD</SelectItem>
                          <SelectItem value="TK_RA">TK/RA</SelectItem>
                          <SelectItem value="SD_MI">SD/MI</SelectItem>
                          <SelectItem value="SMP_MTS">SMP/MTS</SelectItem>
                          <SelectItem value="SMA_SMK_MA">SMA/SMK/MA</SelectItem>
                          <SelectItem value="PERGURUAN_TINGGI">
                            PERGURUAN TINGGI
                          </SelectItem>
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
                {errors.statusPegawai && (
                  <span className="text-red-500 text-sm">
                    Status Pegawai is required
                  </span>
                )}
              </div>
              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Tahun Diangkat PNS/P3K/GTT/GTY
                </Label>
                <Input
                  type="date"
                  id="tahunDiangkat"
                  placeholder="dd/mm/yyyy"
                  max={today}
                  {...register("tahunDiangkat", { required: true })}
                />
                {errors.tmt && (
                  <span className="text-red-500 text-sm">TMT is required</span>
                )}
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
                  {...register("pangkatGolongan", { required: true })}
                />
                {errors.pangkatGolongan && (
                  <span className="text-red-500 text-sm">
                    Pangkat/Golongan is required
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
                {errors.ijazah && (
                  <span className="text-red-500 text-sm">
                    Ijazah is required
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
                {errors.sertifikat && (
                  <span className="text-red-500 text-sm">
                    Sertifikat Pendidik is required
                  </span>
                )}
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium mb-3">
                  Mulai Jadi Anggota PGRI
                </Label>
                <Input
                  type="date"
                  id="mulaiJadiAnggotaPgri"
                  placeholder="dd/mm/yyyy"
                  max={today}
                  {...register("mulaiJadiAnggotaPgri", { required: true })}
                />
                {errors.mulaiJadianggota && (
                  <span className="text-red-500 text-sm">
                    Mulai jadi anggota PGRI is required
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
                      <SelectTrigger>
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
                {errors.golongan && (
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
                  className="mt-2 sm:mt-2"
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
                  Submit
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
