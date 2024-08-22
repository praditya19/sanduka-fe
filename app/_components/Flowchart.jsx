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
    <div id="daftarSec" className="container mx-auto p-4 pt-6 md:p-6 lg:p-8">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-center">
        Proses Pendaftaran
      </h2>
      <div className="flex flex-wrap justify-center gap-8 md:gap-10">
        {steps.map((step) => (
          <div
            key={step.id}
            className="w-80 max-w-lg h-auto rounded-xl shadow-md p-4 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 border border-gray-200 bg-white"
          >
            <div className="flex items-center mb-3">
              <Image
                src={step.image}
                alt={step.title}
                width={48}
                height={48}
                className="w-12 h-12 mr-3 rounded-full border-2 border-gray-300"
              />
              <h3 className="text-lg font-semibold text-black">{step.title}</h3>
            </div>
            <p className="text-sm text-gray-700 text-justify leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Flowchart;
