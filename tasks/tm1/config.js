'use strict';

const path = require('path');

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const REQUIRED_VARS = ['OKTA_USER_EMAIL', 'OKTA_USERNAME', 'OKTA_PASSWORD', 'TM1_BASE_URL'];

const missingVars = REQUIRED_VARS.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    'Copy .env.example to .env and fill in your values.'
  );
}

/** @type {{ userEmail: string, username: string, password: string, baseUrl: string, headless: boolean, mfaType: string, mfaTimeoutMs: number }} */
const config = {
  userEmail: process.env.OKTA_USER_EMAIL,
  username: process.env.OKTA_USERNAME,
  password: process.env.OKTA_PASSWORD,
  baseUrl: process.env.TM1_BASE_URL,
  headless: process.env.HEADLESS === 'true',
  // Default to 'push' since that is the observed MFA method for TM1
  mfaType: process.env.OKTA_MFA_TYPE || 'push',
  mfaTimeoutMs: parseInt(process.env.MFA_TIMEOUT_MS, 10) || 60000,
};

module.exports = config;
