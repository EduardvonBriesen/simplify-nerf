import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center p-4">
      <ToastContainer theme="colored" />
      <div className="bg-base-300 navbar card max-w-5xl flex-row ">
        <div className="flex-1">
          <Link className="btn btn-ghost px-4 text-xl" to={"/"}>
            Simplify NeRF
          </Link>
        </div>
        <ThemeSwitcher />
      </div>
      <div className="flex w-full max-w-5xl flex-1 py-4">{children}</div>
    </div>
  );
}
