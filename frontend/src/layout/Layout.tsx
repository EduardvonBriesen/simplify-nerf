import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeSwitcher from "./ThemeSwitcher";
import React, { useEffect, useState } from "react";
import Gradient from "./Gradient";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">();
  const [isAnimationDisabled, setIsAnimationDisabled] = useState(false);

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
      <Gradient theme={theme} animate={!isAnimationDisabled} />
      <ToastContainer theme="colored" />
      <div className="bg-base-300 navbar card max-w-5xl flex-row shadow-lg">
        <div className="flex-1">
          <span className="flex items-center gap-2 px-4 text-xl">
            <svg
              className="h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="50"
              height="50"
              viewBox="0 0 50 50"
            >
              <path d="M 25.746094 1.5 A 1.0001 1.0001 0 0 0 25.65625 1.5039062 A 1.0001 1.0001 0 0 0 25.587891 1.5117188 A 1.0001 1.0001 0 0 0 25.458984 1.5390625 A 1.0001 1.0001 0 0 0 25.376953 1.5683594 A 1.0001 1.0001 0 0 0 25.361328 1.5742188 A 1.0001 1.0001 0 0 0 25.308594 1.5976562 A 1.0001 1.0001 0 0 0 25.271484 1.6152344 A 1.0001 1.0001 0 0 0 25.234375 1.6367188 A 1.0001 1.0001 0 0 0 25.1875 1.6640625 A 1.0001 1.0001 0 0 0 25.179688 1.6699219 A 1.0001 1.0001 0 0 0 25.107422 1.7226562 A 1.0001 1.0001 0 0 0 25.048828 1.7753906 A 1.0001 1.0001 0 0 0 25.033203 1.7890625 A 1.0001 1.0001 0 0 0 25.029297 1.7929688 L 24.943359 1.8789062 A 1.0001 1.0001 0 0 0 24.732422 2.0898438 L 13.779297 13.042969 L 2.5292969 24.292969 A 1.0007041 1.0007041 0 0 0 2.4628906 24.367188 A 1.0007041 1.0007041 0 0 0 2.4023438 24.447266 A 1.0007041 1.0007041 0 0 0 2.3515625 24.533203 A 1.0007041 1.0007041 0 0 0 2.2773438 24.71875 A 1.0007041 1.0007041 0 0 0 2.2539062 24.816406 A 1.0007041 1.0007041 0 0 0 2.2402344 24.914062 A 1.0007041 1.0007041 0 0 0 2.2363281 25.015625 A 1.0007041 1.0007041 0 0 0 2.2402344 25.09375 A 1.0001 1.0001 0 0 0 2.2441406 25.125 A 1.0007041 1.0007041 0 0 0 2.2597656 25.212891 A 1.0007041 1.0007041 0 0 0 2.28125 25.292969 A 1.0001 1.0001 0 0 0 2.2890625 25.318359 A 1.0007041 1.0007041 0 0 0 2.3222656 25.402344 A 1.0007041 1.0007041 0 0 0 2.3554688 25.472656 A 1.0001 1.0001 0 0 0 2.3710938 25.501953 A 1.0007041 1.0007041 0 0 0 2.4199219 25.574219 A 1.0001 1.0001 0 0 0 2.4199219 25.576172 A 1.0007041 1.0007041 0 0 0 2.4570312 25.625 A 1.0001 1.0001 0 0 0 2.4960938 25.671875 A 1.0007041 1.0007041 0 0 0 2.5019531 25.679688 A 1.0001 1.0001 0 0 0 2.5292969 25.707031 A 1.0007041 1.0007041 0 0 0 2.5722656 25.75 L 24.957031 48.134766 A 1.0001 1.0001 0 0 0 26.568359 48.076172 L 47.171875 26.027344 A 1.0001 1.0001 0 0 0 47.173828 26.025391 A 1.0001 1.0001 0 0 0 47.464844 25.714844 L 47.494141 25.683594 A 1.0001 1.0001 0 0 0 47.751953 25.152344 A 1.0001 1.0001 0 0 0 47.617188 24.478516 A 1.0001 1.0001 0 0 0 47.496094 24.320312 A 1.0001 1.0001 0 0 0 47.494141 24.316406 L 26.466797 1.8164062 A 1.0001 1.0001 0 0 0 26.460938 1.8105469 A 1.0001 1.0001 0 0 0 26.457031 1.8085938 A 1.0001 1.0001 0 0 0 26.316406 1.6855469 A 1.0001 1.0001 0 0 0 26.308594 1.6796875 A 1.0001 1.0001 0 0 0 26.232422 1.6308594 A 1.0001 1.0001 0 0 0 26.224609 1.6269531 A 1.0001 1.0001 0 0 0 26.142578 1.5859375 A 1.0001 1.0001 0 0 0 26.134766 1.5820312 A 1.0001 1.0001 0 0 0 26.048828 1.5507812 A 1.0001 1.0001 0 0 0 25.976562 1.5292969 A 1.0001 1.0001 0 0 0 25.953125 1.5234375 A 1.0001 1.0001 0 0 0 25.943359 1.5214844 A 1.0001 1.0001 0 0 0 25.933594 1.5195312 A 1.0001 1.0001 0 0 0 25.845703 1.5058594 A 1.0001 1.0001 0 0 0 25.746094 1.5 z M 25.167969 5.3925781 L 28.783203 20.140625 L 17.822266 17.65625 L 25.167969 5.3925781 z M 27.285156 5.6230469 L 44.097656 23.613281 L 30.962891 20.634766 L 27.285156 5.6230469 z M 20.714844 8.9355469 L 15.492188 17.650391 L 8.390625 21.259766 L 15.193359 14.457031 L 20.714844 8.9355469 z M 17.775391 19.695312 L 29.314453 22.310547 L 31.755859 32.273438 L 20.818359 29.083984 L 17.775391 19.695312 z M 15.703125 19.787109 L 18.496094 28.408203 L 5.9414062 24.746094 L 15.703125 19.787109 z M 31.494141 22.804688 L 43.9375 25.626953 L 33.783203 32.144531 L 31.494141 22.804688 z M 6.703125 27.052734 L 19.242188 30.708984 L 23.501953 43.851562 L 6.703125 27.052734 z M 40.566406 30.166016 L 30.210938 41.246094 L 33.820312 34.496094 L 40.566406 30.166016 z M 21.564453 31.384766 L 31.644531 34.324219 L 25.962891 44.955078 L 21.564453 31.384766 z"></path>
            </svg>
            Simplify NeRF
          </span>
          <Link to="/" className="btn btn-ghost">
            Projects
          </Link>
        </div>
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content rounded-box bg-base-100 z-[1] mt-3 w-52 gap-1 px-2 shadow"
          >
            <label className="label cursor-pointer gap-2">
              <span className="label-text">Disable Animation</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isAnimationDisabled}
                onChange={() => setIsAnimationDisabled(!isAnimationDisabled)}
              />
            </label>
          </ul>
        </div>
      </div>
      <div className="flex w-full max-w-5xl flex-1 py-4">{children}</div>
    </div>
  );
}
