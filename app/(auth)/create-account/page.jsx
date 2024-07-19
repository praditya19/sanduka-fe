"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Alert, AlertDescription } from "@/components/ui/alert";

const Page = () => {
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen p-4 sm:p-3 bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto max-w-screen-lg sm:max-w-full md:max-w-screen-lg px-4">
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-xl text-gray-600">
              I. DATA PRIBADI
            </h2>
            <hr className="mb-6 border-t-2 border-gray-300 mt-4" />
            <form
              onSubmit={handleSubmit(nextStep)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg"
            >
              <div className="w-full items-center gap-1.5"> 
                <Label
                  className="block text-sm font-medium mb-3">
                  Email
                  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Harap Diingat
                </span>
                </Label>
                <Input type="email" id="email" placeholder="Email" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label
                  className="block text-sm font-medium mb-3">
                  Password Login
                  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Harap Diingat
                </span>
                </Label>
                <Input type="password" id="password" placeholder="contoh:Kat45and!" />
              </div>
              <div className="w-full items-center gap-1.5"> 
              <Label className="block text-sm font-medium mb-3">Unit Kerja</Label>
                <Select>
                  <SelectTrigger >
                    <SelectValue placeholder="Pilih Unit Kerja" />
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
              </div>
              <div className="w-full items-center gap-1.5">
                <Label className="flex flex-col sm:flex-row sm:items-center mb-2">
                  NPA Lama
                  <span className=" sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-1 sm:mt-0">
                  *Tidak Wajib (Hanya Yang Sudah Memilik KTA)
                </span>
                </Label>
                <Input type="number" placeholder="Tuliskan NPA Lama" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">NIK
                <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *16 Digit
                </span>
              </Label>
              <Input type="number" placeholder="16 Digit" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Nama Lengkap  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Bisa Ditambahkan Gelar
                </span></Label>
              <Input type="text" placeholder="Bisa Ditambahkan Gelar" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Tempat Lahir</Label>
              <Input type="text" placeholder="Tuliskan Tempat Kelahiran" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Tanggal Lahir</Label>
                <Input type="date" placeholder="dd/mm/yyyy" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Jenis Kelamin</Label>
                <Select>
                  <SelectTrigger >
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="laki-laki">Laki - Laki</SelectItem>
                      <SelectItem value="perempuan">Perempuan</SelectItem>
                    </SelectGroup>  
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Agama</Label>
                <Select>
                  <SelectTrigger >
                    <SelectValue placeholder="Pilih Agama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="kristen">Kristen</SelectItem>
                    </SelectGroup>  
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Golongan Darah</Label>
                <Select>
                  <SelectTrigger >
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
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label className="block text-sm font-medium mb-3">Alamat  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Sesuai KTP
                </span></Label>
                <Textarea placeholder="Tuliskan Alamat Sesuai KTP" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Kode Pos  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Sesuai KTP
                </span></Label>
                <Input type="number" placeholder="Tuliskan Kode Pos" />
              </div>
              <div className="w-full items-center gap-1.5"> 
                <Label className="block text-sm font-medium mb-3">Nomor Handphone  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Tertaut Akun Whatsapp
                </span></Label>
                <Input type="number" placeholder="Tuliskan Nomor Handphone Aktif" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Alert variant="destructive" className="w-full">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>Pastikan anda mengisi semua form, jika terdapat form isian pendaftaran yang terlewatkan maka anda tidak dapat menekan tombol simpan!</AlertDescription>
                </Alert>
              </div>
            </form>
          </div>
        )}
        {step === 2 && (
  <div>
    <h2 className="font-semibold text-xl text-gray-600">
      II. DATA PEKERJAAN
    </h2>
    <hr className="mb-6 border-t-2 border-gray-300 mt-4" />
    <form
      onSubmit={handleSubmit(nextStep)}
      className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg"
    >
              <div className="w-full items-center gap-1.5">
              <Label className="block text-sm font-medium mb-3">
                  Provinsi/DI
                  <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Isi Sesuai Tempat Tugas
                </span>
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Provinsi" />
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
        {/* <Label>Nama Kantor</Label>
        <Input type="text" placeholder="Tuliskan Nama Kantor" className="w-full" /> */}
      </div>
      <div className="w-full items-center gap-1.5">
  <Label className="flex flex-col sm:flex-row sm:items-center mb-2">
    Kabupaten/Kota/Kota Administrasi
    <span className="sm:ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md mt-1 sm:mt-0">
      *Isi Sesuai Tempat Tugas
    </span>
  </Label>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Pilih Kabupaten/Kota" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="Aceh">Aceh</SelectItem>
        <SelectItem value="Bali">Bali</SelectItem>
        <SelectItem value="Banten">Banten</SelectItem>
        <SelectItem value="Jambi">Jambi</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</div>

      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
      Kecamatan/Cabang<span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Isi Sesuai Tempat Tugas
                </span>
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Provinsi" />
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
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
      Desa/kelurahan<span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Isi Sesuai Tempat Tugas
                </span>
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Provinsi" />
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
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              Pekerjaan
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Pekerjaan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="guru">Guru</SelectItem>
          <SelectItem value="tenagaAdmin">Tenaga Administrasi</SelectItem>
          <SelectItem value="dosen">Dosen</SelectItem>
          <SelectItem value="pengawas">Pengawas</SelectItem>
        </SelectGroup>  
      </SelectContent>
    </Select> 
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              Status Pegawai
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Status Pegawai" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="pns">ASN PNS</SelectItem>
          <SelectItem value="pppk">ASN PPPK</SelectItem>
        </SelectGroup>  
      </SelectContent>
    </Select> 
      </div>
      
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              Pendidikan/Ijazah Terakhir
              
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Pendidikan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="pns">S1</SelectItem>
          <SelectItem value="pppk">S2</SelectItem>
          <SelectItem value="pppk">D3</SelectItem>
        </SelectGroup>  
      </SelectContent>
    </Select> 
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
      Pangkat/Golongan<span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
      *Bila Tidak Ada, Isi Tanda (-)
                </span>
                </Label>
                <Input
                  type="text"
                  placeholder="Tuliskan Pangkat/Golongan"
                />
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              Mata Pelajaran
                </Label>
                <Input
                  type="text"
                  placeholder="Tuliskan Mata Pelajaran"
                />
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              kelompok Jabatan
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Pendidikan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="pns">Pendidik</SelectItem>
          <SelectItem value="pppk">Tenaga Kependidikan</SelectItem>
        </SelectGroup>  
      </SelectContent>
    </Select> 
              </div>
              <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              Sertifikat Pendidik
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Status Pegawai" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="pns">Sudah</SelectItem>
          <SelectItem value="pppk">Bleum</SelectItem>
        </SelectGroup>  
      </SelectContent>
    </Select> 
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
              Jenjang Mengajar
                </Label>
                <Select>
      <SelectTrigger >
        <SelectValue placeholder="Pilih Jenjang Mengajar" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="pns">PAUD</SelectItem>
          <SelectItem value="pppk">TK</SelectItem>
        </SelectGroup>  
      </SelectContent>
    </Select> 
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
                  Nama Instansi <span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Tempat Tugas
                </span>
                </Label>
                <Input
                  type="text"
                  placeholder="Tuliskan Nama Tempat Tugas"
                />
      </div>
      <div className="w-full items-center gap-1.5">
      <Label className="block text-sm font-medium mb-3">
                  Alamat<span className="ml-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-md">
                  *Isi Sesuai Tempat Tugas
                </span>
                </Label>
                <Textarea placeholder="Tuliskan Alamat Tempat Tugas" />
      </div>
      <div className="col-span-1 sm:col-span-2">
        <button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
        >
          Selanjutnya
        </button>
      </div>
      <div className="col-span-1 sm:col-span-2">
        <button
          type="button"
          onClick={prevStep}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Kembali
        </button>
      </div>
      <div className="col-span-1 sm:col-span-2">
        <Alert variant="destructive" className="w-full">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>Pastikan anda mengisi semua form, jika terdapat form isian pendaftaran yang terlewatkan maka anda tidak dapat menekan tombol simpan!</AlertDescription>
        </Alert>
      </div>
    </form>
  </div>
)}

        {step === 3 && (
          <div>
            <h2 className="font-semibold text-xl text-gray-600">
              III. UPLOAD FILE
            </h2>
            <hr className="mb-6 border-t-2 border-gray-300 mt-4" />
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg"
            >
              <div className="w-full items-center gap-1.5">
              <Label className="block text-sm font-medium mb-3">
              Nama Suami/Istri

                </Label>
                <Input
                  type="text"
                  placeholder="Tuliskan Nama Suami/Istri"
                />
              </div>
              <div className="w-full items-center gap-1.5">
              <Label className="block text-sm font-medium mb-3">
              Nama Anak
                </Label>
                <Input
                  className="block text-sm font-medium mb-3"
                  type="text"
                  placeholder="Tuliskan Nama Anak 1"
                />
                <Input
                  className="block text-sm font-medium mb-3"
                  type="text"
                  placeholder="Tuliskan Nama Anak 2"
                />
                <Input
                  className="block text-sm font-medium mb-3"
                  type="text"
                  placeholder="Tuliskan Nama Anak 3"
                />
                <Input
                  className="block text-sm font-medium mb-3"
                  type="text"
                  placeholder="Tuliskan Nama Anak 4"
                />
                <Input
                  className="block text-sm font-medium mb-3"
                  type="text"
                  placeholder="Tuliskan Nama Anak 5"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Kembali
                </button>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Alert variant="destructive" className="w-full">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>Pastikan anda mengisi semua form, jika terdapat form isian pendaftaran yang terlewatkan maka anda tidak dapat menekan tombol simpan!</AlertDescription>
                </Alert>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
