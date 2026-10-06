interface Env {
  SHEETS_WEBHOOK_URL?: string; // Google Apps Script Web App URL for logging leads
  CONTACT_TO_EMAIL?: string;
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

  const sheetsWebhookUrl = env.SHEETS_WEBHOOK_URL;
  console.log(`[API /api/contact] Target visitor: ${trimmedEmail}`);
  console.log(`[API /api/contact] Sheets Webhook configured: ${sheetsWebhookUrl ? 'YES' : 'NO'}`);

  if (sheetsWebhookUrl) {
    try {
      await logToSheets(sheetsWebhookUrl, trimmedEmail, true, 'Portfolio Lead Submission', `mailto:${trimmedEmail}`);
    } catch (sheetErr: any) {
      console.warn('[Sheets Log Warning]', sheetErr?.message || sheetErr);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Thank you! Your message has been received.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
};

/**
 * Sends a GET request with URL query parameters to the Google Apps Script webhook.
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

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const status = res.status;
    const bodyText = await res.text().catch(() => '');

    if (status >= 200 && status < 300) {
      console.log('[Sheets Logging Success] Successfully logged lead to Google Sheets');
    } else {
      console.error(`[Sheets Logging Failed] HTTP Status ${status}: ${bodyText}`);
    }
  } catch (err: any) {
    console.error('[Sheets Logging Exception] Failed to send request to Google Apps Script:', err?.message || err);
  }
}
