import React from 'react';
import { motion } from 'framer-motion';

export default function OnboardingProgress({ currentStep, totalSteps }) {
  // Calculate percentage
  const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100));

  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary rounded-full"
          initial={{ width: `${(currentStep - 1 === 0 ? 0 : ((currentStep - 2) / (totalSteps - 1)) * 100)}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}
