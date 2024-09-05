import axios from "axios";

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
  return axios.get("http://3.93.188.217:8000/").then((res) => res.data);
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
export async function getQuarterlyData(): Promise<QuarterData[]> {
  return axios.get("http://3.93.188.217:8000/quarter").then((res) => res.data);
}

export async function getInsights(
  data: {
    start: string;
    end: string;
  },
  signal: AbortSignal
): Promise<Insights> {
  return axios
    .get("http://3.93.188.217:8000/insights", {
      params: data,
      signal,
    })
    .then((res) => res.data);
}
