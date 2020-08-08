// pm2 ecosystem file for caprover docker CMD
// set the environment variables from the caprover web dashboard
module.exports = {
  apps: [
    {
      name: 'NexusPrismaGraphqlApi',
      script: './dist/index.js',
      exec_mode: 'cluster',
      instances: 2,
    },
  ],
};
