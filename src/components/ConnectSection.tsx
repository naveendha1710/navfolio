import React, { useState, Suspense } from 'react';
import CurvedInput from './ui/curved-input';

export interface ConnectSectionProps {
  apiEndpoint?: string;
  className?: string;
}

export const ConnectSection: React.FC<ConnectSectionProps> = ({
  apiEndpoint = '/api/contact',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (userEmail: string) => {
    if (!userEmail || !userEmail.trim()) return;

    const trimmed = userEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        error?: string;
        status?: string;
      } | null;

      if (response.ok && (data?.success || data?.status === 'success')) {
        setStatus('success');
        setMessage(data?.message || 'Resume sent successfully! Check your inbox.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(
          data?.error || data?.message || 'Failed to send resume. Please try again.'
        );
      }
    } catch (err) {
      console.error('[ConnectSection Error]', err);
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className={`relative w-full flex flex-col items-center justify-center ${className}`}>
      <div className="w-full max-w-lg">
        <Suspense fallback={null}>
          <CurvedInput
            theme="light"
            placeholder="Enter your email to connect..."
            buttonText={status === 'loading' ? 'Sending...' : 'Get Started'}
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (status !== 'idle' && status !== 'loading') {
                setStatus('idle');
                setMessage('');
              }
            }}
            onSubmit={(val) => handleSubmit(val)}
            backgroundColor="#ffffff"
            textColor="#1e293b"
            placeholderColor="#94a3b8"
            borderColor="#cbd5e1"
            buttonColor="#334155"
            buttonTextColor="#ffffff"
            iconColor="#334155"
            shadowSize="md"
            shadowColor="#64748b"
            bend={24}
            height={60}
            width="100%"
          />
        </Suspense>
      </div>

      {/* Feedback Messages */}
      {status === 'success' && (
        <div className="mt-4 text-center text-sm font-medium text-emerald-600 transition-opacity duration-300">
          {message || 'Resume sent successfully! Check your inbox.'}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 text-center text-sm font-medium text-red-500 transition-opacity duration-300">
          {message || 'Something went wrong. Please try again.'}
        </div>
      )}
    </div>
  );
};

export default ConnectSection;
