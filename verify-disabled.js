const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000/login');
  await page.locator('label:has-text("Email")').locator('xpath=following-sibling::input').fill(process.argv[2] || 'admin@posto.com');
  await page.locator('label:has-text("Senha")').locator('xpath=following-sibling::input').fill(process.argv[3] || 'admin123');
  await page.locator('button[type="submit"]:has-text("Entrar")').click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.goto('http://localhost:3000/agendamentos');
  await page.waitForTimeout(1000);
  const btn = page.locator('button:has-text("Registrar consulta")').first();
  const visible = await btn.isVisible().catch(() => false);
  const enabled = await btn.isEnabled().catch(() => false);
  console.log('visible:', visible, 'enabled:', enabled);
  await browser.close();
})();
