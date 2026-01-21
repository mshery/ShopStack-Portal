import { useEffect, useRef } from "react";
import { useSidebar } from "@/app/context/SidebarContext";
import NotificationDropdown from "@/shared/components/header/NotificationDropdown";
import UserDropdown from "@/shared/components/header/UserDropdown";
import { ThemeToggleButton } from "@/shared/components/feedback/ThemeToggleButton";

export default function AppHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
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
        <button
          className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 lg:hidden dark:text-gray-400"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
        >
          {isMobileOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>

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
