# API_Playwright

## How to Run

1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the tests:
   ```sh
   npx playwright test
   ```

## Features
- Gets a Bearer token from the login endpoint
- Stores the token globally for subsequent requests
- Makes authenticated GET requests
- Validates:
  - All IDs are unique
  - Emails contain '@reqres.in'
  - First and last names are non-empty strings
  - IDs are in descending order