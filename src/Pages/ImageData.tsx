import { useEffect, useMemo, useState } from "react";
import BarChart from "../components/comparison-chart";
import { ComparisonData, getAverageData, QuarterData, ResData } from "../data";
import { fetchLocalPlotData } from "../api/generalPlotService";
import {
  getLocalQuarterlyData,
  LocalQuarterData,
  getLocalAverageData,
} from "../data/local_data_api_calls.ts";
import { SimpleGrid } from "@chakra-ui/react";

import AnimateNumber from "../components/animate-number";
import PerformanceMap from "../components/PerformanceMap";
import Heatmap from "../view/Heatmap";
import ComparisonNoGroup from "../components/comparison-chart-ungroup.tsx";
import { ExpandWrapper } from "../components/expand-wrapper.tsx";
import General from "../view/General.jsx";
import PerformanceMapLocal from "../components/PerformanceMapLocal.jsx";
import { LOCAL_SITES } from "../data/all_sites.js";
import DateDisplay from "../components/common/DateDisplay";
import useSelectedData from "../hooks/useSelectedData";
import LocalAverageChart from "../components/local-average-chart.jsx";
import { changeLabel } from "../utils/utils.js";
import { endPoints } from "../data/endpoints.ts";
import axios from "axios";
import AverageChart from "../components/average-chart.tsx";

async function getImageData(): Promise<{
  weekly: ResData;
  comparison: ComparisonData;
}> {
  return axios.get(endPoints.getImageData).then((res) => res.data);
}

async function fetchImagePlotData() {
  return axios.get(endPoints.getImagePerformance).then((res) => res.data);
}

async function getImageQuarters(): Promise<{
  quarter: QuarterData[];
  week: QuarterData[];
  all_time: QuarterData;
  yearly: QuarterData[];
}> {
  fetchLocalPlotData();
  return axios.get(endPoints.getImageQuarters).then((res) => res.data);
}

export const ImageData = () => {
  const [data, setData] = useState<{
    weekly: ResData;
    comparison: ComparisonData;
    quarterData: QuarterData[];
    yearData: QuarterData[];
    allTimeData?: QuarterData;
    weekComparison: QuarterData[];
    yearlyData: QuarterData[];
  }>({
    quarterData: [],
    yearData: [],
    weekComparison: [],
    yearlyData: [],
    allTimeData: undefined,
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
    const fetchData = async () => {
      try {
        const [localAverageData, averageData, localQuarterlyData] =
          await Promise.all([
            getImageData(),
            getImageData(),
            getImageQuarters(),
          ]);
        console.log(
          "FLAUSD",
          averageData.weekly.data,
          localAverageData.weekly.data
        );
        setData((old) => ({
          ...old,
          ...localAverageData,
          weekly: {
            data: [
              ...changeLabel(
                averageData.weekly.data,
                "Image Pages Avg",
                "General Azteca"
              ),
              ...changeLabel(
                localAverageData.weekly.data,
                "TV Azteca",
                "Local Azteca"
              ),
            ],
            changes: [
              ...changeLabel(
                averageData.weekly.changes,
                "Image Pages Avg",
                "General Azteca"
              ),
              ...changeLabel(
                localAverageData.weekly.changes,
                "Image Pages Avg",
                "Local Azteca"
              ),
            ],
          },
          quarterData: localQuarterlyData.quarter,
          weekComparison: localQuarterlyData.week,
          allTimeData: localQuarterlyData.all_time,
          yearData: localQuarterlyData.yearly,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const [isAzteca] = useState<[boolean, boolean, boolean]>([true, true, true]);

  const {
    selectedData: currentQuarter,
    setCurrentRecordIndex,
    topbarMode,
    currentRecordIndex,
    selectedFilterRecordsLength,
    changeTopbarMode,
  } = useSelectedData(data);

  const combinedData = useMemo(() => {
    if (
      currentQuarter?.azteca?.length > 0 &&
      currentQuarter?.competition?.length > 0
    ) {
      return [...currentQuarter.azteca, ...currentQuarter.competition];
    }
    return [];
  }, [currentQuarter]);
  const [monthWeek, setMonthWeek] = useState<
    [number[], number[], number[], number[]]
  >([[0], [0], [0], [0]]);
  return (
    <div className="main">
      <DateDisplay
        currentRecordIndex={currentRecordIndex}
        setCurrentRecordIndex={setCurrentRecordIndex}
        totalLength={selectedFilterRecordsLength}
        date={currentQuarter?.Date}
      />
      {/* Row 1 */}
      <div
        style={{
          padding: "0 5rem",
          marginBottom: "2rem",
        }}
        className="text-white custom-row"
      >
        {/* General */}
        <div className="box pt-2 px-3 ">
          <div className="d-flex align-items-center justify-content-between">
            <div onClick={() => console.log(currentQuarter)} className="title">
              TVA
            </div>
            <div className="toggles d-flex align-items-center">
              {/* <RadioGroup
                className="d-flex align-items-center"
                style={{ gap: "5px" }}
                value={isAzteca[0].toString()}
                onChange={(e) =>
                  setIsAzteca((old) => {
                    const newVal = [...old] as typeof isAzteca;
                    newVal[0] = e === "true";
                    return newVal;
                  })
                }
              >
                <div className="toggle-container d-flex align-items-center">
                  <Radio
                    isChecked={isAzteca[0]}
                    value={true.toString()}
                    style={{ marginBottom: "0" }}
                    size="sm"
                  >
                    TV Azteca
                  </Radio>
                </div>
                <div className="toggle-container d-flex align-items-center">
                  <Radio
                    value={false.toString()}
                    id="toggle-b"
                    style={{ marginBottom: "0" }}
                    size="sm"
                  >
                    Competition
                  </Radio>
                </div>
              </RadioGroup> */}
            </div>
          </div>
          <div className="d-flex justify-content-center align-items-center percentage">
            <AnimateNumber number={currentQuarter?.["Image Pages Avg"]} />%
          </div>
          <div
            style={
              {
                // paddingBottom: "2rem",
              }
            }
            className={`d-flex justify-content-center align-items-center percentage-change ${
              (currentQuarter?.["Image Pages Change"] || 1) > 0
                ? "text-green"
                : "text-red"
            }`}
          >
            <span className="arrow">
              {(currentQuarter?.["Image Pages Change"] || 1) > 0 ? (
                <>&uarr;</>
              ) : (
                <>&darr;</>
              )}
            </span>

            <span>
              <AnimateNumber number={currentQuarter?.["Image Pages Change"]} />%
            </span>
          </div>
          <div
            style={{
              paddingBottom: "2rem",
            }}
            className="d-flex justify-content-center align-items-center vs-quarter text-green"
          >
            {topbarMode != "all time" && `vs previous `}&nbsp;
            <span
              onClick={changeTopbarMode}
              style={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {topbarMode}
            </span>
          </div>
        </div>
      </div>

      <div className="row custom-row mt-2 ">
        <div className="col-12">
          <div className="box shadow mt-2">
            <div id="line-adwords" className="">
              <ExpandWrapper>
                <AverageChart is_image data={data} />
              </ExpandWrapper>
            </div>
          </div>
        </div>
      </div>

      <div className="row custom-row mt-2 ">
        <div className="col-12">
          <div
            onClick={() =>
              fetchImagePlotData().then((res) => console.log("ASDSAD", res))
            }
            className="box shadow mt-2"
          >
            <General
              fetchData={fetchImagePlotData}
              groups={["Azteca Uno", "Azteca 7", "Azteca Noticias"]}
              preSelectedWebsites={"Azteca Uno"}
              hide_category
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageData;
