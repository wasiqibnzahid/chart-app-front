// PerformanceMapLocal.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Text,
    Flex,
    Spinner,
    Select,
    Grid,
    useToast,
    VStack,
    HStack,
    Checkbox,
    CheckboxGroup,
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
} from "@chakra-ui/react";
import Papa from "papaparse";
import { FaFilter, FaExpand } from "react-icons/fa";
// Import Plotly component
import Plot from "react-plotly.js";
// Helper function to parse "YYYY-MM-DD" to Date object
const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0); // Return epoch if dateStr is falsy
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
};
// Helper function to format "YYYY-MM-DD" to "MMM DD, YYYY" (e.g., "Jun 16, 2024")
const formatDateRange = (start, end) => {
    if (!start || !end) return "N/A";
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return `${startDate.toLocaleDateString(undefined, options)} -
${endDate.toLocaleDateString(
        undefined,
        options
    )}`;
};
// Helper function to format numbers: display without decimals if integer, else with one decimal
const formatNumber = (numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
};
// Define the company to URL mapping
const COMPANY_URLS = {
    QuintanaRoo: "https://www.aztecaquintanaroo.com",
    Bajio: "https://www.aztecabajio.com",
    CiudadJuarez: "https://www.aztecaciudadjuarez.com",
    Yucatan: "https://www.aztecayucatan.com",
    Jalisco: "https://www.aztecajalisco.com",
    Puebla: "https://www.aztecapuebla.com",
    Veracruz: "https://www.aztecaveracruz.com",
    BajaCalifornia: "https://www.tvaztecabajacalifornia.com",
    Morelos: "https://www.aztecamorelos.com",
    Guerrero: "https://www.aztecaguerrero.com",
    Chiapas: "https://www.aztecachiapas.com",
    Sinaloa: "https://www.aztecasinaloa.com",
    Aguascalientes: "https://www.aztecaaguascalientes.com",
    Queretaro: "https://www.aztecaqueretaro.com",
    Chihuahua: "https://www.aztecachihuahua.com",
    Laguna: "https://www.aztecalaguna.com",
};
// Define the groups and their member companies by name
const GROUPS = {
    "Local": [
        "QuintanaRoo",
        "Bajio",
        "CiudadJuarez",
        "Yucatan",
        "Jalisco",
        "Puebla",
        "Veracruz",
        "BajaCalifornia",
        "Morelos",
        "Guerrero",
        "Chiapas",
        "Sinaloa",
        "Aguascalientes",
        "Queretaro",
        "Chihuahua",
        "Laguna",
    ]
};
// Extract group names and individual companies
const GROUP_NAMES = Object.keys(GROUPS);
const INDIVIDUAL_COMPANIES = ["", ...Object.values(GROUPS).flat()];
// Define the metrics to display
const METRICS = ["LCP", "CLS", "INP", "FCP", "TTFB"];
// Define units for each metric
const METRIC_UNITS = {
    LCP: "ms",
    CLS: "",
    INP: "ms",
    FCP: "ms",
    TTFB: "ms",
};
// Define the directionality of each metric: "low" means lower is better, "high" means higher is better
const METRIC_GOOD_DIRECTION = {
    LCP: "low",
    CLS: "low",
    INP: "low",
    FCP: "low",
    TTFB: "low",
};
// Thresholds for performance metrics as specified
const THRESHOLDS = {
    FCP: {
        good: 1800,
        needsImprovement: 3000,
    },
    CLS: {
        good: 0.1,
        needsImprovement: 0.25,
    },
    INP: {
        good: 200,
        needsImprovement: 500,
    },
    TTFB: {
        good: 800,
        needsImprovement: 1800,
    },
    LCP: {
        good: 2500,
        needsImprovement: 4000,
    },
};
// Ranges strings for tooltips
const RANGES_STRINGS = {
    FCP: "Good: 0–1.8 s, Needs Improvement: 1.8–3 s, Poor: Over 3 s",
    CLS: "Good: 0–0.1, Needs Improvement: 0.1–0.25, Poor: Over 0.25",
    INP: "Good: 0–200 ms, Needs Improvement: 200–500 ms, Poor: Over 500 ms",
    TTFB: "Good: 0–800 ms, Needs Improvement: 800–1800 ms, Poor: Over 1800 ms",
    LCP: "Good: 0–2.5 s, Needs Improvement: 2.5–4 s, Poor: Over 4 s",
};
// Define colors for form factors
const FORM_FACTOR_COLORS = {
    all: "#00FFFF", // Bright Cyan for "All"
};
// Helper function to calculate the slope of a linear regression
const calculateSlope = (x, y) => {
    const n = x.length;
    if (n === 0) return 0;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((a, b, idx) => a + b * y[idx], 0);
    const sum_xx = x.reduce((a, b) => a + b * b, 0);
    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = n * sum_xx - sum_x * sum_x;
    if (denominator === 0) return 0;
    return numerator / denominator;
};
// Function to get line color based on metric directionality and slope
const getLineColor = (metric, slope) => {
    const direction = METRIC_GOOD_DIRECTION[metric];
    if (direction === "low") {
        return slope < 0 ? "green" : slope > 0 ? "red" : "gray";
    } else if (direction === "high") {
        return slope > 0 ? "green" : slope < 0 ? "red" : "gray";
    } else {
        return "gray"; // Default color
    }
};
const PerformanceMapLocal = () => {
    // State variables
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState("TV Azteca"); // Preselect "TV Azteca"
    const [selectedFormFactors, setSelectedFormFactors] = useState(["all"]); // Changed to "all"
    const [selectedWeek, setSelectedWeek] = useState(""); // Initialize to empty string
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [comparisonMode, setComparisonMode] = useState("All Time"); // Preselect "All Time"
    const toast = useToast();
    // Modal state for expanded graph
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalPlotData, setModalPlotData] = useState(null);
    const [modalMetric, setModalMetric] = useState("");
    // Function to handle expand icon click
    const handleExpand = (plotData, metric) => {
        setModalPlotData(plotData);
        setModalMetric(metric);
        onOpen();
    };
    // Fetch and parse CSV data
    useEffect(() => {
        const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjlmJmlds_-tGsyyuE---iB_dPSDjLIxWb0D5ZSqz5KiJJIOFr5_AJND3p7lMaOZ1Bz7fwl8HPP0Mg/pub?output=csv";
        Papa.parse(csvUrl, {
            download: true,
            header: true, // Parse with headers
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedData = results.data.map((row, index) => ({
                        website: row["Website"] ? row["Website"].trim() : "",
                        formFactor: "all", // Set to "all" since individual form factors are not available
                        metric: row["Metric"] ? row["Metric"].trim().toUpperCase() : "",
                        p75: row["P75"] ? parseFloat(row["P75"]) : NaN,
                        startDate: row["Start Date"] ? row["Start Date"].trim() : "",
                        endDate: row["End Date"] ? row["End Date"].trim() : "",
                        weekRange:
                            row["Start Date"] && row["End Date"]
                                ? formatDateRange(row["Start Date"].trim(), row["End Date"].trim())
                                : "N/A",
                    }));
                    // Validate essential fields and filter out invalid rows
                    const validData = parsedData.filter((row, idx) => {
                        if (!row.website) {
                            console.warn(`Row ${idx + 2} skipped: Missing 'Website'`);
                            return false;
                        }
                        if (!row.metric) {
                            console.warn(`Row ${idx + 2} skipped: Missing 'Metric'`);
                            return false;
                        }
                        if (isNaN(row.p75)) {
                            console.warn(`Row ${idx + 2} skipped: Invalid 'P75' value`);
                            return false;
                        }
                        return true;
                    });
                    // Extract unique week ranges and sort them
                    const weeks = Array.from(new Set(validData.map((d) => d.weekRange)));
                    weeks.sort((a, b) => {
                        const dateA = a.split(" - ")[0] ? parseDate(a.split(" - ")[0]) : new
                            Date(0);
                        const dateB = b.split(" - ")[0] ? parseDate(b.split(" - ")[0]) : new
                            Date(0);
                        return dateA - dateB;
                    });
                    setAvailableWeeks(weeks);
                    setData(validData);
                    setIsLoading(false);
                } catch (err) {
                    console.error("Error processing CSV data:", err);
                    setError(`Failed to process data: ${err.message}`);
                    setIsLoading(false);
                }
            },
            error: (err) => {
                console.error("Error fetching CSV data:", err);
                setError(`Failed to fetch data: ${err.message}`);
                setIsLoading(false);
            },
        });
    }, []);
    // Generate company options including groups and individual companies
    const companyOptions = useMemo(() => {
        const options = [];
        // Add group options
        GROUP_NAMES.forEach((group) => {
            options.push(
                <option key={group} value={group}>
                    {group}
                </option>
            );
        });
        // Add individual company options
        INDIVIDUAL_COMPANIES.forEach((company) => {
            options.push(
                <option key={company} value={company}>
                    {company}
                </option>
            );
        });
        return options;
    }, []);
    // Function to get the comparison weeks based on the selected week and comparison mode
    const getComparisonWeeks = useCallback(
        (currentWeek, mode) => {
            if (mode === "All Time") {
                // All Time includes all available weeks
                return [...availableWeeks];
            }
            if (currentWeek === "N/A") return [];
            const currentIndex = availableWeeks.indexOf(currentWeek);
            if (currentIndex === -1) return [];
            let comparisonWeeks = [];
            switch (mode) {
                case "Last Range":
                    if (currentIndex > 0) {
                        comparisonWeeks.push(availableWeeks[currentIndex - 1]);
                    }
                    break;
                case "Last 2 Ranges":
                    if (currentIndex > 0) {
                        comparisonWeeks.push(availableWeeks[currentIndex - 1]);
                    }
                    if (currentIndex > 1) {
                        comparisonWeeks.push(availableWeeks[currentIndex - 2]);
                    }
                    break;
                default:
                    return [];
            }
            return comparisonWeeks;
        },
        [availableWeeks]
    );
    // Ensure comparisonWeeks are correctly derived
    const comparisonWeeks = useMemo(() => {
        if (["Last Range", "Last 2 Ranges", "All Time"].includes(comparisonMode)) {
            if (comparisonMode === "All Time") {
                return getComparisonWeeks("", comparisonMode);
            }
            if (selectedWeek === "" || selectedWeek === "N/A") return [];
            return getComparisonWeeks(selectedWeek, comparisonMode);
        }
        return [];
    }, [selectedWeek, comparisonMode, getComparisonWeeks]);
    // Memoized function to get filtered data
    const getFilteredData = useCallback(
        (dataSet, weeks) => {
            if (weeks.length === 0) {
                // No week filter applied
                return dataSet.filter((row) => {
                    // Company filtering
                    let companyMatch = false;
                    if (selectedCompany === "") {
                        companyMatch = true; // No company selected
                    } else if (GROUP_NAMES.includes(selectedCompany)) {
                        // Group selected
                        const groupCompanies = GROUPS[selectedCompany];
                        const groupURLs = groupCompanies.map((c) => COMPANY_URLS[c]);
                        companyMatch = groupURLs.includes(row.website);
                    } else {
                        // Individual company selected
                        const selectedURL = COMPANY_URLS[selectedCompany];
                        companyMatch = selectedURL === row.website;
                    }
                    // Form Factor filtering
                    const formFactorMatch =
                        selectedFormFactors.length === 0 ||
                        selectedFormFactors.includes(row.formFactor.toLowerCase());
                    return companyMatch && formFactorMatch;
                });
            }
            return dataSet.filter((row) => {
                // Company filtering
                let companyMatch = false;
                if (selectedCompany === "") {
                    companyMatch = true; // No company selected
                } else if (GROUP_NAMES.includes(selectedCompany)) {
                    // Group selected
                    const groupCompanies = GROUPS[selectedCompany];
                    const groupURLs = groupCompanies.map((c) => COMPANY_URLS[c]);
                    companyMatch = groupURLs.includes(row.website);
                } else {
                    // Individual company selected
                    const selectedURL = COMPANY_URLS[selectedCompany];
                    companyMatch = selectedURL === row.website;
                }
                // Form Factor filtering
                const formFactorMatch =
                    selectedFormFactors.length === 0 ||
                    selectedFormFactors.includes(row.formFactor.toLowerCase());
                // Week filtering
                const weekMatch = weeks.includes(row.weekRange);
                return companyMatch && formFactorMatch && weekMatch;
            });
        },
        [selectedCompany, selectedFormFactors, GROUP_NAMES, GROUPS]
    );
    // Memoize the filtered current data
    const filteredDataMemo = useMemo(() => {
        return getFilteredData(
            data,
            selectedWeek === "" || selectedWeek === "N/A" ? [] : [selectedWeek]
        );
    }, [getFilteredData, data, selectedWeek]);
    // Memoize the filtered comparison data
    const comparisonDataMemo = useMemo(() => {
        if (comparisonWeeks.length === 0) return [];
        return getFilteredData(data, comparisonWeeks);
    }, [getFilteredData, data, comparisonWeeks, comparisonMode]);
    // Calculate averages for current data
    const averages = useMemo(() => {
        if (filteredDataMemo.length === 0) return {};
        const metricSums = {};
        const metricCounts = {};
        METRICS.forEach((metric) => {
            metricSums[metric] = 0;
            metricCounts[metric] = 0;
        });
        filteredDataMemo.forEach((row) => {
            if (METRICS.includes(row.metric) && !isNaN(row.p75)) {
                metricSums[row.metric] += row.p75;
                metricCounts[row.metric] += 1;
            }
        });
        const metricAverages = {};
        METRICS.forEach((metric) => {
            metricAverages[metric] =
                metricCounts[metric] > 0 ? (metricSums[metric] /
                    metricCounts[metric]).toFixed(2) : "N/A";
        });
        return metricAverages;
    }, [filteredDataMemo]);
    // Calculate averages for comparison data
    const comparisonAveragesMemo = useMemo(() => {
        if (comparisonDataMemo.length === 0) return {};
        const metricSums = {};
        const metricCounts = {};
        METRICS.forEach((metric) => {
            metricSums[metric] = 0;
            metricCounts[metric] = 0;
        });
        comparisonDataMemo.forEach((row) => {
            if (METRICS.includes(row.metric) && !isNaN(row.p75)) {
                metricSums[row.metric] += row.p75;
                metricCounts[row.metric] += 1;
            }
        });
        const metricAverages = {};
        METRICS.forEach((metric) => {
            metricAverages[metric] =
                metricCounts[metric] > 0 ? (metricSums[metric] /
                    metricCounts[metric]).toFixed(2) : "N/A";
        });
        return metricAverages;
    }, [comparisonDataMemo]);
    // Calculate percentage differences
    const percentageDifferences = useMemo(() => {
        const differences = {};
        METRICS.forEach((metric) => {
            const current = parseFloat(averages[metric]);
            const comparison = parseFloat(comparisonAveragesMemo[metric]);
            if (isNaN(current) || isNaN(comparison) || comparison === 0) {
                differences[metric] = "N/A";
            } else {
                // Calculate percentage difference and round to whole number
                const diff = ((current - comparison) / comparison) * 100;
                differences[metric] = Math.round(diff);
            }
        });
        return differences;
    }, [averages, comparisonAveragesMemo]);
    // Determine color based on percentage difference
    const getDifferenceColor = (metric) => {
        const diff = parseFloat(percentageDifferences[metric]);
        if (isNaN(diff)) return "gray.300"; // N/A
        if (diff < 0) {
            // Improvement
            return "green.400";
        } else if (diff > 0) {
            // Deterioration
            return "red.400";
        } else {
            return "gray.300"; // No change
        }
    };
    // Handle company selection
    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
        // Optionally reset week selection or other states if needed
    };
    // Handle form factor selection
    const handleFormFactorChange = (values) => {
        setSelectedFormFactors(values);
        // Optionally reset week selection or other states if needed
    };
    // Handle week selection
    const handleWeekChange = (e) => {
        setSelectedWeek(e.target.value);
        toast({
            title: "Week Selected",
            description: `Viewing data for the week: ${e.target.value}`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };
    // Reset week selection
    const resetWeekSelection = () => {
        setSelectedWeek("");
        toast({
            title: "Week Reset",
            description: "Viewing data without week filter.",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };
    // Handle comparison mode selection
    const handleComparisonModeChange = (mode) => {
        setComparisonMode(mode);
        toast({
            title: `${mode} Comparison`,
            description: `Comparing to ${mode === "Last Range"
                ? "the last range"
                : mode === "Last 2 Ranges"
                    ? "the last two ranges"
                    : "all time averages"
                }.`,
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };
    // **Prepare data for Plotly graphs based on filtered data**
    const plotlyData = useMemo(() => {
        // Group data by metric and form factor
        const dataByMetricFormFactor = {};
        METRICS.forEach((metric) => {
            dataByMetricFormFactor[metric] = {};
            selectedFormFactors.forEach((formFactor) => {
                dataByMetricFormFactor[metric][formFactor] = filteredDataMemo
                    .filter((row) => row.metric === metric && row.formFactor.toLowerCase() ===
                        formFactor)
                    .sort((a, b) => parseDate(a.endDate) - parseDate(b.endDate))
                    .map((row) => ({
                        date: row.endDate,
                        value: row.p75,
                    }));
            });
        });
        return dataByMetricFormFactor;
    }, [filteredDataMemo, METRICS, selectedFormFactors]);
    // **Prepare comparison data for Plotly graphs**
    const plotlyComparisonData = useMemo(() => {
        if (comparisonWeeks.length === 0) return [];
        // Group comparison data by metric and form factor
        const comparisonDataByMetricFormFactor = {};
        METRICS.forEach((metric) => {
            comparisonDataByMetricFormFactor[metric] = {};
            selectedFormFactors.forEach((formFactor) => {
                comparisonDataByMetricFormFactor[metric][formFactor] = comparisonDataMemo
                    .filter((row) => row.metric === metric && row.formFactor.toLowerCase() ===
                        formFactor)
                    .sort((a, b) => parseDate(a.endDate) - parseDate(b.endDate))
                    .map((row) => ({
                        date: row.endDate,
                        value: row.p75,
                    }));
            });
        });
        // Convert to an array of comparison datasets for each metric and form factor
        const comparisonDatasets = [];
        METRICS.forEach((metric) => {
            selectedFormFactors.forEach((formFactor) => {
                const dataPoints = comparisonDataByMetricFormFactor[metric][formFactor] || [];
                // Calculate slope
                const x = dataPoints.map((d) => new Date(d.date).getTime());
                const y = dataPoints.map((d) => d.value);
                const slope = calculateSlope(x, y);
                // Determine color based on metric directionality and slope
                const color = getLineColor(metric, slope);
                if (dataPoints.length > 0) {
                    comparisonDatasets.push({
                        metric,
                        formFactor,
                        data: {
                            x: dataPoints.map((d) => d.date),
                            y: dataPoints.map((d) => d.value),
                            type: "scatter",
                            mode: "lines+markers", // Ensures points are connected with visible markers
                            line: {
                                color: color,
                                width: 2,
                                dash: "dash", // Dashed line for comparison
                                shape: "linear", // Connects points with straight lines
                            },
                            marker: {
                                size: 6, // Adjust marker size for better visibility
                                color: color,
                            },
                            name: `Comparison (${formFactor.charAt(0).toUpperCase() +
                                formFactor.slice(1)})`,
                            hovertemplate: `
                                <b>Comparison Metric:</b> ${metric}
                                (${formFactor.charAt(0).toUpperCase() + formFactor.slice(1)})<br>
                                <b>Date:</b> %{x|%B %d, %Y}<br>
                                <b>Value:</b> %{y} ${METRIC_UNITS[metric]}<extra></extra>
                            `,
                            connectgaps: true, // Ensure lines are connected even if there are gaps
                        },
                        slope,
                    });
                }
            });
        });
        return comparisonDatasets;
    }, [comparisonDataMemo, comparisonWeeks, METRICS, selectedFormFactors,
        METRIC_UNITS]);
    return (
        <>
            {isLoading ? (
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    height="50vh"
                    bg="transparent" // Removed background
                >
                    <Spinner size="xl" color="teal.500" />
                    <Text ml={4} fontSize="xl" color="white">
                        Loading data...
                    </Text>
                </Flex>
            ) : error ? (
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    height="50vh"
                    bg="transparent" // Removed background
                >
                    <Text color="red.500" fontSize="xl" textAlign="center">
                        {error}
                    </Text>
                </Flex>
            ) : (
                <Flex
                    direction="column"
                    gap={4} // Maintain original gap
                    width="100%"
                    maxW="1200px"
                    align="center"
                    p={4}
                    mx="auto"
                    bg="transparent" // Set background to transparent
                >
                    {/* Header Section */}
                    <Flex
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                        bg="transparent" // Keep original background
                    >
                        {/* Company Selector and Filter Icon */}
                        <Flex alignItems="center" gap={2}>
                            <Text color="white" fontSize="md" fontWeight="semibold">
                                CrUX:
                            </Text>
                            <Select
                                value={selectedCompany}
                                onChange={handleCompanyChange}
                                placeholder="Select Company"
                                width="200px" // Maintain original width
                                bg="transparent" // Set background to transparent
                                borderRadius="md"
                                border="1px solid rgba(255, 255, 255, 0.6)" // Add border
                                size="sm"
                                borderColor="#cbd5e0"
                                // color="white"
                                _hover={{ borderColor: "gray.300" }}
                                _focus={{ borderColor: "gray.300", boxShadow: "none" }}
                                iconColor="white"
                                _placeholder={{ color: "gray.300" }}
                                _placeholder={{ color: "gray.300" }}
                            >
                                {companyOptions}
                            </Select>
                            {/* Filter Icon with Popover */}
                            <Popover>
                                <PopoverTrigger>
                                    <IconButton
                                        aria-label="Filter Controls"
                                        icon={<FaFilter />}
                                        color="white" // Set icon color to white
                                        bg="transparent"
                                        _hover={{ bg: "gray.700" }}
                                        size="sm"
                                    />
                                </PopoverTrigger>
                                <PopoverContent
                                    bg="gray.800"
                                    border="2.5px solid"
                                    borderColor="gray.300" // Match border color
                                    boxShadow="lg"
                                    borderRadius="md"
                                >
                                    <PopoverArrow bg="gray.800" />
                                    <PopoverCloseButton color="white" />
                                    <PopoverHeader color="white" fontWeight="bold">
                                        Controls
                                    </PopoverHeader>
                                    <PopoverBody>
                                        <VStack align="start" spacing={2}>
                                            {/* Week Filter */}
                                            <Box>
                                                <Text fontSize="sm" fontWeight="semibold" mb={1} color="white">
                                                    Week:
                                                </Text>
                                                <Select
                                                    value={selectedWeek}
                                                    onChange={handleWeekChange}
                                                    placeholder="Select Week"
                                                    bg="transparent" // Set background to transparent
                                                    color="white" // Set text color to white
                                                    borderRadius="md"
                                                    size="sm"
                                                    width="100%"
                                                    border="1px solid rgba(255, 255, 255, 0.6)" // Add border
                                                    _placeholder={{ color: "gray.300" }}
                                                    _focus={{ borderColor: "teal.300", boxShadow: "none" }}
                                                    _hover={{ borderColor: "teal.200" }}
                                                >
                                                    {availableWeeks.map((weekRange) => (
                                                        <option key={weekRange} value={weekRange}>
                                                            {weekRange}
                                                        </option>
                                                    ))}
                                                </Select>
                                                {selectedWeek && (
                                                    <Button
                                                        colorScheme="red"
                                                        variant="outline"
                                                        size="xs"
                                                        onClick={resetWeekSelection}
                                                        mt={1}
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </Box>
                                            {/* Comparison Mode Selection */}
                                            <Box>
                                                <Text fontSize="sm" fontWeight="semibold" mb={1} color="white">
                                                    Comparison Mode:
                                                </Text>
                                                <HStack spacing={2}>
                                                    <Button
                                                        colorScheme={comparisonMode === "Last Range" ? "teal" :
                                                            "gray"}
                                                        onClick={() => handleComparisonModeChange("Last Range")}
                                                        size="xs"
                                                    >
                                                        Last Range
                                                    </Button>
                                                    <Button
                                                        colorScheme={comparisonMode === "Last 2 Ranges" ? "teal" :
                                                            "gray"}
                                                        onClick={() => handleComparisonModeChange("Last 2 Ranges")}
                                                        size="xs"
                                                    >
                                                        Last 2 Ranges
                                                    </Button>
                                                    <Button
                                                        colorScheme={comparisonMode === "All Time" ? "teal" :
                                                            "gray"}
                                                        onClick={() => handleComparisonModeChange("All Time")}
                                                        size="xs"
                                                    >
                                                        All Time
                                                    </Button>
                                                </HStack>
                                            </Box>
                                            {/* Form Factor Selection Inside Controls */}
                                            <Box>
                                                <Text fontSize="sm" fontWeight="semibold" mb={1} color="white">
                                                    Form Factors:
                                                </Text>
                                                <CheckboxGroup
                                                    colorScheme="teal"
                                                    value={selectedFormFactors}
                                                    onChange={handleFormFactorChange}
                                                >
                                                    <HStack spacing={2}>
                                                        <Checkbox value="all" color="white">
                                                            All
                                                        </Checkbox>
                                                    </HStack>
                                                </CheckboxGroup>
                                            </Box>
                                        </VStack>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Flex>
                    </Flex>
                    {/* Metrics Display */}
                    <Grid
                        templateColumns={{
                            base: "repeat(1, 1fr)", // 1 column on small screens
                            sm: "repeat(2, 1fr)", // 2 columns on small to medium screens
                            md: "repeat(3, 1fr)", // 3 columns on medium screens
                            lg: "repeat(5, 1fr)", // 5 columns for 5 metrics
                        }}
                        gap={4} // Maintain original gap
                        width="100%"
                        overflowX="auto" // Allow horizontal scrolling on smaller screens
                    >
                        {METRICS.map((metric) => {
                            // Prepare Plotly data for the metric
                            const metricData = plotlyData[metric] || {};
                            // Initialize an array to hold current traces
                            const currentTraces = [];
                            // Iterate over each form factor to create separate traces
                            Object.keys(metricData).forEach((formFactor) => {
                                const formFactorData = metricData[formFactor];
                                if (formFactorData.length > 0) {
                                    // Calculate slope for form factor data
                                    const currentX = formFactorData.map((d) => new
                                        Date(d.date).getTime());
                                    const currentY = formFactorData.map((d) => d.value);
                                    const currentSlope = calculateSlope(currentX, currentY);
                                    // Determine color based on form factor
                                    const color = FORM_FACTOR_COLORS[formFactor] || "white";
                                    currentTraces.push({
                                        x: formFactorData.map((d) => d.date),
                                        y: formFactorData.map((d) => d.value),
                                        type: "scatter",
                                        mode: "lines+markers", // Ensures points are connected with visible markers
                                        line: {
                                            color: color,
                                            width: 2,
                                            shape: "linear", // Connects points with straight lines
                                        },
                                        marker: {
                                            size: 6, // Adjust marker size for better visibility
                                            color: color,
                                        },
                                        name: `Current (${formFactor.charAt(0).toUpperCase() +
                                            formFactor.slice(1)})`,
                                        hovertemplate: `
                                            <b>Date:</b> %{x|%B %d, %Y}<br>
                                            <b>Value:</b> %{y} ${METRIC_UNITS[metric]}<extra></extra>
                                        `,
                                        connectgaps: true, // Ensure lines are connected even if there are gaps
                                    });
                                }
                            });
                            // Prepare comparison data traces
                            const comparisonTraces = plotlyComparisonData
                                .filter((comp) => comp.metric === metric)
                                .map((comp) => ({
                                    ...comp.data,
                                    connectgaps: true, // Ensure lines are connected even if there are gaps
                                }));
                            // Combine current and comparison data
                            const combinedData = [...currentTraces, ...comparisonTraces];
                            // Determine performance category based on thresholds
                            const value = parseFloat(averages[metric]);
                            let performance = "Poor";
                            if (value <= THRESHOLDS[metric].good) {
                                performance = "Good";
                            } else if (value <= THRESHOLDS[metric].needsImprovement) {
                                performance = "Needs Improvement";
                            }
                            // Determine color based on performance
                            const performanceColor =
                                performance === "Good"
                                    ? "green.400"
                                    : performance === "Needs Improvement"
                                        ? "yellow.400"
                                        : "red.400";
                            // Calculate percentage difference for display
                            const percentageDifference = percentageDifferences[metric];
                            const percentageText =
                                percentageDifference !== "N/A"
                                    ? `${percentageDifference > 0 ? "+" : ""}${percentageDifference}%`
                                    : "N/A";
                            const percentageColor =
                                percentageDifference > 0
                                    ? "red.400"
                                    : percentageDifference < 0
                                        ? "green.400"
                                        : "gray.300";
                            return (
                                <Tooltip
                                    key={metric}
                                    label={
                                        <>
                                            <Text fontWeight="bold">{metric} Performance:</Text>
                                            <Text>
                                                Good: ≤ {formatNumber(THRESHOLDS[metric].good)}
                                                {METRIC_UNITS[metric]}
                                            </Text>
                                            <Text>
                                                Needs Improvement: ≤
                                                {formatNumber(THRESHOLDS[metric].needsImprovement)}{" "}
                                                {METRIC_UNITS[metric]}
                                            </Text>
                                            <Text>
                                                Poor: {">"} {formatNumber(THRESHOLDS[metric].needsImprovement)}{""}
                                                {METRIC_UNITS[metric]}
                                            </Text>
                                        </>
                                    }
                                    bg="gray.700"
                                    color="white"
                                    fontSize="sm"
                                    placement="top"
                                    hasArrow
                                >
                                    <Box
                                        bg="transparent" // Set background to transparent
                                        p={4}
                                        transition="box-shadow 0.2s, transform 0.2s"
                                        _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
                                        cursor="pointer"
                                        minW="140px"
                                        minH="300px" // Increased height to accommodate y-axis and
                                        performance info
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="space-between"
                                        position="relative" // To position the expand icon
                                    >
                                        <Flex direction="column" align="center">
                                            {/* Title and Expand Button Section */}
                                            <Flex width="100%" justifyContent="space-between"
                                                alignItems="center">
                                                <Box
                                                    height="50px"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    textAlign="center"
                                                    flex="1"
                                                >
                                                    <Text color="white" fontSize="sm" fontWeight="bold"
                                                        isTruncated>
                                                        {metric}
                                                    </Text>
                                                </Box>
                                                {/* Expand Button */}
                                                <IconButton
                                                    aria-label="Expand Graph"
                                                    icon={<FaExpand />}
                                                    color="white" // Set icon color to white
                                                    bg="transparent"
                                                    _hover={{ bg: "transparent" }}
                                                    size="sm"
                                                    onClick={() => handleExpand(combinedData, metric)}
                                                />
                                            </Flex>
                                            {/* Number and Percentage Difference */}
                                            <Flex direction="column" justify="center" align="center" mt={2}>
                                                <Flex alignItems="center" justify="center">
                                                    <Text color="white" fontSize="2xl" fontWeight="bold"
                                                        textAlign="center">
                                                        {formatNumber(averages[metric]) || "N/A"}
                                                        {/* Removed unit labels */}
                                                    </Text>
                                                    {/* Add percentage indicator */}
                                                    <Box
                                                        ml={2}
                                                        color={percentageColor}
                                                        fontSize="md"
                                                        fontWeight="bold"
                                                    >
                                                        {percentageText}
                                                    </Box>
                                                </Flex>
                                                <Text color={performanceColor} fontSize="sm" fontWeight="bold"
                                                    mt={1}>
                                                    {performance}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                        {/* Graph Section */}
                                        <Box
                                            mt={4} // Increased margin-top for more space between labels and
                                            graph
                                            width="100%"
                                            height="150px" // Adjusted height to fit within the box
                                            position="relative"
                                            className="plot-container"
                                        >
                                            <Plot
                                                data={combinedData}
                                                layout={{
                                                    autosize: true,
                                                    margin: { l: 40, r: 10, t: 10, b: 30 }, // Adjusted margins
                                                    xaxis: {
                                                        tickfont: { size: 10, color: "white" }, // Set x-axis numbers to white
                                                        type: "date",
                                                        showgrid: false,
                                                        zeroline: false,
                                                        showline: false,
                                                        ticks: "",
                                                        tickformat: "%b %d", // Display abbreviated month and day
                                                        dtick: "M1", // Tick every month
                                                        showticklabels: true,
                                                    },
                                                    yaxis: {
                                                        tickfont: { size: 10, color: "white" }, // Set y-axis numbers to white
                                                        showgrid: false,
                                                        zeroline: false,
                                                        showline: false,
                                                        ticks: "",
                                                        showticklabels: true,
                                                        // Removed y-axis title
                                                        title: {
                                                            text: "", // No title
                                                        },
                                                    },
                                                    showlegend: false, // Removed legends
                                                    hovermode: "closest", // Ensures hover on closest point
                                                    paper_bgcolor: "transparent",
                                                    plot_bgcolor: "transparent",
                                                }}
                                                config={{
                                                    displayModeBar: false,
                                                    responsive: true,
                                                    hovermode: "closest", // Ensures hover on closest point
                                                }}
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                        </Box>
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Grid>
                    {/* Modal for Expanded Graph */}
                    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                        <ModalOverlay />
                        <ModalContent
                            bg="gray.800"
                            color="white"
                            border="2.5px solid" // Match border style
                            borderColor="gray.300"
                        >
                            <ModalHeader>{modalMetric}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {modalPlotData && (
                                    <Plot
                                        data={modalPlotData}
                                        layout={{
                                            autosize: true,
                                            margin: { l: 50, r: 50, t: 50, b: 50 },
                                            xaxis: {
                                                type: "date",
                                                title: "Date",
                                                titlefont: { size: 14, color: "white" },
                                                tickformat: "%B %d, %Y", // Full date format
                                                dtick: "M1", // Tick every month
                                                showticklabels: true,
                                                tickfont: { size: 12, color: "white" },
                                            },
                                            yaxis: {
                                                tickfont: { size: 12, color: "white" },
                                                showgrid: true, // Optionally show grid in modal
                                                zeroline: false,
                                                showline: false,
                                                ticks: "",
                                                showticklabels: true,
                                                // Removed y-axis title
                                                title: {
                                                    text: "", // No title
                                                },
                                            },
                                            showlegend: true, // Show legends in modal
                                            legend: {
                                                x: 0,
                                                y: 1,
                                                bgcolor: "rgba(0,0,0,0)",
                                                bordercolor: "rgba(0,0,0,0)",
                                            },
                                            hovermode: "closest", // Ensures hover on closest point
                                            paper_bgcolor: "transparent",
                                            plot_bgcolor: "transparent",
                                        }}
                                        config={{
                                            displayModeBar: true, // Enable mode bar in modal
                                            responsive: true,
                                            hovermode: "closest", // Ensures hover on closest point
                                        }}
                                        style={{ width: "100%", height: "500px" }}
                                    />
                                )}
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </Flex>
            )}
        </>
    );
};
export default PerformanceMapLocal;