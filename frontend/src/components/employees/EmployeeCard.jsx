import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Briefcase } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } }
};

export default function EmployeeCard({ employee, onViewEmployee }) {
  return (
    <motion.div 
      variants={itemVariants} 
      whileHover={{ y: -4, scale: 1.015 }} 
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => onViewEmployee?.(employee.id)}>
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-24 relative flex justify-center">
            <div className="absolute -bottom-10 h-20 w-20 rounded-full border-4 border-background bg-secondary flex items-center justify-center shadow-sm overflow-hidden text-secondary-foreground font-semibold text-xl">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                employee.name.charAt(0)
              )}
            </div>
          </div>
          <div className="pt-12 pb-6 px-6 text-center">
            <h3 className="text-lg font-bold tracking-tight">{employee.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <Briefcase className="h-3 w-3" /> {employee.position}
            </p>
            
            <div className="flex justify-center gap-2 mt-3">
               <Badge variant="outline" className="bg-primary/5">{employee.department}</Badge>
               <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className={employee.status === 'Active' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200' : ''}>
                 {employee.status}
               </Badge>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{employee.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
