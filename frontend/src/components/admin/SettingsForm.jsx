import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';

export default function SettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    default_trial_days: '14',
    max_employees_free_plan: '5',
    support_email: 'support@hrsaas.com'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        toast.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.put('/admin/settings', settings);
      toast.success('Platform settings updated successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Global Configuration</CardTitle>
        <CardDescription>
          These settings apply to all tenants across the platform unless overridden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default_trial_days">Default Trial Days</Label>
            <Input 
              id="default_trial_days" 
              name="default_trial_days"
              type="number" 
              value={settings.default_trial_days} 
              onChange={handleChange}
              required 
            />
            <p className="text-xs text-muted-foreground">The number of days a new company gets on the growth plan trial.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max_employees_free_plan">Max Employees (Free Plan)</Label>
            <Input 
              id="max_employees_free_plan" 
              name="max_employees_free_plan"
              type="number" 
              value={settings.max_employees_free_plan} 
              onChange={handleChange}
              required 
            />
            <p className="text-xs text-muted-foreground">Maximum number of active employees allowed on the FREE plan.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="support_email">Global Support Email</Label>
            <Input 
              id="support_email" 
              name="support_email"
              type="email" 
              value={settings.support_email} 
              onChange={handleChange}
              required 
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t px-6 py-4">
        <Button form="settings-form" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
