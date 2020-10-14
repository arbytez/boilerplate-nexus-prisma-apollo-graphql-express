import signale from '../logger';

// catch all the unmanaged errors and stop script
process.on('uncaughtException', async (err) => {
  signale.fatal(err);
  process.exit(1);
});

process.on('unhandledRejection', async (err) => {
  signale.fatal(err);
  process.exit(1);
});
