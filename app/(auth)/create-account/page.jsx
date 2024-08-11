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

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import("../../_components/MapComponent"), {
  ssr: false,
});

const Page = () => {
  // State for maps
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handler to get current location
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

  // State for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  // State for dynamic input fields
  const [namesanak, setNamesanak] = useState([""]);
  const handleChange = (index, event) => {
    const newNamesanak = [...namesanak];
    newNamesanak[index] = event.target.value;
    setNamesanak(newNamesanak);
  };

  const handleAddInput = () => {
    setNamesanak([...namesanak, ""]);
  };

  const handleRemoveInput = (index) => {
    const newNamesanak = namesanak.filter((_, i) => i !== index);
    setNamesanak(newNamesanak);
  };

  // Form state
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    clearErrors,
  } = useForm({
    defaultValues: {
      jenisKelamin: "",
    },
  });

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      namesanak: namesanak.filter((name) => name.trim() !== ""),
      latitude,
      longitude,
    };
    console.log(finalData);
    // Send finalData to the database
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="container mx-auto max-w-screen-lg sm:max-w-full md:max-w-screen-lg px-4">
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
                  id="photo-upload"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
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
                    type="number"
                    id="npa"
                    placeholder="Tuliskan NPA"
                    {...register("npa")}
                  />
                  {errors.npa && (
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
                    id="nama"
                    placeholder="Sesuai Dengan KTP"
                    {...register("nama", { required: true })}
                  />
                  {errors.nama && (
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
                    id="tglLahir"
                    placeholder="dd/mm/yyyy"
                    {...register("tglLahir", { required: true })}
                  />
                  {errors.tglLahir && (
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
                            <SelectItem value="laki-laki">
                              Laki - Laki
                            </SelectItem>
                            <SelectItem value="perempuan">Perempuan</SelectItem>
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
                            <SelectItem value="islam">Islam</SelectItem>
                            <SelectItem value="kristen">Kristen</SelectItem>
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
                    name="darah"
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
                            <SelectItem value="a">A</SelectItem>
                            <SelectItem value="b">B</SelectItem>
                            <SelectItem value="ab">AB</SelectItem>
                            <SelectItem value="o">O</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.darah && (
                    <span className="text-red-500 text-sm">
                      Golongan Darah is required
                    </span>
                  )}
                </div>
                <div>
                  <div className="w-full ">
                    <Label className="block text-sm font-medium mb-3">
                      Alamat
                      <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                        *Sesuai Dengan KTP
                      </span>
                    </Label>
                    <Controller
                      name="alamat"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Textarea
                          placeholder="JL. RT.  RW.  Desa, Kecamatan, Kabupaten"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.alamat && (
                      <span className="text-red-500 text-sm">
                        Alamat is required
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    className="mt-2 p-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                  >
                    {loading ? "Mendapatkan Lokasi..." : "Get Location"}
                  </Button>
                  {error && (
                    <span className="text-red-500 text-sm mt-2">{error}</span>
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
                    id="noHP"
                    placeholder="Nomor Handphone Aktif"
                    {...register("noHP", { required: true })}
                  />
                  {errors.noHP && (
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
                    id="namaSuami"
                    placeholder=" Nama Suami/Istri"
                    {...register("namaSuami")}
                  />
                  {errors.namaSuami && (
                    <span className="text-red-500 text-sm">
                      Nama Suami is required
                    </span>
                  )}
                </div>
                <div className="w-full">
                  {namesanak.map((name, index) => (
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
                <Label className="flex flex-col sm:flex-row items-start sm:items-center">
                  Cabang
                  <span className="ml-0 sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-1 sm:mt-0 mb-2 sm:mb-2">
                    *Isi Sesuai Tempat Tugas
                  </span>
                </Label>
                <Controller
                  name="cabang"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Aceh">Aceh</SelectItem>
                          <SelectItem value="Bali">Bali</SelectItem>
                          <SelectItem value="banten">Banten</SelectItem>
                          <SelectItem value="jambi">Jambi</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cabang && (
                  <span className="text-red-500 text-sm">
                    Kecamatan/Cabang is required
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Unit Kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Aceh">-- Unit Kerja --</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unitKerja && (
                  <span className="text-red-500 text-sm">
                    Unit Kerja is required
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
                          <SelectItem value="kepalaSekolah">
                            Kepala Sekolah
                          </SelectItem>
                          <SelectItem value="guru">Guru</SelectItem>
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
                          <SelectItem value="sd">SD/MI</SelectItem>
                          <SelectItem value="tk">TK/RA</SelectItem>
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
                          <SelectItem value="swasta">Swasta</SelectItem>
                          <SelectItem value="negeri">Negeri</SelectItem>
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
                          <SelectItem value="pns">ASN PNS</SelectItem>
                          <SelectItem value="pppk">ASN PPPK</SelectItem>
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
                  id="tmt"
                  placeholder="dd/mm/yyyy"
                  {...register("tmt", { required: true })}
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
                  id="golongan"
                  placeholder="Tuliskan Golongan"
                  {...register("golongan", { required: true })}
                />
                {errors.golongan && (
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
                  name="ijazah"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Pendidikan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="s1">S1</SelectItem>
                          <SelectItem value="s2">S2</SelectItem>
                          <SelectItem value="d3">D3</SelectItem>
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
                  name="sertifikat"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sertifikat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="sudah">Sudah</SelectItem>
                          <SelectItem value="belum">Belum</SelectItem>
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
                  id="mulaiJadiAnggota"
                  placeholder="dd/mm/yyyy"
                  {...register("mulaiJadiAnggota", { required: true })}
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
                  name="golongan"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Golongan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="pendidik">Pendidik</SelectItem>
                          <SelectItem value="tenagaKependidikan">
                            Tenaga kependidikan
                          </SelectItem>
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
                </Label>
                <span className="ml-0 sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-1 sm:mt-0">
                  *Mata Pelajaran
                </span>
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
