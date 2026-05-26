/**
 * CONTOH PENGGUNAAN: Helper Function processApiResponse()
 *
 * File: app/(auth)/anggota/rekap-anggota/page.jsx
 * Helper Function: processApiResponse(apiData, filterByNpa = null, useLatestDate = true)
 */

// ============================================
// CONTOH 1: Mengambil Data Terbaru Semua Anggota
// ============================================
async function example1_GetLatestDataAllMembers() {
  const response = await GlobalApi.getNominalAggregatedData("Jakarta Pusat");

  // Proses untuk mendapatkan data TERBARU per anggota (berdasarkan lastUpdatedAtIuran)
  const processedData = processApiResponse(response, null, true);

  console.log("Raw response:", response.length, "records");
  console.log("Processed data:", processedData.length, "unique members");
  // Output contoh:
  // Raw response: 150 records
  // Processed data: 100 unique members (50 duplikasi dihilangkan)
}

// ============================================
// CONTOH 2: Ambil Data Berdasarkan idByNominal Terbesar
// ============================================
async function example2_GetDataByHighestId() {
  const response = await GlobalApi.getNominalAggregatedData("");

  // Proses untuk mendapatkan data dengan idByNominal terbesar per anggota
  const processedData = processApiResponse(response, null, false);

  // useLatestDate = false berarti:
  // Jika ada 3 record untuk anggota "John":
  // - idByNominal: 17727, lastUpdatedAtIuran: 2024-12-20
  // - idByNominal: 12390, lastUpdatedAtIuran: 2025-01-10 (terbaru)
  // - idByNominal: 1,    lastUpdatedAtIuran: 2024-12-01
  // Akan diambil record dengan idByNominal: 17727 (tertinggi)
}

// ============================================
// CONTOH 3: Filter Data Spesifik Anggota
// ============================================
async function example3_FilterSpecificMember() {
  const response = await GlobalApi.getNominalAggregatedData("");

  // Filter hanya data anggota dengan npaPgri tertentu
  const specificMemberData = processApiResponse(
    response,
    "33200806435", // ← npaPgri spesifik
    true // ← ambil versi terbaru
  );

  console.log("Data for NPA 33200806435:", specificMemberData);
  // Output: array dengan 1-N records untuk anggota tersebut (biasanya 1 jika sudah diproses)

  // Contoh output:
  /*
  [
    {
      namaAnggota: "John Doe",
      npaPgri: "33200806435",
      idByNominal: 17727,
      lastUpdatedAtIuran: "2025-01-10 14:30:00",
      pgri: 100000,
      sanduka: 50000,
      daspen: 25000,
      totalIuran: 190000,
      ...
    }
  ]
  */
}

// ============================================
// CONTOH 4: Kombinasi Filter + Sorting
// ============================================
async function example4_FilterAndSort() {
  const response = await GlobalApi.getNominalAggregatedData("Jakarta Pusat");

  // Filter spesifik anggota + ambil berdasarkan idByNominal terbesar
  const data = processApiResponse(response, "33200806435", false);

  // Hasil: hanya 1 anggota, 1 record (versi dengan idByNominal tertinggi)
}

// ============================================
// CONTOH 5: Batch Processing Multiple NPAs
// ============================================
async function example5_BatchProcessing() {
  const response = await GlobalApi.getNominalAggregatedData("");

  const npaList = ["33200806435", "33200806436", "33200806437"];
  const allProcessedData = [];

  npaList.forEach((npa) => {
    const data = processApiResponse(response, npa, true);
    allProcessedData.push(...data); // Combine all
  });

  console.log("Total members processed:", allProcessedData.length);
  // Output: 3 unique members
}

