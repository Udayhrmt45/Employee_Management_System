import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, CreditCard, Shield, Network } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { hasPermission, ROLES } from '@/utils/roleUtils';

import CompanySettings from '@/components/settings/CompanySettings';
import TeamSettings from '@/components/settings/TeamSettings';
import BillingSettings from '@/components/settings/BillingSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import DepartmentSettings from '@/components/settings/DepartmentSettings';

const tabs = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'departments', label: 'Departments', icon: Network },
  { id: 'team', label: 'Team Management', icon: Users },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield }
];

export default function Settings() {
  const [searchParams] = useSearchParams();
  const { userRole } = useAuthUser();
  const initialTab = searchParams.get('tab') || 'company';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'team' && !hasPermission(userRole, ROLES.ADMIN)) return false;
    if (tab.id === 'billing' && !hasPermission(userRole, ROLES.OWNER)) return false;
    return true;
  });

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || 'company');
    }
  }, [activeTab, visibleTabs]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      <PageHeader
        title="Settings"
        description="Manage your account security and review your workspace information."
      />

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Settings Navigation Sidebar */}
        <aside className="md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                    ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="settings-active-tab"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'company' && <CompanySettings />}
              {activeTab === 'departments' && <DepartmentSettings />}
              {activeTab === 'team' && <TeamSettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'security' && <SecuritySettings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
