import { test, expect } from '@playwright/test';

const PAGES = ['/', '/features', '/how-it-works', '/faq', '/join', '/contact'];

async function smoothScroll(page: any) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const step = () => {
        y += 100;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight - window.innerHeight) {
          setTimeout(step, 80);
        } else {
          resolve();
        }
      };
      step();
    });
  });
}

test('project walkthrough video', async ({ page, baseURL }) => {
  const site = process.env.SITE_URL || baseURL!;

  // Home
  await page.goto(site, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await smoothScroll(page);
  await page.waitForTimeout(600);

  // Navigate through key pages
  for (const path of PAGES.slice(1)) {
    await page.goto(site.replace(/\/$/, '') + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await smoothScroll(page);
    await page.waitForTimeout(500);
  }

  // Return Home
  await page.goto(site, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
});
