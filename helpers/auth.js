'use strict';

const { goto, write, click, waitFor, text, $, into, textBox, button } = require('taiko');
const config = require('./env');
const selectors = require('./selectors');

/**
 * Perform full Okta SSO login flow.
 *
 * 1. Navigate to BLU app (triggers Okta redirect)
 * 2. Enter username and click Next
 * 3. Enter password and click Sign In
 * 4. Handle MFA push if configured
 * 5. Wait for redirect back to BLU app
 * 6. Verify landing page loaded
 */
async function login() {
  console.log('  Navigating to BLU app (will redirect to Okta)...');
  await goto(config.baseUrl);

  // Wait for Okta login form to appear
  console.log('  Waiting for Okta login form...');
  await waitFor($(selectors.okta.usernameField), 15000);

  // Enter username
  console.log('  Entering username...');
  await write(config.username, into($(selectors.okta.usernameField)));
  await click($(selectors.okta.nextButton));

  // Wait for password field (Okta may show username and password on separate screens)
  console.log('  Waiting for password field...');
  await waitFor($(selectors.okta.passwordField), 10000);

  // Enter password
  console.log('  Entering password...');
  await write(config.password, into($(selectors.okta.passwordField)));
  await click($(selectors.okta.signInButton));

  // Handle MFA if configured
  if (config.mfaType === 'push') {
    console.log(`  Waiting for MFA push approval (timeout: ${config.mfaTimeoutMs}ms)...`);
    try {
      await waitFor(text(selectors.okta.mfaPushSent), 5000);
      // Wait for redirect after push approval
      await waitFor(text(selectors.app.landingIndicator), config.mfaTimeoutMs);
    } catch (mfaError) {
      // MFA screen may not have appeared — check if we're already redirected
      const alreadyRedirected = await text(selectors.app.landingIndicator).exists();
      if (!alreadyRedirected) {
        throw new Error(`MFA push timed out or failed: ${mfaError.message}`);
      }
    }
  } else {
    // No MFA — wait for redirect back to BLU app
    console.log('  Waiting for redirect to BLU app...');
    await waitFor(text(selectors.app.landingIndicator), 30000);
  }

  console.log('  Login successful — BLU app loaded.');
}

/**
 * Check if the user is already logged in by looking for a known authenticated-state element.
 * @returns {Promise<boolean>} true if already logged in
 */
async function isLoggedIn() {
  try {
    return await text(selectors.app.landingIndicator).exists();
  } catch {
    return false;
  }
}

module.exports = { login, isLoggedIn };
