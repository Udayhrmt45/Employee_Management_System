import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarDays, LayoutDashboard } from 'lucide-react';

const features = [
  {
    name: 'Employee Onboarding',
    description: 'Effortlessly add new hires to your organization with guided, self-serve workflows that eliminate paperwork.',
    icon: Users,
  },
  {
    name: 'Attendance Tracking',
    description: 'Real-time check-ins and check-outs with automated timesheet generation and late-arrival tracking natively built-in.',
    icon: Clock,
  },
  {
    name: 'Leave Management',
    description: 'Simplify time-off requests. Employees can easily request leave, and managers can approve them with a single click.',
    icon: CalendarDays,
  },
  {
    name: 'Simple Dashboard',
    description: 'A distinctly clean, Notion-like interface designed meticulously to keep HR teams focused, fast, and organized.',
    icon: LayoutDashboard,
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24 sm:py-32 bg-secondary/30" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Deploy faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to manage your team
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We stripped away the complexity of traditional enterprise HR tools to build a platform that actually works for modern startups.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group flex flex-col rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border transition-all hover:shadow-lg hover:border-primary/20"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3">
                    <feature.icon className="h-5 w-5 text-primary transition-colors group-hover:text-blue-600" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
