import axios from 'axios';

const apiR6 = axios.create({
  baseURL: process.env.REACT_APP_APIR6_URL,
  headers: { Authorization: `Bearer ${process.env.REACT_APP_APIR6_TOKEN}` },
});

export default apiR6;
