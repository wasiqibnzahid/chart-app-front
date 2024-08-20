import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ComparisonData, ResData } from "../data";
import { ListItem, Select, UnorderedList } from "@chakra-ui/react";
export interface BarChartProps {
  data: {
    weekly: ResData;
    quarterly: ResData;
    comparison: ComparisonData;
  };
}
const dropdownOptions = ["Video", "Note", "Both"];
const BarChart: React.FC<BarChartProps> = ({ data: propData }) => {
  const [data, setData] = useState(propData);
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);
  useEffect(() => {
    setData(propData);
  }, [propData]);
  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false, // Set to false for grouped bars
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%", // Adjust width of each bar
      },
    },

    yaxis: {
      title: {
        text: "Values",
      },
    },
    xaxis: {
      type: "datetime",
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: any) => `$${val}`,
      },
    },
  };
  const series =
    selectedOption === "Both"
      ? data.comparison.total
      : selectedOption === "Video"
      ? data.comparison.videos
      : data.comparison.notes;
  const insights =
    selectedOption === "Both"
      ? data.comparison.insights.total
      : selectedOption === "Video"
      ? data.comparison.insights.videos
      : data.comparison.insights.notes;

  return (
    <div>
      <h5>Comparison with Individual Companies</h5>
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
      <Chart options={options} series={series} type="bar" height={350} />
      <div className="mt-2">
        <h5>Insights</h5>
        <UnorderedList>
          <ListItem>{insights.competition}</ListItem>
          <ListItem>{insights.self}</ListItem>
        </UnorderedList>
      </div>
    </div>
  );
};

export default BarChart;
