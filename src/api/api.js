import axios from "axios";

const BASE_URL= 'http://127.0.0.1:8000/'

const api = axios.create({
    baseURL: BASE_URL
});

export async function makeRequest(url, options) {
    return api(url, { ...options })
        .then(res => res.data)
        .catch(err => Promise.reject(err));
}
