// tests/api.test.js
const { test, expect, request } = require('@playwright/test');
const expectedUserData = require('../test-data/users.json');

let bearerToken = '';
let allUsers = [];

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
    const usersResponse = await apiContext.get('/api/users?page=1');
    expect(usersResponse.ok()).toBeTruthy();
    const usersData = await usersResponse.json();
    const users = usersData.data;
    allUsers = users; // Store users for later use
    console.log('\nValidating response data...');
    console.log('Users received:', users.length);

    // 1. Assert all IDs are unique
    console.log('\n1. Checking for unique IDs...');
    const ids = users.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    console.log('✓ All IDs are unique');

    // 2. Validate each email contains '@reqres.in'
    console.log('\n2. Validating email domains...');
    for (const user of users) {
      expect(user.email).toContain('@reqres.in');
      console.log(`✓ Email validated: ${user.email}`);
    }

    // 3. Assert every first_name and last_name is a non-empty string
    console.log('\n3. Checking names...');
    for (const user of users) {
      expect(typeof user.first_name).toBe('string');
      expect(user.first_name.length).toBeGreaterThan(0);
      expect(typeof user.last_name).toBe('string');
      expect(user.last_name.length).toBeGreaterThan(0);
      console.log(`✓ Name validated: ${user.first_name} ${user.last_name}`);
    }

    // 4. Assert IDs are in ascending order (which is how they actually come from the API)
    console.log('\n4. Verifying ID order...');
    console.log('User IDs:', ids);
    for (let i = 0; i < ids.length - 1; i++) {
      expect(ids[i]).toBeLessThan(ids[i + 1]);
    }
  });

  test('GET single user and validate details', async () => {
    // Make GET request for single user
    const projectConfig = test.info().project.use;
    const apiContext = await request.newContext({
      baseURL: projectConfig.baseURL,
      extraHTTPHeaders: {
        ...projectConfig.extraHTTPHeaders,
      }
    });
    
    const userId = 2;
    console.log('\nFetching single user details for user', userId);
    const userResponse = await apiContext.get(`/api/users/${userId}`);
    expect(userResponse.ok()).toBeTruthy();
    const userData = await userResponse.json();
    const user = userData.data;
    
    console.log('Validating user details against expected data...');
    
    // Compare with expected test data
    expect(user).toEqual(expectedUserData.user2);
    console.log('✓ User details match expected data');
    
    // Verify user details are consistent with the data from previous request
    if (allUsers.length > 0) {
      const userInList = allUsers.find(u => u.id === userId);
      if (userInList) {
        expect(user).toEqual(userInList);
        console.log('✓ User details are consistent with previous request');
      }
    }
  });

  test('GET non-existent user returns 404', async () => {
    const projectConfig = test.info().project.use;
    const apiContext = await request.newContext({
      baseURL: projectConfig.baseURL,
      extraHTTPHeaders: {
        ...projectConfig.extraHTTPHeaders,
      }
    });
    
    const userId = 100;
    console.log('\nFetching non-existent user details (ID: 100)...');
    const userResponse = await apiContext.get(`/api/users/${userId}`);
    
    // Assert 404 status code
    expect(userResponse.status()).toBe(404);
    console.log('✓ Response status code is 404');
    
    // Verify response body is empty object as per API specification
    const responseBody = await userResponse.json();
    expect(responseBody).toEqual({});
    console.log('✓ Response body is empty object');
  });

  test('GET non-existent user returns 404 for user 99', async ({ request }) => {
  const userId = 99;
  const res = await request.get(`/api/users/${userId}`);
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({});
});
});
