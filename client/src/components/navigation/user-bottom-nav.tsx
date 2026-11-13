'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import HomeIcon from '../icons/home-icon';
import CalendarIcon from '../icons/calendar-icon';
import ActivityIcon from '../icons/activity-icon';
import ProfileIcon from '../icons/profile-icon';

type NavItem = {
  label: string;
  href: string;
  icon: 'home' | 'events' | 'activity' | 'profile';
};

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/feed',
    icon: 'home',
  },
  {
    label: 'Events',
    href: '/event/explore',
    icon: 'events',
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: 'activity',
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: 'profile',
  },
];

export default function UserBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    // Events includes explore and event details
    if (href === '/event/explore') {
      return pathname.startsWith('/event');
    }

    return pathname.startsWith(href);
  }

  function getIcon(icon: NavItem['icon']) {
    if (icon === 'home') {
      return <HomeIcon />;
    }

    if (icon === 'events') {
      return <CalendarIcon />;
    }

    if (icon === 'activity') {
      return <ActivityIcon />;
    }

    return <ProfileIcon />;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto h-[92px] w-full max-w-[560px] border-t border-[#303030] bg-[#171717]">
      <div className="grid h-full grid-cols-4">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-[6px] ${
                active
                  ? 'text-white'
                  : 'text-[#4E4E4E]'
              }`}
            >
              {getIcon(item.icon)}

              <span className="text-[12px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}