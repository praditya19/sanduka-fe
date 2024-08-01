"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";

function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);

  const onSignIn = async () => {
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
      console.log("SignIn berhasil");
    }, 2000);
    console.log(`Username: ${username}, Password: ${password}`);
  };

  return (
    <div className="flex items-baseline justify-center my-20">
      <div className="flex flex-col items-center justify-center p-10 bg-gray-100 border border-gray-200 rounded-lg shadow-md">
        <Image src="/sanduka.png" width={200} height={200} alt="logo" />
        <h2 className="font-bold text-3xl mt-4">Masuk ke Akun</h2>
        <h2 className="text-gray-500 mt-2">
          Masukkan Username dan Kata Sandi Anda untuk Masuk
        </h2>
        <div className="w-full max-w-md mt-6">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-3"
          />
          <Button
            onClick={onSignIn}
            disabled={!username || !password || loader}
            className="w-full mt-4"
          >
            {loader ? <LoaderIcon className="animate-spin mr-2" /> : "Masuk"}
          </Button>
          <p className="mt-4 text-sm text-center text-gray-600">
            Belum punya akun?
            <Link href={"/create-account"} className="text-blue-500 ml-1">
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
