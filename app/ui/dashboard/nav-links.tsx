'use client';

import {
  HomeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Define navigation links with appropriate icons
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: CurrencyDollarIcon, // 💰 Represents financial transactions
  },
  {
    name: 'Isusu',
    href: '/dashboard/manage-isusu',
    icon: UsersIcon, // 👥 Represents group savings
  },
  {
    name: 'Edit Profile',
    href: '/dashboard/edit-profile',
    icon: PencilSquareIcon, // ✏️ Represents profile editing
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname.startsWith(link.href); // Check active state

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': isActive,
              },
            )}
          >
            <LinkIcon className="w-6 h-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
