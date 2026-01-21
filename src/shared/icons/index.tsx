// ============================================================================
// INLINE ICON COMPONENTS (Existing)
// ============================================================================
// Re-export existing inline icon components
export {
  EyeIcon,
  EyeCloseIcon,
  ChevronLeftIcon,
} from "@/shared/components/icons/AuthIcons";

// Envelope icon for forgot password page
export function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.33341 5.83325C3.33341 5.3911 3.50901 4.96734 3.82157 4.65478C4.13413 4.34222 4.55789 4.16659 5.00008 4.16659H15.0001C15.4423 4.16659 15.866 4.34222 16.1786 4.65478C16.4912 4.96734 16.6667 5.3911 16.6667 5.83325V14.1666C16.6667 14.6088 16.4912 15.0325 16.1786 15.3451C15.866 15.6577 15.4423 15.8333 15.0001 15.8333H5.00008C4.55789 15.8333 4.13413 15.6577 3.82157 15.3451C3.50901 15.0325 3.33341 14.6088 3.33341 14.1666V5.83325ZM5.00008 5.83325L10.0001 9.58325L15.0001 5.83325H5.00008ZM15.0001 7.49992L10.0001 11.2499L5.00008 7.49992V14.1666H15.0001V7.49992Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ============================================================================
// SVG FILE IMPORTS (New - All 57 SVG files)
// ============================================================================

// Alert & Status Icons
export { ReactComponent as AlertHexaIcon } from "./alert-hexa.svg";
export { ReactComponent as AlertIcon } from "./alert.svg";
export { ReactComponent as CheckCircleIcon } from "./check-circle.svg";
export { ReactComponent as CheckLineIcon } from "./check-line.svg";
export { ReactComponent as InfoErrorIcon } from "./info-error.svg";
export { ReactComponent as InfoHexaIcon } from "./info-hexa.svg";
export { ReactComponent as InfoIcon } from "./info.svg";

// Navigation Icons
export { ReactComponent as AngleDownIcon } from "./angle-down.svg";
export { ReactComponent as AngleLeftIcon } from "./angle-left.svg";
export { ReactComponent as AngleRightIcon } from "./angle-right.svg";
export { ReactComponent as AngleUpIcon } from "./angle-up.svg";
export { ReactComponent as ArrowDownIcon } from "./arrow-down.svg";
export { ReactComponent as ArrowRightIcon } from "./arrow-right.svg";
export { ReactComponent as ArrowUpIcon } from "./arrow-up.svg";
export { ReactComponent as ChevronDownIcon } from "./chevron-down.svg";
export { ReactComponent as ChevronLeftSvgIcon } from "./chevron-left.svg";
export { ReactComponent as ChevronUpIcon } from "./chevron-up.svg";

// Action Icons
export { ReactComponent as CloseLineIcon } from "./close-line.svg";
export { ReactComponent as CloseIcon } from "./close.svg";
export { ReactComponent as CopyIcon } from "./copy.svg";
export { ReactComponent as DownloadIcon } from "./download.svg";
export { ReactComponent as PencilIcon } from "./pencil.svg";
export { ReactComponent as PlusIcon } from "./plus.svg";
export { ReactComponent as TrashIcon } from "./trash.svg";

// File & Document Icons
export { ReactComponent as BoxCubeIcon } from "./box-cube.svg";
export { ReactComponent as BoxLineIcon } from "./box-line.svg";
export { ReactComponent as BoxIcon } from "./box.svg";
export { ReactComponent as DocsIcon } from "./docs.svg";
export { ReactComponent as FileIcon } from "./file.svg";
export { ReactComponent as FolderIcon } from "./folder.svg";
export { ReactComponent as PageIcon } from "./page.svg";

// Communication Icons
export { ReactComponent as ChatIcon } from "./chat.svg";
export { ReactComponent as EnvelopeSvgIcon } from "./envelope.svg";
export { ReactComponent as MailLineIcon } from "./mail-line.svg";
export { ReactComponent as PaperPlaneIcon } from "./paper-plane.svg";

// User & Auth Icons
export { ReactComponent as EyeCloseSvgIcon } from "./eye-close.svg";
export { ReactComponent as EyeSvgIcon } from "./eye.svg";
export { ReactComponent as GroupIcon } from "./group.svg";
export { ReactComponent as LockIcon } from "./lock.svg";
export { ReactComponent as UserCircleIcon } from "./user-circle.svg";
export { ReactComponent as UserLineIcon } from "./user-line.svg";

// UI & Layout Icons
export { ReactComponent as CalendarIcon } from "./calendar.svg";
export { ReactComponent as CalenderLineIcon } from "./calender-line.svg";
export { ReactComponent as GridIcon } from "./grid.svg";
export { ReactComponent as HorizontalDotsIcon } from "./horizontal-dots.svg";
export { ReactComponent as ListIcon } from "./list.svg";
export { ReactComponent as MoredotIcon } from "./moredot.svg";
export { ReactComponent as TableIcon } from "./table.svg";
export { ReactComponent as TaskIconSvg } from "./task-icon.svg";
export { ReactComponent as TimeIcon } from "./time.svg";

// Business & Finance Icons
export { ReactComponent as DollarLineIcon } from "./dollar-line.svg";
export { ReactComponent as PieChartIcon } from "./pie-chart.svg";

// Media Icons
export { ReactComponent as AudioIcon } from "./audio.svg";
export { ReactComponent as VideosIcon } from "./videos.svg";

// Misc Icons
export { ReactComponent as BoltIcon } from "./bolt.svg";
export { ReactComponent as PlugInIcon } from "./plug-in.svg";
export { ReactComponent as ShootingStarIcon } from "./shooting-star.svg";

// ============================================================================
// ICON COMPONENT WRAPPER
// ============================================================================
export { Icon } from "@/shared/components/ui/Icon";
