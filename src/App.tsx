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
          : "bg-[radial-gradient(circle_at_top_left,#fce7f3_0,#ffffff_34%,#f5f3ff_68%,#fff7ed_100%)] text-zinc-900"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-pink-300/30 blur-3xl dark:bg-pink-700/20" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-700/20" />
      </div>

      <Header />
      <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
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
