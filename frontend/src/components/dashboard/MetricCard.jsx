import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } }
};

export default function MetricCard({ title, value, trend, icon: Icon, color, bg }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <Card className="overflow-hidden border-none shadow-sm transition-colors duration-300 relative group cursor-default">
        {/* Subtle absolute gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-card to-muted/20">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-full ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/40 mr-2"></span>
            {trend}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
