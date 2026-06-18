'use strict';

const { goto, write, click, waitFor, text, $, into, clear, evaluate } = require('taiko');
const config = require('./config');
const selectors = require('../../helpers/selectors');

/**
 * Perform TM1 SSO login flow via Okta.
 *
 * Flow (based on observed screens):
 * 1. Navigate to TM1 app — "Select Market" page loads (United States pre-selected)
 * 2. Click Next on market selection
 * 3. TM1 "Sign in to your account" — enter username, click Next
 * 4. Redirected to Okta — enter username again, click Next
 * 5. Okta password screen — enter password, click Verify
 * 6. Okta MFA selection — click Select next to "Get a push notification"
 * 7. Approve push on mobile device — wait for redirect back to TM1
 */
async function login() {
  console.log('  Navigating to TM1 app...');
  await goto(config.baseUrl);

  // Step 1: Select Market — "United States" is pre-selected, just click Next
  console.log('  Waiting for market selection screen...');
  await waitFor(text(selectors.tm1.selectMarketHeading), 15000);
  console.log('  Clicking Next on market selection...');
  await click(text(selectors.tm1.nextButton));

  // Step 2: TM1 username screen — enter username and click Next
  console.log('  Waiting for TM1 username screen...');
  await waitFor($(selectors.tm1.tm1UsernameField), 10000);
  console.log('  Clearing and entering user email on TM1 screen...');
  await clear($(selectors.tm1.tm1UsernameField));
  await write(config.userEmail, into($(selectors.tm1.tm1UsernameField)));
  await click(text(selectors.tm1.nextButton));

  // Step 3: Okta username screen — enter username and click Next
  // TM1 redirects to a separate Okta login page where the username must be re-entered
  console.log('  Waiting for Okta sign-in screen...');
  await waitFor($(selectors.tm1.oktaUsernameField), 15000);
  console.log('  Clearing and entering username on Okta screen...');
  await clear($(selectors.tm1.oktaUsernameField));
  await write(config.username, into($(selectors.tm1.oktaUsernameField)));
  await click($(selectors.tm1.oktaNextButton));

  // Step 4: Okta password screen — enter password and click Verify
  console.log('  Waiting for Okta password screen...');
  await waitFor($(selectors.tm1.oktaPasswordField), 10000);
  console.log('  Entering password...');
  await write(config.password, into($(selectors.tm1.oktaPasswordField)));
  await click($(selectors.tm1.oktaVerifyButton));

  // Step 5 & 6: MFA — select push notification and wait for approval
  if (config.mfaType === 'push') {
    console.log('  Waiting for MFA method selection screen...');
    try {
      await waitFor(text(selectors.tm1.mfaSelectionHeading), 1000);
      console.log('  Selecting "Get a push notification" MFA method...');
      // Use browser-native JS to click — Taiko selectors struggle with Okta's MFA buttons
      await evaluate(() => {
        const pushButton = document.querySelector('[data-se="okta_verify-push"] a[data-se="button"]');
        if (pushButton) {
          pushButton.click();
        } else {
          throw new Error('Push notification Select button not found in DOM');
        }
      });

      // Wait for push-sent confirmation before polling for redirect
      await waitFor(text(selectors.tm1.mfaPushSent), 100000);
      console.log(`  Push notification sent — waiting for approval (timeout: ${config.mfaTimeoutMs}ms)...`);

      // Wait for redirect back to TM1 app after the user approves on their device
      await waitFor(text(selectors.tm1.landingIndicator), config.mfaTimeoutMs);
    } catch (mfaError) {
      // Push may have been auto-approved before we checked — verify redirect happened
      const alreadyRedirected = await text(selectors.tm1.landingIndicator).exists();
      if (!alreadyRedirected) {
        throw new Error(`MFA push timed out or failed: ${mfaError.message}`);
      }
    }
  } else {
    // No MFA configured — wait for redirect back to TM1 app directly
    console.log('  Waiting for redirect to TM1 app...');
    await waitFor(text(selectors.tm1.landingIndicator), 30000);
  }

  console.log('Login successful — TM1 app loaded.');
}

/**
 * Check if already logged in to TM1 by looking for the known post-login indicator.
 * @returns {Promise<boolean>} true if the TM1 landing page is already visible
 */
async function isLoggedIn() {
  try {
    return await text(selectors.tm1.landingIndicator).exists();
  } catch {
    return false;
  }
}

module.exports = { login, isLoggedIn };
