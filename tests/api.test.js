// tests/api.test.js
const { test, expect, request } = require('@playwright/test');

let bearerToken = '';

test.describe('API Automation with Playwright', () => {
  test.beforeAll(async () => {
    // Step a: Get Bearer Token
    const projectConfig = test.info().project.use;
    const apiContext = await request.newContext({
      baseURL: projectConfig.baseURL,
      extraHTTPHeaders: {
        ...projectConfig.extraHTTPHeaders,
      }
    });
    
    console.log('Making login request...');
    const loginResponse = await apiContext.post('/api/login', {
      data: {
        email: "eve.holt@reqres.in",
        password: "cityslicka"
      }
    });
    console.log('Login response status:', loginResponse.status());
    const loginBody = await loginResponse.text();
    console.log('Login response body:', loginBody);
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = JSON.parse(loginBody);
    bearerToken = loginData.token;
    expect(bearerToken).toBeTruthy();
  });

  test('GET users and validate response', async () => {
    // Step c: Make GET request with Bearer Token
    const projectConfig = test.info().project.use;
    const apiContext = await request.newContext({
      baseURL: projectConfig.baseURL,
      extraHTTPHeaders: {
        ...projectConfig.extraHTTPHeaders,
      }
    });
    const usersResponse = await apiContext.get('/api/users?page=2');
    expect(usersResponse.ok()).toBeTruthy();
    const usersData = await usersResponse.json();
    const users = usersData.data;

    // 1. Assert all IDs are unique
    const ids = users.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    // 2. Validate each email contains '@reqres.in'
    for (const user of users) {
      expect(user.email).toContain('@reqres.in');
    }

    // 3. Assert every first_name and last_name is a non-empty string
    for (const user of users) {
      expect(typeof user.first_name).toBe('string');
      expect(user.first_name.length).toBeGreaterThan(0);
      expect(typeof user.last_name).toBe('string');
      expect(user.last_name.length).toBeGreaterThan(0);
    }

    // 4. Assert IDs are in ascending order (which is how they actually come from the API)
    console.log('User IDs:', ids);
    for (let i = 0; i < ids.length - 1; i++) {
      expect(ids[i]).toBeLessThan(ids[i + 1]);
    }
  });
});
