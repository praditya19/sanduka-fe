"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Label } from "@radix-ui/react-label";
import toast, { Toaster } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthContext";

function SignIn() {
  const [npaPgri, setNpaPgri] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const router = useRouter();
  const { setToken, setUserId } = useAuth(); // Assuming you have a setUserId method

  const onSignIn = async () => {
    setLoader(true);
    setError("");
    try {
      if (npaPgri.length < 6 || tanggalLahir.length !== 8) {
        throw new Error(
          "NPA PGRI harus 6 digit dan Tanggal Lahir harus 8 digit."
        );
      }

      if (!isVerified) {
        throw new Error("Harap verifikasi reCAPTCHA.");
      }

      const loginData = {
        npaPgri: npaPgri,
        tanggalLahir: tanggalLahir,
      };

      const response = await GlobalApi.login(loginData);
      console.log(response);
      setToken(response.token);
      sessionStorage.setItem("userId", response.id); // Store user ID in session storage
      sessionStorage.setItem("unitKerja", response.unitKerja);
      sessionStorage.setItem("nama", response.namaLengkap);

      const nama = sessionStorage.getItem("nama"); // Retrieve name from session storage
      toast.success(`Selamat Datang ${nama}`);

      // Menampilkan data sessionStorage di console
      console.log("Data tersimpan di sessionStorage:");
      console.log("userId:", sessionStorage.getItem("userId"));
      console.log("unitKerja:", sessionStorage.getItem("unitKerja"));

      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };

  function onChange(value) {
    setIsVerified(!!value);
  }

  return (
    <div className="flex items-baseline justify-center my-20">
      <div className="flex flex-col items-center justify-center p-10 bg-gray-100 border border-gray-200 rounded-lg shadow-md">
        <Toaster
          toastOptions={{
            style: {
              fontSize: "1.25rem", // Ukuran font yang lebih besar
              padding: "16px", // Menambah padding jika diperlukan
            },
            success: {
              style: {
                background: "white", // Warna background hijau untuk pesan sukses
                color: "black",
              },
            },
            error: {
              style: {
                background: "#f44336", // Warna background merah untuk pesan error
                color: "#fff",
              },
            },
          }}
        />
        <Image src="/sanduka.png" width={200} height={200} alt="logo" />
        <h2 className="font-bold text-3xl mt-4">Masuk ke Akun</h2>
        <h2 className="text-gray-500 mt-2 text-center">
          Masukkan NPA PGRI dan Tanggal Lahir Anda untuk Masuk
        </h2>
        <div className="w-full max-w-md mt-6">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <div className="mb-6">
            <Label htmlFor="npaPgri" className="block text-sm">
              NPA PGRI
            </Label>
            <Input
              id="npaPgri"
              placeholder="123456"
              value={npaPgri}
              onChange={(e) => setNpaPgri(e.target.value)}
              className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="tanggalLahir" className="block text-sm">
              Tanggal Lahir
            </Label>
            <Input
              id="tanggalLahir"
              placeholder="21082024"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <ReCAPTCHA
            sitekey="6Lfcxy4qAAAAACy6hmLpVgTejZFZG3xGjn0xOVmd"
            onChange={onChange}
          />
          <Button
            onClick={onSignIn}
            disabled={!npaPgri || !tanggalLahir || loader || !isVerified}
            className="w-full mt-4"
          >
            {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Masuk"}
          </Button>
          <p className="mt-4 text-sm text-center text-gray-600">
            Belum punya akun?
            <Link
              href={"/create-account/syarat-ketentuan"}
              className="text-blue-500 ml-1 hover:underline"
            >
              {" "}
              Klik di sini untuk membuat akun baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
