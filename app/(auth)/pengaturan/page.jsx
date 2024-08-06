"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const [isKetuaPopupVisible, setKetuaPopupVisible] = useState(false);
  const [isSekretarisPopupVisible, setSekretarisPopupVisible] = useState(false);
  const [isBendaharaPopupVisible, setBendaharaPopupVisible] = useState(false);

  const data = [
    {
      id: 1,
      nama: "Darono Ardi Widodo, S.Pd.Ind",
      jabatan: "Ketua",
      npa: "123207010861",
      hp: "082135701144",
    },
    {
      id: 2,
      nama: "Sudiharto, S.Pd.",
      jabatan: "Sekretaris",
      npa: "12321600001",
      hp: "",
    },
    {
      id: 3,
      nama: "Drs. H. Sutrisno",
      jabatan: "Bendahara",
      npa: "12320300003",
      hp: "",
    },
  ];

  const handleClosePopup = () => {
    setKetuaPopupVisible(false);
    setSekretarisPopupVisible(false);
    setBendaharaPopupVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="bg-green-700 text-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold">Master Data</h1>
          <nav className="mt-4">
            <ul className="flex flex-wrap space-x-4 md:space-x-6">
              <li className="cursor-pointer">
                <Link href="/pengaturan">Data Pribadi</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/user">User</Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/tambah">Tambah</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4">
            Data Pengurus Kabupaten
          </h3>
          <div className="flex justify-end mb-4 space-x-2">
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded"
              onClick={() => setKetuaPopupVisible(true)}
            >
              Data Ketua
            </button>
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded"
              onClick={() => setSekretarisPopupVisible(true)}
            >
              Sekretaris
            </button>
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded"
              onClick={() => setBendaharaPopupVisible(true)}
            >
              Bendahara
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="p-2 md:p-3 border text-center">No.</th>
                <th className="p-2 md:p-3 border">Nama Pengurus</th>
                <th className="p-2 md:p-3 border">Jabatan</th>
                <th className="p-2 md:p-3 border">NPA</th>
                <th className="p-2 md:p-3 border">No. HP</th>
                <th className="p-2 md:p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 md:p-3 border text-center">{item.id}</td>
                  <td className="p-2 md:p-3 border">{item.nama}</td>
                  <td className="p-2 md:p-3 border">{item.jabatan}</td>
                  <td className="p-2 md:p-3 border text-center">{item.npa}</td>
                  <td className="p-2 md:p-3 border text-center">{item.hp}</td>
                  <td className="p-2 md:p-3 border text-center">
                    <button className="bg-red-500 text-white px-2 py-1 rounded">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Data Ketua Popup */}
      {isKetuaPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Data Ketua</h2>
            <form>
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Pilih Jabatan
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Ketua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Aceh">Aceh</SelectItem>
                      <SelectItem value="Bali">Bali</SelectItem>
                      <SelectItem value="Banten">Banten</SelectItem>
                      <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">Nama</Label>
                <Input type="text" placeholder="Nama" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Nomor Pokok Anggota
                </Label>
                <Input type="number" placeholder="Nomor Pokok Anggota" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Handphone
                </Label>
                <Input type="number" placeholder="Masukkan No. HP" />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleClosePopup}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sekretaris Popup */}
      {isSekretarisPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Data Sekretaris</h2>
            <form>
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Pilih Jabatan
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sekretaris" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Aceh">Aceh</SelectItem>
                      <SelectItem value="Bali">Bali</SelectItem>
                      <SelectItem value="Banten">Banten</SelectItem>
                      <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">Nama</Label>
                <Input type="text" placeholder="Nama" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Nomor Pokok Anggota
                </Label>
                <Input type="number" placeholder="Nomor Pokok Anggota" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Handphone
                </Label>
                <Input type="number" placeholder="Masukkan No. HP" />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleClosePopup}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bendahara Popup */}
      {isBendaharaPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Data Bendahara</h2>
            <form>
              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Pilih Jabatan
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Bendahara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Aceh">Aceh</SelectItem>
                      <SelectItem value="Bali">Bali</SelectItem>
                      <SelectItem value="Banten">Banten</SelectItem>
                      <SelectItem value="Bengkulu">Bengkulu</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">Nama</Label>
                <Input type="text" placeholder="Nama" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Nomor Pokok Anggota
                </Label>
                <Input type="number" placeholder="Nomor Pokok Anggota" />
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium mb-2">
                  Handphone
                </Label>
                <Input type="number" placeholder="Masukkan No. HP" />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleClosePopup}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
