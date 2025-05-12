'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  title: string;
  active?: boolean;
}

export function SidebarItem({ href, icon, title, active }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-1 ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span>{title}</span>
    </Link>
  );
}

interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

interface SidebarProps {
  sections: {
    title?: string;
    items: {
      href: string;
      icon: ReactNode;
      title: string;
    }[];
  }[];
}

export default function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="py-2">
      {sections.map((section, i) => (
        <SidebarSection key={i} title={section.title}>
          {section.items.map((item, j) => (
            <SidebarItem
              key={j}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={pathname === item.href}
            />
          ))}
        </SidebarSection>
      ))}
    </div>
  );
}
