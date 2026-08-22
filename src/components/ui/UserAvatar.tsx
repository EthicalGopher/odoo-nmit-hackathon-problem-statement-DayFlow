import React from 'react';
import Avatar, { genConfig } from 'react-nice-avatar';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: string; // e.g. "w-9 h-9" or "w-12 h-12" or "w-28 h-28"
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, src, size = "w-10 h-10", className = "" }) => {
  const config = genConfig(name || 'Dayflow Employee');

  return (
    <div className={`shrink-0 rounded-full overflow-hidden border-2 border-[#E07A5F] shadow-md flex items-center justify-center bg-[#1C1A19] ${size} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to vector avatar if image fails to load
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <Avatar className="w-full h-full object-cover rounded-full" {...config} />
      )}
    </div>
  );
};
