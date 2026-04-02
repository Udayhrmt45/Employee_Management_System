import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RefundPolicy() {
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
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">Refund and Cancellation Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Refund Eligibility</h2>
            <p>
              We want you to be completely satisfied with our TeamEase platform. If you are not satisfied with your premium subscription, we offer a full refund within the first 7 days of your initial purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Exclusions</h2>
            <p>
              Refunds are not applicable for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Subscription renewals (monthly or annual) after the initial 7-day period.</li>
              <li>Accounts that have violated our Terms and Conditions.</li>
              <li>Partial months of service upon cancellation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. How to Request a Refund</h2>
            <p>
              To request a refund within the eligible 7-day window, please contact our support team at billing@example.com from the email address associated with your administrator account. Please include your order ID or the email address used during the transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Processing Time</h2>
            <p>
              Approved refunds are processed within 5-7 business days. The funds will be credited back to your original method of payment. Depending on your bank or credit card provider, it may take additional time for the credit to appear on your statement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Subscription Cancellations</h2>
            <p>
              You may cancel your subscription at any time through the Billing Settings in your dashboard. Upon cancellation, your account will remain on the premium tier until the end of your current billing cycle, after which it will be downgraded to the Free Plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Contact Information</h2>
            <p>
              For any questions regarding billing, cancellations, or refunds, please reach out to us at billing@example.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
