import { Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ContactTopic } from '../data/content';
import { useI18n } from '../hooks/useI18n';

type Field = 'name' | 'email' | 'message';
type Status = 'idle' | 'sending' | 'success' | 'error' | 'rateLimited' | 'unavailable';

interface Values {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  website: string;
}

const EMPTY: Values = { name: '', email: '', topic: 'clt', message: '', website: '' };
const TOPICS: readonly ContactTopic[] = ['clt', 'pj', 'consultoria', 'outro'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mesmas regras do servidor (api/contact.ts) — o servidor valida de novo de qualquer forma. */
function validate(values: Values): Field[] {
  const invalid: Field[] = [];
  const name = values.name.trim();
  if (name.length < 2 || name.length > 80) invalid.push('name');
  if (values.email.trim().length > 120 || !EMAIL_PATTERN.test(values.email.trim())) invalid.push('email');
  const message = values.message.trim();
  if (message.length < 10 || message.length > 2000) invalid.push('message');
  return invalid;
}

const inputClass =
  'focus-ring w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-fg-subtle aria-[invalid=true]:border-red-400';

/**
 * Formulário de contato. Envia para POST /api/contact (função da Vercel, que guarda a
 * chave do serviço de e-mail). Sem JavaScript, o próprio <form> posta para a mesma rota.
 */
export function ContactForm() {
  const { t, locale } = useI18n();
  const f = t.contact.form;
  const [values, setValues] = useState<Values>(EMPTY);
  const [invalid, setInvalid] = useState<Field[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const update = (field: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== 'topic' && field !== 'website') setInvalid((current) => current.filter((item) => item !== field));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    const errors = validate(values);
    setInvalid(errors);
    if (errors.length > 0) {
      formRef.current?.querySelector<HTMLElement>(`[name="${errors[0]}"]`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale, elapsedMs: Date.now() - startedAt.current }),
      });
      if (response.ok) {
        setValues(EMPTY);
        setStatus('success');
      } else if (response.status === 429) {
        setStatus('rateLimited');
      } else if (response.status === 503) {
        setStatus('unavailable');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const errorId = (field: Field) => `contact-${field}-error`;
  const fieldProps = (field: Field) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    required: true,
    'aria-invalid': invalid.includes(field),
    'aria-describedby': invalid.includes(field) ? errorId(field) : undefined,
    className: inputClass,
  });
  const fieldError = (field: Field) =>
    invalid.includes(field) ? (
      <p id={errorId(field)} className="mt-2 text-sm text-red-400">
        {f.errors[field]}
      </p>
    ) : null;

  const statusMessage: Partial<Record<Status, string>> = {
    success: f.success,
    error: f.error,
    rateLimited: f.rateLimited,
    unavailable: f.unavailable,
  };

  return (
    <form
      ref={formRef}
      action="/api/contact"
      method="post"
      noValidate
      onSubmit={(event) => void onSubmit(event)}
      aria-labelledby="contact-form-title"
      className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-md md:p-8"
    >
      <h3 id="contact-form-title" className="mb-6 font-display text-2xl font-bold uppercase tracking-tight">
        {f.title}
      </h3>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">
            {f.name}
          </label>
          <input {...fieldProps('name')} type="text" autoComplete="name" maxLength={80} onChange={(e) => update('name')(e.target.value)} />
          {fieldError('name')}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">
            {f.email}
          </label>
          <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={120} onChange={(e) => update('email')(e.target.value)} />
          {fieldError('email')}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold">
          {f.topic}
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={values.topic}
          onChange={(e) => update('topic')(e.target.value)}
          className={inputClass}
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic} className="bg-surface">
              {f.topics[topic]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">
          {f.message}
        </label>
        <textarea
          {...fieldProps('message')}
          rows={5}
          maxLength={2000}
          placeholder={f.messagePlaceholder}
          onChange={(e) => update('message')(e.target.value)}
        />
        {fieldError('message')}
      </div>

      {/* Armadilha para bots: invisível para pessoas (e leitores de tela), preenchida por robôs. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">{f.honeypot}</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update('website')(e.target.value)}
        />
      </div>
      <input type="hidden" name="locale" value={locale} />

      <div className="mt-6 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-fg-subtle">{f.privacy}</p>
        <button
          type="submit"
          aria-disabled={status === 'sending'}
          className="interactive focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-transparent hover:text-white aria-disabled:opacity-60"
        >
          {status === 'sending' ? f.sending : f.submit}
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'} ${statusMessage[status] ? 'mt-5' : ''}`}
      >
        {statusMessage[status] ?? ''}
      </p>
    </form>
  );
}
