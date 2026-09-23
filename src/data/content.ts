/**
 * Todo o conteúdo do site, em PT e EN.
 *
 * - `site`: dados que não mudam com o idioma (contatos, imagens, stack, certificações).
 * - `content.pt` / `content.en`: textos traduzidos. O tipo `Content` obriga os dois
 *   idiomas a terem exatamente as mesmas chaves — se faltar algo em EN, o build quebra.
 *
 * Textos de títulos, botões e labels ficam em caixa normal: a caixa alta é aplicada
 * via CSS (`uppercase`), o que é melhor para leitores de tela.
 */

export type Locale = 'pt' | 'en';
export type SectionId = 'work' | 'career' | 'about' | 'services' | 'contact';
export type CaseSlug = 'qa' | 'icatu' | 'ivy' | 'going2' | 'tcc' | 'n8n';
export type ServiceIcon =
  | 'e2e'
  | 'workflows'
  | 'pipelines'
  | 'mobile'
  | 'api'
  | 'performance'
  | 'design'
  | 'strategy';
export type FaqId = 'who' | 'tools' | 'work-model' | 'results' | 'english' | 'site-qa' | 'contact';
export type MarqueeStyle = 'outline' | 'accent' | 'solid';

export interface ImageAsset {
  /** Nome do arquivo em public/images, sem extensão. */
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

export interface Metric {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

export interface CaseText {
  readonly period: string;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly result?: string;
  readonly tags: readonly string[];
  readonly imageAlt: string;
  /** Empresas/projetos atendidos dentro do case (ex.: clientes da Going2). */
  readonly clients?: readonly string[];
  /** Texto do link do case — o endereço fica em `site.cases[].url`. */
  readonly linkLabel?: string;
}

/** Certificação ou curso. Com `url`, a pill vira link de verificação. */
export interface Credential {
  readonly label: string;
  readonly url?: string;
}

export interface CareerItem {
  readonly period: string;
  readonly role: string;
  readonly company: string;
  /** Ex.: "Alocado na Icatu Seguros" (consultorias). */
  readonly context?: string;
  readonly summary: string;
}

export interface ServiceText {
  readonly icon: ServiceIcon;
  readonly title: string;
  readonly description: string;
}

export interface FaqItem {
  readonly id: FaqId;
  readonly question: string;
  readonly answer: string;
}

export interface MarqueeWord {
  readonly text: string;
  readonly style: MarqueeStyle;
}

export interface Recommendation {
  readonly name: string;
  readonly role: string;
  readonly date: string;
  /** Parágrafos da recomendação (texto original do LinkedIn, ou tradução em EN). */
  readonly quote: readonly string[];
  /** true quando o texto é um trecho — o site mostra "[…]" e o link para o LinkedIn. */
  readonly excerpt?: boolean;
  /** Destaque: aparece na primeira linha, em 2 colunas e com texto maior. */
  readonly featured?: boolean;
}

export type ContactTopic = 'clt' | 'pj' | 'consultoria' | 'outro';

export interface Content {
  readonly meta: { readonly title: string; readonly description: string };
  readonly a11y: {
    readonly skipToContent: string;
    readonly primaryNav: string;
    readonly openMenu: string;
    readonly closeMenu: string;
    readonly menu: string;
    readonly language: string;
    readonly newTab: string;
    readonly home: string;
  };
  readonly nav: readonly { readonly id: SectionId; readonly label: string }[];
  readonly hero: {
    readonly availability: string;
    readonly eyebrow: string;
    readonly titleLines: readonly [string, string];
    /** Subtítulo logo abaixo do título (especialização). */
    readonly specialization: string;
    readonly intro: string;
    readonly cta: string;
    readonly scroll: string;
  };
  readonly impact: {
    readonly label: string;
    readonly metrics: readonly Metric[];
    readonly footnote: string;
  };
  readonly work: {
    readonly label: string;
    readonly resultLabel: string;
    readonly tagsLabel: string;
    readonly clientsLabel: string;
    /** Mostrado no lugar do link enquanto `site.cases[].url` estiver vazio. */
    readonly linkPending: string;
    readonly cases: Readonly<Record<CaseSlug, CaseText>>;
  };
  readonly career: {
    readonly label: string;
    readonly items: readonly CareerItem[];
    /** Rótulo do bloco recolhível com estágio e bolsas. */
    readonly earlyLabel: string;
    readonly early: readonly CareerItem[];
  };
  readonly marquee: readonly MarqueeWord[];
  readonly about: {
    readonly title: string;
    /** O primeiro parágrafo recebe o destaque visual. */
    readonly paragraphs: readonly [string, ...string[]];
    readonly photoAlt: string;
    readonly practices: string;
    readonly practiceItems: readonly string[];
    readonly technologies: string;
    readonly certifications: string;
    readonly courses: string;
    /** Complemento do nome acessível das credenciais com link. */
    readonly verify: string;
    readonly cta: string;
  };
  readonly services: {
    readonly label: string;
    readonly items: readonly ServiceText[];
    readonly cta: string;
  };
  readonly recommendations: {
    readonly label: string;
    readonly intro: string;
    readonly source: string;
    readonly link: string;
    readonly items: readonly Recommendation[];
  };
  readonly contact: {
    readonly title: string;
    readonly whatsapp: string;
    readonly linkedin: string;
    readonly github: string;
    readonly cv: string;
    /** `{year}` é trocado pelo ano do build. */
    readonly copyright: string;
    readonly analyticsNote: string;
    /** Selo "este site é testado". Em `qaBadgeDetail`, {total} e {performance} vêm dos resultados. */
    readonly qaBadge: string;
    readonly qaBadgeDetail: string;
    readonly form: {
      readonly title: string;
      readonly name: string;
      readonly email: string;
      readonly topic: string;
      readonly topics: Readonly<Record<ContactTopic, string>>;
      readonly message: string;
      readonly messagePlaceholder: string;
      readonly honeypot: string;
      readonly submit: string;
      readonly sending: string;
      readonly privacy: string;
      readonly success: string;
      readonly error: string;
      readonly rateLimited: string;
      readonly unavailable: string;
      readonly errors: {
        readonly name: string;
        readonly email: string;
        readonly message: string;
      };
    };
  };
  readonly chat: {
    readonly open: string;
    readonly close: string;
    readonly title: string;
    readonly subtitle: string;
    readonly greeting: string;
    readonly typing: string;
    readonly suggestions: string;
    readonly done: string;
    readonly direct: string;
  };
  readonly faq: readonly FaqItem[];
  readonly notFound: { readonly title: string; readonly text: string; readonly back: string };
  /** Página /qualidade — o dashboard dos testes deste site. */
  readonly quality: {
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly label: string;
    readonly title: string;
    readonly intro: string;
    readonly statusPassed: string;
    readonly statusFailed: string;
    readonly ranOn: string;
    readonly sourceCi: string;
    readonly sourceLocal: string;
    readonly viewRun: string;
    readonly totalLabel: string;
    readonly passedLabel: string;
    readonly suites: Readonly<Record<'web' | 'mobile', string>>;
    readonly categories: Readonly<Record<'bdd' | 'a11y' | 'api' | 'tecnico', string>>;
    readonly a11yTitle: string;
    /** {checks} e {violations} vêm dos resultados. */
    readonly a11yText: string;
    readonly lighthouseTitle: string;
    readonly lighthouseNote: string;
    readonly lighthouseLabels: Readonly<Record<'performance' | 'accessibility' | 'bestPractices' | 'seo', string>>;
    readonly noLighthouse: string;
    readonly pipelineTitle: string;
    readonly pipelineSteps: readonly { readonly title: string; readonly text: string }[];
    readonly gateNote: string;
    readonly exampleTitle: string;
    readonly exampleNote: string;
    readonly toolsTitle: string;
    readonly tools: readonly string[];
    readonly codeLink: string;
    readonly historyLink: string;
    readonly back: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Dados independentes de idioma                                               */
/* -------------------------------------------------------------------------- */

export const site = {
  name: 'Gustavo Bueno',
  email: 'gustavoriedel2202@gmail.com',
  whatsapp: {
    url: 'https://wa.me/5555991398135',
    display: '+55 55 99139-8135',
  },
  linkedin: 'https://www.linkedin.com/in/gustavoarbueno',
  linkedinRecommendations: 'https://www.linkedin.com/in/gustavoarbueno/details/recommendations/',
  github: 'https://github.com/Guttinnz',
  /** Repositório público do site — o código dos testes e o histórico de execuções. */
  repository: {
    url: 'https://github.com/Guttinnz/Site_web_Gustavo',
    tests: 'https://github.com/Guttinnz/Site_web_Gustavo/tree/main/cypress',
    runs: 'https://github.com/Guttinnz/Site_web_Gustavo/actions/workflows/qa.yml',
  },
  cv: '/cv-gustavo-bueno.pdf',
  profileImage: { name: 'profile', width: 800, height: 800 },
  /**
   * Ordem de exibição dos cases + imagem de cada um (public/images/<name>.jpg).
   * `url` opcional: com endereço, o case ganha um link (o texto vem de `linkLabel`).
   */
  cases: [
    // Links que começam com "/" são internos (abrem no próprio site).
    { slug: 'qa', image: { name: 'work-qa', width: 1280, height: 720 }, url: '/qualidade' },
    { slug: 'icatu', image: { name: 'work-icatu', width: 1280, height: 720 } },
    { slug: 'ivy', image: { name: 'work-ivy', width: 1280, height: 720 } },
    { slug: 'going2', image: { name: 'work-going2', width: 1280, height: 720 } },
    {
      slug: 'tcc',
      image: { name: 'work-tcc', width: 1280, height: 720 },
      // TODO: salve o PDF do TCC como public/tcc-gustavo-bueno.pdf e troque por
      // url: '/tcc-gustavo-bueno.pdf'. Vazio = aparece "em breve", sem <a>.
      url: '',
    },
    { slug: 'n8n', image: { name: 'work-n8n', width: 1280, height: 720 } },
  ],
  technologies: [
    'Cypress',
    'Selenium WebDriver',
    'Appium',
    'Maestro',
    'Robot Framework',
    'Orange Testing',
    'BrowserStack',
    'Postman',
    'Insomnia',
    'Grafana k6',
    'JMeter',
    'JUnit',
    'JavaScript',
    'TypeScript',
    'Java',
    'Python',
    'SQL / MySQL',
    'Gherkin · BDD',
    'Docker',
    'Git',
    'Azure DevOps',
    'AWS',
    'GCP',
    'BitBucket',
    'Jira · Scrum',
    'Kanban',
    'n8n',
  ],
  /**
   * Certificações com prova. Para permitir a verificação, preencha `url` com o link da
   * credencial (ex.: badge da CertiProf) — a pill vira link automaticamente.
   */
  certifications: [
    { label: 'CertiProf SFPC™ — Scrum Foundation', url: '' },
    { label: 'CertiProf LGPDF™ — LGPD Foundation', url: '' },
    { label: 'IBSEC — Fundamentos de Cibersegurança', url: '' },
    { label: 'IBSEC — Cybersecurity Awareness', url: '' },
    { label: 'IBSEC — Fundamentos de Redes', url: '' },
    { label: 'IBSEC — Fundamentos de Ciência da Computação', url: '' },
  ],
  /** Cursos concluídos (certificado de conclusão). `url` funciona igual às certificações. */
  courses: [
    { label: 'PTQS — Júlio de Lima (85h)', url: '' },
    { label: 'QAzando — Trilha Mobile (100h)', url: '' },
    { label: 'DIO — Bootcamp TQI Fullstack (125h)', url: '' },
    { label: 'Google Cloud Essentials (40h)', url: '' },
    { label: 'QAcademy — Cypress (20h)', url: '' },
    { label: 'QAcademy — Robot Framework (12h)', url: '' },
    { label: 'Udemy — Performance com k6 (4h)', url: '' },
    { label: 'Cisco — Introdução à Cibersegurança', url: '' },
  ],
} as const satisfies {
  readonly profileImage: ImageAsset;
  readonly cases: readonly { readonly slug: CaseSlug; readonly image: ImageAsset; readonly url?: string }[];
  readonly certifications: readonly Credential[];
  readonly courses: readonly Credential[];
  readonly [key: string]: unknown;
};

/* -------------------------------------------------------------------------- */
/* Português                                                                   */
/* -------------------------------------------------------------------------- */

const pt: Content = {
  meta: {
    title: 'Gustavo Bueno | Engenheiro de Software — Qualidade e Automações',
    description:
      'Engenheiro de Software em Santa Rosa/RS, especializado em Qualidade e Automações: E2E com Cypress, testes de API, performance com k6 e automação de processos com n8n. 6 anos em seguros, marketplace automotivo e SaaS.',
  },
  a11y: {
    skipToContent: 'Pular para o conteúdo',
    primaryNav: 'Navegação principal',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    menu: 'Menu',
    language: 'Idioma',
    newTab: '(abre em nova aba)',
    home: 'Gustavo Bueno — voltar ao início',
  },
  nav: [
    { id: 'work', label: 'Trabalhos' },
    { id: 'career', label: 'Trajetória' },
    { id: 'about', label: 'Sobre' },
    { id: 'services', label: 'Serviços' },
    { id: 'contact', label: 'Contato' },
  ],
  hero: {
    availability: 'Disponível para novos projetos',
    eyebrow: 'Automação · Qualidade · Confiabilidade',
    titleLines: ['Engenheiro', 'de Software'],
    specialization: 'Engenheiro de Qualidade e Automações',
    intro:
      'Seis anos de experiência fazendo o bug aparecer no pipeline — e não na tela do cliente. Construo automação que roda sozinha, falha pelo motivo certo e devolve tempo ao time: num único projeto, foram mais de 5.200 horas de regressão.',
    cta: 'Fale comigo',
    scroll: 'Role para ver',
  },
  impact: {
    label: 'Impacto em números',
    metrics: [
      { value: 33, suffix: '%', label: 'de redução no tempo de homologação' },
      { value: 5200, suffix: 'h', label: 'economizadas em execuções de regressão' },
      { value: 50, suffix: '%', label: 'de redução no cycle time (12 → 6 dias)' },
      { value: 1500, suffix: '+', label: 'validações sistêmicas em fluxos críticos' },
      { value: 92, suffix: '%', label: 'de eficiência na detecção de defeitos (EDD)' },
    ],
    footnote: 'Resultados medidos em projetos de seguros, marketplace automotivo e SaaS',
  },
  work: {
    label: 'Trabalhos selecionados',
    resultLabel: 'Resultado',
    tagsLabel: 'Tecnologias e práticas',
    clientsLabel: 'Projetos atendidos',
    linkPending: 'em breve',
    cases: {
      qa: {
        period: '2026',
        category: 'Automação E2E / BDD / CI',
        title: 'Este portfólio — QA do próprio site',
        description:
          'O site que você está vendo é testado a cada mudança: cenários BDD em Gherkin (PT-BR) para os fluxos de negócio e testes em TypeScript para acessibilidade, API, SEO e responsividade, rodando em web e mobile com Cypress. O Lighthouse CI cobra metas mínimas de performance e acessibilidade, e um portão de qualidade no GitHub Actions só publica na Vercel o que passou em tudo.',
        tags: ['Cypress', 'Gherkin/BDD', 'axe-core', 'Lighthouse CI', 'GitHub Actions'],
        imageAlt: 'Dashboard de qualidade deste site com os resultados dos testes automatizados',
        linkLabel: 'Ver os testes',
      },
      icatu: {
        period: '2025–2026',
        category: 'Automação E2E / Seguros',
        title: 'Icatu Seguros — Previdência',
        description:
          'Pela ED Consultoria, automação Web E2E em Cypress para produtos de Previdência, com arquitetura focada em escalabilidade e custom commands para reaproveitamento. Massas de teste em JSON com lógica condicional guiam o comportamento dos cenários e cobrem fluxos complexos de forma limpa. Scripts JavaScript no Postman encadeiam requisições para rodar o fluxo de Venda Vida inteiro via API, e pipelines de execução com dashboards de métricas deram visibilidade ao time.',
        result: '33% menos tempo de homologação e mais de 5.200 horas economizadas em regressão.',
        tags: ['Cypress', 'Postman', 'TypeScript', 'CI/CD', 'Azure'],
        imageAlt: 'Capa do case Icatu Seguros — Previdência',
      },
      ivy: {
        period: '2023–2025',
        category: 'Qualidade ponta a ponta / Multiprojeto',
        title: 'Grupo IVY — AutoAvaliar e RwTech',
        description:
          'Estruturação da cultura de qualidade em quatro frentes de produto (IVY, B2B, RTF, NOVA): refinamento técnico de estórias, critérios de aceite, testes funcionais Web/Mobile/API e automação em Cypress, Appium e Orange Testing. Partição de equivalência, valor-limite e testes exploratórios com charters, e bugs documentados com logs contextualizados — menos retrabalho e menos defeitos chegando à produção.',
        result:
          'mais de 1.500 validações sistêmicas, cycle time de 12 para 6 dias e 92% de eficiência na detecção de defeitos.',
        tags: ['Cypress', 'Appium', 'Shift-left', 'Scrum'],
        imageAlt: 'Capa do case Grupo IVY — AutoAvaliar e RwTech',
      },
      going2: {
        period: '2022–2023',
        category: 'Estruturação de QA / CI',
        title: 'Going2 — Do zero ao pipeline',
        description:
          'Criação da base de QA do time: planos de teste, padronização de processos, estruturação dos ambientes e scripts Cypress integrados ao pipeline, acelerando regressões em fluxos críticos Web e Mobile com execução em BrowserStack. No refinamento, cenários de erro antecipados com valor-limite e partição evitavam retrabalho no desenvolvimento.',
        tags: ['Cypress', 'BrowserStack', 'CI/CD', 'Plano de testes'],
        imageAlt: 'Capa do case Going2 — Do zero ao pipeline',
        clients: ['Footbao', 'Ministério do Belém (ERP)', 'ArthWind', 'Banco Pérola'],
      },
      tcc: {
        period: 'TCC · UNIJUÍ',
        category: 'Pesquisa acadêmica',
        title: 'Prevenção e predição de defeitos',
        description:
          'Trabalho de conclusão do bacharelado em Engenharia de Software: análise comparativa de ferramentas de automação de testes aplicadas à prevenção e à predição de defeitos de software. A pergunta que guia a pesquisa é a mesma do dia a dia: qual teste, em que camada, vale o custo de manter.',
        tags: ['Pesquisa', 'Automação de testes', 'Prevenção de defeitos', 'Predição de defeitos'],
        imageAlt: 'Capa do case TCC — Prevenção e predição de defeitos',
        linkLabel: 'Ler o TCC (PDF)',
      },
      n8n: {
        period: 'Laboratório',
        category: 'Automação & Integrações',
        title: 'Workflows n8n',
        description:
          'Automações de ponta a ponta fora do trabalho: categorização de despesas via Gmail → OpenAI → Google Sheets, resumo diário da agenda entregue no WhatsApp via Evolution API, e uma interface de conexão com debugging de webhooks.',
        tags: ['n8n', 'APIs', 'Webhooks', 'Python'],
        imageAlt: 'Capa do case Workflows n8n',
      },
    },
  },
  career: {
    label: 'Trajetória',
    items: [
      {
        period: 'Ago 2025 — Jul 2026',
        role: 'Analista QA Sênior I — Automações',
        company: 'ED Consultoria',
        context: 'Alocado na Icatu Seguros',
        summary:
          'Automação Web E2E em Cypress para Previdência, massas de teste em JSON com lógica condicional, fluxos completos de Venda Vida via API no Postman e evolução das esteiras de CI/CD.',
      },
      {
        period: 'Jul 2023 — Jul 2025',
        role: 'Consultor QA Engineer Pleno',
        company: 'Grupo Ivy',
        context: 'Alocado na AutoAvaliar e na RwTech',
        summary:
          'Qualidade em quatro frentes de produto: refinamento de estórias, critérios de aceite, testes funcionais Web, Mobile, API e de responsividade, e automação com Cypress, Orange Testing e Appium.',
      },
      {
        period: 'Dez 2022 — Jul 2023',
        role: 'Analista de Testes / QA Jr',
        company: 'Going2 Corporation',
        summary:
          'Estruturação dos ambientes e da padronização do time de QA, planos de teste e automação em Cypress integrada ao pipeline, com execução em BrowserStack.',
      },
      {
        period: 'Mai 2021 — Jan 2022',
        role: 'Analista de Testes e Qualidade de Software',
        company: 'Nuvoni Softwares',
        summary:
          'Testes funcionais, exploratórios e de regressão automatizados em Cypress. Também atuei no código, com correções e novas features em React e TypeScript, MongoDB e Docker.',
      },
    ],
    earlyLabel: 'Início: estágio e bolsas · 2020–2022',
    early: [
      {
        period: 'Jul 2022 — Dez 2022',
        role: 'Bolsista — Projeto DREAM-CODE',
        company: 'Compass UOL × UNIJUÍ',
        summary: 'Acompanhamento de estudantes em C++, desafios de programação e hackathons.',
      },
      {
        period: 'Abr 2021 — Mai 2021',
        role: 'Estágio em Suporte e Redes',
        company: '17ª CRE — Santa Rosa',
        summary: 'Suporte a escolas e professores do noroeste do RS.',
      },
      {
        period: 'Mar 2020 — Mai 2021',
        role: 'Bolsista PIBEX — Programe Seu Futuro',
        company: 'UNIJUÍ',
        summary:
          'Ensino de lógica de programação e desenvolvimento de games (Scratch, GDevelop e Unity) para alunos do ensino médio.',
      },
    ],
  },
  marquee: [
    { text: 'Automatizado', style: 'outline' },
    { text: 'Confiável', style: 'accent' },
    { text: 'Escalável', style: 'outline' },
    { text: 'Testado', style: 'solid' },
  ],
  about: {
    title: 'Qualidade como engenharia e Automações',
    paragraphs: [
      'Sou Gustavo Bueno, Analista de Testes Sênior baseado em Santa Rosa/RS. Bacharel em Engenharia de Software pela UNIJUÍ, com seis anos de experiência testando software em seguros, marketplace automotivo e SaaS.',
      'Trabalho na fronteira entre o teste manual criterioso e a automação de verdade — a que roda em pipeline, falha pelo motivo certo e economiza o tempo do time. No meu primeiro emprego em QA também programei, com correções e novas features em React e TypeScript; desde então escrevo automação como código de produto. Gosto de entrar cedo no ciclo: refinar critério de aceite, antecipar o cenário de erro e transformar regra de negócio em cenário Gherkin que o time inteiro consegue ler.',
      'Fora dos projetos, automação virou hábito: com n8n, APIs e Python eu conecto serviços e tiro o trabalho repetitivo do caminho — despesas categorizadas sozinhas a partir do Gmail com OpenAI e Google Sheets, um resumo diário da agenda entregue no WhatsApp via Evolution API e uma interface própria para depurar webhooks. É o mesmo raciocínio do teste: entrada clara, regra explícita e uma saída que dá para verificar.',
      'Meu TCC foi uma análise comparativa de ferramentas de automação para prevenção e predição de defeitos — a mesma pergunta que continuo respondendo na prática: qual teste, em que camada, vale o custo de manter.',
      'Também já estive do outro lado da sala: ensinei lógica de programação e games para alunos do ensino médio e acompanhei estudantes de C++ no DREAM-CODE da Compass UOL. Saber explicar faz parte do trabalho de QA — é assim que a cultura de qualidade chega ao time inteiro.',
    ],
    photoAlt: 'Retrato de Gustavo Bueno',
    practices: 'Como eu testo',
    practiceItems: [
      'Partição de equivalência',
      'Análise de valor-limite',
      'Testes exploratórios com charters',
      'Caixa preta e caixa branca',
      'Regressão e integração',
      'Responsividade',
      'Banco de dados (SQL)',
      'BDD com Gherkin',
      'Shift-left',
      'Homologação e documentação',
    ],
    technologies: 'Tecnologias',
    certifications: 'Certificações',
    courses: 'Cursos',
    verify: 'verificar credencial',
    cta: 'Vamos conversar',
  },
  services: {
    label: 'O que eu faço',
    items: [
      {
        icon: 'e2e',
        title: 'Automação de Testes E2E',
        description:
          'Suítes end-to-end em Cypress para web e Appium para mobile, com execução em BrowserStack, arquitetura escalável, custom commands e massas de teste em JSON. Automação que sobrevive ao refactor do front-end em vez de quebrar a cada sprint.',
      },
      {
        icon: 'workflows',
        title: 'Automação de Processos & Integrações',
        description:
          'Fluxos em n8n que conectam APIs, webhooks e IA para tirar o trabalho repetitivo do caminho: da categorização de despesas (Gmail → OpenAI → Google Sheets) a resumos diários entregues no WhatsApp via Evolution API. Cada fluxo com entrada, regra e saída verificáveis — como um bom teste.',
      },
      {
        icon: 'pipelines',
        title: 'Automação de Dados, Pipelines & Métricas',
        description:
          'Massas de teste geradas por script, fluxos de negócio completos executados via API no Postman, suítes rodando sozinhas na esteira de CI/CD e dashboards de métricas para o time acompanhar a qualidade a cada entrega.',
      },
      {
        icon: 'mobile',
        title: 'Testes Mobile',
        description:
          'Testes funcionais, exploratórios, de regressão e de responsividade em apps e na web mobile, com automação em Appium e execução na BrowserStack — prática no Grupo IVY e na Going2, com 100h de formação na trilha mobile da QAzando.',
      },
      {
        icon: 'api',
        title: 'Testes de API',
        description:
          'Cenários positivos e negativos, validação de status, payload e regras de negócio, geração de massa e encadeamento de requisições em Postman e Insomnia. Cobertura na camada onde o bug custa mais barato de corrigir.',
      },
      {
        icon: 'performance',
        title: 'Performance & Carga',
        description:
          'Cenários de carga, stress e soak com Grafana k6 e JMeter. Descobrir o limite do sistema antes que o pico de acesso descubra.',
      },
      {
        icon: 'design',
        title: 'Design de Testes & Exploratório',
        description:
          'Casos e cenários com partição de equivalência, valor-limite e heurísticas; sessões exploratórias guiadas por charters; bugs documentados com logs contextualizados, fáceis de reproduzir. Cobertura pensada, não só volume de casos.',
      },
      {
        icon: 'strategy',
        title: 'Estratégia de QA & Shift-Left',
        description:
          'Plano de testes, critérios de aceite em Gherkin, refinamento técnico de estórias e integração com a esteira de CI/CD. Qualidade que começa no refinamento, não no fim da sprint.',
      },
    ],
    cta: 'Vamos conversar',
  },
  recommendations: {
    label: 'Recomendações',
    intro: 'O que dizem líderes e colegas que trabalharam comigo.',
    source: 'Recomendações públicas no LinkedIn, com o texto original.',
    link: 'Ver no LinkedIn',
    items: [
      {
        name: 'José Jeferson Lopes Gomes',
        role: 'Desenvolvedor Full Stack Sênior',
        featured: true,
        date: 'jul/2025',
        quote: [
          'Tive o privilégio de trabalhar com Gustavo na Auto Avaliar, e posso afirmar com segurança que sua atuação como QA foi exemplar.',
          'Desde o início, destacou-se pela proatividade. Sempre esteve um passo à frente, antecipando possíveis cenários e contribuindo com ideias e sugestões que elevaram a qualidade do produto final. Além disso, demonstrou um profundo entendimento das regras de negócio, o que o tornava uma referência tanto para o time de QA quanto para os desenvolvedores e analistas.',
          'Outro ponto marcante foi sua colaboração constante com a equipe. Sempre disponível para ajudar, revisava casos de teste com clareza, levantava pontos importantes em reuniões e era fundamental para garantir entregas mais estáveis e alinhadas com as expectativas do cliente.',
          'Sem dúvida, Gustavo é um profissional de extrema competência, comprometido e que agrega muito valor a qualquer equipe.',
          'Recomendo fortemente sua contratação.',
        ],
      },
      {
        name: 'Márcio Winicius',
        role: 'Head de Tecnologia',
        featured: true,
        date: 'jul/2025',
        quote: [
          'Tive o prazer de trabalhar com o Gustavo, um excelente Analista de Qualidade que demonstrou, em diversos momentos, um alto nível de comprometimento e domínio técnico. Sua atenção aos detalhes, capacidade analítica e postura questionadora foram fundamentais para identificar riscos e prevenir falhas ainda nas fases iniciais do desenvolvimento.',
          'Graças à sua atuação proativa e conhecimento em testes de software — tanto manuais quanto automatizados — conseguimos elevar significativamente a qualidade dos produtos entregues, promovendo entregas mais seguras e robustas para nossos clientes.',
          'Além disso, Gustavo sempre teve uma postura colaborativa, contribuindo não apenas com a equipe de QA, mas também com desenvolvedores e produto owners.',
        ],
      },
      {
        name: 'Cláudio Virginelli',
        role: 'Líder de Engenharia',
        date: 'jul/2025',
        quote: [
          'Gustavo, sua dedicação e contribuição como consultor de testes possuem um grande valor. Sempre tem muito a contribuir com a analise, validação e melhoria da qualidade em produtos, teste, processos e em reuniões. Tem grande conhecimento em ferramentas de análise ágeis e testes!',
        ],
      },
      {
        name: 'Gean Lopes',
        role: 'Desenvolvedor Frontend',
        date: 'jul/2025',
        quote: [
          'Tive o prazer de trabalhar com o Gustavo por mais de um ano na Auto Avaliar. Gustavo é um cara super dedicado e proativo, sempre correndo atrás, perguntando, investigando e sugerindo melhorias. Isso fez muita diferença no nosso time! Participa das reuniões com atenção aos detalhes e tem um senso crítico afiado, sempre alinhado com o que o time precisava. Minha recomendação para o Gustavo vai de olhos fechados o cara é dedicado!',
        ],
      },
      {
        name: 'Rodrigo Martins',
        role: 'Engenheiro de Software Sênior',
        date: 'jul/2025',
        quote: [
          'Tive a oportunidade de trabalhar com o Gustavo na Auto Avaliar, e durante esse período ele se destacou pelo profissionalismo, atenção aos detalhes e critério em todos os testes que realizava. Além de suas entregas impecáveis, ele sempre contribuiu com o time, compartilhando seu amplo conhecimento sobre os fluxos do sistema, o que demonstra não apenas domínio técnico, mas também espírito colaborativo.',
          'Sem dúvida, um profissional qualificado e valioso para qualquer equipe!',
        ],
      },
    ],
  },
  contact: {
    title: 'Vamos construir qualidade',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn de Gustavo Bueno',
    github: 'GitHub de Gustavo Bueno',
    cv: 'Baixar CV',
    copyright: '© {year} Gustavo Bueno · Santa Rosa, RS',
    analyticsNote: 'Este site usa estatísticas de visita anônimas, sem cookies.',
    qaBadge: 'Este site é testado',
    qaBadgeDetail: '{total} testes automatizados · acessibilidade WCAG 2.2 AA · Lighthouse {performance}',
    form: {
      title: 'Ou mande uma mensagem por aqui',
      name: 'Nome',
      email: 'E-mail',
      topic: 'Assunto',
      topics: {
        clt: 'Vaga CLT',
        pj: 'Projeto PJ / freela',
        consultoria: 'Consultoria',
        outro: 'Outro assunto',
      },
      message: 'Mensagem',
      messagePlaceholder: 'Conte rapidamente sobre a vaga, o projeto ou a dúvida.',
      honeypot: 'Deixe este campo em branco',
      submit: 'Enviar mensagem',
      sending: 'Enviando…',
      privacy: 'Seus dados são usados só para responder a esta mensagem.',
      success: 'Mensagem enviada! Vou responder no e-mail que você informou.',
      error: 'Não consegui enviar agora. Tente de novo ou use o e-mail ou o WhatsApp acima.',
      rateLimited: 'Muitas mensagens em pouco tempo. Tente de novo em alguns minutos.',
      unavailable: 'O formulário está fora do ar no momento. Use o e-mail ou o WhatsApp acima.',
      errors: {
        name: 'Informe seu nome (de 2 a 80 caracteres).',
        email: 'Informe um e-mail válido.',
        message: 'Escreva pelo menos 10 caracteres (máximo de 2.000).',
      },
    },
  },
  chat: {
    open: 'Abrir perguntas frequentes',
    close: 'Fechar perguntas frequentes',
    title: 'QA-Bot',
    subtitle: 'Perguntas frequentes',
    greeting:
      'Oi! Sou o QA-Bot. Escolha uma pergunta sobre o trabalho do Gustavo — as respostas são diretas, sem enrolação.',
    typing: 'QA-Bot está digitando',
    suggestions: 'Perguntas',
    done: 'Isso cobre o essencial. Quer falar direto com o Gustavo?',
    direct: 'Falar direto',
  },
  faq: [
    {
      id: 'who',
      question: 'Quem é o Gustavo?',
      answer:
        'Gustavo Bueno é Analista de Testes Sênior, baseado em Santa Rosa/RS, com seis anos de experiência em QA em seguros, marketplace automotivo e SaaS. É bacharel em Engenharia de Software pela UNIJUÍ.',
    },
    {
      id: 'tools',
      question: 'Quais ferramentas ele domina?',
      answer:
        'Em projetos: Cypress para web, Appium para mobile, Orange Testing e BrowserStack, além de Postman e Insomnia para APIs. Programa em JavaScript, TypeScript, Java e Python, e trabalha com Docker, Git, Azure DevOps e esteiras de CI/CD. Para performance usa Grafana k6 e JMeter; Selenium WebDriver, Robot Framework e Maestro ele conhece por cursos.',
    },
    {
      id: 'work-model',
      question: 'Que tipo de trabalho ele aceita?',
      answer:
        'Está disponível para novos projetos: CLT, PJ, freelas e consultoria — desde que o trabalho seja remoto. Os focos são automação E2E web e mobile, testes de API, performance, design de testes e estruturação de QA com shift-left.',
    },
    {
      id: 'results',
      question: 'Que resultados ele já entregou?',
      answer:
        'Na Icatu: 33% menos tempo de homologação e mais de 5.200 horas economizadas em regressão. No Grupo IVY: cycle time de 12 para 6 dias, mais de 1.500 validações sistêmicas e 92% de eficiência na detecção de defeitos.',
    },
    {
      id: 'english',
      question: 'Ele trabalha em inglês?',
      answer:
        'Sim. Tem inglês nível B2 (intermediário avançado) e usa documentação, ferramentas e comunicação técnica em inglês no dia a dia.',
    },
    {
      id: 'site-qa',
      question: 'Como este site é testado?',
      answer:
        'Com testes automatizados em Cypress, em web e mobile: cenários BDD em Gherkin para os fluxos de negócio, checagem de acessibilidade com axe (WCAG 2.2 AA), testes da API do formulário e Lighthouse com metas mínimas. Tudo roda no GitHub Actions a cada mudança, e o site só vai ao ar se passar. Os resultados estão na página "Qualidade", no rodapé.',
    },
    {
      id: 'contact',
      question: 'Como falar com ele?',
      answer:
        'Pelo e-mail gustavoriedel2202@gmail.com, pelo WhatsApp (+55 55 99139-8135) ou pelo LinkedIn. Os atalhos estão logo abaixo e no rodapé da página.',
    },
  ],
  notFound: {
    title: 'Página não encontrada',
    text: 'O link que você seguiu não existe — mas o portfólio sim.',
    back: 'Voltar ao início',
  },
  quality: {
    metaTitle: 'Qualidade deste site | Gustavo Bueno',
    metaDescription:
      'Dashboard dos testes automatizados deste portfólio: Cypress em web e mobile, BDD em Gherkin, acessibilidade WCAG 2.2 AA com axe e Lighthouse CI, com portão de qualidade no GitHub Actions.',
    label: 'Qualidade deste site',
    title: 'Este site é testado',
    intro:
      'Cada mudança passa por uma bateria de testes automatizados antes de ir ao ar. Se um teste falha, o deploy não acontece. Os números abaixo são da execução que publicou esta versão do site.',
    statusPassed: 'Aprovado em todos os testes',
    statusFailed: 'Há testes falhando nesta execução',
    ranOn: 'Executado em {date}',
    sourceCi: 'GitHub Actions',
    sourceLocal: 'execução local',
    viewRun: 'Ver a execução no GitHub',
    totalLabel: 'testes automatizados',
    passedLabel: 'aprovados',
    suites: {
      web: 'Web · Chrome em tela de desktop',
      mobile: 'Mobile · tela de celular com toque',
    },
    categories: {
      bdd: 'Cenários BDD (Gherkin)',
      a11y: 'Acessibilidade',
      api: 'API do formulário',
      tecnico: 'Técnicos (SEO, carregamento, responsivo, conteúdo)',
    },
    a11yTitle: 'Acessibilidade',
    a11yText: '{checks} estados da página verificados com axe-core · {violations} violações · padrão WCAG 2.2 AA',
    lighthouseTitle: 'Lighthouse',
    lighthouseNote: 'Mediana de 3 medições no perfil de celular, com rede e CPU limitadas.',
    lighthouseLabels: {
      performance: 'Performance',
      accessibility: 'Acessibilidade',
      bestPractices: 'Boas práticas',
      seo: 'SEO',
    },
    noLighthouse: 'Sem medição do Lighthouse nesta execução.',
    pipelineTitle: 'Como funciona',
    pipelineSteps: [
      { title: 'Push no GitHub', text: 'Toda mudança dispara o workflow de QA no GitHub Actions.' },
      { title: 'Lint e typecheck', text: 'ESLint (com regras de acessibilidade) e TypeScript estrito.' },
      { title: 'Build com verificações', text: 'Pré-render do HTML; o build falha se faltar seção, h1 ou arquivo linkado.' },
      { title: 'Cypress web', text: 'Cenários BDD e testes técnicos em tela de desktop.' },
      { title: 'Cypress mobile', text: 'Os mesmos fluxos em tela de celular, com toque emulado.' },
      { title: 'Acessibilidade', text: 'axe-core em cada estado da página: menu, chat, erros do formulário, 404.' },
      { title: 'Lighthouse CI', text: 'Metas mínimas: Performance ≥ 90 e Acessibilidade ≥ 95 no celular.' },
      { title: 'Deploy', text: 'Só se tudo passar, o GitHub Actions publica na Vercel com estes resultados.' },
    ],
    gateNote:
      'Portão de qualidade: se qualquer etapa falha, nada vai ao ar. A versão publicada sempre passou em todos os testes.',
    exampleTitle: 'Um cenário real, executado a cada deploy',
    exampleNote: 'Arquivo cypress/e2e/features/contato.feature, escrito em Gherkin.',
    toolsTitle: 'Ferramentas',
    tools: ['Cypress', 'Gherkin / Cucumber', 'Testing Library', 'axe-core', 'Lighthouse CI', 'GitHub Actions', 'Vercel'],
    codeLink: 'Ver o código dos testes',
    historyLink: 'Histórico de execuções',
    back: 'Voltar ao portfólio',
  },
};

/* -------------------------------------------------------------------------- */
/* English                                                                     */
/* -------------------------------------------------------------------------- */

const en: Content = {
  meta: {
    title: 'Gustavo Bueno | Software Engineer — Quality & Automation',
    description:
      'Software Engineer based in Santa Rosa, Brazil, specialized in Quality & Automation: E2E with Cypress, API testing, performance with k6 and process automation with n8n. 6 years in insurance, automotive marketplaces and SaaS.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    primaryNav: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    language: 'Language',
    newTab: '(opens in a new tab)',
    home: 'Gustavo Bueno — back to top',
  },
  nav: [
    { id: 'work', label: 'Work' },
    { id: 'career', label: 'Experience' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ],
  hero: {
    availability: 'Available for new projects',
    eyebrow: 'Automation · Quality · Reliability',
    titleLines: ['Software', 'Engineer'],
    specialization: 'Quality & Automation Engineer',
    intro:
      "Six years of experience making bugs show up in the pipeline — not on the customer's screen. I build automation that runs on its own, fails for the right reason and gives time back to the team: on a single project, more than 5,200 hours of regression.",
    cta: 'Get in touch',
    scroll: 'Scroll to see',
  },
  impact: {
    label: 'Impact in numbers',
    metrics: [
      { value: 33, suffix: '%', label: 'reduction in acceptance testing time' },
      { value: 5200, suffix: 'h', label: 'saved on regression runs' },
      { value: 50, suffix: '%', label: 'reduction in cycle time (12 → 6 days)' },
      { value: 1500, suffix: '+', label: 'system validations across critical flows' },
      { value: 92, suffix: '%', label: 'defect detection efficiency (DDE)' },
    ],
    footnote: 'Results measured on insurance, automotive marketplace and SaaS projects',
  },
  work: {
    label: 'Selected work',
    resultLabel: 'Result',
    tagsLabel: 'Technologies and practices',
    clientsLabel: 'Projects',
    linkPending: 'coming soon',
    cases: {
      qa: {
        period: '2026',
        category: 'E2E Automation / BDD / CI',
        title: 'This portfolio — QA of the site itself',
        description:
          'The site you are looking at is tested on every change: BDD scenarios in Gherkin (Portuguese) for the business flows and TypeScript tests for accessibility, API, SEO and responsiveness, running on web and mobile with Cypress. Lighthouse CI enforces minimum performance and accessibility targets, and a quality gate in GitHub Actions only publishes to Vercel what passed everything.',
        tags: ['Cypress', 'Gherkin/BDD', 'axe-core', 'Lighthouse CI', 'GitHub Actions'],
        imageAlt: "Quality dashboard of this site with the automated test results",
        linkLabel: 'See the tests',
      },
      icatu: {
        period: '2025–2026',
        category: 'E2E Automation / Insurance',
        title: 'Icatu Seguros — Pension plans',
        description:
          'Through ED Consultoria, Cypress web E2E automation for pension products, with an architecture built to scale and custom commands for reuse. JSON test data with conditional logic drives scenario behavior and covers complex flows cleanly. JavaScript scripts in Postman chain requests to run the entire Life Insurance sales flow through the API, and execution pipelines with metrics dashboards gave the team visibility.',
        result: '33% less acceptance testing time and more than 5,200 hours saved on regression.',
        tags: ['Cypress', 'Postman', 'TypeScript', 'CI/CD', 'Azure'],
        imageAlt: 'Cover of the Icatu Seguros — Pension plans case',
      },
      ivy: {
        period: '2023–2025',
        category: 'End-to-end quality / Multi-project',
        title: 'IVY Group — AutoAvaliar & RwTech',
        description:
          'Built a quality culture across four product streams (IVY, B2B, RTF, NOVA): technical story refinement, acceptance criteria, functional Web/Mobile/API testing and automation with Cypress, Appium and Orange Testing. Equivalence partitioning, boundary values and charter-based exploratory testing, with bugs documented through contextual logs — less rework and fewer defects reaching production.',
        result:
          'more than 1,500 system validations, cycle time down from 12 to 6 days and 92% defect detection efficiency.',
        tags: ['Cypress', 'Appium', 'Shift-left', 'Scrum'],
        imageAlt: 'Cover of the IVY Group — AutoAvaliar & RwTech case',
      },
      going2: {
        period: '2022–2023',
        category: 'QA foundations / CI',
        title: 'Going2 — From zero to pipeline',
        description:
          "Built the team's QA foundation: test plans, standardized processes, environment setup and Cypress scripts integrated into the pipeline, speeding up regression on critical Web and Mobile flows running on BrowserStack. During refinement, failure scenarios anticipated with boundary values and partitioning prevented development rework.",
        tags: ['Cypress', 'BrowserStack', 'CI/CD', 'Test planning'],
        imageAlt: 'Cover of the Going2 — From zero to pipeline case',
        clients: ['Footbao', 'Ministério do Belém (ERP)', 'ArthWind', 'Banco Pérola'],
      },
      tcc: {
        period: 'Thesis · UNIJUÍ',
        category: 'Academic research',
        title: 'Defect prevention and prediction',
        description:
          "Final thesis for the bachelor's in Software Engineering: a comparative analysis of test automation tools applied to preventing and predicting software defects. The question behind the research is the same one I face every day: which test, at which layer, is worth the cost of maintaining.",
        tags: ['Research', 'Test automation', 'Defect prevention', 'Defect prediction'],
        imageAlt: 'Cover of the thesis case — Defect prevention and prediction',
        linkLabel: 'Read the thesis (PDF, Portuguese)',
      },
      n8n: {
        period: 'Lab',
        category: 'Automation & Integrations',
        title: 'n8n workflows',
        description:
          'End-to-end automations outside of work: expense categorization via Gmail → OpenAI → Google Sheets, a daily calendar summary delivered on WhatsApp through the Evolution API, and a connection interface with webhook debugging.',
        tags: ['n8n', 'APIs', 'Webhooks', 'Python'],
        imageAlt: 'Cover of the n8n workflows case',
      },
    },
  },
  career: {
    label: 'Experience',
    items: [
      {
        period: 'Aug 2025 — Jul 2026',
        role: 'Senior QA Analyst I — Automation',
        company: 'ED Consultoria',
        context: 'Assigned to Icatu Seguros',
        summary:
          'Cypress web E2E automation for pension products, JSON test data with conditional logic, full Life Insurance sales flows through the API in Postman and CI/CD pipeline improvements.',
      },
      {
        period: 'Jul 2023 — Jul 2025',
        role: 'QA Engineer Consultant (Mid-level)',
        company: 'Grupo Ivy',
        context: 'Assigned to AutoAvaliar and RwTech',
        summary:
          'Quality across four product streams: story refinement, acceptance criteria, functional Web, Mobile, API and responsive testing, and automation with Cypress, Orange Testing and Appium.',
      },
      {
        period: 'Dec 2022 — Jul 2023',
        role: 'Junior Test / QA Analyst',
        company: 'Going2 Corporation',
        summary:
          "Set up the QA team's environments and standards, test plans and Cypress automation integrated into the pipeline, running on BrowserStack.",
      },
      {
        period: 'May 2021 — Jan 2022',
        role: 'Software Test and Quality Analyst',
        company: 'Nuvoni Softwares',
        summary:
          'Functional, exploratory and automated regression testing with Cypress. I also worked on the code: fixes and new features in React and TypeScript, with MongoDB and Docker.',
      },
    ],
    earlyLabel: 'Early years: internship and scholarships · 2020–2022',
    early: [
      {
        period: 'Jul 2022 — Dec 2022',
        role: 'Scholarship — DREAM-CODE project',
        company: 'Compass UOL × UNIJUÍ',
        summary: 'Mentored students in C++, coding challenges and hackathons.',
      },
      {
        period: 'Apr 2021 — May 2021',
        role: 'Support & Networking Intern',
        company: '17th CRE (Regional Education Office) — Santa Rosa',
        summary: 'Support for schools and teachers across northwestern Rio Grande do Sul.',
      },
      {
        period: 'Mar 2020 — May 2021',
        role: 'PIBEX Scholarship — Programe Seu Futuro',
        company: 'UNIJUÍ',
        summary:
          'Taught programming logic and game development (Scratch, GDevelop and Unity) to high school students.',
      },
    ],
  },
  marquee: [
    { text: 'Automated', style: 'outline' },
    { text: 'Reliable', style: 'accent' },
    { text: 'Scalable', style: 'outline' },
    { text: 'Tested', style: 'solid' },
  ],
  about: {
    title: 'Quality as engineering and automation',
    paragraphs: [
      "I'm Gustavo Bueno, a Senior Test Analyst based in Santa Rosa, Brazil. I hold a bachelor's degree in Software Engineering from UNIJUÍ and have six years of experience testing software in insurance, automotive marketplaces and SaaS.",
      'I work where careful manual testing meets real automation — the kind that runs in the pipeline, fails for the right reason and saves the team time. In my first QA job I also wrote product code, shipping fixes and new features in React and TypeScript; ever since, I write automation as production code. I like getting in early: refining acceptance criteria, anticipating the failure scenario and turning business rules into Gherkin scenarios the whole team can read.',
      'Outside of client work, automation became a habit: with n8n, APIs and Python I connect services and get repetitive work out of the way — expenses categorized automatically from Gmail with OpenAI and Google Sheets, a daily calendar summary delivered on WhatsApp through the Evolution API, and my own interface for debugging webhooks. It is the same reasoning as testing: clear input, explicit rules and an output you can verify.',
      'My thesis was a comparative analysis of automation tools for defect prevention and prediction — the same question I keep answering in practice: which test, at which layer, is worth the cost of maintaining.',
      "I've also been on the other side of the classroom: I taught programming logic and game development to high school students and mentored C++ students in Compass UOL's DREAM-CODE program. Explaining things well is part of QA work — it's how a quality culture reaches the whole team.",
    ],
    photoAlt: 'Portrait of Gustavo Bueno',
    practices: 'How I test',
    practiceItems: [
      'Equivalence partitioning',
      'Boundary value analysis',
      'Charter-based exploratory testing',
      'Black-box and white-box',
      'Regression and integration',
      'Responsive testing',
      'Database testing (SQL)',
      'BDD with Gherkin',
      'Shift-left',
      'Acceptance sign-off and documentation',
    ],
    technologies: 'Technologies',
    certifications: 'Certifications',
    courses: 'Courses',
    verify: 'verify credential',
    cta: "Let's talk",
  },
  services: {
    label: 'What I do',
    items: [
      {
        icon: 'e2e',
        title: 'E2E Test Automation',
        description:
          'End-to-end suites in Cypress for web and Appium for mobile, running on BrowserStack, with scalable architecture, custom commands and JSON test data. Automation that survives the front-end refactor instead of breaking every sprint.',
      },
      {
        icon: 'workflows',
        title: 'Process Automation & Integrations',
        description:
          'n8n workflows connecting APIs, webhooks and AI to get repetitive work out of the way: from expense categorization (Gmail → OpenAI → Google Sheets) to daily summaries delivered on WhatsApp through the Evolution API. Every flow with verifiable input, rules and output — just like a good test.',
      },
      {
        icon: 'pipelines',
        title: 'Data, Pipeline & Metrics Automation',
        description:
          'Script-generated test data, complete business flows executed through the API in Postman, suites running on their own in the CI/CD pipeline and metrics dashboards so the team can track quality with every delivery.',
      },
      {
        icon: 'mobile',
        title: 'Mobile Testing',
        description:
          'Functional, exploratory, regression and responsive testing for apps and the mobile web, with Appium automation running on BrowserStack — hands-on at IVY Group and Going2, backed by QAzando’s 100-hour mobile track.',
      },
      {
        icon: 'api',
        title: 'API Testing',
        description:
          'Positive and negative scenarios, status, payload and business rule validation, test data generation and request chaining in Postman and Insomnia. Coverage at the layer where bugs are cheapest to fix.',
      },
      {
        icon: 'performance',
        title: 'Performance & Load',
        description:
          "Load, stress and soak scenarios with Grafana k6 and JMeter. Find the system's limit before peak traffic does.",
      },
      {
        icon: 'design',
        title: 'Test Design & Exploratory',
        description:
          'Test cases and scenarios built with equivalence partitioning, boundary values and heuristics; charter-driven exploratory sessions; bugs documented with contextual logs so they are easy to reproduce. Deliberate coverage, not just a pile of test cases.',
      },
      {
        icon: 'strategy',
        title: 'QA Strategy & Shift-Left',
        description:
          'Test plans, Gherkin acceptance criteria, technical story refinement and integration with the CI/CD pipeline. Quality that starts at refinement, not at the end of the sprint.',
      },
    ],
    cta: "Let's talk",
  },
  recommendations: {
    label: 'Recommendations',
    intro: 'What leads and teammates who worked with me have to say.',
    source: 'Public LinkedIn recommendations, translated from Portuguese.',
    link: 'See on LinkedIn',
    items: [
      {
        name: 'José Jeferson Lopes Gomes',
        role: 'Senior Full Stack Developer',
        featured: true,
        date: 'Jul 2025',
        quote: [
          'I had the privilege of working with Gustavo at AutoAvaliar, and I can say with confidence that his work as a QA was exemplary.',
          'From the very start, he stood out for his proactivity. He was always one step ahead, anticipating possible scenarios and contributing ideas and suggestions that raised the quality of the final product. He also showed a deep understanding of the business rules, which made him a reference for the QA team as well as for developers and analysts.',
          "Another highlight was his constant collaboration with the team. Always available to help, he reviewed test cases clearly, raised important points in meetings and was essential to ensuring more stable deliveries, aligned with the client's expectations.",
          'Without a doubt, Gustavo is an extremely competent, committed professional who adds a lot of value to any team.',
          'I strongly recommend hiring him.',
        ],
      },
      {
        name: 'Márcio Winicius',
        role: 'Head of Technology',
        featured: true,
        date: 'Jul 2025',
        quote: [
          'I had the pleasure of working with Gustavo, an excellent Quality Analyst who showed, on many occasions, a high level of commitment and technical mastery. His attention to detail, analytical skills and questioning mindset were key to identifying risks and preventing failures early in development.',
          'Thanks to his proactive approach and knowledge of software testing — both manual and automated — we significantly raised the quality of the products we delivered, making our releases safer and more robust for our clients.',
          'Gustavo also always had a collaborative attitude, contributing not only to the QA team but also to developers and product owners.',
        ],
      },
      {
        name: 'Cláudio Virginelli',
        role: 'Engineering Lead',
        date: 'Jul 2025',
        quote: [
          'Gustavo, your dedication and contribution as a testing consultant are of great value. You always have a lot to contribute to the analysis, validation and quality improvement of products, testing, processes and meetings. You have deep knowledge of agile analysis and testing tools!',
        ],
      },
      {
        name: 'Gean Lopes',
        role: 'Frontend Developer',
        date: 'Jul 2025',
        quote: [
          "I had the pleasure of working with Gustavo for more than a year at AutoAvaliar. Gustavo is super dedicated and proactive, always chasing things down, asking, investigating and suggesting improvements. That made a big difference to our team! He joins meetings with attention to detail and a sharp critical sense, always aligned with what the team needed. I recommend Gustavo with my eyes closed — he's dedicated!",
        ],
      },
      {
        name: 'Rodrigo Martins',
        role: 'Senior Software Engineer',
        date: 'Jul 2025',
        quote: [
          "I had the opportunity to work with Gustavo at AutoAvaliar, and during that time he stood out for his professionalism, attention to detail and rigor in every test he ran. Beyond his flawless deliveries, he always contributed to the team by sharing his broad knowledge of the system's flows, which shows not only technical mastery but also a collaborative spirit.",
          'Without a doubt, a qualified professional who is valuable to any team!',
        ],
      },
    ],
  },
  contact: {
    title: "Let's build quality",
    whatsapp: 'WhatsApp',
    linkedin: "Gustavo Bueno's LinkedIn",
    github: "Gustavo Bueno's GitHub",
    cv: 'Download CV (Portuguese)',
    copyright: '© {year} Gustavo Bueno · Santa Rosa, Brazil',
    analyticsNote: 'This site uses anonymous visit statistics, with no cookies.',
    qaBadge: 'This site is tested',
    qaBadgeDetail: '{total} automated tests · WCAG 2.2 AA accessibility · Lighthouse {performance}',
    form: {
      title: 'Or send a message right here',
      name: 'Name',
      email: 'Email',
      topic: 'Subject',
      topics: {
        clt: 'Full-time role',
        pj: 'Contract / freelance project',
        consultoria: 'Consulting',
        outro: 'Something else',
      },
      message: 'Message',
      messagePlaceholder: 'Tell me briefly about the role, the project or your question.',
      honeypot: 'Leave this field empty',
      submit: 'Send message',
      sending: 'Sending…',
      privacy: 'Your details are only used to reply to this message.',
      success: "Message sent! I'll reply to the email you provided.",
      error: "I couldn't send it right now. Try again or use the email or WhatsApp above.",
      rateLimited: 'Too many messages in a short time. Please try again in a few minutes.',
      unavailable: 'The form is unavailable right now. Please use the email or WhatsApp above.',
      errors: {
        name: 'Enter your name (2 to 80 characters).',
        email: 'Enter a valid email address.',
        message: 'Write at least 10 characters (2,000 max).',
      },
    },
  },
  chat: {
    open: 'Open frequently asked questions',
    close: 'Close frequently asked questions',
    title: 'QA-Bot',
    subtitle: 'Frequently asked questions',
    greeting: "Hi! I'm QA-Bot. Pick a question about Gustavo's work — the answers are short and straight to the point.",
    typing: 'QA-Bot is typing',
    suggestions: 'Questions',
    done: 'That covers the essentials. Want to talk to Gustavo directly?',
    direct: 'Talk directly',
  },
  faq: [
    {
      id: 'who',
      question: 'Who is Gustavo?',
      answer:
        'Gustavo Bueno is a Senior Test Analyst based in Santa Rosa, Brazil, with six years of experience in QA across insurance, automotive marketplaces and SaaS. He holds a bachelor’s degree in Software Engineering from UNIJUÍ.',
    },
    {
      id: 'tools',
      question: 'Which tools does he master?',
      answer:
        'On projects: Cypress for web, Appium for mobile, Orange Testing and BrowserStack, plus Postman and Insomnia for APIs. He codes in JavaScript, TypeScript, Java and Python, and works with Docker, Git, Azure DevOps and CI/CD pipelines. For performance he uses Grafana k6 and JMeter; he knows Selenium WebDriver, Robot Framework and Maestro from courses.',
    },
    {
      id: 'work-model',
      question: 'What kind of work does he take on?',
      answer:
        'He is available for new projects: full-time employment, contracting, freelance and consulting — as long as the work is remote. His focus is web and mobile E2E automation, API testing, performance, test design and building QA practices with a shift-left approach.',
    },
    {
      id: 'results',
      question: 'What results has he delivered?',
      answer:
        'At Icatu: 33% less acceptance testing time and more than 5,200 hours saved on regression. At IVY Group: cycle time down from 12 to 6 days, more than 1,500 system validations and 92% defect detection efficiency.',
    },
    {
      id: 'english',
      question: 'Does he work in English?',
      answer:
        'Yes. He has B2 (upper-intermediate) English and uses English documentation, tools and technical communication every day.',
    },
    {
      id: 'site-qa',
      question: 'How is this site tested?',
      answer:
        'With automated Cypress tests on web and mobile: BDD scenarios in Gherkin for the business flows, accessibility checks with axe (WCAG 2.2 AA), tests for the contact form API and Lighthouse with minimum targets. Everything runs in GitHub Actions on every change, and the site only goes live if it passes. The results are on the "Quality" page, linked in the footer.',
    },
    {
      id: 'contact',
      question: 'How can I reach him?',
      answer:
        'By email at gustavoriedel2202@gmail.com, on WhatsApp (+55 55 99139-8135) or on LinkedIn. The shortcuts are right below and in the page footer.',
    },
  ],
  notFound: {
    title: 'Page not found',
    text: "The link you followed doesn't exist — but the portfolio does.",
    back: 'Back to home',
  },
  quality: {
    metaTitle: 'Quality of this site | Gustavo Bueno',
    metaDescription:
      "Dashboard of this portfolio's automated tests: Cypress on web and mobile, BDD in Gherkin, WCAG 2.2 AA accessibility with axe and Lighthouse CI, behind a quality gate in GitHub Actions.",
    label: 'Quality of this site',
    title: 'This site is tested',
    intro:
      'Every change goes through a suite of automated tests before going live. If a test fails, the deploy does not happen. The numbers below come from the run that published this version of the site.',
    statusPassed: 'Passed every test',
    statusFailed: 'Some tests are failing in this run',
    ranOn: 'Run on {date}',
    sourceCi: 'GitHub Actions',
    sourceLocal: 'local run',
    viewRun: 'See the run on GitHub',
    totalLabel: 'automated tests',
    passedLabel: 'passed',
    suites: {
      web: 'Web · Chrome on a desktop screen',
      mobile: 'Mobile · phone screen with touch',
    },
    categories: {
      bdd: 'BDD scenarios (Gherkin)',
      a11y: 'Accessibility',
      api: 'Contact form API',
      tecnico: 'Technical (SEO, loading, responsive, content)',
    },
    a11yTitle: 'Accessibility',
    a11yText: '{checks} page states checked with axe-core · {violations} violations · WCAG 2.2 AA standard',
    lighthouseTitle: 'Lighthouse',
    lighthouseNote: 'Median of 3 runs on the mobile profile, with throttled network and CPU.',
    lighthouseLabels: {
      performance: 'Performance',
      accessibility: 'Accessibility',
      bestPractices: 'Best practices',
      seo: 'SEO',
    },
    noLighthouse: 'No Lighthouse measurement in this run.',
    pipelineTitle: 'How it works',
    pipelineSteps: [
      { title: 'Push to GitHub', text: 'Every change triggers the QA workflow in GitHub Actions.' },
      { title: 'Lint and typecheck', text: 'ESLint (with accessibility rules) and strict TypeScript.' },
      { title: 'Build with checks', text: 'HTML pre-rendering; the build fails if a section, h1 or linked file is missing.' },
      { title: 'Cypress web', text: 'BDD scenarios and technical tests on a desktop screen.' },
      { title: 'Cypress mobile', text: 'The same flows on a phone screen, with emulated touch.' },
      { title: 'Accessibility', text: 'axe-core on every page state: menu, chat, form errors, 404.' },
      { title: 'Lighthouse CI', text: 'Minimum targets: Performance ≥ 90 and Accessibility ≥ 95 on mobile.' },
      { title: 'Deploy', text: 'Only if everything passes, GitHub Actions publishes to Vercel with these results.' },
    ],
    gateNote: 'Quality gate: if any step fails, nothing goes live. The published version always passed every test.',
    exampleTitle: 'A real scenario, run on every deploy',
    exampleNote: 'File cypress/e2e/features/contato.feature, written in Gherkin (in Portuguese).',
    toolsTitle: 'Tools',
    tools: ['Cypress', 'Gherkin / Cucumber', 'Testing Library', 'axe-core', 'Lighthouse CI', 'GitHub Actions', 'Vercel'],
    codeLink: 'See the test code',
    historyLink: 'Run history',
    back: 'Back to the portfolio',
  },
};

export const content: Readonly<Record<Locale, Content>> = { pt, en };
