/** Perfil da execução atual (--expose device=web|mobile). */
export type Device = 'web' | 'mobile';

export const device = (): Device => (Cypress.expose('device') === 'mobile' ? 'mobile' : 'web');
export const isMobile = (): boolean => device() === 'mobile';

/** Registra o teste só no perfil indicado (assim ele não aparece como "pulado" no outro). */
export function itOn(target: Device, title: string, fn: Mocha.Func): void {
  if (device() === target) it(title, fn);
}
