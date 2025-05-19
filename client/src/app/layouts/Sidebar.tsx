'use client';

import React, { ReactNode, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface SidebarItemProps {
  href: string;
  icon?: ReactNode;
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
      {icon && <span className="mr-3 text-lg">{icon}</span>}
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
      showIfRoles?: string[]; // Optional property to restrict menu items to specific roles
      subItems?: {
        href: string;
        title: string;
        showIfRoles?: string[];
      }[];
    }[];
  }[];
  userRole?: string; // Current user's role
}

export default function Sidebar({ sections, userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="py-2">
      {sections.map((section, i) => {
        // Filter items based on user role and showIfRoles property
        const visibleItems = section.items.filter(item => 
          !item.showIfRoles || // Show if no role restriction
          !userRole || // Show if no user role provided (fallback)
          item.showIfRoles.includes(userRole) // Show if user role is in allowed roles
        );

        // Don't render empty sections
        if (visibleItems.length === 0) return null;

        return (
          <SidebarSection key={i} title={section.title}>
            {visibleItems.map((item, j) => (
              <Fragment key={j}>
                <SidebarItem
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  active={pathname === item.href || (pathname && pathname.startsWith(item.href + '/'))}
                />
                {/* Render subitems if any */}
                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems
                      .filter(subItem => 
                        !subItem.showIfRoles || 
                        !userRole || 
                        subItem.showIfRoles.includes(userRole)
                      )
                      .map((subItem, k) => (
                        <SidebarItem
                          key={k}
                          href={subItem.href}
                          title={subItem.title}
                          active={pathname === subItem.href}
                          icon={null}
                        />
                      ))
                    }
                  </div>
                )}
              </Fragment>
            ))}
          </SidebarSection>
        );
      })}
    </div>
  );
}
