import axios from "axios";

interface DataPoint {
  x: string; // Date or any other categorical value
  y: number; // Numeric value
}

// Interface for a series
interface Series {
  name: string; // Name of the series (e.g., "Azteca UNO (Note)")
  data: DataPoint[]; // Array of data points
}

// Interface for the chart data
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
export async function getAverageData(): Promise<{
  weekly: ResData;
  quarterly: ResData;
  comparison: ComparisonData;
}> {
  return axios.get("http://localhost:8000/").then((res) => res.data);
}
