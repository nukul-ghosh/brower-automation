'use strict';

const path = require('path');

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const REQUIRED_VARS = ['OKTA_USERNAME', 'OKTA_PASSWORD', 'BLU_BASE_URL'];

const missingVars = REQUIRED_VARS.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    'Copy .env.example to .env and fill in your values.'
  );
}

/** @type {{ username: string, password: string, baseUrl: string, headless: boolean, mfaType: string, mfaTimeoutMs: number, searchTerm: string }} */
const config = {
  username: process.env.OKTA_USERNAME,
  password: process.env.OKTA_PASSWORD,
  baseUrl: process.env.BLU_BASE_URL,
  headless: process.env.HEADLESS === 'true',
  mfaType: process.env.OKTA_MFA_TYPE || '',
  mfaTimeoutMs: parseInt(process.env.MFA_TIMEOUT_MS, 10) || 60000,
  searchTerm: process.env.SEARCH_TERM || 'Test',
};

module.exports = config;
