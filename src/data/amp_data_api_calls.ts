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
export interface ComparisonData {
    videos: ChartData;
    notes: ChartData;
    total: ChartData;
    insights: Insights;
  }

interface AmpCompanyInsights {
    name: string;
    total: number;
    video: number;
    note: number;
    total_change: number;
    video_change: number;
    note_change: number;
  }
export interface AmpQuarterData {
    Date: string;
    "Azteca Avg": number;
    "Competition Avg": number;
    "Azteca Note Avg": number;
    "Competition Note Avg": number;
    "Azteca Video Avg": number;
    "Competition Video Avg": number;
    "Azteca Avg Change": number;
    "Competition Avg Change": number;
    "Azteca Note Change": number;
    "Competition Note Change": number;
    "Azteca Video Change": number;
    "Competition Video Change": number;
    competition: AmpCompanyInsights[];
    azteca: AmpCompanyInsights[];
  }

 export async function getAmpAverageData(): Promise<{
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
      }>(endPoints.ampData)
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

export async function getAmpQuarterlyData(): Promise<{
    quarter: AmpQuarterData[];
    year: AmpQuarterData[];
    all_time: AmpQuarterData;
    week: AmpQuarterData[];
  }> {
    return axios.get(endPoints.ampQuarter).then((res) => res.data);
}

export async function getAmpInsights(
  data: {
    start: string;
    end: string;
  },
  signal: AbortSignal
): Promise<Insights> {
  return axios
    .get(endPoints.ampInsights, {
      params: data,
      signal,
    })
    .then((res) => res.data);
}