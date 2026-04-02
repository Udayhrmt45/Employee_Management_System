import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, Settings, Bell, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Demo Requests', href: '/admin/demo-requests', icon: Inbox },
  { name: 'Companies', href: '/admin/companies', icon: Building2 },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const SidebarItem = ({ name, href, icon: Icon, isExpanded }) => (
  <NavLink
    to={href}
    end={href === '/admin'}
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

export default function AdminSidebar({ isExpanded }) {
  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 240 : 68 }}
      transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
      className="relative flex h-full flex-col border-r bg-card text-card-foreground overflow-hidden"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-600 text-white font-bold shadow-sm">
            SA
          </div>
          <motion.span
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
            className="whitespace-nowrap font-semibold tracking-tight text-purple-600"
          >
            Super Admin
          </motion.span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarItem key={item.name} {...item} isExpanded={isExpanded} />
        ))}
      </nav>
    </motion.div>
  );
}
