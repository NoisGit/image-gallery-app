import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import Gallery from "./components/Gallery";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300
        ${theme === "dark"
          ? "bg-zinc-950 text-zinc-100"
          : "bg-gradient-to-br from-white via-white to-pink-100 text-zinc-900"
        } w-full`}
      style={{
        minWidth: "100vw",
        width: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Header />
      <main
        className="
          flex-1 flex flex-col items-center justify-start
          px-4 py-6 w-full
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-pink-200 dark:scrollbar-thumb-zinc-700
        "
        style={{
          width: "100%",
        }}
      >
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
