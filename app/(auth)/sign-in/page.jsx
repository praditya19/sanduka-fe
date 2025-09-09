// "use client";
// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { LoaderIcon } from "lucide-react";
// import GlobalApi from "@/app/_utils/GlobalApi";
// import { Label } from "@radix-ui/react-label";
// import ReCAPTCHA from "react-google-recaptcha";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/AuthContext";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
// import {
//   FaTimesCircle,
//   FaCheckCircle,
//   FaExclamationCircle,
// } from "react-icons/fa";

// // Updated NotificationPopup component with improved message formatting
// const NotificationPopup = ({ type, message, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const getBgColor = () => {
//     switch (type) {
//       case "success":
//         return "bg-green-100";
//       case "error":
//         return "bg-red-100";
//       default:
//         return "bg-blue-100";
//     }
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "success":
//         return <FaCheckCircle className="text-green-500 text-3xl" />;
//       case "error":
//         return <FaExclamationCircle className="text-red-500 text-3xl" />;
//       default:
//         return null;
//     }
//   };

//   const getTextColor = () => {
//     switch (type) {
//       case "success":
//         return "text-green-800";
//       case "error":
//         return "text-red-800";
//       default:
//         return "text-blue-800";
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div
//         className="absolute inset-0 bg-black opacity-50"
//         onClick={onClose}
//       ></div>
//       <div
//         className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 text-gray-500 hover:text-red-700 transition-colors"
//           aria-label="Close"
//         >
//           <FaTimesCircle size={24} />
//         </button>

//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-bounce">{getIcon()}</div>

//           <h3 className={`text-xl font-bold ${getTextColor()}`}>
//             {type === "success" ? "Berhasil!" : "Gagal!"}
//           </h3>

//           <div className={`${getTextColor()} text-center`}>{message}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// function SignIn() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loader, setLoader] = useState(false);
//   const [error, setError] = useState("");
//   const [isVerified, setIsVerified] = useState(false);
//   const [notification, setNotification] = useState(null);
//   const router = useRouter();
//   const { setToken, setUserId } = useAuth();

//   const onSignIn = async () => {
//     setLoader(true);
//     setError("");
//     try {
//       if (!email || !password) {
//         throw new Error("NPA/Email dan Tanggal Lahir/Password wajib diisi.");
//       }

//       let response;

//       if (/^\d{10,11}$/.test(email)) {
//         const dateRegex = /^\d{2}\d{2}\d{4}$/;
//         if (!dateRegex.test(password)) {
//           throw new Error("Tanggal lahir harus dalam format DDMMYYYY.");
//         }

//         const loginData = {
//           npaPgri: email,
//           tanggalLahir: password,
//         };
//         response = await GlobalApi.login(loginData);
//       } else {
//         if (password.length < 6) {
//           throw new Error("Password harus minimal 6 karakter.");
//         }

//         const loginData = { email, password };
//         response = await GlobalApi.loginAdmin(loginData);
//       }

//       setToken(response.token);
//       sessionStorage.setItem("userId", response.id);
//       sessionStorage.setItem("cabang", response.cabang);
//       sessionStorage.setItem("nama", response.namaLengkap);
//       sessionStorage.setItem("role", response.role);
//       sessionStorage.setItem("email", response.email);
//       sessionStorage.setItem("npa", response.npaPgri || "Tidak diketahui");
//       sessionStorage.setItem(
//         "unitKerja",
//         response.unitKerja || "Tidak diketahui"
//       );

//       // Updated success notification with formatted name and branch on separate lines
//       setNotification({
//         type: "success",
//         message: (
//           <>
//             Selamat Datang Di Sanduka, <br />
//             <span className="font-bold">{response.namaLengkap}</span>
//             <br />
//             <span className="text-sm">Cabang: {response.cabang}</span>
//           </>
//         ),
//       });

//       setTimeout(() => {
//         router.push("/home");
//       }, 3000);
//     } catch (error) {
//       console.error("Error:", error);
//       // Show error notification
//       setNotification({
//         type: "error",
//         message: `Terjadi kesalahan saat login: ${
//           error.message || "Periksa kredensial Anda dan coba lagi"
//         }`,
//       });
//     } finally {
//       setLoader(false);
//     }
//   };

//   function onChange(value) {
//     setIsVerified(!!value);
//   }

//   const isNumericInput = /^[0-9]+$/.test(email);
//   const isEmail = email.includes("@gmail.com");
//   const isNPA = /^\d{10,11}$/.test(email);

//   return (
//     <div className="flex items-baseline justify-center my-8">
//       {notification && (
//         <NotificationPopup
//           type={notification.type}
//           message={notification.message}
//           onClose={() => setNotification(null)}
//         />
//       )}

//       <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-100 border border-gray-200 rounded-lg shadow-md w-full max-w-md sm:max-w-lg lg:w-[32%]">
//         <Image src="/sanduka.png" width={100} height={100} alt="logo" />
//         <h2 className="font-bold text-xl sm:text-2xl">Masuk ke Akun</h2>
//         <h4 className="text-gray-500 mt-2 text-center text-sm sm:text-base">
//           Masukkan Email/NPA dan Password Anda untuk Masuk
//         </h4>

//         <div className="w-full mt-6">
//           {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

//           <div>
//             <div className="mb-6">
//               <Label htmlFor="email" className="block text-sm">
//                 User
//               </Label>
//               <Input
//                 id="email"
//                 placeholder="user@example.com atau 3320"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//               />
//             </div>

//             <div className="mb-6 relative">
//               <Label htmlFor="password" className="block text-sm">
//                 {isNumericInput ? "Tanggal Lahir" : "Password"}
//               </Label>
//               <Input
//                 id="password"
//                 placeholder={isNumericInput ? "01011990" : "********"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 type={
//                   isNumericInput ? "text" : showPassword ? "text" : "password"
//                 }
//                 className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//               />
//               {!isNumericInput && (
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
//                   style={{ top: "70%", transform: "translateY(-50%)" }}
//                 >
//                   {showPassword ? (
//                     <AiOutlineEyeInvisible className="h-5 w-5 text-gray-500" />
//                   ) : (
//                     <AiOutlineEye className="h-5 w-5 text-gray-500" />
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>

//           <ReCAPTCHA
//             sitekey="6Lfcxy4qAAAAACy6hmLpVgTejZFZG3xGjn0xOVmd"
//             onChange={onChange}
//             className="flex justify-center"
//           />

//           <Button
//             onClick={onSignIn}
//             disabled={!email || !password || loader || !isVerified}
//             className="w-full mt-4 flex justify-center items-center"
//           >
//             {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Masuk"}
//           </Button>

//           <p className="mt-4 text-sm text-center text-gray-600">
//             Belum teregistrasi?
//             <Link
//               href={"/create-account/syarat-ketentuan"}
//               className="text-blue-500 ml-1 hover:underline"
//             >
//               Klik di sini untuk mendaftar Anggota
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SignIn;
"use client";
import React from "react";
import Image from "next/image";
import { FaTools } from "react-icons/fa";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full">
        <div className="flex justify-center mb-6 animate-bounce">
          <FaTools className="text-6xl text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Situs Sedang Dalam Perbaikan
        </h1>
        <p className="text-gray-600 mb-6">
          Kami sedang melakukan perawatan sistem untuk meningkatkan layanan.
          <br />
          Silakan kembali lagi nanti.
        </p>
      </div>
      <p className="mt-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Sanduka. Semua Hak Dilindungi.
      </p>
    </div>
  );
}
