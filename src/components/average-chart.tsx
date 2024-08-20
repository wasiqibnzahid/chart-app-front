import { ApexOptions } from "apexcharts";
import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ComparisonData, ResData } from "../data";
import { Switch } from "@chakra-ui/react";
export interface AverageChartProps {
  data: {
    weekly: ResData;
    quarterly: ResData;
    comparison: ComparisonData;
  };
}
const AverageChart: React.FC<AverageChartProps> = ({ data: propData }) => {
  const [data, setData] = useState(propData);
  useEffect(() => {
    setData(propData);
  }, [propData]);
  const [isQuarterly, setIsQuarterly] = useState(false);
  const [isChanges, setIsChanges] = useState(false);

  const dataToUse = useMemo(() => {
    if (isQuarterly) return data.quarterly;
    return data.weekly;
  }, [isQuarterly, data]);
  const optionsLine = useMemo<ApexOptions>(
    () => ({
      chart: {
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
      series: isChanges ? dataToUse.changes : dataToUse.data,
      title: {
        text:
          (isQuarterly ? "Quarterly" : "Weekly") +
          " " +
          (isChanges ? "Percentage Changes" : "Average"),
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
        type: !isQuarterly ? "datetime" : undefined,
      },
      yaxis: {
        labels: {
          formatter(val) {
            return val?.toFixed?.(2) || val.toString();
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        offsetY: -20,
      },
    }),
    [isChanges, dataToUse, isQuarterly]
  );

  return (
    <div id="line-adwords">
      <h5>Azteca / Competition - Overview</h5>
      <div className="d-flex align-items-center">
        <div
          className="d-flex align-items-center"
          style={{ marginRight: "auto", fontSize: "12px" }}
        >
          <span>Percentage Changes</span>
          <Switch
            colorScheme="gray"
            isChecked={!isChanges}
            onChange={() => setIsChanges(!isChanges)}
            marginBottom="0px"
            marginLeft="10px"
            marginRight="10px"
            size="md"
          />
          <span>Averages</span>
        </div>
        <div
          className="d-flex align-items-center"
          style={{ marginLeft: "auto", fontSize: "12px" }}
        >
          <span>Weekly</span>
          <Switch
            colorScheme="gray"
            marginBottom="0px"
            marginLeft="10px"
            marginRight="10px"
            size="md"
            isChecked={isQuarterly}
            onChange={() => setIsQuarterly(!isQuarterly)}
          />
          <span>Quarterly</span>
        </div>
      </div>
      <Chart
        key={isQuarterly.toString()}
        options={optionsLine}
        series={optionsLine.series}
        type="line"
        height={500}
      />
    </div>
  );
};

export default AverageChart;
