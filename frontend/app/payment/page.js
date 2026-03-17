'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// ── Checkout Form ─────────────────────────────────────────────
function CheckoutForm({ amount, clientSecret,courseId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!stripe || !elements) return;

  setProcessing(true);
  const toastId = toast.loading('Processing payment...');

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    redirect: 'if_required',
    confirmParams: {
      return_url: `${window.location.origin}/dashboard`
    }
  });

  if (error) {
    toast.error('❌ ' + error.message, { id: toastId });
    setProcessing(false);
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
    // Payment success — directly enroll karo
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (err) {
      console.error('Enrollment error:', err);
    }

    toast.success('🎉 Payment successful! Enrolled!', { id: toastId });
    setTimeout(() => router.push('/dashboard'), 2000);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Stripe Payment Element — Automatic Stripe UI */}
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card'],
          wallets: {
      applePay: 'never',
      googlePay: 'never'
    }
        }}
      />

      {/* Test Card Info */}
      {ready && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="font-semibold text-blue-700 text-sm mb-2">
            🧪 Test Card:
          </p>
          <p className="text-blue-600 text-sm font-mono">4242 4242 4242 4242</p>
          <p className="text-blue-600 text-sm">Expiry: 12/26 — CVC: 123</p>
        </div>
      )}

      {ready && (
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {processing ? 'Processing...' : `Pay ₹${amount} 🔒`}
        </button>
      )}

      <p className="text-center text-gray-400 text-xs">
        🔒 Secured by Stripe
      </p>
    </form>
  );
}

// ── Payment Content ───────────────────────────────────────────
function PaymentContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const courseId = searchParams.get('courseId');
  const amount = searchParams.get('amount');
  const courseTitle = searchParams.get('title');

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!courseId || !amount) {
      router.push('/courses');
      return;
    }
    createPaymentIntent();
  }, [user, authLoading]);

  const createPaymentIntent = async () => {
    try {
      const response = await paymentAPI.create({
        courseId,
        amount: Number(amount)
      });
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      toast.error(err.message);
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading payment...</p>
      </div>
    </div>
  );

  if (!clientSecret) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-500">Preparing payment form...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Complete your purchase
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* Order Summary */}
          <div className="flex justify-between items-center pb-6 mb-6 border-b">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Course
              </p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {courseTitle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">
                ₹{amount}
              </p>
            </div>
          </div>

          {/* Stripe Payment Element */}
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#2563eb',
                  colorBackground: '#ffffff',
                  colorText: '#111827',
                  colorDanger: '#ef4444',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  borderRadius: '8px',
                }
              }
            }}>
            <CheckoutForm
              amount={amount}
              clientSecret={clientSecret}
              courseId={courseId}
            />
          </Elements>

        </div>

        {/* Back button */}
        <p className="text-center mt-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 text-sm hover:text-gray-600">
            ← Back to course
          </button>
        </p>

      </div>
    </div>
  );
}

// ── Page Export ───────────────────────────────────────────────
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
