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
            url: '/api/users',
          },
        },
        {
          post: {
            url: '/api/users',
            json: {
              name: 'John Doe',
              email: 'johndoe@example.com',
              password: 'securepassword123',
              role: 'user',
            },
          },
        },
        {
          patch: {
            url: '/api/users/1',
            json: {
              name: 'John Updated',
            },
          },
        },
        {
          delete: {
            url: '/api/users/1',
          },
        },
      ],
    },
  ],
};
