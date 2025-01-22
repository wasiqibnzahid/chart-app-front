const baseURL = "http://54.89.176.129:8000/";
// const baseURL = "http://127.0.0.1:8000/"
// const baseURL = "http://localhost:8000/"

export const endPoints = {
  data: baseURL,
  quarter: baseURL + "quarter",
  insights: baseURL + "insights",
  localData: baseURL + "local",
  localQuarter: baseURL + "local/quarter",
  localInsights: baseURL + "local/insights",
  ampData: baseURL + "amp",
  ampQuarter: baseURL + "amp/quarter",
  ampInsights: baseURL + "amp/insights",
  addTestWebsite: baseURL + "api/website-checks/add/",
  getTestWebsite: baseURL + "api/website-checks/",
  getImageData: baseURL + "image-data/",
  getImageQuarters: baseURL + "image-data/quarter/",
  getImagePerformance: baseURL + "image-data/records/",
};
