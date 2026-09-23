import { addCucumberPreprocessorPlugin, afterRunHandler } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { defineConfig } from 'cypress';
import { scanBundle } from './cypress/plugins/bundle';
import { recordA11y, writeRunSummary, type A11yRecord } from './cypress/plugins/summary';

/**
 * Dois perfis de execução, escolhidos com --expose device=web|mobile:
 *  - web:    tela de desktop; roda os cenários sem a tag @mobile
 *  - mobile: tela de celular com toque emulado; roda os cenários sem a tag @web
 *
 * Specs que não dependem da tela (API, SEO, conteúdo) rodam só no perfil web.
 */
const WEB_ONLY_SPECS = ['api-contato', 'seo', 'conteudo'].map((name) => `cypress/e2e/tecnico/${name}.cy.ts`);

const DEVICES = {
  web: { width: 1440, height: 900, tags: 'not @mobile', exclude: [], userAgent: undefined },
  mobile: {
    width: 390,
    height: 844,
    tags: 'not @web',
    exclude: WEB_ONLY_SPECS,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  },
} as const;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    specPattern: ['cypress/e2e/features/**/*.feature', 'cypress/e2e/tecnico/**/*.cy.ts'],
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/results/screenshots',
    downloadsFolder: 'cypress/results/downloads',
    video: false,
    screenshotOnRunFailure: true,
    // O header é fixo no topo: centralizar evita que ele cubra o elemento clicado.
    scrollBehavior: 'center',
    defaultCommandTimeout: 8000,
    retries: { runMode: 1, openMode: 0 },
    async setupNodeEvents(on, config) {
      // Cypress 16: valores públicos para os testes ficam em `expose` (Cypress.expose()).
      const device = config.expose.device === 'mobile' ? 'mobile' : 'web';
      const profile = DEVICES[device];
      config.expose.device = device;
      config.expose.tags ??= profile.tags;
      config.viewportWidth = profile.width;
      config.viewportHeight = profile.height;
      if (profile.userAgent) config.userAgent = profile.userAgent;
      if (profile.exclude.length > 0) config.excludeSpecPattern = [...profile.exclude];

      // Tipo de ponteiro fixo por perfil: o servidor do CI não tem mouse, e o Chrome então
      // responderia "sem ponteiro fino" também no perfil web. Web = mouse; mobile = toque.
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          const pointer =
            device === 'web'
              ? 'primaryPointerType=4,availablePointerTypes=4,primaryHoverType=2,availableHoverTypes=2'
              : 'primaryPointerType=2,availablePointerTypes=2,primaryHoverType=1,availableHoverTypes=1';
          launchOptions.args.push(`--blink-settings=${pointer}`);
        }
        return launchOptions;
      });

      await addCucumberPreprocessorPlugin(on, config, { omitAfterRunHandler: true });
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));

      on('task', {
        recordA11y: (entry: A11yRecord) => recordA11y(entry),
        scanBundle: () => scanBundle(config.projectRoot),
        table: (rows: Record<string, unknown>[]) => {
          console.table(rows);
          return null;
        },
      });

      on('after:run', async (results) => {
        await afterRunHandler(config, results);
        writeRunSummary(device, config, results);
      });

      return config;
    },
  },
});
