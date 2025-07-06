"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import HeaderMenu from "@/app/_components/HeaderMenu";
import HeaderMobile from "@/app/_components/HeaderMobile";
import Sidebar from "@/app/_components/Sidebar";
import { useAuth } from "@/app/AuthContext";
import GlobalApi from "@/app/_utils/GlobalApi";
import { Input } from "@/components/ui/input";
import {
  FaDollarSign,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaUndo,
  FaTrash,
  FaPrint,
  FaFileExcel,
  FaEdit,
  FaWallet,
  FaChevronDown,
  FaCalendarAlt,
  FaPlusCircle,
  FaFolderOpen,
  FaBoxOpen,
  FaBuilding,
  FaMoneyBill,
  FaStickyNote,
  FaBullseye,
  FaDownload,
} from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown, FaSliders } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import * as XLSX from "xlsx";
import { subMonths, endOfMonth } from "date-fns";

const NotificationPopup = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-500 text-3xl" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative ${getBgColor()} rounded-lg p-8 shadow-xl z-10 w-96 text-center transform transition-all duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2  hover:text-red-700 transition-colors"
          aria-label="Close"
        >
          <FaTimesCircle size={24} />
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">{getIcon()}</div>

          <h3 className={`text-xl font-bold ${getTextColor()}`}>
            {type === "success" ? "Berhasil!" : "Gagal!"}
          </h3>

          <div className={`${getTextColor()} text-center`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

function KasUmum() {
  const dropdownRef = useRef();
  const { token } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("penerimaan");
  const [tglPenerimaan, setTglPenerimaan] = useState("");
  const [jenisPenerimaan, setJenisPenerimaan] = useState("");
  const [PosPenerimaan, setPosPenerimaan] = useState("");
  const [cabangPenerimaan, setCabangPenerimaan] = useState("");
  const [setoranBulan, setSetoranBulan] = useState("");
  const [setoranTahun, setSetoranTahun] = useState("");
  const [defaultMonth, setDefaultMonth] = useState("");
  const [nominalPenerimaan, setNominalPenerimaan] = useState("");
  const [keteranganPenerimaan, setKeteranganPenerimaan] = useState("");

  const [tglPengeluaran, setTglPengeluaran] = useState("");
  const [jenisPengeluaran, setJenisPengeluaran] = useState("");
  const [PosPengeluaran, setPosPengeluaran] = useState("");
  const [cabangPengeluaran, setCabangPengeluaran] = useState("");
  const [setoranBulanPengeluaran, setSetoranBulanPengeluaran] = useState("");
  const [setoranTahunPengeluaran, setSetoranTahunPengeluaran] = useState("");
  const [defaultMonthPengeluaran, setDefaultMonthPengeluaran] = useState("");
  const [nominalPengeluaran, setNominalPengeluaran] = useState("");
  const [keteranganPengeluaran, setKeteranganPengeluaran] = useState("");
  const [yangMeninggal, setYangMeninggal] = useState("");
  const [namaPenerima, setNamaPenerima] = useState("");

  const [saldoAkhirBulanSebelumnya, setSaldoAkhirBulanSebelumnya] = useState(0);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [saldoAwalTransaksi, setSaldoAwalTransaksi] = useState(null);

  const [posPenerimaanUmum, setPosPenerimaanUmum] = useState([]);
  const [posPengeluaranUmum, setPosPengeluaranUmum] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [searchCabang, setSearchCabang] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPosPenerimaanModal, setShowPosPenerimaanModal] = useState(false);
  const [newPosPenerimaan, setNewPosPenerimaan] = useState("");

  const [showPosPengeluaranModal, setShowPosPengeluaranModal] = useState(false);
  const [newPosPengeluaran, setNewPosPengeluaran] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    tanggalTransaksi: "",
    pos: "",
    setoranBulan: "",
    setoranTahun: "",
    jenis: "",
    cabang: "",
    nominal: "",
    keterangan: "",
    yangMeninggal: "",
    namaPenerima: "",
  });
  const [editJenis, setEditJenis] = useState("");
  const [loading, setLoading] = useState(false);
  const [rincianOperasional, setRincianOperasional] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    hasil15: 0,
  });
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = now.getFullYear();
  const [bulanMeninggal, setBulanMeninggal] = useState("");
  const [tahunMeninggal, setTahunMeninggal] = useState("");
  const tahunOptions = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );
  const [listMeninggal, setListMeninggal] = useState([]);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const years = Array.from(
    { length: currentYear - 2021 + 1 },
    (_, i) => 2021 + i
  );

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const getMonthName = (monthValue) => {
    const month = months.find((m) => m.value === monthValue);
    return month ? month.label : "";
  };

  const fetchData = async () => {
    try {
      const penerimaan = await GlobalApi.getPosPenerimaanUmum();
      const pengeluaran = await GlobalApi.getPosPengeluaranUmum();

      const norek = await GlobalApi.getNoRekening();

      setPosPenerimaanUmum(penerimaan);
      setPosPengeluaranUmum(pengeluaran);
    } catch (error) {
      console.error("Gagal mengambil data pos umum:", error);
    }
  };

  const fetchCabangData = async () => {
    try {
      const response = await GlobalApi.getCabang();
      setCabangList(response.data);
    } catch (error) {}
  };

  const handleAutoNominal = async () => {
    if (!tglPengeluaran) return;

    try {
      setLoading(true);

      const [year, month] = new Date(tglPengeluaran)
        .toISOString()
        .split("T")[0]
        .split("-")
        .map(Number);

      const currentMonthData = await GlobalApi.getTableUmum(month, year);

      const dataBulanIni = currentMonthData.filter((item) => {
        const [y, m] = Array.isArray(item.tanggalTransaksi)
          ? item.tanggalTransaksi
          : new Date(item.tanggalTransaksi)
              .toISOString()
              .split("T")[0]
              .split("-")
              .map(Number);
        return Number(m) === month && Number(y) === year;
      });

      const totalPemasukan = dataBulanIni
        .filter((item) => item.jenis === "PEMASUKAN")
        .reduce((sum, item) => sum + Number(item.debet || 0), 0);

      const totalPengeluaran = dataBulanIni
        .filter((item) => item.jenis === "PENGELUARAN")
        .reduce((sum, item) => sum + Number(item.kredit || 0), 0);

      const nominalOperasional = Math.round(
        (totalPemasukan - totalPengeluaran) * 0.15
      );

      setNominalPengeluaran(nominalOperasional.toString());
      setRincianOperasional({
        pemasukan: totalPemasukan,
        pengeluaran: totalPengeluaran,
        hasil15: nominalOperasional,
      });
    } catch (error) {
      console.error("Gagal hitung nominal operasional:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenerimaan = async () => {
    try {
      setLoading(true);
      const bulan = Number(monthFilter);
      const tahun = Number(yearFilter);
      const currentMonthData = await GlobalApi.getTableUmum(bulan, tahun);
      let saldoAkhirSebelumnya = 0;
      const maret2021 = new Date(2021, 2, 1);

      let tempDate = new Date(tahun, bulan - 1, 1);
      tempDate.setMonth(tempDate.getMonth() - 1);

      let allPreviousData = [];

      while (tempDate >= maret2021) {
        const b = tempDate.getMonth() + 1;
        const y = tempDate.getFullYear();
        const data = await GlobalApi.getTableUmum(b, y);
        allPreviousData.push(...data);
        tempDate.setMonth(tempDate.getMonth() - 1);
      }

      const pemasukanSaja = allPreviousData.filter(
        (item) => item.jenis === "PEMASUKAN"
      );
      const hasilSaldo = hitungSaldo(pemasukanSaja, 0);
      if (hasilSaldo.length > 0) {
        saldoAkhirSebelumnya = hasilSaldo[hasilSaldo.length - 1].saldo || 0;
      }
      const dataBulanIni = currentMonthData.filter((item) => {
        const [year, month] = Array.isArray(item.tanggalTransaksi)
          ? item.tanggalTransaksi
          : new Date(item.tanggalTransaksi)
              .toISOString()
              .split("T")[0]
              .split("-")
              .map(Number);
        return Number(month) === bulan && Number(year) === tahun;
      });

      prosesData(dataBulanIni, saldoAkhirSebelumnya);
    } catch (error) {
      console.error("Gagal fetch data penerimaan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNamaKwitansi = async () => {
    if (bulanMeninggal && tahunMeninggal) {
      try {
        const data = await GlobalApi.getNamaKwitansi(
          tahunMeninggal,
          bulanMeninggal
        );
        setListMeninggal(data);
      } catch (err) {
        setListMeninggal([]);
      }
    }
  };

  const hitungSaldo = (data, saldoAwal = 0) => {
    let saldo = saldoAwal;
    return data.map((item) => {
      saldo += (item.debet || 0) - (item.kredit || 0);
      return { ...item, saldo };
    });
  };

  const prosesData = (data, saldoAwalManual = 0) => {
    const bulan = Number(monthFilter);
    const tahun = Number(yearFilter);

    let saldoAwalTransaksi = data.find((item) => {
      const nomorBuktiLower = String(item.nomorBukti || "").toLowerCase();
      const itemBulan =
        item.setoranBulan ||
        (Array.isArray(item.tanggalTransaksi)
          ? item.tanggalTransaksi[1]
          : new Date(item.tanggalTransaksi).getMonth() + 1);
      const itemTahun =
        item.setoranTahun ||
        (Array.isArray(item.tanggalTransaksi)
          ? item.tanggalTransaksi[0]
          : new Date(item.tanggalTransaksi).getFullYear());
      return (
        item.jenis === "PEMASUKAN" &&
        nomorBuktiLower.includes("saldo awal umum") &&
        itemBulan === bulan &&
        itemTahun === tahun
      );
    });

    let transaksiWithSaldoAwal = [...data];

    if (!saldoAwalTransaksi) {
      saldoAwalTransaksi = {
        id: "virtual-saldo-awal",
        tanggalTransaksi: [tahun, bulan, 1],
        nomorBukti: "SALDO AWAL UMUM",
        keterangan: `Saldo Umum Periode ${String(bulan).padStart(
          2,
          "0"
        )}-${tahun}`,
        debet: saldoAwalManual,
        kredit: 0,
        saldo: saldoAwalManual,
        setoranBulan: bulan,
        setoranTahun: tahun,
        jenis: "PEMASUKAN",
        isVirtual: true,
      };
      transaksiWithSaldoAwal = [saldoAwalTransaksi, ...data];
    }

    setSaldoAwalTransaksi(saldoAwalTransaksi);

    const transaksiBulanIni = transaksiWithSaldoAwal.filter((item) => {
      const [year, month] = Array.isArray(item.tanggalTransaksi)
        ? item.tanggalTransaksi
        : new Date(item.tanggalTransaksi)
            .toISOString()
            .split("T")[0]
            .split("-")
            .map(Number);

      const isSaldoAwal = String(item.nomorBukti || "")
        .toLowerCase()
        .includes("saldo awal umum");

      return Number(month) === bulan && Number(year) === tahun && !isSaldoAwal;
    });

    const transaksiDenganSaldo = hitungSaldo(
      transaksiBulanIni,
      saldoAwalTransaksi.debet || 0
    );

    setFilteredTransaksi([saldoAwalTransaksi, ...transaksiDenganSaldo]);
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      await fetchCabangData();
      await fetchPenerimaan();
    };

    init();

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    setTglPenerimaan(formattedDate);
    setTglPengeluaran(formattedDate);
    setSetoranTahun(year.toString());
    setSetoranBulan(month);
    setSetoranTahunPengeluaran(year.toString());
    setSetoranBulanPengeluaran(month);
    setDefaultMonth(`${year}-${month}`);
    setDefaultMonthPengeluaran(`${year}-${month}`);

    fetchNamaKwitansi();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [monthFilter, yearFilter, bulanMeninggal, tahunMeninggal]);

  const [totalDebit, totalKredit, saldoAkhir] = React.useMemo(() => {
    let totalDebet = 0;
    let totalKredit = 0;

    filteredTransaksi.forEach((item) => {
      totalDebet += item.debet || 0;
      totalKredit += item.kredit || 0;
    });

    const akhir =
      filteredTransaksi.length > 0
        ? filteredTransaksi[filteredTransaksi.length - 1].saldo
        : saldoAkhirBulanSebelumnya;

    return [totalDebet, totalKredit, akhir];
  }, [filteredTransaksi, saldoAkhirBulanSebelumnya]);

  const handleSelect = (kecamatan) => {
    setCabangPenerimaan(kecamatan);
    setCabangPengeluaran(kecamatan);
    setShowDropdown(false);
    setSearchCabang("");
  };

  const filteredCabang = cabangList.filter((c) =>
    c?.kecamatan?.toLowerCase().includes(searchCabang.toLowerCase())
  );

  const formatRupiah = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = value.toString();
    const numberString = stringValue.replace(/[^,\d]/g, "");
    const split = numberString.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/g);

    if (ribuan) {
      const separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }

    rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
    return rupiah ? "Rp " + rupiah : "";
  };

  const resetForm = () => {
    setJenisPenerimaan("");
    setPosPenerimaan("");
    setCabangPenerimaan("");
    setSearchCabang("");
    setShowDropdown(false);
    setNominalPenerimaan("");
    setKeteranganPenerimaan("");

    setJenisPengeluaran("");
    setPosPengeluaran("");
    setCabangPengeluaran("");
    setSearchCabang("");
    setShowDropdown(false);
    setNominalPengeluaran("");
    setKeteranganPengeluaran("");
    setYangMeninggal("");
    setNamaPenerima("");

    setBulanMeninggal("");
    setTahunMeninggal("");
    setListMeninggal("");
  };

  const handleSubmitPemasukan = async () => {
    const namaBulan = [
      "",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const bulanNama = namaBulan[Number(setoranBulan)];

    const autoKeterangan = `Pemasukan Umum ${PosPenerimaan} Cabang ${cabangPenerimaan} (${jenisPenerimaan}) untuk ${bulanNama} ${setoranTahun}. Ket${
      keteranganPenerimaan ? ` ${keteranganPenerimaan}` : " -"
    }`;

    const payload = {
      tanggalTransaksi: tglPenerimaan,
      posPenerimaan: PosPenerimaan,
      setoranBulan: Number(setoranBulan),
      setoranTahun: Number(setoranTahun),
      jenisPenerimaan,
      cabang: cabangPenerimaan?.cabang ?? "",
      nominal: Number(nominalPenerimaan),
      keterangan: autoKeterangan,
    };

    try {
      const response = await GlobalApi.createPemasukanUmum(payload);
      setNotification({
        type: "success",
        message: "Berhasil simpan pemasukan!",
      });
      fetchPenerimaan();
      resetForm();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal simpan pemasukan.",
      });
      console.error("Gagal simpan pemasukan:", error);
    }
  };
  const handleSubmitPengeluaran = async () => {
    const namaBulan = [
      "",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const bulanNama = namaBulan[Number(setoranBulanPengeluaran)];

    const autoKeterangan = `Pengeluaran Umum ${PosPengeluaran} Cabang ${cabangPengeluaran} (${jenisPengeluaran}) untuk ${bulanNama} ${setoranTahunPengeluaran}. Ket${
      keteranganPengeluaran ? ` ${keteranganPengeluaran}` : " -"
    }`;

    const payload = {
      tanggalTransaksi: tglPengeluaran ?? "",
      posPengeluaran: PosPengeluaran ?? "",
      setoranBulan: setoranBulanPengeluaran
        ? Number(setoranBulanPengeluaran)
        : "",
      setoranTahun: setoranTahunPengeluaran
        ? Number(setoranTahunPengeluaran)
        : "",
      jenisPegeluaran: jenisPengeluaran ?? "",
      cabang: cabangPengeluaran ?? "",
      nominal: nominalPengeluaran ? Number(nominalPengeluaran) : "",
      yangMeninggal:
        PosPengeluaran === "Santunan Duka Anggota" ? yangMeninggal : "",
      namaPenerima:
        PosPengeluaran === "Santunan Duka Anggota" ? namaPenerima : "",
      keterangan: autoKeterangan,
    };

    try {
      await GlobalApi.createPengeluaranUmum(payload);
      setNotification({
        type: "success",
        message: "Pengeluaran berhasil disimpan!",
      });
      fetchPenerimaan();
      resetForm();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal menyimpan pengeluaran.",
      });
      console.error("Gagal kirim pengeluaran:", error);
    }
  };

  const handleSesuaiTarget = async () => {
    if (!tglPenerimaan) {
      setNotification({
        type: "error",
        message: "Tanggal transaksi belum dipilih.",
      });
      return;
    }

    try {
      const response = await GlobalApi.postSesuaiTargetUmum(tglPenerimaan);
      setNotification({
        type: "success",
        message: "Data sesuai target berhasil dibuat!",
      });
      fetchPenerimaan();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal membuat data sesuai target.",
      });
      console.error("Gagal generate:", error);
    }
  };

  const handleTambahPosPenerimaan = async () => {
    if (!newPosPenerimaan.trim()) return;
    const data = {
      namaPosPenerimaan: newPosPenerimaan.trim(),
      isSistemDefault: false,
    };
    try {
      await GlobalApi.createPosPenerimaanUmum(data);
      setNotification({
        type: "success",
        message: "Berhasil Tambah!",
      });
      setNewPosPenerimaan("");
      fetchData();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal Tambah.",
      });
      alert("Gagal menambahkan pos penerimaan.");
    }
  };

  const handleHapusPosPenerimaan = async (id) => {
    try {
      await GlobalApi.deletePosPenerimaanUmum(id);
      setNotification({
        type: "success",
        message: "Berhasil dihapus!",
      });
      fetchData();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal hapus",
      });
      alert(error.message || "Gagal menghapus pos.");
    }
  };

  const handleTambahPosPengeluaran = async () => {
    if (!newPosPengeluaran.trim()) return;
    const data = {
      namaPosPengeluaran: newPosPengeluaran.trim(),
      isSistemDefault: false,
    };
    try {
      await GlobalApi.createPosPengeluaranUmum(data);
      setNotification({
        type: "success",
        message: "Berhasil Tambah!",
      });
      setNewPosPengeluaran("");
      fetchData();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal Tambah.",
      });
      alert("Gagal menambahkan pos pengeluaran.");
    }
  };

  const handleHapusPosPengeluaran = async (id) => {
    try {
      await GlobalApi.deletePosPengeluaranUmum(id);
      setNotification({
        type: "success",
        message: "Berhasil dihapus!",
      });
      fetchData();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Gagal hapus",
      });
      alert(error.message || "Gagal menghapus pos.");
    }
  };

  const handleEditClick = async (id, jenis) => {
    try {
      setEditJenis(jenis);
      let data;

      if (jenis === "PEMASUKAN") {
        data = await GlobalApi.getPemasukanUmumById(id);
        const tanggal = `${data.tanggalTransaksi[0]}-${String(
          data.tanggalTransaksi[1]
        ).padStart(2, "0")}-${String(data.tanggalTransaksi[2]).padStart(
          2,
          "0"
        )}`;

        setEditForm({
          id: data.id,
          tanggalTransaksi: tanggal,
          nomorBukti: data.nomorBukti,
          pos: data.posPenerimaan,
          setoranBulan: data.setoranBulan,
          setoranTahun: data.setoranTahun,
          jenis: data.jenisPenerimaan,
          cabang: data.cabang,
          nominal: data.nominal,
          keterangan: data.keterangan,
          yangMeninggal: "",
          namaPenerima: "",
        });
      } else if (jenis === "PENGELUARAN") {
        data = await GlobalApi.getPengeluaranUmumById(id);
        const tanggal = `${data.tanggalTransaksi[0]}-${String(
          data.tanggalTransaksi[1]
        ).padStart(2, "0")}-${String(data.tanggalTransaksi[2]).padStart(
          2,
          "0"
        )}`;

        setEditForm({
          id: data.id,
          tanggalTransaksi: tanggal,
          nomorBukti: data.nomorBukti,
          pos: data.posPengeluaran,
          setoranBulan: data.setoranBulan,
          setoranTahun: data.setoranTahun,
          jenis: data.jenisPegeluaran,
          cabang: data.cabang,
          nominal: data.nominal,
          keterangan: data.keterangan,
          yangMeninggal: data.yangMeninggal,
          namaPenerima: data.namaPenerima,
        });
      }

      setShowEditModal(true);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const [year, month, day] = editForm.tanggalTransaksi.split("-");

      if (editJenis === "PEMASUKAN") {
        const payload = {
          id: editForm.id,
          tanggalTransaksi: editForm.tanggalTransaksi,
          posPenerimaan: editForm.pos,
          setoranBulan: Number(month),
          setoranTahun: Number(year),
          jenisPenerimaan: editForm.jenis,
          cabang: editForm.cabang,
          nominal: Number(editForm.nominal),
          keterangan: editForm.keterangan,
        };

        await GlobalApi.updatePemasukanUmum(editForm.id, payload);
      } else if (editJenis === "PENGELUARAN") {
        const payload = {
          tanggalTransaksi: editForm.tanggalTransaksi,
          posPengeluaran: editForm.pos,
          setoranBulan: Number(month),
          setoranTahun: Number(year),
          jenisPegeluaran: editForm.jenis,
          cabang: editForm.cabang,
          nominal: Number(editForm.nominal),
          yangMeninggal: editForm.yangMeninggal,
          namaPenerima: editForm.namaPenerima,
          keterangan: editForm.keterangan,
        };

        await GlobalApi.updatePengeluaranUmum(editForm.id, payload);
      }

      setNotification({
        type: "success",
        message: "Data berhasil diperbarui!",
      });
      setShowEditModal(false);
      fetchPenerimaan();
    } catch (error) {
      console.error("Gagal menyimpan perubahan:", error);
      setNotification({
        type: "error",
        message: "Gagal menyimpan perubahan.",
      });
    }
  };

  const handleDelete = async (id, jenis) => {
    try {
      if (jenis === "PEMASUKAN") {
        await GlobalApi.deletePemasukanUmum(id);
      } else if (jenis === "PENGELUARAN") {
        await GlobalApi.deletePengeluaranUmum(id);
      } else {
        throw new Error("Jenis transaksi tidak dikenali");
      }

      setNotification({
        type: "success",
        message: "Data berhasil dihapus!",
      });

      fetchPenerimaan();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      setNotification({
        type: "error",
        message: "Gagal hapus data.",
      });
    }
  };

  const angkaTerbilang = (nilai) => {
    const satuan = [
      "",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima",
      "enam",
      "tujuh",
      "delapan",
      "sembilan",
      "sepuluh",
      "sebelas",
    ];

    const terbilang = (n) => {
      n = Math.floor(n);
      if (n < 12) return satuan[n];
      if (n < 20) return `${terbilang(n - 10)} belas`;
      if (n < 100)
        return `${terbilang(n / 10)} puluh ${terbilang(n % 10)}`.trim();
      if (n < 200) return `seratus ${terbilang(n - 100)}`.trim();
      if (n < 1000)
        return `${terbilang(n / 100)} ratus ${terbilang(n % 100)}`.trim();
      if (n < 2000) return `seribu ${terbilang(n - 1000)}`.trim();
      if (n < 1000000)
        return `${terbilang(n / 1000)} ribu ${terbilang(n % 1000)}`.trim();
      if (n < 1000000000)
        return `${terbilang(n / 1000000)} juta ${terbilang(
          n % 1000000
        )}`.trim();
      return "Jumlah terlalu besar";
    };

    return `${terbilang(nilai)} rupiah`.replace(/\s+/g, " ");
  };

  const transactions = [
    {
      id: 2,
      tanggal: "15/06/2025",
      noBukti: "PGLSKDK-20250615210333-UMUM",
      uraian:
        "Pengeluaran Umum Operasional Umum (Cash) untuk Juni 2025. Ket: -",
      debit: 350000000,
      kredit: 390000,
      saldo: 349910000,
    },
  ];
  // END

  //
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

  const handleExportExcel = () => {
    try {
      const excelData = [
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        {
          No: `BUKU KAS UMUM - ${getMonthName(monthFilter)} ${yearFilter}`,
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        {
          No: "No",
          Tanggal: "Tanggal",
          "No Bukti": "No Bukti",
          Uraian: "Uraian",
          "Debit (Pemasukan)": "Debit (Pemasukan)",
          "Kredit (Pengeluaran)": "Kredit (Pengeluaran)",
          Saldo: "Saldo",
        },
      ];

      transactions.forEach((transaction, index) => {
        excelData.push({
          No: index + 1,
          Tanggal: transaction.tanggal,
          "No Bukti": transaction.noBukti,
          Uraian: transaction.uraian,
          "Debit (Pemasukan)":
            transaction.debit > 0
              ? `Rp ${transaction.debit.toLocaleString("id-ID")}`
              : "",
          "Kredit (Pengeluaran)":
            transaction.kredit > 0
              ? `Rp ${transaction.kredit.toLocaleString("id-ID")}`
              : "",
          Saldo: `Rp ${transaction.saldo.toLocaleString("id-ID")}`,
        });
      });

      excelData.push(
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "",
          "Debit (Pemasukan)": "",
          "Kredit (Pengeluaran)": "",
          Saldo: "",
        },
        {
          No: "",
          Tanggal: "",
          "No Bukti": "",
          Uraian: "TOTAL",
          "Debit (Pemasukan)": `Rp ${totalDebit.toLocaleString("id-ID")}`,
          "Kredit (Pengeluaran)": `Rp ${totalKredit.toLocaleString("id-ID")}`,
          Saldo: `Rp ${saldoAkhir.toLocaleString("id-ID")}`,
        }
      );

      const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
      const wb = XLSX.utils.book_new();

      const colWidths = [
        { wch: 5 },
        { wch: 15 },
        { wch: 30 },
        { wch: 50 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Buku Kas Umum");

      const currentDate = new Date();
      const filename = `Buku_Kas_Umum_${getMonthName(
        monthFilter
      )}_${yearFilter}_${currentDate.getDate()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getFullYear()}.xlsx`;

      XLSX.writeFile(wb, filename);

      setNotification({
        type: "success",
        message: `File Excel berhasil diunduh: ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setNotification({
        type: "error",
        message: "Gagal mengekspor ke Excel. Silakan coba lagi.",
      });
    }
  };
  const handlePrint = () => {
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Buku Kas Umum - ${getMonthName(
              monthFilter
            )} ${yearFilter}</title>
            <style>
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                }

                body {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    margin: 0;
                    padding: 20px;
                    color: #000;
                }

                h1, h2, h3, p {
                    margin: 0;
                    padding: 0;
                }

                .title {
                    text-align: center;
                    margin-bottom: 10px;
                }

                .subtitle {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    font-size: 11px;
                }

                thead th {
                    background-color: #009688 !important;
                    color: white !important;
                    padding: 6px;
                    border: 1px solid #ccc;
                    text-align: center;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                tbody td {
                    border: 1px solid #ccc;
                    padding: 6px;
                    vertical-align: top;
                }

                .number {
                    text-align: right;
                }

                .center {
                    text-align: center;
                }

                .summary-row td {
                    font-weight: bold;
                    background-color: #f5f5f5;
                }
            </style>
        </head>
        <body>
            <div class="title">
                <h2>BUKU KAS UMUM</h2>
                <p>Periode: ${getMonthName(monthFilter)} ${yearFilter}</p>
            </div>

            <div class="subtitle">
                <p><strong>Saldo Akhir Bulan Sebelumnya (${getMonthName(
                  monthFilter - 1
                )} ${yearFilter}):</strong> Rp ${saldoSebelumnya.toLocaleString(
        "id-ID"
      )}</p>
                <p>Dicetak pada: ${new Date().toLocaleString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tgl Transaksi</th>
                        <th>No. Bukti</th>
                        <th>Uraian</th>
                        <th>Debet (Rp)</th>
                        <th>Kredit (Rp)</th>
                        <th>Saldo (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="center">01/06/${yearFilter}</td>
                        <td colspan="2" class="center">SALDO AWAL</td>
                        <td>Saldo Awal Periode ${getMonthName(
                          monthFilter
                        )} ${yearFilter}</td>
                        <td class="number">Rp ${saldoSebelumnya.toLocaleString(
                          "id-ID"
                        )}</td>
                        <td class="number">Rp 0</td>
                        <td class="number">Rp ${saldoSebelumnya.toLocaleString(
                          "id-ID"
                        )}</td>
                    </tr>

                    ${transactions
                      .map(
                        (transaction, index) => `
                        <tr>
                            <td class="center">${index + 1}</td>
                            <td class="center">${transaction.tanggal}</td>
                            <td>${transaction.noBukti}</td>
                            <td>${transaction.uraian}</td>
                            <td class="number">${
                              transaction.debit > 0
                                ? "Rp " +
                                  transaction.debit.toLocaleString("id-ID")
                                : "Rp 0"
                            }</td>
                            <td class="number">${
                              transaction.kredit > 0
                                ? "Rp " +
                                  transaction.kredit.toLocaleString("id-ID")
                                : "Rp 0"
                            }</td>
                            <td class="number">Rp ${transaction.saldo.toLocaleString(
                              "id-ID"
                            )}</td>
                        </tr>
                    `
                      )
                      .join("")}

                    <tr class="summary-row">
                        <td colspan="4" class="center">TOTAL TRANSAKSI PERIODE INI</td>
                        <td class="number">Rp ${totalDebit.toLocaleString(
                          "id-ID"
                        )}</td>
                        <td class="number">Rp ${totalKredit.toLocaleString(
                          "id-ID"
                        )}</td>
                        <td></td>
                    </tr>
                    <tr class="summary-row">
                        <td colspan="6" class="center">SALDO AKHIR PERIODE INI</td>
                        <td class="number">Rp ${saldoAkhir.toLocaleString(
                          "id-ID"
                        )}</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
        `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = function () {
          printWindow.close();
        };
      };

      setNotification({
        type: "success",
        message: "Dokumen berhasil disiapkan untuk pencetakan",
      });
    } catch (error) {
      console.error("Error printing:", error);
      setNotification({
        type: "error",
        message: "Gagal mencetak dokumen. Silakan coba lagi.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-2 md:p-6">
      {isMobile ? <HeaderMobile /> : <HeaderMenu />}
      <div>
        {notification && (
          <NotificationPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Konten utama */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            {/* Menu Saldo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                Buku Kas Umum
              </h1>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  className="px-4 py-2 rounded border border-black bg-white text-black hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2 text-sm flex-1"
                  onClick={() => setShowPosPenerimaanModal(true)}
                >
                  <FaSliders className="w-4 h-4" />
                  <span>Kelola Pos Penerimaan Umum</span>
                </Button>

                <Button
                  className="px-4 py-2 rounded border border-black bg-white text-black hover:bg-teal-500 hover:text-white transition flex items-center justify-center gap-2 text-sm flex-1"
                  onClick={() => setShowPosPengeluaranModal(true)}
                >
                  <FaSliders className="w-4 h-4" />
                  <span>Kelola Pos Pengeluaran Umum</span>
                </Button>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 my-4"></div>

            {/* Ringkasan Saldo */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-4 ">
                Ringkasan Saldo Umum Periode: Juni 2025
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Saldo Akhir Mei 2025
                    </h3>
                    <p className="text-xl font-bold text-black">
                      Rp 4.037.000.000
                    </p>
                  </div>
                  <FaCalendarAlt className="text-gray-400 w-6 h-6" />
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Total Pemasukan Juni 2025
                    </h3>
                    <p className="text-xl font-bold text-green-600">
                      Rp 40.300.000
                    </p>
                  </div>
                  <FaArrowTrendUp className="text-green-500 w-6 h-6" />
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Total Pengeluaran Juni 2025
                    </h3>
                    <p className="text-xl font-bold text-red-600">
                      Rp 4.000.000
                    </p>
                  </div>
                  <FaArrowTrendDown className="text-red-500 w-6 h-6" />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 font-medium mb-1">
                      Saldo Akhir Juni 2025
                    </h3>
                    <p className="text-xl font-bold text-blue-600">
                      Rp 4.073.300.000
                    </p>
                  </div>
                  <FaDollarSign className="text-blue-500 w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              className={`py-2 px-4 rounded-lg font-medium relative flex items-center justify-center gap-2 flex-1 text-center transition ${
                activeTab === "penerimaan"
                  ? "text-white bg-green-600"
                  : "text-green-700 hover:bg-green-50"
              }`}
              onClick={() => setActiveTab("penerimaan")}
            >
              <FaArrowTrendUp className="w-4 h-4" />
              Input Pemasukan Umum
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-medium relative flex items-center justify-center gap-2 flex-1 text-center transition ${
                activeTab === "pengeluaran"
                  ? "text-white bg-red-600"
                  : "text-red-700 hover:bg-red-50"
              }`}
              onClick={() => setActiveTab("pengeluaran")}
            >
              <FaArrowTrendDown className="w-4 h-4" />
              Input Pengeluaran Umum
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md mt-3">
            {/* Penerimaan Form */}
            {activeTab === "penerimaan" && (
              <>
                <div className="bg-green-100 text-green-800 p-4 text-lg rounded font-semibold flex items-center gap-2">
                  <FaArrowTrendUp />
                  Input Pemasukan Umum
                </div>
                <div className="space-y-4 p-4 bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <FaCalendarAlt />
                        Tanggal Transaksi
                      </label>
                      <input
                        type="date"
                        name="tanggalTransaksi"
                        value={tglPenerimaan}
                        onChange={(e) => setTglPenerimaan(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Pilih Tanggal"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaFolderOpen />
                        Jenis Penerimaan
                      </label>
                      <select
                        name="jenisPenerimaan"
                        value={jenisPenerimaan}
                        onChange={(e) => setJenisPenerimaan(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Jenis</option>
                        <option value="Cash">Cash</option>
                        <option value="Tranfer">Tranfer</option>
                        <option value="Bank">Pemasukan dari Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBoxOpen />
                        Pos Penerimaan
                      </label>
                      <select
                        name="posPenerimaan"
                        value={PosPenerimaan}
                        onChange={(e) => setPosPenerimaan(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Pos</option>
                        {posPenerimaanUmum.map((pos) => (
                          <option key={pos.id} value={pos.namaPosPenerimaan}>
                            {pos.namaPosPenerimaan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBuilding />
                        Cabang
                      </label>

                      {/* Trigger Button */}
                      <div
                        className="w-full p-2 border border-gray-300 rounded bg-white cursor-pointer"
                        onClick={() => setShowDropdown((prev) => !prev)}
                      >
                        {cabangPenerimaan || "Pilih Cabang"}
                      </div>

                      {/* Dropdown List */}
                      {showDropdown && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-md max-h-60 overflow-y-auto">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Cari cabang..."
                              value={searchCabang}
                              onChange={(e) => setSearchCabang(e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <div
                              onClick={() => handleSelect("")}
                              className="p-2 hover:bg-gray-100 text-sm cursor-pointer"
                            >
                              Pilih Cabang
                            </div>
                            {filteredCabang.length > 0 ? (
                              filteredCabang.map((cabang) => (
                                <div
                                  key={cabang.id}
                                  onClick={() => handleSelect(cabang.kecamatan)}
                                  className="p-2 hover:bg-gray-100 text-sm cursor-pointer"
                                >
                                  {cabang.kecamatan}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-gray-400">
                                Tidak ditemukan
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt />
                        Setoran Untuk Bulan & Tahun
                      </label>
                      <input
                        type="month"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={defaultMonth}
                        onChange={(e) => {
                          const [tahun, bulan] = e.target.value.split("-");
                          setSetoranTahun(tahun);
                          setSetoranBulan(bulan);
                          setDefaultMonth(e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaMoneyBill />
                        Nominal (Rp)
                      </label>
                      <input
                        type="text"
                        name="nominal"
                        value={formatRupiah(nominalPenerimaan)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          setNominalPenerimaan(rawValue);
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                      <p className="text-xs mt-1">
                        Terbilang:{" "}
                        {nominalPenerimaan
                          ? angkaTerbilang(Number(nominalPenerimaan))
                          : "Tidak ada nominal"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FaStickyNote />
                      Keterangan
                    </label>
                    <textarea
                      name="keterangan"
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                      placeholder="Keterangan tambahan (mis: Iuran Umum anggota Mei 2024)"
                      value={keteranganPenerimaan}
                      onChange={(e) => setKeteranganPenerimaan(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 flex items-center"
                      onClick={handleSesuaiTarget}
                    >
                      <FaBullseye className="mr-2" />
                      Sesuai Target
                    </button>
                    <button
                      className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center"
                      onClick={handleSubmitPemasukan}
                    >
                      <FaSave className="mr-2" />
                      Simpan Pemasukan
                    </button>
                  </div>
                </div>
              </>
            )}
            {/* Pengeluaran Form */}
            {activeTab === "pengeluaran" && (
              <>
                <div className="bg-red-100 text-red-800 p-4 text-lg rounded font-semibold flex items-center gap-2">
                  <FaArrowTrendDown />
                  Input Pengeluaran Umum
                </div>
                <div className="space-y-4 p-4 bg-red-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt />
                        Tanggal Transaksi
                      </label>

                      <input
                        type="date"
                        name="tanggalTransaksi"
                        value={tglPengeluaran}
                        onChange={(e) => setTglPengeluaran(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Pilih Tanggal"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        {" "}
                        <FaFolderOpen />
                        Jenis Pengeluaran
                      </label>
                      <select
                        name="jenisPengeluaran"
                        value={jenisPengeluaran}
                        onChange={(e) => setJenisPengeluaran(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Jenis</option>
                        <option value="Cash">Cash</option>
                        <option value="Tranfer">Tranfer</option>
                      </select>
                    </div>

                    <div>
                      {/* Dropdown Pos Pengeluaran */}
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBoxOpen />
                        Pos Pengeluaran
                      </label>
                      <select
                        name="posPengeluaran"
                        value={PosPengeluaran}
                        onChange={(e) => {
                          setPosPengeluaran(e.target.value);
                          if (e.target.value === "Operasional Umum") {
                            handleAutoNominal();
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Pilih Pos</option>
                        {posPengeluaranUmum.map((pos, index) => (
                          <option key={index} value={pos.namaPosPengeluaran}>
                            {pos.namaPosPengeluaran}
                          </option>
                        ))}
                      </select>

                      {/* Form Tambahan Jika Pos = Santunan Duka Anggota */}
                      {PosPengeluaran === "Santunan Duka Anggota" && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Bulan yang Meninggal
                            </label>
                            <select
                              value={bulanMeninggal}
                              onChange={(e) =>
                                setBulanMeninggal(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="">Pilih bulan</option>
                              {months.map((bulan) => (
                                <option key={bulan.value} value={bulan.value}>
                                  {bulan.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Tahun yang Meninggal
                            </label>
                            <select
                              value={tahunMeninggal}
                              onChange={(e) =>
                                setTahunMeninggal(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="">Pilih tahun</option>
                              {tahunOptions.map((tahun) => (
                                <option key={tahun} value={tahun}>
                                  {tahun}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Nama yang Meninggal
                            </label>
                            <select
                              value={yangMeninggal}
                              onChange={(e) => setYangMeninggal(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="">
                                Pilih nama almarhum/almarhumah
                              </option>
                              {listMeninggal.map((item, index) => (
                                <option key={index} value={item.namaLengkap}>
                                  {item.namaLengkap}
                                </option>
                              ))}
                              {/* {Array.isArray(listMeninggal) &&
  listMeninggal.map((item, index) => (
    <option key={item.id} value={item.namaLengkap}>
      {item.namaLengkap}
    </option>
))} */}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Nama Penerima
                            </label>
                            <input
                              type="text"
                              value={namaPenerima}
                              onChange={(e) => setNamaPenerima(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="Masukkan nama penerima santunan"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaBuilding />
                        Cabang
                      </label>

                      {/* Trigger Button */}
                      <div
                        className="w-full p-2 border border-gray-300 rounded bg-white cursor-pointer"
                        onClick={() => setShowDropdown((prev) => !prev)}
                      >
                        {cabangPengeluaran || "Pilih Cabang"}
                      </div>

                      {/* Dropdown List */}
                      {showDropdown && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-md max-h-60 overflow-y-auto">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Cari cabang..."
                              value={searchCabang}
                              onChange={(e) => setSearchCabang(e.target.value)}
                              className="w-full p-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <div
                              onClick={() => handleSelect("")}
                              className="p-2 hover:bg-gray-100 text-sm cursor-pointer"
                            >
                              Pilih Cabang
                            </div>
                            {filteredCabang.length > 0 ? (
                              filteredCabang.map((cabang) => (
                                <div
                                  key={cabang.id}
                                  onClick={() => handleSelect(cabang.kecamatan)}
                                  className="p-2 hover:bg-gray-100 text-sm cursor-pointer"
                                >
                                  {cabang.kecamatan}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-gray-400">
                                Tidak ditemukan
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt />
                        Pengeluaran Untuk Bulan & Tahun
                      </label>
                      <input
                        type="month"
                        name="bulanTahun"
                        value={defaultMonthPengeluaran}
                        onChange={(e) => {
                          const [year, month] = e.target.value.split("-");
                          setSetoranTahunPengeluaran(year);
                          setSetoranBulanPengeluaran(month);
                          setDefaultMonthPengeluaran(e.target.value);
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        {" "}
                        <FaMoneyBill />
                        Nominal (Rp)
                      </label>
                      <input
                        type="text"
                        name="nominal"
                        value={formatRupiah(nominalPengeluaran)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          setNominalPengeluaran(rawValue);
                        }}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                      <p className="text-xs mt-1">
                        Terbilang:{" "}
                        {nominalPengeluaran
                          ? angkaTerbilang(Number(nominalPengeluaran))
                          : "Tidak ada nominal"}
                      </p>
                      {PosPengeluaran === "Operasional Umum" && (
                        <div className="text-xs text-green-600 mt-1 italic bg-gray-50 p-2 rounded">
                          <div>Perhitungan: 15% x saldo bulan berjalan.</div>
                          <div>
                            15% x ({formatRupiah(rincianOperasional.pemasukan)}{" "}
                            - {formatRupiah(rincianOperasional.pengeluaran)}) ={" "}
                            <span className="font-semibold">
                              {formatRupiah(rincianOperasional.hasil15)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      {" "}
                      <FaStickyNote />
                      Keterangan
                    </label>
                    <textarea
                      name="keterangan"
                      value={keteranganPengeluaran}
                      onChange={(e) => setKeteranganPengeluaran(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                      placeholder="Keterangan tambahan (mis: Santunan duka Bpk. Fulan)"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={handleSesuaiTarget}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 flex items-center"
                    >
                      <FaBullseye className="mr-2" />
                      Sesuai Target
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                      onClick={handleSubmitPengeluaran}
                    >
                      <FaSave className="mr-2" />
                      Simpan Pengeluaran
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Daftar Transaksi Umum - {getMonthName(monthFilter)}{" "}
                  {yearFilter}
                </h1>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
                  {/* Month Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 w-24"
                      onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    >
                      <span>{getMonthName(monthFilter)}</span>
                      <FaChevronDown className="ml-7 text-sm" />
                    </button>
                    {showMonthDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                        {months.map((month) => (
                          <div
                            key={month.value}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              monthFilter === month.value
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => {
                              setMonthFilter(month.value);
                              setShowMonthDropdown(false);
                            }}
                          >
                            {month.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Year Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center px-3 py-2 border border-gray-300 rounded bg-white text-gray-700"
                      onClick={() => setShowYearDropdown(!showYearDropdown)}
                    >
                      <span>{yearFilter}</span>
                      <FaChevronDown className="ml-2 text-sm" />
                    </button>
                    {showYearDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                        {years.map((year) => (
                          <div
                            key={year}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              yearFilter === year
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => {
                              setYearFilter(year);
                              setShowYearDropdown(false);
                            }}
                          >
                            {year}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-800 rounded hover:bg-blue-100 gap-2"
                  >
                    <FaDownload />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 border border-blue-300 bg-white text-blue-800 rounded hover:bg-blue-100 gap-2"
                  >
                    <FaPrint />
                    <span>Cetak Laporan</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider text-center">
                      NO
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                      TGL TRANSAKSI
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      NO. BUKTI
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      URAIAN
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      DEBET (Rp)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      KREDIT (Rp)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      SALDO (Rp)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium  uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-4 px-4">
                        <div className="flex justify-center items-center h-20">
                          <ClipLoader color="#3498db" size={50} />
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransaksi.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-4 text-gray-500"
                      >
                        Tidak ada data transaksi.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Baris SALDO AWAL */}
                      {saldoAwalTransaksi && (
                        <tr className="font-semibold bg-gray-100 text-sm">
                          <td className="p-3 text-center">-</td>
                          <td className="p-3">
                            {(() => {
                              const [year, month, day] =
                                saldoAwalTransaksi.tanggalTransaksi;
                              return `${String(day).padStart(2, "0")}-${String(
                                month
                              ).padStart(2, "0")}-${year}`;
                            })()}
                          </td>
                          <td className="p-3">
                            {saldoAwalTransaksi.nomorBukti}
                          </td>
                          <td className="p-3">
                            {saldoAwalTransaksi.keterangan}
                          </td>
                          <td className="p-3 text-right">
                            {(saldoAwalTransaksi.debet || 0).toLocaleString(
                              "id-ID"
                            )}
                          </td>
                          <td className="p-3 text-right">0</td>
                          <td className="p-3 text-right">
                            {(saldoAwalTransaksi.saldo || 0).toLocaleString(
                              "id-ID"
                            )}
                          </td>
                          <td className="p-3 text-center">-</td>
                        </tr>
                      )}

                      {/* Transaksi selain saldo awal */}
                      {filteredTransaksi
                        .filter((item) => {
                          const isSaldoAwal = item.nomorBukti
                            ?.toLowerCase()
                            .includes("saldo awal umum");
                          const [year, month] = Array.isArray(
                            item.tanggalTransaksi
                          )
                            ? [
                                item.tanggalTransaksi[0],
                                item.tanggalTransaksi[1],
                              ]
                            : new Date(item.tanggalTransaksi)
                                .toISOString()
                                .split("T")[0]
                                .split("-")
                                .map(Number);
                          const matchBulan = month === Number(monthFilter);
                          const matchTahun = year === Number(yearFilter);
                          return !isSaldoAwal && matchBulan && matchTahun;
                        })
                        .map((transaction, index) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-300"
                          >
                            <td className="p-3 text-center text-sm">
                              {index + 1}
                            </td>
                            <td className="p-3 text-sm">
                              {new Date(
                                transaction.tanggalTransaksi
                              ).toLocaleDateString("id-ID")}
                            </td>
                            <td className="p-3 text-sm">
                              {transaction.nomorBukti}
                            </td>
                            <td className="p-3 text-sm">
                              {transaction.keterangan}
                            </td>
                            <td className="p-3 text-right text-sm">
                              {(transaction.debet || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-right text-sm">
                              {(transaction.kredit || 0).toLocaleString(
                                "id-ID"
                              )}
                            </td>
                            <td className="p-3 text-right text-sm">
                              {(transaction.saldo || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-center text-sm">
                              <div className="flex space-x-2 justify-center text-base">
                                <button
                                  onClick={() =>
                                    handleEditClick(
                                      transaction.id,
                                      transaction.jenis
                                    )
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      transaction.id,
                                      transaction.jenis
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </>
                  )}
                </tbody>

                <tfoot>
                  <tr className="border-b border-blue-300">
                    <td className="text-right p-3" colSpan={4}>
                      TOTAL TRANSAKSI PERIODE INI
                    </td>
                    <td className="bg-green-50">
                      {" "}
                      <p className=" font-bold text-green-800 text-right">
                        Rp {totalDebit.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="bg-red-50">
                      {" "}
                      <p className="font-bold text-red-800 text-right">
                        Rp {totalKredit.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="text-right bg-blue-50">
                      {" "}
                      <p className="text-lg font-bold text-blue-800">
                        Rp {saldoAkhir.toLocaleString("id-ID")}
                      </p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showPosPenerimaanModal && (
        <div className="fixed inset-0 flex items-center justify-center ">
          <div
            className="absolute inset-0 bg-black opacity-80"
            onClick={() => setShowPosPenerimaanModal(false)}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaSliders className="text-blue-600 w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Kelola Pos Penerimaan
                </h3>
              </div>

              <button
                onClick={() => setShowPosPenerimaanModal(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Tambah atau hapus daftar Pos Penerimaan yang akan digunakan
                dalam transaksi.
              </p>

              {/* Form Tambah Pos Baru */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2 font-bold">
                  Nama Pos Penerimaan Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPosPenerimaan}
                    onChange={(e) => setNewPosPenerimaan(e.target.value)}
                    className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Donasi Penerimaan"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleTambahPosPenerimaan()
                    }
                  />
                  <button
                    onClick={handleTambahPosPenerimaan}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaPlusCircle className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Daftar Pos Penerimaan Umum Saat Ini
                </label>
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {Array.isArray(posPenerimaanUmum) &&
                  posPenerimaanUmum.length > 0 ? (
                    posPenerimaanUmum.map((pos, index) => (
                      <div
                        key={pos.id || index}
                        className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">
                          {pos.namaPosPenerimaan}
                        </span>
                        {!pos.isSistemDefault && (
                          <button
                            onClick={() => handleHapusPosPenerimaan(pos.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Hapus pos penerimaan"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      Belum ada data pos penerimaan
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Pos bawaan sistem tidak dapat dihapus.
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPosPenerimaanModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showPosPengeluaranModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-80"
            onClick={() => setShowPosPengeluaranModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl z-10 w-[600px] max-w-md mx-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaSliders className="text-blue-600 w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Kelola Pos Pengeluaran
                </h3>
              </div>

              <button
                onClick={() => setShowPosPengeluaranModal(false)}
                className="text-red-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Tambah atau hapus daftar Pos Pengeluaran yang akan digunakan
                dalam transaksi.
              </p>

              {/* Form Tambah Pos Baru */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nama Pos Pengeluaran Umum Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPosPengeluaran}
                    onChange={(e) => setNewPosPengeluaran(e.target.value)}
                    className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Donasi Penerimaan"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleTambahPosPengeluaran()
                    }
                  />
                  <button
                    onClick={handleTambahPosPengeluaran}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                  >
                    <FaPlusCircle className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              </div>

              {/* Daftar Pos Pengeluaran */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Daftar Pos Pengeluaran Umum Saat Ini
                </label>
                <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {Array.isArray(posPengeluaranUmum) &&
                  posPengeluaranUmum.length > 0 ? (
                    posPengeluaranUmum.map((pos, index) => (
                      <div
                        key={pos.id || index}
                        className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">
                          {pos.namaPosPengeluaran}
                        </span>
                        {!pos.isSistemDefault && (
                          <button
                            onClick={() => handleHapusPosPengeluaran(pos.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Hapus pos pengeluaran"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      Belum ada data pos pengeluaran
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Pos bawaan sistem tidak dapat dihapus.
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPosPenerimaanModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-w-full p-6">
            {/* Tombol X (Batal) */}
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle className="w-5 h-5 hover:text-red-500" />
            </button>

            {/* Header Modal */}
            <h2 className="text-lg font-semibold mb-4">
              {/* Edit Transaksi - {transactionToEdit.noBukti} */}
            </h2>

            {/* Form Edit */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.tanggalTransaksi}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tanggalTransaksi: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">No. Bukti</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                  value={editForm.nomorBukti}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Uraian</label>
                <textarea
                  className="w-full border px-3 py-2 rounded"
                  value={editForm.keterangan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, keterangan: e.target.value })
                  }
                />
              </div>

              {editJenis === "PEMASUKAN" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium">
                      Debet (Rp)
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      value={
                        editForm.nominal === 0
                          ? ""
                          : editForm.nominal
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, "");
                        const num = Number(raw);
                        setEditForm({
                          ...editForm,
                          nominal: isNaN(num) ? 0 : num,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Kredit (Rp)
                    </label>
                    <input
                      type="number"
                      className="w-full border px-3 py-2 rounded"
                      value={0}
                      disabled
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium">
                      Debet (Rp)
                    </label>
                    <input
                      type="number"
                      className="w-full border px-3 py-2 rounded"
                      value={0}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Kredit (Rp)
                    </label>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      value={
                        editForm.nominal === 0
                          ? ""
                          : editForm.nominal
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, "");
                        const num = Number(raw);
                        setEditForm({
                          ...editForm,
                          nominal: isNaN(num) ? 0 : num,
                        });
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                onClick={handleSaveEdit}
              >
                <FaSave className="mr-2" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KasUmum;