interface Env {
  BREVO_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  BREVO_FROM_EMAIL?: string;
  BREVO_FROM_NAME?: string;
}

interface ContactEventContext {
  request: Request;
  env: Env;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const onRequestPost = async (context: ContactEventContext) => {
  const { request, env } = context;

  // Verify Content-Type & Payload
  let name = '';
  let email = '';
  let message = '';
  let honeypot = '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      name = typeof body.name === 'string' ? body.name : '';
      email = typeof body.email === 'string' ? body.email : '';
      message = typeof body.message === 'string' ? body.message : '';
      honeypot = typeof body._gotcha === 'string' ? body._gotcha : '';
    } else {
      const formData = await request.formData().catch(() => new FormData());
      name = formData.get('name')?.toString() || '';
      email = formData.get('email')?.toString() || '';
      message = formData.get('message')?.toString() || '';
      honeypot = formData.get('_gotcha')?.toString() || '';
    }
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request format.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Anti-spam Honeypot Check
  if (honeypot.trim().length > 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'Message processed.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Server-Side Input Validation
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName) {
    return new Response(
      JSON.stringify({ success: false, error: 'Name is required.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return new Response(
      JSON.stringify({ success: false, error: 'A valid email address is required.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  if (!trimmedMessage) {
    return new Response(
      JSON.stringify({ success: false, error: 'Message is required.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  if (trimmedName.length > 200 || trimmedEmail.length > 320 || trimmedMessage.length > 5000) {
    return new Response(
      JSON.stringify({ success: false, error: 'Input exceeds maximum allowed length.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Verify Environment Variables (Secrets)
  const brevoApiKey = env.BREVO_API_KEY;
  const toEmail = env.CONTACT_TO_EMAIL;
  const fromEmail = env.BREVO_FROM_EMAIL || toEmail;
  const fromName = env.BREVO_FROM_NAME || 'Portfolio Contact Form';

  if (!brevoApiKey || !toEmail || !fromEmail) {
    console.error('[Cloudflare Function Error] Missing Brevo environment variables (BREVO_API_KEY, CONTACT_TO_EMAIL, BREVO_FROM_EMAIL)');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Contact service is not properly configured on the server.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Construct Brevo API Request Payload
  const brevoPayload = {
    sender: {
      name: fromName,
      email: fromEmail,
    },
    to: [
      {
        email: toEmail,
        name: 'Portfolio Owner',
      },
    ],
    replyTo: {
      email: trimmedEmail,
      name: trimmedName,
    },
    subject: `New Portfolio Contact — ${trimmedName}`,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
          New Message from Portfolio Contact Form
        </h2>
        
        <div style="margin: 20px 0; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #b15382;">
          <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Sender Name:</strong> ${escapeHtml(trimmedName)}</p>
          <p style="margin: 0; font-size: 15px;"><strong>Sender Email:</strong> <a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(trimmedEmail)}</a></p>
        </div>

        <div style="margin-top: 24px;">
          <h3 style="font-size: 15px; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Message:</h3>
          <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #334155; background-color: #ffffff; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px;">${escapeHtml(trimmedMessage)}</div>
        </div>

        <hr style="margin-top: 32px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">
          Sent via your Portfolio Contact Form. Click <strong>Reply</strong> in your email client to respond directly to ${escapeHtml(trimmedName)} (${escapeHtml(trimmedEmail)}).
        </p>
      </div>
    `,
    textContent: `
New Message from Portfolio Contact Form

Sender Name: ${trimmedName}
Sender Email: ${trimmedEmail}

Message:
${trimmedMessage}

---
Sent via your Portfolio Contact Form. Reply directly to ${trimmedEmail}.
    `,
  };

  // Dispatch Transactional Email via Brevo REST API
  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text().catch(() => '');
      console.error('[Cloudflare Function Error] Brevo API status:', brevoResponse.status, errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send message via Brevo mail service. Please try again later.',
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error('[Cloudflare Function Exception]', err?.message || err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected network error occurred. Please try again later.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
