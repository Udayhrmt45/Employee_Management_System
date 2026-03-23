import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free Plan',
    id: 'tier-free',
    href: '/sign-up',
    price: '$0',
    description: 'Perfect for tiny startups and founding teams.',
    features: ['Up to 5 employees', 'Basic attendance tracking', 'Standard leave management', 'Community support'],
    featured: false,
    cta: 'Get started for free'
  },
  {
    name: 'Starter Plan',
    id: 'tier-starter',
    href: '/sign-up',
    price: '$2',
    priceSuffix: '/employee',
    description: 'Everything you need as your team begins to scale.',
    features: ['Unlimited employees', 'Advanced analytics', 'Custom holiday calendars', 'Priority email support', 'Export payload capabilities'],
    featured: true,
    cta: 'Start Free Trial'
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            No hidden fees. No surprise charges. Just fair pricing that scales as your startup grows.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 gap-x-8 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className={`rounded-3xl p-8 ring-1 ring-border sm:p-10 ${tier.featured ? 'bg-primary text-primary-foreground shadow-xl lg:scale-105 z-10' : 'bg-card text-card-foreground shadow-sm'}`}
            >
              <h3 id={tier.id} className={`text-base font-semibold leading-7 ${tier.featured ? 'text-primary-foreground/90' : 'text-primary'}`}>
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
                {tier.priceSuffix && <span className={`text-base font-semibold ${tier.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{tier.priceSuffix}</span>}
              </p>
              <p className={`mt-6 text-base leading-7 ${tier.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {tier.description}
              </p>
              <ul className={`mt-8 space-y-3 text-sm leading-6 sm:mt-10 ${tier.featured ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className={`h-6 w-5 flex-none ${tier.featured ? 'text-primary-foreground' : 'text-primary'}`} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={tier.href} className="w-full mt-8 block">
                <Button 
                  variant={tier.featured ? "secondary" : "default"} 
                  className="w-full h-12 text-base transition-transform hover:-translate-y-0.5"
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
