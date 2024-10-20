import axios from "axios";
import { endPoints } from "./endpoints";
interface DataPoint {
  x: string;
  y: number;
}

interface Series {
  name: string;
  data: DataPoint[];
}

export type ChartData = Series[];
export interface ResData {
  changes: ChartData;
  data: ChartData;
}
export interface ComparisonData {
  videos: ChartData;
  notes: ChartData;
  total: ChartData;
  insights: Insights;
}

export interface Insights {
  videos: {
    self: string;
    competition: string;
  };
  notes: {
    self: string;
    competition: string;
  };
  total: {
    self: string;
    competition: string;
  };
}

interface CompanyInsights {
  name: string;
  total: number;
  video: number;
  note: number;
  total_change: number;
  video_change: number;
  note_change: number;
}

export async function getAverageData(): Promise<{
  weekly: ResData;
  comparison: ComparisonData;
  errors: {
    id: number;
    message: string;
    created_at: string;
  }[];
}> {
  return axios
    .get<{
      weekly: ResData;
      comparison: ComparisonData;
      errors: {
        id: number;
        message: string;
        created_at: string;
      }[];
    }>(endPoints.data)
    .then((res) => {
      res.data.comparison.notes = res.data.comparison.notes.filter(
        (item) => !item.name.includes("Avg") && !item.name.includes("Change")
      );
      res.data.comparison.videos = res.data.comparison.videos.filter(
        (item) => !item.name.includes("Avg") && !item.name.includes("Change")
      );
      res.data.comparison.total = res.data.comparison.total.filter(
        (item) => !item.name.includes("Avg") && !item.name.includes("Change")
      );
      return res.data;
    });
  // return axios.get("http://127.0.0.1:8000/").then((res) => res.data);
}
export interface QuarterData {
  Date: string;
  "TV Azteca Change": number;
  "Competition Change": number;
  "TV Azteca Avg": number;
  "Competition Avg": number;
  "TV Azteca Video Change": number;
  "Competition Video Change": number;
  "TV Azteca Note Change": number;
  "Competition Note Change": number;
  "TV Azteca Video Avg": number;
  "Competition Video Avg": number;
  "TV Azteca Note Avg": number;
  "Competition Note Avg": number;
  competition: CompanyInsights[];
  azteca: CompanyInsights[];
}
export async function getQuarterlyData(): Promise<{
  quarter: QuarterData[];
  week: QuarterData;
}> {
  return axios.get(endPoints.quarter).then((res) => res.data);
}

export async function getInsights(
  data: {
    start: string;
    end: string;
  },
  signal: AbortSignal
): Promise<Insights> {
  return axios
    .get(endPoints.insights, {
      params: data,
      signal,
    })
    .then((res) => res.data);
}

export async function runJob() {
  return axios
    .post(endPoints.insights)
    .then((res) => res)
    .catch((e) => console.error(e));
}
