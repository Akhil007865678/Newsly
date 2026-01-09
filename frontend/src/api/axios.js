import axios from "axios";

const instance = axios.create({
  baseURL: "https://newsly-backend-3vet.onrender.com/api",
  withCredentials: true,
});

export default instance;
