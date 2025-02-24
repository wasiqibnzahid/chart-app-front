import React, { useEffect, useMemo, useRef, useState } from "react";

// Chart
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

// Api
import { ComparisonData, Insights, QuarterData, ResData } from "../data";
import { getLocalInsights } from "../data/local_data_api_calls";

// UI Elements
import {
  Checkbox,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  Box,
  Stack,
  Text,
  HStack,
  Tag,
  TagLabel,
  Button,
} from "@chakra-ui/react";

const months = [
  "Jan", // 0
  "Feb", // 1
  "Mar", // 2
  "Apr", // 3
  "May", // 4
  "Jun", // 5
  "Jul", // 6
  "Aug", // 7
  "Sep", // 8
  "Oct", // 9
  "Nov", // 10
  "Dec", // 11
];
const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F1C40F",
  "#9B59B6",
  "#E67E22",
  "#2ECC71",
  "#3498DB",
  "#E74C3C",
  "#1ABC9C",
  "#F39C12",
  "#D35400",
  "#8E44AD",
  "#16A085",
  "#C0392B",
  "#27AE60",
  "#2980B9",
  "#F5B041",
  "#E67E22",
  "#9B59B6",
  "#34495E",
  "#BDC3C7",
  "#C0392B",
  "#2E86C1",
  "#F4D03F",
  "#D68910",
  "#A569BD",
  "#1F618D",
  "#7D3F8C",
  "#2C3E50",
  "#45B39D",
];

export interface BarChartProps {
  data: {
    weekly: ResData;
    comparison: ComparisonData;
    quarterData: QuarterData[];
  };
  titleHeading: string;
}
function calculatePercentageChange(num1: number, num2: number) {
  const difference = num2 - num1;
  const percentageChange = (difference / num1) * 100;
  return percentageChange;
}
const dropdownOptions = ["Video", "Note", "Both"];

