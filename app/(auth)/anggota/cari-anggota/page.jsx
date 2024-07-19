"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import Link from "next/link";
import { LoaderIcon, Search, AlertCircle } from "lucide-react";

const members = [
  { npa: "12345", dob: "01/01/1980", name: "John Doe" },
  { npa: "67890", dob: "15/07/1975", name: "Jane Smith" },
  { npa: "01070", dob: "01/07/2004", name: "Nanda DK", lahir: "Kendal", cabang: "KEMBANG", kerja: "SDN BALONG 2" },
  // Add more members as needed
];

function CariAnggota() {
  const [npa, setNpa] = useState("");
  const [dob, setDob] = useState("");
  const [loader, setLoader] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [error, setError] = useState("");

  const onSearch = async () => {
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
      const member = members.find(
        (m) => m.npa === npa && m.dob === dob
      );
      if (member) {
        setMemberData(member);
        setError("");
      } else {
        setMemberData(null);
        setError("Data Anggota Tidak Ditemukan");
      }
    }, 2000);
  };

  return (
    <div className="flex items-baseline justify-center my-20">
      <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg shadow-md">
        <h2 className="font-bold text-center text-2xl mt-2">CARI KEANGGOTAAN SANDUKA</h2>
        <h2 className="text-gray-500 mt-2">
          Masukkan NPA PGRI dan Tanggal Lahir
        </h2>
        <div className="w-full max-w-xl mt-6">
          <Input
            placeholder="NPA PGRI"
            value={npa}
            onChange={(e) => setNpa(e.target.value)}
          />
          <Input
            placeholder="Tanggal Lahir DD/MM/YYYY"
            className="mt-3"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <Button
            onClick={onSearch}
            disabled={!npa || !dob || loader}
            className="w-full mt-4"
          >
            {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Cari "} <Search />
          </Button>
        </div>
        <div className="mt-4 w-full max-w-xl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div>
                <AlertTitle>{error}</AlertTitle>
                <AlertDescription>
                  NPA dan Tanggal Lahir Salah.
                </AlertDescription>
              </div>
            </Alert>
          )}
          {memberData && (
            <div className="p-4 border border-green-200 rounded-lg shadow-md">
              <h3 className="font-bold text-center text-lg mb-2">HASIL PENCARIAN DATA</h3>
              <p><strong>Nama :</strong> {memberData.name}</p>
              <p><strong>Tempat Lahir :</strong> {memberData.lahir} </p>
              <p><strong>Tanggal Lahir :</strong> {memberData.dob}</p>
              <p><strong>NPA PGRI :</strong> {memberData.npa}</p>
              <p><strong>Cabang :</strong> {memberData.cabang} </p>
              <p><strong>Alamat Kerja :</strong> {memberData.kerja} </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CariAnggota;