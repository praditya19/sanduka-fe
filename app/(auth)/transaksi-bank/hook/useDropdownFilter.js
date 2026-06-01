import { useState, useEffect, useRef, useMemo } from "react";
import GlobalApi from "@/app/_utils/GlobalApi";

const useDropdownFilter = (
  showEditModal,
  editData,
  onFilterChange,
  originalRekapData = [],
) => {
  const cabangRef = useRef(null);
  const unitKerjaRef = useRef(null);
  const [selectedCabang, setSelectedCabang] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("");
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [listCabang, setListCabang] = useState([]);
  const [filteredCabangList, setFilteredCabangList] = useState([]);
  const [originalCabangList, setOriginalCabangList] = useState([]);
  const [cabangOptions, setCabangOptions] = useState([]);
  const [filteredCabangOptions, setFilteredCabangOptions] = useState([]);
  const [filteredUnitKerja, setFilteredUnitKerja] = useState([]);
  const [unitKerjaInput, setUnitKerjaInput] = useState("");
  const [searchUnitKerja, setSearchUnitKerja] = useState("");
  const [searchDropCabang, setSearchDropCabang] = useState("");
  const [searchDropUnit, setSearchDropUnit] = useState("");
  const [listUnitKerja, setListUnitKerja] = useState([]);
  const [showCabangDropdown, setShowCabangDropdown] = useState(false);
  const [role, setRole] = useState("");
  const [showUnitKerjaDropdown, setShowUnitKerjaDropdown] = useState(false);
  const [loadingUnitKerja, setLoadingUnitKerja] = useState(false);

  const fetchCabangData = async () => {
    try {
      const cabangResponse = await GlobalApi.getCabang();

      setOriginalCabangList(cabangResponse.data);
      setCabangOptions(cabangResponse.data);
      setFilteredCabangOptions(cabangResponse.data);

      const storedRole = sessionStorage.getItem("role");

      setRole(storedRole || "");
    } catch (error) {
      console.error("Error fetching cabang data:", error);
    }
  };
  const fetchUnitKerjaData = async () => {
    try {
      const response = await GlobalApi.getUnitKerja();
      setUnitKerjaList(response.data);
    } catch (error) {
      console.error("Error fetching unit kerja data:", error);
    }
  };

  const fetchUnitKerja = async (cabang) => {
    try {
      setLoadingUnitKerja(true);

      const res = await GlobalApi.getUnitKerjaByCabang(cabang);

      const data = Array.isArray(res) ? res : res?.data || [];

      setListUnitKerja(data);
      setFilteredUnitKerja(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUnitKerja(false);
    }
  };
  const handleCabangClick = () => {
    setFilteredCabangList(originalCabangList);
    setShowCabangDropdown(true);
  };
  const handleUnitKerjaClick = async () => {
    if (!selectedCabang) return;

    await fetchUnitKerja(selectedCabang);

    setShowUnitKerjaDropdown(true);
    setSearchUnitKerja("");
  };

  const handleSelectCabang = (cabang) => {
    const selectedCabangValue = cabang.kecamatan;

    setSelectedCabang(selectedCabangValue);
    setShowCabangDropdown(false);

    setSelectedUnitKerja("");
    setUnitKerjaInput("");

    if (selectedCabangValue) {
      const cabangData = originalRekapData.filter(
        (item) =>
          item.cabang?.toLowerCase() === selectedCabangValue.toLowerCase(),
      );
      onFilterChange?.(cabangData);
    } else {
      onFilterChange?.(originalRekapData);
    }
  };

  const handleCabangSearch = (query) => {
    const filtered = originalCabangList.filter((cabang) =>
      cabang.kecamatan.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredCabangList(filtered);
  };

  const handleUnitKerjaChange = (e) => {
    const input = e.target.value;
    setUnitKerjaInput(input);
  };

  const handleUnitKerjaSearch = (searchTerm) => {
    setSearchUnitKerja(searchTerm);

    if (searchTerm === "") {
      setFilteredUnitKerja(listUnitKerja);
    } else {
      const filtered = listUnitKerja.filter((unitKerja) =>
        unitKerja.unitKerja.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUnitKerja(filtered);
    }
  };

  const handleUnitKerjaSelect = (unitKerja) => {
    const selectedValue = unitKerja.unitKerja || "";

    setSelectedUnitKerja(selectedValue);
    setUnitKerjaInput(selectedValue);
    setShowUnitKerjaDropdown(false);
    setSearchUnitKerja("");

    if (!selectedValue) {
      const cabangData = originalRekapData.filter((item) =>
        selectedCabang
          ? item.cabang?.toLowerCase() === selectedCabang.toLowerCase()
          : true,
      );
      if (onFilterChange) {
        onFilterChange(cabangData);
      }
    } else {
      const filteredData = originalRekapData.filter(
        (item) =>
          item.cabang?.toLowerCase() === selectedCabang.toLowerCase() &&
          item.unitKerja?.toLowerCase() === selectedValue.toLowerCase(),
      );

      if (onFilterChange) {
        onFilterChange(filteredData);
      }
    }
  };
  useEffect(() => {
    fetchCabangData();
    fetchUnitKerjaData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cabangRef.current && !cabangRef.current.contains(event.target)) {
        setShowCabangDropdown(false);
      }
      if (
        unitKerjaRef.current &&
        !unitKerjaRef.current.contains(event.target)
      ) {
        setShowUnitKerjaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showEditModal) {
      const fetchCabang = async () => {
        try {
          const res = await GlobalApi.getCabang();

          setListCabang(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
          console.error(error);
          setListCabang([]);
        }
      };

      fetchCabang();
      fetchCabangData();
      fetchUnitKerjaData();
    }
  }, [showEditModal]);

  useEffect(() => {
    if (editData?.cabang) {
      fetchUnitKerja(editData.cabang);
    }
  }, [editData?.cabang]);

  useEffect(() => {
    if (originalRekapData && originalRekapData.length > 0 && onFilterChange) {
      let filteredData = originalRekapData;

      if (selectedCabang) {
        filteredData = filteredData.filter(
          (item) => item.cabang?.toLowerCase() === selectedCabang.toLowerCase(),
        );
      }

      if (selectedUnitKerja) {
        filteredData = filteredData.filter(
          (item) =>
            item.unitKerja?.toLowerCase() === selectedUnitKerja.toLowerCase(),
        );
      }

      onFilterChange(filteredData);
    }
  }, [selectedCabang, selectedUnitKerja, originalRekapData, onFilterChange]);

  useEffect(() => {
    if (selectedCabang) {
      fetchUnitKerja(selectedCabang);
    } else {
      setListUnitKerja([]);
      setFilteredUnitKerja([]);
    }

    setSelectedUnitKerja("");
    setUnitKerjaInput("");
  }, [selectedCabang]);
  return {
    selectedCabang,
    selectedUnitKerja,
    unitKerjaList,
    listCabang,
    filteredCabangList,
    originalCabangList,
    cabangOptions,
    filteredCabangOptions,
    filteredUnitKerja,
    unitKerjaInput,
    searchUnitKerja,
    searchDropCabang,
    searchDropUnit,
    showCabangDropdown,
    showUnitKerjaDropdown,
    cabangRef,
    unitKerjaRef,

    setSelectedCabang,
    setSelectedUnitKerja,
    setUnitKerjaInput,
    setSearchUnitKerja,
    setSearchDropCabang,
    setSearchDropUnit,

    fetchCabangData,
    fetchUnitKerjaData,
    fetchUnitKerja,
    handleCabangClick,
    handleUnitKerjaClick,
    handleSelectCabang,
    handleCabangSearch,
    handleUnitKerjaChange,
    handleUnitKerjaSearch,
    handleUnitKerjaSelect,
  };
};

export default useDropdownFilter;
