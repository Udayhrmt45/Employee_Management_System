import React from 'react';
import { motion } from 'framer-motion';

const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function PageHeader({ title, description, children }) {
  return (
    <motion.div 
      variants={headerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </motion.div>
  );
}
