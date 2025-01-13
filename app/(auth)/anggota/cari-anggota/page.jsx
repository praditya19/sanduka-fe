"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, Search, AlertCircle } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";

function CariAnggota() {
  const [npaPgri, setNpa] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [filteredMember, setFilteredMember] = useState(null);

  const onSearch = async () => {
    setLoader(true);
    try {
      const member = await GlobalApi.cekNpa(npaPgri);

      if (member) {
        const detailedMember = await GlobalApi.getUserById(member.id);

        if (detailedMember) {
          setFilteredMember({
            ...member,
            unitKerja: detailedMember.unitKerja,
            pesertaSanduka: detailedMember.pesertaSanduka,
          });
          setError("");
        } else {
          setFilteredMember(null);
          setError("Data Unit Kerja Tidak Ditemukan");
        }
      } else {
        setFilteredMember(null);
        setError("Data Anggota Tidak Ditemukan");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Terjadi kesalahan dalam pencarian.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="flex items-baseline justify-center my-20">
      <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg shadow-md">
        <h2 className="font-bold text-center text-2xl mt-2">
          CARI KEANGGOTAAN SANDUKA
        </h2>
        <h2 className="text-gray-500 mt-2">Masukkan NPA PGRI</h2>
        <div className="w-full max-w-xl mt-6">
          <Input
            placeholder="NPA PGRI"
            value={npaPgri}
            onChange={(e) => setNpa(e.target.value)}
          />
          <Button
            onClick={onSearch}
            disabled={!npaPgri || loader}
            className="w-full mt-4 bg-teal-700"
          >
            {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Cari "}{" "}
            <Search />
          </Button>
        </div>
        <div className="mt-4 w-full max-w-xl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div>
                <AlertTitle>{error}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}
          {filteredMember && (
            <div className="p-4 border border-green-200 rounded-lg shadow-md">
              <h3 className="font-bold text-center text-lg mb-2">
                HASIL PENCARIAN DATA
              </h3>
              <p>
                <strong>Nama :</strong> {filteredMember.namaLengkap}
              </p>
              <p>
                <strong>Unit Kerja :</strong> {filteredMember.unitKerja}
              </p>
              <p>
                <strong>Jabatan :</strong> {filteredMember.jabatan}
              </p>
              <p className="flex items-center">
                <strong>Terdaftar Sanduka:</strong>
                {filteredMember.pesertaSanduka === "Ya" ? (
                  <span className="text-green-500 ml-2">✔</span>
                ) : (
                  <span className="text-red-500 ml-2">✘</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CariAnggota;
