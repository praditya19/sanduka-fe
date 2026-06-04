# Dokumentasi: Integrasi Button Delete Balancing

## Overview

Fitur delete Balancing memungkinkan user (SUPERADMIN) untuk menghapus seluruh data Balancing untuk bulan tagihan tertentu.

---

## Komponen-Komponen yang Terlibat

### 1. **GlobalApi** (`app/_utils/GlobalApi.jsx`)

Fungsi yang digunakan:

```javascript
const deleteBalancing = (tagihanUntukBulan) => {
  return axiosClient.delete(
    `/api/target-iuran-anggota/by-bulan?tagihanUntukBulan=${tagihanUntukBulan}`,
  );
};
```

**Parameter yang Diperlukan:**
| Parameter | Tipe | Contoh | Keterangan |
|-----------|------|--------|-----------|
| `tagihanUntukBulan` | String (YYYY-MM-DD) | `2024-06-15` | Format date untuk bulan tagihan yang akan dihapus |

**Endpoint:**

- `DELETE /api/target-iuran-anggota/by-bulan?tagihanUntukBulan={tagihanUntukBulan}`

**Respons:** Response data dari server

---

## 🏗️ Arsitektur Komponen

```
Page.jsx (Main)
├── State:
│   ├── showDeleteBalancing
│   ├── resetUntukBulan
│   ├── loader
│   └── progress
├── Handler: handleDelete()
│   └── GlobalApi.deleteBalancing(tagihanUntukBulan)
├── Component: BalancingHeaderActions
│   └── Button: "Delete Balancing" → onClick={() => setShowDeleteBalancing(true)}
└── Component: DeleteBalancingModal
    ├── Date Input
    ├── Cancel Button
    └── Submit Button → handleDelete()
```

---

## 🔄 Flow Proses

```
┌─────────────────────────────────────────────┐
│  User Click "Delete Balancing" Button       │
│  (di BalancingHeaderActions, SUPERADMIN)    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  setShowDeleteBalancing(true)               │
│  → Modal tampil dengan date input           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  User Pilih Bulan Tagihan                   │
│  yang akan di-delete                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  User Click "Submit" Button                 │
│  → handleDelete() dipanggil                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Validasi: Apakah date sudah dipilih?      │
│  ❌ Jika tidak → Alert "Pilih bulan!"      │
│  ✅ Jika ya → Lanjut                       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  GlobalApi.deleteBalancing()                │
│  DELETE /api/target-iuran-anggota/by-bulan  │
│  Parameter: tagihanUntukBulan (YYYY-MM-DD) │
│  With Progress Tracking                     │
└──────────────┬──────────────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │             │
    ✅ Success    ❌ Error
        │             │
        ▼             ▼
    Success       Error
    Notification  Notification
    │             │
    └──────┬──────┘
           ▼
    Close Modal
    Reset State
    Refresh Data
```

---

## 📂 Lokasi File Penting

