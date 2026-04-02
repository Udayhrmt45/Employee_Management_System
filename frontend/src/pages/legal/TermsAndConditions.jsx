import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using our TeamEase platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you do not have permission to access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Service Provision</h2>
            <p>
              We provide human resource management tools including but not limited to employee directories, attendance tracking, and leave management systems. We reserve the right to modify or discontinue, temporarily or permanently, the Service with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Subscriptions and Payments</h2>
            <p>
              Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis (such as monthly or annually). Upgrading to a premium tier requires a valid payment method. All payments are processed securely via our designated payment processors (e.g., Razorpay).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Accounts and Data Security</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the credentials you use to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of TeamEase and its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall TeamEase, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@example.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
