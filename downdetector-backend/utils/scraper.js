// utils/scraper.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const ISP_URLS = {
  ziply: 'https://downdetector.com/status/ziply_fiber/',
  xfinity: 'https://downdetector.com/status/xfinity/',
  spectrum: 'https://downdetector.com/status/spectrum/',
  verizon: 'https://downdetector.com/status/verizon/',
  centurylink: 'https://downdetector.com/status/centurylink/',
};

async function scrapeOutageStatus(zipCode, isp = 'ziply') {
  const ispKey = isp.toLowerCase();
  const url = ISP_URLS[ispKey];

  if (!url) {
    return {
      zipCode,
      status: 'error',
      summary: `Unsupported ISP: ${isp}`,
      timestamp: new Date(),
    };
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('body', { timeout: 15000 });

    const visibleText = await page.evaluate(() => {
      return document.body.innerText;
    });

    const lowered = visibleText.toLowerCase();
    const status = lowered.includes('user reports indicate') || lowered.includes('possible problems')
      ? 'suspected'
      : 'normal';

    await browser.close();

    return {
      zipCode,
      status,
      summary: visibleText.slice(0, 500),
      timestamp: new Date(),
    };
  } catch (err) {
    await browser.close();
    console.error('❌ Scraping error:', err.message);
    return {
      zipCode,
      status: 'error',
      summary: err.message,
      timestamp: new Date(),
    };
  }
}

module.exports = scrapeOutageStatus;
