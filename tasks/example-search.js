'use strict';

/**
 * Direct Taiko script — no DSL runner needed.
 *
 * Demonstrates the Taiko API directly for complex tasks
 * where you want full JavaScript control (loops, conditionals, etc.).
 *
 * Run: node tasks/example-search.js
 */

process.env.TAIKO_SKIP_HEADING_UPDATE = 'true';

const {
  openBrowser,
  closeBrowser,
  goto,
  write,
  into,
  textBox,
  press,
  screenshot,
  waitFor,
  text,
} = require('taiko');

(async () => {
  await openBrowser({ headless: false });

  // Navigate to Google
  await goto('https://google.com');

  // Type into the search box — found by its placeholder/label "Search"
  await write('taiko browser automation', into(textBox('Search')));

  // Submit the search
  await press('Enter');

  // Wait for results to appear
  await waitFor(text('taiko'));

  // Save a screenshot
  await screenshot({ path: '/tmp/search-results.png' });
  console.log('Screenshot saved to /tmp/search-results.png');

  await closeBrowser();
})().catch(async (err) => {
  console.error('Error:', err.message);
  try {
    await screenshot({ path: `/tmp/taiko_error_${Date.now()}.png` });
  } catch { /* ignore */ }
  process.exit(1);
});
