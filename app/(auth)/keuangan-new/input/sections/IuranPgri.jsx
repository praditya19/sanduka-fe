"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_utils/GlobalApi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
  FaDollarSign,
  FaUsers,
  FaSave,
  FaUndo,
  FaSearch,
  FaPrint,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCoins,
  FaNewspaper,
  FaChartBar,
  FaTable,
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

const IuranPgriSection = () => {
  const router = useRouter();
  // Role & Cabang from session
  const [userRole, setUserRole] = useState(null);
  const [userCabang, setUserCabang] = useState("");
  const isSuperAdmin = userRole === "SUPERADMIN";
  const isAdminOrSuperAdmin = userRole === "SUPERADMIN" || userRole === "ADMIN";

  // Besaran Iuran State
  const [besaran, setBesaran] = useState({
    pb: 0,
    propinsi: 0,
    kabupaten: 0,
    cabang: 0,
    sanduka: 0,
  });
  const [loadingBesaran, setLoadingBesaran] = useState(false);

  // Target Iuran State
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalAnggotaCabang, setTotalAnggotaCabang] = useState(0);
  const [keterangan, setKeterangan] = useState("");

  // Saved status
  const [isSaved, setIsSaved] = useState(false);
  const [savedDataCount, setSavedDataCount] = useState(0);

  // Lists
  const [cabangList, setCabangList] = useState([]);
  const [bulanList, setBulanList] = useState([]);

  // Table State
  const [rawBalancingData, setRawBalancingData] = useState([]);
  const [pembayaranPerCabang, setPembayaranPerCabang] = useState({}); // Map total pembayaran per cabang dari iuran_anggota
  const [rekapIuranOverride, setRekapIuranOverride] = useState({}); // Override data from rekapitulasi-iuran (korreksi)
  const [loadingTable, setLoadingTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({
    totalAnggota: 0,
    tambahanCabang: 0,
    setoranTunai: 0,
    potonganBank: 0,
    pembayaran: 0,
    keterangan: "",
  });
  const itemsPerPage = 10;
  const [activeSubTab, setActiveSubTab] = useState("data-iuran"); // 'data-iuran' or 'peruntukan'
  const [summaryStats, setSummaryStats] = useState({
    totalTagihan: 0,
    totalSetoran: 0,
    totalSelisih: 0,
    potonganBank: 0,
    setoranTunai: 0,
    totalDibayar: 0,
  });

  // Dropdown Cabang Standard State
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [searchDropCabang, setSearchDropCabang] = useState("");
  const cabangRef = React.useRef(null);

  // Read role from session
  useEffect(() => {
    const role = sessionStorage.getItem("role");
    const cabang = (sessionStorage.getItem("cabang") || "").toUpperCase();
    setUserRole(role);
    setUserCabang(cabang);
    if (role === "ADMIN" && cabang) {
      setSearchQuery(cabang);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCabangSearch = (query) => {
    setSearchDropCabang(query);
    const filtered = cabangList.filter((cab) =>
      (cab.kecamatan || "").toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredCabangList(filtered);
  };

  const handleSelectCabang = (cabangName) => {
    setSearchQuery(cabangName);
    setShowCabangDropdown(false);
    setSearchDropCabang("");
    setCurrentPage(1);
  };

  const checkSavedStatus = async (bulan, tahun) => {
    try {
      const res = await GlobalApi.getRekapByPeriode(bulan, tahun);
      const data = Array.isArray(res) ? res : res?.data || [];
      setIsSaved(data.length > 0);
      setSavedDataCount(data.length);
    } catch (error) {
      setIsSaved(false);
      setSavedDataCount(0);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resBulan, resCabang, resIuran] = await Promise.all([
        GlobalApi.getBulan(),
        GlobalApi.getCabang(),
        GlobalApi.getDefaultIuranById(2),
      ]);

      setBulanList(resBulan.data || []);
      setCabangList(resCabang.data || []);
      setFilteredCabangList(resCabang.data || []);

      if (resIuran) {
        setBesaran({
          pb: parseInt(resIuran.pb) || 0,
          propinsi: parseInt(resIuran.propinsi) || 0,
          kabupaten: parseInt(resIuran.kabupaten) || 0,
          cabang: parseInt(resIuran.cabang) || 0,
          sanduka: parseInt(resIuran.sanduka) || 0,
        });
      }

      // Default month
      const currentMonth = new Date().getMonth();
      if (resBulan.data?.[currentMonth]) {
        setSelectedMonth(resBulan.data[currentMonth].namaBulan);
      }

      // Check saved status for selected period after month is set
      const defaultBulan = resBulan.data?.[currentMonth];
      if (defaultBulan) {
        checkSavedStatus(defaultBulan.namaBulan, new Date().getFullYear());
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Check saved status when month/year changes
  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;
    checkSavedStatus(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Fetch Table Data
  const fetchTransactions = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoadingTable(true);
    try {
      const monthObj = bulanList.find((b) => b.namaBulan === selectedMonth);
      const monthNumber = monthObj ? monthObj.id : new Date().getMonth() + 1;

      // Fetch bank balancing data, transaksi cabang, dan rekapitulasi iuran (korreksi)
      const [bankData, transaksiData, rekapIuranData] = await Promise.all([
        GlobalApi.getTransaksiBankBalancing(
          "",
          null,
          selectedYear,
          monthNumber,
          null,
          null,
        ),
        // Pembayaran dari transaksi_cabang per pos (input keuangan cabang)
        GlobalApi.getTransaksiCabangByBulanTahun(monthNumber, selectedYear),
        // Data korreksi dari rekapitulasi_iuran untuk override tampilan
        GlobalApi.getRekapByPeriode(selectedMonth, selectedYear).catch(() => []),
      ]);

      setRawBalancingData(bankData || []);

      // Build lookup map for rekapitulasi-iuran overrides
      const rekapList = Array.isArray(rekapIuranData) ? rekapIuranData : rekapIuranData?.data || [];
      const rekapMap = {};
      rekapList.forEach(r => {
        const key = (r.cabang || "").toString().trim().replace(/\s+/g, " ").toUpperCase();
        rekapMap[key] = r;
      });
      setRekapIuranOverride(rekapMap);

      const normalizeCabangKey = (value) =>
        (value || "").toString().trim().replace(/\s+/g, " ").toUpperCase();

      // Parse transaksi_cabang untuk mapping pembayaran per cabang.
      // Filter khusus pos Iuran PGRI & Sanduka (karena ini tab Iuran PGRI)
      // Format: { "CABANG_NAME": totalPembayaran }
      const posIuran = new Set(["iuran pgri", "iuran", "sanduka"]);
      const pembayaranPerCabang = {};
      if (transaksiData && Array.isArray(transaksiData)) {
        transaksiData.forEach((item) => {
          const cabangKey = normalizeCabangKey(item.cabang);
          if (!cabangKey) return;

          const pos = (item.pos || "").toLowerCase().trim();
          if (!posIuran.has(pos)) return;

          pembayaranPerCabang[cabangKey] =
            (pembayaranPerCabang[cabangKey] || 0) + Number(item.pembayaran || 0);
        });
      }
      setPembayaranPerCabang(pembayaranPerCabang);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingTable(false);
    }
  }, [selectedMonth, selectedYear, bulanList]);

  // Compute Transactions Table
  const transactions = useMemo(() => {
    if (!rawBalancingData.length) return [];

    const grouped = rawBalancingData.reduce((acc, item) => {
      const cab = item.cabang || "Lainnya";
      if (!acc[cab]) {
        acc[cab] = {
          members: new Set(),
          potBank: 0,
          tunai: 0,
          manualByNpa: {}, // Store manual sum per NPA to pick the most complete data
        };
      }

      if (item.npa) {
        acc[cab].members.add(item.npa);

        // Helper untuk membersihkan format Rupiah
        const parseCurrency = (val) => {
          if (!val) return 0;
          const cleaned = val
            .toString()
            .replace(/[^0-9,-]/g, "")
            .replace(",", ".");
          return parseFloat(cleaned) || 0;
        };

        // Pastikan data sesuai dengan periode yang dipilih
        let itemDate = item.tagihanUntukBulan || item.tagihan_untuk_bulan || "";
        if (Array.isArray(itemDate) && itemDate.length >= 2) {
          itemDate = `${itemDate[0]}-${String(itemDate[1]).padStart(2, "0")}`;
        }

        // Hanya hitung jika periode cocok (Mei 2026 -> 2026-05)
        const selectedPeriod = `${selectedYear}-${String(bulanList.find((b) => b.namaBulan === selectedMonth)?.id || "").padStart(2, "0")}`;
        if (itemDate && !itemDate.toString().includes(selectedPeriod))
          return acc;

        // Ambil nilai manual murni dari database (sesuai query SQL user)
        const mPgri = parseCurrency(item.manualPgri || item.manual_pgri);
        const mSanduka = parseCurrency(
          item.manualSanduka || item.manual_sanduka,
        );
        const mDaspen = parseCurrency(item.manualDaspen || item.manual_daspen);
        const mDerap = parseCurrency(item.manualDerap || item.manual_derap);
        const mKalender = parseCurrency(
          item.manualKalender || item.manual_kalender,
        );
        const mLain = parseCurrency(
          item.manualLainLain || item.manual_lain_lain,
        );

        // Jumlahkan hanya komponen manual
        const currentManual =
          mPgri + mSanduka + mDaspen + mDerap + mKalender + mLain;

        // Simpan nilai manual tertinggi yang ditemukan untuk NPA ini
        if (
          !acc[cab].manualByNpa[item.npa] ||
          currentManual > acc[cab].manualByNpa[item.npa]
        ) {
          acc[cab].manualByNpa[item.npa] = currentManual;
        }
      }

      // Helper untuk membersihkan format Rupiah
      const parseCurrency = (val) => {
        if (!val) return 0;
        const cleaned = val
          .toString()
          .replace(/[^0-9,-]/g, "")
          .replace(",", ".");
        return parseFloat(cleaned) || 0;
      };

      const amountBank = parseCurrency(item.potongan);
      const amountTotal = parseCurrency(item.totalIuran);

      if (item.keterangan?.toLowerCase() === "sukses") {
        acc[cab].potBank += amountBank;
      } else if (item.keterangan?.toLowerCase().startsWith("tunai")) {
        acc[cab].tunai += amountTotal;
      }
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map((cabName) => {
        const cabangKey = (cabName || "").toString().trim().replace(/\s+/g, " ").toUpperCase();
        const group = grouped[cabName];
        let totalAnggota = group.members.size;

        const pb = totalAnggota * besaran.pb;
        const prov = totalAnggota * besaran.propinsi;
        const kab = totalAnggota * besaran.kabupaten;
        const cabPeruntukan = totalAnggota * besaran.cabang;
        const sanduka = totalAnggota * besaran.sanduka;

        const manualTotal = Object.values(group.manualByNpa).reduce(
          (sum, val) => sum + val,
          0,
        );
        let tambahan = manualTotal;
        let totalCabang = cabPeruntukan + tambahan;
        let totalTagihan = pb + prov + kab + totalCabang + sanduka;
        let potBank = group.potBank;
        let tunai = group.tunai;
        let pembayaran =
          pembayaranPerCabang[cabangKey] || 0;
        const totalTagihanCabang = pb + prov + kab + sanduka;
        let selisih = totalTagihanCabang - pembayaran;

        // Terapkan override dari rekapitulasi-iuran (data korreksi) jika ada
        const override = rekapIuranOverride[cabangKey];
        if (override) {
          totalAnggota = override.totalAnggota ?? totalAnggota;
          const opb = override.pb ?? (totalAnggota * besaran.pb);
          const oprov = override.provinsi ?? (totalAnggota * besaran.propinsi);
          const okab = override.kabupaten ?? (totalAnggota * besaran.kabupaten);
          const ocab = override.cabangIuran ?? (totalAnggota * besaran.cabang);
          const osanduka = override.sanduka ?? (totalAnggota * besaran.sanduka);
          tambahan = override.tambahanCabang ?? tambahan;
          totalCabang = ocab + tambahan;
          potBank = override.potonganBank ?? potBank;
          tunai = override.setoranTunai ?? tunai;
          pembayaran = override.pembayaran ?? pembayaran;
          totalTagihan = opb + oprov + okab + totalCabang + osanduka;
          selisih = override.selisih ?? (opb + oprov + okab + osanduka - pembayaran);
          return [
            cabName, totalAnggota, opb, oprov, okab, ocab, tambahan, totalCabang,
            osanduka, totalTagihan, potBank, tunai, pembayaran, selisih,
          ];
        }

        return [
          cabName, totalAnggota, pb, prov, kab, cabPeruntukan, tambahan, totalCabang,
          sanduka, totalTagihan, potBank, tunai, pembayaran, selisih,
        ];
      })
      .filter((row) => {
        if (!searchQuery) return true;
        return row[0].toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [rawBalancingData, besaran, searchQuery, pembayaranPerCabang, rekapIuranOverride]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate Totals for Footer
  const columnTotals = useMemo(() => {
    if (!transactions.length) return Array(14).fill(0);
    return transactions.reduce((acc, row) => {
      for (let i = 1; i <= 13; i++) {
        acc[i] += parseFloat(row[i]) || 0;
      }
      return acc;
    }, Array(14).fill(0));
  }, [transactions]);

  // Calculate Summary Stats
  useEffect(() => {
    if (transactions.length > 0) {
      const isFiltered = !!searchQuery;

      const stats = transactions.reduce(
        (acc, row) => {
          // row structure from the map:
          // [cabName, totalAnggota, pb, prov, kab, cabPeruntukan, tambahan, totalCabang, sanduka, totalTagihanRow, potBank, tunai, pembayaran, selisih]
          // Indices: 0:cab, 1:members, 2:pb, 3:prov, 4:kab, 5:peruntukan, 6:tambahan, 7:totalCab, 8:sanduka, 9:tagihan, 10:bank, 11:tunai, 12:pembayaran, 13:selisih

          const pb = row[2] || 0;
          const prov = row[3] || 0;
          const kab = row[4] || 0;
          const totalCab = row[7] || 0;
          const sanduka = row[8] || 0;

          // Rumus user: pb + provinsi + kabupaten
          // Jika percabang: tambahkan porsi cabang itu sendiri (totalCab) dan sanduka
          const tagihanDisplay = isFiltered
            ? pb + prov + kab + totalCab + sanduka
            : pb + prov + kab;

          const potBank = row[10] || 0;
          const tunai = row[11] || 0;
          const pembayaran = row[12] || 0; // Pembayaran dari Jurnal Organisasi

          acc.totalTagihan += tagihanDisplay;
          acc.totalSetoran += pembayaran;
          acc.totalSelisih += tagihanDisplay - pembayaran;
          acc.potonganBank += potBank;
          acc.setoranTunai += tunai;
          acc.totalDibayar += pembayaran; // Gunakan pembayaran dari Jurnal Organisasi
          return acc;
        },
        {
          totalTagihan: 0,
          totalSetoran: 0,
          totalSelisih: 0,
          potonganBank: 0,
          setoranTunai: 0,
          totalDibayar: 0,
        },
      );
      setSummaryStats(stats);
    } else {
      setSummaryStats({
        totalTagihan: 0,
        totalSetoran: 0,
        totalSelisih: 0,
        potonganBank: 0,
        setoranTunai: 0,
        totalDibayar: 0,
      });
    }
  }, [transactions, searchQuery]);

  const handleSaveTable = async () => {
    if (!transactions.length) {
      toast.error("Tidak ada data untuk disimpan.");
      return;
    }

    const loadingToast = toast.loading("Sedang menyimpan data rekapitulasi...");
    try {
      const monthObj = bulanList.find((b) => b.namaBulan === selectedMonth);
      const monthId = monthObj ? monthObj.id : new Date().getMonth() + 1;

      const payload = transactions.map((row) => ({
        cabang: row[0],
        totalAnggota: parseInt(row[1]) || 0,
        pb: Math.round(row[2]) || 0,
        provinsi: Math.round(row[3]) || 0,
        kabupaten: Math.round(row[4]) || 0,
        cabangIuran: Math.round(row[5]) || 0,
        tambahanCabang: Math.round(row[6]) || 0,
        totalCabang: Math.round(row[7]) || 0,
        sanduka: Math.round(row[8]) || 0,
        totalTagihan: Math.round(row[9]) || 0,
        potonganBank: Math.round(row[10]) || 0,
        setoranTunai: Math.round(row[11]) || 0,
        pembayaran: Math.round(row[12]) || 0,
        selisih: Math.round(row[13]) || 0,
        bulan: selectedMonth,
        bulanId: monthId,
        tahun: selectedYear,
        keterangan: "Simpan Rekapitulasi Otomatis",
      }));

      await GlobalApi.saveRekapBatch(payload);
      toast.success("Rekapitulasi data iuran berhasil disimpan ke database!", {
        id: loadingToast,
      });
      setIsSaved(true);
      const res = await GlobalApi.getRekapByPeriode(selectedMonth, selectedYear);
      const data = Array.isArray(res) ? res : res?.data || [];
      setSavedDataCount(data.length);
    } catch (error) {
      console.error("Error saving rekap batch:", error);
      toast.error("Gagal menyimpan data rekapitulasi.", { id: loadingToast });
    }
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setEditForm({
      totalAnggota: row[1] || 0,
      tambahanCabang: row[6] || 0,
      setoranTunai: row[11] || 0,
      potonganBank: row[10] || 0,
      pembayaran: row[12] || 0,
      keterangan: "Koreksi Data",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const monthObj = bulanList.find((b) => b.namaBulan === selectedMonth);
      const monthId = monthObj ? monthObj.id : new Date().getMonth() + 1;

      // Hitung ulang nilai berdasarkan anggota yang dikoreksi
      const pb = editForm.totalAnggota * besaran.pb;
      const prov = editForm.totalAnggota * besaran.propinsi;
      const kab = editForm.totalAnggota * besaran.kabupaten;
      const cabPeruntukan = editForm.totalAnggota * besaran.cabang;
      const sanduka = editForm.totalAnggota * besaran.sanduka;
      const totalCabang = cabPeruntukan + editForm.tambahanCabang;
      const totalTagihan = pb + prov + kab + totalCabang + sanduka;
      const pembayaran = editForm.pembayaran || (editForm.potonganBank + editForm.setoranTunai);
      const selisih = totalTagihan - pembayaran;

      const payload = {
        cabang: editingRow[0],
        totalAnggota: editForm.totalAnggota,
        bulan: selectedMonth,
        bulanId: monthId,
        tahun: selectedYear,
        pb: Math.round(pb),
        provinsi: Math.round(prov),
        kabupaten: Math.round(kab),
        cabangIuran: Math.round(cabPeruntukan),
        tambahanCabang: Math.round(editForm.tambahanCabang),
        totalCabang: Math.round(totalCabang),
        sanduka: Math.round(sanduka),
        totalTagihan: Math.round(totalTagihan),
        potonganBank: Math.round(editForm.potonganBank),
        setoranTunai: Math.round(editForm.setoranTunai),
        pembayaran: Math.round(pembayaran),
        selisih: Math.round(selisih),
        keterangan: editForm.keterangan || "Koreksi via Dashboard",
      };

      // Simpan ke tabel rekapitulasi baru
      await GlobalApi.saveRekap(payload);

      // Tetap simpan ke target-sanduka lama jika masih dibutuhkan untuk kompatibilitas
      await GlobalApi.createTargetIuaran({
        cabang: editingRow[0],
        jumlah: editForm.totalAnggota,
        bulan: selectedMonth,
        tahun: selectedYear,
        keterangan: editForm.keterangan || "Koreksi via Dashboard",
      });

      // Simpan pembayaran terkoreksi ke transaksi_cabang agar tampil di form tagihan
      try {
        const transaksiCabangList = await GlobalApi.getTransaksiCabangByBulanTahun(monthId, selectedYear);
        const list = Array.isArray(transaksiCabangList) ? transaksiCabangList : transaksiCabangList?.data || [];
        const existing = list.find(t =>
          (t.cabang || "").trim().toUpperCase() === (editingRow[0] || "").trim().toUpperCase() &&
          ["iuran pgri", "iuran"].includes((t.pos || "").toLowerCase().trim())
        );
        if (existing) {
          await GlobalApi.updateTransaksiCabang(existing.id, {
            ...existing,
            pembayaran: Math.round(pembayaran),
            keterangan: (editForm.keterangan || "Koreksi via Dashboard") + " (Override)",
          });
        } else {
          await GlobalApi.createTransaksiCabangBatch([{
            tanggalTransaksi: new Date().toISOString().split('T')[0],
            jenisTransaksi: "PEMASUKAN",
            pos: "IURAN PGRI",
            cabang: editingRow[0],
            setoranBulan: monthId,
            setoranTahun: selectedYear,
            jenisPenerimaan: "Transfer",
            tagihan: Math.round(totalTagihan),
            pembayaran: Math.round(pembayaran),
            keterangan: editForm.keterangan || "Koreksi via Dashboard",
          }]);
        }
      } catch (txError) {
        console.error("Error saving correction to transaksi_cabang:", txError);
      }

      toast.success(`Data ${editingRow[0]} berhasil dikoreksi dan disimpan!`);
      setIsEditModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error saving edit:", error);
      toast.error("Gagal menyimpan koreksi data.");
    }
  };

  const handleDelete = (row) => {
    if (
      confirm(`Apakah Anda yakin ingin menghapus data koreksi untuk ${row[0]}?`)
    ) {
      toast.success(`Data ${row[0]} berhasil direset!`);
      // Logic for actual delete would go here
    }
  };

  // Handlers
  const handleUpdateBesaran = async () => {
    setLoadingBesaran(true);
    try {
      const payload = {
        pb: besaran.pb,
        propinsi: besaran.propinsi,
        kabupaten: besaran.kabupaten,
        cabang: besaran.cabang,
        sanduka: besaran.sanduka,
        iuran: "IURAN PGRI",
      };
      await GlobalApi.updateIuranData(2, payload);
      toast.success("Besaran iuran berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui besaran iuran.");
    } finally {
      setLoadingBesaran(false);
    }
  };

  const handleSubmitTarget = async (e) => {
    e.preventDefault();
    if (!selectedCabang || !selectedMonth) {
      toast.error("Pilih Cabang dan Bulan!");
      return;
    }
    try {
      const payload = {
        cabang: selectedCabang,
        jumlah: totalAnggotaCabang,
        bulan: selectedMonth,
        keterangan: keterangan,
        tahun: selectedYear,
      };
      await GlobalApi.createTargetIuaran(payload);
      toast.success(`Berhasil menyimpan data untuk ${selectedCabang}`);
      fetchTransactions();
      setKeterangan("");
    } catch (error) {
      toast.error("Gagal menyimpan data.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalIuran =
    besaran.pb + besaran.propinsi + besaran.kabupaten + besaran.cabang;
  const grandTotal = totalIuran + besaran.sanduka;

  // Pagination Logic (Show all branches)
  const paginatedData = transactions;

  return (
    <div className="flex flex-col h-full">
      <Toaster position="top-center" />

      {/* Top Banner */}
      <div className="bg-emerald-500 p-3 sm:p-6 text-white">
        <div className="flex flex-row items-center space-x-3 sm:space-x-4">
          <div className="p-1.5 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-md flex-shrink-0">
            <FaDollarSign className="text-base sm:text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-xl font-bold leading-tight sm:leading-normal">
              Manajemen Iuran PGRI
            </h2>
            <div className="flex flex-row items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 sm:mt-1">
              <span className="px-1.5 sm:px-2 py-0.5 bg-white/20 rounded-md text-[8px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                {selectedMonth} {selectedYear}
              </span>
              <span className="hidden sm:inline w-1 h-1 bg-white/40 rounded-full flex-shrink-0" />
              <p className="text-emerald-100 text-[7px] sm:text-[10px] font-medium uppercase tracking-widest truncate">
                Kelola besaran iuran & target setoran
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-6 space-y-4 sm:space-y-8 overflow-y-auto">
        {/* Top Section: Form Besaran (Full Width) - SUPERADMIN & ADMIN */}
        {isAdminOrSuperAdmin && <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="bg-slate-50/50 p-2.5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 flex-shrink-0">
                <FaCoins className="text-xs sm:text-base" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base font-bold text-slate-800 tracking-tight">
                  Besaran Iuran Standar
                </h3>
                <p className="text-slate-400 text-[7px] sm:text-[9px] font-medium uppercase tracking-wider sm:tracking-widest">
                  Parameter Keuangan
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchInitialData()}
              className="px-2 sm:px-3 py-1 sm:py-1 bg-white border border-slate-200 rounded-lg text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
            >
              Reset
            </button>
          </div>

          <div className="p-2 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: "Iuran Pusat (PB)", key: "pb", icon: "🇮🇩" },
                { label: "Iuran Provinsi", key: "propinsi", icon: "🏛️" },
                { label: "Iuran Kabupaten", key: "kabupaten", icon: "🏙️" },
                { label: "Iuran Cabang", key: "cabang", icon: "🏘️" },
                {
                  label: "Sumbangan Sanduka",
                  key: "sanduka",
                  icon: "🤝",
                  full: true,
                },
              ].map((field) => (
                <div
                  key={field.key}
                  className={field.full ? "sm:col-span-2 lg:col-span-4" : ""}
                >
                  <label className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-1.5 block px-1 flex items-center gap-1.5">
                    <span className="text-base sm:text-lg">{field.icon}</span>
                    <span>{field.label}</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                      <span className="text-slate-300 font-bold text-xs sm:text-sm">
                        Rp
                      </span>
                    </div>
                    <input
                      type="number"
                      value={besaran[field.key]}
                      disabled={!isSuperAdmin}
                      onChange={(e) =>
                        setBesaran({
                          ...besaran,
                          [field.key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-transparent rounded-[12px] sm:rounded-[16px] focus:bg-white focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all text-sm sm:text-base shadow-inner ${isSuperAdmin ? "group-hover:bg-slate-100/50" : "cursor-not-allowed opacity-60"}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 items-end">
              <div className="lg:col-span-2 grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2 sm:p-4 bg-slate-900 rounded-xl sm:rounded-[24px] text-white flex flex-col justify-between border-b-2 sm:border-b-4 border-slate-700">
                  <p className="text-[6px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest mb-0.5">
                    Total Iuran PGRI
                  </p>
                  <h5 className="text-[11px] sm:text-base font-bold truncate">
                    {formatCurrency(totalIuran)}
                  </h5>
                </div>
                <div className="p-2 sm:p-4 bg-emerald-500 rounded-xl sm:rounded-[24px] text-white flex flex-col justify-between shadow-lg shadow-emerald-100 border-b-2 sm:border-b-4 border-emerald-600">
                  <p className="text-[6px] sm:text-[8px] font-bold text-emerald-100 uppercase tracking-wider sm:tracking-widest mb-0.5">
                    Grand Total
                  </p>
                  <h5 className="text-[11px] sm:text-lg font-bold truncate">
                    {formatCurrency(grandTotal)}
                  </h5>
                </div>
              </div>
              {isSuperAdmin && <button
                onClick={handleUpdateBesaran}
                disabled={loadingBesaran}
                className="w-full py-2 sm:py-5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-xl sm:rounded-[24px] font-bold shadow-xl shadow-slate-200 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] text-xs sm:text-base"
              >
                {loadingBesaran ? (
                  <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaSave className="text-xs sm:text-base" />
                )}
                <span className="tracking-tight">Simpan</span>
              </button>}
            </div>
          </div>
        </motion.div>}

        {/* Bottom Section: Laporan */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-[18px] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm flex-shrink-0">
                <FaNewspaper className="text-sm sm:text-xl" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight">
                  Laporan & Rekapitulasi
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-xs font-medium truncate">
                  Monitoring peruntukan & realisasi iuran
                </p>
              </div>
            </div>

            <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-[12px] sm:rounded-[18px] shadow-inner border border-slate-200 w-fit">
              <button
                onClick={() => {
                  setActiveSubTab("data-iuran");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-[10px] sm:rounded-[15px] font-bold text-[8px] sm:text-[9px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeSubTab === "data-iuran"
                  ? "bg-white text-indigo-600 shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <FaChartBar
                  className={`text-xs sm:text-sm ${activeSubTab === "data-iuran" ? "text-indigo-500" : ""}`}
                />
                <span className="hidden sm:inline">Data Iuran</span>
                <span className="sm:hidden">Iuran</span>
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("peruntukan");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-[10px] sm:rounded-[15px] font-bold text-[8px] sm:text-[9px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeSubTab === "peruntukan"
                  ? "bg-white text-indigo-600 shadow-lg"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <FaTable
                  className={`text-xs sm:text-sm ${activeSubTab === "peruntukan" ? "text-indigo-500" : ""}`}
                />
                <span className="hidden sm:inline">Peruntukan Cabang</span>
                <span className="sm:hidden">Cabang</span>
              </button>
            </div>
          </div>

          <div className="w-full space-y-6">
            {/* Main Content Area */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSubTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {activeSubTab === "data-iuran" && (
                    <>
                      {/* Summary Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                        {[
                          {
                            label: "Total Anggota",
                            val: columnTotals[1],
                            color: "bg-blue-600",
                            icon: <FaUsers />,
                            isCurrency: false,
                          },
                          {
                            label: "Total Tagihan",
                            val: summaryStats.totalTagihan,
                            color: "bg-indigo-600",
                            icon: <FaNewspaper />,
                            isCurrency: true,
                          },
                          {
                            label: "Setoran Diterima",
                            val: summaryStats.totalSetoran,
                            color: "bg-emerald-500",
                            icon: <FaCheckCircle />,
                            isCurrency: true,
                          },
                          {
                            label: "Total Selisih",
                            val: summaryStats.totalSelisih,
                            color: "bg-rose-500",
                            icon: <FaExclamationCircle />,
                            isCurrency: true,
                          },
                        ].map((stat, i) => (
                          <div
                            key={i}
                            className={`${stat.color} p-2.5 sm:p-5 rounded-xl sm:rounded-[28px] text-white shadow-lg flex items-center justify-between group overflow-hidden relative`}
                          >
                            <div className="relative z-10 min-w-0">
                              <p className="text-[7px] sm:text-[9px] font-bold opacity-60 uppercase tracking-wider sm:tracking-widest mb-0.5 truncate">
                                {stat.label}
                              </p>
                              <h4 className="text-xs sm:text-xl font-bold truncate">
                                {stat.isCurrency
                                  ? formatCurrency(stat.val)
                                  : stat.val.toLocaleString("id-ID")}
                              </h4>
                            </div>
                            <div className="text-lg sm:text-3xl opacity-10 group-hover:scale-125 transition-transform duration-500 flex-shrink-0 ml-1">
                              {stat.icon}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Detail Section */}
                      <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50">
                        <div className="flex items-center gap-2 mb-3 sm:mb-6">
                          <div className="w-1 h-4 sm:h-5 bg-indigo-500 rounded-full" />
                          <h4 className="text-xs sm:text-base font-bold text-slate-800">
                            Rincian Pembayaran{" "}
                            <span className="text-indigo-600 hidden sm:inline">- {selectedMonth} {selectedYear}</span>
                            <span className="text-indigo-600 sm:hidden">{selectedMonth.slice(0,3)} {selectedYear}</span>
                          </h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-6">
                          {[
                            {
                              label: "Bank",
                              labelSm: "🏦",
                              val: summaryStats.potonganBank,
                              color: "text-rose-500",
                            },
                            {
                              label: "Tunai",
                              labelSm: "💵",
                              val: summaryStats.setoranTunai,
                              color: "text-blue-500",
                            },
                            {
                              label: "Total",
                              labelSm: "∑",
                              val: summaryStats.totalDibayar,
                              color: "text-emerald-600",
                            },
                          ].map((item, i) => (
                            <div key={i} className="relative text-center sm:text-left">
                              <p className="text-[8px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 italic truncate">
                                <span className="sm:hidden">{item.labelSm}</span>
                                <span className="hidden sm:inline">{item.label}</span>
                              </p>
                              <p
                                className={`text-[11px] sm:text-base font-bold ${item.color} truncate`}
                              >
                                {formatCurrency(item.val)}
                              </p>
                              {i < 2 && (
                                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-100" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full Table */}
                      <div className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-3 sm:p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-3 sm:gap-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full">
                            <div className="flex items-center gap-2 min-w-fit">
                              <FaTable className="text-indigo-500 text-sm" />
                              <h4 className="text-[10px] font-bold text-slate-800 tracking-tight uppercase tracking-widest">
                                Tabel Rekapitulasi Iuran
                              </h4>
                            </div>

                            {/* Search & Date Filter in Header */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                              <div
                                className="relative min-w-0 w-full sm:w-auto sm:min-w-[200px]"
                                ref={cabangRef}
                              >
                                <div className="relative group">
                                  <Input
                                    type="text"
                                    value={searchQuery || "Semua Cabang"}
                                    readOnly
                                    onClick={() => {
                                      if (isSuperAdmin) {
                                        setShowCabangDropdown(
                                          !showCabangDropdown,
                                        );
                                        setFilteredCabangList(cabangList);
                                      }
                                    }}
                                    className={`w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs shadow-sm ${isSuperAdmin ? "cursor-pointer hover:border-indigo-300" : "cursor-default opacity-70"}`}
                                    placeholder="Pilih Cabang"
                                  />
                                  {isSuperAdmin && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px] transition-transform duration-300 group-hover:text-indigo-500">
                                    {showCabangDropdown ? "▲" : "▼"}
                                  </div>}
                                </div>
                                {showCabangDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute z-[100] border border-slate-100 rounded-xl bg-white shadow-2xl mt-2 w-full max-h-72 overflow-hidden flex flex-col ring-1 ring-black/5"
                                  >
                                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                      <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]" />
                                        <Input
                                          type="text"
                                          value={searchDropCabang}
                                          onChange={(e) =>
                                            handleCabangSearch(e.target.value)
                                          }
                                          className="w-full pl-8 pr-3 py-2 text-[10px] font-bold border-slate-200 rounded-lg focus:ring-indigo-500 bg-white"
                                          placeholder="Ketik nama cabang..."
                                          autoFocus
                                        />
                                      </div>
                                    </div>
                                    <ul className="overflow-y-auto py-2 custom-scrollbar">
                                      <li
                                        onClick={() => handleSelectCabang("")}
                                        className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 border-l-2 ${!searchQuery
                                          ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                                          : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
                                          }`}
                                      >
                                        Semua Cabang
                                      </li>
                                      {[...filteredCabangList]
                                        .sort((a, b) =>
                                          (a.kecamatan || "").localeCompare(
                                            b.kecamatan || "",
                                          ),
                                        )
                                        .map((cab, idx) => (
                                          <li
                                            key={idx}
                                            onClick={() =>
                                              handleSelectCabang(cab.kecamatan)
                                            }
                                            className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 border-l-2 ${searchQuery === cab.kecamatan
                                              ? "bg-indigo-50 text-indigo-600 border-indigo-500"
                                              : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
                                              }`}
                                          >
                                            {cab.kecamatan}
                                          </li>
                                        ))}
                                    </ul>
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 bg-slate-50 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-slate-100">
                                <select
                                  value={selectedMonth}
                                  onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                  }
                                  className="bg-transparent px-2 sm:px-4 py-1.5 sm:py-2.5 outline-none font-bold text-slate-600 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest cursor-pointer"
                                >
                                  {bulanList.map((b) => (
                                    <option key={b.id} value={b.namaBulan}>
                                      {b.namaBulan}
                                    </option>
                                  ))}
                                </select>
                                <div className="w-[1px] h-4 sm:h-5 bg-slate-200" />
                                <select
                                  value={selectedYear}
                                  onChange={(e) =>
                                    setSelectedYear(parseInt(e.target.value))
                                  }
                                  className="bg-transparent px-2 sm:px-4 py-1.5 sm:py-2.5 outline-none font-bold text-slate-600 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest cursor-pointer"
                                >
                                  {Array.from({ length: new Date().getFullYear() + 2 - 2020 + 1 }, (_, i) => 2020 + i).map((y) => (
                                    <option key={y} value={y}>
                                      {y}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {isSaved ? (
                              <span className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-emerald-50 text-emerald-700 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest border border-emerald-200">
                                <FaCheckCircle className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">TERSIMPAN ({savedDataCount})</span>
                                <span className="sm:hidden">✓{savedDataCount}</span>
                              </span>
                            ) : (
                              <span className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest border border-amber-200">
                                <FaExclamationCircle className="text-xs sm:text-sm" />
                                BELUM DISIMPAN
                              </span>
                            )}
                            {isSuperAdmin && (
                              <button
                                onClick={handleSaveTable}
                                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-3 bg-emerald-500 text-white rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-md"
                              >
                                <FaSave className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">Simpan</span>
                              </button>
                            )}
                            <button
                              onClick={() => window.print()}
                              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-3 bg-slate-900 text-white rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest hover:bg-black transition-all active:scale-95 shadow-md"
                            >
                              <FaPrint className="text-xs sm:text-sm" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100">
                                {[
                                  "No",
                                  "Cabang/Khusus",
                                  "Total Anggota",
                                  "Pusat (PB)",
                                  "Peruntukan Provinsi",
                                  "Peruntukan Kabupaten",
                                  "Peruntukan Cabang",
                                  "Tambahan Cabang",
                                  "Total Cabang",
                                  "Sanduka",
                                  "Total Tagihan Cabang",
                                  "Total Tagihan",
                                  "Potongan Bank",
                                  "Dana Tunai",
                                  "Pembayaran",
                                  "Selisih",
                                  ...(isSuperAdmin ? ["Action"] : []),
                                ].map((h, i) => (
                                  <th
                                    key={i}
                                    className="px-2 sm:px-3 py-2 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-slate-400 text-center whitespace-nowrap"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {loadingTable ? (
                                Array(5)
                                  .fill(0)
                                  .map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                      <td colSpan={15} className="p-3 sm:p-6">
                                        <div className="h-3 bg-slate-100 rounded-full w-full" />
                                      </td>
                                    </tr>
                                  ))
                              ) : paginatedData.length > 0 ? (
                                <>
                                  {paginatedData.map((row, i) => {
                                    const totalCabang =
                                      parseInt(row[5] || 0) +
                                      parseInt(row[6] || 0);
                                    const totalTagihanRow =
                                      parseInt(row[2] || 0) +
                                      parseInt(row[3] || 0) +
                                      parseInt(row[4] || 0) +
                                      totalCabang +
                                      parseInt(row[8] || 0);
                                    return (
                                      <tr
                                        key={i}
                                        className="hover:bg-slate-50/80 transition-colors text-center text-[10px] sm:text-[11px] font-bold text-slate-600"
                                      >
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-slate-400 font-bold text-[9px] sm:text-[11px]">
                                          {i + 1}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 font-bold text-slate-800 text-left whitespace-nowrap text-[9px] sm:text-[11px]">
                                          {row[0]}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-indigo-600 font-bold">
                                          <span className="px-1 sm:px-2 py-0.5 bg-indigo-50 rounded-md text-[9px] sm:text-[11px]">
                                            {row[1]}
                                          </span>
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[2])}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[3])}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[4])}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[5])}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[6])}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-emerald-600 text-[9px] sm:text-[11px]">
                                          {formatCurrency(
                                            row[7] || totalCabang,
                                          )}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[8])}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-amber-700 bg-amber-50/50 font-bold text-[9px] sm:text-[11px]">
                                          {formatCurrency(
                                            parseInt(row[2] || 0) +
                                            parseInt(row[3] || 0) +
                                            parseInt(row[4] || 0) +
                                            parseInt(row[8] || 0),
                                          )}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-slate-900 bg-slate-50/50 font-bold text-[9px] sm:text-[11px]">
                                          {formatCurrency(
                                            row[9] || totalTagihanRow,
                                          )}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-rose-500 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[10] || 0)}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-blue-600 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[11] || 0)}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          {formatCurrency(row[12] || 0)}
                                        </td>
                                        <td className="px-1.5 sm:px-3 py-2 sm:py-4 text-[9px] sm:text-[11px]">
                                          <span className="px-1 sm:px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] sm:text-[11px]">
                                            {formatCurrency(
                                              (parseInt(row[2] || 0) +
                                                parseInt(row[3] || 0) +
                                                parseInt(row[4] || 0) +
                                                parseInt(row[8] || 0)) -
                                              parseInt(row[12] || 0),
                                            )}
                                          </span>
                                        </td>
                                        {isSuperAdmin && (
                                          <td className="px-1.5 sm:px-3 py-2 sm:py-4">
                                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                              <button
                                                onClick={() => handleEdit(row)}
                                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                title="Edit"
                                              >
                                                <FaEdit size={10} />
                                              </button>
                                              <button
                                                onClick={() => handleDelete(row)}
                                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Delete"
                                              >
                                                <FaTrash size={10} />
                                              </button>
                                            </div>
                                          </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                  {/* Total Row */}
                                  <tr className="bg-slate-900 text-white font-bold text-[9px] sm:text-[11px] text-center sticky bottom-0">
                                    <td
                                      className="px-1.5 sm:px-3 py-2 sm:py-5 border-r border-slate-800"
                                      colSpan={2}
                                    >
                                      TOTAL
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 bg-indigo-500/20 text-indigo-300">
                                      {columnTotals[1]}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[2])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[3])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[4])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[5])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[6])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 text-emerald-400">
                                      {formatCurrency(columnTotals[7])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[8])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 bg-amber-500/20 text-amber-300 font-bold">
                                      {formatCurrency(
                                        columnTotals[2] + columnTotals[3] + columnTotals[4] + columnTotals[8],
                                      )}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 bg-slate-800 font-bold text-amber-400">
                                      {formatCurrency(columnTotals[9])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 text-rose-400">
                                      {formatCurrency(columnTotals[10])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 text-blue-400">
                                      {formatCurrency(columnTotals[11])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5">
                                      {formatCurrency(columnTotals[12])}
                                    </td>
                                    <td className="px-1.5 sm:px-3 py-2 sm:py-5 bg-rose-500/20 text-white">
                                      {formatCurrency(columnTotals[13])}
                                    </td>
                                    {isSuperAdmin && <td className="px-1.5 sm:px-3 py-2 sm:py-5">-</td>}
                                  </tr>
                                </>
                              ) : (
                                <tr>
                                  <td
                                    colSpan={15}
                                    className="py-16 text-center text-slate-300 font-bold uppercase tracking-widest text-xs"
                                  >
                                    Data Kosong
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {activeSubTab === "peruntukan" && (
                    <div className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                      <div className="p-3 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                          <FaTable className="text-indigo-500 text-xs sm:text-sm" />
                          <h4 className="text-[10px] sm:text-sm font-bold text-slate-800 tracking-tight uppercase tracking-widest">
                            Peruntukan Cabang{" "}
                            <span className="text-indigo-600 hidden sm:inline">- {selectedMonth} {selectedYear}</span>
                            <span className="text-indigo-600 sm:hidden">{selectedMonth.slice(0,3)} {selectedYear}</span>
                          </h4>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                              {[
                                "No",
                                "Cabang/Khusus",
                                "Anggota",
                                "Peruntukan Cabang",
                                "Tambahan Cabang",
                                "Total Alokasi",
                              ].map((h, i) => (
                                <th
                                  key={i}
                                  className="px-2 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-slate-400 text-center whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {loadingTable ? (
                              Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="p-3 sm:p-8">
                                      <div className="h-3 bg-slate-100 rounded-full w-full" />
                                    </td>
                                  </tr>
                                ))
                            ) : paginatedData.length > 0 ? (
                              paginatedData.map((row, i) => {
                                const totalPeruntukan =
                                  parseInt(row[5] || 0) + parseInt(row[6] || 0);
                                return (
                                  <tr
                                    key={i}
                                    className="hover:bg-slate-50/80 transition-colors text-center text-[10px] sm:text-[12px] font-bold text-slate-600"
                                  >
                                    <td className="px-1.5 sm:px-6 py-2 sm:py-5 text-slate-400 font-bold text-[9px] sm:text-[12px]">
                                      {i + 1}
                                    </td>
                                    <td className="px-1.5 sm:px-6 py-2 sm:py-5 font-bold text-slate-800 text-left whitespace-nowrap text-[9px] sm:text-[12px]">
                                      {row[0]}
                                    </td>
                                    <td className="px-1.5 sm:px-6 py-2 sm:py-5">
                                      <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-[9px] sm:text-[12px]">
                                        {row[1]}
                                      </span>
                                    </td>
                                    <td className="px-1.5 sm:px-6 py-2 sm:py-5 text-[9px] sm:text-[12px]">
                                      {formatCurrency(row[5])}
                                    </td>
                                    <td className="px-1.5 sm:px-6 py-2 sm:py-5 text-[9px] sm:text-[12px]">
                                      {formatCurrency(row[6])}
                                    </td>
                                    <td className="px-1.5 sm:px-6 py-2 sm:py-5 text-emerald-600 font-bold text-[9px] sm:text-[12px]">
                                      {formatCurrency(
                                        row[7] || totalPeruntukan,
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-8 sm:py-16 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px] sm:text-xs"
                                >
                                  Data Kosong
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 sm:mx-4 max-h-[90vh] sm:max-h-auto overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 p-3 sm:p-6 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100 flex-shrink-0">
                    <FaEdit className="text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate">
                      Koreksi: {editingRow?.[0]}
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-medium text-slate-400 uppercase tracking-wider sm:tracking-widest">
                      {selectedMonth} {selectedYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 transition-all flex-shrink-0"
                >
                  <FaTimes className="text-xs sm:text-sm" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-3 sm:p-8 space-y-3 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {[
                    { label: "Total Anggota", key: "totalAnggota" },
                    { label: "Tambahan Cabang", key: "tambahanCabang" },
                    { label: "Potongan Bank", key: "potonganBank" },
                    { label: "Setoran Tunai", key: "setoranTunai" },
                    { label: "Pembayaran", key: "pembayaran" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest px-1">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        value={editForm[field.key]}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            [field.key]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-700 transition-all shadow-inner text-sm sm:text-base"
                      />
                    </div>
                  ))}
                </div>

                {/* Preview Selisih */}
                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest">
                      Preview Pembayaran
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600">
                      {formatCurrency(editForm.pembayaran || (editForm.potonganBank + editForm.setoranTunai))}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest px-1">
                    Keterangan / Alasan Koreksi
                  </label>
                  <textarea
                    value={editForm.keterangan}
                    onChange={(e) =>
                      setEditForm({ ...editForm, keterangan: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-700 transition-all shadow-inner text-xs resize-none"
                    placeholder="Contoh: Penyesuaian jumlah anggota manual..."
                  />
                </div>

                <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4 sticky bottom-0 bg-white pb-1">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-all active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IuranPgriSection;
