# Panduan Implementasi Kolom Realisasi dari KasSanduka

## 📋 Ringkasan

Implementasi mengambil data PEMASUKAN dari `getTableKasSanduka`, mengekstrak cabang dari keterangan, dan mengelompokkan nominal per cabang untuk mengisi kolom **Realisasi Nominal** di halaman Target & Realisasi.

---

## 🔧 Fungsi-Fungsi yang Ditambahkan

### 1. `extractCabangFromKeterangan(keterangan)`

**Lokasi:** `app/_utils/GlobalApi.jsx`

Mengekstrak nama cabang dari field keterangan menggunakan regex.

```javascript
// Helper untuk ekstrak cabang dari keterangan
const extractCabangFromKeterangan = (keterangan) => {
  if (!keterangan || typeof keterangan !== "string") return null;

  // Cari pattern "Cabang [NAMA]"
  const match = keterangan.match(/Cabang\s+([^(]+)/i);
  if (match && match[1]) {
    return match[1].trim().toUpperCase();
  }

  return null;
};
```

**Contoh:**

```javascript
// Input
"Pemasukan Sanduka Sumbangan Anggota Cabang PAKIS AJI (Transfer) untuk Maret 2026";

// Output
"PAKIS AJI";
```

---

### 2. `getRealisasiFromKasSanduka(bulan, tahun)`

**Lokasi:** `app/_utils/GlobalApi.jsx`

Fungsi utama yang mengambil data dari KasSanduka, filter PEMASUKAN, dan group per cabang.

```javascript
const getRealisasiFromKasSanduka = async (bulan, tahun) => {
  try {
    const res = await getTableKasSanduka(bulan, tahun);
    const dataKasSanduka = Array.isArray(res) ? res : res?.data || [];

    // Filter hanya PEMASUKAN
    const pemasukanData = dataKasSanduka.filter(
      (item) => item.jenis === "PEMASUKAN",
    );

    // Group dan total per cabang
    const grouped = {};

    pemasukanData.forEach((item) => {
      const cabang = extractCabangFromKeterangan(item.keterangan);

      if (cabang) {
        if (!grouped[cabang]) {
          grouped[cabang] = {
            totalNominal: 0,
            jumlahTransaksi: 0,
          };
        }

        grouped[cabang].totalNominal += item.debet || 0;
        grouped[cabang].jumlahTransaksi += 1;
      }
    });

    return grouped;
  } catch (error) {
    console.error("Error fetching realisasi from kas sanduka:", error);
    throw error;
  }
};
```

**Parameters:**
| Param | Type | Deskripsi |
|-------|------|-----------|
| `bulan` | string | Format "01" - "12" |
| `tahun` | number | Tahun 4 digit (2026) |

**Returns:**
Object dengan struktur:

```javascript
{
  "CABANG_NAME": {
    totalNominal: 1500000,      // Total nominal PEMASUKAN
    jumlahTransaksi: 3          // Jumlah transaksi
  },
  "CABANG_LAIN": {
    totalNominal: 2000000,
    jumlahTransaksi: 5
  }
}
```

---

## 🔄 Perubahan di TargetRealisasi.jsx

### Fungsi Baru: `fetchRealisasiFromKasSanduka()`

```javascript
const fetchRealisasiFromKasSanduka = async () => {
  try {
    const bulanAngka = monthMap[selectedBulan];

    // Ambil data dari KasSanduka dengan filter PEMASUKAN per cabang
    const realisasiData = await GlobalApi.getRealisasiFromKasSanduka(
      bulanAngka,
      selectedYear,
    );

    return realisasiData;
  } catch (error) {
    console.error("Error fetching realisasi from kas sanduka:", error);
    return {};
  }
};
```

### Update `fetchData()` - Promise.all

**Sebelum:**

```javascript
const [resTargetRealisasi, balancingMap] = await Promise.all([
  GlobalApi.getTableTargetRealisasi(...),
  fetchTargetFromBalancing(),
]);
```

**Sesudah:**

```javascript
const [resTargetRealisasi, balancingMap, realisasiMap] = await Promise.all([
  GlobalApi.getTableTargetRealisasi(...),
  fetchTargetFromBalancing(),
  fetchRealisasiFromKasSanduka(),  // ← BARU
]);
```

### Update Mapping Data

**Sebelum:**

```javascript
const result = {
  ...item,
  selisih: (bal.totalIuran || 0) - (item.realisasi || 0),
};
```

**Sesudah:**

```javascript
// Ambil realisasi dari KasSanduka
const realisasiNominal = realisasiMap[key]?.totalNominal || item.realisasi || 0;

const result = {
  ...item,
  jumlahAnggota: bal.jumlahAnggota,
  target: bal.totalIuran,
  realisasi: realisasiNominal, // ← DIUPDATE
  selisih: (bal.totalIuran || 0) - realisasiNominal,
};
```

---

## 📊 Data Flow Diagram

```
Halaman Target & Realisasi
        ↓
    fetchData()
        ↓
Promise.all 3 request parallel:
    ├─ getTableTargetRealisasi() → resTargetRealisasi
    ├─ fetchTargetFromBalancing() → balancingMap
    └─ fetchRealisasiFromKasSanduka() → realisasiMap
            ↓
        getRealisasiFromKasSanduka(bulan, tahun)
            ↓
        getTableKasSanduka(bulan, tahun)
            ↓
        /api/rekap-transaksi-sanduka?bulan=XX&tahun=YYYY
            ↓
        Filter: jenis === "PEMASUKAN"
            ↓
        Extract cabang dari keterangan
            ↓
        Group & total per cabang
            ↓
        Return: {"CABANG": {totalNominal, jumlahTransaksi}}
            ↓
        Map ke data final dengan realisasi
            ↓
        Display di tabel + Export Excel
```

