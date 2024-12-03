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
      sessionStorage.setItem("npaPgri", npaPgri);

      const nama = sessionStorage.getItem("nama");
      toast.success(
        <div>
          <strong style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>
            Selamat Datang Di Sanduka
          </strong>
          <span style={{ fontSize: "1.75rem" }}>
            {response.namaLengkap}
          </span>
        </div>,
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "48px", height: "48px", color: "#06D001" }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          ),
          duration: 4000,
        }
      );
      
      setTimeout(() => {
        router.push("/home");
      }, 4000); 
      
    } catch (error) {
      toast.error(
        <div>
          <strong style={{ fontSize: "1.75rem" }}>
          Terjadi kesalahan saat login
          </strong>
        </div>,
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "48px", height: "48px", color: "red" }}  
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
              <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
            </svg>
          ),          
          duration: 5000,
        }
      );
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

      console.log("Payload untuk login:", {
        npaPgri: npaPgriValue,
        password: passwordValue,
      });

      const response = await GlobalApi.loginAdmin(npaPgriValue, passwordValue);
      setToken(response.token);

      sessionStorage.setItem("userId", response.id);
      sessionStorage.setItem("nama", response.namaLengkap);
      sessionStorage.setItem("role", response.role);
      sessionStorage.setItem("npaPgri", npaPgriValue);
      sessionStorage.setItem("cabang", response.cabang);
      toast.success(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "48px", height: "48px", color: "#06D001", marginBottom: "16px" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <strong style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>
          Selamat Datang Di Sanduka
          </strong>
          <span style={{ fontSize: "1.75rem" }}>
            {response.namaLengkap}
          </span>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
      setTimeout(() => {
        router.push("/home");
      }, 4000);
    } catch (error) {
      toast.error(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "48px", height: "48px", color: "red", marginBottom: "16px" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong style={{ fontSize: "1.75rem", display: "block", marginBottom: "8px" }}>
          Terjadi kesalahan saat login
          </strong>
        </div>,
        {
          icon: null, 
          duration: 2000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 9999,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }
      );
    } finally {
      setLoader(false);
    }
  };

  function onChange(value) {
    setIsVerified(!!value);
  }

  return (
    <div className="flex items-baseline justify-center my-14">
      <Toaster
        toastOptions={{
          style: {
            marginTop: "16%",
            fontSize: "1.75rem", 
            padding: "10px", 
            width: "80%", 
            maxWidth: "700px",
            height: "50%",
            maxHeight: "400px",
            transform: "translate(-50%, -50%)", 
            textAlign: "center", 
            zIndex: 9999,
            backgroundColor: "#fff", 
            borderRadius: "8px", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
          },
          success: {
            style: {
              background: "white",
              color: "black",
            },
          },
          error: {
            style: {
              background: "white",
              color: "black",
            },
          },
        }}
      />
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-100 border border-gray-200 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:w-[32%]">
        <Image src="/sanduka.png" width={100} height={100} alt="logo" />
        <h2 className="font-bold text-xl sm:text-2xl mt-4">Masuk ke Akun</h2>
        <h4 className="text-gray-500 mt-2 text-center text-sm sm:text-base">
          Masukkan NPA PGRI dan{" "}
          {activeTab === "login" ? "Tanggal Lahir" : "Password"} Anda untuk
          Masuk
        </h4>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mt-4">
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

        <div className="w-full mt-6">
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
            className="flex justify-center"
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
            className="w-full mt-4 flex justify-center items-center"
          >
            {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Masuk"}
          </Button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Belum punya akun?
            <Link
              href={"/create-account/syarat-ketentuan"}
              className="text-blue-500 ml-1 hover:underline"
            >
              Klik di sini untuk membuat akun baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
