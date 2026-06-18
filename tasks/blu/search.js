'use strict';

const { goto, click, write, into, waitFor, text, $, evaluate } = require('taiko');
const { launchBrowser, quitBrowser, captureScreenshot, captureErrorScreenshot } = require('../../helpers/browser');
const { login } = require('../../helpers/auth');
const config = require('../../helpers/env');
const sel = require('../../helpers/selectors');

(async () => {
  await launchBrowser();
  try {
    await login();

    console.log('\n--- SEARCH ---');
    await captureScreenshot('before-search');

    // Type search term into global search input — PLACEHOLDER selector
    const searchTerm = config.searchTerm;
    console.log(`  Searching for: "${searchTerm}"`);
    await write(searchTerm, into($(sel.app.searchInput)));

    // Wait for results to appear — PLACEHOLDER: adjust wait condition based on actual UI
    // The app may show results inline, in a dropdown, or navigate to a results page
    await waitFor(2000); // brief pause for results to load
    await captureScreenshot('search-results');

    // Verify at least one result is visible
    const hasResults = await text(searchTerm).exists();
    if (!hasResults) {
      throw new Error(`No search results found for "${searchTerm}"`);
    }
    console.log('  Search results found.');

    // Click first result to verify detail page loads
    await click(text(searchTerm));
    await captureScreenshot('search-result-detail');

    console.log('\nSearch automation completed successfully.');
  } catch (err) {
    await captureErrorScreenshot('search');
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await quitBrowser();
  }
})();