// ============================================
// CONTOH 6: Dalam React Component (Real Usage)
// ============================================
function RekapAnggotaExample() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSelectCabang = async (cabang) => {
    setLoading(true);
    try {
      let response = await GlobalApi.getNominalAggregatedData(cabang.kecamatan);

      // 📌 PROCESS DATA SEBELUM DITAMPILKAN
      response = processApiResponse(response, null, true);
      // Sekarang response sudah berisi data unik terbaru per anggota

      setData(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleSelectCabang({ kecamatan: "Jakarta Pusat" })}
      >
        Load Data
      </button>
      {loading && <p>Loading...</p>}
      <ul>
        {data.map((item) => (
          <li key={item.npaPgri}>
            {item.namaAnggota} - {item.npaPgri}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// CONTOH 7: Debug/Logging
// ============================================
async function example7_DebugProcessing() {
  const response = await GlobalApi.getNominalAggregatedData("Jakarta Pusat");

  console.group("📊 Data Processing Debug");
  console.log("1️⃣ Raw API Response Count:", response.length);

  // Analisis duplikasi
  const npaCount = {};
  response.forEach((item) => {
    npaCount[item.npaPgri] = (npaCount[item.npaPgri] || 0) + 1;
  });
  console.log("2️⃣ Unique NPAs:", Object.keys(npaCount).length);
  console.log("3️⃣ Duplicate Analysis:", npaCount);

  // Process
  const processed = processApiResponse(response, null, true);
  console.log("4️⃣ After Processing:", processed.length);

  // Verifikasi
  const duplicatesRemoved = response.length - processed.length;
  console.log("5️⃣ Duplicates Removed:", duplicatesRemoved);

  console.groupEnd();

  // Output contoh:
  /*
  📊 Data Processing Debug
  1️⃣ Raw API Response Count: 150
  2️⃣ Unique NPAs: 100
  3️⃣ Duplicate Analysis: {
       "33200806435": 3,
       "33200806436": 2,
       "33200806437": 1,
       ...
     }
  4️⃣ After Processing: 100
  5️⃣ Duplicates Removed: 50
  */
}

// ============================================
// CONTOH 8: Conditional Processing
// ============================================
async function example8_ConditionalProcessing() {
  const response = await GlobalApi.getNominalAggregatedData("");

  // Conditional processing berdasarkan mode
  const mode = "latest"; // atau "highest_id"
  const useLatestDate = mode === "latest" ? true : false;

  const processedData = processApiResponse(response, null, useLatestDate);

  return processedData;
}

// ============================================
// TIPS & BEST PRACTICES
// ============================================

/**
 * ✅ BEST PRACTICES:
 *
 * 1. Selalu proses data sebelum ditampilkan:
 *    response = processApiResponse(response, null, true);
 *
 * 2. Gunakan null untuk filterByNpa jika tidak perlu filter spesifik:
 *    processApiResponse(response, null, true)  ✅
 *    processApiResponse(response)              ✅ (default: null, true)
 *
 * 3. Konsisten dalam penggunaan parameter:
 *    - Selalu true untuk lastUpdatedAtIuran (recommended)
 *    - Gunakan false hanya jika ada alasan khusus
 *
 * 4. Debug dengan console.log:
 *    console.log("Before:", response.length);
 *    console.log("After:", processedData.length);
 *
 * 5. Handle edge cases:
 *    - Empty response → akan return []
 *    - Invalid npaPgri → akan return []
 *    - Null apiData → akan return apiData as-is
 */

/**
 * ⚠️ COMMON MISTAKES:
 *
 * ❌ Tidak proses data:
 *    const data = await GlobalApi.getNominalAggregatedData(cabang);
 *    setData(data);  // Mungkin ada duplikasi!
 *
 * ❌ Proses setelah display:
 *    setData(response);  // Display dulu
 *    response = processApiResponse(response);  // Terlambat!
 *
 * ❌ Salah parameter urutan:
 *    processApiResponse(response, true, null)  // ❌ Urutan salah
 *    processApiResponse(response, null, true)  // ✅ Benar
 *
 * ❌ Filter npaPgri dengan format salah:
 *    processApiResponse(response, "33200806435")   // ✅ String
 *    processApiResponse(response, 33200806435)     // ❌ Number
 */

export {
  example1_GetLatestDataAllMembers,
  example2_GetDataByHighestId,
  example3_FilterSpecificMember,
  example4_FilterAndSort,
  example5_BatchProcessing,
  example7_DebugProcessing,
  example8_ConditionalProcessing,
  RekapAnggotaExample,
};
