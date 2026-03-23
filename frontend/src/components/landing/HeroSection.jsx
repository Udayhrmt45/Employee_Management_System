import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 sm:pt-32 sm:pb-40">
      {/* Abstract Background Elements */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div variants={fadeUpVariants} className="mb-8 flex justify-center">
              <span className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-foreground/20 transition-all cursor-pointer">
                Announcing our new Series A funding. <a href="#" className="font-semibold text-primary"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeUpVariants} className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
              The Simplest HR System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Growing Startups</span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariants} className="mt-6 text-lg leading-8 text-muted-foreground mb-10 max-w-2xl mx-auto">
              Manage employees, attendance, and leave without spreadsheets. Drop the outdated legacy software and give your team an HR dashboard they actually love using.
            </motion.p>
            
            <motion.div variants={fadeUpVariants} className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base group">
                  Book Demo <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
