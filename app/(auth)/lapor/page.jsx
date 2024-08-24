"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";

const dummyDataNames = [
  { name: "Budi Waseso" },
  { name: "Budi Doremi" },
  { name: "Budi Santoso" },
  { name: "Agus Susan" },
  { name: "Susan Susanti" },
];

const FormStep1 = ({ onNext }) => {
  const [formData, setFormData] = useState({
    branch: "Jakarta",
    unit: "Jepara",
    memberName: "",
    deathDate: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNames, setFilteredNames] = useState([]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = dummyDataNames.filter((data) =>
        data.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNames(filtered);
    } else {
      setFilteredNames([]);
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNameClick = (name) => {
    setFormData((prev) => ({ ...prev, memberName: name }));
    setSearchTerm(name);
    setFilteredNames([]); // Hide the dropdown after selecting
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onNext(formData);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faArrowLeft}
                size="sm"
                onClick={handleBackClick}
                className="cursor-pointer mr-4"
              />
              <h1 className="text-base">Pelaporan</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex justify-center ">
            <h1 className="text-xl font-semibold text-gray-800">Pelaporan</h1>
          </div>
          <form className="space-y-4 p-4 sm:p-8 rounded-lg ">
            <div className="flex flex-wrap -mx-2">
              {/* Bagian kiri - Data Pelapor */}
              <div className="w-full lg:w-1/2 px-2">
                <div className=" p-4 rounded-lg">
                  {" "}
                  {/* Background untuk bagian kiri */}
                  <h2 className="text-xl font-bold mb-4 pt-4 text-gray-800">
                    Pelapor
                  </h2>
                  <div className="w-full flex flex-col items-start">
                    <Label className="block text-sm font-medium mb-1">
                      Tanggal Pelaporan
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      placeholder="tanggal"
                      className="text-sm"
                      value={formData.date}
                      disabled
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="name"
                      placeholder="Nama"
                      className="text-sm"
                      disabled
                      value={formData.name}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="branch"
                      placeholder="Cabang / Khusus"
                      className="text-sm"
                      disabled
                      value={formData.branch}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="position"
                      placeholder="Jabatan"
                      className="text-sm"
                      disabled
                      value={formData.position}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="number"
                      id="phone"
                      placeholder="Nomor Whatsapp"
                      className="text-sm"
                      disabled
                      value={formData.phone}
                    />
                  </div>
                </div>
              </div>

              {/* Bagian kanan - Data Anggota Meninggal */}
              <div className="w-full lg:w-1/2 px-2">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  {" "}
                  {/* Background untuk bagian kanan */}
                  <h2 className="text-xl font-bold mb-4 pt-4 text-gray-800">
                    Data Anggota Meninggal
                  </h2>
                  <div className="w-full flex flex-col items-start">
                    <Label className="block text-sm font-medium mb-1">
                      Cabang / Khusus
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Cabang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="jepara">Jepara</SelectItem>
                          <SelectItem value="semarang">Semarang</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full flex flex-col items-start mt-3">
                    <Label className="block text-sm font-medium mb-1">
                      Unit Kerja
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Unit Kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="laki-laki">Jepara</SelectItem>
                          <SelectItem value="perempuan">Bangsri</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative w-full flex flex-col items-start mt-3">
                    <label className="block text-sm font-medium mb-1">
                      Nama Anggota
                    </label>
                    <Input
                      type="text"
                      placeholder="Cari Nama Anggota"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="text-sm border border-gray-300 p-2 rounded"
                    />
                    {filteredNames.length > 0 && (
                      <ul className="border border-gray-300 mt-1 w-full max-h-40 overflow-y-auto bg-white z-10">
                        {filteredNames.map((data, index) => (
                          <li
                            key={index}
                            onClick={() => handleNameClick(data.name)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {data.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="w-full flex flex-col items-start mt-3">
                    <Label className="block text-sm font-medium mb-1">
                      Waktu Meninggal
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      placeholder="tanggal"
                      className="text-sm"
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-3">
                    <Label className="block text-sm font-medium mb-1">
                      Keterangan
                    </Label>
                    <Textarea
                      type="text"
                      id="description"
                      placeholder="Keterangan"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button type="button" onClick={onNext} className="ml-auto">
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Resume = ({ onPrev, onSubmit }) => {
  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div>
      {isMobile ? (
        <header className="bg-teal-700 text-white text-lg font-bold py-3 px-3 md:px-12 shadow-md fixed top-0 left-0 w-full z-50 flex items-center">
          <div className="container mx-auto flex items-center justify-between">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <h1 className="text-base">Pelaporan</h1>
            </div>
          </div>
        </header>
      ) : (
        <HeaderHome />
      )}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex justify-center mt-3">
            <h1 className="text-xl font-semibold text-gray-800">Resume</h1>
          </div>
          <div className="relative max-w-xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden my-4 border border-gray-300">
            <div className="flex flex-col items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-lg">
              <Label className="block text-xl font-bold text-gray-700 mb-4">
                ANGGOTA MENINGGAL
              </Label>
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/profile.png"
                  alt="foto Anggota"
                  className="w-24 h-36 object-cover rounded-full border-4 border-gray-200 shadow-md"
                  width={110} // Adjust width in pixels (36 * 4 = 144px, matching w-36)
                  height={110} // Adjust height in pixels (36 * 4 = 144px, matching h-36)
                />
                <div className="flex flex-col items-center gap-4 text-gray-700">
                  <Label className="block text-sm font-medium text-center">
                    Nama:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    NPA PGRI:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Usia: tahun
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Cabang:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Unit Kerja:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Jabatan:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Alamat rumah:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Tanggal Meninggal:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Keterangan:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    No HP:{" "}
                    <Link
                      href=""
                      target="blank"
                      className="text-blue-600 font-semibold"
                    >
                      (WhatsApp)
                    </Link>
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Maps alamat yang meninggal:{" "}
                    <Link
                      href=""
                      className="text-blue-600 font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat di Google Maps
                    </Link>
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-4">
              <Label className="block text-xl font-semibold text-red-600">
                Pelapor
              </Label>
              <div className="rounded-lg w-full flex justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Label className="block text-sm font-medium text-center">
                    Nama:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    NPA:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Cabang:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Unit Kerja:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    Jabatan:
                  </Label>
                  <Label className="block text-sm font-medium text-center">
                    No HP:{" "}
                    <Link href="" target="blank" className="text-blue-500">
                      (WhatsApp)
                    </Link>
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-center p-2">
              <Button type="button" onClick={onPrev} className="mr-2">
                Previous
              </Button>
              <Button type="button" onClick={onSubmit} className="ml-2">
                Submit
              </Button>
            </div>
          </div>
        </div>
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
    <div className="container mx-auto p-6 mt-12">
      {step === 1 && <FormStep1 onNext={handleNext} />}
      {step === 2 && <Resume onPrev={handlePrev} onSubmit={handleSubmit} />}
    </div>
  );
};

export default Page;
