'use strict';

const { launchBrowser, quitBrowser, captureScreenshot, captureErrorScreenshot } = require('../../helpers/browser');
const { login } = require('./auth');

(async () => {
  await launchBrowser();
  try {
    await login();
    await captureScreenshot('tm1_login-success');
    console.log('TM1 login automation completed successfully.');
  } catch (err) {
    await captureErrorScreenshot('tm1_login');
    console.error('Error:', err.message);
    process.exitCode = 1;
  } finally {
    await quitBrowser();
  }
})();
