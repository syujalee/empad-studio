// Behavioural checks for the React build (PRD §6 interactions and §7 bug fixes) in real Chrome.
// Optionally compares every WhatsApp URL with the legacy build.
//
// Usage: node scripts/verify/interactions.mjs <siteUrl> [legacyUrl]
import { chromium } from 'playwright';

const [siteUrl, legacyUrl] = process.argv.slice(2);
if (!siteUrl) {
  console.error('Usage: node scripts/verify/interactions.mjs <siteUrl> [legacyUrl]');
  process.exit(1);
}

const results = [];
const consoleProblems = [];
const browser = await chromium.launch({ channel: 'chrome' });

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, status: 'passed', detail: detail ?? '' });
  } catch (error) {
    results.push({ name, status: 'failed', detail: error.message.split('\n')[0] });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleProblems.push(`[${options.viewport?.width ?? 1440}] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => consoleProblems.push(`pageerror: ${error.message}`));
  await page.goto(siteUrl, { waitUntil: 'load' });
  return { context, page };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 250) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.waitForTimeout(1500);
}

const scrollTo = (page, y) => page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);

// --- Prerender / hydration -------------------------------------------------------------
await check('prerendered HTML contains page content', async () => {
  const html = await (await fetch(siteUrl)).text();
  for (const text of ['Timeless Moments', 'Kebijakan Keterlambatan', 'Rp 335.000', 'Pilih Outdoor', 'application/ld+json']) {
    assert(html.includes(text), `missing "${text}" in served HTML`);
  }
  return `${(html.length / 1024).toFixed(1)} kB HTML`;
});

// --- Desktop checks -------------------------------------------------------------------
{
  const { context, page } = await openPage();

  await check('navbar turns glass after 60px scroll', async () => {
    const blurAt = async (y) => {
      await scrollTo(page, y);
      await page.waitForTimeout(450);
      return page.evaluate(() => getComputedStyle(document.getElementById('navbar')).backdropFilter);
    };
    const top = await blurAt(0);
    const scrolled = await blurAt(200);
    const back = await blurAt(0);
    assert(top === 'none' && scrolled.includes('blur(8px)') && back === 'none', `top=${top} scrolled=${scrolled} back=${back}`);
    return `0px: ${top}, 200px: ${scrolled}`;
  });

  await check('parallax uses legacy formula (scrollY × 0.12)', async () => {
    await scrollTo(page, 400);
    await page.waitForTimeout(300);
    const transform = await page.evaluate(() => document.querySelector('#hero .parallax-bg').style.transform);
    assert(transform === 'translate3d(0px, 48px, 0px)', transform);
    return transform;
  });

  await check('anchor links smooth-scroll without changing the URL hash', async () => {
    await scrollTo(page, 0);
    await page.waitForTimeout(400);
    await page.getByRole('link', { name: 'Pricelist', exact: true }).first().click();
    await page.waitForTimeout(1800);
    const { top, hash } = await page.evaluate(() => ({ top: Math.round(document.getElementById('pricelist').getBoundingClientRect().top), hash: location.hash }));
    assert(Math.abs(top) <= 2 && hash === '', `section top=${top}, hash="${hash}"`);
    return `#pricelist top=${top}px`;
  });

  await scrollThrough(page);

  await check('scroll reveal completes and clears its state', async () => {
    await page.waitForTimeout(1000);
    const pending = await page.evaluate(() => document.querySelectorAll('[data-reveal]').length);
    assert(pending === 0, `${pending} elements still carry data-reveal`);
    return 'all revealed elements settled';
  });

  await check('B-01: featured card scale(1.04) at 1440px, hover scale(1.06)', async () => {
    const card = page.locator('.price-card.featured');
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(500);
    const rest = await card.evaluate((el) => getComputedStyle(el).transform);
    await card.hover();
    await page.waitForTimeout(500);
    const hover = await card.evaluate((el) => getComputedStyle(el).transform);
    assert(rest.startsWith('matrix(1.04') && hover.startsWith('matrix(1.06'), `rest=${rest} hover=${hover}`);
    return `rest ${rest} / hover ${hover}`;
  });

  await check('B-02: price card keeps its own 0.3s transition after reveal', async () => {
    const plain = page.locator('.price-card:not(.featured)').first();
    const transition = await plain.evaluate((el) => getComputedStyle(el).transition);
    await page.mouse.move(2, 2);
    await plain.hover();
    await page.waitForTimeout(500);
    const hover = await plain.evaluate((el) => getComputedStyle(el).transform);
    assert(transition.includes('0.3s') && hover === 'matrix(1, 0, 0, 1, 0, -4)', `transition=${transition} hover=${hover}`);
    return `transition "${transition}", hover lift ${hover}`;
  });

  await check('portfolio filter shows the right items and sets aria-pressed', async () => {
    const counts = {};
    for (const name of ['Engagement', 'Studio', 'All']) {
      await page.getByRole('button', { name, exact: true }).click();
      await page.waitForTimeout(150);
      counts[name] = await page.evaluate(() => [...document.querySelectorAll('#portfolio .grid > *')].filter((el) => getComputedStyle(el).display !== 'none').length);
      const pressed = await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed');
      assert(pressed === 'true', `${name} aria-pressed=${pressed}`);
    }
    assert(counts.Engagement === 5 && counts.Studio === 1 && counts.All === 6, JSON.stringify(counts));
    return JSON.stringify(counts);
  });

  await check('video preview plays on hover and resets on leave', async () => {
    const item = page.locator('#portfolio video').locator('xpath=..');
    await item.scrollIntoViewIfNeeded();
    await item.hover();
    await page.waitForTimeout(800);
    const playing = await page.evaluate(() => !document.querySelector('#portfolio video').paused);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => { const v = document.querySelector('#portfolio video'); return { paused: v.paused, time: v.currentTime }; });
    assert(playing && after.paused && after.time === 0, `playing=${playing} after=${JSON.stringify(after)}`);
    return 'hover → playing, leave → paused at 0s';
  });

  await check('lightbox: open, arrows, buttons, focus trap, Esc, focus return, scroll lock', async () => {
    const firstItem = page.getByRole('button', { name: /^Lihat foto:/ }).first();
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    const state = () => page.evaluate(() => ({
      src: document.querySelector('[role=dialog] img')?.getAttribute('src'),
      focused: document.activeElement.getAttribute('aria-label'),
      overflow: document.body.style.overflow,
      modal: document.querySelector('[role=dialog]')?.getAttribute('aria-modal'),
    }));
    const opened = await state();
    assert(opened.focused === 'Close' && opened.overflow === 'hidden' && opened.modal === 'true', `open state ${JSON.stringify(opened)}`);
    await page.keyboard.press('ArrowRight');
    const next = await state();
    await page.keyboard.press('ArrowLeft');
    const back = await state();
    await page.getByRole('button', { name: 'Previous' }).click();
    const wrapped = await state();
    assert(next.src !== opened.src && back.src === opened.src && wrapped.src === '/assets/portfolio/portfolio-1.webp', `nav ${opened.src} → ${next.src} → ${back.src} → ${wrapped.src}`);
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    const trapped = await page.evaluate(() => !!document.activeElement.closest('[role=dialog]'));
    assert(trapped, 'focus escaped the dialog');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    const closed = await page.evaluate(() => ({ focused: document.activeElement.getAttribute('aria-label'), overflow: document.body.style.overflow }));
    assert(closed.focused?.startsWith('Lihat foto:') && closed.overflow === '', `after close ${JSON.stringify(closed)}`);
    await firstItem.click();
    await dialog.waitFor();
    await page.mouse.click(720, 30);
    await dialog.waitFor({ state: 'detached' });
    return 'arrows/prev wrap, focus trapped, Esc + backdrop close, focus returned';
  });

  await check('portfolio items open the lightbox from the keyboard', async () => {
    await page.getByRole('button', { name: /^Lihat foto:/ }).nth(1).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    return 'Enter opens, Esc closes';
  });

  await check('FAQ: one panel open at a time, aria-expanded in sync', async () => {
    const first = page.getByRole('button', { name: 'Kebijakan Keterlambatan' });
    const second = page.getByRole('button', { name: 'Kebijakan Reschedule' });
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await second.click();
    await page.waitForTimeout(600);
    const states = [await first.getAttribute('aria-expanded'), await second.getAttribute('aria-expanded')];
    await second.click();
    await page.waitForTimeout(600);
    const closed = await second.getAttribute('aria-expanded');
    assert(states[0] === 'false' && states[1] === 'true' && closed === 'false', `states=${states} closed=${closed}`);
    return 'opening one closes the other; second click closes';
  });

  await check('WhatsApp float links out in a new tab', async () => {
    const link = page.getByRole('link', { name: 'WhatsApp' });
    const attrs = await link.evaluate((a) => ({ href: a.href, target: a.target, rel: a.rel }));
    assert(attrs.target === '_blank' && attrs.rel === 'noopener noreferrer', JSON.stringify(attrs));
    await link.hover();
    await page.waitForTimeout(500);
    const tooltip = await link.locator('span').evaluate((el) => getComputedStyle(el).opacity);
    assert(tooltip === '1', `tooltip opacity ${tooltip}`);
    return 'target=_blank, tooltip visible on hover';
  });

  await check('B-11: every external link uses target=_blank rel="noopener noreferrer"', async () => {
    const bad = await page.evaluate(() => [...document.querySelectorAll('a[href^="http"]')]
      .filter((a) => a.target !== '_blank' || a.rel !== 'noopener noreferrer').map((a) => a.href));
    assert(bad.length === 0, bad.join(', '));
    return 'all external links consistent';
  });

  await check('B-10: heading outline has one h1 and no skipped levels', async () => {
    const levels = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])));
    const skipped = levels.some((level, i) => i > 0 && level > levels[i - 1] + 1);
    assert(levels.filter((l) => l === 1).length === 1 && !skipped && levels[0] === 1, levels.join(','));
    return levels.join(' ');
  });

  if (legacyUrl) {
    await check('WhatsApp URLs identical to the legacy site', async () => {
      const collect = (p) => p.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.getAttribute('href')));
      const legacyPage = await context.newPage();
      await legacyPage.goto(legacyUrl);
      const [current, legacy] = [await collect(page), await collect(legacyPage)];
      await legacyPage.close();
      assert(JSON.stringify(current) === JSON.stringify(legacy), `\nnew:    ${current.join('\n        ')}\nlegacy: ${legacy.join('\n        ')}`);
      return `${current.length} links match`;
    });
  }

  await check('keyboard Tab order reaches every interactive control', async () => {
    await page.goto(siteUrl, { waitUntil: 'load' });
    const seen = [];
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press('Tab');
      seen.push(await page.evaluate(() => {
        const el = document.activeElement;
        return (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 24);
      }));
    }
    const required = ['EMPAD', 'Experience', 'Book Now', 'Lihat Pricelist', 'All', 'Lihat foto: Elegant', 'Pilih Indoor', 'Layanan Tambahan (Add-on', 'Kebijakan Keterlambatan', 'Instagram', 'WhatsApp'];
    const missing = required.filter((label) => !seen.some((s) => s.startsWith(label)));
    assert(missing.length === 0, `not reached: ${missing.join(', ')}`);
    return `${new Set(seen).size} distinct stops`;
  });

  await context.close();
}

