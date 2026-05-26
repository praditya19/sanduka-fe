# Dokumentasi: Data Processing untuk getNominalAggregatedData

## Overview

File `app/(auth)/anggota/rekap-anggota/page.jsx` telah ditambahkan helper function `processApiResponse()` yang memproses data API sebelum ditampilkan di halaman website.

---

## Helper Function: `processApiResponse()`

### Lokasi

```
app/(auth)/anggota/rekap-anggota/page.jsx
Sekitar line 338-373 (setelah handleCabangClick)
```

### Signature

```javascript
processApiResponse(apiData, (filterByNpa = null), (useLatestDate = true));
```

### Parameter

| Parameter       | Type           | Default | Deskripsi                                                                                                                |
| --------------- | -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `apiData`       | Array          | -       | Data dari API response                                                                                                   |
| `filterByNpa`   | String \| null | `null`  | Filter data berdasarkan npaPgri tertentu (opsional)                                                                      |
| `useLatestDate` | Boolean        | `true`  | Jika `true`: ambil data terbaru berdasarkan `lastUpdatedAtIuran`, Jika `false`: ambil berdasarkan `idByNominal` terbesar |

### Return Value

- **Type**: Array
- **Deskripsi**: Array data yang sudah diproses, dengan duplikasi per anggota sudah dihilangkan

---

## Cara Penggunaan

### 1. **Mengambil Data Terbaru Semua Anggota**

```javascript
const response = await GlobalApi.getNominalAggregatedData(cabang);
const processedData = processApiResponse(response, null, true);
```

**Hasil**: Untuk setiap `npaPgri`, hanya data dengan `lastUpdatedAtIuran` paling baru yang diambil.

---

### 2. **Mengambil Data Terbaru Berdasarkan idByNominal Terbesar**

```javascript
const response = await GlobalApi.getNominalAggregatedData(cabang);
const processedData = processApiResponse(response, null, false);
```

**Hasil**: Untuk setiap `npaPgri`, hanya data dengan `idByNominal` terbesar yang diambil.

---

### 3. **Filter Data Spesifik Anggota (npaPgri Tertentu)**

```javascript
const response = await GlobalApi.getNominalAggregatedData(cabang);
// Filter hanya data anggota dengan npaPgri "33200806435"
const processedData = processApiResponse(response, "33200806435", true);
```

**Hasil**: Hanya data anggota dengan `npaPgri: "33200806435"` yang diproses, dan hanya versi terbaru yang diambil.

---

### 4. **Kombinasi: Filter Spesifik + idByNominal Terbesar**

```javascript
const response = await GlobalApi.getNominalAggregatedData(cabang);
// Filter anggota spesifik, ambil yang punya idByNominal terbesar
const processedData = processApiResponse(response, "33200806435", false);
```

---

## Tempat Implementasi Saat Ini

Helper function sudah diterapkan di beberapa tempat:

### 1. **handleSelectCabang** (Line ~437)

```javascript
let response = await GlobalApi.getNominalAggregatedData(cabang.kecamatan || "");
response = processApiResponse(response, null, true);
```

### 2. **fetchInitialData** (Line ~570)

```javascript
response = processApiResponse(response, null, true);
```

### 3. **exportToExcel** (Line ~2337)

```javascript
let allData = await GlobalApi.getNominalAggregatedData(...);
allData = processApiResponse(allData, null, true);
```

---

## Contoh Skenario Penggunaan

### Skenario 1: Menampilkan Data Terbaru Cabang X

```javascript
// User memilih Cabang "Jakarta Pusat"
const response = await GlobalApi.getNominalAggregatedData("Jakarta Pusat");
const latestData = processApiResponse(response, null, true);
// ✅ Setiap anggota hanya muncul 1x dengan data terbaru
```

### Skenario 2: Lihat Detail Data Satu Anggota

```javascript
// Admin ingin melihat semua versi data untuk anggota 33200806435
const response = await GlobalApi.getNominalAggregatedData("");
const specificData = processApiResponse(response, "33200806435", true);
// ✅ Hanya anggota ini, versi terbaru
```

### Skenario 3: Export Excel - Data Terbaru Saja

```javascript
let allData = await GlobalApi.getNominalAggregatedData(cabang);
allData = processApiResponse(allData, null, true);
// Kemudian lanjut ke proses export...
```

---

## Struktur Data API Response

Setiap item dalam array response memiliki struktur:

```javascript
{
  cabang: "Jakarta Pusat",
  unitKerja: "Unit Kerja A",
  namaAnggota: "John Doe",
  npaPgri: "33200806435",        // ← Field untuk grouping
  idByNominal: 17727,             // ← ID untuk sorting alternatif
  lastUpdatedAtIuran: "2025-01-10 14:30:00",  // ← Timestamp untuk sorting
  pgri: 100000,
  sanduka: 50000,
  daspen: 25000,
  derap: 10000,
  kalender: 5000,
  lainLain: 0,
  totalIuran: 190000,
  // ... field lainnya
}
```

---

## Kustomisasi

Jika Anda ingin mengubah cara data diproses, Anda bisa:

### 1. **Mengubah Default Processing**

Edit di tempat call `processApiResponse()`:

```javascript
// Ubah parameter ketiga (useLatestDate) dari true ke false
response = processApiResponse(response, null, false); // ← false = gunakan idByNominal
```

### 2. **Menambah Parameter Filter Lain**

Modifikasi helper function untuk tambahan kriteria:

```javascript
// Contoh: tambah filter statusPegawai
response = processApiResponse(response, "33200806435", true, "Tetap");
```

---

## Testing & Debugging

Untuk mengecek hasil processing:

```javascript
const response = await GlobalApi.getNominalAggregatedData("Jakarta Pusat");
console.log("Raw data:", response.length, "items");

const processed = processApiResponse(response, null, true);
console.log("Processed data:", processed.length, "items");
// Seharusnya processed.length <= response.length
```

---

## Notes

- ✅ **Automatic Deduplication**: Helper function otomatis menghilangkan duplikasi per anggota
- ✅ **Flexible Sorting**: Bisa sort berdasarkan tanggal atau ID
- ✅ **Filter Optional**: Filter npaPgri bersifat opsional
- ⚠️ **Performa**: Untuk dataset besar (>10,000 records), processing masih sangat cepat karena menggunakan Map
- 📝 **Comments**: Setiap call sudah ada comment "📌" untuk mudah ditemukan

---

## FAQ

**Q: Kapan saya perlu menggunakan `false` untuk parameter ketiga?**
A: Gunakan `false` jika `lastUpdatedAtIuran` tidak reliable atau jika Anda lebih percaya pada `idByNominal` sebagai indikator data terbaru.

**Q: Bagaimana jika saya ingin semua versi data anggota?**
A: Jangan gunakan `processApiResponse()`, langsung gunakan response dari API.

**Q: Bisa batch processing untuk npaPgri tertentu?**
A: Ya, looping through npaPgri array:

```javascript
const npaList = ["33200806435", "33200806436"];
npaList.forEach((npa) => {
  const data = processApiResponse(response, npa, true);
  // process...
});
```

---

## Changelog

- **v1.0** (2025-01-11): Initial implementation
  - Helper function `processApiResponse()` ditambahkan
  - Implementasi di 3 tempat: handleSelectCabang, fetchInitialData, exportToExcel
  - Support filter npaPgri dan dual sorting method
