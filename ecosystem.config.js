module.exports = {
  apps: [
    {
      name: 'ie3-crm',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 9449,
      },
    },
  ],
};

