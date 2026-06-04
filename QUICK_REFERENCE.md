# 🚀 QUICK START REFERENCE

## 3 Fungsi Baru

### 1. Extract Cabang

```javascript
GlobalApi.extractCabangFromKeterangan(keterangan);
// Input: "Pemasukan Sanduka Sumbangan Anggota Cabang JAKARTA (Transfer)"
// Output: "JAKARTA"
```

### 2. Get Realisasi per Cabang

```javascript
const realisasi = await GlobalApi.getRealisasiFromKasSanduka(bulan, tahun);
// Input: ("03", 2026)
// Output: {"JAKARTA": {totalNominal: 3500000, jumlahTransaksi: 2}}
```

### 3. Fetch in TargetRealisasi

```javascript
const realisasiMap = await fetchRealisasiFromKasSanduka();
// Otomatis diintegrasikan di Promise.all
```

---

## Data Structure

**Input:** KasSanduka Array

```javascript
{
  jenis: "PEMASUKAN",
  keterangan: "Pemasukan Sanduka ... Cabang [NAME] ...",
  debet: 500000
}
```

**Output:** Realisasi Map

```javascript
{
  "[CABANG_NAME]": {
    totalNominal: 1500000,
    jumlahTransaksi: 3
  }
}
```

---

## Usage in Component

```javascript
// Already integrated in TargetRealisasi.jsx
// Just use realisasiMap in your data mapping:

const realisasiNominal = realisasiMap[key]?.totalNominal || item.realisasi || 0;
```

---

## Testing Commands (DevTools)

```javascript
// Test 1: Extract cabang
const test1 = GlobalApi.extractCabangFromKeterangan("...Cabang SURABAYA...");
console.log(test1); // "SURABAYA"

// Test 2: Get realisasi
const test2 = await GlobalApi.getRealisasiFromKasSanduka("03", 2026);
console.table(test2);

// Test 3: Check KasSanduka data
const test3 = await GlobalApi.getTableKasSanduka("03", 2026);
console.log(test3.filter((d) => d.jenis === "PEMASUKAN"));
```

---

## Key Points

- ✅ Bulan format: String "01"-"12" (bukan number)
- ✅ Filter: Hanya PEMASUKAN
- ✅ Group: Per cabang
- ✅ Field: Extract dari `keterangan`, sum `debet`
- ✅ Fallback: Ke `item.realisasi || 0` jika kosong

---

## Files Modified

- `app/_utils/GlobalApi.jsx` → +2 functions
- `app/(auth)/keuangan-new/laporan/sections/TargetRealisasi.jsx` → +1 function, 2 updates

---

## No Breaking Changes

- ✅ Backward compatible
- ✅ No database changes
- ✅ No API changes
- ✅ Safe to deploy
