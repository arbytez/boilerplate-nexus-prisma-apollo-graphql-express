import signale from '../logger';

import prismaClient from '../server/prismaClient';

// catch all the unmanaged errors and stop script
process.on('uncaughtException', async (err) => {
  signale.fatal(err);
  try {
    await prismaClient.disconnect();
  } catch (error) {
    signale.error(error);
  }
  process.exit(1);
});

process.on('unhandledRejection', async (err) => {
  signale.fatal(err);
  try {
    await prismaClient.disconnect();
  } catch (error) {
    signale.error(error);
  }
  process.exit(1);
});
