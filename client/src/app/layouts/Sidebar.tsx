'use client';

import { usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import CustomLink from '../components/CustomLink';

interface SidebarMenuGroup {
  title: string;
  items: SidebarMenuItem[];
}

interface SidebarMenuItem {
  href: string;
  icon?: ReactNode;
  title: string;
  showIfRoles?: string[];
  subItems?: {
    href: string;
    title: string;
    showIfRoles?: string[];
  }[];
}

interface SidebarProps {
  sections: SidebarMenuGroup[];
  userRole?: string;
}

interface SidebarItemProps {
  href: string;
  icon?: ReactNode;
  title: string;
  active?: boolean;
  subItems?: {
    href: string;
    title: string;
    showIfRoles?: string[];
  }[];
  showIfRoles?: string[];
  userRole?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const SidebarItem = ({ 
  href, 
  icon, 
  title, 
  active, 
  subItems, 
  showIfRoles, 
  userRole,
  isExpanded,
  onToggle 
}: SidebarItemProps) => {
  const pathname = usePathname();
  const hasSubItems = subItems && subItems.length > 0;
  const isVisible = !showIfRoles || !userRole || showIfRoles.includes(userRole);

  if (!isVisible) return null;

  const isSubItemActive = subItems?.some(item => pathname === item.href);
  const isActiveParent = active || isSubItemActive;

  return (
    <div>
      <div 
        className={`flex items-center px-3 py-2.5 text-sm rounded-md mb-1 cursor-pointer transition-all duration-200 ${
          isActiveParent
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
        }`}
        onClick={hasSubItems ? onToggle : undefined}
      >
        <CustomLink 
          href={hasSubItems ? '#' : href}
          className="flex-1 flex items-center"
          onClick={e => hasSubItems && e.preventDefault()}
        >
          {icon && <span className="mr-3">{icon}</span>}
          <span className="flex-1">{title}</span>
        </CustomLink>
        {hasSubItems && (
          <ChevronDownIcon 
            className={`w-5 h-5 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </div>
      
      {hasSubItems && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 space-y-1"
            >
              {subItems.map((item, index) => {
                const isSubItemVisible = !item.showIfRoles || !userRole || item.showIfRoles.includes(userRole);
                if (!isSubItemVisible) return null;

                const isActive = pathname === item.href;
                return (
                  <CustomLink
                    key={index}
                    href={item.href}
                    className={`block px-3 py-2 text-xs rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    {item.title}
                  </CustomLink>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

const Sidebar = ({ sections, userRole }: SidebarProps) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(current =>
      current.includes(sectionIndex)
        ? current.filter(i => i !== sectionIndex)
        : [...current, sectionIndex]
    );
  };

  return (
    <nav className="flex-1 px-2 py-4 space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <div className="mb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </p>
          </div>
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <SidebarItem
                key={itemIndex}
                {...item}
                active={pathname === item.href}
                userRole={userRole}
                isExpanded={expandedSections.includes(sectionIndex * 100 + itemIndex)}
                onToggle={() => toggleSection(sectionIndex * 100 + itemIndex)}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;
