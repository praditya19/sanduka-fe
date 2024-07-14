"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CreateAccount() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const router = useRouter();

  const onCreateAccount = async () => {
    setLoader(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast("Anda berhasil mendaftar");
      router.push("/");
    } catch (e) {
      toast("Gagal membuat akun. Silakan coba lagi.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-6">
          <Image src="/sanduka.png" width={200} height={200} alt="logo" />
        </div>
        <h2 className="text-3xl font-bold text-center">Buat Akun</h2>
        <p className="text-gray-500 text-center mb-4">
          Masukkan email dan kata sandi Anda untuk membuat akun
        </p>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            disabled={!username || !email || !password || loader}
            onClick={onCreateAccount}
          >
            {loader ? (
              <LoaderIcon className="animate-spin mr-2" />
            ) : (
              "Buat Akun"
            )}
          </Button>
        </form>
        <p className="text-sm text-center mt-4">
          Sudah memiliki akun?
          <Link href="/sign-in" className="text-blue-500 ml-1">
            {" "}
            Klik di sini untuk masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CreateAccount;
