/**
 * Procura chaves, tokens e segredos no que vai para o navegador (dist/**\/*.js e *.html).
 * Duas frentes: formatos conhecidos de chaves e os valores reais das variáveis de
 * ambiente sensíveis presentes nesta máquina (RESEND_API_KEY, VERCEL_TOKEN…).
 */
import fs from 'node:fs';
import path from 'node:path';

export interface BundleFinding {
  file: string;
  rule: string;
}

const RULES: readonly { rule: string; pattern: RegExp }[] = [
  { rule: 'chave do Resend', pattern: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{12,}/ },
  { rule: 'chave de API do Google (Gemini, Maps…)', pattern: /AIza[0-9A-Za-z_-]{35}/ },
  { rule: 'chave da OpenAI', pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/ },
  { rule: 'token do GitHub', pattern: /\bgh[pousr]_[A-Za-z0-9]{36}\b/ },
  { rule: 'chave privada', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { rule: 'nome de variável secreta', pattern: /\b(?:RESEND_API_KEY|VERCEL_TOKEN|[A-Z_]+_SECRET)\b/ },
];

const SENSITIVE_ENV = /(KEY|TOKEN|SECRET|PASSWORD)$/;

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return /\.(js|html)$/.test(entry.name) ? [full] : [];
  });
}

/** Valores de variáveis sensíveis do ambiente atual e do .env local, se existir. */
function sensitiveValues(root: string): string[] {
  const values = Object.entries(process.env)
    .filter(([name, value]) => SENSITIVE_ENV.test(name) && value && value.length >= 12)
    .map(([, value]) => value as string);
  for (const file of ['.env', '.env.local', '.env.production.local']) {
    const envPath = path.join(root, file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"#\s]+)"?/.exec(line);
      if (match?.[1] && match[2] && SENSITIVE_ENV.test(match[1]) && match[2].length >= 12) values.push(match[2]);
    }
  }
  return values;
}

export function scanBundle(root: string): BundleFinding[] {
  const dist = path.join(root, 'dist');
  const files = listFiles(dist);
  if (files.length === 0) throw new Error('dist/ vazio: rode "npm run build" antes dos testes');

  const secrets = sensitiveValues(root);
  const findings: BundleFinding[] = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file).replaceAll('\\', '/');
    for (const { rule, pattern } of RULES) {
      if (pattern.test(source)) findings.push({ file: relative, rule });
    }
    if (secrets.some((secret) => source.includes(secret))) {
      findings.push({ file: relative, rule: 'valor de variável de ambiente sensível' });
    }
  }
  return findings;
}
