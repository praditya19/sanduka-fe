# Dokumentasi: Integrasi Button Import Balancing

## Overview

Fitur import Balancing memungkinkan user (SUPERADMIN) untuk upload file Excel ke dalam sistem untuk di-import menjadi data Balancing Potongan.

---

## Komponen-Komponen yang Terlibat

### 1. **GlobalApi** (`app/_utils/GlobalApi.jsx`)

Fungsi yang digunakan:

```javascript
const importExcelTargetIuran = async (file, tagihanUntukBulan) => {
  // file: File object dari input element
  // tagihanUntukBulan: String format date (YYYY-MM-DD)
  // Endpoint: POST /api/target-iuran-anggota/upload-excel
};
```

**Parameter yang Diperlukan:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `file` | File | File Excel yang akan di-upload |
| `tagihanUntukBulan` | String | Tanggal dalam format YYYY-MM-DD untuk bulan tagihan |

**Respons:** `response.data` dari server

---

### 2. **Hook - useBalancing** (`app/(auth)/transaksi-bank/hook/useBalancing.js`)

**State Management:**

```javascript
const [fileImport, setFileImport] = useState(null);
const [tagihanUntukBulan, setTagihanUntukBulan] = useState("");
const [importLoader, setImportLoader] = useState(false);
const [importProgress, setImportProgress] = useState(0);
```

**Fungsi Handler:**

```javascript
const handleImportBalancing = async () => {
  if (!fileImport || !tagihanUntukBulan) {
    alert("File dan tanggal harus diisi");
    return;
  }

  try {
    setImportLoader(true);
    setImportProgress(0);

    // Memanggil GlobalApi dengan parameter yang benar
    await GlobalApi.importExcelTargetIuran(fileImport, tagihanUntukBulan);

    setNotification({ type: "success", message: "Import Berhasil!" });
    setShowImportBalancing(false);
    setFileImport(null);
    setTagihanUntukBulan("");

    // Refresh data setelah import berhasil
    await getBalancingdata();
  } catch (error) {
    console.error("Import gagal:", error);
    setNotification({
      type: "error",
      message: "Terjadi kesalahan saat import data.",
    });
  } finally {
    setImportLoader(false);
    setImportProgress(0);
  }
};
```

**Return Values dari Hook:**

```javascript
return {
  // ... state lainnya
  fileImport,
  setFileImport,
  tagihanUntukBulan,
  setTagihanUntukBulan,
  handleImportBalancing,
  importLoader,
  importProgress,
};
```

---

### 3. **Modal Component** (`app/(auth)/transaksi-bank/components/ImportBalancingModal.jsx`)

**Props yang Diterima:**

```javascript
{
  showImportBalancing,           // boolean: kontrol visibilitas modal
  setShowImportBalancing,        // function: tutup modal
  setFileImport,                 // function: set file
  tagihanUntukBulan,             // string: nilai tanggal
  setTagihanUntukBulan,          // function: set tanggal
  handleImportBalancing,         // function: handler submit
  loader,                        // boolean: state loading
  progress,                      // number: progress %
}
```

**UI Elements:**

- File Input: untuk memilih file Excel
- Date Input: untuk memilih bulan tagihan
- Buttons: Cancel dan Upload

---

### 4. **Header Actions** (`app/(auth)/transaksi-bank/components/balancing/BalancingHeaderActions.jsx`)

**Button Import Balancing:**

```javascript
{
  role === "SUPERADMIN" && (
    <div className="flex gap-2 ml-auto">
      <button
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 transition"
        onClick={onImportBalancing}
      >
        Import Balancing
      </button>
    </div>
  );
}
```

---

### 5. **Main Page** (`app/(auth)/transaksi-bank/page.jsx`)

**State & Hook Integration:**

```javascript
// State untuk modal
const [showImportBalancing, setShowImportBalancing] = useState(false);

// Hook useBalancing
const {
  setFileImport,
  tagihanUntukBulan,
  setTagihanUntukBulan,
  handleImportBalancing,
  importLoader,
  importProgress,
} = useBalancing({
  // ... props lainnya
  setShowImportBalancing,
  setNotification,
});
```

