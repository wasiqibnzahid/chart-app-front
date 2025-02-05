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
import { FaArrowLeft, FaArrowRight, FaCalendar } from "react-icons/fa";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
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
  // CSV Data Fetching and Processing
  // ───────────────
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Make sure this URL is correct for your sheet
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

  // Process CSV rows -> numeric fields
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

  // ───────────────────────────
  // TOTALS OVER TIME (All Cats)
  // ───────────────────────────
  // For each date, sum metrics across all categories
  const totalOverTime = useMemo(() => {
    if (!processedData.length) return [];

    // Unique dates, ascending
    const uniqueDates = Array.from(
      new Set(processedData.map((row) => row.date))
    ).sort((a, b) => new Date(a) - new Date(b));

    return uniqueDates.map((date) => {
      const rowsForDate = processedData.filter((row) => row.date === date);
      const sums = rowsForDate.reduce(
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
      return { date, ...sums };
    });
  }, [processedData]);

  // Optional: Just for debugging in console
  useEffect(() => {
    console.log("Totals Over Time:", totalOverTime);
  }, [totalOverTime]);

  // ───────────────
  // Unique, sorted dates
  // ───────────────
  const sortedDates = useMemo(() => {
    const datesSet = new Set(processedData.map((row) => row.date));
    const datesArray = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
    return datesArray;
  }, [processedData]);

  // ───────────────
  // Date Navigation & Selection
  // ───────────────
  const [selectedDate, setSelectedDate] = useState(null);
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
  // Category names
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
  // Time Period Selection
  // ───────────────
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("currentDay");

  const filteredData = useMemo(() => {
    if (!currentDate) return [];
    switch (selectedTimePeriod) {
      case "currentDay":
        return processedData.filter((row) => row.date === currentDate);
      case "currentWeek": {
        const refDate = new Date(currentDate);
        const startOfWeek = new Date(refDate);
        startOfWeek.setDate(refDate.getDate() - refDate.getDay());
        const endOfWeek = new Date(refDate);
        endOfWeek.setDate(refDate.getDate() - refDate.getDay() + 6);
        return processedData.filter((row) => {
          const d = new Date(row.date);
          return d >= startOfWeek && d <= endOfWeek;
        });
      }
      case "currentMonth": {
        const refDate = new Date(currentDate);
        return processedData.filter((row) => {
          const d = new Date(row.date);
          return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
        });
      }
      case "currentYear": {
        const refDate = new Date(currentDate);
        return processedData.filter((row) => {
          const d = new Date(row.date);
          return d.getFullYear() === refDate.getFullYear();
        });
      }
      case "allTime":
        return processedData;
      default:
        return processedData;
    }
  }, [selectedTimePeriod, processedData, currentDate]);

  // ───────────────
  // Single Chart (Right)
  // ───────────────
  const metrics = [
    { key: "createdAt", label: "Created At" },
    { key: "openPRs", label: "Open PRs" },
    { key: "mergedAt", label: "Merged At" },
    { key: "sDevelopment", label: "S_DEVELOPMENT" },
    { key: "sCodeReview", label: "S_CODE_REVIEW" },
    { key: "sQA", label: "S_QA" },
    { key: "sUAT", label: "S_UAT" },
  ];

  const [selectedMetric, setSelectedMetric] = useState("createdAt");
  const [selectedChartType, setSelectedChartType] = useState("bar");

  // bar: sum metric by category
  const barChartDataForMetric = (metricKey) => {
    const dataValues = fixedCategories.map((cat) =>
      filteredData.filter((row) => row.category === cat).reduce((acc, row) => acc + row[metricKey], 0)
    );
    const metricLabel = metrics.find((m) => m.key === metricKey)?.label || metricKey;
    return {
      labels: fixedCategories.map((cat) => getSimplifiedCategoryName(cat)),
      datasets: [
        {
          label: metricLabel,
          data: dataValues,
          backgroundColor: "rgba(75,192,192,0.6)",
        },
      ],
    };
  };

  // line: sum metric by date + category
  const lineChartDataForMetric = (metricKey) => {
    const uniqueDates = Array.from(new Set(filteredData.map((row) => row.date))).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const datasets = fixedCategories.map((cat) => {
      const data = uniqueDates.map((date) =>
        filteredData
          .filter((row) => row.date === date && row.category === cat)
          .reduce((acc, row) => acc + row[metricKey], 0)
      );
      const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      return {
        label: getSimplifiedCategoryName(cat),
        data,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.1,
      };
    });
    return {
      labels: uniqueDates,
      datasets,
    };
  };

  // pie/doughnut: sum metric by category
  const pieChartDataForMetric = (metricKey) => {
    const dataValues = fixedCategories.map((cat) =>
      filteredData.filter((row) => row.category === cat).reduce((acc, row) => acc + row[metricKey], 0)
    );
    const backgroundColors = fixedCategories.map(
      () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    );
    return {
      labels: fixedCategories.map((cat) => getSimplifiedCategoryName(cat)),
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
        },
      ],
    };
  };

  // pick the correct chart data
  const chartData = useMemo(() => {
    if (!filteredData.length) return null;
    if (selectedChartType === "bar") {
      return barChartDataForMetric(selectedMetric);
    } else if (selectedChartType === "line") {
      return lineChartDataForMetric(selectedMetric);
    } else if (selectedChartType === "pie" || selectedChartType === "doughnut") {
      return pieChartDataForMetric(selectedMetric);
    }
    return null;
  }, [selectedMetric, selectedChartType, filteredData]);

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
  }[selectedChartType];

  // ──────────────────────────────────────────────
  // Left Chart: sum of ALL metrics (Totals)
  // ──────────────────────────────────────────────
  const statusTotals = useMemo(() => {
    let sums = {
      createdAt: 0,
      openPRs: 0,
      mergedAt: 0,
      sDev: 0,
      sCodeReview: 0,
      sQA: 0,
      sUAT: 0,
    };
    for (const row of filteredData) {
      sums.createdAt += row.createdAt;
      sums.openPRs += row.openPRs;
      sums.mergedAt += row.mergedAt;
      sums.sDev += row.sDevelopment;
      sums.sCodeReview += row.sCodeReview;
      sums.sQA += row.sQA;
      sums.sUAT += row.sUAT;
    }
    return sums;
  }, [filteredData]);

  const statusTotalsChartData = useMemo(() => {
    return {
      labels: [
        "Created At",
        "Open PRs",
        "Merged At",
        "S_DEVELOPMENT",
        "S_CODE_REVIEW",
        "S_QA",
        "S_UAT",
      ],
      datasets: [
        {
          label: "Totals",
          data: [
            statusTotals.createdAt,
            statusTotals.openPRs,
            statusTotals.mergedAt,
            statusTotals.sDev,
            statusTotals.sCodeReview,
            statusTotals.sQA,
            statusTotals.sUAT,
          ],
          backgroundColor: [
            "#F94144",
            "#F3722C",
            "#F8961E",
            "#F9C74F",
            "#90BE6D",
            "#43AA8B",
            "#577590",
          ],
        },
      ],
    };
  }, [statusTotals]);

  // ─────────────────────────────────────────
  // "Over Time" line chart: pick single metric
  // ─────────────────────────────────────────
  const [selectedOverTimeMetric, setSelectedOverTimeMetric] = useState("openPRs");

  // Build chart data from totalOverTime for the chosen metric
  const overTimeChartData = useMemo(() => {
    if (!totalOverTime.length) return null;

    const labels = totalOverTime.map((item) => item.date);
    const dataValues = totalOverTime.map(
      (item) => item[selectedOverTimeMetric] || 0
    );

    return {
      labels,
      datasets: [
        {
          label: selectedOverTimeMetric,
          data: dataValues,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          fill: false,
          tension: 0.1,
        },
      ],
    };
  }, [totalOverTime, selectedOverTimeMetric]);

  // Chart styling for all charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: "white" } },
      y: { ticks: { color: "white" } },
    },
    plugins: {
      legend: { labels: { color: "white" } },
    },
  };

  // ───────────────
  // Double-Click => Detailed Category
  // ───────────────
  const [detailedCategory, setDetailedCategory] = useState(null);

  const handleRowDoubleClick = (category) => {
    setDetailedCategory(category);
  };

  const closeDetailedView = () => {
    setDetailedCategory(null);
  };

  // ───────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────
  return (
    <Box minH="100vh" bg="linear-gradient(90deg, #000000, #7800ff)" color="white" p={4}>
      {/* PIN Authentication Overlay */}
      {!isAuthorized && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.8)"
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

      {/* Main Dashboard */}
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
                {/* POPUP CALENDAR ICON */}
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

              {/* Time Period Dropdown */}
              <Flex mb={6} gap={4} flexWrap="wrap">
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
                  {/* "All Time Average" styled */}
                  <option
                    style={{
                      color: "white",
                      background: "linear-gradient(90deg, #000000, #7800ff)",
                    }}
                    value="allTime"
                  >
                    All Time Average
                  </option>
                </Select>
              </Flex>

              {/* Chart Selection Dropdowns */}
              <Flex mb={6} gap={4} flexWrap="wrap">
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor="whiteAlpha.300"
                  maxW="200px"
                >
                  {metrics.map((metric) => {
                    // highlight sDevelopment with gradient
                    const specialStyle =
                      metric.key === "sDevelopment"
                        ? {
                            color: "white",
                            background: "linear-gradient(90deg, #000000, #7800ff)",
                          }
                        : { color: "black" };

                    return (
                      <option key={metric.key} value={metric.key} style={specialStyle}>
                        {metric.label}
                      </option>
                    );
                  })}
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
                  {/* "Pie Chart" with gradient */}
                  <option
                    style={{
                      color: "white",
                      background: "linear-gradient(90deg, #000000, #7800ff)",
                    }}
                    value="pie"
                  >
                    Pie Chart
                  </option>
                  <option style={{ color: "black" }} value="doughnut">
                    Doughnut Chart
                  </option>
                </Select>
              </Flex>

              {/* TWO CHARTS SIDE BY SIDE */}
              <Flex mb={6} gap={4} flexWrap="wrap">
                {/* LEFT: Totals (ALL metrics) */}
                <Box
                  flex="1"
                  minW="300px"
                  height="400px"
                  border="1px solid white"
                  p={2}
                >
                  <Bar data={statusTotalsChartData} options={chartOptions} />
                </Box>

                {/* RIGHT: The user-selectable chart */}
                {chartData && ChartComponent && filteredData.length > 0 && (
                  <Box
                    flex="1"
                    minW="300px"
                    height="400px"
                    border="1px solid white"
                    p={2}
                  >
                    <ChartComponent data={chartData} options={chartOptions} />
                  </Box>
                )}
              </Flex>

              {/* NEW Over Time Section */}
              <Text fontSize="xl" mb={2} fontWeight="bold">
                Track a Single Metric Over Time (All Categories)
              </Text>
              <Flex mb={4} gap={4} flexWrap="wrap">
                <Select
                  value={selectedOverTimeMetric}
                  onChange={(e) => setSelectedOverTimeMetric(e.target.value)}
                  bg="linear-gradient(90deg, #000000, #7800ff)"
                  color="white"
                  borderColor="whiteAlpha.300"
                  maxW="200px"
                >
                  <option value="openPRs">Open PRs</option>
                  <option value="sQA">S_QA</option>
                  <option value="createdAt">Created At</option>
                  <option value="mergedAt">Merged At</option>
                  <option value="sDevelopment">S_DEVELOPMENT</option>
                  <option value="sCodeReview">S_CODE_REVIEW</option>
                  <option value="sUAT">S_UAT</option>
                </Select>
              </Flex>

              {overTimeChartData && (
                <Box
                  mb={8}
                  border="1px solid white"
                  borderRadius="md"
                  p={2}
                  width="100%"
                  height="400px"
                >
                  <Line data={overTimeChartData} options={chartOptions} />
                </Box>
              )}

              {/* Data Table (Totals by Category) */}
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
                      <Th isNumeric color="white">Created At (total)</Th>
                      <Th isNumeric color="white">Open PRs (total)</Th>
                      <Th isNumeric color="white">Merged At (total)</Th>
                      <Th isNumeric color="white">S_DEVELOPMENT (total)</Th>
                      <Th isNumeric color="white">S_CODE_REVIEW (total)</Th>
                      <Th isNumeric color="white">S_QA (total)</Th>
                      <Th isNumeric color="white">S_UAT (total)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {fixedCategories.map((cat) => {
                      const rows = filteredData.filter((row) => row.category === cat);
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
                      return (
                        <Tr
                          key={cat}
                          onDoubleClick={() => handleRowDoubleClick(cat)}
                          _hover={{ cursor: "pointer" }}
                        >
                          <Td color="white">{getSimplifiedCategoryName(cat)}</Td>
                          <Td isNumeric color="white">{sums.createdAt}</Td>
                          <Td isNumeric color="white">{sums.openPRs}</Td>
                          <Td isNumeric color="white">{sums.mergedAt}</Td>
                          <Td isNumeric color="white">{sums.sDevelopment}</Td>
                          <Td isNumeric color="white">{sums.sCodeReview}</Td>
                          <Td isNumeric color="white">{sums.sQA}</Td>
                          <Td isNumeric color="white">{sums.sUAT}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              {/* Detailed View: Historical Data for Double-Clicked Category */}
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
                        {filteredData
                          .filter((row) => row.category === detailedCategory)
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((row, idx) => (
                            <Tr key={idx}>
                              <Td color="white">{row.date}</Td>
                              <Td isNumeric color="white">{row.createdAt}</Td>
                              <Td isNumeric color="white">{row.openPRs}</Td>
                              <Td isNumeric color="white">{row.mergedAt}</Td>
                              <Td isNumeric color="white">{row.sDevelopment}</Td>
                              <Td isNumeric color="white">{row.sCodeReview}</Td>
                              <Td isNumeric color="white">{row.sQA}</Td>
                              <Td isNumeric color="white">{row.sUAT}</Td>
                            </Tr>
                          ))}
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
