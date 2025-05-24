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
            url: '/api/goals',
          },
        },
        {
          post: {
            url: '/api/goals',
            json: {
              name: 'New Goal',
              description: 'This is a new goal created via POST request.',
              targetDate: '2025-12-31',
            },
          },
        },
        {
          patch: {
            url: '/api/goals/1',
            json: {
              description: 'Updated description for the goal.',
            },
          },
        },
        {
          delete: {
            url: '/api/goals/1', 
          },
        },
      ],
    },
  ],
};