**Render Modal:**

```javascript
<ImportBalancingModal
  showImportBalancing={showImportBalancing}
  setShowImportBalancing={setShowImportBalancing}
  setFileImport={setFileImport}
  tagihanUntukBulan={tagihanUntukBulan}
  setTagihanUntukBulan={setTagihanUntukBulan}
  handleImportBalancing={handleImportBalancing}
  loader={importLoader}
  progress={importProgress}
/>
```

**Button Handler di Tab Balancing:**

```javascript
<BalancingHeaderActions
  // ... props lainnya
  role={sessionStorage.getItem("role")}
  onImportBalancing={() => setShowImportBalancing(true)}
/>
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────┐
│  User Click "Import Balancing" Button       │
│  (di BalancingHeaderActions)                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  setShowImportBalancing(true)               │
│  → Modal tampil                              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  User Input:                                │
│  - Pilih file Excel                         │
│  - Pilih tanggal tagihan                    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  User Click "Upload" Button                 │
│  → handleImportBalancing()                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  GlobalApi.importExcelTargetIuran()         │
│  POST /api/target-iuran-anggota/upload-excel│
│  Parameters:                                │
│  - file: File object                        │
│  - tagihanUntukBulan: YYYY-MM-DD           │
└──────────────┬──────────────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │             │
    ✅ Success    ❌ Error
        │             │
        ▼             ▼
    Refresh      Show Error
    Data         Notification
    │             │
    └──────┬──────┘
           ▼
    Close Modal
```

---

## Format File Excel yang Diterima

Endpoint `/api/target-iuran-anggota/upload-excel` menerima:

- **File Format:** `.xlsx` atau `.xls`
- **Parameter Form:**
  - `file` - File Excel
  - `tagihanUntukBulan` - Format: YYYY-MM-DD (contoh: 2024-06-15)

---

## Error Handling

Modal menampilkan validasi:

1. **File tidak dipilih:** Alert "File dan tanggal harus diisi"
2. **Tanggal tidak dipilih:** Alert "File dan tanggal harus diisi"
3. **Server Error:** Notification dengan pesan error dari server

---

## Status Indicator

- **Loading:** Button menampilkan "Processing... {progress}%"
- **Success:** Notification hijau "Import Berhasil!"
- **Error:** Notification merah dengan error message

---

## Persyaratan Akses

- Role: **SUPERADMIN** (hanya superadmin yang dapat melihat tombol import)
- Endpoint harus accessible dari server backend
- Session storage harus menyimpan role user

---

## Checklist Implementasi

- ✅ GlobalApi.importExcelTargetIuran sudah tersedia
- ✅ useBalancing hook sudah implement handleImportBalancing
- ✅ ImportBalancingModal component sudah dibuat
- ✅ BalancingHeaderActions button sudah ada
- ✅ Page.jsx sudah integrate semua komponen
- ✅ State management sudah lengkap
- ✅ Error handling sudah ada
- ✅ Loading state sudah ada
- ✅ Success notification sudah ada
- ✅ Data refresh after import sudah ada

---

## Testing Checklist

- [ ] Test upload file Excel valid
- [ ] Test upload tanpa file
- [ ] Test upload tanpa tanggal
- [ ] Test upload dengan tanggal invalid
- [ ] Test server error handling
- [ ] Test data refresh setelah upload
- [ ] Test notification appearance
- [ ] Test loading state
- [ ] Test role-based access (hanya SUPERADMIN)

---

## Notes

1. **Date Format:** Input date HTML akan otomatis format sebagai YYYY-MM-DD sesuai spesifikasi
2. **File Size:** Pastikan server memiliki limit size yang sesuai
3. **Progress:** `importProgress` saat ini set ke 0, bisa ditingkatkan dengan tracking dari server
4. **Refresh Data:** Setelah import, `getBalancingdata()` dipanggil untuk refresh data balancing table
5. **Modal Close:** Modal otomatis tertutup setelah import berhasil
