import { useEffect, useMemo, useState } from "react";
import { ComparisonData, getAverageData, ResData } from "../data";
import {
  getAmpQuarterlyData,
  AmpQuarterData,
  getAmpAverageData,
} from "../data/amp_data_api_calls.ts";

import AnimateNumber from "../components/animate-number";
import useSelectedData from "../hooks/useSelectedData";
import { Button, Input } from "@chakra-ui/react";
import axios from "axios";
import { endPoints } from "../data/endpoints.ts";
import { WebCheck } from "../types/index.ts";

export const TestManager = () => {
  const [data, setData] = useState<WebCheck[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latestItem, setLatestItem] = useState<WebCheck | null>(null);
  const [selectedJsonData, setSelectedJsonData] = useState<Record<string, any> | null>(null);
  const [gettingJson, setGettingJson] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Your fetch logic here
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const isButtonDisabled = useMemo(() => {
    if (isLoading) return true;
    try {
      new URL(searchValue);
      return false;
    } catch (e) {
      return true;
    }
  }, [searchValue, isLoading]);

  async function getWebsiteData() {
    setIsLoading(true);
    try {
      const response = await axios.get<{ checks: WebCheck[] }>(endPoints.getTestWebsite, {
        params: { site: searchValue },
      });
      setData(
        response.data.checks.sort((a, b) =>
          b.created_at.localeCompare(a.created_at)
        )
      );
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  }

  async function addWebsite() {
    setIsLoading(true);
    try {
      await axios.post(endPoints.addTestWebsite, {
        url: searchValue,
      });
    } catch (e) {
      console.log(e);
    }
    getWebsiteData();
  }

  function selectRow(row: WebCheck) {
    if (!gettingJson) {
      if (row.status === "done" && row.json_url) {
        setLatestItem(row);
      }
    }
  }

  useEffect(() => {
    const latestDone = data.find((item) => item.status === "done");
    setLatestItem(latestDone || null);
  }, [data]);

  useEffect(() => {
    if (latestItem && latestItem.json_url) {
      setGettingJson(true);
      axios
        .get(latestItem.json_url.replace("https://", "http://"))
        .then((res) => {
          setSelectedJsonData(res.data);
          setGettingJson(false);
        })
        .catch((e) => {
          setGettingJson(false);
          setSelectedJsonData(null);
        });
    }
  }, [latestItem]);

  function downloadJson() {
    if (
      !gettingJson &&
      latestItem &&
      selectedJsonData &&
      Object.keys(selectedJsonData).length > 0
    ) {
      const jsonString = JSON.stringify(selectedJsonData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${latestItem.url}-${latestItem.id}.json`;
      a.click();
    }
  }

  return (
    // The inline style here ensures that all text and icons (like the arrow symbols) appear black.
    <div className="main" style={{ color: "black" }}>
      <div className="search-container d-flex">
        <div style={{ width: "70%" }}>
          <Input
            type="search"
            className="box"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter the website url..."
            bgGradient="white"
            color="white"
            borderColor="whiteAlpha.700"
            _placeholder={{ color: "whiteAlpha.700" }}
            _focus={{ borderColor: "white" }}
            _hover={{ bg: "transparent" }}
          />
        </div>
        <div>
          <Button
            type="submit"
            isDisabled={isButtonDisabled}
            className="box"
            onClick={() => addWebsite()}
            colorScheme="transparent"
            width="full"
            mt={6}
            bgGradient="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.2)" }}
            border="2px solid white"
          >
            RUN
          </Button>
        </div>
        <div>
          <Button
            type="submit"
            isDisabled={isButtonDisabled}
            className="box"
            onClick={() => getWebsiteData()}
            colorScheme="transparent"
            width="full"
            mt={6}
            bgGradient="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.2)" }}
            border="2px solid white"
          >
            GET
          </Button>
        </div>
      </div>
      <div className="d-flex test-container">
        <div className="d-flex top-row-dual text-white custom-row">
          <div className="box relative box-large pt-2 px-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">Performance</div>
            </div>
            {gettingJson ? (
              <div className="spinner-border"></div>
            ) : (
              <div className="d-flex justify-content-center align-items-center percentage">
                <div
                  className={`circle mr-2 ${
                    !latestItem?.metrics.performance_score
                      ? ""
                      : latestItem?.metrics.performance_score >= 0.9
                      ? "bg-green"
                      : latestItem?.metrics.performance_score >= 0.5
                      ? "bg-orange"
                      : "bg-red"
                  }`}
                ></div>
                <AnimateNumber
                  number={(latestItem?.metrics.performance_score ?? 0) * 100}
                />
                %
              </div>
            )}
          </div>
          <div className="box relative box-large pt-2 px-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">SEO</div>
            </div>
            {gettingJson ? (
              <div className="spinner-border"></div>
            ) : (
              <div className="d-flex justify-content-center align-items-center percentage">
                <div
                  className={`circle mr-2 ${
                    !selectedJsonData?.categories?.seo.score
                      ? ""
                      : selectedJsonData?.categories?.seo.score >= 0.9
                      ? "bg-green"
                      : selectedJsonData?.categories?.seo.score >= 0.5
                      ? "bg-orange"
                      : "bg-red"
                  }`}
                ></div>
                <AnimateNumber
                  number={(selectedJsonData?.categories?.seo.score || 0) * 100}
                />
                %
              </div>
            )}
          </div>
          <div className="box relative box-large pt-2 px-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">Accessibility</div>
            </div>
            {gettingJson ? (
              <div className="spinner-border"></div>
            ) : (
              <div className="d-flex justify-content-center align-items-center percentage">
                <div
                  className={`circle mr-2 ${
                    !selectedJsonData?.categories?.accessibility.score
                      ? ""
                      : selectedJsonData?.categories?.accessibility.score >= 0.9
                      ? "bg-green"
                      : selectedJsonData?.categories?.accessibility.score >= 0.5
                      ? "bg-orange"
                      : "bg-red"
                  }`}
                ></div>
                <AnimateNumber
                  number={
                    (selectedJsonData?.categories?.accessibility.score || 0) *
                    100
                  }
                />
                %
              </div>
            )}
          </div>
          <div className="box relative box-large pt-2 px-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">Best Practices</div>
            </div>
            {gettingJson ? (
              <div className="spinner-border"></div>
            ) : (
              <div className="d-flex justify-content-center align-items-center percentage">
                <div
                  className={`circle mr-2 ${
                    !selectedJsonData?.categories?.["best-practices"].score
                      ? ""
                      : selectedJsonData?.categories?.["best-practices"].score >=
                        0.9
                      ? "bg-green"
                      : selectedJsonData?.categories?.["best-practices"].score >=
                        0.5
                      ? "bg-orange"
                      : "bg-red"
                  }`}
                ></div>
                <AnimateNumber
                  number={
                    (selectedJsonData?.categories?.["best-practices"].score || 0) *
                    100
                  }
                />
                %
              </div>
            )}
          </div>
        </div>
        <div className="sidebar-test">
          <div
            className="button"
            onClick={() => {
              downloadJson();
            }}
          >
            <span className="text">Download JSON</span>
            <span>&rarr;</span>
          </div>
          <div
            className="button"
            onClick={() => {
              window.open(
                "https://googlechrome.github.io/lighthouse/viewer/",
                "_blank"
              );
            }}
          >
            <span className="text">Github Viewer</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
      {data?.length > 0 && (
        <div className="box">
          <table className="table">
            <thead>
              <tr>
                <th>Test Requested At</th>
                <th>First Contentful Paint</th>
                <th>Total Blocking Time</th>
                <th>Speed Index Performance</th>
                <th>Largest Contentful Paint</th>
                <th>Cumulative Layout Shift</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((check) => (
                <tr
                  onClick={() => selectRow(check)}
                  key={check.id}
                  className="test-row"
                >
                  <td>{new Date(check.created_at).toLocaleString()}</td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      {check.metrics?.first_contentful_paint && (
                        <div
                          className={`circle mr-2 ${
                            check.metrics.first_contentful_paint <= 2
                              ? "bg-green"
                              : check.metrics.first_contentful_paint <= 4
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.first_contentful_paint?.toFixed(1) || "-"}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      {check.metrics?.total_blocking_time && (
                        <div
                          className={`circle mr-2 ${
                            check.metrics.total_blocking_time <= 200
                              ? "bg-green"
                              : check.metrics.total_blocking_time <= 600
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.total_blocking_time?.toFixed(1) || "-"}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      {check.metrics?.speed_index && (
                        <div
                          className={`circle mr-2 ${
                            check.metrics.speed_index <= 3.4
                              ? "bg-green"
                              : check.metrics.speed_index <= 5.8
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.speed_index?.toFixed(1) || "-"}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      {check.metrics?.largest_contentful_paint && (
                        <div
                          className={`circle mr-2 ${
                            check.metrics.largest_contentful_paint <= 2.5
                              ? "bg-green"
                              : check.metrics.largest_contentful_paint <= 4
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.largest_contentful_paint?.toFixed(1) || "-"}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      {check.metrics?.cumulative_layout_shift && (
                        <div
                          className={`circle mr-2 ${
                            check.metrics.cumulative_layout_shift <= 0.1
                              ? "bg-green"
                              : check.metrics.cumulative_layout_shift <= 0.25
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.cumulative_layout_shift?.toFixed(1) || "-"}
                    </div>
                  </td>
                  <td
                    className={
                      check.status === "done"
                        ? "text-green"
                        : check.status === "failed"
                        ? "text-red"
                        : "text-orange"
                    }
                    style={{ textTransform: "capitalize" }}
                  >
                    {check.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestManager;