// --- Mobile / responsive checks ------------------------------------------------------
for (const width of [360, 768, 1024, 1440]) {
  await check(`no horizontal scroll at ${width}px`, async () => {
    const { context, page } = await openPage({ viewport: { width, height: 900 } });
    await scrollThrough(page);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    await context.close();
    assert(scrollWidth <= clientWidth, `scrollWidth ${scrollWidth} > ${clientWidth}`);
    return `${scrollWidth} = ${clientWidth}`;
  });
}

{
  const { context, page } = await openPage({ viewport: { width: 360, height: 780 } });
  const toggle = page.getByRole('button', { name: 'Menu' });

  await check('B-06: closed drawer links are not focusable', async () => {
    const stops = [];
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      stops.push(await page.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent).trim().slice(0, 20)));
    }
    assert(!stops.some((s) => ['Experience', 'Portfolio', 'Pricelist', 'Booking'].includes(s)), stops.join(' → '));
    return stops.join(' → ');
  });

  await check('B-06: drawer aria-expanded, Esc closes and refocuses toggle', async () => {
    await toggle.click();
    await page.waitForTimeout(500);
    const open = await page.evaluate(() => ({ expanded: document.querySelector('[aria-controls=primary-navigation]').getAttribute('aria-expanded'), right: getComputedStyle(document.getElementById('primary-navigation')).right, focused: document.activeElement.textContent }));
    assert(open.expanded === 'true' && open.right === '0px' && open.focused === 'Experience', JSON.stringify(open));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const closed = await page.evaluate(() => ({ expanded: document.querySelector('[aria-controls=primary-navigation]').getAttribute('aria-expanded'), focused: document.activeElement.getAttribute('aria-label') }));
    assert(closed.expanded === 'false' && closed.focused === 'Menu', JSON.stringify(closed));
    return 'opens with focus on first link; Esc closes';
  });

  await check('B-06: tap outside closes drawer; link click closes and scrolls', async () => {
    await toggle.click();
    await page.waitForTimeout(500);
    await page.mouse.click(30, 500);
    await page.waitForTimeout(500);
    const afterOutside = await toggle.getAttribute('aria-expanded');
    await toggle.click();
    await page.waitForTimeout(500);
    await page.locator('#primary-navigation').getByRole('link', { name: 'Booking' }).click();
    await page.waitForTimeout(1800);
    const afterLink = await toggle.getAttribute('aria-expanded');
    const top = await page.evaluate(() => Math.round(document.getElementById('booking').getBoundingClientRect().top));
    assert(afterOutside === 'false' && afterLink === 'false' && Math.abs(top) <= 2, `outside=${afterOutside} link=${afterLink} top=${top}`);
    return 'outside tap closes; link closes + scrolls to #booking';
  });

  await context.close();
}

