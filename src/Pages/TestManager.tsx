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

  useEffect(() => {
    const fetchData = async () => {
      try {
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const isButtonDisabled = useMemo(() => {
    console.log("A");
    if (isLoading) return true;
    console.log("B");
    let url;
    try {
      console.log("C");
      url = new URL(searchValue);
      console.log("D");
      return false;
    } catch (e) {
      console.log("E");
      return true;
    }
  }, [searchValue, isLoading]);
  async function getWebsiteData() {
    setIsLoading(true);
    try {
      const response = await axios.get<{
        checks: WebCheck[];
      }>(endPoints.getTestWebsite, {
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
  const latestItem = useMemo(() => {
    return data.find((item, index) => {
      console.log("FAFA", index);
      return item.status === "failed";
    });
  }, [data]);

  return (
    <div className="main">
      <div className="search-container d-flex">
        <div
          style={{
            width: "70%",
          }}
        >
          <Input
            type="search"
            className="box"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter the website url..."
            bgGradient="linear-gradient(90deg, #000000, #7800ff)"
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
            bgGradient="linear-gradient(90deg, #000000, #7800ff)"
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
            bgGradient="linear-gradient(90deg, #000000, #7800ff)"
            _hover={{ bg: "rgba(0, 0, 0, 0.2)" }}
            border="2px solid white"
          >
            GET
          </Button>
        </div>
      </div>
      <div className="d-flex test-container">
        <div className="d-flex top-row-dual text-white custom-row">
          <div className="box box-large pt-2 px-3 ">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">Performance</div>
            </div>
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
          </div>
          <div className="box box-large pt-2 px-3 ">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">SEO</div>
            </div>
            <div className="d-flex justify-content-center align-items-center percentage">
              <div
                className={`circle mr-2 ${
                  !latestItem?.json?.categories?.seo.score
                    ? ""
                    : latestItem?.json?.categories?.seo.score >= 0.9
                    ? "bg-green"
                    : latestItem?.json?.categories?.seo.score >= 0.5
                    ? "bg-orange"
                    : "bg-red"
                }`}
              ></div>
              <AnimateNumber
                number={(latestItem?.json?.categories?.seo.score || 0) * 100}
              />
              %
            </div>
          </div>
          <div className="box box-large pt-2 px-3 ">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">Accessibility</div>
            </div>
            <div className="d-flex justify-content-center align-items-center percentage">
              <div
                className={`circle mr-2 ${
                  !latestItem?.json?.categories?.accessibility.score
                    ? ""
                    : latestItem?.json?.categories?.accessibility.score >= 0.9
                    ? "bg-green"
                    : latestItem?.json?.categories?.accessibility.score >= 0.5
                    ? "bg-orange"
                    : "bg-red"
                }`}
              ></div>
              <AnimateNumber
                number={
                  (latestItem?.json?.categories?.accessibility.score || 0) * 100
                }
              />
              %
            </div>
          </div>
          <div className="box box-large pt-2 px-3 ">
            <div className="d-flex align-items-center justify-content-between">
              <div className="title">Best Practices</div>
            </div>
            <div className="d-flex justify-content-center align-items-center percentage">
              <div
                className={`circle mr-2 ${
                  !latestItem?.json?.categories?.["best-practices"].score
                    ? ""
                    : latestItem?.json?.categories?.["best-practices"].score >=
                      0.9
                    ? "bg-green"
                    : latestItem?.json?.categories?.["best-practices"].score >=
                      0.5
                    ? "bg-orange"
                    : "bg-red"
                }`}
              ></div>
              <AnimateNumber
                number={
                  (latestItem?.json?.categories?.["best-practices"].score ||
                    0) * 100
                }
              />
              %
            </div>
          </div>
        </div>
        <div className="sidebar-test">
            <div className="button">
                Download JSON {">"}
            </div>
            <div className="button">
                Github Viewer {">"}
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
              {data.map((check, index) => (
                <tr key={index}>
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
                            check.metrics?.speed_index <= 3.4
                              ? "bg-green"
                              : check.metrics?.speed_index <= 5.8
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
                            check.metrics?.largest_contentful_paint <= 2.5
                              ? "bg-green"
                              : check.metrics?.largest_contentful_paint <= 4
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.largest_contentful_paint?.toFixed(1) ||
                        "-"}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      {check.metrics?.cumulative_layout_shift && (
                        <div
                          className={`circle mr-2 ${
                            check.metrics?.cumulative_layout_shift <= 0.1
                              ? "bg-green"
                              : check.metrics?.cumulative_layout_shift <= 0.25
                              ? "bg-orange"
                              : "bg-red"
                          }`}
                        ></div>
                      )}
                      {check.metrics?.cumulative_layout_shift?.toFixed(1) ||
                        "-"}
                    </div>
                  </td>
                  {/* if status is done add class text-green, if failed add class text-red, otherwise text-orange */}
                  <td
                    className={
                      check.status === "done"
                        ? "text-green"
                        : check.status === "failed"
                        ? "text-red"
                        : "text-orange"
                    }
                    style={{
                      textTransform: "capitalize",
                    }}
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
