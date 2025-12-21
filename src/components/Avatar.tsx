import { HouseBadge } from './HouseBadge';
import { HouseColor } from '@/types';

interface AvatarMember {
  name?: string;
  surname?: string;
  profilePhoto?: string;
  profile_photo?: string;
  houseColor?: HouseColor;
  house_color?: string;
}

interface AvatarProps {
  member: AvatarMember;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showHouse?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

const houseSizeMap = {
  xs: 'sm',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
} as const;

export function Avatar({ member, size = 'md', showHouse = true }: AvatarProps) {
  const name = member.name || '';
  const surname = member.surname || '';
  const initials = name && surname ? `${name[0]}${surname[0]}`.toUpperCase() : '?';
  const photo = member.profilePhoto || member.profile_photo;
  const houseColor = (member.houseColor || member.house_color) as HouseColor | undefined;

  return (
    <div className="relative inline-block">
      {photo ? (
        <img
          src={photo}
          alt={`${name} ${surname}`}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-border`}
        />
      ) : (
        <div 
          className={`${sizeMap[size]} rounded-full bg-secondary flex items-center justify-center ring-2 ring-border`}
        >
          <span className="font-medium text-secondary-foreground">{initials}</span>
        </div>
      )}
      {showHouse && houseColor && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <HouseBadge color={houseColor} size={houseSizeMap[size]} />
        </div>
      )}
    </div>
  );
}
