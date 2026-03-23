import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export default function InviteEmployees({ formData, updateFormData, onNext, onBack }) {
  const [employees, setEmployees] = useState(formData.employees.length > 0 ? formData.employees : [{ name: '', email: '', role: '' }]);

  const updateEmployee = (index, field, value) => {
    const newEmployees = [...employees];
    newEmployees[index][field] = value;
    setEmployees(newEmployees);
  };

  const addEmployeeRow = () => {
    setEmployees([...employees, { name: '', email: '', role: '' }]);
  };

  const removeEmployeeRow = (index) => {
    const newEmployees = [...employees];
    newEmployees.splice(index, 1);
    setEmployees(newEmployees);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out completely empty rows
    const validEmployees = employees.filter(emp => emp.name || emp.email || emp.role);
    updateFormData({ employees: validEmployees });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl w-full mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Add your first employees</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Invite team members to join {formData.companyName || 'your workspace'}. You can always do this later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          {employees.map((employee, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="space-y-2 w-full sm:w-[35%]">
                {index === 0 && <Label className="text-xs text-muted-foreground">Name</Label>}
                <Input 
                  placeholder="John Doe" 
                  value={employee.name}
                  onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 w-full sm:w-[35%]">
                {index === 0 && <Label className="text-xs text-muted-foreground">Email</Label>}
                <Input 
                  type="email"
                  placeholder="john@example.com" 
                  value={employee.email}
                  onChange={(e) => updateEmployee(index, 'email', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 w-full sm:w-[25%] relative">
                {index === 0 && <Label className="text-xs text-muted-foreground">Role</Label>}
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Developer" 
                    value={employee.role}
                    onChange={(e) => updateEmployee(index, 'role', e.target.value)}
                    className="h-10"
                  />
                  {index > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeEmployeeRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addEmployeeRow}
            className="mt-2 text-primary border-primary/20 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another
          </Button>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-1/3 h-11 text-base">
            Back
          </Button>
          <Button type="submit" className="w-2/3 h-11 text-base">
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
