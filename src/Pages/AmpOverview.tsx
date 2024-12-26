import { useEffect, useMemo, useState } from "react";
import BarChart from "../components/comparison-chart";
import { ComparisonData, getAverageData, ResData } from "../data";
import {
    getAmpQuarterlyData,
    AmpQuarterData,
    getAmpAverageData
} from "../data/amp_data_api_calls.ts";

import AnimateNumber from "../components/animate-number";
import ComparisonNoGroup from "../components/comparison-chart-ungroup.tsx";
import { ExpandWrapper } from "../components/expand-wrapper.tsx";
import AmpAverageChart from "../components/amp-average-chart.tsx";
import AmpVerticalRidarCharts from "../view/AmpVerticalRidarChart.tsx";
import General from "../view/General.jsx";
import { fetchAmpPlotData } from "../api/generalPlotService";
import { AMP_SITES } from "../data/all_sites.js";
import DateDisplay from "../components/common/DateDisplay";
import useSelectedData from "../hooks/useSelectedData";

export const AmpOverview = () => {
    const [data, setData] = useState<{
        weekly: ResData;
        comparison: ComparisonData;
        quarterData: AmpQuarterData[];
        yearData: AmpQuarterData[];
        allTimeData?: AmpQuarterData;
        weekComparison: AmpQuarterData[];
    }>({
        quarterData: [],
        yearData: [],
        weekComparison: [],
        weekly: {
            changes: [],
            data: []
        },
        comparison: {
            notes: [],
            total: [],
            videos: [],
            insights: {
                notes: {
                    competition: "",
                    self: ""
                },
                total: {
                    competition: "",
                    self: ""
                },
                videos: {
                    competition: "",
                    self: ""
                }
            }
        }
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ampAverageData, averageData, ampQuarterlyData] =
                    await Promise.all([
                        getAmpAverageData(),
                        getAverageData(),
                        getAmpQuarterlyData()
                    ]);

                setData((old) => ({
                    ...old,
                    ...ampAverageData, // Merge amp average data
                    weekly: {
                        data: [
                            ...averageData.weekly.data,
                            ...ampAverageData.weekly.data
                        ],
                        changes: [
                            ...averageData.weekly.changes,
                            ...ampAverageData.weekly.changes
                        ]
                    },
                    quarterData: ampQuarterlyData.quarter, 
                    yearData: ampQuarterlyData.year, 
                    allTimeData: ampQuarterlyData.all_time, 
                    weekComparison: ampQuarterlyData.week
                }));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
  
  const {
    selectedData: currentQuarter,
    setCurrentRecordIndex,
    topbarMode,
    currentRecordIndex,
    selectedFilterRecordsLength,
    changeTopbarMode
  } = useSelectedData(data);

    const combinedData = useMemo(() => {
        if (currentQuarter?.amp?.length > 0) {
            console.log("hallo123", currentQuarter?.amp);
            return [...currentQuarter.amp];
        }
        return [];
    }, [currentQuarter]);

    return (
        <div className="main">
            <DateDisplay currentRecordIndex={currentRecordIndex} setCurrentRecordIndex={setCurrentRecordIndex} totalLength={selectedFilterRecordsLength} date={currentQuarter?.Date} />
            {/* Row 1 */}
            <div className="d-flex top-row text-white custom-row">
                {/* General */}
                <div className="box pt-2 px-3 ">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="title">General</div>
                    </div>
                    <div className="d-flex justify-content-center align-items-center percentage">
                        <AnimateNumber number={currentQuarter?.["AMP Avg"]} />%
                    </div>
                    <div
                        className={`d-flex justify-content-center align-items-center percentage-change ${
                            (currentQuarter?.["AMP Change"] || 1) > 0
                                ? "text-green"
                                : "text-red"
                        }`}
                    >
                        <span className="arrow">
                            {(currentQuarter?.["AMP Change"] || 1) > 0 ? (
                                <>&uarr;</>
                            ) : (
                                <>&darr;</>
                            )}
                        </span>

                        <span>
                            <AnimateNumber
                                number={currentQuarter?.["AMP Change"]}
                            />
                            %
                        </span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center vs-quarter text-green">
                        {
                            topbarMode != 'all time' && `vs previous `
                        }&nbsp;
                        <span
                            onClick={changeTopbarMode}
                            style={{
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                        >
                            {topbarMode}
                        </span>
                    </div>
                    <div
                        style={
                            isOpen
                                ? {
                                      marginTop: "1rem",
                                      transitionDuration: "250ms"
                                  }
                                : {
                                      height: "0",
                                      overflow: "hidden"
                                  }
                        }
                    >
                        {combinedData?.map((company) => (
                            <div
                                key={company.name}
                                style={{
                                    paddingLeft: "20%",
                                    fontSize: "16px",
                                    marginBottom: "0.75rem"
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "16px"
                                    }}
                                >
                                    {company.name.replace("Azteca ", "")}:
                                </span>{" "}
                                {company.total.toFixed?.(0) || 0}%{" "}
                                <span
                                    className={`${
                                        company.total_change < 0
                                            ? "text-red"
                                            : "text-green"
                                    }`}
                                    style={{
                                        fontSize: "14px"
                                    }}
                                >
                                    ({company.total_change.toFixed?.(1) || 0}%)
                                </span>
                            </div>
                        ))}
                    </div>
                    <p
                        className="text-center"
                        style={{
                            display: "flex",
                            marginBottom: "0",
                            // marginTop: "1rem",
                            marginTop: "auto"
                        }}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span
                            style={{
                                padding: "0.75rem",
                                cursor: "pointer",
                                marginLeft: "auto",
                                marginRight: "auto",
                                transform: `rotate(${isOpen ? 180 : 0}deg)`,
                                transitionDuration: "250ms"
                            }}
                        >
                            <img
                                src={"/down.png"}
                                style={{
                                    width: "20px",
                                    opacity: "1"
                                }}
                            />
                        </span>
                    </p>
                </div>

                {/* Nota */}
                <div className="box pt-2 px-3 ">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="title">Nota</div>
                    </div>
                    <div className="d-flex justify-content-center align-items-center percentage">
                        <AnimateNumber
                            number={currentQuarter?.["AMP Note Avg"]}
                        />
                        %
                    </div>
                    <div
                        className={`d-flex justify-content-center align-items-center percentage-change ${
                            (currentQuarter?.["AMP Note Change"] || 1) > 0
                                ? "text-green"
                                : "text-red"
                        }`}
                    >
                        <span className="arrow">
                            {(currentQuarter?.["AMP Note Change"] || 1) > 0 ? (
                                <>&uarr;</>
                            ) : (
                                <>&darr;</>
                            )}
                        </span>
                        <span>
                            {" "}
                            <AnimateNumber
                                number={currentQuarter?.["AMP Note Change"]}
                            />
                            %
                        </span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center vs-quarter text-green">
                        {
                            topbarMode != 'all time' && `vs previous `
                        }&nbsp;
                        <span
                            onClick={changeTopbarMode}
                            style={{
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                        >
                            {topbarMode}
                        </span>
                    </div>
                    <div
                        style={
                            isOpen
                                ? {
                                      marginTop: "1rem",
                                      transitionDuration: "250ms"
                                  }
                                : {
                                      height: "0",
                                      overflow: "hidden"
                                  }
                        }
                    >
                        {combinedData?.map((company) => (
                            <div
                                style={{
                                    paddingLeft: "20%",
                                    fontSize: "16px",
                                    marginBottom: "0.75rem"
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "16px"
                                    }}
                                >
                                    {company.name.replace("Azteca ", "")}:
                                </span>{" "}
                                {company.note.toFixed?.(0) || 0}%{" "}
                                <span
                                    className={`${
                                        company.note_change < 0
                                            ? "text-red"
                                            : "text-green"
                                    }`}
                                    style={{
                                        fontSize: "14px"
                                    }}
                                >
                                    ({company.note_change.toFixed?.(1) || 0}%)
                                </span>
                            </div>
                        ))}
                    </div>
                    <p
                        className="text-center"
                        style={{
                            display: "flex",
                            marginBottom: "0",
                            marginTop: "auto"
                        }}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span
                            style={{
                                padding: "0.75rem",
                                cursor: "pointer",
                                marginLeft: "auto",
                                marginRight: "auto",
                                transform: `rotate(${isOpen ? 180 : 0}deg)`,
                                transitionDuration: "250ms"
                            }}
                        >
                            <img
                                src={"/down.png"}
                                style={{
                                    width: "20px",
                                    opacity: "1"
                                }}
                            />
                        </span>
                    </p>
                </div>

                {/* Vide0 */}
                <div className="box pt-2 px-3 ">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="title">Video</div>
                    </div>

                    <div className="d-flex justify-content-center align-items-center percentage">
                        <AnimateNumber
                            number={currentQuarter?.["AMP Video Avg"]}
                        />
                        %
                    </div>

                    <div
                        className={`d-flex justify-content-center align-items-center percentage-change ${
                            (currentQuarter?.["AMP Video Change"] || 1) > 0
                                ? "text-green"
                                : "text-red"
                        }`}
                    >
                        <span className="arrow">
                            {(currentQuarter?.["AMP Video Change"] || 1) > 0 ? (
                                <>&uarr;</>
                            ) : (
                                <>&darr;</>
                            )}
                        </span>
                        <span>
                            <AnimateNumber
                                number={currentQuarter?.["AMP Video Change"]}
                            />{" "}
                        </span>
                        %
                    </div>

                    <div className="d-flex justify-content-center align-items-center vs-quarter">
                        {
                            topbarMode != 'all time' && `vs previous `
                        }&nbsp;
                        <span
                            onClick={changeTopbarMode}
                            style={{
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                        >
                            {topbarMode}
                        </span>
                    </div>

                    <div
                        style={
                            isOpen
                                ? {
                                      marginTop: "1rem",
                                      transitionDuration: "250ms"
                                  }
                                : {
                                      height: "0",
                                      overflow: "hidden"
                                  }
                        }
                    >
                        {combinedData?.map((company) => (
                            <div
                                key={company.name}
                                style={{
                                    paddingLeft: "20%",
                                    fontSize: "16px",
                                    marginBottom: "0.75rem"
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "16px"
                                    }}
                                >
                                    {company.name.replace("Azteca ", "")}:
                                </span>{" "}
                                {company.video.toFixed?.(0) || 0}%{" "}
                                <span
                                    className={`${
                                        company.video_change < 0
                                            ? "text-red"
                                            : "text-green"
                                    }`}
                                    style={{
                                        fontSize: "14px"
                                    }}
                                >
                                    ({company.video_change.toFixed?.(1) || 0}%)
                                </span>
                            </div>
                        ))}
                    </div>

                    <p
                        className="text-center"
                        style={{
                            display: "flex",
                            marginBottom: "0",
                            marginTop: "auto"
                        }}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span
                            style={{
                                padding: "0.75rem",
                                cursor: "pointer",
                                marginLeft: "auto",
                                marginRight: "auto",
                                transform: `rotate(${isOpen ? 180 : 0}deg)`,
                                transitionDuration: "250ms"
                            }}
                        >
                            <img
                                src={"/down.png"}
                                style={{
                                    width: "20px",
                                    opacity: "1"
                                }}
                            />
                        </span>
                    </p>
                </div>
            </div>
                               
            <div className="row custom-row mt-2 ">
                <div className="col-12">
                    <div className="box shadow mt-2">
                        <div id="line-adwords" className="">
                            <ExpandWrapper>
                                <AmpAverageChart data={data} />
                            </ExpandWrapper>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2 */}
            <div className="row custom-row">
                <div className="col-12">
                    <AmpVerticalRidarCharts data={data} />
                </div>
            </div>

            {/* Row 3 */}
            <div className="row custom-row mt-2 ">
                <div className="col-12">
                    <div className="box shadow mt-2">
                        <div id="barchart">
                            <ExpandWrapper>
                                <BarChart
                                    data={data}
                                    titleHeading="AMP Overview - Individual Bar Chart"
                                />
                            </ExpandWrapper>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4 */}
            <div className="row custom-row mt-2 ">
                <div className="col-12">
                    <div className="box shadow mt-2">
                        <div id="barchart">
                            <ExpandWrapper>
                                <ComparisonNoGroup
                                    data={data}
                                    titleHeading="AMP Overview - Week by Week Bar Chart"
                                />
                            </ExpandWrapper>
                        </div>
                    </div>
                </div>
            </div>



            <div className="row custom-row mt-2 ">
                <div className="col-12">
                    <div className="box shadow mt-2">
                        <General
                            fetchData={fetchAmpPlotData}
                            groups={AMP_SITES}
                            preSelectedWebsites={"Laguna"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmpOverview;
