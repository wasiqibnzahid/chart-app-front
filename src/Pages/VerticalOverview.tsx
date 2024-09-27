import { useEffect, useMemo, useState } from "react";
import BarChart from "../components/comparison-chart";
import {
  ComparisonData,
  getAverageData,
  getQuarterlyData,
  QuarterData,
  ResData,
  runJob,
} from "../data";
import { Button, Radio, RadioGroup } from "@chakra-ui/react";
import AnimateNumber from "../components/animate-number";
import dayjs from "dayjs";
import VerticalRidarCharts from "../view/VerticalRidarCharts";
import ComparisonNoGroup from "../components/comparison-chart-ungroup";

export const VerticalOverview = () => {
  const [data, setData] = useState<{
    weekly: ResData;
    comparison: ComparisonData;
    quarterData: QuarterData[];
    weekComparison?: QuarterData;
  }>({
    quarterData: [],
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

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    getAverageData().then((res) => {
      console.log("ZE RES", res);
      if (res?.errors && res?.errors.length) {
        let str = "";
        res.errors.forEach((e) => {
          str += `error: ${e.message} at ${dayjs(e.created_at).format(
            "YYYY-MM-DD"
          )} \r\n`;
        });
        alert(str);
      }
      setData((old) => ({
        ...res,
        quarterData: old.quarterData,
      }));
    });
    getQuarterlyData().then((res) =>
      setData((old) => ({
        ...old,
        quarterData: res.quarter,
        weekComparison: res.week,
      }))
    );
  }, []);
  const [isAzteca, setIsAzteca] = useState<[boolean, boolean, boolean]>([
    true,
    true,
    true,
  ]);
  const [topbarMode, setTopbarMode] = useState<"month" | "week">("month");
  const currentQuarter = useMemo(() => {
    if (topbarMode === "week") {
      return data.weekComparison;
    }
    let currentlyQuarter = 0;
    const currentMonth = new Date().getMonth();
    for (let i = 0; i < 4; i++) {
      if (currentMonth > i * 3 && currentMonth <= i * 3 + 3) {
        currentlyQuarter = i + 1;
        break;
      }
    }
    const currentYear = new Date().getFullYear();
    const str = `Q${currentlyQuarter}-${currentYear}`;
    return {
      ...(data.quarterData.find((quarter) => quarter.Date === str) || {}),
    };
  }, [data.quarterData, data?.weekComparison, topbarMode]);

  function changeTopbarMode() {
    setTopbarMode(topbarMode === "quarter" ? "week" : "quarter");
  }
  return (
    <div className="main">
      <div className="d-flex top-row text-white custom-row">
        <div className="box pt-2 px-3 ">
          <div className="d-flex align-items-center justify-content-between">
            <div className="title">General</div>
            <div className="toggles d-flex align-items-center">
              <RadioGroup
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
              </RadioGroup>
            </div>
          </div>
          <div className="d-flex justify-content-center align-items-center percentage">
            <AnimateNumber
              number={
                isAzteca[0]
                  ? currentQuarter?.["TV Azteca Avg"]
                  : currentQuarter?.["Competition Avg"]
              }
            />
            %
          </div>
          <div
            className={`d-flex justify-content-center align-items-center percentage-change ${
              ((isAzteca[0]
                ? currentQuarter?.["TV Azteca Change"]
                : currentQuarter?.["Competition Change"]) || 1) > 0
                ? "text-green"
                : "text-red"
            }`}
          >
            <span className="arrow">
              {((isAzteca[0]
                ? currentQuarter?.["TV Azteca Change"]
                : currentQuarter?.["Competition Change"]) || 1) > 0 ? (
                <>&uarr;</>
              ) : (
                <>&darr;</>
              )}
            </span>

            <span>
              <AnimateNumber
                number={
                  isAzteca[0]
                    ? currentQuarter?.["TV Azteca Change"]
                    : currentQuarter?.["Competition Change"]
                }
              />
              %
            </span>
          </div>
          <div className="d-flex justify-content-center align-items-center vs-quarter text-green">
            vs previous&nbsp;{" "}
            <span
              onClick={changeTopbarMode}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {topbarMode}
            </span>
          </div>
          <div
            style={
              isOpen
                ? { marginTop: "1rem", transitionDuration: "250ms" }
                : {
                    height: "0",
                    overflow: "hidden",
                  }
            }
          >
            {(isAzteca[0]
              ? currentQuarter?.azteca
              : currentQuarter?.competition
            )?.map((company) => (
              <div
                key={company.name}
                style={{
                  paddingLeft: "20%",
                  fontSize: "16px",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {company.name.replace("Azteca ", "")}:
                </span>{" "}
                {company.total.toFixed(0)}%{" "}
                <span
                  className={`${
                    company.total_change < 0 ? "text-red" : "text-green"
                  }`}
                  style={{
                    fontSize: "14px",
                  }}
                >
                  ({company.total_change.toFixed(1)}%)
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
              marginTop: "auto",
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
                transitionDuration: "250ms",
              }}
            >
              <img
                src={"/down.png"}
                style={{
                  width: "20px",
                  opacity: "1",
                }}
              />
            </span>
          </p>
        </div>
        <div className="box pt-2 px-3 ">
          <div className="d-flex align-items-center justify-content-between">
            <div className="title">Nota</div>
            <div className="toggles d-flex align-items-center">
              <RadioGroup
                className="d-flex align-items-center"
                style={{ gap: "5px" }}
                value={isAzteca[1].toString()}
                onChange={(e) =>
                  setIsAzteca((old) => {
                    const newVal = [...old] as typeof isAzteca;
                    newVal[1] = e === "true";
                    return newVal;
                  })
                }
              >
                <div className="toggle-container d-flex align-items-center">
                  <Radio
                    isChecked={isAzteca[1]}
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
              </RadioGroup>
            </div>
          </div>
          <div className="d-flex justify-content-center align-items-center percentage">
            <AnimateNumber
              number={
                isAzteca[1]
                  ? currentQuarter?.["TV Azteca Note Avg"]
                  : currentQuarter?.["Competition Note Avg"]
              }
            />
            %
          </div>
          <div
            className={`d-flex justify-content-center align-items-center percentage-change ${
              ((isAzteca[1]
                ? currentQuarter?.["TV Azteca Note Change"]
                : currentQuarter?.["Competition Note Change"]) || 1) > 0
                ? "text-green"
                : "text-red"
            }`}
          >
            <span className="arrow">
              {((isAzteca[1]
                ? currentQuarter?.["TV Azteca Note Change"]
                : currentQuarter?.["Competition Note Change"]) || 1) > 0 ? (
                <>&uarr;</>
              ) : (
                <>&darr;</>
              )}
            </span>
            <span>
              {" "}
              <AnimateNumber
                number={
                  isAzteca[1]
                    ? currentQuarter?.["TV Azteca Note Change"]
                    : currentQuarter?.["Competition Note Change"]
                }
              />
              %
            </span>
          </div>
          <div className="d-flex justify-content-center align-items-center vs-quarter text-green">
            vs previous&nbsp;{" "}
            <span
              onClick={changeTopbarMode}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {topbarMode}
            </span>
          </div>
          <div
            style={
              isOpen
                ? { marginTop: "1rem", transitionDuration: "250ms" }
                : {
                    height: "0",
                    overflow: "hidden",
                  }
            }
          >
            {(isAzteca[1]
              ? currentQuarter?.azteca
              : currentQuarter?.competition
            )?.map((company) => (
              <div
                style={{
                  paddingLeft: "20%",
                  fontSize: "16px",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {company.name.replace("Azteca ", "")}:
                </span>{" "}
                {company.note.toFixed(0)}%{" "}
                <span
                  className={`${
                    company.note_change < 0 ? "text-red" : "text-green"
                  }`}
                  style={{
                    fontSize: "14px",
                  }}
                >
                  ({company.note_change.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          <p
            className="text-center"
            style={{
              display: "flex",
              marginBottom: "0",
              marginTop: "auto",
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
                transitionDuration: "250ms",
              }}
            >
              <img
                src={"/down.png"}
                style={{
                  width: "20px",
                  opacity: "1",
                }}
              />
            </span>
          </p>
        </div>
        <div className="box pt-2 px-3 ">
          <div className="d-flex align-items-center justify-content-between">
            <div className="title">Video</div>
            <div className="toggles d-flex align-items-center">
              <RadioGroup
                className="d-flex align-items-center"
                style={{ gap: "5px" }}
                value={isAzteca[2].toString()}
                onChange={(e) =>
                  setIsAzteca((old) => {
                    const newVal = [...old] as typeof isAzteca;
                    newVal[2] = e === "true";
                    return newVal;
                  })
                }
              >
                <div className="toggle-container d-flex align-items-center">
                  <Radio
                    isChecked={isAzteca[2]}
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
              </RadioGroup>
            </div>
          </div>
          <div className="d-flex justify-content-center align-items-center percentage">
            <AnimateNumber
              number={
                isAzteca[2]
                  ? currentQuarter?.["TV Azteca Video Avg"]
                  : currentQuarter?.["Competition Video Avg"]
              }
            />
            %
          </div>
          <div
            className={`d-flex justify-content-center align-items-center percentage-change ${
              ((isAzteca[2]
                ? currentQuarter?.["TV Azteca Video Change"]
                : currentQuarter?.["Competition Video Change"]) || 1) > 0
                ? "text-green"
                : "text-red"
            }`}
          >
            <span className="arrow">
              {((isAzteca[2]
                ? currentQuarter?.["TV Azteca Video Change"]
                : currentQuarter?.["Competition Video Change"]) || 1) > 0 ? (
                <>&uarr;</>
              ) : (
                <>&darr;</>
              )}
            </span>
            <span>
              <AnimateNumber
                number={
                  isAzteca[2]
                    ? currentQuarter?.["TV Azteca Video Change"]
                    : currentQuarter?.["Competition Video Change"]
                }
              />{" "}
            </span>
            %
          </div>
          <div className="d-flex justify-content-center align-items-center vs-quarter">
            vs previous&nbsp;{" "}
            <span
              onClick={changeTopbarMode}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {topbarMode}
            </span>
          </div>
          <div
            style={
              isOpen
                ? { marginTop: "1rem", transitionDuration: "250ms" }
                : {
                    height: "0",
                    overflow: "hidden",
                  }
            }
          >
            {(isAzteca[2]
              ? currentQuarter?.azteca
              : currentQuarter?.competition
            )?.map((company) => (
              <div
                key={company.name}
                style={{
                  paddingLeft: "20%",
                  fontSize: "16px",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {company.name.replace("Azteca ", "")}:
                </span>{" "}
                {company.video.toFixed(0)}%{" "}
                <span
                  className={`${
                    company.video_change < 0 ? "text-red" : "text-green"
                  }`}
                  style={{
                    fontSize: "14px",
                  }}
                >
                  ({company.video_change.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          <p
            className="text-center"
            style={{
              display: "flex",
              marginBottom: "0",
              marginTop: "auto",
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
                transitionDuration: "250ms",
              }}
            >
              <img
                src={"/down.png"}
                style={{
                  width: "20px",
                  opacity: "1",
                }}
              />
            </span>
          </p>
        </div>
      </div>

      <div className="row custom-row">
        <div className="col-12">
          <VerticalRidarCharts />
        </div>
      </div>

      <div className="row custom-row mt-2 ">
        <div className="col-12">
          <div className="box shadow mt-2">
            <div id="barchart">
              <BarChart
                data={data}
                titleHeading="Vertrical Overview - TVA vs. Comp. - Individual Bar Chart"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row custom-row mt-2 ">
        <div className="col-12">
          <div className="box shadow mt-2">
            <div id="barchart">
              <ComparisonNoGroup
                data={data}
                titleHeading="Vertical Overview - TVA vs. Comp. - Week by Week Bar Chart"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalOverview;
