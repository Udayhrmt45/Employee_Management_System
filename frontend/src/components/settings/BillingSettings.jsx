import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthUser } from '@/hooks/useAuthUser';
import { hasPermission, ROLES } from '@/utils/roleUtils';
import { useCreatePaymentOrder, useSubscription, useTeamMembers, useVerifyPayment } from '@/hooks/useSettings';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { toast } from 'sonner';

const PLAN_DETAILS = {
  FREE: {
    label: 'Free Plan',
    price: '₹0/mo',
    features: ['Up to 5 Employees', 'Basic Attendance', 'Community Support'],
    amount: 0,
  },
  STARTER: {
    label: 'Starter Plan',
    price: '₹199/mo',
    features: ['Unlimited Employees', 'Advanced leave tracking', 'Priority email support'],
    amount: 19900,
  },
  GROWTH: {
    label: 'Growth Plan',
    price: '₹499/mo',
    features: ['Multi-team scaling', 'Expanded reporting', 'Priority support'],
    amount: 49900,
  },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BillingSettings() {
  const { profile, userRole } = useAuthUser();
  const isAdmin = hasPermission(userRole, ROLES.OWNER);
  const { subscription, isLoading, isError, errorMessage, refetch } = useSubscription();
  const { activeMembers } = useTeamMembers();
  const createOrderMutation = useCreatePaymentOrder();
  const verifyMutation = useVerifyPayment();
  const currentPlan = subscription?.company?.plan_type || 'FREE';
  const latestPayment = subscription?.latestPayment || null;
  const currentPlanDetails = PLAN_DETAILS[currentPlan] || PLAN_DETAILS.FREE;

  const handleUpgrade = async (plan) => {
    if (!isAdmin || !PLAN_DETAILS[plan] || plan === 'FREE') {
      return;
    }

    const razorpayReady = await loadRazorpayScript();

    if (!razorpayReady) {
      toast.error('Unable to open payment gateway', {
        description: 'Razorpay checkout could not be loaded right now.',
      });
      return;
    }

    try {
      const orderResponse = await createOrderMutation.mutateAsync({
        amount: PLAN_DETAILS[plan].amount,
        currency: 'INR',
        plan,
      });

      const orderPayload = orderResponse?.data || orderResponse;
      const options = {
        key: orderPayload.keyId,
        amount: orderPayload.order.amount,
        currency: orderPayload.order.currency,
        name: subscription?.company?.name || 'TeamEase',
        description: `${PLAN_DETAILS[plan].label} subscription`,
        order_id: orderPayload.order.id,
        handler: async (response) => {
          await verifyMutation.mutateAsync({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            plan,
          });
        },
        prefill: {
          name: profile?.name || '',
          email: profile?.email || '',
        },
        theme: {
          color: '#111827',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (_error) {
      // Errors are surfaced by the mutation hooks.
    }
  };

  if (isLoading && !subscription) {
    return <LoadingSkeleton type="list" rows={4} className="rounded-xl border bg-card p-6" />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Current Subscription
              </CardTitle>
              <CardDescription className="mt-1">
                You are currently on the <strong className="text-foreground">{currentPlanDetails.label}</strong>.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-muted/40 p-4 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Billing Period</p>
              <p className="font-semibold">{latestPayment ? new Date(latestPayment.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="flex-1 bg-muted/40 p-4 rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Employee Capacity</p>
              <p className="font-semibold">{activeMembers.length} active members</p>
            </div>
          </div>
          
          <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50 flex gap-3 text-amber-900 dark:text-amber-500">
            <Zap className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              {currentPlan === 'FREE'
                ? 'Upgrade your subscription to unlock additional billing features and higher limits.'
                : 'Your subscription is active. Future upgrades will be applied after successful payment verification.'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t px-6 py-4 flex flex-col items-start gap-3">
          <Button onClick={() => handleUpgrade('STARTER')} className="gap-2" disabled={!isAdmin || createOrderMutation.isPending || verifyMutation.isPending || currentPlan === 'STARTER'}>
            {createOrderMutation.isPending || verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {currentPlan === 'STARTER' ? 'Current Plan' : 'Upgrade to Starter Plan'}
          </Button>
          <div className="text-xs text-muted-foreground w-full">
            By upgrading, you agree to our <a href="/terms" target="_blank" rel="noreferrer" className="underline hover:text-primary">Terms & Conditions</a> and <a href="/refund-policy" target="_blank" rel="noreferrer" className="underline hover:text-primary">Refund Policy</a>.
          </div>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-muted bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Free Plan</CardTitle>
            <div className="text-3xl font-bold mt-2">{PLAN_DETAILS.FREE.price}</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {PLAN_DETAILS.FREE.features.map((feature) => (
                <li key={feature} className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-primary" /> {feature}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>Current Plan</Button>
          </CardFooter>
        </Card>

        <Card className="border-primary shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Starter Plan
              <Badge>Popular</Badge>
            </CardTitle>
            <div className="text-3xl font-bold mt-2">{PLAN_DETAILS.STARTER.price}</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {PLAN_DETAILS.STARTER.features.map((feature) => (
                <li key={feature} className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-primary" /> {feature}</li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <Button
              onClick={() => handleUpgrade('STARTER')}
              className="w-full"
              disabled={!isAdmin || createOrderMutation.isPending || verifyMutation.isPending || currentPlan === 'STARTER'}
            >
              {currentPlan === 'STARTER' ? 'Current Plan' : 'Upgrade Now'}
            </Button>
            <div className="text-xs text-muted-foreground text-center w-full">
              Review our <a href="/refund-policy" target="_blank" rel="noreferrer" className="underline hover:text-primary">Refund Policy</a> before upgrading.
            </div>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}
