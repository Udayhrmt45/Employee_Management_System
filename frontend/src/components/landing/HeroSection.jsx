import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookDemoModal from './BookDemoModal';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 sm:pt-32 sm:pb-40">
      {/* Animated Abstract Background Elements */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}>
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Floating Elements Desktop */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-12 top-20 hidden lg:flex items-center gap-3 rounded-2xl bg-card p-4 shadow-xl ring-1 ring-border/50 backdrop-blur-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Team joined</p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [15, -15, 15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-8 top-40 hidden lg:flex items-center gap-3 rounded-2xl bg-card p-4 shadow-xl ring-1 ring-border/50 backdrop-blur-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">+24% Productivity</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </motion.div>

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
              <span className="relative flex items-center justify-center gap-2 rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border shadow-sm hover:shadow-md hover:ring-foreground/20 transition-all cursor-pointer">
                <Sparkles className="w-4 h-4 text-primary" /> Meet the new TeamEase. <a href="#" className="font-semibold text-primary"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeUpVariants} className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
              The Simplest HR System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Growing Startups</span>
            </motion.h1>
            
            <motion.p variants={fadeUpVariants} className="mt-6 text-lg leading-8 text-muted-foreground mb-10 max-w-2xl mx-auto">
              Manage employees, attendance, and leave without spreadsheets. Drop the outdated legacy software and give your team an HR dashboard they actually love using.
            </motion.p>
            
            <motion.div variants={fadeUpVariants} className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  Start Free Trial
                </Button>
              </Link>
              <Button onClick={() => setIsDemoOpen(true)} variant="outline" size="lg" className="h-12 px-8 text-base group hover:bg-muted/50 transition-colors cursor-pointer">
                Book Demo <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <BookDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}

