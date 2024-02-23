import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeSwitcher from "./ThemeSwitcher";
import React, { useEffect, useState } from "react";
import Gradient from "./Gradient";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">();

  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    if (localTheme) {
      setTheme(localTheme as "dark" | "light");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (!theme) return;
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex h-screen flex-col items-center p-4">
      <Gradient theme={theme} />
      <ToastContainer theme="colored" />
      <div className="bg-base-300 navbar card max-w-5xl flex-row ">
        <div className="flex-1">
          <Link className="btn btn-ghost px-4 text-xl" to={"/"}>
            Simplify NeRF
          </Link>
        </div>
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>
      <div className="flex w-full max-w-5xl flex-1 py-4">{children}</div>
    </div>
  );
}
