import { ExpandWrapper } from "../components/expand-wrapper";
import RadarChart from "../components/RadarChart";
import { useEffect, useState } from "react";
import {
  ComparisonData,
  getAverageData,
  getQuarterlyData,
  QuarterData,
  ResData,
} from "../data";

function Heatmap(data: any) {
  // Data for the local companies

  const companyLabels: string[] = [];

  data.data.comparison.videos.map((name: { name: string; data: [] }) => {
    companyLabels.push(name.name)
    return name
  });

  // Sample Data (Week/Month data for Video, Nota, and General TV Azteca)
  const companyDataSets = {
    Video: {
      Week: [],
      Month: [],
      Year: [],
      AllTime: [],
    },
    Nota: {
      Week: [],
      Month: [],
      Year: [],
      AllTime: [],
    },
    General: {
      Week: [], // Example: dynamically updated general percentage for the week
      Month: [], // Example: dynamically updated general percentage for the month
      Year: [],
      AllTime: [],
    },
  };

  // Push data to videos
  data.data.comparison.videos.map(
    (name: { name: string; data: [{ x: string; y: number }] }) => {
      // Get the last four data points
      const lastFourData = name.data.slice(-4); // Slice to get the last four entries

      const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
      const average = sum / lastFourData.length; // Calculate the average

      // Push the average to companyDataSets.Video.Week
      companyDataSets.Video.Month.push(average.toFixed(0));
      companyDataSets.Video.Week.push(
        name.data[name.data.length - 1].y.toFixed(0)
      );

      // Calculate Year data
      const lastYearData = name.data.slice(-52);
      const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0); 
      const yearAverage = yearSum / lastYearData.length; 

      companyDataSets.Video.Year.push(yearAverage.toFixed(0));

      // Calculate All Time data
      const allTimeData = name.data;
      const allTimeSum = allTimeData.reduce((acc, point) => acc + point.y, 0); 
      const allTimeAverage = allTimeSum / allTimeData.length; 

      companyDataSets.Video.AllTime.push(allTimeAverage.toFixed(0));
    }
  );

  // Push data to Nota
  data.data.comparison.notes.map(
    (name: { name: string; data: [{ x: string; y: number }] }) => {
      // Get the last four data points
      const lastFourData = name.data.slice(-4); // Slice to get the last four entries
      const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
      const average = sum / lastFourData.length; // Calculate the average

      // Push the average to companyDataSets.Nota.Week
      companyDataSets.Nota.Month.push(average);
      companyDataSets.Nota.Week.push(name.data[name.data.length - 1].y);

      // Calculate Year data
      const lastYearData = name.data.slice(-52);
      const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0); 
      const yearAverage = yearSum / lastYearData.length; 

      companyDataSets.Nota.Year.push(yearAverage);

      // Calculate All Time data
      const allTimeData = name.data;
      const allTimeSum = allTimeData.reduce((acc, point) => acc + point.y, 0); 
      const allTimeAverage = allTimeSum / allTimeData.length; 

      companyDataSets.Nota.AllTime.push(allTimeAverage);
    }
  );

  const [TvData, setTvData] = useState<{
    weekly: ResData;
    comparison: ComparisonData;
    quarterData: QuarterData[];
    yearData: QuarterData[];
    allTimeData?: QuarterData;
    weekComparison: QuarterData[];
  }>({
    quarterData: [],
    yearData: [],
    weekComparison: [],
    weekly: {
      changes: [],
      data: [],
    },
    comparison: {
      notes: [],
      total: [],
      videos: [],
      insights: {
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
      },
    },
  });
  useEffect(() => {
    getAverageData().then((res) => {
      setTvData((old) => ({
        ...old,
        ...res,
      }));
    });
    getQuarterlyData().then((res) =>
      setTvData((old) => ({
        ...old,
        quarterData: res.quarter,
        weekComparison: res.week,
        yearData: res.yearly,
        allTimeData: res.all_time
      }))
    );
  }, []);
  // Push General Tv Azteca
  const weeklyTvAzteca = TvData?.weekComparison?.[TvData.weekComparison.length - 1]?.["TV Azteca Avg"];

  companyDataSets.General.Week.push(weeklyTvAzteca?.toFixed(0));

  let currentlyQuarter = 0;
  const currentMonth = new Date().getMonth();
  for (let i = 0; i < 4; i++) {
    if (currentMonth > i * 3 && currentMonth <= i * 3 + 3) {
      currentlyQuarter = i + 1;
      break;
    }
  }
  const currentYear = new Date().getFullYear();
  const str = `Q${currentMonth + 1}-${currentYear}`;

  const quarterTvAzteca = TvData?.quarterData.find(
    (quarter) => quarter.Date === str
  )?.["TV Azteca Avg"];

  companyDataSets.General.Month.push(quarterTvAzteca?.toFixed(0));

  const currentYearDate = `Q${1}-${currentYear}`;
  const yearTvAzteca = TvData?.yearData.find(
    (year) => year.Date === currentYearDate
  )?.["TV Azteca Avg"];
  const allTimeTvAzteca = TvData?.allTimeData?.["TV Azteca Avg"];

  companyDataSets.General.Year.push(yearTvAzteca?.toFixed(0));
  companyDataSets.General.AllTime.push(allTimeTvAzteca?.toFixed(0));

  if (data?.onCalculate) {
    data.onCalculate(
      companyDataSets.General.Month,
      companyDataSets.General.Week,
      companyDataSets.General.Year,
      companyDataSets.General.AllTime,
    );
  }
  return (
    <ExpandWrapper>
      <RadarChart
        title="Local Companies Performance"
        labels={companyLabels}
        dataSets={{
          Video: companyDataSets.Video,
          Nota: companyDataSets.Nota,
          General: companyDataSets.General,
        }}
      />
    </ExpandWrapper>
  );
}

export default Heatmap;