for (const width of [320, 360]) {
  await check(`B-04: accordions never clip content at ${width}px`, async () => {
    const { context, page } = await openPage({ viewport: { width, height: 800 } });
    await scrollThrough(page);
    const clipped = [];
    const addonToggle = page.getByRole('button', { name: /Layanan Tambahan/ });
    await addonToggle.click();
    await page.waitForTimeout(700);
    const measure = (id) => page.evaluate((panelId) => {
      const inner = document.getElementById(panelId).firstElementChild;
      return { scroll: inner.scrollHeight, client: inner.clientHeight };
    }, id);
    const addon = await measure('addons-panel');
    if (addon.scroll > addon.client) clipped.push(`addons ${addon.scroll}>${addon.client}`);
    for (let i = 0; i < 5; i++) {
      await page.locator('[aria-controls^=faq-panel]').nth(i).click();
      await page.waitForTimeout(600);
      const faq = await measure(`faq-panel-${i}`);
      if (faq.scroll > faq.client) clipped.push(`faq ${i} ${faq.scroll}>${faq.client}`);
    }
    await context.close();
    assert(clipped.length === 0, clipped.join(', '));
    return `add-ons panel ${addon.client}px, no clipping`;
  });
}

{
  const { context, page } = await openPage({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await check('B-03: touch devices autoplay the preview while in view', async () => {
    await page.locator('#portfolio video').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const inView = await page.evaluate(() => !document.querySelector('#portfolio video').paused);
    await scrollTo(page, 0);
    await page.waitForTimeout(800);
    const outOfView = await page.evaluate(() => document.querySelector('#portfolio video').paused);
    assert(inView && outOfView, `inView playing=${inView}, out of view paused=${outOfView}`);
    return 'plays in view, pauses when scrolled away';
  });

  await check('B-08: lightbox swipe navigates on touch', async () => {
    const item = page.getByRole('button', { name: /^Lihat foto:/ }).first();
    await item.scrollIntoViewIfNeeded();
    await item.tap();
    await page.getByRole('dialog').waitFor();
    const before = await page.evaluate(() => document.querySelector('[role=dialog] img').getAttribute('src'));
    await page.evaluate(() => {
      const target = document.querySelector('[role=dialog] img');
      const touch = (x) => new Touch({ identifier: 1, target, clientX: x, clientY: 400 });
      target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touch(300)], changedTouches: [touch(300)] }));
      target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [touch(120)] }));
    });
    const after = await page.evaluate(() => document.querySelector('[role=dialog] img').getAttribute('src'));
    assert(before !== after, `src stayed ${before}`);
    return `${before} → ${after}`;
  });

  await context.close();
}

{
  const { context, page } = await openPage({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });

  await check('B-09: reduced motion disables parallax and smooth scrolling', async () => {
    await scrollTo(page, 400);
    await page.waitForTimeout(300);
    const transform = await page.evaluate(() => document.querySelector('#hero .parallax-bg').style.transform);
    await scrollTo(page, 0);
    await page.waitForTimeout(300);
    await page.getByRole('link', { name: 'Booking', exact: true }).first().click();
    await page.waitForTimeout(100);
    const top = await page.evaluate(() => Math.round(document.getElementById('booking').getBoundingClientRect().top));
    assert(transform === '' && Math.abs(top) <= 2, `transform="${transform}" top after 100ms=${top}`);
    return 'no parallax transform; anchor jump is instant';
  });

  await context.close();
}

await browser.close();

await check('console: no errors or warnings (load + all interactions above)', async () => {
  assert(consoleProblems.length === 0, consoleProblems.join(' | '));
  return 'clean';
});

const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) console.log(`${r.status.padEnd(7)} ${r.name.padEnd(width)}  ${r.detail}`);
const failed = results.filter((r) => r.status === 'failed').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
