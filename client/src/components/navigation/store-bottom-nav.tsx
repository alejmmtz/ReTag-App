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

  function getIcon(icon: NavItem['icon'], active: boolean) {
    if (icon === 'home') {
      return <HomeIcon active={active} />;
    }

    if (icon === 'events') {
      return <CalendarIcon active={active} />;
    }

    if (icon === 'activity') {
      return <ActivityIcon active={active} />;
    }

    return <StoreIcon active={active} />;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto h-23 w-full max-w-lg border-t border-line bg-[#171717] px-8">
      <div className="grid h-full grid-cols-4 min-w-0">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-[6px] ${
                active
                  ? 'text-foreground'
                  : 'text-grey'
              }`}
            >
              {getIcon(item.icon, active)}

              <span className="text-xs">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
