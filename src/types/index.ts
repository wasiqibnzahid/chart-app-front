export interface WebCheck {
  id: number;
  url: string;
  status: string;
  created_at: string;
  updated_at: string;
  metrics: WebCheckMetrics;
  json_url: string;
}
export interface WebCheckMetrics {
  speed_index: number;
  performance_score: number;
  total_blocking_time: number;
  first_contentful_paint: number;
  cumulative_layout_shift: number;
  largest_contentful_paint: number;
}
