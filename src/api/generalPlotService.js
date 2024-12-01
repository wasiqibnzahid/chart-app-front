import { makeRequest } from "./api";

export async function fetchPlotData(){
    return makeRequest("/amp/performance");
}

export async function fetchPlotDataWithParams({ page, perPage }){
    return makeRequest("/amp/performance");
}

