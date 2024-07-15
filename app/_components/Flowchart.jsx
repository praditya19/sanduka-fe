import Image from "next/image";
import React from "react";

const Flowchart = () => {
  const steps = [
    {
      id: 1,
      title: "Siapkan Data Pribadi",
      description:
        "Siapkan data pribadi dan sudah terdaftar menjadi anggota PGRI dengan bukti memiliki Nomor Anggota PGRI 11 digit KTA digital PGRI",
      image: "/profile.png",
    },
    {
      id: 2,
      title: "Verifikasi Data",
      description:
        "Data yang sudah masuk akan diverifikasi oleh PGRI cabang/Cabang Khusus terkait kebenaran data",
      image: "/verified.png",
    },
    {
      id: 3,
      title: "Login",
      description:
        "Anggota yang terverifikasi bisa login menggunakan Email, NPA PGRI",
      image: "/login.png",
    },
  ];

  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Proses Pendaftaran
      </h1>
      <div className="flex flex-wrap justify-center gap-12">
        {steps.map((step) => (
          <div
            key={step.id}
            className="w-80 h-auto rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Image
                src={step.image}
                alt={step.title}
                width={40}
                height={40}
                className="w-16 h-16 mr-4 rounded-full border-2 border-white"
              />
              <h3 className="text-2xl font-bold text-black">{step.title}</h3>
            </div>
            <p className="text-lg text-black text-center">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Flowchart;
