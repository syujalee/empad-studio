// Visual parity check: screenshots every section and key UI states of two builds at the
// PRD test widths, then diffs them pixel by pixel inside the browser (no extra deps).
//
// Usage: node scripts/verify/visual-compare.mjs <referenceUrl> <candidateUrl> [outDir]
// Output (git-ignored): <outDir>/<width>/<name>-{reference,candidate,diff}.png + summary.json
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [referenceUrl, candidateUrl, outDir = '.verify-output/visual'] = process.argv.slice(2);
if (!referenceUrl || !candidateUrl) {
  console.error('Usage: node scripts/verify/visual-compare.mjs <referenceUrl> <candidateUrl> [outDir]');
  process.exit(1);
}

const WIDTHS = [360, 768, 1024, 1440];
const VIEWPORT_HEIGHT = 900;
const SECTIONS = ['#hero', '#experience', '#portfolio', '#pricelist', '#booking', '#faq', 'footer'];
// A pixel counts as different when the summed RGB delta exceeds this value (0–765). Kept low because
// the dark glass UI turns real regressions (e.g. a missing blur) into small colour deltas.
const PIXEL_TOLERANCE = 24;

// Interactive states captured as viewport screenshots. Selectors rely on accessible names
// shared by both builds, so the same script works for the legacy and the React site.
const STATES = [
  { name: 'drawer-open', maxWidth: 768, run: async (page) => {
    await page.getByRole('button', { name: 'Menu' }).click();
  } },
  { name: 'lightbox', run: async (page) => {
    await scrollToSection(page, '#portfolio');
    // The overlay sits on top of the image, so click the item that wraps it.
    await page.locator('#portfolio img').first().locator('xpath=..').click();
  } },
  { name: 'faq-open', run: async (page) => {
    await scrollToSection(page, '#faq');
    await page.getByRole('button', { name: 'Kebijakan Keterlambatan' }).click();
  } },
  { name: 'addons-open', run: async (page) => {
    await scrollToSection(page, '#pricelist');
    const toggle = page.getByRole('button', { name: /Layanan Tambahan/ });
    await toggle.click();
    await page.waitForTimeout(600);
    await toggle.evaluate((el) => window.scrollTo(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 120)));
  } },
];

async function scrollToSection(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  }, selector);
  await page.waitForTimeout(800);
}

async function preparePage(browser, url, width) {
  const context = await browser.newContext({ viewport: { width, height: VIEWPORT_HEIGHT }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  // Both builds use smooth scrolling; screenshots need scroll positions that settle instantly.
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(() => document.fonts.ready);
  // Scroll through once so every lazy image loads and every reveal animation fires.
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 250) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    await Promise.all([...document.querySelectorAll('video')].map((video) => new Promise((resolve) => {
      video.pause();
      if (video.readyState >= 2) { video.currentTime = 0; resolve(); return; }
      video.preload = 'auto';
      video.addEventListener('loadeddata', () => { video.currentTime = 0; resolve(); }, { once: true });
      video.load();
      setTimeout(resolve, 5000);
    })));
  });
  // Freeze infinite/entry animations identically in both builds so frames are comparable.
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;caret-color:transparent!important}' });
  return { context, page };
}

async function captureAll(browser, url, width) {
  const shots = {};
  let { context, page } = await preparePage(browser, url, width);
  const mask = [page.locator('iframe')];
  // Plain viewport screenshots while stepping through each section, i.e. exactly what a visitor
  // sees at that scroll position. (fullPage capture resizes the viewport and fires scroll events,
  // which skews scroll-driven parallax differently per implementation.)
  for (const selector of SECTIONS) {
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return { y: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight };
    }, selector);
    const slices = Math.max(1, Math.ceil(box.height / VIEWPORT_HEIGHT));
    for (let slice = 0; slice < slices; slice++) {
      await page.evaluate((y) => window.scrollTo(0, y), box.y + slice * VIEWPORT_HEIGHT);
      await page.waitForTimeout(700);
      const name = `${selector.replace('#', '')}${slices > 1 ? `-${slice + 1}` : ''}`;
      shots[name] = await page.screenshot({ mask, animations: 'disabled' });
    }
  }
  await context.close();

  for (const state of STATES) {
    if (state.maxWidth && width > state.maxWidth) continue;
    ({ context, page } = await preparePage(browser, url, width));
    await state.run(page);
    // Long enough for reveal transitions triggered by the state's scroll to finish.
    await page.waitForTimeout(1600);
    shots[state.name] = await page.screenshot({ mask: [page.locator('iframe')], animations: 'disabled' });
    await context.close();
  }
  return shots;
}

async function diffImages(page, a, b) {
  return page.evaluate(async ({ a, b, tolerance }) => {
    const load = (b64) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `data:image/png;base64,${b64}`;
    });
    const [imgA, imgB] = await Promise.all([load(a), load(b)]);
    const width = Math.max(imgA.width, imgB.width);
    const height = Math.max(imgA.height, imgB.height);
    const read = (img) => {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, width, height).data;
    };
    const pa = read(imgA);
    const pb = read(imgB);
    const out = new ImageData(width, height);
    let diff = 0;
    let deltaSum = 0;
    for (let i = 0; i < pa.length; i += 4) {
      const delta = Math.abs(pa[i] - pb[i]) + Math.abs(pa[i + 1] - pb[i + 1]) + Math.abs(pa[i + 2] - pb[i + 2]);
      deltaSum += delta;
      if (delta > tolerance) {
        diff++;
        out.data.set([255, 0, 64, 255], i);
      } else {
        const gray = (pa[i] + pa[i + 1] + pa[i + 2]) / 3 * 0.35;
        out.data.set([gray, gray, gray, 255], i);
      }
    }
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d').putImageData(out, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return {
      sizeA: `${imgA.width}x${imgA.height}`,
      sizeB: `${imgB.width}x${imgB.height}`,
      diffPixels: diff,
      diffRatio: diff / (width * height),
      // Mean absolute difference per colour channel (0–255) over the whole image.
      meanDelta: +(deltaSum / (width * height * 3)).toFixed(3),
      diffPng: btoa(binary),
    };
  }, { a: a.toString('base64'), b: b.toString('base64'), tolerance: PIXEL_TOLERANCE });
}

const browser = await chromium.launch({ channel: 'chrome' });
const diffPage = await (await browser.newContext()).newPage();
const summary = [];
for (const width of WIDTHS) {
  const dir = path.join(outDir, String(width));
  mkdirSync(dir, { recursive: true });
  const reference = await captureAll(browser, referenceUrl, width);
  const candidate = await captureAll(browser, candidateUrl, width);
  for (const name of Object.keys(reference)) {
    writeFileSync(path.join(dir, `${name}-reference.png`), reference[name]);
    writeFileSync(path.join(dir, `${name}-candidate.png`), candidate[name]);
    const result = await diffImages(diffPage, reference[name], candidate[name]);
    writeFileSync(path.join(dir, `${name}-diff.png`), Buffer.from(result.diffPng, 'base64'));
    delete result.diffPng;
    summary.push({ width, name, ...result, diffPercent: +(result.diffRatio * 100).toFixed(3) });
    console.log(`${String(width).padStart(4)}  ${name.padEnd(13)} ${result.sizeA} vs ${result.sizeB}  diff ${(result.diffRatio * 100).toFixed(3)}%  meanΔ ${result.meanDelta}`);
  }
}
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
await browser.close();
