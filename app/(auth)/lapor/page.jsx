"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faUserTimes,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

const FormStep1 = ({ onNext }) => (
  <form className="space-y-4 bg-white p-4 sm:p-8 rounded-lg shadow-lg">
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">NPA PGRI</Label>
      <Input type="text" id="npa" placeholder="NPA PGRI" className="text-sm" />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Cabang / Khusus</Label>
      <Input
        type="text"
        id="branch"
        placeholder="Cabang / Khusus"
        className="text-sm"
      />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">
        Nama Lengkap Pelapor
      </Label>
      <Input type="text" id="name" placeholder="Nama" className="text-sm" />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Jabatan</Label>
      <Input
        type="text"
        id="position"
        placeholder="Jabatan"
        className="text-sm"
      />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Nomor Handphone</Label>
      <Input
        type="number"
        id="phone"
        placeholder="Telpon"
        className="text-sm"
      />
    </div>
    <div className="flex justify-end mt-4">
      <Button type="button" onClick={onNext} className="ml-auto">
        Next
      </Button>
    </div>
  </form>
);

const FormStep2 = ({ onPrev, onNext }) => (
  <form className="space-y-4 bg-white p-4 sm:p-8 rounded-lg shadow-lg">
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Cabang / Khusus</Label>
      <Input
        type="text"
        id="branch"
        placeholder="Cabang / Khusus"
        className="text-sm"
      />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Unit Kerja</Label>
      <Input
        type="text"
        id="unit"
        placeholder="Unit Kerja"
        className="text-sm"
      />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Nama Anggota</Label>
      <Input
        type="text"
        id="name"
        placeholder="Nama Anggota"
        className="text-sm"
      />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Waktu Meninggal</Label>
      <Input
        type="date"
        id="date"
        placeholder="Waktu Meninggal"
        className="text-sm"
      />
    </div>
    <div className="w-full flex flex-col items-start gap-1.5">
      <Label className="block text-sm font-medium mb-1">Keterangan</Label>
      <Input
        type="text"
        id="description"
        placeholder="Keterangan"
        className="text-sm"
      />
    </div>
    <div className="flex justify-between mt-4">
      <Button type="button" onClick={onPrev} className="mr-2">
        Previous
      </Button>
      <Button type="button" onClick={onNext} className="ml-2">
        Next
      </Button>
    </div>
  </form>
);

const Resume = ({ onPrev, onSubmit }) => {
  const memberData = {
    photo: "https://via.placeholder.com/150", // Replace with actual photo URL
    npa: "12345",
    year: "1970",
    profession: "Teacher",
    dateOfDeath: "01-01-1970",
    description: "Member passed away due to illness.",
  };

  return (
    <div className="space-y-6 bg-white p-4 sm:p-8 rounded-lg shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <Label className="block text-xl font-semibold text-red-600">
          Pelapor
        </Label>
        <div className=" p-4 rounded-lg w-full flex justify-center">
          <div>
            <Label className="block text-sm font-medium text-center">
              NPA PGRI:
            </Label>
            <p className="text-sm text-center">{memberData.npa}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Label className="block text-xl font-semibold mb-2">
          ANGGOTA MENINGGAL
        </Label>
        <div className="w-full flex justify-center mb-2">
          <hr className="border-gray-300 w-1/2" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <img
            src={memberData.photo}
            alt="Anggota"
            className="w-32 h-32 object-cover rounded-full border border-gray-300"
          />
          <div className="flex flex-col items-center">
            <Label className="block text-sm font-medium text-center">
              NPA PGRI:
            </Label>
            <p className="text-sm text-center">{memberData.npa}</p>
            <Label className="block text-sm font-medium mt-2 text-center">
              Tahun:
            </Label>
            <p className="text-sm text-center">{memberData.year}</p>
            <Label className="block text-sm font-medium mt-2 text-center">
              Profesi:
            </Label>
            <p className="text-sm text-center">{memberData.profession}</p>
            <Label className="block text-sm font-medium mt-2 text-center">
              Meninggal pada:
            </Label>
            <p className="text-sm text-center">{memberData.dateOfDeath}</p>
            <Label className="block text-sm font-medium mt-2 text-center">
              Keterangan:
            </Label>
            <p className="text-sm text-center">{memberData.description}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Button type="button" onClick={onPrev} className="mr-2">
          Previous
        </Button>
        <Button type="button" onClick={onSubmit} className="ml-2">
          Submit
        </Button>
      </div>
      <div className="text-center italic mt-4">
        bila data sudah sesuai silakan klik SIMPAN
      </div>
    </div>
  );
};

const Page = () => {
  const [step, setStep] = useState(1);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);
  const handleSubmit = () => {
    console.log("Form submitted");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-around mb-4">
        <div className="flex flex-col items-center">
          <div
            className={`p-2 sm:p-2 md:p-4 lg:p-4 rounded-full mb-1 ${
              step === 1 ? "bg-red-500 text-white" : "bg-gray-200 text-red-500"
            }`}
          >
            <FontAwesomeIcon
              icon={faBullhorn}
              className={`text-xl sm:text-xl md:text-xl`}
            />
          </div>
          <span
            className={`text-sm sm:text-md md:text-lg lg:text-lg ${
              step === 1 ? "text-red-500" : "text-gray-600"
            }`}
          >
            Pelapor
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className={`p-2 sm:p-2 md:p-4 lg:p-4 rounded-full mb-1 ${
              step === 2
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-green-500"
            }`}
          >
            <FontAwesomeIcon
              icon={faUserTimes}
              className={`text-xl sm:text-xl md:text-xl`}
            />
          </div>
          <span
            className={`text-sm sm:text-md md:text-lg lg:text-lg ${
              step === 2 ? "text-green-500" : "text-gray-600"
            }`}
          >
            Anggota Meninggal
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className={`p-2 sm:p-2 md:p-4 lg:p-4 rounded-full mb-1 ${
              step === 3
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-blue-500"
            }`}
          >
            <FontAwesomeIcon
              icon={faFileAlt}
              className={`text-xl sm:text-xl md:text-xl`}
            />
          </div>
          <span
            className={`text-sm sm:text-md md:text-lg lg:text-lg ${
              step === 3 ? "text-blue-500" : "text-gray-600"
            }`}
          >
            Resume
          </span>
        </div>
      </div>

      {step === 1 && <FormStep1 onNext={handleNext} />}
      {step === 2 && <FormStep2 onPrev={handlePrev} onNext={handleNext} />}
      {step === 3 && <Resume onPrev={handlePrev} onSubmit={handleSubmit} />}
    </div>
  );
};

export default Page;
