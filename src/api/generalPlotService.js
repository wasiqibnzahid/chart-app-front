import { makeRequest } from "./api";

export async function fetchAmpPlotData(){
    return makeRequest("/amp/performance");
}

export async function fetchLocalPlotData(){
    return makeRequest("/local/performance");
}

export async function fetchGeneralPlotData(){
    return makeRequest("/performance");
}