const BarChart: React.FC<BarChartProps> = ({
  data: propData,
  getinsights,
  titleHeading,
}) => {
  // States
  const [showdateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState([""]);
  const [quarterVal, setQuarterVal] = useState([0, 11]);
  const [showAllData, setShowAllData] = useState(false);
  const [data, setData] = useState(propData);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isChecked, setIsChecked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);
  const [removedNames, setRemovedNames] = useState<string[]>([]);
  const [showRawValues, setShowRawValues] = useState(false);
  const [showZoomIn, setShowZoomIn] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Show and hide Menu
  const handleCheckboxChange = () => {
    setShowRawValues(!showRawValues); // Toggle the state
  };

  useEffect(() => {
    setDateFilter([propData?.weekly?.data[0]?.data[0]?.x]);
    setData(propData);
  }, [propData]);

  useEffect(() => {
    if (showdateFilter === false) {
      setData(propData);
    } else {
      const matchedvideosData = propData.comparison.videos.map((outerData) => {
        return {
          ...outerData,
          data: outerData.data.filter((innerData) =>
            dateFilter.includes(innerData.x)
          ),
        };
      });

      const matchednotesData = propData.comparison.notes.map((outerData) => {
        return {
          ...outerData,
          data: outerData.data.filter((innerData) =>
            dateFilter.includes(innerData.x)
          ),
        };
      });

      setData({
        ...propData,
        comparison: {
          videos: matchedvideosData,
          notes: matchednotesData,
        },
      });
    }
  }, [showdateFilter, dateFilter.length]);

  const { series, names, allNames, dateOptions } = useMemo(() => {
    let items =
      selectedOption === "Both"
        ? data.comparison.total
        : selectedOption === "Video"
        ? data.comparison.videos
        : data.comparison.notes;
    const allNames = items.map((item) => item.name);
    items = items.filter((item) => !removedNames.includes(item.name));
    const names = items.map((item) => item.name);

    if (items.length === 0) {
      return {
        series: [],
        names: [],
        allNames: allNames,
      };
    }
    if (!showAllData) {
      items = items.map((item) => ({
        ...item,
        data: item.data.filter((date) => {
          const f = new Date(date.x);
          const month = f.getMonth();

          return (
            f.getFullYear() === selectedYear &&
            month >= quarterVal[0] &&
            month <= quarterVal[1]
          );
        }),
      }));
    }

    const firstItem = items[0];

    let dateList = firstItem.data.map((item) => item.x);
    const dateOptions = firstItem.data.map((item) => item.x);
    const stuff = dateList.map((date, index) => ({
      name: date,
      data: items.map((item) => item.data[index].y),
    }));
    return {
      series: stuff.map((item, i) => ({ ...item, color: colors?.[i] })),
      names,
      allNames,
      dateOptions,
    };
  }, [
    data,
    selectedOption,
    selectedYear,
    quarterVal,
    removedNames,
    showAllData,
  ]);

  const [insightsData, setInsights] = useState<Insights>({
    notes: {
      competition: "",
      self: "",
    },
    total: {
      competition: "",
      self: "",
    },
    videos: {
      competition: "",
      self: "",
    },
  });
  const prevReqController = useRef(new AbortController());
  useEffect(() => {
    if (prevReqController.current) {
      prevReqController.current.abort();
    }
    prevReqController.current = new AbortController();
    getinsights
      ? getinsights(
          {
            start: `${quarterVal[0] > 8 ? "" : "0"}${
              quarterVal[0] + 1
            }-${selectedYear}`,
            end: `${quarterVal[1] > 8 ? "" : "0"}${
              quarterVal[1] + 1
            }-${selectedYear}`,
          },
          prevReqController.current.signal
        ).then((res) => setInsights(res))
      : getLocalInsights(
          {
            start: `${quarterVal[0] > 8 ? "" : "0"}${
              quarterVal[0] + 1
            }-${selectedYear}`,
            end: `${quarterVal[1] > 8 ? "" : "0"}${
              quarterVal[1] + 1
            }-${selectedYear}`,
          },
          prevReqController.current.signal
        ).then((res) => setInsights(res));
  }, [quarterVal]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
    },
    grid: {
      show: false, // Disable the grid lines
    },
    yaxis: {
      title: {
        text: "Values",
      },
      labels: {
        formatter(val) {
          return val.toString();
        },
      },
    },
    xaxis: {
      categories: names,
      axisBorder: {
        show: true,
      },
      labels: {
        rotate: -45,
        style: {
          colors: ["#000"],
        },
      },
    },
    legend: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: showRawValues, // Enable data labels
      style: {
        fontSize: "12px",
        colors: ["#fff"], // White color for visibility
      },
      formatter: function (val) {
        return val % 1 === 0 ? val.toFixed?.(0) : val.toFixed?.(2);
      },
      offsetY: -20, // Position the label above the bar
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return `${val}  units`; // Customize this to show your units
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        distributed: true,
        dataLabels: {
          position: "top", // Show data labels on top of each bar
        },
      },
    },
  };

  const items = useMemo(() => {
    return names.map((_name, index) => {
      const values = series
        .map((s) => s.data[index])
        .filter((v) => v !== undefined);

      // Use indices as x values (0, 1, 2, ...) if x is evenly spaced
      const x = Array.from({ length: values.length }, (_, i) => i);

      if (values.length < 2) {
        return NaN; // Not enough data points to calculate slope
      }

      const { slope } = linearRegression(x, values);

      return Number(slope.toFixed(1)); // Return the slope, rounded to 1 decimal place
    });
  }, [series]);

  function linearRegression(x: number[], y: number[]) {
    const n = x.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
    }

    // Calculate slope using the linear regression formula
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return { slope };
  }

  const insights =
    selectedOption === "Both"
      ? insightsData.total
      : selectedOption === "Video"
      ? insightsData.videos
      : insightsData.notes;

  function onClickHandler(name: string) {
    if (!removedNames.includes(name)) {
      setRemovedNames((old) => [...old, name]);
    } else {
      const newArr = [...removedNames];
      const index = newArr.indexOf(name);
      newArr.splice(index, 1);
      setRemovedNames(newArr);
    }
  }
  useEffect(() => {
    if (names.length < 9 && isChecked) {
      setIsChecked(false);
    }
  }, [isChecked, names]);

  const handleSelectDateChange = (e) => {
    const value = e.target.value;

    // Check if the value is already in the dateFilter array
    if (!dateFilter.includes(value) && value) {
      setDateFilter([...dateFilter, value]);
      setSelectedDate(value);
    }
  };
  return (
    <section
      style={{
        position: "relative",
      }}
    >
      {/* Header Text */}
      <div className="justify-content-between align-items-center">
        <div>
          <h5>{titleHeading}</h5>
        </div>
        <section className="VerticalBarChart__legend">
          {/* control SVG Start */}
          <div>
            <button
              onClick={() => setShowControls(!showControls)}
              style={{
                outline: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M6 5V20"
                    stroke={showControls ? "white" : "gray"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 5V20"
                    stroke={showControls ? "white" : "gray"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 5V20"
                    stroke={showControls ? "white" : "gray"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.5 16C8.5 17.3807 7.38071 18.5 6 18.5C4.61929 18.5 3.5 17.3807 3.5 16C3.5 14.6193 4.61929 13.5 6 13.5C7.38071 13.5 8.5 14.6193 8.5 16Z"
                    fill={showControls ? "white" : "gray"}
                  />
                  <path
                    d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z"
                    fill={showControls ? "white" : "gray"}
                  />
                  <path
                    d="M20.5 16C20.5 17.3807 19.3807 18.5 18 18.5C16.6193 18.5 15.5 17.3807 15.5 16C15.5 14.6193 16.6193 13.5 18 13.5C19.3807 13.5 20.5 14.6193 20.5 16Z"
                    fill={showControls ? "white" : "gray"}
                  />
                </g>
              </svg>
            </button>
          </div>
          {/* Control SVG End */}

          {/* Insights SVG Start */}
          <div>
            <button
              onClick={() => setShowZoomIn(!showZoomIn)}
              style={{
                outline: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 488.484 488.484"
                xmlSpace="preserve"
                fill={showZoomIn ? "white" : "gray"}
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <g>
                      <path
                        d="M244.236,0.002C109.562,0.002,0,109.565,0,244.238c0,134.679,109.563,244.244,244.236,244.244 
              c134.684,0,244.249-109.564,244.249-244.244C488.484,109.566,378.92,0.002,244.236,0.002z M244.236,413.619 
              c-93.4,0-169.38-75.979-169.38-169.379c0-93.396,75.979-169.375,169.38-169.375s169.391,75.979,169.391,169.375 
              C413.627,337.641,337.637,413.619,244.236,413.619z"
                      />
                      <path
                        d="M244.236,206.816c-14.757,0-26.619,11.962-26.619,26.73v118.709c0,14.769,11.862,26.735,26.619,26.735 
              c14.769,0,26.62-11.967,26.62-26.735V233.546C270.855,218.778,259.005,206.816,244.236,206.816z"
                      />
                      <path
                        d="M244.236,107.893c-19.949,0-36.102,16.158-36.102,36.091c0,19.934,16.152,36.092,36.102,36.092 
              c19.929,0,36.081-16.158,36.081-36.092C280.316,124.051,264.165,107.893,244.236,107.893z"
                      />
                    </g>
                  </g>
                </g>
              </svg>
            </button>
          </div>
          {/* Insights SVG End */}

          {/* Dropdown */}
          <div>
            <Box>
              <Select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                border="2px"
                borderColor="#cbd5e0" // Apply the border color
                borderRadius="8px"
                size="sm"
                color="white"
                bg="transparent"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ borderColor: "gray.300", boxShadow: "none" }}
                iconColor="white"
                width="fit-content"
              >
                {dropdownOptions.map((item) => (
                  <option key={item} value={item} style={{ color: "black" }}>
                    {item}
                  </option>
                ))}
              </Select>
            </Box>
          </div>
        </section>
      </div>

      {/* Chart */}
      <div
        style={{
          position: "relative",
        }}
        onClick={() => console.log(options, series)}
      >
        <Chart options={options} series={series} type="bar" height={200} />
      </div>

      {/* Perncentages Color Values before Chart */}
      {isChecked && (
        <div
          style={{
            position: "relative",
            top: "0px",
            zIndex: 1000,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            textAlign: "center",
          }}
          className="my-item"
        >
          {items.map((item) => (
            <span
              style={{
                background: isNaN(item)
                  ? "transparent"
                  : item > 0
                  ? "#3dae63"
                  : "#dc2c3e",
                borderRadius: "8px",
                padding: "0.25rem 0.25rem",
                color: "#fff",
                width: "50px",
              }}
              // className={`${item > 0 ? "text-green" : "text-red"}`}
            >
              {!isNaN(item) ? (
                <>
                  {item > 0 ? "▲" : "▼"}
                  {item}%
                </>
              ) : (
                <></>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Range Line */}
      <div
        className="px-4 mb-3 slider-container"
        style={{
          marginTop: "3%",
          position: "relative",
        }}
      >
        <RangeSlider
          isDisabled={showAllData}
          min={0}
          max={11}
          step={1}
          value={quarterVal}
          onChange={(e) => setQuarterVal(e)}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={3} index={0} />
          <RangeSliderThumb boxSize={3} index={1} />
        </RangeSlider>

        <div className="d-flex justify-content-between">
          {months.map((month) => (
            <span
              key={month}
              style={{
                color: "#cbd5e0",
              }}
            >
              {month}
            </span>
          ))}
        </div>
        <div className="mt-2 d-flex justify-content-between align-items-center">
          <Button
            size="sm"
            colorScheme="purple"
            isDisabled={showAllData}
            onClick={() => setSelectedYear(selectedYear - 1)}
          >
            &larr;
          </Button>
          <Button
            size="sm"
            colorScheme="purple"
            isDisabled={showAllData || selectedYear >= new Date().getFullYear()}
            onClick={() => setSelectedYear(selectedYear + 1)}
          >
            &rarr;
          </Button>
        </div>
      </div>

      {/* Open When user click on Zoom in then show this */}

      {/* Companies Checkbox */}
      {showControls && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#fff",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {allNames.map((name, i) => (
            <span
              key={name + i}
              className="checkbox-container-sm d-flex justify-content-center align-items-center"
              style={{
                cursor: "pointer",
              }}
            >
              <Checkbox
                size="sm"
                colorScheme="purple"
                isChecked={!removedNames.includes(name)}
                id={`ASD-${name}`}
                onChange={() => onClickHandler(name)}
              />
              <label htmlFor={`ASD-${name}`}>{name}</label>
            </span>
          ))}
        </div>
      )}
      {/* Checkbox for row, perncetage and show all data */}

      <section
        style={{
          marginTop: "3%",
          overflow: "hidden",
          transition: "max-height 0.7s ease",
        }}
      >
        <Box p={0} borderRadius="md" color="white">
          {showControls && (
            <>
              {/* Check Box Row's */}
              <section
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "start",
                  alignItems: "start",
                  textAlign: "center",
                  gap: 5,
                  marginBottom: "2%",
                }}
              >
                {/* control SVG Start */}
                <div>
                  <button
                    onClick={() => setShowControls(!showControls)}
                    style={{
                      outline: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <g id="SVGRepo_iconCarrier">
                        <path
                          d="M6 5V20"
                          stroke={showControls ? "white" : "gray"}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 5V20"
                          stroke={showControls ? "white" : "gray"}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 5V20"
                          stroke={showControls ? "white" : "gray"}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8.5 16C8.5 17.3807 7.38071 18.5 6 18.5C4.61929 18.5 3.5 17.3807 3.5 16C3.5 14.6193 4.61929 13.5 6 13.5C7.38071 13.5 8.5 14.6193 8.5 16Z"
                          fill={showControls ? "white" : "gray"}
                        />
                        <path
                          d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z"
                          fill={showControls ? "white" : "gray"}
                        />
                        <path
                          d="M20.5 16C20.5 17.3807 19.3807 18.5 18 18.5C16.6193 18.5 15.5 17.3807 15.5 16C15.5 14.6193 16.6193 13.5 18 13.5C19.3807 13.5 20.5 14.6193 20.5 16Z"
                          fill={showControls ? "white" : "gray"}
                        />
                      </g>
                    </svg>
                  </button>
                </div>
                {/* Control SVG End */}
                <div>
                  <Stack direction="row" spacing={5} align="center" mb={0}>
                    <Checkbox
                      isDisabled={names.length < 9}
                      id="x-scheme"
                      isChecked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="white"
                      borderColor="white"
                      size="lg"
                    >
                      Show percentages
                    </Checkbox>

                    <Checkbox
                      id="show-all-data-2"
                      isChecked={showAllData}
                      onChange={(e) => setShowAllData(e.target.checked)}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="white"
                      borderColor="white"
                      size="lg"
                    >
                      Show All Data
                    </Checkbox>

                    <Checkbox
                      checked={showRawValues}
                      onChange={handleCheckboxChange}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="white"
                      borderColor="white"
                      size="lg"
                    >
                      Show Raw Values
                    </Checkbox>
                    <Checkbox
                      id="datefilter"
                      checked={showdateFilter}
                      onChange={(e) => setShowDateFilter(e.target.checked)}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="white"
                      borderColor="white"
                      size="lg"
                    >
                      Show Date Filter
                    </Checkbox>
                  </Stack>
                </div>
              </section>

              {/* <HStack spacing={4} mb={8}>
                  <Checkbox
                    colorScheme="transparent"
                    outline="none"
                    iconColor="white"
                    borderColor="white"
                    size="lg"
                  />
                  <Select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="custom-select"
                  >
                    <option value="" disabled>Select Date</option>
                    {dateOptions.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </Select>

                </HStack> */}
              {showdateFilter && (
                <>
                  <Box ml={5}>
                    {dateFilter.length > 0 &&
                      dateFilter.map((date) => (
                        <Tag
                          key={date}
                          size="sm"
                          variant="solid"
                          colorScheme="teal"
                          mb={4}
                          mx={0.5}
                        >
                          <TagLabel>{date}</TagLabel>
                        </Tag>
                      ))}
                  </Box>
                  <HStack mb={8} mx={5}>
                    <Select
                      value={selectedDate}
                      onChange={handleSelectDateChange}
                      style={{
                        height: "30px",
                        fontSize: "14px",
                        padding: "4px",
                        borderRadius: "5px",
                      }}
                    >
                      {propData.weekly.data?.[1].data.map((date) => (
                        <option
                          key={date.x}
                          style={{ color: "black" }}
                          value={date.x}
                        >
                          {date.x}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </>
              )}
            </>
          )}

          {showZoomIn && (
            <section
              style={{
                transition: "max-height 0.7s ease",
                maxHeight: showZoomIn ? "200px" : "0px",
              }}
            >
              <Stack spacing={2} mb={0}>
                <HStack
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "start",
                    textAlign: "start",
                    alignItems: "start",
                  }}
                >
                  {/* Insights SVG Start */}
                  <div>
                    <button
                      onClick={() => setShowZoomIn(!showZoomIn)}
                      style={{
                        outline: "none",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "50%",
                      }}
                    >
                      <svg
                        version="1.1"
                        id="Capa_1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 488.484 488.484"
                        xmlSpace="preserve"
                        fill={showZoomIn ? "white" : "gray"}
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <g id="SVGRepo_iconCarrier">
                          <g>
                            <g>
                              <path
                                d="M244.236,0.002C109.562,0.002,0,109.565,0,244.238c0,134.679,109.563,244.244,244.236,244.244 
              c134.684,0,244.249-109.564,244.249-244.244C488.484,109.566,378.92,0.002,244.236,0.002z M244.236,413.619 
              c-93.4,0-169.38-75.979-169.38-169.379c0-93.396,75.979-169.375,169.38-169.375s169.391,75.979,169.391,169.375 
              C413.627,337.641,337.637,413.619,244.236,413.619z"
                              />
                              <path
                                d="M244.236,206.816c-14.757,0-26.619,11.962-26.619,26.73v118.709c0,14.769,11.862,26.735,26.619,26.735 
              c14.769,0,26.62-11.967,26.62-26.735V233.546C270.855,218.778,259.005,206.816,244.236,206.816z"
                              />
                              <path
                                d="M244.236,107.893c-19.949,0-36.102,16.158-36.102,36.091c0,19.934,16.152,36.092,36.102,36.092 
              c19.929,0,36.081-16.158,36.081-36.092C280.316,124.051,264.165,107.893,244.236,107.893z"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </button>
                  </div>
                  {/* Insights SVG End */}
                  <Text style={{ lineHeight: "2rem" }}>
                    {insights ? insights.self : "There is no insights"} <br />
                    {insights ? insights.competition : "There is no insights"}
                  </Text>
                </HStack>
              </Stack>
            </section>
          )}
        </Box>
      </section>
    </section>
  );
};

export default BarChart;
