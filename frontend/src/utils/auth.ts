import http from "./http-client";

const login = (data: { username: string; password: string }) => {
  console.log(data);
  return http.post("/login", data, {
    transformResponse: [
      (result: string) => {
        const parsed = JSON.parse(result);
        localStorage.setItem("authUser", JSON.stringify(parsed));
        return parsed;
      },
    ],
  });
};

const logout = () => {
  return http.get("/logout", null, {
    transformResponse: [
      (result: string) => {
        localStorage.removeItem("authUser");
        return JSON.parse(result);
      },
    ],
  });
};

const getAuthUser = () => {
  return localStorage.getItem("authUser")
    ? JSON.parse(localStorage.getItem("authUser") as string)
    : null;
};

const methods = {
  login,
  logout,
  getAuthUser,
};

export default methods;
