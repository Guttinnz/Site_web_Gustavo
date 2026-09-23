/**
 * POST /api/contact — recebe o formulário de contato e envia por e-mail (Resend).
 *
 * Variáveis de ambiente (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY      obrigatória para enviar (fica só no servidor, nunca no bundle)
 *   CONTACT_TO_EMAIL    destino (padrão: gustavoriedel2202@gmail.com)
 *   CONTACT_FROM_EMAIL  remetente (padrão: onboarding@resend.dev, que dispensa domínio próprio)
 *
 * Proteções: tamanho máximo do corpo, validação dos campos, limite por IP, campo
 * "armadilha" (honeypot, descartado em silêncio) e tempo mínimo desde a abertura da
 * página (recusado com erro visível, para não perder a mensagem de uma pessoa rápida). Tudo num arquivo só, sem
 * imports relativos — a Vercel empacota cada função isoladamente.
 */

export interface ContactConfig {
  apiKey?: string;
  to: string;
  from: string;
  /** Sem chave em desenvolvimento: registra a mensagem no terminal em vez de enviar. */
  dryRun: boolean;
}

const MAX_BODY_BYTES = 8 * 1024;
const MIN_FILL_MS = 3000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const TOPIC_LABELS: Record<string, string> = {
  clt: 'Vaga CLT',
  pj: 'Projeto PJ / freela',
  consultoria: 'Consultoria',
  outro: 'Outro assunto',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Limite por IP em memória: vale por instância da função (best-effort, sem banco). */
const hitsByIp = new Map<string, number[]>();

function isRateLimited(ip: string, now: number): number {
  const recent = (hitsByIp.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hitsByIp.set(ip, recent);
    const oldest = recent[0] ?? now;
    return Math.ceil((RATE_WINDOW_MS - (now - oldest)) / 1000);
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return 0;
}

type Fields = Record<string, string>;

function parseBody(raw: string, contentType: string): Fields | null {
  if (contentType.includes('application/json')) {
    try {
      const data: unknown = JSON.parse(raw);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
      const fields: Fields = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' || typeof value === 'number') fields[key] = String(value);
      }
      return fields;
    } catch {
      return null;
    }
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return null;
}

function validate(fields: Fields) {
  const clean = (value: string | undefined) => (value ?? '').replace(/[\r\n]+/g, ' ').trim();
  const name = clean(fields.name);
  const email = clean(fields.email);
  const topic = TOPIC_LABELS[clean(fields.topic)] ? clean(fields.topic) : 'outro';
  const message = (fields.message ?? '').trim();

  const invalid: string[] = [];
  if (name.length < 2 || name.length > 80) invalid.push('name');
  if (email.length > 120 || !EMAIL_PATTERN.test(email)) invalid.push('email');
  if (message.length < 10 || message.length > 2000) invalid.push('message');

  return { name, email, topic, message, locale: clean(fields.locale) === 'en' ? 'en' : 'pt', invalid };
}

/** Resposta JSON (fetch do site) ou uma página HTML simples (formulário enviado sem JavaScript). */
function reply(asHtml: boolean, status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  if (!asHtml) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
    });
  }
  const ok = body.ok === true;
  const text = ok
    ? 'Mensagem enviada! Vou responder no e-mail que você informou.'
    : 'Não consegui enviar a mensagem. Volte e confira os campos, ou fale comigo por e-mail ou WhatsApp.';
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contato — Gustavo Bueno</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;padding:24px"><main style="max-width:32rem;text-align:center"><p style="font-size:1.25rem;line-height:1.5">${text}</p><p><a href="/#contact" style="color:#22d3ee">Voltar ao site</a></p></main></body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export async function handleContact(request: Request, config: ContactConfig): Promise<Response> {
  const contentType = request.headers.get('content-type') ?? '';
  const asHtml = contentType.includes('application/x-www-form-urlencoded');

  if (request.method !== 'POST') {
    return reply(false, 405, { error: 'method_not_allowed' }, { Allow: 'POST' });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return reply(asHtml, 413, { error: 'too_large' });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return reply(asHtml, 413, { error: 'too_large' });

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const retryAfter = isRateLimited(ip, Date.now());
  if (retryAfter > 0) {
    return reply(asHtml, 429, { error: 'rate_limited' }, { 'Retry-After': String(retryAfter) });
  }

  const fields = parseBody(raw, contentType);
  if (!fields) return reply(asHtml, 415, { error: 'unsupported_body' });

  // Bot que preencheu o campo invisível: finge sucesso e descarta (pessoas não veem o campo).
  if ((fields.website ?? '').trim() !== '') {
    return reply(asHtml, 200, { ok: true });
  }
  // Enviado rápido demais depois de abrir a página: recusa de forma visível, para que uma
  // pessoa muito rápida (autopreenchimento + colar) só precise clicar de novo.
  const elapsed = fields.elapsedMs === undefined ? Number.POSITIVE_INFINITY : Number(fields.elapsedMs);
  if (elapsed < MIN_FILL_MS) {
    return reply(asHtml, 400, { error: 'too_fast' });
  }

  const data = validate(fields);
  if (data.invalid.length > 0) return reply(asHtml, 400, { error: 'invalid', fields: data.invalid });

  const topicLabel = TOPIC_LABELS[data.topic] ?? 'Outro assunto';
  const subject = `[Portfólio] ${topicLabel} — ${data.name}`;
  const text = [
    'Nova mensagem pelo formulário do portfólio',
    '',
    `Nome: ${data.name}`,
    `E-mail: ${data.email}`,
    `Assunto: ${topicLabel}`,
    `Idioma do site: ${data.locale === 'en' ? 'inglês' : 'português'}`,
    '',
    'Mensagem:',
    data.message,
  ].join('\n');

  if (!config.apiKey) {
    if (config.dryRun) {
      console.info(`\n[contato — simulação, sem RESEND_API_KEY]\nPara: ${config.to}\nAssunto: ${subject}\n\n${text}\n`);
      return reply(asHtml, 200, { ok: true, dryRun: true });
    }
    return reply(asHtml, 503, { error: 'unavailable' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: config.from, to: [config.to], reply_to: data.email, subject, text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`[contato] Resend respondeu ${response.status}: ${await response.text()}`);
      return reply(asHtml, 502, { error: 'send_failed' });
    }
  } catch (error) {
    console.error('[contato] falha ao chamar o Resend:', error);
    return reply(asHtml, 502, { error: 'send_failed' });
  }

  return reply(asHtml, 200, { ok: true });
}

/** Função da Vercel (Node.js, Web API padrão). */
export function POST(request: Request): Promise<Response> {
  return handleContact(request, {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_TO_EMAIL || 'gustavoriedel2202@gmail.com',
    from: process.env.CONTACT_FROM_EMAIL || 'Portfólio Gustavo Bueno <onboarding@resend.dev>',
    dryRun: false,
  });
}
