"use client";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

const FormStep1 = ({
  formData,
  setFormData,
  pelaporData,
  setPelaporData,
  onNext,
}) => {
  const tableRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNames, setFilteredNames] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [unitKerjaOptions, setUnitKerjaOptions] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [cabangFilter, setCabangFilter] = useState("");
  const [isUnitKerjaDisabled, setIsUnitKerjaDisabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const formattedDate = today.toISOString().split("T")[0];
  const [silaporData, setSilaporData] = useState(null);
  const dropdownRef = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [queryCabang, setQueryCabang] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [queryUnit, setQueryUnit] = useState("");
  const [showDropdownUnit, setShowDropdownUnit] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      setLoading(false);

      const fetchData = async () => {
        try {
          const [cabangResponse, unitKerjaResponse] = await Promise.all([
            GlobalApi.getCabang(),
            GlobalApi.getUnitKerja(),
          ]);

          setCabangOptions(cabangResponse.data);
          setUnitKerjaOptions(unitKerjaResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [token, router]);

  const filteredCabangOptions = cabangOptions.filter((cabang) =>
    cabang.kecamatan.toLowerCase().includes(queryCabang.toLowerCase())
  );

  useEffect(() => {
    const fetchPelaporData = async () => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await GlobalApi.getUserById(userId);
        setSilaporData(response);
      } catch (error) {
        console.error("Error fetching pelapor data:", error);
      }
    };

    fetchPelaporData();
  }, []);

  useEffect(() => {
    const fetchLaporanData = async () => {
      const userId = sessionStorage.getItem("userId");
      if (userId) {
        try {
          const laporanData = await GlobalApi.getUserById(userId);
          setPelaporData(laporanData);

          if (laporanData && laporanData !== formData) {
            setFormData({
              ...formData,
            });
            setPelaporData({
              memberName: laporanData?.namaLengkap,
              branch: laporanData?.cabang,
              position: laporanData?.jabatan,
              phone: laporanData?.nomorHp,
            });
          }
        } catch (error) {
          console.error("Error fetching pelapor data:", error);
        }
      }
    };

    fetchLaporanData();
  }, [setFormData, setPelaporData]);

  const formatPhoneNumber = (number) => {
    if (number && number.startsWith("+62")) {
      return "0" + number.slice(3);
    }
    return number;
  };

  const handleCabangSelect = (cabang) => {
    setQueryCabang("");
    setSelectedCabang(cabang.kecamatan);
    setShowDropdownCabang(false);

    const unitsForSelectedCabang = unitKerjaOptions.filter(
      (unit) => unit.cabang === cabang.kecamatan
    );

    setFilteredUnitKerja(unitsForSelectedCabang);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData((prevFormData) => ({ ...prevFormData, memberName: value }));

    if (value === "") {
      setIsDropdownVisible(false);
      return;
    }

    try {
      const response = await GlobalApi.searchUsers(value);
      const allNames = response.data;

      const filtered = allNames.filter((data) =>
        data.namaLengkap.toLowerCase().includes(value.toLowerCase())
      );

      setFilteredNames(filtered);
      setIsDropdownVisible(true);
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };

  const handleNameClick = (name, id) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      memberName: name,
      memberId: id,
    }));
    setSearchTerm(name);
    setFilteredNames([]);
    sessionStorage.setItem("selectedMemberId", id);
  };

  const handleNext = () => {
    onNext(formData.memberId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCabangFilterChange = (inputValue) => {
    setCabangFilter(inputValue);
    setFormData((prev) => ({ ...prev, branch: inputValue }));

    const filtered = unitKerjaOptions.filter(
      (unit) => unit.cabang === inputValue
    );
    setFilteredUnitKerja(filtered);
    setIsUnitKerjaDisabled(false);
  };

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownCabang = document.getElementById("dropdownCabang");
      const inputCabang = document.getElementById("cabangInput");
      const dropdownUnit = document.getElementById("dropdownUnit");
      const inputUnit = document.getElementById("searchInput");

      const isClickOutsideCabang =
        dropdownCabang &&
        !dropdownCabang.contains(event.target) &&
        inputCabang &&
        !inputCabang.contains(event.target);

      const isClickOutsideUnit =
        dropdownUnit &&
        !dropdownUnit.contains(event.target) &&
        inputUnit &&
        !inputUnit.contains(event.target);

      if (isClickOutsideCabang) {
        setShowDropdownCabang(false);
      }

      if (isClickOutsideUnit) {
        setShowDropdownUnit(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const FilterSection = ({
    cabang,
    unitKerja,
    selectedCabang,
    selectedUnitKerja,
    handleCabangChange,
    handleUnitKerjaChange,
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-16 text-sm">
      <div className="flex items-end gap-4">
        <DropdownCabang
          label="Cabang"
          options={cabang}
          selectedCabang={selectedCabang}
          handleChange={handleCabangChange}
        />
        <DropdownUnitKerja
          label="Unit Kerja"
          options={unitKerja}
          disabled={!selectedCabang}
          selectedUnitKerja={selectedUnitKerja}
          handleChange={handleUnitKerjaChange}
        />
      </div>
    </div>
  );

  const DropdownCabang = ({ label, options, handleChange, selectedCabang }) => (
    <div>
      <label className="block mb-2 font-semibold text-gray-800">{label}</label>
      <select
        className="border rounded-lg p-2 w-56 bg-white shadow-sm"
        value={selectedCabang}
        onChange={handleChange}
      >
        <option>Pilih {label}</option>
        {options.map((item, index) => (
          <option key={item.idKecamatan} value={item.kecamatan}>
            {item.kecamatan}
          </option>
        ))}
      </select>
    </div>
  );

  const DropdownUnitKerja = ({
    label,
    options,
    disabled,
    handleChange,
    selectedUnitKerja,
  }) => (
    <div>
      <label className="block mb-2 font-semibold text-gray-800">{label}</label>
      <select
        className="border rounded-lg p-2 w-56 bg-white shadow-sm"
        disabled={disabled}
        value={selectedUnitKerja}
        onChange={handleChange}
      >
        <option value="">Pilih {label}</option>
        {options.map((unit) => (
          <option key={unit.id} value={unit.unitKerja}>
            {unit.unitKerja}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex justify-center bg-red-600 py-2 rounded-b-lg shadow-md sm:mt-14 mt-12 sm:-mb-5 -mb-10">
            <h1 className="text-xl font-semibold text-white">Pelaporan</h1>
          </div>
          <form className=" p-4 sm:p-8 rounded-lg">
            <div className="flex flex-wrap ">
              <div className="w-full lg:w-1/2 px-2">
                <div className="p-4 rounded-lg">
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
                      value={formattedDate}
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
                      value={silaporData?.namaLengkap}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="branch"
                      placeholder="Cabang / Khusus"
                      className="text-sm"
                      disabled
                      value={silaporData?.cabang}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="position"
                      placeholder="Jabatan"
                      className="text-sm"
                      disabled
                      value={silaporData?.jabatan}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="number"
                      id="phone"
                      placeholder="Nomor Whatsapp"
                      className="text-sm"
                      disabled
                      value={formatPhoneNumber(silaporData?.nomorHp)}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 px-2">
                <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
                  <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 pt-4 text-gray-800">
                      Data Anggota Meninggal
                    </h2>
                    <div className="w-full flex flex-col items-start relative">
                      <Label className="block text-sm font-medium mb-1">
                        Cabang / Khusus
                      </Label>
                      <Input
                        id="cabangInput"
                        type="text"
                        className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-pointer"
                        placeholder="Pilih Cabang"
                        value={queryCabang || selectedCabang}
                        readOnly
                        onClick={() => setShowDropdownCabang(true)}
                      />

                      {showDropdownCabang && (
                        <div
                          id="dropdownCabang"
                          className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[10%] w-full"
                        >
                          <Input
                            type="text"
                            className="border-b p-2 w-full bg-white"
                            placeholder="Cari atau ketik Cabang..."
                            value={queryCabang}
                            onChange={(e) => {
                              setQueryCabang(e.target.value);
                            }}
                            autoFocus
                          />
                          <ul className="max-h-48 overflow-y-auto mt-1">
                            <li
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() =>
                                handleCabangSelect({
                                  kecamatan: "",
                                  idKecamatan: null,
                                })
                              }
                            >
                              Pilih Cabang
                            </li>
                            {cabangOptions
                              .filter((cabang) =>
                                cabang.kecamatan
                                  .toLowerCase()
                                  .includes(queryCabang.toLowerCase())
                              )
                              .map((cabang) => (
                                <li
                                  key={cabang.idKecamatan}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleCabangSelect(cabang)}
                                >
                                  {cabang.kecamatan}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-col items-start mt-3">
                      <Label className="block text-sm font-medium mb-1">
                        Unit Kerja
                      </Label>
                      <Input
                        type="text"
                        className="border rounded-lg p-2 w-full bg-white shadow-sm cursor-not-allowed"
                        placeholder="Pilih Unit Kerja"
                        value={formData.unit || ""}
                        readOnly
                        onClick={() => setShowDropdownUnit(true)}
                      />

                      {showDropdownUnit && filteredUnitKerja.length > 0 && (
                        <div
                          className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[4.5%] w-[43%]"
                          id="dropdownUnit"
                        >
                          <Input
                            id="searchInput"
                            type="text"
                            className="border-b p-2 w-full bg-white mb-1"
                            placeholder="Cari atau ketik Unit Kerja..."
                            value={queryUnit}
                            onChange={(e) => setQueryUnit(e.target.value)}
                            autoFocus
                          />
                          <ul className="absolute z-10 border rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto w-full">
                            <li
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  unit: "",
                                }));
                                setShowDropdownUnit(false);
                              }}
                            >
                              Pilih Unit Kerja
                            </li>
                            {filteredUnitKerja
                              .filter((unit) =>
                                unit.unitKerja
                                  .toLowerCase()
                                  .includes(queryUnit.toLowerCase() || "")
                              )
                              .map((unit) => (
                                <li
                                  key={unit.id}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      unit: unit.unitKerja,
                                    }));
                                    setShowDropdownUnit(false);
                                  }}
                                >
                                  {unit.unitKerja}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div
                      className="w-full flex flex-col items-start mt-3 relative"
                      ref={dropdownRef}
                    >
                      <Label className="block text-sm font-medium mb-1">
                        Nama Anggota
                      </Label>
                      <Input
                        type="text"
                        id="memberName"
                        name="memberName"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Cari Nama Anggota"
                        className="text-sm"
                      />

                      {filteredNames.length > 0 && isDropdownVisible && (
                        <ul className="absolute left-0 w-full mt-[70px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          {filteredNames.map((data) => (
                            <li
                              key={data.id}
                              className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleNameClick(data.namaLengkap, data.id)
                              }
                            >
                              {data.namaLengkap}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="w-full flex flex-col items-start mt-3">
                      <Label className="block text-sm font-medium mb-1">
                        Tanggal Meninggal
                      </Label>
                      <Input
                        type="date"
                        id="deathDate"
                        name="deathDate"
                        value={formData.deathDate}
                        onChange={handleChange}
                        placeholder="Tanggal Wafat"
                        className="text-sm"
                      />
                    </div>

                    <div className="w-full flex flex-col items-start mt-3">
                      <Label className="block text-sm font-medium mb-1">
                        Keterangan
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Keterangan"
                        className="text-sm"
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="ml-auto"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Resume = ({
  formData,
  onPrev,
  onSubmit,
  selectedId,
  onFormDataUpdate,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pelaporData, setPelaporData] = useState(null);
  const profileImageUrl = "/profile.png";

  const getAnggotaById = async () => {
    try {
      const memberId = sessionStorage.getItem("selectedMemberId");
      const response = await GlobalApi.getUserById(memberId);
      const decodedString = atob(response.foto);
      setProfileImageUrl(decodedString);
    } catch (error) {
      console.error("Error Saat Mendapatkan Foto:", error);
    }
  };

  const fetchPelaporData = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      try {
        const laporanData = await GlobalApi.getUserById(userId);
        setPelaporData(laporanData);
      } catch (error) {
        console.error("Error fetching pelapor data:", error);
      }
    }
  };

  const fetchDataById = async () => {
    if (selectedId) {
      try {
  
        const response = await GlobalApi.getUserById(selectedId);
  

        onFormDataUpdate(response);
  

        const npaPgri = response?.npaPgri || "";
        sessionStorage.setItem("npaTerlapor", npaPgri);
  
        console.log("Respons API:", response);
        console.log("npaPgri berhasil disimpan ke sessionStorage:", npaPgri);
      } catch (error) {
        console.error(
          "Error fetching report data:",
          error.response?.data || error.message
        );
      }
    }
  };
  

  const toggleSidebar = () => {
    const newSidebarState = !isSidebarOpen;
    setIsSidebarOpen(newSidebarState);
    localStorage.setItem("isSidebarOpen", newSidebarState);
  };

  const formatPhoneNumber = (number) => {
    if (number && number.startsWith("+62")) {
      return "0" + number.slice(3);
    }
    return number;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;

    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  useEffect(() => {
    getAnggotaById();
    fetchDataById();
  }, [selectedId]);

  useEffect(() => {
    fetchPelaporData();
  }, [selectedId]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Toaster
            toastOptions={{
              style: {
                fontSize: "1.25rem",
                padding: "16px",
              },
              success: {
                style: {
                  background: "white",
                  color: "black",
                },
              },
              error: {
                style: {
                  background: "#f44336",
                  color: "#fff",
                },
              },
            }}
          />
          <div className="bg-gray-300 pt-9">
            <div className="relative max-w-xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden my-4 border border-gray-300">
              <div className="flex flex-col items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-lg">
                <Label className="block text-xl font-bold text-gray-700 mb-2">
                  ANGGOTA MENINGGAL
                </Label>
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src={
                      profileImageUrl.startsWith("data:image")
                        ? profileImageUrl
                        : "/profile.png"
                    }
                    alt="foto Anggota"
                    className="w-24 h-36 object-cover rounded-full border-4 border-gray-200 shadow-md"
                    width={110}
                    height={110}
                  />
                  <div className="flex flex-col items-center gap-1 text-gray-700">
                    <Label className="block text-sm font-medium text-center">
                      {formData.namaLengkap}
                    </Label>
                    <Label className="block text-sm font-medium mb-1">
                      {calculateAge(formData.tanggalLahir)} tahun
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      {formData.cabang}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      {formData.unitKerja}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      {formData.jabatan}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      Alamat rumah: {formData.alamat}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      Tanggal Meninggal: {formData.deathDate}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      Keterangan: {formData.description}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      No HP:{" "}
                      <Link
                        href={`https://wa.me/${
                          formData?.nomorHp?.startsWith("+62")
                            ? formData.nomorHp.replace("+62", "62")
                            : formData?.nomorHp || ""
                        }`}
                        className="text-blue-500"
                      >
                        {formatPhoneNumber(formData.nomorHp)} (WhatsApp)
                      </Link>
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      Maps alamat yang meninggal:{" "}
                      <Link
                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
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
                  <div className="flex flex-col items-center gap-1">
                    <Label className="block text-sm font-medium text-center">
                      {pelaporData?.namaLengkap}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      {pelaporData?.cabang}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      {pelaporData?.unitKerja}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      {pelaporData?.jabatan}
                    </Label>
                    <Label className="block text-sm font-medium text-center">
                      No HP:{" "}
                      <Link
                        href={`https://wa.me/${
                          formData?.nomorHp?.startsWith("+62")
                            ? formData.nomorHp.replace("+62", "62")
                            : formData?.nomorHp || ""
                        }`}
                        className="text-blue-500"
                      >
                        {formatPhoneNumber(formData.nomorHp)} (WhatsApp)
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
    </div>
  );
};

const Page = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: "",
    namaLengkap: "",
    cabang: "",
    unitKerja: "",
    deathDate: "",
    description: "",
  });
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [pelaporData, setPelaporData] = useState({
    namaLengkap: "",
    cabang: "",
    jabatan: "",
    nomorHp: "",
  });

  const handleNext = (memberId) => {
    setSelectedMemberId(memberId);
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];

      const reportData = {
        idTerlapor: formData.id,
        tanggalPelaporan: currentDate,
        namaPelapor: pelaporData?.memberName,
        cabangPelapor: pelaporData?.branch,
        jabatanPelapor: pelaporData?.position,
        nomorHpPelapor: pelaporData?.phone,
        cabangKhususTerlapor: formData.cabang,
        unitKerjaTerlapor: formData.unitKerja,
        namaAnggotaTerlapor: formData.namaLengkap,
        waktuMeninggalTerlapor: formData.deathDate,
        keteranganTerlapor: formData.description,
      };

      await GlobalApi.submitReport(reportData);

      sessionStorage.setItem("idTerlapor", formData.id);



      toast.success("Laporan berhasil ditambahkan!");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error("Gagal menambahkan laporan. Coba lagi nanti.");
    }
  };

  const handleFormDataUpdate = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }));
    setPelaporData((prevData) => ({
      ...prevData,
      ...data,
    }));
  };

  return (
    <div>
      {step === 1 && (
        <FormStep1
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
          setPelaporData={setPelaporData}
        />
      )}
      {step === 2 && (
        <Resume
          formData={formData}
          setFormData={setFormData}
          setPelaporData={setPelaporData}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          selectedId={selectedMemberId}
          onFormDataUpdate={handleFormDataUpdate}
        />
      )}
    </div>
  );
};

export default Page;
