import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeContext } from "./context/ThemeContext";
import Gallery from "./components/Gallery";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col overflow-x-hidden transition-colors duration-300 ${
        theme === "dark"
          ? "bg-zinc-950 text-zinc-100"
          : "bg-[radial-gradient(circle_at_top_left,#ffe4f1_0,#f4e7ff_42%,#fde7f3_74%,#f7d9e8_100%)] text-zinc-900"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-pink-400/25 blur-3xl dark:bg-pink-700/20 sm:left-1/2 sm:top-0 sm:h-96 sm:w-96 sm:-translate-x-1/2" />
        <div className="absolute bottom-10 right-[-6rem] h-96 w-96 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-700/20 sm:right-0" />
      </div>

      <Header />
      <main className="flex flex-1 justify-center px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Gallery />
      </main>
      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          className:
            "!rounded-2xl !border !border-zinc-200 !bg-white !px-4 !py-3 !text-sm !font-semibold !text-zinc-800 !shadow-xl dark:!border-zinc-700 dark:!bg-zinc-900 dark:!text-zinc-100",
        }}
      />
    </div>
  );
}
