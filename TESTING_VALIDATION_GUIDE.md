# TESTING & VALIDATION GUIDE

## ✅ Pre-Deployment Checklist

### Code Review

- [ ] `extractCabangFromKeterangan()` correctly parses keterangan field
- [ ] `getRealisasiFromKasSanduka()` filters only PEMASUKAN items
- [ ] No console errors when loading TargetRealisasi page
- [ ] Promise.all correctly receives 3 responses

### Data Validation

- [ ] Realisasi nominal matches KasSanduka data
- [ ] Grouping per cabang is accurate
- [ ] Selisih calculation correct: `target - realisasi`
- [ ] Export Excel shows updated realisasi values

### Browser Testing

- [ ] Select different month/year combinations
- [ ] Verify realisasi updates correctly
- [ ] Check with empty months (should show 0 or null)
- [ ] Test with multiple cabang entries

---

## 🧪 Manual Testing Steps

### Step 1: Inspect KasSanduka Data

```javascript
// In DevTools Console
const data = await GlobalApi.getTableKasSanduka("03", 2026);
console.table(data.filter((d) => d.jenis === "PEMASUKAN"));

// Expected columns: jenis, keterangan, debet, tanggalTransaksi
```

### Step 2: Test Cabang Extraction

```javascript
// In DevTools Console
const testCabang = GlobalApi.extractCabangFromKeterangan(
  "Pemasukan Sanduka Sumbangan Anggota Cabang JAKARTA UTARA (Transfer)",
);
console.log(testCabang); // Output: "JAKARTA UTARA"
```

### Step 3: Test Full Realisasi Function

```javascript
// In DevTools Console
const realisasi = await GlobalApi.getRealisasiFromKasSanduka("03", 2026);
console.table(realisasi);

// Expected structure:
// {
//   "JAKARTA UTARA": { totalNominal: 5000000, jumlahTransaksi: 10 },
//   "BANDUNG": { totalNominal: 3000000, jumlahTransaksi: 6 },
//   ...
// }
```

### Step 4: Navigate to TargetRealisasi Page

1. Go to: `/app/(auth)/keuangan-new/laporan`
2. Find "Target & Realisasi" section
3. Select Month: Maret, Year: 2026
4. Wait for data to load

### Step 5: Verify Display

- [ ] Realisasi Nominal column shows values from KasSanduka
- [ ] Values match sum of PEMASUKAN transactions
- [ ] Selisih (difference) recalculated correctly
- [ ] No error messages in console

### Step 6: Test Export Excel

```javascript
// On TargetRealisasi page
// Click "Export Excel" button
// Open exported file
// Verify "Realisasi Nominal" column has correct values
```

---

## 📊 Expected Output Examples

### Example 1: Single Cabang

```
Input KasSanduka (Maret 2026):
- PEMASUKAN, Cabang YOGYAKARTA, nominal 1.000.000
- PEMASUKAN, Cabang YOGYAKARTA, nominal 500.000

Output getRealisasiFromKasSanduka:
{
  "YOGYAKARTA": {
    totalNominal: 1500000,
    jumlahTransaksi: 2
  }
}

Display in TargetRealisasi:
Cabang: Yogyakarta
Target: 2.000.000
Realisasi: 1.500.000  ← From KasSanduka
Selisih: 500.000
```

### Example 2: Multiple Cabang

```
Input KasSanduka (Maret 2026):
- PEMASUKAN, Cabang JAKARTA PUSAT, 2.000.000
- PEMASUKAN, Cabang JAKARTA PUSAT, 1.500.000
- PEMASUKAN, Cabang JAKARTA TIMUR, 1.200.000
- PENGELUARAN, ... (skip)

Output getRealisasiFromKasSanduka:
{
  "JAKARTA PUSAT": {
    totalNominal: 3500000,
    jumlahTransaksi: 2
  },
  "JAKARTA TIMUR": {
    totalNominal: 1200000,
    jumlahTransaksi: 1
  }
}
```

### Example 3: Empty/No PEMASUKAN

```
Input KasSanduka (Mei 2026):
- PENGELUARAN, ... (only pengeluaran)

Output getRealisasiFromKasSanduka:
{}  // Empty object

Display in TargetRealisasi:
Realisasi: 0 (fallback to item.realisasi || 0)
```

### Example 4: Cabang Not Recognized

```
Input KasSanduka:
- PEMASUKAN, "Deposit tanpa keterangan cabang", 500.000

Result:
- extractCabangFromKeterangan returns null
- This transaction is skipped (not added to grouped)
```

---

## 🔍 Debugging Steps

### Issue: Realisasi Not Updating

1. Check if KasSanduka data exists for selected month

   ```javascript
   const data = await GlobalApi.getTableKasSanduka("03", 2026);
   console.log(data.length); // Should be > 0
   ```

