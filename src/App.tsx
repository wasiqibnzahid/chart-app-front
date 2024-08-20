import { useEffect, useState } from "react";
import AverageChart from "./components/average-chart";
import BarChart from "./components/comparison-chart";
import { ComparisonData, getAverageData, ResData } from "./data";

export const App = () => {
  const [data, setData] = useState<{
    weekly: ResData;
    quarterly: ResData;
    comparison: ComparisonData;
  }>({
    quarterly: {
      changes: [],
      data: [],
    },
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
    getAverageData().then((res) => setData(res));
  }, []);
  return (
    <div id="">
      <div className="">
        <div
          className=""
          style={{
            width: "97vw",
            padding: "1rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="main">
            <div className="row mt-2">
              <div className="col-12">
                <div className="box shadow mt-2">
                  <div id="line-adwords" className="">
                    <AverageChart data={data} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-12">
                <div className="box shadow mt-2">
                  <div id="barchart">
                    <BarChart data={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
