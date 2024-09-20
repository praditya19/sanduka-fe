"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { LoaderIcon, Search, AlertCircle } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { format, parse } from "date-fns"; // Import date-fns functions

function CariAnggota() {
  const [npaPgri, setNpa] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [loader, setLoader] = useState(false);
  const [anggota, setAnggota] = useState([]);
  const [error, setError] = useState("");
  const [filteredMember, setFilteredMember] = useState(null);

  useEffect(() => {
    fetchAnggota();
  }, []);

  const fetchAnggota = async () => {
    setLoader(true);
    try {
      const page = 0;
      const size = 50;
      const response = await GlobalApi.getAllAnggota(page, size);
      const fetchedData = response.data.content;

      if (fetchedData) {
        setAnggota(fetchedData);
      } else {
        console.warn("No data found.");
      }
    } catch (error) {
      console.error("Error fetching anggota:", error);
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoader(false);
    }
  };

  const onSearch = () => {
    setLoader(true);
    try {
      const formattedDate = format(parse(tanggalLahir, "yyyy-MM-dd", new Date()), "yyyy-MM-dd");
      console.log("Searching for NPA:", npaPgri, "with Date:", formattedDate);
      
      // Sesuaikan pencarian berdasarkan format tanggal di data
      const member = anggota.find(
        (m) => m.npaPgri === npaPgri && format(new Date(m.tanggalLahir), "yyyy-MM-dd") === formattedDate
      );
  
      if (member) {
        setFilteredMember(member);
        setError("");
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
        <h2 className="font-bold text-center text-2xl mt-2">CARI KEANGGOTAAN SANDUKA</h2>
        <h2 className="text-gray-500 mt-2">Masukkan NPA PGRI dan Tanggal Lahir</h2>
        <div className="w-full max-w-xl mt-6">
          <Input
            placeholder="NPA PGRI"
            value={npaPgri}
            onChange={(e) => setNpa(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Tanggal Lahir (YYYY-MM-DD)"
            className="mt-3"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
          />
          <Button
            onClick={onSearch}
            disabled={!npaPgri || !tanggalLahir || loader}
            className="w-full mt-4 bg-teal-700"
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
          {filteredMember && (
            <div className="p-4 border border-green-200 rounded-lg shadow-md">
              <h3 className="font-bold text-center text-lg mb-2">HASIL PENCARIAN DATA</h3>
              <p><strong>Nama :</strong> {filteredMember.namaLengkap}</p>
              <p><strong>NPA :</strong> {filteredMember.npaPgri}</p>
              <p><strong>Cabang :</strong> {filteredMember.cabang}</p>
              <p><strong>Unit Kerja :</strong> {filteredMember.unitKerja}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CariAnggota;
