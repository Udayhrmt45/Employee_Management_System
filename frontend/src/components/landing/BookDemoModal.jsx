import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

export default function BookDemoModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    team_size: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/v1/demo-requests', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg bg-card p-8 shadow-2xl rounded-2xl ring-1 ring-border"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 space-y-4 text-center"
              >
                <div className="rounded-full bg-green-50 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Request Received</h2>
                <p className="text-muted-foreground">
                  Thanks! We'll get in touch with you shortly.
                </p>
                <Button onClick={onClose} className="mt-6 w-full">Close</Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">Book a Demo</h2>
                  <p className="text-sm text-muted-foreground">
                    See exactly how TeamEase can transform your HR process.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required placeholder="Jane Doe" onChange={handleChange} disabled={loading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="jane@company.com" onChange={handleChange} disabled={loading} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input id="company_name" name="company_name" required placeholder="Acme Corp" onChange={handleChange} disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Select onValueChange={(val) => setFormData({ ...formData, team_size: val })} disabled={loading} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="200+">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">How can we help? (Optional)</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Tell us about your current HR challenges..." 
                      className="resize-none"
                      onChange={handleChange} 
                      disabled={loading} 
                    />
                  </div>

                  {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                  <Button type="submit" className="w-full h-12 text-base transition-transform hover:-translate-y-0.5 active:translate-y-0" disabled={loading || !formData.team_size}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                      </>
                    ) : (
                      'Request Demo'
                    )}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
