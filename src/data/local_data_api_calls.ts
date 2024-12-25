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
export async function getLocalAverageData(): Promise<{
    weekly: ResData;
    comparison: ComparisonData;
    errors: {
      id: number;
      message: string;
      created_at: string;
    }[];
  }> {
    return axios.get(endPoints.localData).then((res) => res.data);
  }



// qarter 


interface LocalCompanyInsights {
    name: string;
    total: number;
    video: number;
    note: number;
    total_change: number;
    video_change: number;
    note_change: number;
  }
export interface LocalQuarterData {
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
    competition: LocalCompanyInsights[];
    azteca: LocalCompanyInsights[];
  }
export async function getLocalQuarterlyData(): Promise<{
    quarter: LocalQuarterData[];
    year: LocalQuarterData[];
    all_time: LocalQuarterData;
    week: LocalQuarterData[];
  }> {
    return axios.get(endPoints.localQuarter).then((res) => res.data);
}

export async function getLocalInsights(
  data: {
    start: string;
    end: string;
  },
  signal: AbortSignal
): Promise<Insights> {
  return axios
    .get(endPoints.localInsights, {
      params: data,
      signal,
    })
    .then((res) => res.data);
}