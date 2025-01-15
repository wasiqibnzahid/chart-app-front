// General.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Text,
    Flex,
    Spinner,
    Button,
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
    useDisclosure
} from "@chakra-ui/react";
import Papa from "papaparse";
import { FaFilter, FaExpand } from "react-icons/fa";

import Plot from "react-plotly.js";
import { Loader } from "../components/common/Loader";
import { useAsyncFn } from "../hooks/useAsync";

// Helper function to parse "YYYY-MM-DD" to Date object
const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
};

// Helper function to get the Monday of the week for a given date
const getWeekStartDate = (date) => {
    const day = date.getDay(); // Sunday - Saturday : 0 - 6
    const diff = day === 0 ? -6 : 1 - day; // Adjust if day is Sunday
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);

    const dd = String(monday.getDate()).padStart(2, "0");
    const mm = String(monday.getMonth() + 1).padStart(2, "0");
    const yyyy = monday.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
};

// Format number (no decimals if integer, else 1 decimal)
const formatNumber = (numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
};

// *** 1) Renamed metrics ***
const METRICS = ["FCP", "TBT", "SPI", "LCP", "CLS"];

// *** 2) Show units next to average ***
const METRIC_UNITS = {
    FCP: "s",
    TBT: "s",
    SPI: "s",
    LCP: "s",
    CLS: ""
};

// *** 3) Adjust thresholds and rename for short acronyms ***
const THRESHOLDS = {
    FCP: { good: 1.8, needsImprovement: 3.0 },
    TBT: { good: 0.2, needsImprovement: 0.6 },
    SPI: { good: 3.4, needsImprovement: 5.8 },
    LCP: { good: 2.5, needsImprovement: 4.0 },
    CLS: { good: 0.1, needsImprovement: 0.25 }
};

// *** 4) Tooltip text with short definitions + “What does that mean?” ***
const RANGES_STRINGS = {
    FCP: "Good: 0–1.8s, Needs Improvement: 1.8–3s, Poor: >3s\nWhat does that mean? Measures time until first content is painted.",
    TBT: "Good: 0–0.2s, Needs Improvement: 0.2–0.6s, Poor: >0.6s\nWhat does that mean? Measures main-thread blocking time.",
    SPI: "Good: 0–3.4s, Needs Improvement: 3.4–5.8s, Poor: >5.8s\nWhat does that mean? Measures how quickly content is visually displayed.",
    LCP: "Good: 0–2.5s, Needs Improvement: 2.5–4s, Poor: >4s\nWhat does that mean? Largest element painted.",
    CLS: "Good: 0–0.1, Needs Improvement: 0.1–0.25, Poor: >0.25\nWhat does that mean? Measures layout shift during load."
};

// *** Map new acronyms to the data keys ***
const METRIC_KEYS = {
    FCP: "firstContentfulPaint",
    TBT: "totalBlockingTime",
    SPI: "speedIndex",
    LCP: "largestContentfulPaint",
    CLS: "cumulativeLayoutShift"
};

// Helper: slope of a linear regression
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

