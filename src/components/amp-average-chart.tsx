import React, { useEffect, useMemo, useRef, useState } from "react";

// Charts
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

// Api
import {
  ComparisonData,
  getInsights,
  Insights,
  QuarterData,
  ResData,
} from "../data";

// UI Elements
import {
  Box,
  Button,
  Checkbox,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  Stack,
  Text,
  HStack,
  Tag,
  TagLabel,
} from "@chakra-ui/react";

export interface AverageChartProps {
  data: {
    weekly: ResData;
    comparison: ComparisonData;
    quarterData: QuarterData[];
  };
}

const dropdownOptions = ["Video", "Note", "Both"];
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
const seriesColors: { [key: string]: string } = {
  "TV Azteca": "#3357FF",
  Competition: "#FF5733",
  AMP: "#DAA520",
};

const AmpAverageChart: React.FC<AverageChartProps> = ({ data: propData }) => {
  // States
  const [showZoomIn, setShowZoomIn] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showdateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState([""]);
  const [selectedDate, setSelectedDate] = useState("");

  const [showAllData, setShowAllData] = useState(false);
  const [data, setData] = useState(propData);
  useEffect(() => {
    setDateFilter([propData?.weekly?.data[0]?.data[0]?.x]);
    setData(propData);
  }, [propData]);
  useEffect(() => {
    if (!showdateFilter) {
      setData(propData);
    } else {
      const matchedweeklyData = propData.weekly.data.map((outerData) => ({
        ...outerData,
        data: outerData.data.filter((innerData) =>
          dateFilter.includes(innerData.x)
        ),
      }));

      const matchedchangesData = propData.weekly.changes.map((outerData) => ({
        ...outerData,
        data: outerData.data.filter((innerData) =>
          dateFilter.includes(innerData.x)
        ),
      }));

      setData({
        ...propData,
        weekly: {
          data: matchedweeklyData,
          changes: matchedchangesData,
        },
      });
    }
  }, [showdateFilter, dateFilter.length]);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [quarterVal, setQuarterVal] = useState([0, 11]);

  const [selectedDropdown, setSelectedDropdown] = useState(dropdownOptions[0]);
  const [showVals, setShowVals] = useState(false);
  const [showPercentages, setShowPercentages] = useState(false);

  const dataToUse = useMemo(() => {
    let mainDataUse = [...data.weekly.data];

    mainDataUse = mainDataUse
      .filter((item) => {
        if (selectedDropdown === "Video") {
          return item.name.includes("Video");
        } else if (selectedDropdown === "Note") {
          return item.name.includes("Note");
        } else
          return !item.name.includes("Note") && !item.name.includes("Video");
      })
      .map((data) => ({
        ...data,
        name: data.name
          .replace(" Avg", "")
          .replace(" Video", "")
          .replace(" Note", ""),
      }));
    if (!showAllData) {
      mainDataUse = mainDataUse.map((item) => ({
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
    return mainDataUse;
  }, [data, selectedDropdown, quarterVal, selectedYear, showAllData]);

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
  const optionsLine = useMemo<ApexOptions>(
    () => ({
      chart: {
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        height: 328,
        type: "area",
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      title: {
        align: "left",
        offsetY: 25,
        offsetX: 20,
      },
      markers: {
        size: 6,
        strokeWidth: 0,
        hover: {
          size: 9,
        },
      },
      grid: {
        show: false,
        padding: {
          bottom: 0,
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          formatter(val) {
            return val.toString();
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
      },
      colors: dataToUse.map((item) => seriesColors[item.name] || "#000"),
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        offsetY:
          showVals && showPercentages
            ? -20
            : showVals
            ? -10
            : showPercentages
            ? -10
            : 0,
        enabled: showVals || showPercentages,
        formatter(val, data): string {
          const item =
            dataToUse[data.seriesIndex].data[data.dataPointIndex]?.y;
          const prevItem =
            dataToUse[data.seriesIndex].data?.[data.dataPointIndex - 1]?.y;
          let str = "";
          if (item !== undefined && prevItem !== undefined) {
            str += item > prevItem ? "▲ " : item < prevItem ? "▼ " : "- ";
            let percentageDifference = +((item - prevItem) / prevItem * 100).toFixed(1);
            str += percentageDifference;
          }
          const res = [];
          if (showVals) res.push(val.toString());
          if (str && showPercentages) res.unshift(`${str}%`);
          return res.join(" ");
        },
        background: {
          enabled: true,
          borderColor: "transparent",
        },
        distributed: false,
        style: {
          colors: dataToUse.map((item) => seriesColors[item.name] || "#000"),
        },
      },
      tooltip: {
        enabled: true,
        x: {
          format: "dd MMM yyyy",
        },
        y: {
          formatter: function (val) {
            return `${val} units`;
          },
        },
      },
    }),
    [dataToUse, showPercentages, showVals]
  );

  const seriesLine = useMemo(() => {
    return dataToUse.map((item) => ({
      name: item.name,
      data: item.data.map((d) => ({
        x: d.x,
        y: d.y,
      })),
    }));
  }, [dataToUse]);

  const prevReqController = useRef(new AbortController());
  useEffect(() => {
    if (prevReqController.current) {
      prevReqController.current.abort();
    }
    prevReqController.current = new AbortController();
    getInsights(
      {
        start: `${quarterVal[0] > 8 ? "" : "0"}${quarterVal[0] + 1}-${
          selectedYear
        }`,
        end: `${quarterVal[1] > 8 ? "" : "0"}${quarterVal[1] + 1}-${
          selectedYear
        }`,
      },
      prevReqController.current.signal
    ).then((res) => setInsights(res));
  }, [quarterVal]);
  const insights =
    selectedDropdown === "Both"
      ? insightsData.total
      : selectedDropdown === "Video"
      ? insightsData.videos
      : insightsData.notes;

  const handleSelectDateChange = (e) => {
    const value = e.target.value;
    if (!dateFilter.includes(value) && value) {
      setDateFilter([...dateFilter, value]);
      setSelectedDate(value);
    }
  };

  return (
    <div id="line-adwords">
      {/* Header Text */}
      <div className="justify-content-between align-items-center mb-4">
        <div>
          <h5 style={{ color: "black" }}>
            AMP vs Azteca vs Competition Overview
          </h5>
        </div>

        <section className="VerticalBarChart__legend">
          {/* Control SVG */}
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
                style={{ fill: "black", stroke: "black" }}
              >
                <g>
                  <path
                    d="M6 5V20"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 5V20"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 5V20"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.5 16C8.5 17.3807 7.38071 18.5 6 18.5C4.61929 18.5 3.5 17.3807 3.5 16C3.5 14.6193 4.61929 13.5 6 13.5C7.38071 13.5 8.5 14.6193 8.5 16Z"
                    fill="black"
                  />
                  <path
                    d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z"
                    fill="black"
                  />
                  <path
                    d="M20.5 16C20.5 17.3807 19.3807 18.5 18 18.5C16.6193 18.5 15.5 17.3807 15.5 16C15.5 14.6193 16.6193 13.5 18 13.5C19.3807 13.5 20.5 14.6193 20.5 16Z"
                    fill="black"
                  />
                </g>
              </svg>
            </button>
          </div>
          {/* Insights SVG */}
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
                style={{ fill: "black" }}
              >
                <g>
                  <path
                    d="M244.236,0.002C109.562,0.002,0,109.565,0,244.238c0,134.679,109.563,244.244,244.236,244.244 c134.684,0,244.249-109.564,244.249-244.244C488.484,109.566,378.92,0.002,244.236,0.002z 
                  M244.236,413.619c-93.4,0-169.38-75.979-169.38-169.379c0-93.396,75.979-169.375,169.38-169.375s169.391,75.979,169.391,169.375 
                  C413.627,337.641,337.637,413.619,244.236,413.619z"
                  />
                  <path
                    d="M244.236,206.816c-14.757,0-26.619,11.962-26.619,26.73v118.709c0,14.769,11.862,26.735,26.619,26.735 c14.769,0,26.62-11.967,26.62-26.735V233.546C270.855,218.778,259.005,206.816,244.236,206.816z"
                  />
                  <path
                    d="M244.236,107.893c-19.949,0-36.102,16.158-36.102,36.091c0,19.934,16.152,36.092,36.102,36.092 c19.929,0,36.081-16.158,36.081-36.092C280.316,124.051,264.165,107.893,244.236,107.893z"
                  />
                </g>
              </svg>
            </button>
          </div>
          {/* Dropdown */}
          <div>
            <Box>
              <Select
                value={selectedDropdown}
                onChange={(e) => setSelectedDropdown(e.target.value)}
                border="2px"
                borderColor="black"
                borderRadius="8px"
                size="sm"
                color="black"
                bg="transparent"
                _hover={{ borderColor: "black" }}
                _focus={{ borderColor: "black", boxShadow: "none" }}
                iconColor="black"
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
      <Chart
        options={optionsLine}
        series={seriesLine}
        type="area"
        height={250}
      />

      {/* Range Line */}
      <div
        className="px-4 mb-3 slider-container"
        style={{ position: "relative" }}
      >
        <RangeSlider
          defaultValue={[0, 100]}
          min={0}
          max={11}
          step={1}
          value={quarterVal}
          onChange={(e) => setQuarterVal(e)}
          isDisabled={showAllData}
        >
          <RangeSliderTrack bg="red.100">
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={3} index={0} />
          <RangeSliderThumb boxSize={3} index={1} />
        </RangeSlider>

        <div className="d-flex justify-content-between slider-custom-text">
          {months.map((month) => (
            <span key={month} style={{ color: "black" }}>
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

      {/* Controls/Zoom Section */}
      <section
        style={{
          marginTop: "3%",
          overflow: "hidden",
          transition: "max-height 0.7s ease",
        }}
      >
        <Box p={0} borderRadius="md" color="black">
          {showControls && (
            <>
              {/* Checkbox Row */}
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
                {/* Control SVG */}
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
                      style={{ fill: "black", stroke: "black" }}
                    >
                      <g>
                        <path
                          d="M6 5V20"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 5V20"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 5V20"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8.5 16C8.5 17.3807 7.38071 18.5 6 18.5C4.61929 18.5 3.5 17.3807 3.5 16C3.5 14.6193 4.61929 13.5 6 13.5C7.38071 13.5 8.5 14.6193 8.5 16Z"
                          fill="black"
                        />
                        <path
                          d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z"
                          fill="black"
                        />
                        <path
                          d="M20.5 16C20.5 17.3807 19.3807 18.5 18 18.5C16.6193 18.5 15.5 17.3807 15.5 16C15.5 14.6193 16.6193 13.5 18 13.5C19.3807 13.5 20.5 14.6193 20.5 16Z"
                          fill="black"
                        />
                      </g>
                    </svg>
                  </button>
                </div>
                {/* End Control SVG */}
                <div>
                  <Stack direction="row" spacing={5} align="center" mb={0}>
                    <Checkbox
                      id="x-scheme"
                      isChecked={showPercentages}
                      onChange={(e) => setShowPercentages(e.target.checked)}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="black"
                      borderColor="black"
                      size="lg"
                    >
                      Show percentages
                    </Checkbox>
                    <Checkbox
                      id="show-all-data"
                      isChecked={showAllData}
                      onChange={(e) => setShowAllData(e.target.checked)}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="black"
                      borderColor="black"
                      size="lg"
                    >
                      Show All Data
                    </Checkbox>
                    <Checkbox
                      id="raw-value"
                      checked={showVals}
                      onChange={(e) => setShowVals(e.target.checked)}
                      colorScheme="transparent"
                      outline="none"
                      iconColor="black"
                      borderColor="black"
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
                      iconColor="black"
                      borderColor="black"
                      size="lg"
                    >
                      Show Date Filter
                    </Checkbox>
                  </Stack>
                </div>
              </section>
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
                        color: "black",
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
                  {/* Insights SVG */}
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
                        style={{ fill: "black" }}
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
                  <Text style={{ lineHeight: "2rem", color: "black" }}>
                    {insights ? insights.self : "There is no insights"} <br />
                    {insights ? insights.competition : "There is no insights"}
                  </Text>
                </HStack>
              </Stack>
            </section>
          )}
        </Box>
      </section>
    </div>
  );
};

export default AmpAverageChart;
