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
export interface AverageChartProps {
  data: {
    weekly: ResData;
    comparison: ComparisonData;
    quarterData: QuarterData[];
  };
}
const dropdownOptions = ["Video", "Note", "Both"];
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
const AverageChart: React.FC<AverageChartProps> = ({ data: propData }) => {
  const [showAllData, setShowAllData] = useState(false);
  const [data, setData] = useState(propData);
  useEffect(() => {
    setData(propData);
  }, [propData]);
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
        animations: {},
        height: 328,
        type: "line",
        zoom: {},
        dropShadow: {
          enabled: true,
          top: 3,
          left: 2,
          blur: 4,
          opacity: 1,
        },
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      series: dataToUse.map((item, index) => ({
        ...item,
        color: index === 1 ? "#fdc437" : undefined,
      })),
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
        show: true,
        padding: {
          bottom: 0,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "horizontal",
          colorStops: [
            [
              {
                offset: 20,
                color: "#3bae63",
                opacity: 1,
              },
              {
                offset: 40,
                color: "#0574cd",
                opacity: 1,
              },
              {
                offset: 60,
                color: "#7444ba",
                opacity: 1,
              },
              {
                offset: 80,
                color: "#f32e42",
                opacity: 1,
              },
              {
                offset: 100,
                color: "#fdc437",
                opacity: 1,
              },
            ],
            [
              {
                offset: 100,
                color: "#fdc437",
                opacity: 1,
              },
            ],
          ],
        },
      },
      xaxis: {
        tooltip: {
          enabled: false,
        },
        // labels: {
        //   ...(isQuarterly
        //     ? {
        //         formatter(value) {
        //           return "Q" + value;
        //         },
        //       }
        //     : {
        //         formatter: undefined,
        //       }),
        // },
        type: "datetime",
      },
      yaxis: {
        labels: {
          formatter(val) {
            return val?.toFixed?.(2) || val.toString();
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        // offsetY: -20,
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
        enabled: true,
        formatter(val, data): any {
          const item = dataToUse[data.seriesIndex].data[data.dataPointIndex]?.y;
          const prevItem =
            dataToUse[data.seriesIndex].data?.[data.dataPointIndex - 1]?.y;
          let str = "";
          if (item && prevItem) {
            if (item > prevItem) {
              str += "▲ ";
            } else {
              str += "▼ ";
            }
            let difference = item - prevItem;
            let percentageDifference = +((difference / prevItem) * 100).toFixed(
              2
            );
            str += percentageDifference;
          }
          const res = [];
          if (showVals) {
            res.push(val.toString());
          }
          if (str && showPercentages) {
            res.unshift(str + "%");
          }
          return res;
        },
        background: {
          enabled: true,
          borderColor: "transparent",
        },
        distributed: true,
        style: {
          colors: [
            function (data: any) {
              const item = data.series[data.seriesIndex][data.dataPointIndex];
              const prevItem =
                data.series[data.seriesIndex]?.[data.dataPointIndex - 1];
              if (item && prevItem) {
                if (item > prevItem) return "#3dae63";
                return "#dc2c3e";
              }
              return "#3dae63";
            },
          ],
        },
      },
    }),
    [dataToUse, showPercentages, showVals]
  );
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
  const insights =
    selectedDropdown === "Both"
      ? insightsData.total
      : selectedDropdown === "Video"
      ? insightsData.videos
      : insightsData.notes;
  return (
    <div id="line-adwords">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5>General Azteca vs Competition Overview</h5>
        </div>
        <div style={{ width: "300px" }}>
          <Select
            value={selectedDropdown}
            onChange={(e) => setSelectedDropdown(e.target.value)}
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
        style={{ gap: "0.5rem" }}
      >
        <div
          className="d-flex justify-items-center align-items-center mt-2"
          style={{ gap: "0.25rem", fontSize: "12px" }}
        >
          <Checkbox
            id="x-scheme-2"
            isChecked={showPercentages}
            onChange={(e) => setShowPercentages(e.target.checked)}
            colorScheme="purple"
          />
          <label htmlFor="x-scheme-2">X-Mode</label>
        </div>
        <div
          className="d-flex justify-content-end align-items-center mt-2"
          style={{ gap: "0.25rem", fontSize: "12px" }}
        >
          <Checkbox
            id="show-all-data"
            isChecked={showAllData}
            onChange={(e) => setShowAllData(e.target.checked)}
            colorScheme="purple"
          />
          <label htmlFor="show-all-data">Show All Data</label>
        </div>
        <div
          className="d-flex align-items-center mt-2"
          style={{ gap: "0.25rem", fontSize: "12px" }}
        >
          <Checkbox
            id="raw-value"
            isChecked={showVals}
            onChange={(e) => setShowVals(e.target.checked)}
            colorScheme="purple"
          />
          <label htmlFor="raw-value">Show Raw Values</label>
        </div>
      </div>
      <Chart
        options={optionsLine}
        series={optionsLine.series}
        type="line"
        height={500}
      />
      <div
        className="px-4 mb-3 slider-container"
        style={{
          position: "relative",
        }}
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
            <RangeSliderFilledTrack bg="#a8def8" />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={3} index={0} />
          <RangeSliderThumb boxSize={3} index={1} />
        </RangeSlider>
        <div className="d-flex justify-content-between align-items-center">
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
        <div className="d-flex justify-content-between slider-custom-text">
          <span>Q1.{selectedYear.toString().substring(2)}</span>
          <span>Q2.{selectedYear.toString().substring(2)}</span>
          <span>Q3.{selectedYear.toString().substring(2)}</span>
          <span>Q4.{selectedYear.toString().substring(2)}</span>
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
  );
};

export default AverageChart;
