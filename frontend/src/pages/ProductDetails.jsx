import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, ShieldCheck, BellRing, CalendarCheck, Clock, LineChart, LayoutDashboard, 
  ChevronRight, Building, Play, Briefcase, Sparkles, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import BookDemoModal from '@/components/landing/BookDemoModal';

const FEATURES_GRID = [
  { icon: Users, title: 'Employee Directory', desc: 'Centralized and secure hub for all employee records and profiles.' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Granular permissions for Super Admin, Owner, and basic employees.' },
  { icon: BellRing, title: 'Smart Notifications', desc: 'Actionable alerts and targeted messaging for critical updates.' },
  { icon: CalendarCheck, title: 'Leave Management', desc: 'Automated workflows for time-off requests and approvals.' },
  { icon: Clock, title: 'Attendance Tracking', desc: 'Clock-in/out systems mapped directly to payroll cycles.' },
  { icon: LineChart, title: 'Performance Metrics', desc: 'Monitor KPIs and track objectives intuitively.' },
];

const STEPS = [
  { id: 1, title: 'Create Organization', desc: 'Set up your workspace and customize your branding in minutes.' },
  { id: 2, title: 'Invite the Team', desc: 'Bulk import employees and assign them custom roles & access levels.' },
  { id: 3, title: 'Streamline Operations', desc: 'Manage leaves, attendance, and automate your daily HR routines.' },
  { id: 4, title: 'Track & Optimize', desc: 'Utilize dashboards to monitor productivity and operational efficiency.' }
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function ProductDetails() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Go Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 bg-background/50 backdrop-blur-md border shadow-sm hover:bg-background transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go Back</span>
        </Button>
      </div>
      {/* 
        ========================================
        1. HERO SECTION
        ========================================
      */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[800px] w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center text-balance">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                <Sparkles className="w-4 h-4" /> Feature Deep Dive
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl max-w-4xl mx-auto">
              Meet the New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">TeamEase</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              We've re-engineered human resources from the ground up. Say goodbye to fragmented tools and experience a unified platform designed for modern, high-performance teams.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="h-12 px-8 shadow-lg hover:shadow-primary/25 bg-gradient-to-r from-blue-600 to-purple-600 border-0 transition-transform hover:scale-105 hover:-translate-y-0.5">
                  Get Started Free
                </Button>
              </Link>
              <Button onClick={() => setIsDemoOpen(true)} variant="outline" size="lg" className="h-12 px-8">
                Book a Demo <Play className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================
        2. FEATURES GRID OVERVIEW
        ========================================
      */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need to scale</h2>
            <p className="mt-4 text-lg text-muted-foreground">Comprehensive features architected to automate the mundane and elevate the essential.</p>
          </div>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {FEATURES_GRID.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="relative group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================
        3. DETAILED FEATURES (ZIG-ZAG)
        ========================================
      */}
      <section className="py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Security & Access
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Secure, Role-Based Access Control</h2>
              <p className="text-lg text-muted-foreground">
                Maintain strict data governance with our hierarchical role system. Super Admins oversee the platform, Owners manage individual organizations, and Employees interact inside their tailored sandbox.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-x-3"><CheckCircle2 className="h-6 w-5 flex-none text-primary" /> View configurations and settings specifically scoped to your team.</li>
                <li className="flex gap-x-3"><CheckCircle2 className="h-6 w-5 flex-none text-primary" /> Restrict sensitive salary and personal datastreams to authorized personnel.</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-2xl blur-2xl"></div>
              <div className="relative rounded-2xl border bg-card shadow-2xl p-8 aspect-video flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-16 h-16 text-primary mb-4 opacity-50" />
                <div className="space-y-2 w-3/4 opacity-70">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Engagement
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Targeted Notifications Engine</h2>
              <p className="text-lg text-muted-foreground">
                Cut through the noise. Send organization-wide announcements, role-specific alerts, or targeted 1:1 messages instantly. Keep your team aligned without overwhelming their inboxes.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-x-3"><CheckCircle2 className="h-6 w-5 flex-none text-blue-600" /> Push notifications instantly sync across active user sessions.</li>
                <li className="flex gap-x-3"><CheckCircle2 className="h-6 w-5 flex-none text-blue-600" /> Filter distributions intelligently by role, department, or tenure.</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-2xl blur-2xl"></div>
              <div className="relative rounded-2xl border bg-card shadow-2xl p-8 aspect-video flex flex-col items-center justify-center text-center">
                <BellRing className="w-16 h-16 text-blue-500 mb-4 opacity-50" />
                <div className="w-full space-y-3 opacity-70 flex flex-col items-start">
                  <div className="flex justify-between w-full"><div className="h-3 bg-muted rounded w-1/4"></div><div className="h-3 bg-muted rounded w-1/6"></div></div>
                  <div className="h-10 bg-muted rounded border w-full"></div>
                  <div className="h-10 bg-muted rounded border w-full"></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Insights
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Actionable Dashboards</h2>
              <p className="text-lg text-muted-foreground">
                Get a bird's eye view of your company's pulse. Visualize headcount variations, track daily attendance shifts, and monitor pending leave requests—all from a single pane of glass.
              </p>
              <Link to="/demo">
                <Button variant="link" className="px-0 mt-4 text-purple-600 hover:text-purple-700">Explore dashboards <ChevronRight className="ml-1 w-4 h-4" /></Button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-2xl blur-2xl"></div>
              <div className="relative rounded-2xl border bg-card shadow-2xl p-8 aspect-video flex gap-4 items-end justify-center">
                <div className="w-8 bg-purple-500/30 rounded-t-md h-1/4"></div>
                <div className="w-8 bg-purple-500/50 rounded-t-md h-2/4"></div>
                <div className="w-8 bg-purple-500/70 rounded-t-md h-3/4"></div>
                <div className="w-8 bg-purple-500 rounded-t-md h-full"></div>
                <div className="w-8 bg-purple-500/40 rounded-t-md h-1/2"></div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 
        ========================================
        4. HOW IT WORKS (STEPPER)
        ========================================
      */}
      <section className="py-24 bg-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">How it Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">From registration to total operational supremacy in four easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-6 left-1/2 -ml-[40%] w-[80%] h-[2px] bg-border border-dashed z-0"></div>

            {STEPS.map((step, idx) => (
              <motion.div 
                key={step.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex justify-center items-center font-bold text-xl ring-4 ring-background shadow-md">
                  {step.id}
                </div>
                <h4 className="text-lg font-semibold text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================
        5. USE CASES
        ========================================
      */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Built for Every Team</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl border p-8 space-y-4 bg-card hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Ambitious Startups</h3>
              <p className="text-muted-foreground">Stop using spreadsheets. Institutionalize your workforce management early so you can focus exclusively on scaling your core product.</p>
            </div>
            
            <div className="rounded-2xl border p-8 space-y-4 bg-card hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Scaling SMEs</h3>
              <p className="text-muted-foreground">Migrate off expensive, bloated legacy enterprise systems. Pay a flat rate of ₹199/employee for a modern interface that employees love.</p>
            </div>

            <div className="rounded-2xl border p-8 space-y-4 bg-card hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-6">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">HR Departments</h3>
              <p className="text-muted-foreground">Automate the busywork. Shift your focus from manually approving leaves and tracking attendance to building exceptional workplace culture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        6. BOTTOM CTA
        ========================================
      */}
      <section className="relative py-24 bg-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 mix-blend-overlay"></div>
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center text-background">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">Start Managing Your Team Efficiently Today</h2>
          <p className="text-lg text-muted/80 mb-10">
            Join the forward-thinking organizations already streamlining their operations with TeamEase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link to="/sign-up">
                <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground border-0 w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Button onClick={() => setIsDemoOpen(true)} variant="secondary" size="lg" className="h-12 px-8 w-full sm:w-auto text-foreground">
                Book Demo
              </Button>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        7. FOOTER
        ========================================
      */}
      <footer className="bg-card border-t py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">TE</div>
            <span className="font-semibold text-lg tracking-tight">TeamEase</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TeamEase Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
             <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
             <Link to="/refund-policy" className="hover:text-foreground transition-colors">Privacy</Link>
             <a href="mailto:contact@teamease.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <BookDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}

// Inline fallback icon to satisfy import errors if missing
function Rocket(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  )
}
