import { useNavigate } from "react-router-dom";
import auth from "../utils/auth";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    auth
      .login({ username, password })
      .then(() => navigate("/"))
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="prose card w-4/5 bg-slate-700 p-8 shadow-xl">
        <h1>Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            placeholder="Username"
            className="input input-bordered input-primary w-full"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered input-primary w-full"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <button className="btn btn-primary w-32 align-bottom" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
