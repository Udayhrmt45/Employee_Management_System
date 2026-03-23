import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } }
};

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = "No Data Found", 
  description = "There is currently no data to display here.", 
  action 
}) {
  return (
    <motion.div 
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-card border-dashed shadow-sm"
    >
      <div className="bg-muted p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mt-2 mb-6 text-sm">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