| Komponen      | File                                                                                                                                                     | Baris     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| API Function  | [app/\_utils/GlobalApi.jsx](app/_utils/GlobalApi.jsx#L1390)                                                                                              | 1390-1402 |
| Handler       | [app/(auth)/transaksi-bank/page.jsx](<app/(auth)/transaksi-bank/page.jsx#L256>)                                                                          | 256-292   |
| Modal UI      | [app/(auth)/transaksi-bank/components/DeleteBalancingModal.jsx](<app/(auth)/transaksi-bank/components/DeleteBalancingModal.jsx>)                         | -         |
| Header Button | [app/(auth)/transaksi-bank/components/balancing/BalancingHeaderActions.jsx](<app/(auth)/transaksi-bank/components/balancing/BalancingHeaderActions.jsx>) | ~145      |
| Main Page     | [app/(auth)/transaksi-bank/page.jsx](<app/(auth)/transaksi-bank/page.jsx>)                                                                               | -         |

---

## 2️⃣ Modal Component: DeleteBalancingModal

Lokasi: `app/(auth)/transaksi-bank/components/DeleteBalancingModal.jsx`

**Props yang Diterima:**

```javascript
{
  showDeleteBalancing,           // boolean: kontrol visibilitas modal
  setShowDeleteBalancing,        // function: tutup modal
  handleDelete,                  // function: handler submit form
  resetUntukBulan,               // string: nilai date input
  setResetUntukBulan,            // function: set date value
  loader,                        // boolean: state loading
  progress,                      // number: progress % (0-100)
}
```

**UI Elements:**

- **Date Input:** Untuk memilih bulan/tanggal yang akan dihapus
- **Cancel Button:** Tutup modal tanpa aksi
- **Submit Button:** Jalankan delete action
  - Normal state: "Submit"
  - Loading state: "Deleting... {progress}%"

**Styling:**

- Modal dengan background overlay semi-transparan
- Close button di top-right
- Cancel button (abu-abu) dan Submit button (hijau)

---

## 3️⃣ Handler: handleDelete()

Lokasi: `app/(auth)/transaksi-bank/page.jsx` (line 256-292)

```javascript
const handleDelete = async (e) => {
  e.preventDefault();

  // 1. Validasi
  if (!resetUntukBulan) {
    alert("Pilih bulan terlebih dahulu!");
    return;
  }

  try {
    // 2. Set loading state
    setLoader(true);
    setProgress(0);

    // 3. Trim date value
    const tagihan = resetUntukBulan.trim();

    // 4. Call API dengan progress tracking
    await GlobalApi.deleteBalancing(tagihan, {
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percentCompleted);
        }
      },
    });

    // 5. Success handling
    setNotification({
      type: "success",
      message: "Data berhasil dihapus!",
    });
    setShowDeleteBalancing(false);
    setResetUntukBulan("");

    // 6. Refresh data
    await getBalancingdata();
  } catch (err) {
    // 7. Error handling
    console.error("Gagal menghapus data:", err);
    setNotification({
      type: "error",
      message: "Gagal hapus data.",
    });
  } finally {
    // 8. Reset loading state
    setLoader(false);
    setProgress(0);
  }
};
```

**Flow Penjelasan:**

1. Prevent default form submission
2. Validasi: date harus dipilih
3. Set loading state & progress ke 0
4. Trim whitespace dari date
5. Call GlobalApi dengan progress callback
6. Jika success: show notification + close modal + refresh data
7. Jika error: show error notification
8. Always reset loader state

---

## 4️⃣ Header Button: BalancingHeaderActions

Lokasi: `app/(auth)/transaksi-bank/components/balancing/BalancingHeaderActions.jsx` (line ~105-150)

```javascript
{
  /* SUPERADMIN ACTION */
}
{
  role === "SUPERADMIN" && (
    <div className="flex gap-2 ml-auto">
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
        onClick={onDeleteBalancing}
      >
        Delete Balancing
      </button>

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

**Fitur:**

- Button "Delete Balancing" dengan warna merah (danger indicator)
- Button "Import Balancing" dengan warna teal
- Hanya muncul untuk role `SUPERADMIN`
- onClick → `setShowDeleteBalancing(true)`

---

## 5️⃣ Main Page Integration

Lokasi: `app/(auth)/transaksi-bank/page.jsx`

**State Definition:**

```javascript
const [showDeleteBalancing, setShowDeleteBalancing] = useState(false);
const [resetUntukBulan, setResetUntukBulan] = useState("");
const [loader, setLoader] = useState(false);
const [progress, setProgress] = useState(0);
```

**Modal Rendering:**

```javascript
<DeleteBalancingModal
  showDeleteBalancing={showDeleteBalancing}
  setShowDeleteBalancing={setShowDeleteBalancing}
  handleDelete={handleDelete}
  resetUntukBulan={resetUntukBulan}
  setResetUntukBulan={setResetUntukBulan}
  loader={loader}
  progress={progress}
/>
```

**Header Button Integration:**

```javascript
<BalancingHeaderActions
  isLoading={isLoading}
  onExport={() => {...}}
  onExportPDF={handleExportPDF}
  role={sessionStorage.getItem("role")}
  onDeleteBalancing={() => setShowDeleteBalancing(true)}
  onImportBalancing={() => setShowImportBalancing(true)}
/>
```

---

## 📋 State Management

| State                 | Tipe    | Awal    | Fungsi                         |
| --------------------- | ------- | ------- | ------------------------------ |
| `showDeleteBalancing` | boolean | `false` | Kontrol modal visibility       |
| `resetUntukBulan`     | string  | `""`    | Nilai date yang dipilih user   |
| `loader`              | boolean | `false` | Loading indicator saat request |
| `progress`            | number  | `0`     | Progress percentage 0-100      |

---

## ⚠️ Validasi & Error Handling

**Validasi yang Dilakukan:**

1. **Date Wajib Diisi**

   ```javascript
   if (!resetUntukBulan) {
     alert("Pilih bulan terlebih dahulu!");
     return;
   }
   ```

2. **Server Error Handling**
   ```javascript
   catch (err) {
     console.error("Gagal menghapus data:", err);
     setNotification({
       type: "error",
       message: "Gagal hapus data."
     });
   }
   ```

---

## 🔐 Akses Kontrol

Button "Delete Balancing" hanya muncul untuk:

- **Role**: `SUPERADMIN`
- **Kondisi**: `role === "SUPERADMIN"`
- **Source**: `sessionStorage.getItem("role")`

```javascript
{
  role === "SUPERADMIN" && (
    <button onClick={onDeleteBalancing}>Delete Balancing</button>
  );
}
```

---

## 📊 Progress Tracking

Progress diupdate saat request berlangsung:

```javascript
await GlobalApi.deleteBalancing(tagihan, {
  onDownloadProgress: (progressEvent) => {
    if (progressEvent.total) {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      setProgress(percentCompleted);
    }
  },
});
```

Button akan menampilkan:

- **Normal**: "Submit"
- **Loading**: "Deleting... {progress}%"

---

## ✨ Fitur-Fitur

| Fitur                | Status | Detail                             |
| -------------------- | ------ | ---------------------------------- |
| Date Selection       | ✅     | Input date HTML format YYYY-MM-DD  |
| Validation           | ✅     | Date wajib diisi sebelum submit    |
| Loading State        | ✅     | Button menampilkan progress        |
| Progress Tracking    | ✅     | Real-time progress update          |
| Success Notification | ✅     | Notification popup hijau           |
| Error Handling       | ✅     | Notification popup merah           |
| Auto-Refresh         | ✅     | Data refresh setelah delete        |
| Role-Based Access    | ✅     | Hanya SUPERADMIN dapat delete      |
| Modal Auto-Close     | ✅     | Tutup otomatis after success       |
| State Reset          | ✅     | Reset date & loader setelah action |

---

## 🧪 Testing Scenarios

```javascript
// Scenario 1: Normal Delete
✅ Select date → Click Submit → Success → Data refresh

// Scenario 2: Missing Date
❌ Skip date → Click Submit → Alert "Pilih bulan terlebih dahulu!"

// Scenario 3: Server Error
❌ Delete dengan error → Show error notification
❌ Data tidak dihapus

// Scenario 4: Cancel Action
❌ Click Cancel → Modal close → No changes

// Scenario 5: Progress Tracking
✅ During delete → Button shows "Deleting... X%"
✅ After complete → Button back to "Submit"
```

---

## 📌 Perbedaan dengan Import Balancing

| Aspek        | Delete Balancing         | Import Balancing           |
| ------------ | ------------------------ | -------------------------- |
| Fungsi       | Hapus data               | Upload data                |
| Parameter    | Date (YYYY-MM-DD)        | File + Date                |
| Input        | 1 date picker            | 1 file + 1 date            |
| Endpoint     | DELETE /api/.../by-bulan | POST /api/.../upload-excel |
| Modal        | DeleteBalancingModal     | ImportBalancingModal       |
| Button Color | Merah (danger)           | Teal (primary)             |
| Konfirmasi   | Alert dialog             | Form validation            |

---

## 🎓 Integrasi pada Page Baru

Jika ingin menambahkan delete balancing di page baru:

```javascript
// 1. Import API
import GlobalApi from "@/app/_utils/GlobalApi";

// 2. State
const [showDeleteBalancing, setShowDeleteBalancing] = useState(false);
const [resetUntukBulan, setResetUntukBulan] = useState("");
const [loader, setLoader] = useState(false);
const [progress, setProgress] = useState(0);

// 3. Handler
const handleDelete = async (e) => {
  e.preventDefault();
  if (!resetUntukBulan) {
    alert("Pilih bulan terlebih dahulu!");
    return;
  }

  try {
    setLoader(true);
    setProgress(0);

    await GlobalApi.deleteBalancing(resetUntukBulan.trim());

    // Success action
    setShowDeleteBalancing(false);
    setResetUntukBulan("");
    // Refresh data jika diperlukan
  } catch (err) {
    console.error(err);
  } finally {
    setLoader(false);
    setProgress(0);
  }
};

// 4. Import Modal
import DeleteBalancingModal from "@/app/(auth)/transaksi-bank/components/DeleteBalancingModal";

// 5. Render Modal
<DeleteBalancingModal
  showDeleteBalancing={showDeleteBalancing}
  setShowDeleteBalancing={setShowDeleteBalancing}
  handleDelete={handleDelete}
  resetUntukBulan={resetUntukBulan}
  setResetUntukBulan={setResetUntukBulan}
  loader={loader}
  progress={progress}
/>;
```

---

## 📌 Notes

1. **Date Format**: HTML date input otomatis format YYYY-MM-DD
2. **Scope**: Delete semua data Balancing untuk bulan tertentu
3. **Kecepatan**: Tergantung jumlah data yang dihapus di server
4. **Notification**: Auto-dismiss setelah 3 detik
5. **Role Check**: Dilakukan di component level, bukan di handler
6. **Refresh Data**: `getBalancingdata()` dipanggil untuk reload tabel

---

## Checklist Implementasi ✅

- ✅ GlobalApi.deleteBalancing sudah tersedia
- ✅ handleDelete() sudah implement di page.jsx
- ✅ DeleteBalancingModal component sudah dibuat
- ✅ BalancingHeaderActions button sudah ada
- ✅ Page.jsx sudah integrate semua komponen
- ✅ State management sudah lengkap
- ✅ Validasi input sudah ada
- ✅ Error handling sudah ada
- ✅ Loading state sudah ada
- ✅ Success notification sudah ada
- ✅ Data refresh after delete sudah ada
- ✅ Role-based access control sudah ada

---

## 🔍 Debugging Tips

Jika delete tidak berfungsi:

1. **Check Role**

   ```javascript
   console.log(sessionStorage.getItem("role")); // Harus "SUPERADMIN"
   ```

2. **Check Date Value**

   ```javascript
   console.log("Date:", resetUntukBulan); // Harus format YYYY-MM-DD
   ```

3. **Check API Response**

   ```javascript
   console.log("Response:", await GlobalApi.deleteBalancing(date));
   ```

4. **Check Loading State**

   ```javascript
   console.log("Loading:", loader); // Harus true saat request
   ```

5. **Check Notification**
   ```javascript
   console.log("Notification:", notification);
   ```
