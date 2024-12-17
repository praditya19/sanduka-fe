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
  const [selectedCabang, setSelectedCabang] = useState(
    silaporData?.cabang || ""
  );
  const dropdownRef = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [queryCabang, setQueryCabang] = useState("");
  const [showDropdownCabang, setShowDropdownCabang] = useState(false);
  const [queryUnit, setQueryUnit] = useState("");
  const [showDropdownUnit, setShowDropdownUnit] = useState(false);
  const [canProceed, setCanProceed] = useState(true);
  const [temanUnitKerjaData, setTemanUnitKerjaData] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");

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

  useEffect(() => {
    const unitsForSelectedCabang = unitKerjaOptions.filter(
      (unit) => unit.cabang === selectedCabang
    );
    setFilteredUnitKerja(unitsForSelectedCabang);
  }, [selectedCabang, unitKerjaOptions]);

  const handleCabangSelect = (cabang) => {
    setQueryCabang("");
    setSelectedCabang(cabang.kecamatan);
    setShowDropdownCabang(false);

    const unitsForSelectedCabang = unitKerjaOptions.filter(
      (unit) => unit.cabang === cabang.kecamatan
    );

    setFilteredUnitKerja(unitsForSelectedCabang);
  };

  useEffect(() => {
    if (silaporData) {
      setSelectedCabang(silaporData.cabang || "");
    }
  }, [silaporData]);

  useEffect(() => {
    const fetchTemanUnitKerja = async () => {
      if (!selectedUnitKerja) return;

      try {
        const response = await GlobalApi.getTemanUnitKerja(selectedUnitKerja);
        console.log("Data teman unit kerja yang diterima:", response);

        const temanData = Array.isArray(response?.content)
          ? response.content
          : [];
        setTemanUnitKerjaData(temanData);
        setFilteredNames(temanData);
        setIsDropdownVisible(true);
      } catch (error) {
        console.error("Error fetching teman unit kerja:", error);
        setTemanUnitKerjaData([]);
        setFilteredNames([]);
      }
    };

    fetchTemanUnitKerja();
  }, [selectedUnitKerja]);

  useEffect(() => {
    if (!Array.isArray(temanUnitKerjaData)) {
      setFilteredNames([]);
      return;
    }

    if (searchTerm.trim() === "") {
      setFilteredNames(temanUnitKerjaData);
    } else {
      const filtered = temanUnitKerjaData.filter((item) =>
        item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      setFilteredNames(filtered);
    }
  }, [searchTerm, temanUnitKerjaData]);

  const handleUnitKerjaChange = async (unitKerja) => {
    setShowDropdownUnit(false);
    setQueryUnit("");

    const response = await GlobalApi.getTemanUnitKerja(unitKerja);
    setTemanUnitKerjaData(response.content);

    setFormData((prev) => ({
      ...prev,
      unit: unitKerja,
    }));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchTerm(value);

    if (Array.isArray(temanUnitKerjaData)) {
      const filtered = temanUnitKerjaData.filter((item) =>
        item.namaLengkap.toLowerCase().includes(value)
      );
      setFilteredNames(filtered);
      setIsDropdownVisible(filtered.length > 0);
    } else {
      console.error("temanUnitKerjaData bukan array:", temanUnitKerjaData);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNameClick = (name, id) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      memberName: name,
      memberId: id,
    }));
    console.log(`Nama Anggota yang dipilih: ${name}, ID: ${id}`);
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
                      className="text-sm cursor-not-allowed"
                      value={formattedDate}
                      disabled
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="name"
                      placeholder="Nama"
                      className="text-sm cursor-not-allowed"
                      value={silaporData?.namaLengkap}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="branch"
                      placeholder="Cabang / Khusus"
                      className="text-sm cursor-not-allowed"
                      value={silaporData?.cabang}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="text"
                      id="position"
                      placeholder="Jabatan"
                      className="text-sm cursor-not-allowed"
                      value={silaporData?.jabatan}
                    />
                  </div>
                  <div className="w-full flex flex-col items-start mt-2">
                    <Input
                      type="number"
                      id="phone"
                      placeholder="Nomor Whatsapp"
                      className="text-sm cursor-not-allowed"
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
                        disabled={
                          sessionStorage.getItem("role") !== "SUPER ADMIN"
                        }
                        readOnly={
                          sessionStorage.getItem("role") !== "SUPER ADMIN"
                        }
                        onClick={() => {
                          if (
                            sessionStorage.getItem("role") === "SUPER ADMIN"
                          ) {
                            setShowDropdownCabang(true);
                          }
                        }}
                      />

                      {showDropdownCabang && (
                        <div
                          id="dropdownCabang"
                          className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[10%] w-full"
                        >
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                type="text"
                                className="border-b p-2 w-full bg-white"
                                placeholder="Cari Cabang..."
                                value={queryCabang}
                                onChange={(e) => {
                                  setQueryCabang(e.target.value);
                                }}
                                autoFocus
                              />
                            </li>
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
                        className="border rounded-lg p-2 w-full bg-white shadow-sm"
                        placeholder="Pilih Unit Kerja"
                        value={queryUnit || formData.unit}
                        readOnly
                        onChange={(e) => setQueryUnit(e.target.value)}
                        onClick={() => {
                          setQueryUnit("");
                          setShowDropdownUnit(true);
                        }}
                      />

                      {showDropdownUnit && filteredUnitKerja.length > 0 && (
                        <div
                          className="absolute z-10 border rounded-lg bg-white shadow-sm mt-[4.5%] w-[43%]"
                          id="dropdownUnit"
                        >
                          <ul className="max-h-44 overflow-y-auto">
                            <li className="py-2 px-2">
                              <Input
                                id="searchInput"
                                type="text"
                                className="border-b p-2 w-full bg-white mb-1"
                                placeholder="Cari Unit Kerja..."
                                value={queryUnit}
                                onChange={(e) => setQueryUnit(e.target.value)}
                                autoFocus
                              />
                            </li>
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
                                  .includes(queryUnit.toLowerCase())
                              )
                              .map((unit) => (
                                <li
                                  key={unit.id}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={async () => {
                                    await handleUnitKerjaChange(unit.unitKerja);
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
                        onFocus={() => {
                          setFilteredNames(temanUnitKerjaData);
                          setIsDropdownVisible(true);
                        }}
                        placeholder="Cari Nama Anggota"
                        className="text-sm"
                      />

                      {Array.isArray(filteredNames) &&
                        filteredNames.length > 0 &&
                        isDropdownVisible && (
                          <ul className="absolute left-0 w-full mt-[70px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                            {filteredNames.slice(0, 5).map((data) => (
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
                      {canProceed ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="ml-auto"
                        >
                          Next
                        </Button>
                      ) : (
                        <p className="text-red-500">
                          Pelaporan sudah dilakukan, tidak bisa melanjutkan.
                        </p>
                      )}
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
                <Button
                  type="button"
                  onClick={() => {
                    onPrev();
                    window.location.reload();
                  }}
                  className="mr-2"
                >
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
    npaPgri: "",
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

      const idList = JSON.parse(sessionStorage.getItem("idTerlaporList")) || [];
      const npaList =
        JSON.parse(sessionStorage.getItem("npaTerlaporList")) || [];

      idList.push(formData.id);
      npaList.push(formData.npaPgri);

      sessionStorage.setItem("idTerlaporList", JSON.stringify(idList));
      sessionStorage.setItem("npaTerlaporList", JSON.stringify(npaList));

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
          <strong
            style={{
              fontSize: "2rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Laporan Berhasil!
          </strong>
        </div>,
        {
          icon: null,
          duration: 4000,
          style: {
            marginTop: "16%",
            fontSize: "1.75rem",
            padding: "16px", 
            width: "80%",
            maxWidth: "500px",
            height: "auto",
            maxHeight: "500px",
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
        window.location.href = "/home";
      }, 4000);
    } catch (error) {
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
            <path d="M4.586 4.586l14.828 14.828a2 2 0 1 1-2.828 2.828L1.758 7.414a2 2 0 1 1 2.828-2.828z" />
          </svg>
          <strong
            style={{
              fontSize: "1.75rem",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Gagal menambahkan laporan.
          </strong>
        </div>,
        {
          icon: null,
          duration: 5000,
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
        }
      );
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
