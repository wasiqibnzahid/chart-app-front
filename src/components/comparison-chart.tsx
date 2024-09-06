import { ApexOptions } from "apexcharts";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "react-apexcharts";
import {
  ComparisonData,
  getInsights,
  Insights,
  QuarterData,
  ResData,
} from "../data";
import {
  Button,
  Checkbox,
  ListItem,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  UnorderedList,
} from "@chakra-ui/react";

const months = [
  "January", // 0
  "February", // 1
  "March", // 2
  "April", // 3
  "May", // 4
  "June", // 5
  "July", // 6
  "August", // 7
  "September", // 8
  "October", // 9
  "November", // 10
  "December", // 11
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
}
function calculatePercentageChange(num1: number, num2: number) {
  const difference = num2 - num1;
  const percentageChange = (difference / num1) * 100;
  return percentageChange;
}
const dropdownOptions = ["Video", "Note", "Both"];
const BarChart: React.FC<BarChartProps> = ({ data: propData }) => {
  const [quarterVal, setQuarterVal] = useState([0, 11]);
  const [showAllData, setShowAllData] = useState(false);
  const [data, setData] = useState(propData);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isChecked, setIsChecked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);
  const [removedNames, setRemovedNames] = useState<string[]>([]);

  useEffect(() => {
    setData(propData);
  }, [propData]);
  const { series, names, allNames } = useMemo(() => {
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
    const stuff = dateList.map((date, index) => ({
      name: date,
      data: items.map((item) => item.data[index].y),
    }));
    return {
      series: stuff.map((item, i) => ({ ...item, color: colors?.[i] })),
      names,
      allNames,
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
    getInsights(
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
      stacked: false, // Set to false for grouped bars
    },

    yaxis: {
      title: {
        text: "Values",
      },
    },

    xaxis: {
      categories: names,
      axisBorder: {
        show: true,
      },
      labels: {
        style: {
          colors: ["#000"],
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {},
    },
    plotOptions: {
      bar: {
        horizontal: false,
        distributed: true,

        dataLabels: {
          position: "top",
          total: {
            enabled: true,
          },
        },
      },
    },
  };
  const items = useMemo(() => {
    return names.map((_name, index) => {
      const first = series?.[0]?.data?.[index];
      const last = series?.[series.length - 1]?.data?.[index];
      return Number(calculatePercentageChange(first, last).toFixed(0));
    });
  }, [series]);
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
  return (
    <div className="custom-legend-container">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5>Individual Azteca vs Competition Overview</h5>
        </div>
        <div
          style={{ width: "300px", marginLeft: "auto", marginBottom: "0.5rem" }}
        >
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            {dropdownOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          gap: "0.5rem",
        }}
      >
        <div
          className="d-flex justify-items-center align-items-center mt-2"
          style={{ gap: "0.25rem", fontSize: "12px" }}
        >
          <Checkbox
            isDisabled={names.length < 9}
            id="x-scheme"
            isChecked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            colorScheme="purple"
          />
          <label htmlFor="x-scheme">X-Mode</label>
        </div>
        <div
          className="d-flex justify-content-end align-items-center mt-2"
          style={{ gap: "0.25rem", fontSize: "12px" }}
        >
          <Checkbox
            id="show-all-data-2"
            isChecked={showAllData}
            onChange={(e) => setShowAllData(e.target.checked)}
            colorScheme="purple"
          />
          <label htmlFor="show-all-data-2">Show All Data</label>
        </div>
      </div>

      <div
        style={{
          position: "relative",
        }}
      >
        {isChecked && (
          <div
            style={{
              position: "absolute",
              top: "35px",
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
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
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
      <div
        className="px-4 mb-3 slider-container"
        style={{
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
          <RangeSliderTrack bg="red.100">
            <RangeSliderFilledTrack bg="#a8def8" />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={3} index={0} />
          <RangeSliderThumb boxSize={3} index={1} />
        </RangeSlider>
        <div className="d-flex justify-content-between align-items-center">
          <Button
            size="sm"
            colorScheme="purple"
            onClick={() => setSelectedYear(selectedYear - 1)}
            isDisabled={showAllData}
          >
            &larr;
          </Button>
          <Button
            size="sm"
            colorScheme="purple"
            onClick={() => setSelectedYear(selectedYear + 1)}
            isDisabled={showAllData || selectedYear >= new Date().getFullYear()}
          >
            &rarr;
          </Button>
        </div>
        <div className="d-flex justify-content-between slider-custom-text">
          {months.map((month) => (
            <span key={month}>
              {month.substring(0, 3)}.{selectedYear.toString().substring(2)}
            </span>
          ))}
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            color: "#fff",
            fontSize: "12px",
          }}
        >
          <span>{months[quarterVal[0]]}</span>
          <span>&nbsp;-&nbsp;</span>
          <span>{months[quarterVal[1]]}</span>
        </div>
      </div>
      <div className="mt-2">
        <h5>Insights</h5>
        <UnorderedList>
          <ListItem>
            {insights.competition?.split(",")[0] ||
              "No significant changes were observed across the Competition companies."}
          </ListItem>
          <ListItem>
            {insights.self?.split(",")[0] ||
              "No significant changes were observed across the TV Azteca companies."}
          </ListItem>
        </UnorderedList>
      </div>
    </div>
  );
};

export default BarChart;