2. Check if PEMASUKAN items exist

   ```javascript
   const pemasukan = data.filter((d) => d.jenis === "PEMASUKAN");
   console.log(pemasukan.length); // Should be > 0
   ```

3. Check cabang extraction
   ```javascript
   pemasukan.forEach((item) => {
     const cabang = GlobalApi.extractCabangFromKeterangan(item.keterangan);
     console.log(cabang); // Should not be null
   });
   ```

### Issue: Cabang Extraction Failing

- Verify keterangan field contains "Cabang" keyword (case-insensitive)
- Check format: "... Cabang [NAME] ..."
- Verify no extra spaces: "Cabang JAKARTA" (double space) might fail

### Issue: Slow Performance

- Check API response time for getTableKasSanduka
- Verify Promise.all isn't blocking other requests
- Check browser console for warnings

### Issue: Excel Export Wrong Values

1. Manually verify: `TargetRealisasi` > check `realisasi` field
2. Compare with KasSanduka data
3. Verify export formula is correct

---

## 🧮 Sample Calculation

### Scenario: Maret 2026

**KasSanduka Data:**
| ID | Jenis | Keterangan | Debet | Kredit |
|----|-------|-----------|-------|--------|
| 1 | PEMASUKAN | ...Cabang BANDUNG... | 2,000,000 | 0 |
| 2 | PEMASUKAN | ...Cabang BANDUNG... | 1,500,000 | 0 |
| 3 | PEMASUKAN | ...Cabang MEDAN... | 1,000,000 | 0 |
| 4 | PENGELUARAN | ... | 0 | 500,000 |

**Processing:**

Step 1 - Filter PEMASUKAN:

```
ID 1: Jenis=PEMASUKAN ✓
ID 2: Jenis=PEMASUKAN ✓
ID 3: Jenis=PEMASUKAN ✓
ID 4: Jenis=PENGELUARAN ✗
```

Step 2 - Extract Cabang:

```
ID 1: "...Cabang BANDUNG..." → "BANDUNG" ✓
ID 2: "...Cabang BANDUNG..." → "BANDUNG" ✓
ID 3: "...Cabang MEDAN..." → "MEDAN" ✓
```

Step 3 - Group & Sum:

```
BANDUNG: 2,000,000 + 1,500,000 = 3,500,000 (2 transaksi)
MEDAN: 1,000,000 = 1,000,000 (1 transaksi)
```

**Final Output:**

```javascript
{
  "BANDUNG": {
    totalNominal: 3500000,
    jumlahTransaksi: 2
  },
  "MEDAN": {
    totalNominal: 1000000,
    jumlahTransaksi: 1
  }
}
```

**Display in TargetRealisasi:**

| Cabang  | Target    | Realisasi | Selisih   |
| ------- | --------- | --------- | --------- |
| Bandung | 4,000,000 | 3,500,000 | 500,000   |
| Medan   | 2,000,000 | 1,000,000 | 1,000,000 |

---

## 🚨 Common Issues & Solutions

| Issue           | Cause                      | Solution                           |
| --------------- | -------------------------- | ---------------------------------- | --- | ----------- |
| Realisasi = 0   | No PEMASUKAN in KasSanduka | Check if data exists, may be valid |
| Cabang mismatch | Different case/formatting  | Update regex or data format        |
| Slow loading    | Multiple API calls         | Verify Promise.all working         |
| Export error    | Browser security           | Check file download permissions    |
| NaN value       | Null/undefined debet       | Validate data with `               |     | 0` fallback |

---

## ✨ Success Criteria

- ✅ Realisasi values auto-calculated from KasSanduka
- ✅ Data grouped correctly per cabang
- ✅ Selisih recalculated based on new realisasi
- ✅ Excel export shows updated realisasi
- ✅ No console errors
- ✅ Performance acceptable (< 2s load time)
- ✅ Fallback to 0 when no data available

---

## 📋 Validation Report Template

```
Date: ___________
Tester: ___________
Month/Year Tested: ___________

Data Verification:
[ ] KasSanduka has PEMASUKAN data
[ ] Cabang extracted correctly
[ ] Total nominal accurate
[ ] Multiple cabang handled

Display Verification:
[ ] Realisasi column shows values
[ ] Selisih calculated correctly
[ ] No errors in console
[ ] Page loads in < 2 seconds

Export Verification:
[ ] Excel generated successfully
[ ] Realisasi column in Excel correct
[ ] File can be opened

Browser Compatibility:
[ ] Chrome/Edge: __________
[ ] Firefox: __________
[ ] Safari: __________

Issues Found:
1. _____________________
2. _____________________

Status: [ ] PASS [ ] FAIL [ ] NEEDS FIX
```
