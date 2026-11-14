'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import HomeIcon from '../icons/home-icon';
import CalendarIcon from '../icons/calendar-icon';
import ActivityIcon from '../icons/activity-icon';
import StoreIcon from '../icons/store-icon';

type NavItem = {
  label: string;
  href: string;
  icon: 'home' | 'events' | 'activity' | 'store';
};

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/home',
    icon: 'home',
  },
  {
    label: 'Events',
    href: '/event/discover',
    icon: 'events',
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: 'activity',
  },
  {
    label: 'Store',
    href: '/store',
    icon: 'store',
  },
];

export default function StoreBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/event/discover') {
      return (
        pathname.startsWith('/event') ||
        pathname.startsWith('/create-event')
      );
    }

    return pathname === href;
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

    return <StoreIcon />;
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