import { useEffect, useRef } from "react";
import { useSidebar } from "../../app/context/SidebarContext";
import NotificationDropdown from "../header/NotificationDropdown";
import UserDropdown from "../header/UserDropdown";
import { ThemeToggleButton } from "../common/ThemeToggleButton";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900 lg:z-10">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={handleToggle}
            className="z-40 block rounded-lg border border-gray-200 bg-white p-1.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-500 delay-[0] duration-200 ease-in-out dark:bg-white`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-500 delay-150 duration-200 ease-in-out dark:bg-white`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-gray-500 delay-200 duration-200 ease-in-out dark:bg-white`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-gray-500 delay-300 duration-200 ease-in-out dark:bg-white`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-gray-500 duration-200 ease-in-out dark:bg-white`}
                ></span>
              </span>
            </span>
          </button>
        </div>

        <div className="hidden lg:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.33317 9.16667C3.33317 5.94501 5.94484 3.33333 9.1665 3.33333C12.3882 3.33333 14.9998 5.94501 14.9998 9.16667C14.9998 12.3883 12.3882 14.9998 9.1665 14.9998C5.94484 14.9998 3.33317 12.3883 3.33317 9.16667ZM9.1665 1.66666C5.02437 1.66666 1.6665 5.02452 1.6665 9.16666C1.6665 13.3088 5.02437 16.6667 9.1665 16.6667C10.8711 16.6667 12.4385 16.0984 13.6923 15.1384L16.9442 18.3904C17.2371 18.6833 17.712 18.6833 18.0049 18.3904C18.2977 18.0975 18.2977 17.6226 18.0049 17.3297L14.753 14.0777C15.713 12.8239 16.2798 11.2565 16.2798 9.16666C16.2798 5.02452 12.912 1.66666 9.1665 1.66666Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
              />
              <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-1 text-theme-xs font-medium text-gray-400 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 xl:flex">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.3335 4.33333V3.33333C1.3335 2.22876 2.22893 1.33333 3.3335 1.33333H4.3335M8.66683 1.33333H9.66683C10.7714 1.33333 11.6668 2.22876 11.6668 3.33333V4.33333M11.6668 8.66667V9.66667C11.6668 10.7712 10.7714 11.6667 9.66683 11.6667H8.66683M4.3335 11.6667H3.3335C2.22893 11.6667 1.3335 10.7712 1.3335 9.66667V8.66667"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4.3335 6.5H8.66683"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 4.33333V8.66667"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                K
              </span>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 2xsm:gap-4">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
