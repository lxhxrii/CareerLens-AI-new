import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("careerLensTheme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("career-dark");
    } else {
      root.classList.remove("career-dark");
    }

    localStorage.setItem(
      "careerLensTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  return (
    <button
      type="button"
      onClick={() => setDarkMode((current) => !current)}
      className={`fixed bottom-6 right-6 z-[9999]
        flex h-14 w-14 items-center justify-center
        rounded-full border shadow-xl
        transition-all duration-300
        hover:scale-110
        ${
          darkMode
            ? "border-slate-600 bg-slate-800 text-yellow-300"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <Sun size={24} />
      ) : (
        <Moon size={24} />
      )}
    </button>
  );
}

export default ThemeToggle;