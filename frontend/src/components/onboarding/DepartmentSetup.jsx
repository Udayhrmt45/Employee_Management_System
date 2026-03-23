import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Building2, Loader2 } from 'lucide-react';

export default function DepartmentSetup({ formData, updateFormData, onNext, onBack, isSubmitting }) {
  const [departments, setDepartments] = useState(
    formData.departments.length > 0 ? formData.departments : ['Engineering', 'Design', 'Marketing', 'HR', 'Sales']
  );
  const [newDepartment, setNewDepartment] = useState('');

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  const removeDepartment = (deptToRemove) => {
    setDepartments(departments.filter(dept => dept !== deptToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData({ departments });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Set up departments</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Organize your team structure. We've added some common ones to start.
        </p>
      </div>

      <div className="bg-card border shadow-sm rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {departments.map((dept, index) => (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              key={dept}
            >
              <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-1 pl-3 bg-secondary/60 hover:bg-secondary">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                {dept}
                <button 
                  onClick={() => removeDepartment(dept)}
                  className="ml-1 hover:bg-muted p-0.5 rounded-full transition-colors flex items-center justify-center h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
          {departments.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No departments added yet.</span>
          )}
        </div>

        <form onSubmit={handleAddDepartment} className="flex gap-2 relative border-t pt-5">
          <Input 
            placeholder="e.g. Finance" 
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            className="flex-1 pr-10 h-10"
          />
          <Button type="submit" size="sm" variant="secondary" className="absolute right-1 top-6 h-8 w-8 p-0" disabled={!newDepartment.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting || departments.length === 0} className="w-full h-11 text-base shadow-sm group">
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing Setup...</>
          ) : (
            'Complete Setup'
          )}
        </Button>
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting} className="w-full text-muted-foreground">
          Go back
        </Button>
      </div>
    </motion.div>
  );
}
