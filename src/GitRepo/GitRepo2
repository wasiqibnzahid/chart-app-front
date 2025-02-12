import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Text,
  Flex,
  Button,
  IconButton,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Select,
} from "@chakra-ui/react";
import Papa from "papaparse";
import { FaArrowLeft, FaArrowRight, FaCalendar, FaPlus } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

// ───────────────
// Custom Plugin: rawValuePlugin
// ───────────────
// This plugin draws the raw numeric value on top of each bar. It only draws if 
// chart.options.custom.showValues is true.
const rawValuePlugin = {
  id: "rawValuePlugin",
  afterDatasetsDraw(chart, args, options) {
    if (!chart.options.custom || !chart.options.custom.showValues) return;
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        const label = String(value);
        const { x, y, base } = bar.getProps(["x", "y", "base"], true);
        const barTop = Math.min(y, base);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, barTop - 5);
        ctx.restore();
      });
    });
  },
};

const App = () => {
  // --------------------
  // PIN Authentication
  // --------------------
  const [pinInput, setPinInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pinInputRef = useRef(null);
  const toast = useToast();

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === "123456") {
      setIsAuthorized(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the Dashboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Incorrect PIN",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (!isAuthorized && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [isAuthorized]);

  // --------------------
  // CSV Data Fetching
  // --------------------
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsnS1uwXU5Va5WZ1ZXz1feDKfvBX4JfbWCFA8SZvaRpZfEWZhf1HKs-h6TDVctf4pz4LfKKCwaP1C0/pub?output=csv";

  useEffect(() => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error fetching CSV:", err);
        setError("Failed to fetch data.");
        setIsLoading(false);
      },
    });
  }, [csvUrl]);

  // --------------------
  // Process CSV Rows
  // --------------------
  const processedData = useMemo(() => {
    return csvData
      .map((row) => ({
        date: row["Date"]?.trim(),
        category: row["Category"]?.trim(),
        createdAt: Number(row["Created At"]),
        openPRs: Number(row["Open PRs"]),
        mergedAt: Number(row["Merged At"]),
        sDevelopment: Number(row["S_DEVELOPMENT Count"]),
        sCodeReview: Number(row["S_CODE_REVIEW Count"]),
        sQA: Number(row["S_QA Count"]),
        sUAT: Number(row["S_UAT Count"]),
      }))
      .filter((row) => row.date);
  }, [csvData]);

  const sortedDates = useMemo(() => {
    const datesSet = new Set(processedData.map((row) => row.date));
    return Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
  }, [processedData]);

  // --------------------
  // Date Navigation & Selection
  // --------------------
  const [selectedDate, setSelectedDate] = useState(null);
  const currentDate =
    selectedDate || (sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null);

  const navigateDate = (direction) => {
    if (!currentDate) return;
    const idx = sortedDates.indexOf(currentDate);
    if (direction === "left" && idx > 0) {
      const newDate = sortedDates[idx - 1];
      setSelectedDate(newDate);
      toast({ title: "Date Changed", description: `Viewing data for ${newDate}`, status: "success" });
    } else if (direction === "right" && idx < sortedDates.length - 1) {
      const newDate = sortedDates[idx + 1];
      setSelectedDate(newDate);
      toast({ title: "Date Changed", description: `Viewing data for ${newDate}`, status: "success" });
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
      toast({ title: "Date Selected", description: `Viewing data for ${newDate}`, status: "success" });
    }
  };

  const resetSelectedDate = () => {
    setSelectedDate(null);
    toast({ title: "Date Reset", description: "Viewing the latest date", status: "info" });
  };

  // --------------------
  // Category Mapping & Fixed Categories
  // --------------------
  const categoryNameMapping = {
    P_ENTRETENIMIENTO: "ent",
    P_AZTECA_NOTICIAS: "noticias",
    P_AZTECA_DEPORTES: "deportes",
    P_ADN40: "adn40",
    P_REVISTA_CENTRAL: "RC",
    P_LOCALES: "locales",
    P_ADOPS: "adops",
    P_SEO: "seo",
    P_DATA: "data",
    P_SUPER_APP: "baz",
  };
  const getSimplifiedCategoryName = (cat) => categoryNameMapping[cat] || cat;
  const fixedCategories = [
    "Global",
    "P_ENTRETENIMIENTO",
    "P_AZTECA_NOTICIAS",
    "P_AZTECA_DEPORTES",
    "P_ADN40",
    "P_REVISTA_CENTRAL",
    "P_LOCALES",
    "P_ADOPS",
    "P_SEO",
    "P_DATA",
    "P_SUPER_APP",
  ];

  // --------------------
  // Time Period Selection
  // --------------------
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("currentDay");
  const getBaselineFilteredData = useMemo(() => {
    if (!currentDate) return [];
    const refDate = new Date(currentDate);
    refDate.setHours(0, 0, 0, 0);
    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
    if (selectedTimePeriod === "currentDay") {
      return processedData.filter((row) => {
        const d = new Date(row.date);
        d.setHours(0, 0, 0, 0);
        return isSameDay(d, refDate);
      });
    }
    if (selectedTimePeriod === "currentWeek") {
      const dayOfWeek = refDate.getDay();
      const startOfWeek = new Date(refDate);
      startOfWeek.setDate(refDate.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return processedData.filter((row) => {
        const d = new Date(row.date);
        return d >= startOfWeek && d <= endOfWeek;
      });
    }
    if (selectedTimePeriod === "currentMonth") {
      return processedData.filter((row) => {
        const d = new Date(row.date);
        return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
      });
    }
    if (selectedTimePeriod === "currentYear") {
      return processedData.filter((row) => {
        const d = new Date(row.date);
        return d.getFullYear() === refDate.getFullYear();
      });
    }
    if (selectedTimePeriod === "allTime") {
      return processedData;
    }
    return processedData;
  }, [processedData, currentDate, selectedTimePeriod]);

  // --------------------
  // "Compare" Ranges
  // --------------------
  const [compareRanges, setCompareRanges] = useState([]);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");

  const addCompareRange = () => {
    if (!tempStart || !tempEnd) {
      toast({ title: "Invalid Range", description: "Please select both start and end dates for comparison.", status: "error" });
      return;
    }
    if (new Date(tempStart) > new Date(tempEnd)) {
      toast({ title: "Invalid Range", description: "Start date cannot be after End date.", status: "error" });
      return;
    }
    setCompareRanges((prev) => [...prev, { start: tempStart, end: tempEnd, id: Date.now() }]);
    toast({ title: "Added Comparison Range", description: `Range ${tempStart} to ${tempEnd}`, status: "success" });
    setTempStart("");
    setTempEnd("");
  };

  const removeCompareRange = (id) => {
    setCompareRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const getDataForRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return processedData.filter((row) => {
      const d = new Date(row.date);
      return d >= startDate && d <= endDate;
    });
  };

  const aggregatedMode = compareRanges.length > 0;

  // --------------------
  // Toggle for Showing Values (raw) on bars
  // --------------------
  const [showValues, setShowValues] = useState(true);

  // --------------------
  // Toggle for Including Base Range in Aggregated Mode
  // --------------------
  const [showBaseRange, setShowBaseRange] = useState(true);

  // --------------------
  // Color Palettes
  // --------------------
  const paletteMain = ["#f72585", "#b5179e", "#7209b7", "#560bad", "#480ca8", "#3a0ca3", "#3f37c9", "#4361ee", "#4895ef", "#4cc9f0", "#FFB703", "#FB8500", "#8ECAE6", "#219EBC"];
  const paletteTotals = ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D", "#43AA8B", "#577590", "#FFB703", "#FB8500"];
  const paletteCat = ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D", "#43AA8B"];

  // --------------------
  // Selected Metric and Category (for category-specific chart)
  // --------------------
  const [selectedMetric, setSelectedMetric] = useState("createdAt");
  const [selectedCategoryForSChart, setSelectedCategoryForSChart] = useState("");

  // --------------------
  // 1) Main Chart (by Category)
  // --------------------
  const dailyBreakdownChartData = useMemo(() => {
    if (!aggregatedMode) {
      if (!getBaselineFilteredData.length) return null;
      const uniqueDates = Array.from(new Set(getBaselineFilteredData.map((row) => row.date))).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const datasets = fixedCategories.map((cat) => {
        const dataArray = uniqueDates.map((date) => {
          const rowsForCatAndDate = getBaselineFilteredData.filter(
            (r) => r.category === cat && r.date === date
          );
          return rowsForCatAndDate.reduce((acc, r) => acc + (r[selectedMetric] || 0), 0);
        });
        // Generate a random color if needed:
        const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        return {
          label: getSimplifiedCategoryName(cat),
          data: dataArray,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        };
      });
      return { labels: uniqueDates, datasets };
    } else {
      // Aggregated mode: Build labels and dataset arrays based on showBaseRange toggle.
      const compareLabels = compareRanges.map((r, i) => `Compare #${i + 1}: ${r.start}→${r.end}`);
      const labels = showBaseRange ? ["Base Range", ...compareLabels] : [...compareLabels];
      const datasets = fixedCategories.map((cat, index) => {
        const baselineSum = getBaselineFilteredData
          .filter((row) => row.category === cat)
          .reduce((acc, row) => acc + (row[selectedMetric] || 0), 0);
        const compareSums = compareRanges.map((r) => {
          const data = getDataForRange(r.start, r.end);
          return data.filter((row) => row.category === cat).reduce((acc, row) => acc + (row[selectedMetric] || 0), 0);
        });
        const data = showBaseRange ? [baselineSum, ...compareSums] : [...compareSums];
        return {
          label: getSimplifiedCategoryName(cat),
          data,
          backgroundColor: paletteMain[index % paletteMain.length],
          borderColor: paletteMain[index % paletteMain.length],
          borderWidth: 1,
        };
      });
      return { labels, datasets };
    }
  }, [aggregatedMode, compareRanges, getBaselineFilteredData, fixedCategories, selectedMetric, showBaseRange]);

  const mainChartData = dailyBreakdownChartData;

  // --------------------
  // 2) Totals Chart (All Metrics Combined, excluding Open PRs)
  // --------------------
  const dailyTotalsChartData = useMemo(() => {
    if (!aggregatedMode) {
      if (!getBaselineFilteredData.length) return null;
      const uniqueDates = Array.from(new Set(getBaselineFilteredData.map((row) => row.date))).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const totalMetrics = [
        { key: "createdAt", label: "Created At" },
        { key: "mergedAt", label: "Merged At" },
        { key: "sDevelopment", label: "S_DEVELOPMENT" },
        { key: "sCodeReview", label: "S_CODE_REVIEW" },
        { key: "sQA", label: "S_QA" },
        { key: "sUAT", label: "S_UAT" },
      ];
      const datasets = totalMetrics.map((mt, idx) => {
        const data = uniqueDates.map((date) => {
          const rows = getBaselineFilteredData.filter((row) => row.date === date);
          return rows.reduce((acc, row) => acc + (row[mt.key] || 0), 0);
        });
        return {
          label: mt.label,
          data,
          backgroundColor: paletteTotals[idx % paletteTotals.length],
          borderColor: paletteTotals[idx % paletteTotals.length],
          borderWidth: 1,
        };
      });
      return { labels: uniqueDates, datasets };
    } else {
      const compareLabels = compareRanges.map((r, i) => `Compare #${i + 1}: ${r.start}→${r.end}`);
      const labels = showBaseRange ? ["Base Range", ...compareLabels] : [...compareLabels];
      const totalMetrics = [
        { key: "createdAt", label: "Created At" },
        { key: "mergedAt", label: "Merged At" },
        { key: "sDevelopment", label: "S_DEVELOPMENT" },
        { key: "sCodeReview", label: "S_CODE_REVIEW" },
        { key: "sQA", label: "S_QA" },
        { key: "sUAT", label: "S_UAT" },
      ];
      const datasets = totalMetrics.map((mt, idx) => {
        const baselineSum = getBaselineFilteredData.reduce((acc, row) => acc + (row[mt.key] || 0), 0);
        const compareSums = compareRanges.map((r) => {
          const data = getDataForRange(r.start, r.end);
          return data.reduce((acc, row) => acc + (row[mt.key] || 0), 0);
        });
        const data = showBaseRange ? [baselineSum, ...compareSums] : [...compareSums];
        return {
          label: mt.label,
          data,
          backgroundColor: paletteTotals[idx % paletteTotals.length],
          borderColor: paletteTotals[idx % paletteTotals.length],
          borderWidth: 1,
        };
      });
      return { labels, datasets };
    }
  }, [aggregatedMode, compareRanges, getBaselineFilteredData, showBaseRange]);

  const totalsChartData = dailyTotalsChartData;

  // --------------------
  // 3) Category-Specific Chart
  // --------------------
  const categorySChartData = useMemo(() => {
    if (!selectedCategoryForSChart) return null;
    if (!aggregatedMode) {
      const rowsForCategory = getBaselineFilteredData
        .filter((row) => row.category === selectedCategoryForSChart)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      const uniqueDates = Array.from(new Set(rowsForCategory.map((row) => row.date))).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const catMetrics = [
        { key: "createdAt", label: "Created At" },
        { key: "mergedAt", label: "Merged At" },
        { key: "sDevelopment", label: "S_DEVELOPMENT" },
        { key: "sCodeReview", label: "S_CODE_REVIEW" },
        { key: "sQA", label: "S_QA" },
        { key: "sUAT", label: "S_UAT" },
      ];
      const datasets = catMetrics.map((mt) => {
        const dataArray = uniqueDates.map((dt) => {
          const rows = rowsForCategory.filter((r) => r.date === dt);
          return rows.reduce((acc, row) => acc + (row[mt.key] || 0), 0);
        });
        const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        return {
          label: mt.label,
          data: dataArray,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        };
      });
      return { labels: uniqueDates, datasets };
    } else {
      const compareLabels = compareRanges.map((r, i) => `Compare #${i + 1}: ${r.start}→${r.end}`);
      const labels = showBaseRange ? ["Base Range", ...compareLabels] : [...compareLabels];
      const catMetrics = [
        { key: "createdAt", label: "Created At" },
        { key: "mergedAt", label: "Merged At" },
        { key: "sDevelopment", label: "S_DEVELOPMENT" },
        { key: "sCodeReview", label: "S_CODE_REVIEW" },
        { key: "sQA", label: "S_QA" },
        { key: "sUAT", label: "S_UAT" },
      ];
      const datasets = catMetrics.map((mt, idx) => {
        const baselineSum = getBaselineFilteredData
          .filter((row) => row.category === selectedCategoryForSChart)
          .reduce((acc, row) => acc + (row[mt.key] || 0), 0);
        const compareSums = compareRanges.map((r) => {
          const data = getDataForRange(r.start, r.end);
          return data.filter((row) => row.category === selectedCategoryForSChart)
            .reduce((acc, row) => acc + (row[mt.key] || 0), 0);
        });
        const data = showBaseRange ? [baselineSum, ...compareSums] : [...compareSums];
        return {
          label: mt.label,
          data,
          backgroundColor: paletteCat[idx % paletteCat.length],
          borderColor: paletteCat[idx % paletteCat.length],
          borderWidth: 1,
        };
      });
      return { labels, datasets };
    }
  }, [aggregatedMode, compareRanges, selectedCategoryForSChart, getBaselineFilteredData, showBaseRange]);

  // --------------------
  // Chart Options (Bar charts only)
  // We set the x-axis ticks to rotate 45° for diagonal labels.
  // Also, we pass a custom option "showValues" to our plugin.
  // --------------------
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    custom: { showValues },
    plugins: {
      legend: { labels: { color: "white" } },
    },
    scales: {
      x: {
        ticks: { color: "white", maxRotation: 45, minRotation: 45 },
        grid: { color: "rgba(255,255,255,0.3)" },
      },
      y: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.3)" } },
    },
  };

  // --------------------
  // Table Logic (with Totals Row)
  // --------------------
  const [detailedCategory, setDetailedCategory] = useState(null);
  const handleRowDoubleClick = (category) => {
    setDetailedCategory(category);
  };
  const closeDetailedView = () => {
    setDetailedCategory(null);
  };

  return (
    <Box minH="100vh" bg="linear-gradient(90deg, #000000, #7800ff)" color="white" p={4}>
      {/* PIN Authentication Overlay */}
      {!isAuthorized && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="linear-gradient(90deg, #000000, #7800ff)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <form onSubmit={handlePinSubmit}>
            <VStack spacing={4}>
              <Text fontSize="xl" color="white">
                Enter PIN to Access Dashboard
              </Text>
              <Input
                ref={pinInputRef}
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                width="300px"
                textAlign="center"
                required
                bg="white"
                color="black"
              />
              <Button type="submit" colorScheme="teal">
                Submit
              </Button>
            </VStack>
          </form>
        </Box>
      )}
      {isAuthorized && (
        <Box maxW="1200px" mx="auto">
          <Text fontSize="2xl" mb={4} fontWeight="bold">
            Dashboard – CSV Metrics
          </Text>
          {isLoading ? (
            <Text>Loading data...</Text>
          ) : error ? (
            <Text color="red.300">{error}</Text>
          ) : (
            <>
              {/* Date Navigation */}
              <Flex alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <IconButton
                  aria-label="Previous Date"
                  icon={<FaArrowLeft />}
                  onClick={() => navigateDate("left")}
                  isDisabled={!currentDate || sortedDates.indexOf(currentDate) === 0}
                  colorScheme="gray"
                />
                <Text fontSize="lg" fontWeight="bold">
                  {currentDate}
                </Text>
                <IconButton
                  aria-label="Next Date"
                  icon={<FaArrowRight />}
                  onClick={() => navigateDate("right")}
                  isDisabled={!currentDate || sortedDates.indexOf(currentDate) === sortedDates.length - 1}
                  colorScheme="gray"
                />
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <IconButton
                      aria-label="Select Date"
                      icon={<FaCalendar />}
                      bg="linear-gradient(90deg, #000000, #7800ff)"
                      _hover={{ bg: "linear-gradient(90deg, #000000, #7800ff)" }}
                      color="white"
                    />
                  </PopoverTrigger>
                  <PopoverContent bg="linear-gradient(90deg, #000000, #7800ff)" borderColor="whiteAlpha.300" color="white">
                    <PopoverArrow bg="linear-gradient(90deg, #000000, #7800ff)" />
                    <PopoverCloseButton color="white" />
                    <PopoverHeader borderBottom="1px solid" borderColor="whiteAlpha.300">
                      Select a Date
                    </PopoverHeader>
                    <PopoverBody>
                      <Input
                        type="date"
                        placeholder="yyyy-mm-dd"
                        value={selectedDate || ""}
                        onChange={handleDateChange}
                        min={sortedDates[0]}
                        max={sortedDates[sortedDates.length - 1]}
                        bg="linear-gradient(90deg, #000000, #7800ff)"
                        color="white"
                        borderColor="whiteAlpha.300"
                      />
                      {selectedDate && (
                        <Button mt={2} size="sm" onClick={resetSelectedDate} colorScheme="gray">
                          Clear
                        </Button>
                      )}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Flex>
              {/* Time Period & Compare Ranges */}
              <Flex mb={6} gap={4} flexWrap="wrap" alignItems="center">
                <Select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  bg="linear-gradient(90deg, #000000, #7800ff)"
                  color="white"
                  borderColor="whiteAlpha.300"
                  maxW="200px"
                >
                  <option style={{ color: "black" }} value="currentDay">
                    Current Day
                  </option>
                  <option style={{ color: "black" }} value="currentWeek">
                    Current Week
                  </option>
                  <option style={{ color: "black" }} value="currentMonth">
                    Current Month
                  </option>
                  <option style={{ color: "black" }} value="currentYear">
                    Current Year
                  </option>
                  <option style={{ color: "black" }} value="allTime">
                    All Time
                  </option>
                </Select>
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <Button leftIcon={<FaPlus />} colorScheme="pink">
                      Compare
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent bg="linear-gradient(90deg, #000000, #7800ff)" borderColor="whiteAlpha.300" color="white">
                    <PopoverArrow bg="linear-gradient(90deg, #000000, #7800ff)" />
                    <PopoverCloseButton color="white" />
                    <PopoverHeader borderBottom="1px solid" borderColor="whiteAlpha.300">
                      Add Comparison Range
                    </PopoverHeader>
                    <PopoverBody>
                      <VStack spacing={2} align="stretch">
                        <Text fontSize="sm">Start Date</Text>
                        <Input
                          type="date"
                          value={tempStart}
                          onChange={(e) => setTempStart(e.target.value)}
                          bg="linear-gradient(90deg, #000000, #7800ff)"
                          color="white"
                          borderColor="whiteAlpha.300"
                        />
                        <Text fontSize="sm">End Date</Text>
                        <Input
                          type="date"
                          value={tempEnd}
                          onChange={(e) => setTempEnd(e.target.value)}
                          bg="linear-gradient(90deg, #000000, #7800ff)"
                          color="white"
                          borderColor="whiteAlpha.300"
                        />
                        <Button size="sm" colorScheme="teal" onClick={addCompareRange}>
                          Add
                        </Button>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                {compareRanges.length > 0 && (
                  <Flex flexWrap="wrap" gap={2}>
                    {compareRanges.map((rng, i) => (
                      <Flex key={rng.id} bg="linear-gradient(90deg, #000000, #7800ff)" px={2} py={1} alignItems="center" borderRadius="md">
                        <Text fontSize="sm" mr={2}>
                          {`#${i + 1}: ${rng.start} → ${rng.end}`}
                        </Text>
                        <Button size="xs" colorScheme="red" onClick={() => removeCompareRange(rng.id)}>
                          X
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Flex>
              {/* Toggle Buttons */}
              <Flex mb={6} gap={4} flexWrap="wrap">
                <Button
                  colorScheme={showValues ? "teal" : "gray"}
                  onClick={() => setShowValues((prev) => !prev)}
                >
                  {showValues ? "Hide Values" : "Show Values"}
                </Button>
                <Button
                  colorScheme={showBaseRange ? "teal" : "gray"}
                  onClick={() => setShowBaseRange((prev) => !prev)}
                >
                  {showBaseRange ? "Hide Base Range" : "Show Base Range"}
                </Button>
              </Flex>
              {/* Chart Metric Selection */}
              <Flex mb={6} gap={4} flexWrap="wrap">
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  bg="linear-gradient(90deg, #000000, #7800ff)"
                  color="white"
                  borderColor="whiteAlpha.300"
                  maxW="200px"
                >
                  {[
                    { key: "createdAt", label: "Created At" },
                    { key: "openPRs", label: "Open PRs" },
                    { key: "mergedAt", label: "Merged At" },
                    { key: "sDevelopment", label: "S_DEVELOPMENT" },
                    { key: "sCodeReview", label: "S_CODE_REVIEW" },
                    { key: "sQA", label: "S_QA" },
                    { key: "sUAT", label: "S_UAT" },
                  ].map((metric) => (
                    <option key={metric.key} value={metric.key} style={{ color: "black" }}>
                      {metric.label}
                    </option>
                  ))}
                </Select>
                <Select value="bar" disabled bg="linear-gradient(90deg, #000000, #7800ff)" color="white" borderColor="whiteAlpha.300" maxW="200px">
                  <option style={{ color: "black" }} value="bar">
                    Bar Chart
                  </option>
                </Select>
              </Flex>
              {/* 1) Main Chart */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Day-by-Day Chart for <em>{selectedMetric}</em> (by Category)
              </Text>
              <Box mb={6} border="1px solid white" borderRadius="md" p={2} width="100%" minH="400px" height="400px" bg="linear-gradient(90deg, #000000, #7800ff)">
                {mainChartData && mainChartData.labels.length > 0 ? (
                  <Bar
                    data={mainChartData}
                    options={{ ...chartOptions, custom: { showValues } }}
                    plugins={[rawValuePlugin]}
                  />
                ) : (
                  <Text>No data for this selection.</Text>
                )}
              </Box>
              {/* 2) Totals Chart */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Day-by-Day Totals (All Metrics Combined)
              </Text>
              <Box mb={6} border="1px solid white" borderRadius="md" p={2} width="100%" minH="400px" height="400px" bg="linear-gradient(90deg, #000000, #7800ff)">
                {totalsChartData && totalsChartData.labels.length > 0 ? (
                  <Bar
                    data={totalsChartData}
                    options={{ ...chartOptions, custom: { showValues } }}
                    plugins={[rawValuePlugin]}
                  />
                ) : (
                  <Text>No data for this selection.</Text>
                )}
              </Box>
              {/* 3) Category-Specific Chart */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Category-Specific Totals Over Time (CreatedAt, MergedAt, QA, etc.)
              </Text>
              <Flex mb={4} gap={4} alignItems="center">
                <Select
                  placeholder="Select Category"
                  value={selectedCategoryForSChart}
                  onChange={(e) => setSelectedCategoryForSChart(e.target.value)}
                  bg="linear-gradient(90deg, #000000, #7800ff)"
                  color="white"
                  borderColor="whiteAlpha.300"
                  maxW="300px"
                >
                  {fixedCategories.map((cat) => (
                    <option key={cat} value={cat} style={{ color: "black" }}>
                      {getSimplifiedCategoryName(cat)}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Box mb={6} border="1px solid white" borderRadius="md" p={2} width="100%" minH="400px" height="400px" bg="linear-gradient(90deg, #000000, #7800ff)">
                {categorySChartData && categorySChartData.labels.length > 0 ? (
                  <Bar
                    data={categorySChartData}
                    options={{ ...chartOptions, custom: { showValues } }}
                    plugins={[rawValuePlugin]}
                  />
                ) : (
                  <Text>Please select a category above.</Text>
                )}
              </Box>
              {/* Table: Category Totals for Selected Time Period */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Table: Category Totals for Selected Time Period
              </Text>
              <Box overflowX="auto" mb={6}>
                <Table
                  bg="linear-gradient(90deg, #000000, #7800ff)"
                  color="white"
                  border="2px solid #FFFFFF"
                  borderRadius="12px"
                  boxShadow="0 0 20px rgba(255,255,255,0.4)"
                  overflow="hidden"
                  sx={{
                    borderCollapse: "collapse",
                    "th, td": { background: "transparent", borderColor: "whiteAlpha.300" },
                    "thead tr": { background: "transparent" },
                    "tbody tr:hover": { background: "transparent", transform: "none" },
                  }}
                  size="md"
                >
                  <Thead>
                    <Tr>
                      <Th color="white">Category</Th>
                      <Th isNumeric color="white">Created At</Th>
                      <Th isNumeric color="white">Open PRs</Th>
                      <Th isNumeric color="white">Merged At</Th>
                      <Th isNumeric color="white">S_DEVELOPMENT</Th>
                      <Th isNumeric color="white">S_CODE_REVIEW</Th>
                      <Th isNumeric color="white">S_QA</Th>
                      <Th isNumeric color="white">S_UAT</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(() => {
                      const grandTotals = { createdAt: 0, openPRs: 0, mergedAt: 0, sDevelopment: 0, sCodeReview: 0, sQA: 0, sUAT: 0 };
                      const baselineRows = getBaselineFilteredData;
                      const rowsForRender = fixedCategories.map((cat) => {
                        const rows = baselineRows.filter((row) => row.category === cat);
                        const sums = rows.reduce(
                          (acc, row) => {
                            acc.createdAt += row.createdAt;
                            acc.openPRs += row.openPRs;
                            acc.mergedAt += row.mergedAt;
                            acc.sDevelopment += row.sDevelopment;
                            acc.sCodeReview += row.sCodeReview;
                            acc.sQA += row.sQA;
                            acc.sUAT += row.sUAT;
                            return acc;
                          },
                          { createdAt: 0, openPRs: 0, mergedAt: 0, sDevelopment: 0, sCodeReview: 0, sQA: 0, sUAT: 0 }
                        );
                        grandTotals.createdAt += sums.createdAt;
                        grandTotals.openPRs += sums.openPRs;
                        grandTotals.mergedAt += sums.mergedAt;
                        grandTotals.sDevelopment += sums.sDevelopment;
                        grandTotals.sCodeReview += sums.sCodeReview;
                        grandTotals.sQA += sums.sQA;
                        grandTotals.sUAT += sums.sUAT;
                        return (
                          <Tr key={cat} onDoubleClick={() => handleRowDoubleClick(cat)} _hover={{ cursor: "pointer" }}>
                            <Td>{getSimplifiedCategoryName(cat)}</Td>
                            <Td isNumeric>{sums.createdAt}</Td>
                            <Td isNumeric>{sums.openPRs}</Td>
                            <Td isNumeric>{sums.mergedAt}</Td>
                            <Td isNumeric>{sums.sDevelopment}</Td>
                            <Td isNumeric>{sums.sCodeReview}</Td>
                            <Td isNumeric>{sums.sQA}</Td>
                            <Td isNumeric>{sums.sUAT}</Td>
                          </Tr>
                        );
                      });
                      return (
                        <>
                          {rowsForRender}
                          <Tr bg="blackAlpha.600">
                            <Td fontWeight="bold">TOTAL</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.createdAt}</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.openPRs}</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.mergedAt}</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.sDevelopment}</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.sCodeReview}</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.sQA}</Td>
                            <Td isNumeric fontWeight="bold">{grandTotals.sUAT}</Td>
                          </Tr>
                        </>
                      );
                    })()}
                  </Tbody>
                </Table>
              </Box>
              {/* Detailed Category View */}
              {detailedCategory && (
                <Box mt={8}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="xl" fontWeight="bold">
                      Historical Data for: {getSimplifiedCategoryName(detailedCategory)}
                    </Text>
                    <Button size="sm" onClick={closeDetailedView} colorScheme="gray">
                      Close
                    </Button>
                  </Flex>
                  <Box overflowX="auto" mb={6}>
                    <Table
                      bg="linear-gradient(90deg, #000000, #7800ff)"
                      color="white"
                      border="2px solid #FFFFFF"
                      borderRadius="12px"
                      boxShadow="0 0 20px rgba(255,255,255,0.4)"
                      overflow="hidden"
                      sx={{
                        borderCollapse: "collapse",
                        "th, td": { background: "transparent", borderColor: "whiteAlpha.300" },
                        "thead tr": { background: "transparent" },
                        "tbody tr:hover": { background: "transparent", transform: "none" },
                      }}
                      size="md"
                    >
                      <Thead>
                        <Tr>
                          <Th color="white">Date</Th>
                          <Th isNumeric color="white">Created At</Th>
                          <Th isNumeric color="white">Open PRs</Th>
                          <Th isNumeric color="white">Merged At</Th>
                          <Th isNumeric color="white">S_DEVELOPMENT</Th>
                          <Th isNumeric color="white">S_CODE_REVIEW</Th>
                          <Th isNumeric color="white">S_QA</Th>
                          <Th isNumeric color="white">S_UAT</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(() => {
                          let totals = { createdAt: 0, openPRs: 0, mergedAt: 0, sDevelopment: 0, sCodeReview: 0, sQA: 0, sUAT: 0 };
                          const rowsForCat = getBaselineFilteredData
                            .filter((r) => r.category === detailedCategory)
                            .sort((a, b) => new Date(a.date) - new Date(b.date));
                          const rowEls = rowsForCat.map((row, idx) => {
                            totals.createdAt += row.createdAt;
                            totals.openPRs += row.openPRs;
                            totals.mergedAt += row.mergedAt;
                            totals.sDevelopment += row.sDevelopment;
                            totals.sCodeReview += row.sCodeReview;
                            totals.sQA += row.sQA;
                            totals.sUAT += row.sUAT;
                            return (
                              <Tr key={idx}>
                                <Td>{row.date}</Td>
                                <Td isNumeric>{row.createdAt}</Td>
                                <Td isNumeric>{row.openPRs}</Td>
                                <Td isNumeric>{row.mergedAt}</Td>
                                <Td isNumeric>{row.sDevelopment}</Td>
                                <Td isNumeric>{row.sCodeReview}</Td>
                                <Td isNumeric>{row.sQA}</Td>
                                <Td isNumeric>{row.sUAT}</Td>
                              </Tr>
                            );
                          });
                          return (
                            <>
                              {rowEls}
                              {rowEls.length > 0 && (
                                <Tr bg="blackAlpha.600">
                                  <Td fontWeight="bold">TOTAL</Td>
                                  <Td isNumeric fontWeight="bold">{totals.createdAt}</Td>
                                  <Td isNumeric fontWeight="bold">{totals.openPRs}</Td>
                                  <Td isNumeric fontWeight="bold">{totals.mergedAt}</Td>
                                  <Td isNumeric fontWeight="bold">{totals.sDevelopment}</Td>
                                  <Td isNumeric fontWeight="bold">{totals.sCodeReview}</Td>
                                  <Td isNumeric fontWeight="bold">{totals.sQA}</Td>
                                  <Td isNumeric fontWeight="bold">{totals.sUAT}</Td>
                                </Tr>
                              )}
                            </>
                          );
                        })()}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default App;
