// playwright.config.js
// Playwright Test configuration for API tests

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // Test environments configuration
  projects: [
    {
      name: 'Dev API Tests',
      use: { 
        baseURL: 'https://reqres.in',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': 'reqres-free-v1'
        },
      },
    },
    {
      name: 'Staging API Tests',
      use: { 
        baseURL: 'https://staging.reqres.in/api', // Example staging URL
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': 'reqres-staging-v1' // Example staging API key
        },
      },
    }
  ],

  // Browser configuration
  use: {
    // Browser options
    browserName: 'chromium', // or 'firefox' or 'webkit'
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  // Test execution options
  timeout: 30000,
  retries: 1,
  workers: 1,
  reporter: [['html'], ['list']],
};

// Load environment-specific settings
const environment = process.env.TEST_ENV || 'Dev';
console.log(`Running tests in ${environment} environment`);

module.exports = config;
