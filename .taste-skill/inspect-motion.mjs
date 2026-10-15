// Run the unmodified taste inspector with normal motion emulated in its isolated test browser.
// Windows currently reports prefers-reduced-motion: reduce; the actual app respects that setting.
import { Browser } from 'file:///C:/Users/Usu%C3%A1rio/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const newPage = Browser.prototype.newPage;
Browser.prototype.newPage = async function (options) {
  const page = await newPage.call(this, options);
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  return page;
};
process.argv = [process.argv[0], process.argv[1], 'http://127.0.0.1:4321'];
await import('file:///C:/Users/Usu%C3%A1rio/.agents/skills/design-taste-frontend/scripts/inspect.mjs');
