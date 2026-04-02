import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Clock, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Logo from '@/components/branding/Logo';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Leave', href: '/leave', icon: Calendar },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

const SidebarItem = ({ name, href, icon: Icon, isExpanded }) => (
  <NavLink
    to={href}
    className={({ isActive }) =>
      cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-secondary text-secondary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
      )
    }
  >
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
      <Icon className="h-4 w-4 shrink-0" />
    </motion.div>
    <motion.span
      initial={false}
      animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
      className="overflow-hidden whitespace-nowrap"
    >
      {name}
    </motion.span>
  </NavLink>
);

export default function Sidebar({ isExpanded }) {
  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 240 : 68 }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
      className="relative flex h-full flex-col border-r bg-card text-card-foreground overflow-hidden"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-16 shrink-0 items-center">
            <Logo />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAVIGATION_ITEMS.map((item) => {
          return <SidebarItem key={item.name} {...item} isExpanded={isExpanded} />;
        })}
      </nav>

      <div className="p-3 border-t space-y-1">
        <SidebarItem name="Settings" href="/settings" icon={Settings} isExpanded={isExpanded} />
      </div>
    </motion.div>
  );
}
