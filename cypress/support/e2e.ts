import '@testing-library/cypress/add-commands';
import './a11y';
import './commands';
import { isMobile } from './device';

beforeEach(() => {
  // A emulação via DevTools Protocol persiste entre testes: cada teste começa do zero.
  cy.setReducedMotion(false);
  if (isMobile()) cy.enableTouch();
});
