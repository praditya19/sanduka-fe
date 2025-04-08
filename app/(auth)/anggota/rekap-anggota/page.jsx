"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";

function RekapAnggota() {
  const [data, setData] = useState([]);
  const { token } = useAuth();
  const router = useRouter();
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [originalRekapData, setOriginalRekapData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [totals, setTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    iuran: 0,
  });
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchCabang, setSearchCabang] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState('');
  const [nominal, setNominal] = useState('');

  useEffect(() => {
    const fetchCabangData = async () => {
      try {
        const response = await GlobalApi.getCabang();
        setOriginalCabangList(response.data);
        setFilteredCabangList(response.data);
      } catch (error) {
        console.error("Error fetching cabang data:", error);
      }
    };
    fetchCabangData();
  }, [unitKerjaList]);

  useEffect(() => {
    const fetchUnitKerjaData = async () => {
      try {
        const response = await GlobalApi.getUnitKerja();
        setUnitKerjaList(response.data);
      } catch (error) {
        console.error("Error fetching unit kerja data:", error);
      }
    };
    fetchUnitKerjaData();
  }, []);

  const handleUnitKerjaFocus = () => {
    if (selectedCabang) {
      setShowUnitKerjaDropdown(true);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setIsPopupVisible(true);
  };

  const handleSave = () => {
    if (!selectedKategori || !nominal) {
      alert('Kategori dan nominal harus diisi!');
      return;
    }
  
    // Kirim data ke backend atau state lokal
    console.log('Data Tersimpan:', {
      kategori: selectedKategori,
      nominal: parseInt(nominal),
    });
  
    // Reset form setelah simpan
    setSelectedKategori('');
    setNominal('');
    setShowDropdown(false);
  };  

  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
    setSelectedUnitKerja(input);

    if (!selectedCabang) return;

    const filteredList = unitKerjaList.filter(
      (unitKerja) =>
        unitKerja.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
        unitKerja.unitKerja.toLowerCase().includes(input.toLowerCase())
    );

    setShowUnitKerjaDropdown(true);
    setFilteredUnitKerja(filteredList);

    if (input === "") {
      const cabangData = originalRekapData.filter((item) =>
        selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true
      );
      const processed = processData(cabangData);
      setGroupedData(processed);
      setData(cabangData);
      calculateTotals(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase().includes(input.toLowerCase())
      );
      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCabangList(filtered);
    setSearchCabang(query);
  };

  const handleSelectCabang = async (cabang) => {
    setSelectedCabang(cabang.kecamatan);
    setShowCabangDropdown(false);
    setSelectedUnitKerja("");
    setUnitKerjaInput("");
    setSearchCabang("");

    try {
      const response = await GlobalApi.getNominalAggregatedData(
        cabang.kecamatan || ""
      );

      const totalRow = response.find(
        (item) => item.cabang === "Total" && !item.unitKerja
      );
      const regularData = response.filter(
        (item) => !(item.cabang === "Total" && !item.unitKerja)
      );

      if (totalRow) {
        setGrandTotals({
          jumlah: parseInt(totalRow.jumlah) || 0,
          pgri: parseFloat(totalRow.pgri) || 0,
          sanduka: parseFloat(totalRow.sanduka) || 0,
          daspen: parseFloat(totalRow.daspen) || 0,
          totalIuran: parseFloat(totalRow.totalIuran) || 0,
        });
      }

      setData(regularData);
      setOriginalRekapData(regularData);

      const processed = processData(regularData);
      setGroupedData(processed);

      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.cabang &&
          unitKerja.cabang.toLowerCase() ===
            (cabang.kecamatan || "").toLowerCase()
      );
      setFilteredUnitKerja(filtered);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    }
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    setSearchUnitKerja(searchTerm);
    if (searchTerm === "") {
      const allFiltered = unitKerjaList.filter(
        (unitKerja) => unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(allFiltered);
    } else {
      const filtered = unitKerjaList.filter(
        (unitKerja) =>
          unitKerja.unitKerja
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          unitKerja.cabang === selectedCabang
      );
      setFilteredUnitKerja(filtered);
    }
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    const selectedValue = unitKerja.unitKerja;
    setSelectedUnitKerja(selectedValue);
    setUnitKerjaInput(selectedValue);
    setShowUnitKerjaDropdown(false);
    setSearchUnitKerja("");

    if (!selectedValue) {
      const cabangData = originalRekapData.filter((item) =>
        selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true
      );
      const processed = processData(cabangData);
      setGroupedData(processed);
      setData(cabangData);
      calculateTotals(cabangData);
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          (!selectedCabang ||
            item.cabang?.toLowerCase() === selectedCabang.toLowerCase()) &&
          item.unitKerja?.toLowerCase() === selectedValue.toLowerCase()
      );
      const processed = processData(filteredData);
      setGroupedData(processed);
      setData(filteredData);
      calculateTotals(filteredData);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const processData = (rawData) => {
    const grouped = rawData.reduce((acc, item) => {
      const unitKey = item.unitKerja || "Tidak Ada Unit Kerja";
      const cabangKey = item.cabang || "Tidak Ada Cabang";

      if (!acc[unitKey]) {
        acc[unitKey] = {
          unitKerja: unitKey,
          cabang: cabangKey,
          members: [],
          jumlah: 0,
          pgri: 0,
          sanduka: 0,
          daspen: 0,
          totalIuran: 0,
        };
      }
      acc[unitKey].members.push({
        namaAnggota: item.namaAnggota,
        pgri: parseFloat(item.pgri) || 0,
        sanduka: parseFloat(item.sanduka) || 0,
        daspen: parseFloat(item.daspen) || 0,
        totalIuran: parseFloat(item.totalIuran) || 0,
      });
      acc[unitKey].jumlah += 1;
      acc[unitKey].pgri += parseFloat(item.pgri) || 0;
      acc[unitKey].sanduka += parseFloat(item.sanduka) || 0;
      acc[unitKey].daspen += parseFloat(item.daspen) || 0;
      acc[unitKey].totalIuran += parseFloat(item.totalIuran) || 0;
      return acc;
    }, {});
    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedRole = sessionStorage.getItem("role");
        const storedCabang = sessionStorage.getItem("cabang");

        if (storedRole === "ADMIN" && storedCabang) {
          setIsAdmin(true);
          setSelectedCabang(storedCabang);
          const response = await GlobalApi.getNominalAggregatedData(
            storedCabang
          );
          const totalRow = response.find(
            (item) => item.cabang === "Total" && !item.unitKerja
          );
          const regularData = response.filter(
            (item) => !(item.cabang === "Total" && !item.unitKerja)
          );

          if (totalRow) {
            setGrandTotals({
              jumlah: parseInt(totalRow.jumlah) || 0,
              pgri: parseFloat(totalRow.pgri) || 0,
              sanduka: parseFloat(totalRow.sanduka) || 0,
              daspen: parseFloat(totalRow.daspen) || 0,
              totalIuran: parseFloat(totalRow.totalIuran) || 0,
            });
          }

          const processed = processData(regularData);
          setGroupedData(processed);
          setData(regularData);
          setOriginalRekapData(regularData);
        } else {
          const response = await GlobalApi.getNominalAggregatedData("");

          const totalRow = response.find(
            (item) => item.cabang === "Total" && !item.unitKerja
          );
          const regularData = response.filter(
            (item) => !(item.cabang === "Total" && !item.unitKerja)
          );

          if (totalRow) {
            setGrandTotals({
              jumlah: parseInt(totalRow.jumlah) || 0,
              pgri: parseFloat(totalRow.pgri) || 0,
              sanduka: parseFloat(totalRow.sanduka) || 0,
              daspen: parseFloat(totalRow.daspen) || 0,
              totalIuran: parseFloat(totalRow.totalIuran) || 0,
            });
          }

          const processed = processData(regularData);
          setGroupedData(processed);
          setData(regularData);
          setOriginalRekapData(regularData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [unitKerjaList]);

  const toggleExpand = (unitKerja) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitKerja)) {
        newSet.delete(unitKerja);
      } else {
        newSet.add(unitKerja);
      }
      return newSet;
    });
  };

  const calculateTotals = (dataArray) => {
    const newTotals = dataArray.reduce(
      (acc, item) => ({
        jumlah: acc.jumlah + (parseInt(item.jumlah) || 0),
        pgri: acc.pgri + (parseFloat(item.pgri) || 0),
        sanduka: acc.sanduka + (parseFloat(item.sanduka) || 0),
        daspen: acc.daspen + (parseFloat(item.daspen) || 0),
        iuran: acc.iuran + (parseFloat(item.totalIuran) || 0),
      }),
      {
        jumlah: 0,
        pgri: 0,
        sanduka: 0,
        daspen: 0,
        iuran: 0,
      }
    );
    setTotals(newTotals);
  };

  const [grandTotals, setGrandTotals] = useState({
    jumlah: 0,
    pgri: 0,
    sanduka: 0,
    daspen: 0,
    totalIuran: 0,
  });

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  useEffect(() => {
    const sidebarState = localStorage.getItem("isSidebarOpen") === "true";
    setIsSidebarOpen(sidebarState);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handlePrint = async () => {
    try {
      if (!groupedData || groupedData.length === 0) {
        console.error("Data kosong, tidak dapat mencetak.");
        return;
      }

      const titleText = `Rekap By Nominal${
        selectedCabang ? ` Cabang ${selectedCabang}` : ""
      }${selectedUnitKerja ? ` Unit Kerja ${selectedUnitKerja}` : ""}`;

      const htmlContent = `
        <html>
          <head>
            <title>Rekap By Nominal</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: center; }
              th { background-color: #00796b; color: white; }
              .total-row { font-weight: bold; background-color: #f5f5f5; }
              .member-list { text-align: left; padding-left: 20px; }
              @media print {
                .no-print { display: none; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                th { color: #00796b; }
                tfoot { display: table-footer-group; }
              }
              @page { margin: 15mm; }
            </style>
          </head>
          <body>
            <div class="title">${titleText}</div>
            <table>
              <thead>
                <tr>
                  <th rowspan="2">No</th>
                  <th rowspan="2">Cabang</th>
                  <th rowspan="2">Unit Kerja</th>
                  <th rowspan="2">Nama Anggota</th>
                  <th rowspan="2">Jumlah Anggota</th>
                  <th colspan="3">Jumlah</th>
                  <th rowspan="2">Total</th>
                </tr>
                <tr>
                  <th>PGRI</th>
                  <th>Sanduka</th>
                  <th>Daspen</th>
                </tr>
              </thead>
              <tbody>
                ${groupedData
                  ?.map((group, index) => {
                    const members = group.members || [];
                    return members
                      ?.map(
                        (member, memberIndex) => `
                    <tr>
                      ${
                        memberIndex === 0
                          ? `
                        <td rowspan="${members.length}">${index + 1}</td>
                        <td rowspan="${members.length}">${group.cabang}</td>
                        <td rowspan="${members.length}">${group.unitKerja}</td>
                      `
                          : ""
                      }
                      <td class="member-list">${member.namaAnggota}</td>
                      ${
                        memberIndex === 0
                          ? `<td rowspan="${members.length}">${
                              group.jumlah || 0
                            }</td>`
                          : ""
                      }
                      <td>Rp. ${parseInt(member.pgri || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.sanduka || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.daspen || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                      <td>Rp. ${parseInt(member.totalIuran || 0).toLocaleString(
                        "id-ID"
                      )}</td>
                    </tr>
                  `
                      )
                      .join("");
                  })
                  .join("")}
                <tr class="total-row">
                  <td colspan="4" style="text-align: center">Total Keseluruhan :</td>
                  <td>${grandTotals?.jumlah || 0}</td>
                  <td>Rp. ${parseInt(grandTotals?.pgri || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.sanduka || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(grandTotals?.daspen || 0).toLocaleString(
                    "id-ID"
                  )}</td>
                  <td>Rp. ${parseInt(
                    grandTotals?.totalIuran || 0
                  ).toLocaleString("id-ID")}</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      printFrame.srcdoc = htmlContent;
      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        printFrame.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    } catch (error) {
      console.error("Error during print process:", error);
    }
  };

  const renderCabangInput = () => {
    return (
      <div className="flex flex-col relative w-64" ref={cabangRef}>
        <Input
          type="text"
          value={selectedCabang}
          readOnly
          onClick={!isAdmin ? handleCabangClick : undefined}
          className={`block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out ${
            isAdmin ? "bg-gray-100" : ""
          }`}
          placeholder="Pilih Cabang"
          disabled={isAdmin}
        />
        {!isAdmin && showCabangDropdown && (
          <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
            <ul className="max-h-44 overflow-y-auto">
              <li className="py-2 px-2">
                <Input
                  type="text"
                  value={searchCabang}
                  onChange={(e) => handleCabangSearch(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                  placeholder="Cari Cabang..."
                  autoFocus
                />
              </li>
              <li
                onClick={() => handleSelectCabang({ kecamatan: "" })}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                Pilih Cabang
              </li>
              {filteredCabangList.map((cabang) => (
                <li
                  key={cabang.id}
                  onClick={() => handleSelectCabang(cabang)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {cabang.kecamatan}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderUnitKerjaInput = () => (
    <div className="flex flex-col relative w-64" ref={unitKerjaRef}>
      <Input
        type="text"
        value={unitKerjaInput}
        onChange={handleUnitKerjaChange}
        onFocus={handleUnitKerjaFocus}
        placeholder="Pilih Unit Kerja"
        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
        disabled={!selectedCabang}
      />
      {showUnitKerjaDropdown && (
        <div className="absolute z-10 border rounded-lg bg-white shadow-sm mt-11 w-full">
          <ul className="max-h-44 overflow-y-auto">
            <li className="py-2 px-2">
              <Input
                type="text"
                value={searchUnitKerja}
                onChange={(e) => handleUnitKerjaSearch(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition duration-150 ease-in-out mt-1"
                placeholder="Cari Unit Kerja..."
                autoFocus
              />
            </li>
            <li
              onClick={() => handleUnitKerjaSelect({ unitKerja: "" })}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              Pilih Unit Kerja
            </li>
            {filteredUnitKerja.map((unitKerja) => (
              <li
                key={unitKerja.id}
                onClick={() => handleUnitKerjaSelect(unitKerja)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {unitKerja.unitKerja}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const FilterSection = ({
    renderCabangInput,
    renderUnitKerjaInput,
    isMobile,
  }) => {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block mb-2 text-sm">Cabang</label>
              {renderCabangInput()}
            </div>
            <div>
              <label className="block mb-2 text-sm">Unit Kerja</label>
              {renderUnitKerjaInput()}
            </div>
          </div>
          {isMobile && (
            <Button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              Cetak
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="mb-6 mx-4 md:mx-12">
            <div className="flex flex-wrap items-start mt-14 justify-between">
              <div className="flex flex-wrap items-center space-x-2">
                <FilterSection
                  renderCabangInput={renderCabangInput}
                  renderUnitKerjaInput={renderUnitKerjaInput}
                  isMobile={isMobile}
                />
              </div>
              {!isMobile && (
                <div className="flex items-end mt-2 md:mt-0">
                  <button
                    onClick={handlePrint}
                    className="p-2 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <span>Cetak</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                      <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg mx-4 md:mx-12">
            <div className="bg-teal-700 p-4 rounded-t-lg">
              <h2 className="text-white text-xl font-semibold">
                Laporan Tagihan
              </h2>
              <p className="text-teal-100 text-sm">
                Daftar iuran anggota per unit kerja
              </p>
            </div>

            <table className="w-full table-auto bg-white">
              <thead>
                <tr>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tl-lg"
                    rowSpan="2"
                  >
                    No
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600"
                    rowSpan="2"
                  >
                    Cabang
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600"
                    rowSpan="2"
                  >
                    Unit Kerja
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600"
                    rowSpan="2"
                  >
                    Nama Anggota
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell"
                    rowSpan="2"
                  >
                    Jumlah Anggota
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell text-center"
                    colSpan="3"
                  >
                    Jumlah
                  </th>
                  <th
                    className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 rounded-tr-lg w-36"
                    rowSpan="2"
                  >
                    Total
                  </th>
                </tr>
                <tr>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    PGRI
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Sanduka
                  </th>
                  <th className="p-3 border-b-2 border-teal-500 text-white bg-teal-600 hidden lg:table-cell">
                    Daspen
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((group, index) => {
                  const isExpanded = expandedRows.has(group.unitKerja);
                  const rowSpanCount = isExpanded
                    ? group.members.length + 1
                    : 1;

                  return (
                    <React.Fragment key={group.unitKerja}>
                      <tr
                        className={index % 2 === 0 ? "bg-white" : "bg-teal-50"}
                      >
                        <td
                          className="p-3 border-b text-center"
                          rowSpan={rowSpanCount}
                        >
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-3 border-b" rowSpan={rowSpanCount}>
                          {group.cabang}
                        </td>
                        <td
                          className="p-3 border-b font-medium"
                          rowSpan={rowSpanCount}
                        >
                          {group.unitKerja}
                        </td>
                        <td className="p-3 border-b text-center">
                          <Button
                            className="text-teal-600 bg-transparent hover:bg-teal-50 hover:text-teal-700 rounded-full p-2 transition-all duration-200"
                            onClick={() => toggleExpand(group.unitKerja)}
                          >
                            {isExpanded ? (
                              <span className="flex items-center gap-1">
                                <FaMinusCircle />{" "}
                                <span className="text-sm">Tutup</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FaPlusCircle />{" "}
                                <span className="text-sm">Detail</span>
                              </span>
                            )}
                          </Button>
                        </td>
                        <td
                          className="p-3 border-b text-center hidden lg:table-cell font-medium"
                          rowSpan={rowSpanCount}
                        >
                          {group.jumlah}
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. {parseInt(group.pgri).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp.{" "}
                            {parseInt(group.sanduka).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center hidden lg:table-cell">
                          <span className="text-gray-700">
                            Rp. {parseInt(group.daspen).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3 border-b text-center font-semibold">
                          <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full">
                            Rp.{" "}
                            {parseInt(group.totalIuran).toLocaleString("id-ID")}
                          </span>
                        </td>
                      </tr>
                      {isExpanded &&
                        group.members.map((member, idx) => (
                          <tr
                            key={`${group.unitKerja}-member-${idx}`}
                            className="bg-teal-50/30 hover:bg-teal-50"
                          >
                            <td
                              className="p-3 border-b"
                              colSpan={isMobile ? 5 : 1}
                            >
                              <div className="flex flex-col lg:flex-row">
                                <div className="font-medium mb-2 lg:mb-0 flex items-center">
                                  <span className="w-6 h-6 flex items-center justify-center bg-teal-200 text-teal-800 rounded-full mr-2 text-xs">
                                    {idx + 1}
                                  </span>
                                  <span
  onClick={() => handleMemberClick(member)}
  className="text-teal-700 hover:underline cursor-pointer"
>
  {member.namaAnggota}
</span>
                                </div>
                                <div className="lg:hidden space-y-2 mt-2 bg-white p-3 rounded-lg shadow-sm">
                                  <div className="flex justify-between px-4">
                                    <span className="font-medium text-teal-700">
                                      PGRI:
                                    </span>
                                    <span>
                                      Rp.{" "}
                                      {parseInt(member.pgri).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between px-4">
                                    <span className="font-medium text-teal-700">
                                      Sanduka:
                                    </span>
                                    <span>
                                      Rp.{" "}
                                      {parseInt(member.sanduka).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between px-4">
                                    <span className="font-medium text-teal-700">
                                      Daspen:
                                    </span>
                                    <span>
                                      Rp.{" "}
                                      {parseInt(member.daspen).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between px-4 font-medium bg-teal-100 p-2 rounded-lg">
                                    <span className="text-teal-800">
                                      Total:
                                    </span>
                                    <span className="text-teal-800">
                                      Rp.{" "}
                                      {parseInt(
                                        member.totalIuran
                                      ).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.pgri).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.sanduka).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              Rp.{" "}
                              {parseInt(member.daspen).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 border-b text-center hidden lg:table-cell">
                              <span className="bg-teal-100 text-teal-800 py-1 px-2 rounded-full text-sm">
                                Rp.{" "}
                                {parseInt(member.totalIuran).toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
              {isPopupVisible && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl relative space-y-6">
      {/* Tombol Tutup */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-teal-600 text-xl"
        onClick={() => setIsPopupVisible(false)}
      >
        ✕
      </button>

      {/* Judul Form */}
      <h2 className="text-center text-2xl font-bold text-white bg-red-700 py-2 rounded">
        Form Keuangan
      </h2>

      {/* Bagian Data Diri & Sinkronisasi */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Kiri: Foto + Data Diri */}
        <div className="flex gap-4 w-full md:w-2/3">
          <img
            src="https://via.placeholder.com/100" // Ganti dengan foto asli jika ada
            alt="Profile"
            className="w-24 h-28 object-cover rounded-lg border"
          />
          <div className="text-sm space-y-1">
            <p><strong>ANI WIDIASTUTI</strong></p>
            <p>Tempat, Tanggal Lahir: JEPARA, 1-9-19821</p>
            <p>Nomor Anggota PGRI: 332017900001</p>
            <p>Nomor Induk Pegawai: 198209012022212018</p>
            <p>Nomor Induk Kependudukan: 3320084109820008</p>
          </div>
        </div>

        {/* Kanan: Info Singkat */}
        <div className="w-full md:w-1/3 text-sm">
          <p><strong>BANGSRI</strong>, Guru</p>
          <p>SDN BANGSRI 6</p>
          <div className="flex items-center mt-2 gap-2 text-teal-600">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="4"></circle>
            </svg>
            Sinkronisasi Otomatis
          </div>
        </div>
      </div>

      {/* Form Keuangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kiri: Daftar Kategori */}
        <div className="space-y-2">
          {[
            { label: "Iuran Anggota", value: 8000 },
            { label: "Sanduka", value: 3000 },
            { label: "Daspen", value: 17000 },
            { label: "Kalender", value: 17500 },
            { label: "Derap", value: 17500 },
            { label: "Sumbangan HUT", value: 50000 }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-purple-100 px-3 py-2 rounded-md">
              <span>{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Rp. {item.value.toLocaleString()}</span>
                <button className="text-teal-600">🔄</button>
                <button className="text-blue-500">🔍</button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between bg-purple-200 px-3 py-2 rounded-md font-bold">
            <span>Total</span>
            <span>Rp. 150.000</span>
          </div>
        </div>

        {/* Kanan: Tambah Kategori */}
        <div className="bg-gray-100 rounded-md p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">Tambah Keuangan</h3>
          
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center text-teal-600 hover:text-teal-800 mb-3"
          >
            <span className="text-xl mr-2">➕</span> Tambah Kategori
          </button>

          {showDropdown && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Pilih Kategori Tambahan</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                >
                  <option value="">-- Pilih --</option>
                  <option value="iuran">Iuran</option>
                  <option value="derap">Derap</option>
                  <option value="kalender">Kalender</option>
                  <option value="lain-lain">Lain-Lain</option>
                </select>
              </div>

              {selectedKategori && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Nominal</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Masukkan nominal"
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md"
                  >
                    Simpan
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end gap-4 pt-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md">
          SAVE
        </button>
        <button className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-md">
          RESET
        </button>
      </div>
    </div>
  </div>
)}
              <tfoot>
                <tr className="bg-teal-700 text-white font-bold">
                  <td
                    colSpan={isMobile ? 3 : 4}
                    className="p-3 border-t-2 border-teal-800 text-center rounded-bl-lg"
                  >
                    Total Keseluruhan:
                  </td>
                  <td className="p-3 border-t-2 border-teal-800 text-center">
                    {grandTotals.jumlah}
                  </td>
                  {!isMobile && (
                    <>
                      <td className="p-3 border-t-2 border-teal-800 text-center">
                        Rp. {parseInt(grandTotals.pgri).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 border-t-2 border-teal-800 text-center">
                        Rp.{" "}
                        {parseInt(grandTotals.sanduka).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 border-t-2 border-teal-800 text-center">
                        Rp.{" "}
                        {parseInt(grandTotals.daspen).toLocaleString("id-ID")}
                      </td>
                    </>
                  )}
                  <td className="p-3 border-t-2 border-teal-800 text-center rounded-br-lg">
                    Rp.{" "}
                    {parseInt(grandTotals.totalIuran).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="bg-white p-4 rounded-b-lg border-t border-gray-200 text-sm text-gray-500 flex justify-between">
              <div>Menampilkan {groupedData.length} unit kerja</div>
              <div>Total anggota: {grandTotals.jumlah}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RekapAnggota;
