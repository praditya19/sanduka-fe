"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import HeaderHome from "@/app/_components/HeaderHome";
import Sidebar from "@/app/_components/Sidebar";
import { Button } from "@/components/ui/button";

const data = [
  {
    dateLapor: "2024-01-10 09:00",
    name: "Alice Smith",
    age: 65,
    birthDate: "1959-01-10",
    workUnit: "Unit A",
    homeAddress: "Jl. Merpati No.1, Jakarta",
    cabang: "Jakarta",
    description: "Passed away due to old age.",
    diterimakan: "John Doe",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2020-02-12 10:00",
    name: "Bob Johnson",
    age: 72,
    birthDate: "1952-02-15",
    workUnit: "Unit B",
    homeAddress: "Jl. Kenari No.2, Bandung",
    cabang: "Bandung",
    description: "Heart attack.",
    diterimakan: "Mary Jane",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-05 11:30",
    name: "Carol Davis",
    age: 78,
    birthDate: "1946-03-22",
    workUnit: "Unit C",
    homeAddress: "Jl. Melati No.3, Surabaya",
    cabang: "Surabaya",
    description: "Passed away peacefully in her sleep.",
    diterimakan: "",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-15 14:00",
    name: "David Wilson",
    age: 70,
    birthDate: "1954-04-10",
    workUnit: "Unit D",
    homeAddress: "Jl. Bambu No.4, Medan",
    cabang: "Medan",
    description: "Complications from surgery.",
    diterimakan: "Anna Lee",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-05-20 08:00",
    name: "Emily Brown",
    age: 63,
    birthDate: "1961-05-05",
    workUnit: "Unit E",
    homeAddress: "Jl. Anggrek No.5, Yogyakarta",
    cabang: "Yogyakarta",
    description: "Cancer.",
    diterimakan: "James Carter",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-06-25 13:00",
    name: "Frank Miller",
    age: 75,
    birthDate: "1949-06-15",
    workUnit: "Unit F",
    homeAddress: "Jl. Cempaka No.6, Bali",
    cabang: "Bali",
    description: "Stroke.",
    diterimakan: "",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-07-10 07:00",
    name: "Grace Lee",
    age: 67,
    birthDate: "1957-07-20",
    workUnit: "Unit G",
    homeAddress: "Jl. Bunga No.7, Palembang",
    cabang: "Palembang",
    description: "Heart disease.",
    diterimakan: "Michael Scott",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-08-01 15:00",
    name: "Hannah Clark",
    age: 80,
    birthDate: "1944-08-05",
    workUnit: "Unit H",
    homeAddress: "Jl. Raya No.8, Jakarta",
    cabang: "Jakarta",
    description: "Old age.",
    diterimakan: "Emily Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-09-12 09:30",
    name: "Ian Lewis",
    age: 66,
    birthDate: "1958-09-10",
    workUnit: "Unit I",
    homeAddress: "Jl. Melati No.9, Makassar",
    cabang: "Makassar",
    description: "Accident.",
    diterimakan: "",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-10-18 12:00",
    name: "Jessica Harris",
    age: 71,
    birthDate: "1953-10-01",
    workUnit: "Unit J",
    homeAddress: "Jl. Mawar No.10, Surabaya",
    cabang: "Surabaya",
    description: "Cancer.",
    diterimakan: "Paul Adams",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-11-03 10:30",
    name: "Kevin Walker",
    age: 68,
    birthDate: "1956-11-15",
    workUnit: "Unit K",
    homeAddress: "Jl. Purnama No.11, Bandung",
    cabang: "Bandung",
    description: "Heart failure.",
    diterimakan: "Sara White",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-12-20 16:00",
    name: "Laura Martinez",
    age: 73,
    birthDate: "1951-12-20",
    workUnit: "Unit L",
    homeAddress: "Jl. Seroja No.12, Jakarta",
    cabang: "Jakarta",
    description: "Respiratory failure.",
    diterimakan: "Tom Brown",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-01-22 14:30",
    name: "Michael Allen",
    age: 69,
    birthDate: "1955-01-15",
    workUnit: "Unit M",
    homeAddress: "Jl. Kuning No.13, Yogyakarta",
    cabang: "Yogyakarta",
    description: "Heart attack.",
    diterimakan: "Linda Scott",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-02-28 11:00",
    name: "Nancy Robinson",
    age: 64,
    birthDate: "1960-02-20",
    workUnit: "Unit N",
    homeAddress: "Jl. Wulan No.14, Medan",
    cabang: "Medan",
    description: "Stroke.",
    diterimakan: "",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2020-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2024-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2020-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2020-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2020-03-19 09:00",
    name: "Oscar Young",
    age: 77,
    birthDate: "1947-03-12",
    workUnit: "Unit O",
    homeAddress: "Jl. Pinang No.15, Palembang",
    cabang: "Palembang",
    description: "Old age.",
    diterimakan: "Emily Davis",
    photoUrl: "/profile.png",
  },
  {
    dateLapor: "2020-04-30 15:45",
    name: "Patricia Moore",
    age: 81,
    birthDate: "1943-04-25",
    workUnit: "Unit P",
    homeAddress: "Jl. Kenanga No.16, Bali",
    cabang: "Bali",
    description: "Cancer.",
    diterimakan: "Daniel Green",
    photoUrl: "/profile.png",
  },
];
const months = [
  { name: "January", value: "01" },
  { name: "February", value: "02" },
  { name: "March", value: "03" },
  { name: "April", value: "04" },
  { name: "May", value: "05" },
  { name: "June", value: "06" },
  { name: "July", value: "07" },
  { name: "August", value: "08" },
  { name: "September", value: "09" },
  { name: "October", value: "10" },
  { name: "November", value: "11" },
  { name: "December", value: "12" },
];

