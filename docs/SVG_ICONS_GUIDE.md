# SVG Icon System - Usage Guide

## Overview
The SaaS Frontend application now has full SVG icon support! All 57 SVG icons in the `/src/icons` directory are available as React components.

## How to Use SVG Icons

### Method 1: Direct Import (Recommended)
Import SVG icons directly as React components:

```tsx
import { AlertIcon, CheckCircleIcon, UserCircleIcon } from '@/icons';

function MyComponent() {
  return (
    <div>
      <AlertIcon className="text-red-500" width={24} height={24} />
      <CheckCircleIcon className="text-green-500" width={24} height={24} />
      <UserCircleIcon className="text-blue-500" width={24} height={24} />
    </div>
  );
}
```

### Method 2: Using the Icon Wrapper Component
For consistent sizing and styling:

```tsx
import { Icon, AlertIcon, CheckCircleIcon } from '@/icons';

function MyComponent() {
  return (
    <div>
      <Icon component={AlertIcon} className="text-red-500" size={24} />
      <Icon component={CheckCircleIcon} className="text-green-500" size={32} />
    </div>
  );
}
```

## Available Icons

### Alert & Status Icons
- `AlertHexaIcon`, `AlertIcon`, `CheckCircleIcon`, `CheckLineIcon`
- `InfoErrorIcon`, `InfoHexaIcon`, `InfoIcon`

### Navigation Icons
- `AngleDownIcon`, `AngleLeftIcon`, `AngleRightIcon`, `AngleUpIcon`
- `ArrowDownIcon`, `ArrowRightIcon`, `ArrowUpIcon`
- `ChevronDownIcon`, `ChevronLeftSvgIcon`, `ChevronUpIcon`

### Action Icons
- `CloseLineIcon`, `CloseIcon`, `CopyIcon`, `DownloadIcon`
- `PencilIcon`, `PlusIcon`, `TrashIcon`

### File & Document Icons
- `BoxCubeIcon`, `BoxLineIcon`, `BoxIcon`
- `DocsIcon`, `FileIcon`, `FolderIcon`, `PageIcon`

### Communication Icons
- `ChatIcon`, `EnvelopeSvgIcon`, `MailLineIcon`, `PaperPlaneIcon`

### User & Auth Icons
- `EyeCloseSvgIcon`, `EyeSvgIcon`, `GroupIcon`, `LockIcon`
- `UserCircleIcon`, `UserLineIcon`

### UI & Layout Icons
- `CalendarIcon`, `CalenderLineIcon`, `GridIcon`
- `HorizontalDotsIcon`, `ListIcon`, `MoredotIcon`
- `TableIcon`, `TaskIconSvg`, `TimeIcon`

### Business & Finance Icons
- `DollarLineIcon`, `PieChartIcon`

### Media Icons
- `AudioIcon`, `VideosIcon`

### Misc Icons
- `BoltIcon`, `PlugInIcon`, `ShootingStarIcon`

## Legacy Inline Icons
The following inline icon components are still available for backward compatibility:
- `EyeIcon`, `EyeCloseIcon`, `ChevronLeftIcon`, `EnvelopeIcon`

## Styling Tips

### Using Tailwind Classes
```tsx
<AlertIcon className="text-red-500 hover:text-red-600 transition-colors" />
```

### Custom Sizes
```tsx
<CheckCircleIcon width={48} height={48} />
// or with Icon wrapper
<Icon component={CheckCircleIcon} size={48} />
```

### Fill vs Stroke
Most icons use `fill="currentColor"`, so they inherit the text color:
```tsx
<UserCircleIcon className="text-brand-500" />
```

## Demo Page
Visit `/icon-demo` to see all icons in action!

## Technical Details

### Configuration
- **Vite Plugin**: `vite-plugin-svgr` configured in `vite.config.ts`
- **TypeScript**: Type declarations in `src/vite-env.d.ts`
- **Export Location**: All icons exported from `src/icons/index.tsx`

### Import Options
You can import icons in two ways:

1. **Named export (React Component)**:
   ```tsx
   import { AlertIcon } from '@/icons';
   ```

2. **Default export (URL string)**:
   ```tsx
   import alertIconUrl from '@/icons/alert.svg';
   <img src={alertIconUrl} alt="Alert" />
   ```

## Best Practices

1. **Use semantic naming**: Choose icons that match their purpose
2. **Consistent sizing**: Use the Icon wrapper for uniform sizes
3. **Accessibility**: Add `aria-label` for screen readers when needed
4. **Performance**: Icons are tree-shakeable - only imported icons are bundled

## Troubleshooting

### Icon not showing?
- Check the import name matches the exported name in `src/icons/index.tsx`
- Verify the SVG file exists in `src/icons/`
- Check console for import errors

### Wrong color?
- SVG icons use `currentColor` - set text color with `className="text-[color]"`
- Some SVGs have hardcoded fills - check the SVG file

### TypeScript errors?
- Ensure `src/vite-env.d.ts` is included in your `tsconfig.json`
- Restart your TypeScript server