---

## 🧪 Contoh Implementasi Lengkap

### Data dari API (getTableKasSanduka)

```javascript
[
  {
    id: 1,
    jenis: "PEMASUKAN",
    keterangan:
      "Pemasukan Sanduka Sumbangan Anggota Cabang PAKIS AJI (Transfer)",
    debet: 500000,
    kredit: 0,
    tanggalTransaksi: [2026, 3, 15],
  },
  {
    id: 2,
    jenis: "PEMASUKAN",
    keterangan:
      "Pemasukan Sanduka Sumbangan Anggota Cabang PAKIS AJI (Transfer)",
    debet: 300000,
    kredit: 0,
    tanggalTransaksi: [2026, 3, 20],
  },
  {
    id: 3,
    jenis: "PEMASUKAN",
    keterangan:
      "Pemasukan Sanduka Sumbangan Anggota Cabang MEDAN AREA (Transfer)",
    debet: 750000,
    kredit: 0,
    tanggalTransaksi: [2026, 3, 18],
  },
  {
    id: 4,
    jenis: "PENGELUARAN", // ← Akan di-skip
    keterangan: "Pengeluaran Sanduka ...",
    debet: 0,
    kredit: 100000,
    tanggalTransaksi: [2026, 3, 25],
  },
];
```

### Proses Ekstrak Cabang

```javascript
// Item 1 & 2
"Pemasukan Sanduka Sumbangan Anggota Cabang PAKIS AJI (Transfer)"
                                         ↓
                                    PAKIS AJI

// Item 3
"Pemasukan Sanduka Sumbangan Anggota Cabang MEDAN AREA (Transfer)"
                                         ↓
                                    MEDAN AREA

// Item 4 (jenis PENGELUARAN)
                                    ← SKIP
```

### Output dari getRealisasiFromKasSanduka

```javascript
{
  "PAKIS AJI": {
    totalNominal: 800000,           // 500000 + 300000
    jumlahTransaksi: 2
  },
  "MEDAN AREA": {
    totalNominal: 750000,           // 750000
    jumlahTransaksi: 1
  }
}
```

### Final Data di Tabel

```javascript
[
  {
    cabang: "Pakis Aji",
    jumlahAnggota: 45,
    target: 1000000,
    realisasi: 800000, // ← Dari getRealisasiFromKasSanduka
    selisih: 200000,
  },
  {
    cabang: "Medan Area",
    jumlahAnggota: 32,
    target: 900000,
    realisasi: 750000, // ← Dari getRealisasiFromKasSanduka
    selisih: 150000,
  },
];
```

---

## 📝 Export ke Excel

Data realisasi akan otomatis terupdate di export Excel:

```
No | Cabang      | Target Anggota | Target Nominal | Realisasi Anggota | Realisasi Nominal | Selisih
1  | Pakis Aji   | 45             | 1.000.000      | 45                | 800.000           | 200.000
2  | Medan Area  | 32             | 900.000        | 32                | 750.000           | 150.000
```

---

## ⚠️ Edge Cases & Fallback

1. **Keterangan tidak mengandung "Cabang":**
   - Data tersebut akan di-skip (tidak ditambahkan ke grouped)
   - Cabang extraction return `null`

2. **Data KasSanduka kosong:**
   - `getRealisasiFromKasSanduka` return `{}`
   - Fallback ke `item.realisasi || 0` (data lama)

3. **Format bulan tidak sesuai:**
   - Harus string "01"-"12"
   - Query parameter harus `?bulan=03&tahun=2026`

---

## 🔍 Testing

### Test 1: Ekstrak Cabang Berhasil

```javascript
// Buka DevTools Console di halaman Target & Realisasi
const test = GlobalApi.extractCabangFromKeterangan(
  "Pemasukan Sanduka Sumbangan Anggota Cabang YOGYAKARTA (Transfer)",
);
console.log(test); // Output: "YOGYAKARTA"
```

### Test 2: Ambil Realisasi per Cabang

```javascript
const result = await GlobalApi.getRealisasiFromKasSanduka("03", 2026);
console.log(result);
// Output: {"PAKIS AJI": {totalNominal: 800000, ...}, ...}
```

### Test 3: Verifikasi di Tabel

- Pilih bulan & tahun
- Lihat kolom "Realisasi Nominal" terupdate dengan nilai dari KasSanduka
- Kolom "Selisih" akan terupdate otomatis

---

## 📱 Files Modified

1. **app/\_utils/GlobalApi.jsx**
   - Tambah: `extractCabangFromKeterangan()`
   - Tambah: `getRealisasiFromKasSanduka()`
   - Update export object

2. **app/(auth)/keuangan-new/laporan/sections/TargetRealisasi.jsx**
   - Tambah: `fetchRealisasiFromKasSanduka()`
   - Update: `fetchData()` function
   - Update: Data mapping logic

---

## 🚀 Deployment Notes

- Tidak ada perubahan database
- Tidak ada perubahan API
- Pure frontend logic
- Safe to deploy langsung
- Cek console error jika ada issue

---

## 📞 Support

Jika ada issue:

1. Cek format data di Network tab (query params)
2. Lihat Console log error message
3. Verify data di API response `getTableKasSanduka`
4. Check regex pattern untuk ekstrak cabang
