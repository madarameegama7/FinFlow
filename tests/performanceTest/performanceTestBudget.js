module.exports = {
    config: {
      target: 'http://localhost:5000', // Your API's base URL
      phases: [
        {
          duration: 60, // Duration of the test in seconds
          arrivalRate: 5, // Number of requests per second
        },
      ],
    },
    scenarios: [
      {
        flow: [
          {
            // Test for GET /api/budget (Retrieve budget data)
            get: {
              url: '/api/budget',
            },
          },
          {
            // Test for POST /api/budget (Create new budget)
            post: {
              url: '/api/budget',
              json: {
                name: 'Annual Budget', // Example budget data
                amount: 50000,
                description: 'Budget for the fiscal year',
              },
            },
          },
          {
            // Test for PATCH /api/budget/{id} (Update budget)
            patch: {
              url: '/api/budget/1', // Replace with an actual budget ID
              json: {
                amount: 60000, // Updating the budget amount
                description: 'Updated budget for the fiscal year',
              },
            },
          },
          {
            delete:{
                url:'/api/budget/2'
            }
          }
        ],
      },
    ],
  };
  