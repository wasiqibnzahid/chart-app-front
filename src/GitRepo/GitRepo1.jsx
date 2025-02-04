// src/GitRepo/GitRepo1.jsx

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
import { Bar, Line, Pie } from "react-chartjs-2";
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

  // Process CSV rows into usable objects
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

  // Get unique, sorted dates from the CSV data
  const sortedDates = useMemo(() => {
    const datesSet = new Set(processedData.map((row) => row.date));
    const datesArray = Array.from(datesSet);
    datesArray.sort((a, b) => new Date(a) - new Date(b));
    return datesArray;
  }, [processedData]);

  // ───────────────
  // Date Navigation and Selection
  // ───────────────
  const [selectedDate, setSelectedDate] = useState(null);
  const currentDate =
    selectedDate || (sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null);

  const navigateDate = (direction) => {
    if (!currentDate) return;
    const index = sortedDates.indexOf(currentDate);
    if (direction === "left" && index > 0) {
      const newDate = sortedDates[index - 1];
      setSelectedDate(newDate);
      toast({
        title: "Date Changed",
        description: `Viewing data for ${newDate}`,
        status: "success",
      });
    } else if (direction === "right" && index < sortedDates.length - 1) {
      const newDate = sortedDates[index + 1];
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
    toast({ title: "Date Reset", description: "Viewing latest date", status: "info" });
  };

  // ───────────────
  // Category Mapping and Fixed Categories
  // ───────────────
  const categoryNameMapping = {
    "P_ENTRETENIMIENTO": "ent",
    "P_AZTECA_NOTICIAS": "noticias",
    "P_AZTECA_DEPORTES": "deportes",
    "P_ADN40": "adn40",
    "P_REVISTA_CENTRAL": "RC",
    "P_LOCALES": "locales",
    "P_ADOPS": "adops",
    "P_SEO": "seo",
    "P_DATA": "data",
    "P_SUPER_APP": "baz",
  };

  const getSimplifiedCategoryName = (category) => {
    return categoryNameMapping[category] || category;
  };

  // List each expected category only once
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

  const metrics = [
    { key: "createdAt", label: "Created At" },
    { key: "openPRs", label: "Open PRs" },
    { key: "mergedAt", label: "Merged At" },
    { key: "sDevelopment", label: "S_DEVELOPMENT" },
    { key: "sCodeReview", label: "S_CODE_REVIEW" },
    { key: "sQA", label: "S_QA" },
    { key: "sUAT", label: "S_UAT" },
  ];

  // ───────────────
  // Time Period Dropdown and Filtered Data
  // ───────────────
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("currentDay");

  const filteredData = useMemo(() => {
    switch (selectedTimePeriod) {
      case "currentDay":
        return processedData.filter((row) => row.date === currentDate);
      case "currentWeek": {
        const refDate = currentDate ? new Date(currentDate) : new Date();
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
        const refDate = currentDate ? new Date(currentDate) : new Date();
        return processedData.filter((row) => {
          const d = new Date(row.date);
          return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
        });
      }
      case "currentYear": {
        const refDate = currentDate ? new Date(currentDate) : new Date();
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
  // Chart Data Generators
  // ───────────────

  // Bar Chart: aggregates data by category
  const barChartDataForMetric = (metricKey) => {
    const dataValues = fixedCategories.map((cat) =>
      filteredData
        .filter((row) => row.category === cat)
        .reduce((acc, row) => acc + row[metricKey], 0)
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

  // Line Chart: group data by unique dates for each category
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
      // Use a random color for each dataset
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

  // Pie Chart: aggregate the metric per category for a single view
  const pieChartDataForMetric = (metricKey) => {
    const dataValues = fixedCategories.map((cat) =>
      filteredData
        .filter((row) => row.category === cat)
        .reduce((acc, row) => acc + row[metricKey], 0)
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

  const [selectedMetric, setSelectedMetric] = useState("createdAt");
  const [selectedChartType, setSelectedChartType] = useState("bar");

  const chartData = useMemo(() => {
    if (selectedChartType === "bar")
      return barChartDataForMetric(selectedMetric);
    else if (selectedChartType === "line")
      return lineChartDataForMetric(selectedMetric);
    else if (selectedChartType === "pie")
      return pieChartDataForMetric(selectedMetric);
    else return null;
  }, [selectedMetric, selectedChartType, filteredData]);

  // Choose the proper chart component from react-chartjs-2
  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
  }[selectedChartType];

  // ───────────────
  // Render
  // ───────────────
  return (
    <>
      {/* PIN Authentication Overlay */}
      {!isAuthorized && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="gray.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          zIndex={1000}
        >
          <form onSubmit={handlePinSubmit}>
            <VStack spacing={4}>
              <Text fontSize="xl">Enter PIN to Access Dashboard</Text>
              <Input
                ref={pinInputRef}
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                width="300px"
                textAlign="center"
                required
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
        <Box p={4} maxW="1200px" mx="auto">
          <Text fontSize="2xl" mb={4}>
            Dashboard – CSV Metrics
          </Text>
          {isLoading ? (
            <Text>Loading data...</Text>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <>
              {/* Date Navigation */}
              <Flex alignItems="center" mb={4}>
                <IconButton
                  aria-label="Previous Date"
                  icon={<FaArrowLeft />}
                  onClick={() => navigateDate("left")}
                  isDisabled={!currentDate || sortedDates.indexOf(currentDate) === 0}
                  mr={2}
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
                  ml={2}
                />
                <Popover>
                  <PopoverTrigger>
                    <IconButton
                      aria-label="Select Date"
                      icon={<FaCalendar color="black" />}
                      ml={4}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Select a Date</PopoverHeader>
                    <PopoverBody>
                      <Input
                        type="date"
                        value={selectedDate || ""}
                        onChange={handleDateChange}
                        min={sortedDates[0]}
                        max={sortedDates[sortedDates.length - 1]}
                      />
                      {selectedDate && (
                        <Button mt={2} size="sm" onClick={resetSelectedDate}>
                          Clear
                        </Button>
                      )}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Flex>

              {/* Time Period Dropdown */}
              <Flex mb={6} gap={4}>
                <Select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  color="white"
                  bg="gray.700"
                >
                  <option value="currentDay">Current Day</option>
                  <option value="currentWeek">Current Week</option>
                  <option value="currentMonth">Current Month</option>
                  <option value="currentYear">Current Year</option>
                  <option value="allTime">All Time Average</option>
                </Select>
              </Flex>

              {/* Chart Selection Dropdowns */}
              <Flex mb={6} gap={4}>
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  color="white"
                  bg="gray.700"
                >
                  {metrics.map((metric) => (
                    <option key={metric.key} value={metric.key}>
                      {metric.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  color="white"
                  bg="gray.700"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </Select>
              </Flex>

              {/* Render Selected Chart */}
              {chartData && (
                <Box mb={6} height="400px">
                  <ChartComponent
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { ticks: { color: "white" } },
                        y: { ticks: { color: "white" } },
                      },
                      plugins: {
                        legend: { labels: { color: "white" } },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Data Table (Aggregated by Category) */}
              <Box overflowX="auto" mb={6}>
                <Table variant="simple">
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
                    {fixedCategories.map((cat, idx) => {
                      const rows = filteredData.filter((row) => row.category === cat);
                      const aggregated = rows.reduce(
                        (acc, row) => ({
                          createdAt: acc.createdAt + row.createdAt,
                          openPRs: acc.openPRs + row.openPRs,
                          mergedAt: acc.mergedAt + row.mergedAt,
                          sDevelopment: acc.sDevelopment + row.sDevelopment,
                          sCodeReview: acc.sCodeReview + row.sCodeReview,
                          sQA: acc.sQA + row.sQA,
                          sUAT: acc.sUAT + row.sUAT,
                        }),
                        { createdAt: 0, openPRs: 0, mergedAt: 0, sDevelopment: 0, sCodeReview: 0, sQA: 0, sUAT: 0 }
                      );
                      return (
                        <Tr key={idx}>
                          <Td color="white">{getSimplifiedCategoryName(cat)}</Td>
                          <Td isNumeric color="white">{aggregated.createdAt}</Td>
                          <Td isNumeric color="white">{aggregated.openPRs}</Td>
                          <Td isNumeric color="white">{aggregated.mergedAt}</Td>
                          <Td isNumeric color="white">{aggregated.sDevelopment}</Td>
                          <Td isNumeric color="white">{aggregated.sCodeReview}</Td>
                          <Td isNumeric color="white">{aggregated.sQA}</Td>
                          <Td isNumeric color="white">{aggregated.sUAT}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default GitRepo;
