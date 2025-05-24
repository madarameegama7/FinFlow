# FinFlow - Multi Currency Finance Management

FinFlow is a financial management system that supports multiple currencies, allowing users to manage their finances in real-time with exchange rate updates. The application provides a secure way to manage goals and transactions while supporting a variety of currencies.

## Features
- User authentication using JWT tokens.
- Multi-currency support for managing finances in various currencies.
- Real-time exchange rate updates for accurate financial reporting.
- Secure password management using bcrypt and bcryptjs.
- Flexible goal management with features like auto-saving and deadlines.

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/SE1020-IT2070-OOP-DSA-25/project-IT22097224.git
   ```

2. Navigate to the project folder:

   ```bash
   cd finflow
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:

   ```
   PORT=port-number
   DB_URI=your_mongodb_connection_string
   JWT_SECRET=jwt-secret-key
   JWT_EXPIRES_IN=1h
   API_KEY=your-key-from-currencylayerwebiste
   BASE_URL=https://api.currencylayer.com/convert
   ```

5. To run the application locally, start the server:

   ```bash
   npm start
   ```

   The server will be running on `http://localhost:5000`.

6. For running tests:

   ```bash
   npm test
   ```

## Dependencies

This project has the following dependencies:

- `bcrypt` - For password hashing.
- `bcryptjs` - A compatibility package for bcrypt.
- `cors` - For enabling Cross-Origin Resource Sharing.
- `dotenv` - To manage environment variables.
- `express` - Web framework for building the server.
- `jsonwebtoken` - For JSON Web Token authentication.
- `moment` - For handling date and time.
- `mongoose` - MongoDB object modeling tool.
- `supertest` - For testing HTTP requests.
- `validator` - String validation library.

### Dev Dependencies

- `jest` - JavaScript testing framework.
- `jest-mock` - Jest mocking utilities.

## API Endpoints

### POST /api/auth/login
- **Description**: Log in with email and password to receive a JWT token.
- **Request body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### POST /api/goals
- **Description**: Create a financial goal with multi-currency support.
- **Request body**:
  ```json
  {
    "title": "Save for vacation",
    "targetAmount": 2000,
    "currency": "USD",
    "deadline": "2025-12-31",
    "autoSavePercentage": 10
  }
  ```

### GET /api/goals
- **Description**: Get a list of goals.
- **Response**:
  ```json
  [
    {
      "title": "Save for vacation",
      "targetAmount": 2000,
      "currency": "USD",
      "savedAmount": 500,
      "deadline": "2025-12-31",
      "autoSavePercentage": 10
    }
  ]
  ```

## Testing

This project uses Jest for unit testing. To run the tests, move to test folder and execute the following command 

for performance test
```bash
cd tests/performanceTest
artillery run performanceTestBudget.js
```

## License  
This software is **not open-source**. All rights reserved

## Contributing

1. Fork this repository.
2. Create your branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## Contact

For any questions or suggestions, please feel free to contact(madarameegama7@gmail.com).
