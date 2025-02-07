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
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

const GitRepo = () => {
  // ───────────────
  // PIN Authentication (Optional)
  // ───────────────
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

  // ───────────────
  // CSV Data Fetching
  // ───────────────
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

  // Convert fields -> numeric, filter out empty date
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

  // Unique sorted dates
  const sortedDates = useMemo(() => {
    const datesSet = new Set(processedData.map((row) => row.date));
    return Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
  }, [processedData]);

  // ───────────────
  // Date Navigation & Selection
  // ───────────────
  const [selectedDate, setSelectedDate] = useState(null);

  // Default to last date if none selected
  const currentDate =
    selectedDate || (sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null);

  const navigateDate = (direction) => {
    if (!currentDate) return;
    const idx = sortedDates.indexOf(currentDate);
    if (direction === "left" && idx > 0) {
      const newDate = sortedDates[idx - 1];
      setSelectedDate(newDate);
      toast({
        title: "Date Changed",
        description: `Viewing data for ${newDate}`,
        status: "success",
      });
    } else if (direction === "right" && idx < sortedDates.length - 1) {
      const newDate = sortedDates[idx + 1];
      setSelectedDate(newDate);
      toast({
        title: "Date Changed",
        description: `Viewing data for ${newDate}`,
        status: "success",
      });
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
      toast({
        title: "Date Selected",
        description: `Viewing data for ${newDate}`,
        status: "success",
      });
    }
  };

  const resetSelectedDate = () => {
    setSelectedDate(null);
    toast({
      title: "Date Reset",
      description: "Viewing the latest date",
      status: "info",
    });
  };

  // ───────────────
  // Category Mapping
  // ───────────────
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

  // ───────────────
  // Time Period Selection (baseline)
  // ───────────────
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("currentDay");

  // For "baseline" date range
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
        return (
          d.getMonth() === refDate.getMonth() &&
          d.getFullYear() === refDate.getFullYear()
        );
      });
    }

    if (selectedTimePeriod === "currentYear") {
      return processedData.filter((row) => {
        const d = new Date(row.date);
        return d.getFullYear() === refDate.getFullYear();
      });
    }

    if (selectedTimePeriod === "allTime") {
      return processedData; // no filter
    }

    return processedData; // fallback
  }, [processedData, currentDate, selectedTimePeriod]);

  // ───────────────────────────────
  // NEW: "Compare" Ranges (startDate, endDate) array
  // ───────────────────────────────
  const [compareRanges, setCompareRanges] = useState([]);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");

  // Add a new compare range
  const addCompareRange = () => {
    if (!tempStart || !tempEnd) {
      toast({
        title: "Invalid Range",
        description: "Please select both start and end dates for comparison.",
        status: "error",
      });
      return;
    }
    // Ensure start <= end
    if (new Date(tempStart) > new Date(tempEnd)) {
      toast({
        title: "Invalid Range",
        description: "Start date cannot be after End date.",
        status: "error",
      });
      return;
    }

    // Add it
    setCompareRanges((prev) => [
      ...prev,
      { start: tempStart, end: tempEnd, id: Date.now() },
    ]);
    setTempStart("");
    setTempEnd("");
    toast({
      title: "Added Comparison Range",
      description: `Range ${tempStart} to ${tempEnd}`,
      status: "success",
    });
  };

  // Remove a compare range
  const removeCompareRange = (id) => {
    setCompareRanges((prev) => prev.filter((r) => r.id !== id));
  };

  // Helper: filter data to a custom [start, end] range
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

  // ───────────────
  // Combine all "ranges" to produce multi-dataset for each chart
  // We'll treat the baseline time period as "Range 0", then each compare range as "Range 1, 2..."
  // ───────────────
  const allRangeDatasets = useMemo(() => {
    // Range 0 (baseline)
    const result = [
      {
        label: "Base Range", 
        data: getBaselineFilteredData,
      },
    ];
    // Then add compare ranges
    compareRanges.forEach((rng, idx) => {
      result.push({
        label: `Compare #${idx + 1}: ${rng.start} → ${rng.end}`,
        data: getDataForRange(rng.start, rng.end),
        id: rng.id,
      });
    });
    return result; // array of { label, data: [rows], id? }
  }, [getBaselineFilteredData, compareRanges]);

  // ───────────────────────────────────────────────────────
  // 1) Main Chart: day-by-day breakdown for the chosen metric
  //    grouped by category, but we do it for each "range" in allRangeDatasets
  // ───────────────────────────────────────────────────────
  const [selectedMetric, setSelectedMetric] = useState("createdAt");
  const [selectedChartType, setSelectedChartType] = useState("bar");

  const dailyBreakdownChartData = useMemo(() => {
    if (allRangeDatasets.length === 0) return null;

    // We gather all the dates from all ranges
    let allDatesSet = new Set();
    allRangeDatasets.forEach((rd) => {
      rd.data.forEach((row) => {
        allDatesSet.add(row.date);
      });
    });
    const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

    // We produce multiple datasets => for each Range, for each category
    // Typically, we group by category for one range, but now we have multiple ranges => we can combine them:
    // We'll create "Category (Range Label)" as separate dataset
    let allDatasets = [];
    // We will pick a consistent color palette or random
    const palette = [
      "#f72585",
      "#b5179e",
      "#7209b7",
      "#560bad",
      "#480ca8",
      "#3a0ca3",
      "#3f37c9",
      "#4361ee",
      "#4895ef",
      "#4cc9f0",
      "#FFB703",
      "#FB8500",
      "#8ECAE6",
      "#219EBC",
    ];
    let colorIndex = 0;

    allRangeDatasets.forEach((rangeObj, rangeIdx) => {
      // For each category
      fixedCategories.forEach((cat) => {
        // For each date in allDates, sum the chosen metric for that cat if it exists in rangeObj.data
        const dataArray = allDates.map((dt) => {
          const rows = rangeObj.data.filter(
            (r) => r.date === dt && r.category === cat
          );
          const sumVal = rows.reduce(
            (acc, r) => acc + (r[selectedMetric] || 0),
            0
          );
          return sumVal;
        });

        // color
        let color = palette[colorIndex % palette.length];
        colorIndex++;

        allDatasets.push({
          label: `${getSimplifiedCategoryName(cat)} (${rangeObj.label})`,
          data: dataArray,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        });
      });
    });

    return {
      labels: allDates,
      datasets: allDatasets,
    };
  }, [allRangeDatasets, fixedCategories, selectedMetric, getSimplifiedCategoryName]);

  // ───────────────────────────────────────────────────────
  // 2) Day-by-Day Totals (All Metrics Combined, no openPRs)
  //    We produce for each Range -> we combine all createdAt, mergedAt, sDev, sCodeReview, sQA, sUAT
  // ───────────────────────────────────────────────────────
  const dailyTotalsChartData = useMemo(() => {
    if (allRangeDatasets.length === 0) return null;

    // Collect all unique dates from all ranges
    let allDatesSet = new Set();
    allRangeDatasets.forEach((rd) => {
      rd.data.forEach((row) => {
        allDatesSet.add(row.date);
      });
    });
    const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

    // We'll have 1 dataset for each range, for each metric? Actually we want day-by-day totals for each metric -> typically we do a "grouped bar" with 6 metrics for each day. But now we have multiple ranges...
    // Easiest approach: We'll produce multiple "groups" for each range. 
    // So for each range, we produce 6 sub-datasets (one per metric).
    // We'll label them "Created At (Base Range)", "Created At (Compare#1)", etc.

    // The 6 metrics we want for the day-by-day totals:
    const totalMetrics = [
      { key: "createdAt", label: "Created At" },
      { key: "mergedAt", label: "Merged At" },
      { key: "sDevelopment", label: "S_DEVELOPMENT" },
      { key: "sCodeReview", label: "S_CODE_REVIEW" },
      { key: "sQA", label: "S_QA" },
      { key: "sUAT", label: "S_UAT" },
    ];

    let allDatasets = [];
    const palette = [
      "#F94144",
      "#F3722C",
      "#F8961E",
      "#F9C74F",
      "#90BE6D",
      "#43AA8B",
      "#577590",
      "#4cc9f0",
      "#7209b7",
      "#D00000",
      "#FFB703",
      "#4361ee",
      "#8ECAE6",
    ];
    let colorIndex = 0;

    allRangeDatasets.forEach((rangeObj) => {
      // We'll produce 6 sub-datasets for each range
      totalMetrics.forEach((mt) => {
        const dataArr = allDates.map((dt) => {
          // sum that metric for dt across all categories in this range
          const rows = rangeObj.data.filter((r) => r.date === dt);
          const sumVal = rows.reduce((acc, r) => acc + (r[mt.key] || 0), 0);
          return sumVal;
        });
        let color = palette[colorIndex % palette.length];
        colorIndex++;
        allDatasets.push({
          label: `${mt.label} (${rangeObj.label})`,
          data: dataArr,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        });
      });
    });

    return {
      labels: allDates,
      datasets: allDatasets,
    };
  }, [allRangeDatasets]);

  // ───────────────────────────────────────────────────────
  // 3) Category-Specific Day-by-Day Chart:
  //    (CreatedAt, MergedAt, sDevelopment, sCodeReview, sQA, sUAT)
  //    for each range
  // ───────────────────────────────────────────────────────
  const [selectedCategoryForSChart, setSelectedCategoryForSChart] = useState("");

  const catDayMetrics = [
    { key: "createdAt", label: "Created At" },
    { key: "mergedAt", label: "Merged At" },
    { key: "sDevelopment", label: "S_DEVELOPMENT" },
    { key: "sCodeReview", label: "S_CODE_REVIEW" },
    { key: "sQA", label: "S_QA" },
    { key: "sUAT", label: "S_UAT" },
  ];

  const categorySChartData = useMemo(() => {
    if (!selectedCategoryForSChart || allRangeDatasets.length === 0) return null;

    // gather all relevant dates from all ranges
    let allDatesSet = new Set();
    allRangeDatasets.forEach((rd) => {
      rd.data.forEach((row) => {
        if (row.category === selectedCategoryForSChart) {
          allDatesSet.add(row.date);
        }
      });
    });
    const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

    // We'll produce a dataset for each range * each catDayMetric
    // or simpler approach: we do "one dataset per metric for each range"? Actually that might be huge. 
    // Let's do 1 dataset per metric, labeled "Metric (Range #)" → but we have multiple ranges, so for each range we add one dataset. Actually, that means # of datasets = #metrics * #ranges. That is big but consistent.

    let allDatasets = [];
    const palette = [
      "#F94144",
      "#F3722C",
      "#F8961E",
      "#F9C74F",
      "#90BE6D",
      "#43AA8B",
      "#577590",
      "#7209b7",
      "#4cc9f0",
      "#FFB703",
      "#B5179E",
    ];
    let colorIndex = 0;

    allRangeDatasets.forEach((rangeObj, rangeI) => {
      catDayMetrics.forEach((mt) => {
        const dataArr = allDates.map((dt) => {
          const rows = rangeObj.data.filter(
            (r) => r.date === dt && r.category === selectedCategoryForSChart
          );
          const sumVal = rows.reduce((acc, cur) => acc + (cur[mt.key] || 0), 0);
          return sumVal;
        });
        let color = palette[colorIndex % palette.length];
        colorIndex++;
        allDatasets.push({
          label: `${mt.label} (${rangeObj.label})`,
          data: dataArr,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        });
      });
    });

    return {
      labels: allDates,
      datasets: allDatasets,
    };
  }, [selectedCategoryForSChart, allRangeDatasets]);

  // ───────────────
  // Chart styling
  // ───────────────
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.3)" },
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255,255,255,0.3)" },
      },
    },
    plugins: {
      legend: { labels: { color: "white" } },
    },
  };

  // ───────────────
  // Table logic (Totals row)
  // ───────────────
  const [detailedCategory, setDetailedCategory] = useState(null);
  const handleRowDoubleClick = (category) => {
    setDetailedCategory(category);
  };
  const closeDetailedView = () => {
    setDetailedCategory(null);
  };

  return (
    <Box minH="100vh" bg="black" color="white" p={4}>
      {/* PIN Authentication Overlay (Optional) */}
      {!isAuthorized && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="rgba(0,0,0,0.8)"
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
                  isDisabled={
                    !currentDate ||
                    sortedDates.indexOf(currentDate) === sortedDates.length - 1
                  }
                  colorScheme="gray"
                />
                {/* POPUP CALENDAR for single date */}
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <IconButton
                      aria-label="Select Date"
                      icon={<FaCalendar />}
                      bg="gray.700"
                      _hover={{ bg: "gray.600" }}
                      color="white"
                    />
                  </PopoverTrigger>
                  <PopoverContent bg="black" borderColor="whiteAlpha.300" color="white">
                    <PopoverArrow bg="black" />
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
                        bg="gray.700"
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

              {/* Time Period Dropdown & Compare Ranges */}
              <Flex mb={6} gap={4} flexWrap="wrap" alignItems="center">
                <Select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  bg="gray.700"
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

                {/* Compare Ranges Popover */}
                <Popover placement="bottom">
                  <PopoverTrigger>
                    <Button leftIcon={<FaPlus />} colorScheme="pink">
                      Compare
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent bg="black" borderColor="whiteAlpha.300" color="white">
                    <PopoverArrow bg="black" />
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
                          bg="gray.700"
                          color="white"
                          borderColor="whiteAlpha.300"
                        />
                        <Text fontSize="sm">End Date</Text>
                        <Input
                          type="date"
                          value={tempEnd}
                          onChange={(e) => setTempEnd(e.target.value)}
                          bg="gray.700"
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

                {/* Show existing compare ranges */}
                {compareRanges.length > 0 && (
                  <Flex flexWrap="wrap" gap={2}>
                    {compareRanges.map((rng, i) => (
                      <Flex
                        key={rng.id}
                        bg="gray.700"
                        px={2}
                        py={1}
                        alignItems="center"
                        borderRadius="md"
                      >
                        <Text fontSize="sm" mr={2}>
                          {`#${i + 1}: ${rng.start} → ${rng.end}`}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => removeCompareRange(rng.id)}
                        >
                          X
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Flex>

              {/* Chart Metric & Type Selection (bar/line only) */}
              <Flex mb={6} gap={4} flexWrap="wrap">
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  bg="gray.700"
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

                <Select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor="whiteAlpha.300"
                  maxW="200px"
                >
                  <option style={{ color: "black" }} value="bar">
                    Bar Chart
                  </option>
                  <option style={{ color: "black" }} value="line">
                    Line Chart
                  </option>
                  {/* Pie & Doughnut removed */}
                </Select>
              </Flex>

              {/* 1) MAIN Chart: Day-by-Day for single chosen metric, grouped by category, multi-range */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Day-by-Day Chart for <em>{selectedMetric}</em> (by Category, All Ranges)
              </Text>
              <Box
                mb={6}
                border="1px solid white"
                borderRadius="md"
                p={2}
                width="100%"
                minH="400px"
                height="400px"
              >
                {dailyBreakdownChartData && dailyBreakdownChartData.labels.length > 0 ? (
                  selectedChartType === "bar" ? (
                    <Bar data={dailyBreakdownChartData} options={chartOptions} />
                  ) : (
                    <Line data={dailyBreakdownChartData} options={chartOptions} />
                  )
                ) : (
                  <Text>No data for this selection.</Text>
                )}
              </Box>

              {/* 2) Day-by-Day Totals (All Metrics Combined, no openPRs), multi-range */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Day-by-Day Totals (All Metrics Combined, All Ranges)
              </Text>
              <Box
                mb={6}
                border="1px solid white"
                borderRadius="md"
                p={2}
                width="100%"
                minH="400px"
                height="400px"
              >
                {dailyTotalsChartData && dailyTotalsChartData.labels.length > 0 ? (
                  <Bar data={dailyTotalsChartData} options={chartOptions} />
                ) : (
                  <Text>No data for this selection.</Text>
                )}
              </Box>

              {/* 3) Category-Specific Day-by-Day Chart (CreatedAt, MergedAt, S_..., multi-range) */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Category-Specific Totals Over Time (CreatedAt, MergedAt, QA, etc.)
              </Text>
              <Flex mb={4} gap={4} alignItems="center">
                <Select
                  placeholder="Select Category"
                  value={selectedCategoryForSChart}
                  onChange={(e) => setSelectedCategoryForSChart(e.target.value)}
                  bg="gray.700"
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
              <Box
                mb={6}
                border="1px solid white"
                borderRadius="md"
                p={2}
                width="100%"
                minH="400px"
                height="400px"
              >
                {categorySChartData && categorySChartData.labels.length > 0 ? (
                  <Bar data={categorySChartData} options={chartOptions} />
                ) : (
                  <Text>Please select a category above.</Text>
                )}
              </Box>

              {/* Table: Category Totals for Selected Time Period (with total row) */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Table: Category Totals for Selected Time Period
              </Text>
              <Box overflowX="auto" mb={6}>
                <Table
                  bg="linear-gradient(90deg, #000000, #7800ff)"
                  color="white"
                  border="2px solid #FFFFFF"
                  borderRadius="12px"
                  boxShadow="0 0 20px rgba(255, 255, 255, 0.4)"
                  overflow="hidden"
                  sx={{
                    borderCollapse: "collapse",
                    "th, td": {
                      background: "transparent",
                      borderColor: "whiteAlpha.300",
                    },
                    "thead tr": {
                      background: "transparent",
                    },
                    "tbody tr:hover": {
                      background: "transparent",
                      transform: "none",
                    },
                  }}
                  size="md"
                >
                  <Thead>
                    <Tr>
                      <Th color="white">Category</Th>
                      <Th isNumeric color="white">
                        Created At
                      </Th>
                      <Th isNumeric color="white">
                        Open PRs
                      </Th>
                      <Th isNumeric color="white">
                        Merged At
                      </Th>
                      <Th isNumeric color="white">
                        S_DEVELOPMENT
                      </Th>
                      <Th isNumeric color="white">
                        S_CODE_REVIEW
                      </Th>
                      <Th isNumeric color="white">
                        S_QA
                      </Th>
                      <Th isNumeric color="white">
                        S_UAT
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(() => {
                      // We'll accumulate a grand total
                      const grandTotals = {
                        createdAt: 0,
                        openPRs: 0,
                        mergedAt: 0,
                        sDevelopment: 0,
                        sCodeReview: 0,
                        sQA: 0,
                        sUAT: 0,
                      };

                      // The baseline data only for this table
                      const baselineRows = getBaselineFilteredData;

                      const rowsForRender = fixedCategories.map((cat) => {
                        const rows = baselineRows.filter(
                          (row) => row.category === cat
                        );
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
                          {
                            createdAt: 0,
                            openPRs: 0,
                            mergedAt: 0,
                            sDevelopment: 0,
                            sCodeReview: 0,
                            sQA: 0,
                            sUAT: 0,
                          }
                        );

                        // accumulate into grandTotals
                        grandTotals.createdAt += sums.createdAt;
                        grandTotals.openPRs += sums.openPRs;
                        grandTotals.mergedAt += sums.mergedAt;
                        grandTotals.sDevelopment += sums.sDevelopment;
                        grandTotals.sCodeReview += sums.sCodeReview;
                        grandTotals.sQA += sums.sQA;
                        grandTotals.sUAT += sums.sUAT;

                        return (
                          <Tr
                            key={cat}
                            onDoubleClick={() => handleRowDoubleClick(cat)}
                            _hover={{ cursor: "pointer" }}
                          >
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
                          {/* Totals row */}
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

              {/* Detailed Category View (double-click), with total row */}
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
                      boxShadow="0 0 20px rgba(255, 255, 255, 0.4)"
                      overflow="hidden"
                      sx={{
                        borderCollapse: "collapse",
                        "th, td": {
                          background: "transparent",
                          borderColor: "whiteAlpha.300",
                        },
                        "thead tr": {
                          background: "transparent",
                        },
                        "tbody tr:hover": {
                          background: "transparent",
                          transform: "none",
                        },
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
                          let totals = {
                            createdAt: 0,
                            openPRs: 0,
                            mergedAt: 0,
                            sDevelopment: 0,
                            sCodeReview: 0,
                            sQA: 0,
                            sUAT: 0,
                          };
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

export default GitRepo;
