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
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const { setToken, setUserId } = useAuth();

  const onSignIn = async () => {
    setLoader(true);
    setError("");
    try {
      if (!email.includes("@") || password.length < 6) {
        throw new Error(
          "Email tidak valid atau Password harus minimal 6 karakter."
        );
      }
  
      if (!isVerified) {
        throw new Error("Harap verifikasi reCAPTCHA.");
      }
  
      // Melanjutkan proses login
      const loginData = {
        email: email,
        password: password,
      };
  
      const response = await GlobalApi.login(loginData);
      setToken(response.token);
      sessionStorage.setItem("cabang", response.cabang);
      sessionStorage.setItem("nama", response.namaLengkap);
      sessionStorage.setItem("role", response.role);
      sessionStorage.setItem("npa", response.npaPgri);
  
      // Cek NPA untuk mendapatkan ID
      const npaResponse = await GlobalApi.cekNpa(response.npaPgri);
      if (npaResponse && npaResponse.id) {
        sessionStorage.setItem("userId", npaResponse.id);
        sessionStorage.setItem("unitKerja", npaResponse.unitKerja);
      } else {
        throw new Error("Data NPA tidak valid atau ID tidak ditemukan.");
      }
  
      const cabang = response.cabang;
  
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
            style={{
              width: "150px",
              height: "150px",
              color: "#06D001",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15L6 13l1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <h3
             style={{
              fontSize: "2rem",
              display: "block",
              marginBottom: "28px",
            }}
          >
            Selamat Datang Di Sanduka
          </h3>
          <span style={{ fontSize: "1.75rem" }}>{response.namaLengkap}</span>
          <span style={{ fontSize: "1.5rem", color: "#333", marginTop: "8px" }}>
            Cabang: {cabang}
          </span>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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
      console.error("Error:", error);
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
            style={{
              width: "150px",
              height: "150px",
              color: "red",
              marginBottom: "16px",
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.414 4.586L4.586 19.414a2 2 0 1 1-2.828-2.828L16.586 4.586a2 2 0 1 1 2.828 2.828z" />
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 1 1-1.414 0.414z" />
          </svg>
          <h3
           style={{
            fontSize: "1.75rem",
            display: "block",
            marginBottom: "8px",
          }}
          >
            Terjadi kesalahan saat login
          </h3>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "12%",
            fontSize: "1.75rem",
            padding: "10px",
            width: "80%",
            maxWidth: "450px",
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
    <div className="flex items-baseline justify-center my-8">
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
  <h2 className="font-bold text-xl sm:text-2xl">Masuk ke Akun</h2>
  <h4 className="text-gray-500 mt-2 text-center text-sm sm:text-base">
    Masukkan Email dan Password Anda untuk Masuk
  </h4>

  <div className="w-full mt-6">
    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

    <div>
      <div className="mb-6">
        <Label htmlFor="email" className="block text-sm">
          Email
        </Label>
        <Input
          id="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      <div className="mb-6 relative">
        <Label htmlFor="password" className="block text-sm">
          Password
        </Label>
        <Input
          id="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
          style={{ top: "70%", transform: "translateY(-50%)" }}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible className="h-5 w-5 text-gray-500" />
          ) : (
            <AiOutlineEye className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
    </div>

    <ReCAPTCHA
      sitekey="6Lfcxy4qAAAAACy6hmLpVgTejZFZG3xGjn0xOVmd"
      onChange={onChange}
      className="flex justify-center"
    />

    <Button
      onClick={onSignIn}
      disabled={
        !email || !password || loader || !isVerified
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
