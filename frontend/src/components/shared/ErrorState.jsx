import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } }
};

export default function ErrorState({ 
  title = "Failed to load data", 
  message = "An unexpected error occurred while communicating with the server.",
  onRetry 
}) {
  return (
    <motion.div 
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-destructive/5 border-destructive/20"
    >
      <div className="bg-destructive/10 p-4 rounded-full mb-4 text-destructive">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mt-2 mb-6 text-sm">{message}</p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2 border-destructive/30 hover:bg-destructive/10 text-destructive">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      )}
    </motion.div>
  );
}
