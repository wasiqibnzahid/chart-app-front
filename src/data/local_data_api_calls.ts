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
    return axios.get("http://3.83.126.238:8000/local").then((res) => res.data);
    // return axios.get("http://127.0.0.1:8000/local").then((res) => res.data);
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
    week: LocalQuarterData;
  }> {
    return axios.get("http://3.83.126.238:8000/local/quarter").then((res) => res.data);
}