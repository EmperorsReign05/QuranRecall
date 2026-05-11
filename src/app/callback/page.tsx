'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing code or state in URL parameters.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to exchange code');
        }

        router.push('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Authentication Failed</h1>
        <p className="text-zinc-400 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
      <p className="text-zinc-400">Completing sign in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-zinc-400">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
