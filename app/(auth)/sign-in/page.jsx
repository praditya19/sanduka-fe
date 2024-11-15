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
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const { setToken, setUserId } = useAuth();

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
      setToken(response.token);
      sessionStorage.setItem("userId", response.id);
      sessionStorage.setItem("unitKerja", response.unitKerja);
      sessionStorage.setItem("nama", response.namaLengkap);
      sessionStorage.setItem("role", response.role);

      const nama = sessionStorage.getItem("nama");
      toast.success(`Selamat Datang ${nama}`);

      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };

  

  const onSignInAdmin = async () => {
    setLoader(true);
    setError("");
  
    try {
      
      if (!isVerified) {
        throw new Error("Harap verifikasi reCAPTCHA.");
      }
  
      
      const npaPgriValue = npaPgri?.trim();  
      const passwordValue = password?.trim();
  
      
      if (!npaPgriValue || !passwordValue) {
        throw new Error("NPA PGRI dan Password tidak boleh kosong.");
      }
  
      
      console.log("Payload untuk login:", { npaPgri: npaPgriValue, password: passwordValue });
  
      
      const response = await GlobalApi.loginAdmin(npaPgriValue, passwordValue);
      setToken(response.token);
      
      sessionStorage.setItem("userId", response.id);
      sessionStorage.setItem("nama", response.namaLengkap);
      sessionStorage.setItem("role", response.role);
  
      
      toast.success(`Selamat Datang ${response.namaLengkap}`);
  
      
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan saat login");
    } finally {
      setLoader(false);
    }
  };
  
  
  function onChange(value) {
    setIsVerified(!!value);
  }

  return (
    <div className="flex items-baseline justify-center my-9">
      <Toaster
        toastOptions={{
          style: {
            fontSize: "1.25rem",
            padding: "16px",
          },
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "#f44336",
              color: "#fff",
            },
          },
        }}
      />
      <div className="flex flex-col items-center justify-center p-10 bg-gray-100 border border-gray-200 rounded-lg shadow-md w-[40%]">
        <Image src="/sanduka.png" width={200} height={200} alt="logo" />
        <h2 className="font-bold text-3xl mt-4">Masuk ke Akun</h2>
        <h2 className="text-gray-500 mt-2 text-center">
          Masukkan NPA PGRI dan{" "}
          {activeTab === "login" ? "Tanggal Lahir" : "Password"} Anda untuk
          Masuk
        </h2>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mt-4">
          <button
            className={`rounded-md p-2 ${
              activeTab === "login"
                ? "bg-teal-500 text-white"
                : "bg-white text-teal-500"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Anggota
          </button>
          <button
            className={`rounded-md p-2 ${
              activeTab === "password"
                ? "bg-teal-500 text-white"
                : "bg-white text-teal-500"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Admin & Super Admin
          </button>
        </div>

        <div className="w-full max-w-lg mt-6">
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Form sesuai tab yang aktif */}
          {activeTab === "login" && (
            <div>
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
            </div>
          )}

          {activeTab === "password" && (
            <div>
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
                <Label htmlFor="password" className="block text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>
          )}

          <ReCAPTCHA
            sitekey="6Lfcxy4qAAAAACy6hmLpVgTejZFZG3xGjn0xOVmd"
            onChange={onChange}
          />

          <Button
            onClick={activeTab === "login" ? onSignIn : onSignInAdmin}
            disabled={
              !npaPgri ||
              (activeTab === "login" && !tanggalLahir) ||
              (activeTab === "password" && !password) ||
              loader ||
              !isVerified
            }
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
