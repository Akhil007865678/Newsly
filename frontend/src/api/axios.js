import axios from "axios";

const instance = axios.create({
  baseURL: "https://newsly-backend-3vet.onrender.com",
  withCredentials: true,
});

export default instance;
