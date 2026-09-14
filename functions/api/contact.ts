interface Env {
  BREVO_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  BREVO_FROM_EMAIL?: string;
  BREVO_FROM_NAME?: string;
  SHEETS_WEBHOOK_URL?: string; // Google Apps Script Web App URL
}

interface ContactEventContext {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<any>) => void;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const onRequestPost = async (context: ContactEventContext) => {
  const { request, env } = context;

  console.log('[API /api/contact] Received new contact request.');

  let email = '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      email = typeof body.email === 'string' ? body.email : '';
    } else {
      const formData = await request.formData().catch(() => new FormData());
      email = formData.get('email')?.toString() || '';
    }
  } catch (err: any) {
    console.error('[API /api/contact] Request body parsing error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request payload.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    console.warn(`[API /api/contact] Invalid email format submitted: "${trimmedEmail}"`);
    return new Response(
      JSON.stringify({ success: false, error: 'Please enter a valid email address.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Environment Variables
  const brevoApiKey = env.BREVO_API_KEY;
  const myEmail = env.CONTACT_TO_EMAIL || 'nav.cs@outlook.com';
  const fromName = env.BREVO_FROM_NAME || 'Naveen Kumar S';
  const fromEmail = env.BREVO_FROM_EMAIL || myEmail;
  const sheetsWebhookUrl = env.SHEETS_WEBHOOK_URL;

  console.log(`[API /api/contact] Target visitor: ${trimmedEmail}`);
  console.log(`[API /api/contact] From Email: ${fromEmail}, Reply-To: ${myEmail}`);
  console.log(`[API /api/contact] Sheets Webhook URL configured: ${sheetsWebhookUrl ? 'YES' : 'NO'}`);

  if (!brevoApiKey) {
    console.error('[Brevo Error] BREVO_API_KEY environment variable is missing.');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Email service configuration error. Please contact site administrator.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Email content sent to visitor
  const emailSubject = "Thanks for connecting! | Naveen's Portfolio";
  const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">
          Hi there! 👋
        </h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Thanks for visiting my portfolio and reaching out! I have received your email and will get back to you personally within 24 hours.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          In the meantime, feel free to explore my latest projects or connect with me online:
        </p>
        <div style="margin: 20px 0; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #b15382;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">
            💻 <strong>GitHub:</strong> <a href="https://github.com/naveendha1710" target="_blank" style="color: #2563eb; text-decoration: underline;">github.com/naveendha1710</a>
          </p>
          <p style="margin: 0; font-size: 14px; color: #334155;">
            💼 <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/nav-cs/" target="_blank" style="color: #2563eb; text-decoration: underline;">linkedin.com/in/nav-cs</a>
          </p>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Feel free to reply directly to this email if you'd like to chat regarding any development or AI/ML opportunities!
        </p>
        <br />
        <p style="font-size: 14px; color: #475569; margin-bottom: 0;">
          Best regards,<br />
          <strong>Naveen Kumar S</strong><br />
          <a href="mailto:${myEmail}" style="color: #2563eb;">${myEmail}</a>
        </p>
      </div>
    `;
  const emailText = `
Hi there!

Thanks for visiting my portfolio and reaching out! I have received your email and will get back to you personally within 24 hours.

In the meantime, feel free to explore my latest projects or connect with me online:
- GitHub: https://github.com/naveendha1710
- LinkedIn: https://www.linkedin.com/in/nav-cs/

Best regards,
Naveen Kumar S
${myEmail}
    `;

  // 1. Send Thank You Email to the visitor with replyTo set to your email
  const visitorEmailPayload = {
    sender: { name: fromName, email: fromEmail },
    replyTo: { name: fromName, email: myEmail },
    to: [{ email: trimmedEmail }],
    subject: emailSubject,
    htmlContent: emailHtml,
    textContent: emailText,
  };

  // 2. Lead notification to yourself
  const leadNotificationPayload = {
    sender: { name: fromName, email: fromEmail },
    replyTo: { name: fromName, email: trimmedEmail },
    to: [{ email: myEmail }],
    subject: `🚀 New Lead Captured: ${trimmedEmail}`,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 16px;">
        <h3>New Visitor Lead Captured on Portfolio!</h3>
        <p>Email: <strong>${trimmedEmail}</strong></p>
        <p>A thank-you email has been automatically dispatched to them.</p>
      </div>
    `,
  };

  let brevoSuccess = false;

  try {
    console.log('[Brevo] Dispatching email to visitor...');
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(visitorEmailPayload),
    });

    const brevoStatus = brevoResponse.status;
    const brevoResponseBody = await brevoResponse.text().catch(() => '');

    if (!brevoResponse.ok) {
      console.error(`[Brevo API Error] Status ${brevoStatus}:`, brevoResponseBody);

      // Log failed attempt to Google Sheets before returning error
      if (sheetsWebhookUrl) {
        await logToSheets(sheetsWebhookUrl, trimmedEmail, false, emailSubject, `mailto:${trimmedEmail}`);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Email delivery failed (${brevoStatus}). Please check entered email.`,
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('[Brevo Success] Email accepted by Brevo API:', brevoResponseBody);
    brevoSuccess = true;

    // Fire lead notification to yourself in background
    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(leadNotificationPayload),
    }).catch((e) => console.warn('[Brevo Notification Error]', e));

    // Await Google Sheets logging to prevent Cloudflare Worker runtime cancellation
    if (sheetsWebhookUrl) {
      await logToSheets(sheetsWebhookUrl, trimmedEmail, true, emailSubject, `mailto:${trimmedEmail}`);
    } else {
      console.warn('[Sheets Log Warning] SHEETS_WEBHOOK_URL is not defined in Cloudflare environment variables.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Check your inbox.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error('[Cloudflare Function Exception]', err?.message || err);

    // Log failed attempt to Google Sheets
    if (sheetsWebhookUrl) {
      await logToSheets(sheetsWebhookUrl, trimmedEmail, false, emailSubject, `mailto:${trimmedEmail}`);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Network error. Failed to reach email service.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

/**
 * Sends a GET request with URL query parameters to the Google Apps Script webhook.
 * Awaited explicitly to ensure Cloudflare Workers runtime does not terminate early.
 */
async function logToSheets(
  webhookUrl: string,
  email: string,
  sent: boolean,
  content: string,
  mailLink: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const params = new URLSearchParams({
    timestamp,
    email,
    mailSent: sent ? 'Yes' : 'No',
    mailContent: content,
    mailLink,
  });

  const cleanWebhookUrl = webhookUrl.trim();
  const targetUrl = cleanWebhookUrl.includes('?')
    ? `${cleanWebhookUrl}&${params.toString()}`
    : `${cleanWebhookUrl}?${params.toString()}`;

  console.log(`[Sheets Logging] Sending GET request to Apps Script Webhook...`);
  console.log(`[Sheets Logging] Target: ${cleanWebhookUrl.substring(0, 45)}...`);
  console.log(`[Sheets Logging] Data: email="${email}", sent=${sent}`);

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const status = res.status;
    const bodyText = await res.text().catch(() => '');

    console.log(`[Sheets Logging Response] Status: ${status}`);
    console.log(`[Sheets Logging Response] Body: ${bodyText.substring(0, 200)}`);

    if (status >= 200 && status < 300) {
      console.log('[Sheets Logging Success] Successfully logged lead to Google Sheets!');
    } else {
      console.error(`[Sheets Logging Failed] HTTP Status ${status}: ${bodyText}`);
    }
  } catch (err: any) {
    console.error('[Sheets Logging Exception] Failed to send request to Google Apps Script:', err?.message || err);
  }
}
