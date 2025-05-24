module.exports = {
  config: {
    target: 'http://localhost:5000',
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
          get: {
            url: '/api/transactions',
          },
        },
        {
          post: {
            url: '/api/transactions',
            json: {
              amount: 1000, 
              type: 'credit', 
              description: 'Payment for invoice #1234',
              date: '2025-01-01',
            },
          },
        },
        {
          
          patch: {
            url: '/api/transactions/1', 
            json: {
              description: 'Updated description for the transaction.',
            },
          },
        },
        {
          delete: {
            url: '/api/transactions/1', 
          },
        },
      ],
    },
  ],
};
