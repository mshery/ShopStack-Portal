import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Icon wrapper component for consistent SVG icon usage
 *
 * @example
 * import { ReactComponent as AlertIcon } from '@/shared/icons/alert.svg';
 * <Icon component={AlertIcon} className="text-red-500" size={24} />
 */
export function Icon({
  component: Component,
  className = "",
  size = 20,
  ...props
}: IconProps & {
  component: React.FunctionComponent<SVGProps<SVGSVGElement>>;
}) {
  return (
    <Component className={className} width={size} height={size} {...props} />
  );
}
