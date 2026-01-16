import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuthStore } from "../../stores/auth.store";
import { User, LogOut, Settings, HelpCircle } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuthStore();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-1 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
      >
        <div className="relative">
          <div className="flex items-center justify-center font-bold text-gray-500 rounded-full h-11 w-11 bg-gray-100 border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{currentUser?.name?.charAt(0) || "U"}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 block border-2 border-white rounded-full size-3 bg-success-500 dark:border-gray-900"></span>
        </div>

        <div className="hidden text-left xl:block">
          <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
            {currentUser?.name || "User"}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {currentUser?.role === "super_admin"
              ? "Super Admin"
              : "Tenant Member"}
          </span>
        </div>

        <svg
          className={`hidden xl:block stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[240px] flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
          <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
            {currentUser?.name || "User"}
          </span>
          <span className="block text-xs text-gray-400 truncate">
            {currentUser?.email || "user@example.com"}
          </span>
        </div>

        <div className="space-y-0.5">
          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/tenant/profile"
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
          >
            <User className="size-4" />
            My Profile
          </DropdownItem>

          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/settings"
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
          >
            <Settings className="size-4" />
            Account Settings
          </DropdownItem>

          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/help"
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
          >
            <HelpCircle className="size-4" />
            Support Center
          </DropdownItem>
        </div>

        <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              closeDropdown();
              logout();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-error-600 rounded-lg hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
