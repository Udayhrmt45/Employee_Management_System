import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.99 },
};

const pageTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

const AnimatedPageWrapper = ({ children, locationKey }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={locationKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="h-full"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export default function AdminLayout() {
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {isSidebarExpanded && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0",
        isSidebarExpanded ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
      )}>
        <AdminSidebar isExpanded={isSidebarExpanded} />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Navbar toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
          <AnimatedPageWrapper locationKey={location.pathname}>
            <Outlet />
          </AnimatedPageWrapper>
        </main>
      </div>
    </div>
  );
}
