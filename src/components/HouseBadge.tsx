import { HouseColor } from '@/types';

interface HouseBadgeProps {
  color: HouseColor;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<HouseColor, string> = {
  red: 'bg-house-red',
  blue: 'bg-house-blue',
  green: 'bg-house-green',
  yellow: 'bg-house-yellow',
};

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function HouseBadge({ color, size = 'md' }: HouseBadgeProps) {
  return (
    <div 
      className={`${colorMap[color]} ${sizeMap[size]} rounded-full ring-2 ring-background shadow-sm`}
      title={`${color.charAt(0).toUpperCase() + color.slice(1)} House`}
    />
  );
}
