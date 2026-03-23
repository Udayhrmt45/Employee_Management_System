import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { id: '01', name: 'Add your company', description: 'Create your workspace and configure your department structures in seconds.' },
  { id: '02', name: 'Invite employees', description: 'Send magic links to your team members so they can set up their own profiles.' },
  { id: '03', name: 'Manage HR in one dashboard', description: 'Once onboarded, handle attendance, leaves, and records from a single pane of glass.' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-background" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get your entire organization up and running in less than five minutes.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative bg-secondary/50 rounded-3xl p-8 border border-border/50 overflow-hidden group"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                <div className="text-5xl font-extrabold text-primary/20 mb-6">{step.id}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
