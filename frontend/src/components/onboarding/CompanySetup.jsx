import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompanySetup({ formData, updateFormData, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
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
        <h2 className="text-2xl font-semibold tracking-tight">Let's set up your workspace</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Tell us a bit about your company to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input 
            id="companyName" 
            placeholder="Acme Corp" 
            required 
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select 
            value={formData.companySize} 
            onValueChange={(value) => updateFormData({ companySize: value })}
            required
          >
            <SelectTrigger className="h-11 w-full text-left">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees (Startup)</SelectItem>
              <SelectItem value="11-50">11-50 employees (Growing)</SelectItem>
              <SelectItem value="51-200">51-200 employees (Scaling)</SelectItem>
              <SelectItem value="200+">200+ employees (Enterprise)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => updateFormData({ industry: value })}
            required
          >
            <SelectTrigger className="h-11 w-full text-left">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="software">Software & Technology</SelectItem>
              <SelectItem value="agency">Design / Marketing Agency</SelectItem>
              <SelectItem value="retail">E-commerce & Retail</SelectItem>
              <SelectItem value="finance">Finance & Consulting</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full h-11 mt-6 text-base">
          Continue
        </Button>
      </form>
    </motion.div>
  );
}
