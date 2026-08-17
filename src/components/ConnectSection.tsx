import React, { useState } from 'react';

export interface ConnectSectionProps {
  apiEndpoint?: string;
  className?: string;
}

export const ConnectSection: React.FC<ConnectSectionProps> = ({
  apiEndpoint = '/api/contact',
  className = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    _gotcha: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status !== 'idle' && status !== 'loading') {
      setStatus('idle');
      setFeedback('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'loading') return;

    // Client-side quick check
    if (!formData.name.trim()) {
      setStatus('error');
      setFeedback('Please enter your name.');
      return;
    }

    if (!formData.email.trim()) {
      setStatus('error');
      setFeedback('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim()) {
      setStatus('error');
      setFeedback('Please write a message.');
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          _gotcha: formData._gotcha,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        error?: string;
      } | null;

      if (response.ok && data?.success) {
        setStatus('success');
        setFeedback(data.message || 'Thank you! Your message has been sent.');
        setFormData({
          name: '',
          email: '',
          message: '',
          _gotcha: '',
        });
      } else {
        setStatus('error');
        setFeedback(
          data?.error || 'Failed to send message. Please check your details and try again.'
        );
      }
    } catch (err) {
      console.error('[ConnectSection Error]', err);
      setStatus('error');
      setFeedback('Unable to connect to the email service. Please try again later.');
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-200/80 font-sans">
        <div className="mb-6 text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Send a Message
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Interested in collaboration or have a question? Drop me a message below!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          {/* Honeypot field for anti-spam */}
          <input
            type="text"
            name="_gotcha"
            value={formData._gotcha}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              disabled={status === 'loading'}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#b15382]/50 focus:border-[#b15382] transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              disabled={status === 'loading'}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#b15382]/50 focus:border-[#b15382] transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Hi Naveen, I'd like to discuss..."
              disabled={status === 'loading'}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#b15382]/50 focus:border-[#b15382] transition-all resize-none disabled:opacity-60"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 px-6 rounded-xl bg-[#334155] hover:bg-[#1e293b] text-white font-medium text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === 'loading' ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending Message...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Alerts */}
        {status === 'success' && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium text-center">
            {feedback || 'Thank you! Your message has been sent.'}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
            {feedback || 'Something went wrong. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectSection;
