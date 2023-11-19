import axios from "axios";
import auth from "./auth";

const instance = axios.create({
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use(
  (config) => {
    const authUser = auth.getAuthUser();
    if (authUser) {
      config.headers["authorization"] = `Bearer ${authUser.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authUser");
      window.location.reload();
    } else {
      return Promise.reject(error.response);
    }
  },
);

const get = (url: string, params: any, config = {}) =>
  instance.get(url, { params, ...config });

const post = (url: string, data: any, config = {}) =>
  instance.post(url, data, config);

const methods = { get, post };

export default methods;
