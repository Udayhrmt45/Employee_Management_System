import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } }
};

export default function LoadingSkeleton({ 
  rows = 3, 
  type = 'table', // 'table', 'card', 'list'
  className = ""
}) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`w-full ${className}`}
    >
      {type === 'table' && (
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="h-10 w-full bg-muted/50 rounded-md animate-pulse" />
          {[...Array(rows)].map((_, i) => (
            <motion.div key={i} variants={itemVariants} className="flex gap-4 items-center p-4 border rounded-md">
              <div className="h-10 w-10 rounded-full bg-muted/60 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/3 bg-muted/60 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-muted/40 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-muted/50 rounded-full animate-pulse shrink-0" />
            </motion.div>
          ))}
        </div>
      )}

      {type === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(rows)].map((_, i) => (
            <motion.div key={i} variants={itemVariants} className="border rounded-xl p-6 space-y-4 h-full">
              <div className="h-16 w-full bg-muted/50 rounded-md animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted/60 rounded animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {type === 'list' && (
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <motion.div key={i} variants={itemVariants} className="h-16 w-full bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