const Page = () => {
  const [filter, setFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique years from data
  const getUniqueYears = () => {
    const years = new Set(
      data.map((item) => new Date(item.dateLapor).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  const years = getUniqueYears();

  const filteredData = data
    .filter((item) => {
      const isDateLaporMatch =
        item.dateLapor.toLowerCase().includes(filter.toLowerCase()) ||
        item.cabang.toLowerCase().includes(filter.toLowerCase());

      const isMonthMatch =
        !selectedMonth || item.dateLapor.includes(`-${selectedMonth}-`);

      const isYearMatch =
        !selectedYear ||
        new Date(item.dateLapor).getFullYear() === Number(selectedYear);

      return isDateLaporMatch && isMonthMatch && isYearMatch;
    })
    .sort((a, b) => new Date(b.dateLapor) - new Date(a.dateLapor)); // Sort data by dateLapor in descending order

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
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
              <h1 className="text-base">Rekap Meninggal</h1>
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
          <div className="w-full p-4 container shadow-lg rounded-lg">
            <div className="rounded-md flex flex-col py-4 mt-12">
              <div className="container px-2">
                <h2 className="text-base md:text-base font-bold mb-4 text-center">
                  REKAP MENINGGAL
                </h2>
                <div className="w-full flex mb-4 text-sm relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 pl-10 border rounded max-w-sm w-full"
                  />
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
                  />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded ml-4"
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="p-2 border rounded ml-4"
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between mb-4">
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-2 border rounded"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <Table className="w-full table-auto text-sm mb-8">
                  <TableHeader className="p-2 md:p-3 border bg-green-300">
                    <TableRow>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        No
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        Foto
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        Data Lapor
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        Data Meninggal
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        Cabang
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        Keterangan
                      </TableHead>
                      <TableHead className="border border-gray-300 p-2 text-center font-bold uppercase bg-teal-700 text-white">
                        Diterimakan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                      >
                        <TableCell className="text-center border">
                          {indexOfFirstItem + index + 1}
                        </TableCell>
                        <TableCell className="border">
                          <Image
                            src={item.photoUrl}
                            alt={item.name}
                            className="rounded-full mx-auto"
                            width={100}
                            height={100}
                          />
                        </TableCell>
                        <TableCell className="border">
                          {item.dateLapor} <br />
                          {item.dateLapor.split(" ")[0]} <br />
                          {item.name} <br />
                          {item.cabang} <br />
                          {item.workUnit}
                        </TableCell>
                        <TableCell className="border">
                          {item.name} <br />
                          {item.age} years <br />
                          {item.birthDate} <br />
                          {item.workUnit} <br />
                          {item.homeAddress}
                        </TableCell>
                        <TableCell className="border text-center">
                          {item.cabang}
                        </TableCell>
                        <TableCell className="border">
                          {item.description} <br />
                          {item.dateLapor} <br />
                          {item.description}
                        </TableCell>
                        <TableCell className="text-center border">
                          {item.diterimakan ? (
                            <span className="text-green-600">
                              SUDAH TERIMAKAN
                            </span>
                          ) : (
                            <span className="text-red-600">
                              BELUM DITERIMAKAN
                            </span>
                          )}
                          <br />
                          {item.diterimakan || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end items-center mb-4">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="mr-2"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center">
                    {totalPages > 1 && (
                      <ul className="flex space-x-1">
                        {/* Calculate the range of pages to display */}
                        {(() => {
                          let startPage = Math.max(1, currentPage - 1);
                          let endPage = Math.min(totalPages, currentPage + 1);

                          if (currentPage === 1) {
                            endPage = Math.min(3, totalPages);
                          } else if (currentPage === totalPages) {
                            startPage = Math.max(totalPages - 2, 1);
                          } else if (totalPages - currentPage < 2) {
                            startPage = Math.max(totalPages - 2, 1);
                          }

                          return Array.from(
                            { length: endPage - startPage + 1 },
                            (_, i) => startPage + i
                          );
                        })().map((number) => (
                          <li key={number}>
                            <Button
                              onClick={() => handlePageClick(number)}
                              className={`mx-1 px-4 py-2 border rounded-md ${
                                currentPage === number
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-black"
                              }`}
                            >
                              {number}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="ml-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
