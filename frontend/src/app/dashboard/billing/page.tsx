'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Check, Crown, Zap } from 'lucide-react';

export default function BillingPage() {
  const { user, fetchMe } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    setLoading(plan);
    try {
      const { data } = await api.post('/api/payments/create-order', { plan });

      // Mock payment flow (in production, use Razorpay SDK)
      const confirmed = confirm(`Mock Payment: ₹${data.amount / 100} for ${plan}. Confirm payment?`);
      if (!confirmed) { setLoading(null); return; }

      await api.post('/api/payments/verify', {
        razorpay_order_id: data.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        plan,
      });

      toast({ title: '🎉 Premium Activated!', description: 'Welcome to InternTrack Pro Premium!' });
      await fetchMe();
    } catch (err: unknown) {
      toast({ title: 'Payment failed', description: (err as { response?: { data?: { error?: string } } })?.response?.data?.error, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your premium subscription?')) return;
    await api.post('/api/payments/cancel');
    toast({ title: 'Subscription cancelled' });
    await fetchMe();
  };

  const isPremium = user?.plan === 'premium';

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your plan and payment history</p>
        </div>

        {/* Current plan */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  {isPremium ? <Crown className="w-5 h-5 text-yellow-600" /> : <Zap className="w-5 h-5 text-gray-500" />}
                </div>
                <div>
                  <p className="font-semibold capitalize">{user?.plan} Plan</p>
                  <p className="text-sm text-gray-500">
                    {isPremium ? `Active until ${user?.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString() : 'N/A'}` : 'Free forever'}
                  </p>
                </div>
              </div>
              {isPremium && (
                <Button variant="outline" onClick={handleCancel} className="text-red-500 border-red-200 hover:bg-red-50">Cancel Plan</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!isPremium && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { id: 'premium_monthly', label: 'Monthly', price: '₹199', period: '/month', savings: null },
              { id: 'premium_yearly', label: 'Yearly', price: '₹1,999', period: '/year', savings: 'Save ₹389' },
            ].map((plan) => (
              <Card key={plan.id} className={plan.id === 'premium_yearly' ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.label}</CardTitle>
                    {plan.savings && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">{plan.savings}</span>}
                  </div>
                  <p className="text-3xl font-bold">{plan.price}<span className="text-base font-normal text-gray-500">{plan.period}</span></p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {['Unlimited applications', 'Advanced analytics', 'Unlimited resumes', 'Priority notifications', 'Export to CSV', 'Premium support'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={() => handleUpgrade(plan.id)} disabled={loading === plan.id}>
                    {loading === plan.id ? 'Processing...' : `Upgrade to ${plan.label}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isPremium && (
          <Card>
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="font-semibold text-lg">You&apos;re on Premium!</p>
              <p className="text-gray-500 text-sm mt-1">Enjoy unlimited access to all InternTrack Pro features.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </DashboardLayout>
  );
}
