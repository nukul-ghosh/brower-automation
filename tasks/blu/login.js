'use strict';

const { launchBrowser, quitBrowser, captureScreenshot, captureErrorScreenshot } = require('../../helpers/browser');
const { login } = require('../../helpers/auth');

(async () => {
  await launchBrowser();
  try {
    await login();
    await captureScreenshot('login-success');
    console.log('Login automation completed successfully.');
  } catch (err) {
    await captureErrorScreenshot('login');
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await quitBrowser();
  }
})();
