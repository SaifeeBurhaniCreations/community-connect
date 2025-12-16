import { User } from 'lucide-react';
import { Member } from '@/types';
import { HouseBadge } from './HouseBadge';

interface AvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHouse?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

const houseSizeMap = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
} as const;

export function Avatar({ member, size = 'md', showHouse = true }: AvatarProps) {
  const initials = `${member.name[0]}${member.surname[0]}`.toUpperCase();

  return (
    <div className="relative inline-block">
      {member.profilePhoto ? (
        <img
          src={member.profilePhoto}
          alt={`${member.name} ${member.surname}`}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-border`}
        />
      ) : (
        <div 
          className={`${sizeMap[size]} rounded-full bg-secondary flex items-center justify-center ring-2 ring-border`}
        >
          <span className="font-medium text-secondary-foreground">{initials}</span>
        </div>
      )}
      {showHouse && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <HouseBadge color={member.houseColor} size={houseSizeMap[size]} />
        </div>
      )}
    </div>
  );
}
