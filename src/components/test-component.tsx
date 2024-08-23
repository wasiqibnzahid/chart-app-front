import { ApexOptions } from "apexcharts";
import React from "react";
import ApexCharts from "react-apexcharts";

const chartOptions = {
  chart: {
    type: "bar",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      distributed: true,
      dataLabels: {
        position: "top",
      },
    },
  },
  dataLabels: {
    enabled: true,
  },
  stroke: {
    show: true,
    width: 1,
    colors: ["#fff"],
  },
  xaxis: {
    categories: ["Category 1", "Category 2", "Category 3"],
    labels: {
      style: {
        colors: ["#333"],
        fontSize: "12px",
      },
    },
    // Add vertical separators as plotLines
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  annotations: {},
  yaxis: {
    title: {
      text: "Values",
    },
  },
  colors: ["#FF1654", "#247BA0", "#70C1B3"],
} satisfies ApexOptions;

const chartSeries = [
  {
    name: "Series 1",
    data: [30, 40, 35],
  },
  {
    name: "Series 2",
    data: [20, 50, 25],
  },
];

const MyChart = () => (
  <ApexCharts
    options={chartOptions}
    series={chartSeries}
    type="bar"
    height={350}
  />
);

export default MyChart;
