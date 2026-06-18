'use strict';

process.env.TAIKO_SKIP_HEADING_UPDATE = 'true';

const { openBrowser, closeBrowser, screenshot } = require('taiko');
const fs = require('fs');
const path = require('path');
const config = require('./env');

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots');
const SCREENSHOT_QUALITY = 70;

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Launch browser with consistent configuration.
 * @param {object} [options] - Additional Taiko openBrowser options
 */
async function launchBrowser(options = {}) {
  await openBrowser({
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
    ],
    ...options,
  });
  console.log(`Browser launched (headless: ${config.headless})`);
}

/**
 * Close browser safely — swallows errors so finally blocks never throw.
 */
async function quitBrowser() {
  try {
    await closeBrowser();
    console.log('Browser closed.');
  } catch (err) {
    console.warn('Warning: could not close browser:', err.message);
  }
}

/**
 * Capture a screenshot with a descriptive label.
 * @param {string} label - Descriptive label for the screenshot filename
 * @returns {Promise<string>} Path to saved screenshot
 */
async function captureScreenshot(label) {
  const filename = `blu_${label}_${Date.now()}.jpeg`;
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await screenshot({ path: filePath, quality: SCREENSHOT_QUALITY });
  console.log(`  Screenshot saved: ${filePath}`);
  return filePath;
}

/**
 * Capture an error screenshot with a descriptive label.
 * @param {string} label - Descriptive label for the error screenshot filename
 * @returns {Promise<string|null>} Path to saved screenshot, or null if capture failed
 */
async function captureErrorScreenshot(label) {
  try {
    const filename = `blu_error_${label}_${Date.now()}.jpeg`;
    const filePath = path.join(SCREENSHOT_DIR, filename);
    await screenshot({ path: filePath, quality: SCREENSHOT_QUALITY });
    console.log(`  Error screenshot saved: ${filePath}`);
    return filePath;
  } catch (err) {
    console.warn('Warning: could not capture error screenshot:', err.message);
    return null;
  }
}

module.exports = {
  launchBrowser,
  quitBrowser,
  captureScreenshot,
  captureErrorScreenshot,
};
