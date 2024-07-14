import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneVolume,
  faBuilding,
  faCreditCard,
  faHospital,
  faLaptopMedical,
  faBookOpen,
  faFlag,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const services = [
  {
    icon: faPhoneVolume,
    title: "Informasi & Pengaduan",
  },
  {
    icon: faBuilding,
    title: "Pendaftaran Badan Usaha",
  },
  { icon: faCreditCard, title: "Autodebit" },
  { icon: faHospital, title: "Fasilitas Kesehatan" },
  {
    icon: faLaptopMedical,
    title: "Skrining Kesehatan",
  },
  { icon: faBookOpen, title: "Jurnal JKN" },
  { icon: faFlag, title: "Whistleblowing System" },
  { icon: faUser, title: "Karir" },
];

function ServiceCard({ icon, title }) {
  return (
    <div className="rounded-lg shadow-md bg-white hover:shadow-lg transition duration-300 ease-in-out">
      <div className="flex items-center p-4">
        <div className="text-blue-500 bg-blue-100 rounded-full p-3">
          <FontAwesomeIcon icon={icon} className="text-2xl w-5" />
        </div>
        <h3 className="ml-4 text-xl font-bold">{title}</h3>
      </div>
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Layanan Kami</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ServiceCard key={index} icon={service.icon} title={service.title} />
        ))}
      </div>
    </div>
  );
}

export default ServicesPage;