const General = ({ fetchData, groups, preSelectedWebsites = "ADN40" }) => {
    const GROUPS = groups;
    const GROUP_NAMES = Object.keys(GROUPS);
    const INDIVIDUAL_COMPANIES = GROUP_NAMES.reduce(
        (acc, group) => acc.concat(GROUPS[group]),
        []
    );

    const [data, setData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(preSelectedWebsites);
    const [selectedCategories, setSelectedCategories] = useState(["nota", "video"]);
    const [selectedWeek, setSelectedWeek] = useState("");
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [comparisonMode, setComparisonMode] = useState("Monthly"); // Default

    const toast = useToast();

    // Modal (expanded graph)
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalPlotData, setModalPlotData] = useState(null);

    const handleExpand = (plotData, metric) => {
        setModalPlotData({ ...plotData, metric });
        onOpen();
    };

    const { isLoading, error, execute } = useAsyncFn(fetchData);

    React.useEffect(() => {
        execute().then((res) => {
            let parsedData = res.map((item) => {
                const dateObj = parseDate(item["date"]);
                const weekStart = getWeekStartDate(dateObj);

                const noteValues = {
                    date: item["date"],
                    company: item["name"].toUpperCase(),
                    category: "note",
                    firstContentfulPaint: item["note_first_contentful_paint"],
                    totalBlockingTime: item["note_total_blocking_time"],
                    speedIndex: item["note_speed_index"],
                    largestContentfulPaint: item["note_largest_contentful_paint"],
                    cumulativeLayoutShift: item["note_cumulative_layout_shift"],
                    week: weekStart
                };
                const videoValues = {
                    date: item["date"],
                    company: item["name"].toUpperCase(),
                    category: "video",
                    firstContentfulPaint: item["video_first_contentful_paint"],
                    totalBlockingTime: item["video_total_blocking_time"],
                    speedIndex: item["video_speed_index"],
                    largestContentfulPaint: item["video_largest_contentful_paint"],
                    cumulativeLayoutShift: item["video_cumulative_layout_shift"],
                    week: weekStart
                };
                return [noteValues, videoValues];
            });

            parsedData = parsedData.flat();

            const weeks = Array.from(new Set(parsedData.map((d) => d.week)));
            weeks.sort((a, b) => parseDate(a) - parseDate(b));

            setAvailableWeeks(weeks);
            setData(parsedData);
            if (weeks.length > 0) {
                setSelectedWeek(weeks[weeks.length - 1]);
            }
        });
    }, [execute]);

    // Generate company <option> tags
    const companyOptions = useMemo(() => {
        const options = [];
        INDIVIDUAL_COMPANIES.forEach((company) => {
            options.push(
                <option
                    key={company}
                    value={company}
                    style={{ color: "white" }} // <-- changed (was black before)
                >
                    {company}
                </option>
            );
        });
        return options;
    }, [INDIVIDUAL_COMPANIES]);

    const parseDateStr = useCallback((d) => parseDate(d), []);

    const getComparisonPeriod = useCallback((currentDateStr, mode) => {
        const currentDate = parseDateStr(currentDateStr);
        let comparisonDate;
        switch (mode) {
            case "Weekly":
                comparisonDate = new Date(currentDate);
                comparisonDate.setDate(currentDate.getDate() - 7);
                break;
            case "Monthly":
                comparisonDate = new Date(currentDate);
                comparisonDate.setMonth(currentDate.getMonth() - 1);
                break;
            case "Yearly":
                comparisonDate = new Date(currentDate);
                comparisonDate.setFullYear(currentDate.getFullYear() - 1);
                break;
            default:
                return null;
        }
        return comparisonDate;
    }, [parseDateStr]);

    const comparisonDate = useMemo(() => {
        if (
            comparisonMode === "Weekly" ||
            comparisonMode === "Monthly" ||
            comparisonMode === "Yearly"
        ) {
            if (!selectedWeek) return null;
            return getComparisonPeriod(selectedWeek, comparisonMode);
        }
        return null;
    }, [selectedWeek, comparisonMode, getComparisonPeriod]);

    const getFilteredData = useCallback(
        (dataSet, dateFilter) => {
            return dataSet.filter((row) => {
                let companyMatch = false;
                if (!selectedCompany) {
                    companyMatch = true;
                } else if (GROUP_NAMES.includes(selectedCompany)) {
                    const groupCompanies = GROUPS[selectedCompany].map((c) =>
                        c.toUpperCase()
                    );
                    companyMatch = groupCompanies.includes(row.company);
                } else {
                    companyMatch = row.company === selectedCompany.toUpperCase();
                }

                const categoryMatch =
                    selectedCategories.length === 0 ||
                    selectedCategories.includes(row.category);

                let timeMatch = true;
                if (dateFilter) {
                    const rowDate = parseDateStr(row.date);
                    const filterDate = parseDateStr(dateFilter);

                    if (comparisonMode === "Weekly") {
                        timeMatch = row.week === dateFilter;
                    } else if (comparisonMode === "Monthly") {
                        timeMatch =
                            rowDate.getFullYear() === filterDate.getFullYear() &&
                            rowDate.getMonth() === filterDate.getMonth();
                    } else if (comparisonMode === "Yearly") {
                        timeMatch =
                            rowDate.getFullYear() === filterDate.getFullYear();
                    }
                }
                return companyMatch && categoryMatch && timeMatch;
            });
        },
        [selectedCompany, selectedCategories, comparisonMode, parseDateStr, GROUP_NAMES, GROUPS]
    );

    const filteredDataMemo = useMemo(() => {
        return getFilteredData(data, selectedWeek);
    }, [getFilteredData, data, selectedWeek]);

    const comparisonData = useMemo(() => {
        if (!comparisonDate) return [];
        let comparisonDateStr = "";
        if (comparisonMode === "Weekly") {
            comparisonDateStr = getWeekStartDate(comparisonDate);
        } else if (comparisonMode === "Monthly" || comparisonMode === "Yearly") {
            const yyyy = comparisonDate.getFullYear();
            const mm = String(comparisonDate.getMonth() + 1).padStart(2, "0");
            const dd = String(comparisonDate.getDate()).padStart(2, "0");
            comparisonDateStr = `${yyyy}-${mm}-${dd}`;
        }
        return getFilteredData(data, comparisonDateStr);
    }, [getFilteredData, data, comparisonDate, comparisonMode]);

    const averages = useMemo(() => {
        if (filteredDataMemo.length === 0) return {};
        const metricSums = {};
        METRICS.forEach((m) => {
            metricSums[m] = 0;
        });
        filteredDataMemo.forEach((row) => {
            METRICS.forEach((m) => {
                const key = METRIC_KEYS[m];
                const val = parseFloat(row[key]);
                if (!isNaN(val)) {
                    metricSums[m] += val;
                }
            });
        });
        const metricAverages = {};
        METRICS.forEach((m) => {
            metricAverages[m] = (
                metricSums[m] / filteredDataMemo.length
            ).toFixed(2);
        });
        return metricAverages;
    }, [filteredDataMemo]);

    const comparisonAverages = useMemo(() => {
        if (comparisonData.length === 0) return {};
        const metricSums = {};
        METRICS.forEach((m) => {
            metricSums[m] = 0;
        });
        comparisonData.forEach((row) => {
            METRICS.forEach((m) => {
                const key = METRIC_KEYS[m];
                const val = parseFloat(row[key]);
                if (!isNaN(val)) {
                    metricSums[m] += val;
                }
            });
        });
        const metricAverages = {};
        METRICS.forEach((m) => {
            metricAverages[m] = (
                metricSums[m] / comparisonData.length
            ).toFixed(2);
        });
        return metricAverages;
    }, [comparisonData]);

    const percentageDifferences = useMemo(() => {
        const diffs = {};
        METRICS.forEach((m) => {
            const current = parseFloat(+averages[m] || 0);
            const prev = parseFloat(+comparisonAverages[m] || 0);
            if (isNaN(current) || isNaN(prev)) {
                diffs[m] = 0;
            } else {
                const diff = ((current - prev) / (prev || current || 1)) * 100;
                diffs[m] = Math.round(diff);
            }
        });
        return diffs;
    }, [averages, comparisonAverages]);

    const getDifferenceColor = (metric) => {
        const diff = parseFloat(percentageDifferences[metric]);
        if (isNaN(diff)) return "gray.300";
        // Lower is better, so positive => improvement
        if (diff > 0) {
            return "green.400";
        } else if (diff < 0) {
            return "red.400";
        }
        return "gray.300";
    };

    const getPerformanceColor = (metric, val) => {
        if (!THRESHOLDS[metric] || isNaN(val)) return "gray.300";
        const { good, needsImprovement } = THRESHOLDS[metric];
        if (val <= good) return "green.400";
        if (val <= needsImprovement) return "orange.400";
        return "red.400";
    };

    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
    };

    const handleCategoryChange = (vals) => {
        if (vals !== "") {
            setSelectedCategories(vals);
        } else {
            setSelectedCategories(["note", "video"]);
        }
    };

    const handleWeekChange = (e) => {
        setSelectedWeek(e.target.value);
        toast({
            title: "Week Selected",
            description: `Viewing data for the week starting on ${e.target.value}`,
            status: "success",
            duration: 3000,
            isClosable: true
        });
    };

    const resetWeekSelection = () => {
        setSelectedWeek("");
        toast({
            title: "Week Reset",
            description: "Viewing data without week filter.",
            status: "info",
            duration: 3000,
            isClosable: true
        });
    };

    const handleComparisonModeChange = (mode) => {
        setComparisonMode(mode);
        toast({
            title: `${mode} Comparison`,
            description: `Comparing to ${
                mode === "Weekly"
                    ? "Last Week"
                    : mode === "Monthly"
                    ? "Last Month"
                    : "Last Year"
            }.`,
            status: "info",
            duration: 3000,
            isClosable: true
        });
    };

    // Plot data
    const plotlyData = useMemo(() => {
        const sorted = [...filteredDataMemo].sort(
            (a, b) => parseDate(a.date) - parseDate(b.date)
        );

        const shouldAggregate =
            selectedCategories.length > 1 || GROUP_NAMES.includes(selectedCompany);

        if (shouldAggregate) {
            const dataByDate = {};
            sorted.forEach((row) => {
                if (!dataByDate[row.date]) {
                    dataByDate[row.date] = { count: 0 };
                    METRICS.forEach((m) => {
                        dataByDate[row.date][m] = 0;
                    });
                }
                dataByDate[row.date].count += 1;
                METRICS.forEach((m) => {
                    const key = METRIC_KEYS[m];
                    const val = parseFloat(row[key]);
                    if (!isNaN(val)) dataByDate[row.date][m] += val;
                });
            });
            const averagedData = Object.keys(dataByDate)
                .map((dt) => {
                    const obj = { date: dt };
                    METRICS.forEach((m) => {
                        obj[m] = (
                            dataByDate[dt][m] / dataByDate[dt].count
                        ).toFixed(2);
                    });
                    return obj;
                })
                .sort((a, b) => parseDate(a.date) - parseDate(b.date));

            return averagedData.map((row) => {
                const obj = { date: row.date };
                METRICS.forEach((m) => {
                    obj[m] = parseFloat(row[m]) || 0;
                });
                return obj;
            });
        } else {
            return sorted.map((r) => {
                const obj = { date: r.date };
                METRICS.forEach((m) => {
                    const key = METRIC_KEYS[m];
                    obj[m] = parseFloat(r[key]) || 0;
                });
                return obj;
            });
        }
    }, [filteredDataMemo, selectedCategories, selectedCompany, GROUP_NAMES]);

    // Trend data
    const trendData = useMemo(() => {
        const t = {};
        METRICS.forEach((m) => {
            const xVals = plotlyData.map((d) => parseDate(d.date).getTime());
            const yVals = plotlyData.map((d) => d[m]);
            t[m] = calculateSlope(xVals, yVals);
        });
        return t;
    }, [plotlyData]);

    return (
        <div style={{ position: "relative" }}>
            {isLoading ? (
                <Loader isPrevLoading={false} />
            ) : error ? (
                <Text color="red.500" fontSize="xl" textAlign="center">
                    {error}
                </Text>
            ) : (
                <Flex
                    direction="column"
                    gap={3}
                    width="100%"
                    align="center"
                    bg="linear-gradient(90deg, #000000, #7800ff)"
                    p={3}
                    borderRadius="15px"
                    borderColor="gray.300"
                    mx="auto"
                >
                    {/* Header Row */}
                    <Flex
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                        bg="transparent"
                    >
                        {/* Company Selector */}
                        <Flex alignItems="center" gap={2}>
                            <Text color="white" fontSize="md" fontWeight="semibold">
                                Company:
                            </Text>
                            <Select
                                value={selectedCompany}
                                onChange={handleCompanyChange}
                                width="200px"
                                size="sm"
                                border="2px"
                                borderColor="#cbd5e0"
                                borderRadius="8px"
                                color="white"
                                bg="transparent"
                                _hover={{ borderColor: "gray.300" }}
                                _focus={{ borderColor: "gray.300", boxShadow: "none" }}
                                iconColor="white"
                                _placeholder={{ color: "gray.300" }}
                            >
                                {companyOptions}
                            </Select>

                            {/* Filter Popover */}
                            <Popover>
                                <PopoverTrigger>
                                    <IconButton
                                        aria-label="Filter Controls"
                                        icon={<FaFilter />}
                                        color="white"
                                        bg="transparent"
                                        _hover={{ bg: "gray.700" }}
                                        size="sm"
                                    />
                                </PopoverTrigger>
                                <PopoverContent
                                    bg="gray.800"
                                    border="none"
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
                                            {/* Category */}
                                            <Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="semibold"
                                                    mb={1}
                                                    color="white" // <-- changed
                                                >
                                                    Category:
                                                </Text>
                                                <CheckboxGroup
                                                    colorScheme="teal"
                                                    value={selectedCategories}
                                                    onChange={handleCategoryChange}
                                                >
                                                    <HStack spacing={2}>
                                                        <Checkbox
                                                            value="note"
                                                            bg="transparent"
                                                            size="sm"
                                                            color="white" // <-- changed
                                                        >
                                                            Nota
                                                        </Checkbox>
                                                        <Checkbox
                                                            value="video"
                                                            bg="transparent"
                                                            size="sm"
                                                            color="white" // <-- changed
                                                        >
                                                            Video
                                                        </Checkbox>
                                                    </HStack>
                                                </CheckboxGroup>
                                            </Box>

                                            {/* Week */}
                                            <Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="semibold"
                                                    mb={1}
                                                    color="white" // <-- changed
                                                >
                                                    Week:
                                                </Text>
                                                <Select
                                                    value={selectedWeek}
                                                    onChange={handleWeekChange}
                                                    placeholder="Select Week"
                                                    bg="transparent"
                                                    color="white"
                                                    borderRadius="md"
                                                    size="sm"
                                                    width="100%"
                                                    border="1px solid rgba(255, 255, 255, 0.6)"
                                                    _placeholder={{ color: "gray.300" }}
                                                    _focus={{
                                                        borderColor: "teal.300",
                                                        boxShadow: "none"
                                                    }}
                                                    _hover={{ borderColor: "teal.200" }}
                                                >
                                                    {availableWeeks.map((week) => (
                                                        <option
                                                            key={week}
                                                            value={week}
                                                            style={{ color: "white" }} // <-- changed
                                                        >
                                                            {week}
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

                                            {/* Comparison Mode */}
                                            <Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="semibold"
                                                    mb={1}
                                                    color="white" // <-- changed
                                                >
                                                    Comparison Mode:
                                                </Text>
                                                <HStack spacing={2}>
                                                    <Button
                                                        color="white" // <-- changed
                                                        colorScheme={
                                                            comparisonMode === "Weekly"
                                                                ? "teal"
                                                                : "gray"
                                                        }
                                                        onClick={() =>
                                                            handleComparisonModeChange("Weekly")
                                                        }
                                                        size="xs"
                                                    >
                                                        Weekly
                                                    </Button>
                                                    <Button
                                                        color="white" // <-- changed
                                                        colorScheme={
                                                            comparisonMode === "Monthly"
                                                                ? "teal"
                                                                : "gray"
                                                        }
                                                        onClick={() =>
                                                            handleComparisonModeChange("Monthly")
                                                        }
                                                        size="xs"
                                                    >
                                                        Monthly
                                                    </Button>
                                                    <Button
                                                        color="white" // <-- changed
                                                        colorScheme={
                                                            comparisonMode === "Yearly"
                                                                ? "teal"
                                                                : "gray"
                                                        }
                                                        onClick={() =>
                                                            handleComparisonModeChange("Yearly")
                                                        }
                                                        size="xs"
                                                    >
                                                        Yearly
                                                    </Button>
                                                </HStack>
                                            </Box>
                                        </VStack>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Flex>
                    </Flex>

                    {/* Metrics Grid */}
                    <Grid
                        templateColumns={{
                            base: "repeat(1, 1fr)",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(4, 1fr)",
                            xl: "repeat(5, 1fr)"
                        }}
                        gap={3}
                        width="100%"
                        overflowX="auto"
                    >
                        {METRICS.map((metric) => {
                            const plotDataPoints = plotlyData.map((d) => d.date);
                            const plotMetricValues = plotlyData.map((d) => d[metric]);

                            const xValues = plotlyData.map((d) =>
                                parseDate(d.date).getTime()
                            );
                            const slope = calculateSlope(xValues, plotMetricValues);
                            const lineColor = slope < 0 ? "green" : "red";

                            const individualPlotData = {
                                x: plotDataPoints,
                                y: plotMetricValues,
                                type: "scatter",
                                mode: "lines+markers",
                                marker: { color: "#82ca9d", size: 6 },
                                line: { color: lineColor, width: 2 },
                                name: metric,
                                hovertemplate: "%{x|%B %d, %Y}<br>%{y}<extra></extra>"
                            };

                            return (
                                <Tooltip
                                    key={metric}
                                    label={RANGES_STRINGS[metric]}
                                    bg="gray.700"
                                    color="white"
                                    fontSize="sm"
                                    placement="top"
                                    hasArrow
                                >
                                    <Box
                                        bg="transparent"
                                        p={3}
                                        border="none"
                                        borderRadius="lg"
                                        transition="box-shadow 0.2s, transform 0.2s"
                                        _hover={{
                                            boxShadow: "lg",
                                            transform: "translateY(-4px)"
                                        }}
                                        cursor="pointer"
                                        minW="140px"
                                        minH="220px"
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="space-between"
                                        position="relative"
                                    >
                                        <Flex direction="column" align="center">
                                            {/* Title & Expand */}
                                            <Flex
                                                width="100%"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Box
                                                    height="40px"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    textAlign="center"
                                                    flex="1"
                                                >
                                                    <Text
                                                        color="white"
                                                        fontSize="sm"
                                                        fontWeight="bold"
                                                        isTruncated
                                                    >
                                                        {metric}
                                                    </Text>
                                                </Box>
                                                <IconButton
                                                    aria-label="Expand Graph"
                                                    icon={<FaExpand />}
                                                    color="white"
                                                    bg="transparent"
                                                    _hover={{ bg: "transparent" }}
                                                    size="sm"
                                                    onClick={() =>
                                                        handleExpand(individualPlotData, metric)
                                                    }
                                                />
                                            </Flex>

                                            {/* Value & Comparison */}
                                            <Flex
                                                direction="column"
                                                justify="center"
                                                align="center"
                                                mt={1}
                                            >
                                                <Flex alignItems="center" justifyContent="center">
                                                    <Text
                                                        color="white"
                                                        fontSize="2xl"
                                                        fontWeight="bold"
                                                        textAlign="center"
                                                    >
                                                        {formatNumber(averages[metric])}{" "}
                                                        {METRIC_UNITS[metric]}
                                                    </Text>
                                                    {/* Performance Circle */}
                                                    <Box
                                                        w={3}
                                                        h={3}
                                                        bg={getPerformanceColor(
                                                            metric,
                                                            parseFloat(+averages[metric])
                                                        )}
                                                        borderRadius="50%"
                                                        ml={2}
                                                    />
                                                </Flex>
                                                {comparisonMode !== "Current" && (
                                                    <>
                                                        <Text
                                                            color={getDifferenceColor(metric)}
                                                            fontSize="sm"
                                                            fontWeight="bold"
                                                            mt={1}
                                                        >
                                                            {Math.abs(
                                                                percentageDifferences[metric]
                                                            )}
                                                            %
                                                            {percentageDifferences[metric] > 0
                                                                ? " ↑"
                                                                : " ↓"}
                                                        </Text>
                                                        <Text
                                                            color="gray.300"
                                                            fontSize="sm"
                                                            mt={0.5}
                                                        >
                                                            {comparisonMode === "Weekly"
                                                                ? "vs Last Week"
                                                                : comparisonMode === "Monthly"
                                                                ? "vs Last Month"
                                                                : "vs Last Year"}
                                                        </Text>
                                                    </>
                                                )}
                                            </Flex>
                                        </Flex>

                                        {/* Plotly mini-graph */}
                                        <Box mt={2} width="100%" height="120px" position="relative">
                                            <Plot
                                                data={[individualPlotData]}
                                                layout={{
                                                    autosize: true,
                                                    margin: { l: 40, r: 10, t: 10, b: 30 },
                                                    xaxis: {
                                                        tickfont: { size: 10, color: "white" },
                                                        type: "date",
                                                        showgrid: false,
                                                        zeroline: false,
                                                        showline: false,
                                                        ticks: "",
                                                        tickformat: "%b",
                                                        dtick: "M1",
                                                        showticklabels: true
                                                    },
                                                    yaxis: {
                                                        tickfont: { size: 10, color: "white" },
                                                        showgrid: false,
                                                        zeroline: false,
                                                        showline: false,
                                                        ticks: "",
                                                        showticklabels: true,
                                                        title: { text: "" }
                                                    },
                                                    showlegend: false,
                                                    hovermode: "closest",
                                                    paper_bgcolor: "transparent",
                                                    plot_bgcolor: "transparent"
                                                }}
                                                config={{
                                                    displayModeBar: false,
                                                    responsive: true,
                                                    hovermode: "closest"
                                                }}
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                        </Box>
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Grid>

                    {/* Expanded Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                        <ModalOverlay />
                        <ModalContent bg="gray.800" color="white">
                            <ModalHeader>
                                {modalPlotData ? modalPlotData.metric : "Expanded Graph"}
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {modalPlotData && (
                                    <Plot
                                        data={[modalPlotData]}
                                        layout={{
                                            autosize: true,
                                            margin: { l: 50, r: 50, t: 50, b: 50 },
                                            xaxis: {
                                                tickfont: { size: 12, color: "white" },
                                                type: "date",
                                                title: "Date",
                                                titlefont: { size: 14, color: "white" },
                                                tickformat: "%B %d, %Y",
                                                dtick: "M1",
                                                showticklabels: true
                                            },
                                            yaxis: {
                                                tickfont: { size: 12, color: "white" },
                                                showgrid: true,
                                                zeroline: false,
                                                showline: false,
                                                ticks: "",
                                                showticklabels: true,
                                                title: { text: "" }
                                            },
                                            showlegend: false,
                                            hovermode: "closest",
                                            paper_bgcolor: "transparent",
                                            plot_bgcolor: "transparent"
                                        }}
                                        config={{
                                            displayModeBar: true,
                                            responsive: true,
                                            hovermode: "closest"
                                        }}
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                )}
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </Flex>
            )}
        </div>
    );
};

export default General;
